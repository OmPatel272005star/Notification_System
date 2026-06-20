import dotenv from 'dotenv';
dotenv.config();

import connectDB               from './shared/config/db.js';
import { connectProducer, producer } from './shared/config/kafka.js';
import Campaign from './shared/models/Campaign.js';
import { createLogger } from './shared/utils/logger.js';

const logger = createLogger('scheduler-service');

// ── Boot ──────────────────────────────────────────────────────────────────────
await connectDB();
await connectProducer();

// ── Interval helper ───────────────────────────────────────────────────────────
function getIntervalMs(interval, frequency = 1) {
  const f = Math.max(1, Number(frequency) || 1);
  switch (interval) {
    case 'hourly': return f *     60 * 60 * 1000;
    case 'weekly': return f * 7 * 24 * 60 * 60 * 1000;
    case 'daily':
    default:       return f *     24 * 60 * 60 * 1000;
  }
}

// ── Kafka emit ────────────────────────────────────────────────────────────────
async function kafkaEmitTrigger(campaign, triggerType) {
  await producer.send({
    topic: 'campaign.trigger',
    messages: [{ key: campaign._id.toString(), value: JSON.stringify({ campaignId: campaign._id, triggerType }) }],
  });
  logger.info('campaign.trigger emitted', { campaignId: campaign._id, campaignName: campaign.name, triggerType });
}

// ── One-time campaigns ────────────────────────────────────────────────────────
async function runScheduledCampaigns() {
  const now = new Date();
  const due = await Campaign.find({
    status: 'published', schedule_type: 'one_time', schedule_status: 'scheduled',
    'publish_details.scheduled_at': { $lte: now },
  });
  if (!due.length) return;
  logger.info('one-time campaigns due', { count: due.length, timestamp: now.toISOString() });
  for (const campaign of due) {
    try {
      campaign.schedule_status = 'live';
      await campaign.save();
      await kafkaEmitTrigger(campaign, 'scheduled');
      campaign.schedule_status = 'completed';
      campaign.publish_details.published_at = new Date();
      await campaign.save();
      logger.info('one-time campaign completed', { campaignId: campaign._id, campaignName: campaign.name });
    } catch (err) {
      logger.error('one-time campaign error', { campaignId: campaign._id, error: err.message });
      try { await Campaign.findByIdAndUpdate(campaign._id, { schedule_status: 'scheduled' }); } catch {}
    }
  }
}

// ── Periodic campaigns ────────────────────────────────────────────────────────
async function runPeriodicCampaigns() {
  const now = new Date();
  const due = await Campaign.find({
    status: 'published', schedule_type: 'periodic', schedule_status: 'scheduled',
    'periodic_settings.next_run_at': { $lte: now },
  });
  if (!due.length) return;
  logger.info('periodic campaigns due', { count: due.length, timestamp: now.toISOString() });
  for (const campaign of due) {
    try {
      campaign.schedule_status = 'live';
      await campaign.save();
      await kafkaEmitTrigger(campaign, 'periodic');
      const ps = campaign.periodic_settings;
      ps.occurrences_run = (ps.occurrences_run || 0) + 1;
      const intervalMs = getIntervalMs(ps.interval, ps.frequency);
      const nextRunAt  = new Date(new Date(ps.next_run_at).getTime() + intervalMs);
      let isDone = false;
      if (ps.ends_type === 'after' && ps.occurrences_run >= (ps.occurrences || 1)) isDone = true;
      if (ps.ends_type === 'on'    && nextRunAt >= new Date(ps.end_date))           isDone = true;
      if (isDone) {
        campaign.schedule_status = 'completed';
        campaign.publish_details.published_at = now;
        logger.info('periodic campaign completed', { campaignId: campaign._id, runs: ps.occurrences_run });
      } else {
        ps.next_run_at           = nextRunAt;
        campaign.schedule_status = 'scheduled';
        logger.info('periodic campaign queued', { campaignId: campaign._id, run: ps.occurrences_run, nextRunAt: nextRunAt.toISOString() });
      }
      campaign.markModified('periodic_settings');
      await campaign.save();
    } catch (err) {
      logger.error('periodic campaign error', { campaignId: campaign._id, error: err.message });
      try { await Campaign.findByIdAndUpdate(campaign._id, { schedule_status: 'scheduled' }); } catch {}
    }
  }
}

// ── Cron tick ─────────────────────────────────────────────────────────────────
const tick = async () => {
  try {
    await runScheduledCampaigns();
    await runPeriodicCampaigns();
  } catch (err) {
    logger.error('unhandled tick error', { error: err.message });
  }
};

setInterval(tick, 60 * 1000);
logger.info('scheduler-service started — checking every 60s');

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (sig) => {
  logger.info(`${sig} received — shutting down`);
  await producer.disconnect();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
