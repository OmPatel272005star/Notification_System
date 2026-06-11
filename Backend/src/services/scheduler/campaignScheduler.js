import Campaign      from '../campaign/Campaign.js';
import { producer }  from '../../shared/config/kafka.js';

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4 — Scheduler emits campaign.trigger Kafka events instead of sending
// emails directly. The Notification Dispatcher consumer handles delivery.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert interval + frequency to milliseconds.
 * Supported intervals: 'hourly', 'daily', 'weekly'
 */
function getIntervalMs(interval, frequency = 1) {
  const f = Math.max(1, Number(frequency) || 1);
  switch (interval) {
    case 'hourly':  return f *      60 * 60 * 1000;
    case 'weekly':  return f *  7 * 24 * 60 * 60 * 1000;
    case 'daily':
    default:        return f *      24 * 60 * 60 * 1000;
  }
}

/**
 * Emit a campaign.trigger event to Kafka.
 * The Notification Dispatcher consumer will pick this up and send the emails.
 */
async function kafkaEmitTrigger(campaign, triggerType) {
  await producer.send({
    topic: 'campaign.trigger',
    messages: [{
      key:   campaign._id.toString(),
      value: JSON.stringify({
        campaignId:  campaign._id,
        triggerType, // 'scheduled' | 'periodic'
      }),
    }],
  });
  console.log(`[scheduler] 📤 campaign.trigger emitted — campaign="${campaign.name}" (${campaign._id}) type=${triggerType}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// One-Time Campaign Runner
// Finds published one-time campaigns whose scheduled_at <= now,
// marks them live, then emits campaign.trigger to Kafka.
// ─────────────────────────────────────────────────────────────────────────────
async function runScheduledCampaigns() {
  const now = new Date();

  const due = await Campaign.find({
    status:          'published',
    schedule_type:   'one_time',
    schedule_status: 'scheduled',
    'publish_details.scheduled_at': { $lte: now },
  });

  if (due.length === 0) return;
  console.log(`[scheduler] one-time: ${now.toISOString()} — ${due.length} campaign(s) due`);

  for (const campaign of due) {
    console.log(`[scheduler] Processing one-time "${campaign.name}" (${campaign._id})`);
    try {
      // Mark live immediately to prevent double-fire on next tick
      campaign.schedule_status = 'live';
      await campaign.save();

      // Emit Kafka event — delivery is handled async by Notification Dispatcher
      await kafkaEmitTrigger(campaign, 'scheduled');

      // Mark completed — delivery_stats will be incremented via delivery.report consumer
      campaign.schedule_status = 'completed';
      campaign.publish_details.published_at = new Date();
      await campaign.save();

      console.log(`[scheduler] One-time "${campaign.name}" — trigger emitted, marked completed.`);
    } catch (err) {
      console.error(`[scheduler] Error processing one-time campaign ${campaign._id}:`, err.message);
      // Reset so it can retry next tick
      try {
        await Campaign.findByIdAndUpdate(campaign._id, { schedule_status: 'scheduled' });
      } catch { /* ignore */ }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Periodic Campaign Runner
// Finds published periodic campaigns whose next_run_at <= now, marks live,
// emits campaign.trigger to Kafka, then advances next_run_at or marks completed.
//
// Status lifecycle:
//   Before next_run_at  → 'scheduled'
//   During Kafka emit   → 'live'
//   After emit, more runs remain → 'scheduled' (reset with new next_run_at)
//   End condition met   → 'completed'
// ─────────────────────────────────────────────────────────────────────────────
async function runPeriodicCampaigns() {
  const now = new Date();

  const due = await Campaign.find({
    status:           'published',
    schedule_type:    'periodic',
    schedule_status:  'scheduled',
    'periodic_settings.next_run_at': { $lte: now },
  });

  if (due.length === 0) return;
  console.log(`[scheduler] periodic: ${now.toISOString()} — ${due.length} campaign(s) due`);

  for (const campaign of due) {
    console.log(`[scheduler] Processing periodic "${campaign.name}" (${campaign._id})`);
    try {
      // Mark live immediately to prevent double-fire
      campaign.schedule_status = 'live';
      await campaign.save();

      // Emit Kafka event — actual email sending by Notification Dispatcher
      await kafkaEmitTrigger(campaign, 'periodic');

      // Advance periodic settings (delivery_stats incremented via delivery.report consumer)
      const ps = campaign.periodic_settings;
      ps.occurrences_run = (ps.occurrences_run || 0) + 1;

      // Compute next_run_at (anchored to stored next_run_at to avoid drift)
      const intervalMs   = getIntervalMs(ps.interval, ps.frequency);
      const currentRunAt = new Date(ps.next_run_at);
      const nextRunAt    = new Date(currentRunAt.getTime() + intervalMs);

      // Check end condition
      let isDone = false;
      if (ps.ends_type === 'after') {
        if (ps.occurrences_run >= (ps.occurrences || 1)) isDone = true;
      } else if (ps.ends_type === 'on') {
        // If next scheduled run would be at or after end_date, we're done
        if (nextRunAt >= new Date(ps.end_date)) isDone = true;
      }

      if (isDone) {
        campaign.schedule_status = 'completed';
        campaign.publish_details.published_at = now;
        console.log(
          `[scheduler] Periodic "${campaign.name}" completed after ${ps.occurrences_run} run(s).`
        );
      } else {
        ps.next_run_at           = nextRunAt;
        campaign.schedule_status = 'scheduled';
        console.log(
          `[scheduler] Periodic "${campaign.name}" run #${ps.occurrences_run} queued. Next: ${nextRunAt.toISOString()}`
        );
      }

      // Mark subdocument modified so Mongoose persists it
      campaign.markModified('periodic_settings');
      await campaign.save();
    } catch (err) {
      console.error(`[scheduler] Error processing periodic campaign ${campaign._id}:`, err.message);
      try {
        await Campaign.findByIdAndUpdate(campaign._id, { schedule_status: 'scheduled' });
      } catch { /* ignore */ }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Start the cron — fires every minute at :00 seconds
// Runs both one-time and periodic campaign checks on each tick.
// ─────────────────────────────────────────────────────────────────────────────
export function startCampaignScheduler() {
  const tick = async () => {
    try {
      await runScheduledCampaigns();
      await runPeriodicCampaigns();
    } catch (err) {
      console.error('[scheduler] Unhandled error:', err.message);
    }
  };

  // Fire every 60 seconds — simple, reliable, no timezone overhead
  setInterval(tick, 60 * 1000);

  console.log('🕐 Campaign scheduler started — checking every minute (Kafka-backed since Phase 4).');
}
