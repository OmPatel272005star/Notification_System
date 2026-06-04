import cron          from 'node-cron';
import Campaign       from '../models/Campaign.js';
import Connection     from '../models/Connection.js';
import Template       from '../models/Template.js';
import Audience       from '../models/Audience.js';
import { sendEmailViaConnection } from '../controller/ConnectionController.js';

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Scheduler
// Runs every minute. Finds any published campaign whose scheduled_at <= now()
// and whose schedule_status is still 'scheduled', then fires emails and marks
// it 'completed'.
// ─────────────────────────────────────────────────────────────────────────────

async function runScheduledCampaigns() {
  const now = new Date();

  // Find all campaigns ready to fire
  const due = await Campaign.find({
    status:          'published',
    schedule_status: 'scheduled',
    'publish_details.scheduled_at': { $lte: now },
  });

  if (due.length === 0) return;

  console.log(`[scheduler] ${now.toISOString()} — ${due.length} campaign(s) due`);

  for (const campaign of due) {
    console.log(`[scheduler] Processing campaign "${campaign.name}" (${campaign._id})`);

    try {
      // Mark as 'live' immediately so parallel runs don't double-fire
      campaign.schedule_status = 'live';
      await campaign.save();

      // Load dependencies
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

      // Guard — if no connection or template, mark completed with 0 sent
      if (!conn || !template || contacts.length === 0) {
        console.warn(`[scheduler] Campaign "${campaign.name}" — missing conn/template/audience. Skipping send.`);
        campaign.schedule_status = 'completed';
        await campaign.save();
        continue;
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

        const fullName = `${contact.first_name} ${contact.last_name}`.trim();

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

      // Update stats + mark completed
      campaign.delivery_stats.sent   = (campaign.delivery_stats.sent   || 0) + sent;
      campaign.delivery_stats.failed = (campaign.delivery_stats.failed || 0) + failed;
      campaign.schedule_status = 'completed';
      campaign.publish_details.published_at = new Date();
      await campaign.save();

      console.log(`[scheduler] Campaign "${campaign.name}" done — sent: ${sent}, failed: ${failed}`);
    } catch (err) {
      console.error(`[scheduler] Error processing campaign ${campaign._id}:`, err.message);
      // Reset to 'scheduled' so it can retry on next tick
      try {
        await Campaign.findByIdAndUpdate(campaign._id, { schedule_status: 'scheduled' });
      } catch { /* ignore */ }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Start the cron — fires every minute at :00 seconds
// ─────────────────────────────────────────────────────────────────────────────
export function startCampaignScheduler() {
  cron.schedule('* * * * *', async () => {
    try {
      await runScheduledCampaigns();
    } catch (err) {
      console.error('[scheduler] Unhandled error:', err.message);
    }
  });

  console.log('🕐 Campaign scheduler started — checking every minute for due campaigns.');
}
