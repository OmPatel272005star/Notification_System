import cron          from 'node-cron';
import Campaign       from '../models/Campaign.js';
import Connection     from '../models/Connection.js';
import Template       from '../models/Template.js';
import Audience       from '../models/Audience.js';
import { sendEmailViaConnection } from '../controller/ConnectionController.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
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
 * Core send helper — sends emails to all active contacts for a campaign.
 * Returns { sent, failed }.
 */
async function sendCampaignEmails(campaign) {
  const conn = campaign.connection_id
    ? await Connection.findById(campaign.connection_id)
    : null;

  const template = campaign.template_id
    ? await Template.findById(campaign.template_id)
    : null;

  const contacts = campaign.audience_ids?.length
    ? await Audience.find({
        _id:    { $in: campaign.audience_ids },
        status: 'active',
      }).select('first_name last_name emails')
    : [];

  if (!conn || !template || contacts.length === 0) {
    console.warn(`[scheduler] "${campaign.name}" — missing connection/template/audience. Skipping send.`);
    return { sent: 0, failed: 0 };
  }

  const htmlBody = template.content?.html_body || '';
  const subject  = campaign.email_settings?.subject ||
                   template.content?.subject        ||
                   campaign.name;

  let sent = 0, failed = 0;

  for (const contact of contacts) {
    const primaryEmail = contact.emails?.find(e => e.is_primary)?.email
                      || contact.emails?.[0]?.email;
    if (!primaryEmail) { failed++; continue; }

    const fullName    = `${contact.first_name} ${contact.last_name}`.trim();
    const personalised = htmlBody
      .replace(/\{\{first_name\}\}/gi, contact.first_name)
      .replace(/\{\{last_name\}\}/gi,  contact.last_name)
      .replace(/\{\{full_name\}\}/gi,   fullName)
      .replace(/\{\{email\}\}/gi,       primaryEmail);

    try {
      await sendEmailViaConnection(conn, {
        toEmail: primaryEmail,
        toName:  fullName,
        subject,
        html:    personalised || undefined,
        text:    template.content?.text_preview || undefined,
      });
      sent++;
      console.log(`[scheduler] ✅ Sent to ${primaryEmail}`);
    } catch (err) {
      failed++;
      console.error(`[scheduler] ❌ Failed to ${primaryEmail}:`, err.message);
    }
  }

  return { sent, failed };
}

// ─────────────────────────────────────────────────────────────────────────────
// One-Time Campaign Runner
// Finds published one-time campaigns whose scheduled_at <= now and fires them.
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
      // Mark live immediately to prevent double-fire
      campaign.schedule_status = 'live';
      await campaign.save();

      const { sent, failed } = await sendCampaignEmails(campaign);

      campaign.delivery_stats.sent   = (campaign.delivery_stats.sent   || 0) + sent;
      campaign.delivery_stats.failed = (campaign.delivery_stats.failed || 0) + failed;
      campaign.schedule_status       = 'completed';
      campaign.publish_details.published_at = new Date();
      await campaign.save();

      console.log(`[scheduler] One-time "${campaign.name}" done — sent: ${sent}, failed: ${failed}`);
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
// Finds published periodic campaigns whose next_run_at <= now and fires them,
// then advances next_run_at or marks completed based on end condition.
//
// Status lifecycle:
//   Before next_run_at → 'scheduled'
//   During send tick   → 'live'
//   After send, more runs remain → 'scheduled' (reset)
//   End condition met  → 'completed'
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

      // Send emails
      const { sent, failed } = await sendCampaignEmails(campaign);

      campaign.delivery_stats.sent   = (campaign.delivery_stats.sent   || 0) + sent;
      campaign.delivery_stats.failed = (campaign.delivery_stats.failed || 0) + failed;

      // Increment run counter
      const ps = campaign.periodic_settings;
      ps.occurrences_run = (ps.occurrences_run || 0) + 1;

      // Compute next_run_at (base off the stored next_run_at to avoid drift)
      const intervalMs  = getIntervalMs(ps.interval, ps.frequency);
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
        ps.next_run_at        = nextRunAt;
        campaign.schedule_status = 'scheduled';
        console.log(
          `[scheduler] Periodic "${campaign.name}" run #${ps.occurrences_run} done. Next: ${nextRunAt.toISOString()}`
        );
      }

      // Mark the subdocument as modified so Mongoose saves it
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
  cron.schedule('* * * * *', async () => {
    try {
      await runScheduledCampaigns();
      await runPeriodicCampaigns();
    } catch (err) {
      console.error('[scheduler] Unhandled error:', err.message);
    }
  });

  console.log('🕐 Campaign scheduler started — checking every minute for due campaigns.');
}
