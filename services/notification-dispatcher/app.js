import dotenv from 'dotenv';
dotenv.config();

import connectDB                               from './shared/config/db.js';
import { connectProducer, connectConsumers,
         producer, dispatchConsumer,
         deliveryConsumer }                    from './shared/config/kafka.js';
import Campaign    from './shared/models/Campaign.js';
import Connection  from './shared/models/Connection.js';
import Template    from './shared/models/Template.js';
import Audience    from './shared/models/Audience.js';
import { decryptSecret } from './shared/utils/encryption.js';
import nodemailer  from 'nodemailer';

// ── Boot ──────────────────────────────────────────────────────────────────────
await connectDB();
await connectProducer();
await connectConsumers();

// ── Email helpers ─────────────────────────────────────────────────────────────
async function sendViaBrevoApi({ apiKey, fromEmail, fromName, toEmail, toName, subject, html, text }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ sender: { email: fromEmail, name: fromName || fromEmail }, to: [{ email: toEmail, name: toName || toEmail }], subject,
      ...(html ? { htmlContent: html } : {}), ...(text ? { textContent: text } : {}) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Brevo API error ${res.status}`);
  return data;
}

async function sendViaSMTP({ host, port, user, pass, secure, fromEmail, fromName, toEmail, toName, subject, html, text }) {
  const transport = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return transport.sendMail({ from: `"${fromName || fromEmail}" <${fromEmail}>`, to: `"${toName || toEmail}" <${toEmail}>`, subject, html: html || undefined, text: text || undefined });
}

async function sendEmailViaConnection(conn, opts) {
  if (conn.provider === 'brevo_api')
    return sendViaBrevoApi({ apiKey: decryptSecret(conn.brevo_api_key), fromEmail: conn.email, fromName: conn.name, ...opts });
  if (conn.provider === 'smtp')
    return sendViaSMTP({ host: conn.smtp_host, port: conn.smtp_port, user: conn.smtp_user, pass: decryptSecret(conn.smtp_pass), secure: conn.smtp_secure, fromEmail: conn.email, fromName: conn.name, ...opts });
  throw new Error(`Unsupported provider: ${conn.provider}`);
}

// ── Personalisation ───────────────────────────────────────────────────────────
function personalise(htmlBody, contact, email) {
  const fullName = `${contact.first_name} ${contact.last_name}`.trim();
  return htmlBody
    .replace(/\{\{first_name\}\}/gi, contact.first_name)
    .replace(/\{\{last_name\}\}/gi,  contact.last_name)
    .replace(/\{\{full_name\}\}/gi,  fullName)
    .replace(/\{\{email\}\}/gi,      email);
}

// ── Delivery report emitter ───────────────────────────────────────────────────
async function emitDeliveryReport(payload) {
  await producer.send({ topic: 'delivery.report', messages: [{ value: JSON.stringify(payload) }] });
  console.log(`[dispatcher] 📤 delivery.report — campaign=${payload.campaignId} status=${payload.status}`);
}

// ── campaign.trigger handler ──────────────────────────────────────────────────
async function handleCampaignTrigger(messageValue) {
  const { campaignId, triggeredBy, triggerType } = JSON.parse(messageValue);
  console.log(`[dispatcher] 📬 campaign.trigger received — campaignId=${campaignId} type=${triggerType} by=${triggeredBy || 'scheduler'}`);

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) { console.error(`[dispatcher] Campaign ${campaignId} not found — skipping.`); return; }

  const [conn, template] = await Promise.all([
    Connection.findById(campaign.connection_id),
    Template.findById(campaign.template_id),
  ]);
  const contacts = campaign.audience_ids?.length
    ? await Audience.find({ _id: { $in: campaign.audience_ids }, status: 'active' }).select('first_name last_name emails')
    : [];

  if (!conn)    { console.error(`[dispatcher] No connection for campaign ${campaignId} — aborting.`); return; }
  if (!template){ console.error(`[dispatcher] No template for campaign ${campaignId} — aborting.`); return; }
  if (!contacts.length) { console.warn(`[dispatcher] No active contacts for campaign ${campaignId} — nothing to send.`); return; }

  const htmlBody = template.content?.html_body || '';
  const subject  = campaign.email_settings?.subject || template.content?.subject || campaign.name;
  console.log(`[dispatcher] Sending to ${contacts.length} contact(s) via "${conn.name}"`);

  for (const contact of contacts) {
    const primaryEmail = contact.emails?.find(e => e.is_primary)?.email || contact.emails?.[0]?.email;
    if (!primaryEmail) {
      await emitDeliveryReport({ campaignId, contactId: contact._id, status: 'failed', error: 'No email address', timestamp: new Date().toISOString() });
      continue;
    }
    const personalised = personalise(htmlBody, contact, primaryEmail);
    try {
      await sendEmailViaConnection(conn, { toEmail: primaryEmail, toName: `${contact.first_name} ${contact.last_name}`.trim(), subject, html: personalised || undefined, text: template.content?.text_preview || undefined });
      console.log(`[dispatcher] ✅ Sent → ${primaryEmail}`);
      await emitDeliveryReport({ campaignId, contactId: contact._id, status: 'sent', timestamp: new Date().toISOString() });
    } catch (err) {
      console.error(`[dispatcher] ❌ Failed → ${primaryEmail}:`, err.message);
      await emitDeliveryReport({ campaignId, contactId: contact._id, status: 'failed', error: err.message, timestamp: new Date().toISOString() });
    }
  }
  console.log(`[dispatcher] ✅ Done processing campaign ${campaignId}`);
}

// ── delivery.report handler ───────────────────────────────────────────────────
async function handleDeliveryReport(messageValue) {
  const { campaignId, status } = JSON.parse(messageValue);
  if (!campaignId || !status) return;
  const inc = {};
  if (status === 'sent')   inc['delivery_stats.sent']   = 1;
  if (status === 'failed') inc['delivery_stats.failed'] = 1;
  if (Object.keys(inc).length) await Campaign.findByIdAndUpdate(campaignId, { $inc: inc });
}

// ── Retry subscribe helper ────────────────────────────────────────────────────
async function subscribeWithRetry(consumer, topic, maxRetries = 15, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await consumer.subscribe({ topic, fromBeginning: false });
      console.log(`[dispatcher] ✅ Subscribed to "${topic}" (attempt ${attempt})`);
      return;
    } catch (err) {
      const retriable = err.type === 'UNKNOWN_TOPIC_OR_PARTITION' || err.retriable;
      if (retriable && attempt < maxRetries) {
        console.warn(`[dispatcher] ⚠️  Subscribe to "${topic}" failed — retry ${attempt}/${maxRetries} in ${delayMs}ms`);
        await new Promise(r => setTimeout(r, delayMs));
      } else { throw err; }
    }
  }
}

// ── Wire consumers ────────────────────────────────────────────────────────────
await subscribeWithRetry(dispatchConsumer, 'campaign.trigger');
dispatchConsumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log(`[kafka] ⬇️  EVENT RECEIVED  topic=${topic}  partition=${partition}  offset=${message.offset}`);
    try { await handleCampaignTrigger(message.value.toString()); }
    catch (err) { console.error('[dispatcher] campaign.trigger handler error:', err.message); }
  },
});

await subscribeWithRetry(deliveryConsumer, 'delivery.report');
deliveryConsumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log(`[kafka] ⬇️  EVENT RECEIVED  topic=${topic}  partition=${partition}  offset=${message.offset}`);
    try { await handleDeliveryReport(message.value.toString()); }
    catch (err) { console.error('[dispatcher] delivery.report handler error:', err.message); }
  },
});

console.log('🚀 [notification-dispatcher] listening on [campaign.trigger] and [delivery.report]');

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (sig) => {
  console.log(`[notification-dispatcher] ${sig} received — shutting down`);
  await dispatchConsumer.disconnect();
  await deliveryConsumer.disconnect();
  await producer.disconnect();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
