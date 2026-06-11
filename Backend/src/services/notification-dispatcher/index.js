import Campaign    from '../campaign/Campaign.js';
import Connection  from '../connection/Connection.js';
import Template    from '../template/Template.js';
import Audience    from '../audience/Audience.js';
import { sendEmailViaConnection } from '../connection/ConnectionController.js';
import { producer, dispatchConsumer, deliveryConsumer } from '../../shared/config/kafka.js';

// ─────────────────────────────────────────────────────────────────────────────
// Notification Dispatcher — Phase 4
//
// Listens on two Kafka topics:
//   • campaign.trigger   → fetches campaign data, sends emails, emits delivery.report
//   • delivery.report    → updates Campaign delivery_stats in MongoDB
//
// Runs inside the same Node process as the monolith (Phase 4 pattern).
// In Phase 5 it becomes its own standalone service.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the personalised HTML for a single contact.
 */
function personalise(htmlBody, contact, email) {
  const fullName = `${contact.first_name} ${contact.last_name}`.trim();
  return htmlBody
    .replace(/\{\{first_name\}\}/gi, contact.first_name)
    .replace(/\{\{last_name\}\}/gi,  contact.last_name)
    .replace(/\{\{full_name\}\}/gi,   fullName)
    .replace(/\{\{email\}\}/gi,       email);
}

/**
 * Emit a delivery report event to Kafka.
 */
async function emitDeliveryReport(payload) {
  await producer.send({
    topic: 'delivery.report',
    messages: [{ value: JSON.stringify(payload) }],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// campaign.trigger handler
// ─────────────────────────────────────────────────────────────────────────────

async function handleCampaignTrigger(messageValue) {
  const { campaignId, triggeredBy, triggerType } = JSON.parse(messageValue);
  console.log(`[dispatcher] 📬 campaign.trigger received — campaignId=${campaignId} type=${triggerType} by=${triggeredBy || 'scheduler'}`);

  // Load all required documents
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    console.error(`[dispatcher] Campaign ${campaignId} not found — skipping.`);
    return;
  }

  const [conn, template] = await Promise.all([
    Connection.findById(campaign.connection_id),
    Template.findById(campaign.template_id),
  ]);

  const contacts = campaign.audience_ids?.length
    ? await Audience.find({
        _id:    { $in: campaign.audience_ids },
        status: 'active',
      }).select('first_name last_name emails')
    : [];

  if (!conn) {
    console.error(`[dispatcher] No connection for campaign ${campaignId} — aborting.`);
    return;
  }
  if (!template) {
    console.error(`[dispatcher] No template for campaign ${campaignId} — aborting.`);
    return;
  }
  if (contacts.length === 0) {
    console.warn(`[dispatcher] No active contacts for campaign ${campaignId} — nothing to send.`);
    return;
  }

  const htmlBody = template.content?.html_body || '';
  const subject  = campaign.email_settings?.subject ||
                   template.content?.subject        ||
                   campaign.name;

  console.log(`[dispatcher] Sending to ${contacts.length} contact(s) via connection "${conn.name}"`);

  // Send emails one-by-one and emit individual delivery reports
  for (const contact of contacts) {
    const primaryEmail = contact.emails?.find(e => e.is_primary)?.email
                      || contact.emails?.[0]?.email;

    if (!primaryEmail) {
      await emitDeliveryReport({
        campaignId,
        contactId: contact._id,
        status:    'failed',
        error:     'No email address on contact',
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    const fullName    = `${contact.first_name} ${contact.last_name}`.trim();
    const personalised = personalise(htmlBody, contact, primaryEmail);

    try {
      await sendEmailViaConnection(conn, {
        toEmail: primaryEmail,
        toName:  fullName,
        subject,
        html:    personalised || undefined,
        text:    template.content?.text_preview || undefined,
      });

      console.log(`[dispatcher] ✅ Sent → ${primaryEmail}`);
      await emitDeliveryReport({
        campaignId,
        contactId: contact._id,
        status:    'sent',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[dispatcher] ❌ Failed → ${primaryEmail}:`, err.message);
      await emitDeliveryReport({
        campaignId,
        contactId: contact._id,
        status:    'failed',
        error:     err.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  console.log(`[dispatcher] ✅ Done processing campaign ${campaignId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// delivery.report handler
// Aggregates sent/failed counts back into the Campaign document.
// ─────────────────────────────────────────────────────────────────────────────

async function handleDeliveryReport(messageValue) {
  const { campaignId, status } = JSON.parse(messageValue);

  if (!campaignId || !status) return;

  const inc = {};
  if (status === 'sent')   inc['delivery_stats.sent']   = 1;
  if (status === 'failed') inc['delivery_stats.failed'] = 1;

  if (Object.keys(inc).length > 0) {
    await Campaign.findByIdAndUpdate(campaignId, { $inc: inc });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// startNotificationDispatcher()
// Wire up both Kafka consumers and begin processing.
// ─────────────────────────────────────────────────────────────────────────────

export async function startNotificationDispatcher() {
  // ── campaign.trigger consumer ──────────────────────────────────────────────
  await dispatchConsumer.subscribe({
    topic:         'campaign.trigger',
    fromBeginning: false,   // only process new events from this point
  });

  dispatchConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        await handleCampaignTrigger(message.value.toString());
      } catch (err) {
        console.error(`[dispatcher] Unhandled error in campaign.trigger handler:`, err.message);
      }
    },
  });

  // ── delivery.report consumer ───────────────────────────────────────────────
  await deliveryConsumer.subscribe({
    topic:         'delivery.report',
    fromBeginning: false,
  });

  deliveryConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        await handleDeliveryReport(message.value.toString());
      } catch (err) {
        console.error(`[dispatcher] Unhandled error in delivery.report handler:`, err.message);
      }
    },
  });

  console.log('🚀 Notification Dispatcher started — listening on [campaign.trigger] and [delivery.report]');
}
