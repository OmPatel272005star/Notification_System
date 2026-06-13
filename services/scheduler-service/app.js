import dotenv from 'dotenv';
dotenv.config();

import connectDB               from './shared/config/db.js';
import { connectProducer, producer } from './shared/config/kafka.js';
import Campaign from './shared/models/Campaign.js';

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
  console.log(`[scheduler] 📤 campaign.trigger emitted — "${campaign.name}" (${campaign._id}) type=${triggerType}`);
}

// ── One-time campaigns ────────────────────────────────────────────────────────
async function runScheduledCampaigns() {
  const now = new Date();
  const due = await Campaign.find({
    status: 'published', schedule_type: 'one_time', schedule_status: 'scheduled',
    'publish_details.scheduled_at': { $lte: now },
  });
  if (!due.length) return;
  console.log(`[scheduler] one-time: ${now.toISOString()} — ${due.length} campaign(s) due`);
  for (const campaign of due) {
    try {
      campaign.schedule_status = 'live';
      await campaign.save();
      await kafkaEmitTrigger(campaign, 'scheduled');
      campaign.schedule_status = 'completed';
      campaign.publish_details.published_at = new Date();
      await campaign.save();
      console.log(`[scheduler] ✅ One-time "${campaign.name}" — trigger emitted, marked completed.`);
    } catch (err) {
      console.error(`[scheduler] Error: campaign ${campaign._id}:`, err.message);
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
  console.log(`[scheduler] periodic: ${now.toISOString()} — ${due.length} campaign(s) due`);
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
        console.log(`[scheduler] Periodic "${campaign.name}" completed after ${ps.occurrences_run} run(s).`);
      } else {
        ps.next_run_at           = nextRunAt;
        campaign.schedule_status = 'scheduled';
        console.log(`[scheduler] Periodic "${campaign.name}" run #${ps.occurrences_run} queued. Next: ${nextRunAt.toISOString()}`);
      }
      campaign.markModified('periodic_settings');
      await campaign.save();
    } catch (err) {
      console.error(`[scheduler] Error: periodic campaign ${campaign._id}:`, err.message);
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
    console.error('[scheduler] Unhandled tick error:', err.message);
  }
};

setInterval(tick, 60 * 1000);
console.log('🕐 [scheduler-service] Campaign scheduler started — checking every minute.');

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (sig) => {
  console.log(`[scheduler-service] ${sig} — shutting down`);
  await producer.disconnect();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
