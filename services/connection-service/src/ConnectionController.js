import nodemailer from 'nodemailer';
import Connection, { encryptSecret, decryptSecret, maskSecret } from '../shared/models/Connection.js';

function toPublic(conn) {
  const obj = conn.toObject ? conn.toObject() : { ...conn };
  if (obj.brevo_api_key) obj.brevo_api_key = maskSecret(obj.brevo_api_key);
  if (obj.smtp_pass)     obj.smtp_pass     = maskSecret(obj.smtp_pass);
  return obj;
}

async function sendViaBrevoApi({ apiKey, fromEmail, fromName, toEmail, toName, subject, html, text }) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ sender: { email: fromEmail, name: fromName || fromEmail }, to: [{ email: toEmail, name: toName || toEmail }], subject, ...(html ? { htmlContent: html } : {}), ...(text ? { textContent: text } : {}) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `Brevo API error ${response.status}`);
  return data;
}

async function sendViaSMTP({ host, port, user, pass, secure, fromEmail, fromName, toEmail, toName, subject, html, text }) {
  const transport = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return transport.sendMail({ from: `"${fromName || fromEmail}" <${fromEmail}>`, to: `"${toName || toEmail}" <${toEmail}>`, subject, html: html || undefined, text: text || undefined });
}

export async function sendEmailViaConnection(conn, { toEmail, toName, subject, html, text }) {
  if (conn.provider === 'brevo_api')
    return sendViaBrevoApi({ apiKey: decryptSecret(conn.brevo_api_key), fromEmail: conn.email, fromName: conn.name, toEmail, toName, subject, html, text });
  if (conn.provider === 'smtp')
    return sendViaSMTP({ host: conn.smtp_host, port: conn.smtp_port, user: conn.smtp_user, pass: decryptSecret(conn.smtp_pass), secure: conn.smtp_secure, fromEmail: conn.email, fromName: conn.name, toEmail, toName, subject, html, text });
  throw new Error(`Unsupported provider: ${conn.provider}`);
}

export const createConnection = async (req, res) => {
  try {
    const { name, email, provider, brevo_api_key, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure } = req.body;
    if (!name?.trim())  return res.status(400).json({ success: false, message: 'name is required.' });
    if (!email?.trim()) return res.status(400).json({ success: false, message: 'email is required.' });
    if (!provider)      return res.status(400).json({ success: false, message: 'provider is required.' });
    if (provider === 'brevo_api' && !brevo_api_key?.trim()) return res.status(400).json({ success: false, message: 'brevo_api_key is required.' });
    if (provider === 'smtp' && (!smtp_host?.trim() || !smtp_user?.trim() || !smtp_pass?.trim())) return res.status(400).json({ success: false, message: 'smtp_host, smtp_user, smtp_pass are required.' });
    const conn = await Connection.create({
      name: name.trim(), email: email.trim().toLowerCase(), provider,
      brevo_api_key: provider === 'brevo_api' ? encryptSecret(brevo_api_key) : '',
      smtp_host: provider === 'smtp' ? smtp_host.trim() : '', smtp_port: provider === 'smtp' ? (smtp_port || 587) : 587,
      smtp_user: provider === 'smtp' ? smtp_user.trim() : '', smtp_pass: provider === 'smtp' ? encryptSecret(smtp_pass) : '',
      smtp_secure: provider === 'smtp' ? Boolean(smtp_secure) : false, created_by: req.user.id,
    });
    return res.status(201).json({ success: true, data: toPublic(conn) });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const getAllConnections = async (req, res) => {
  try {
    const connections = await Connection.find().sort({ createdAt: -1 }).populate('created_by','display_name email');
    return res.status(200).json({ success: true, data: connections.map(toPublic), total: connections.length });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const getConnectionById = async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id).populate('created_by','display_name email');
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' });
    return res.status(200).json({ success: true, data: toPublic(conn) });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const updateConnection = async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' });
    const { name, email, provider, brevo_api_key, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure } = req.body;
    if (name)     conn.name     = name.trim();
    if (email)    conn.email    = email.trim().toLowerCase();
    if (provider) conn.provider = provider;
    if (conn.provider === 'brevo_api' && brevo_api_key && !brevo_api_key.startsWith('•')) conn.brevo_api_key = encryptSecret(brevo_api_key);
    if (conn.provider === 'smtp') {
      if (smtp_host !== undefined) conn.smtp_host = smtp_host.trim();
      if (smtp_port !== undefined) conn.smtp_port = smtp_port;
      if (smtp_user !== undefined) conn.smtp_user = smtp_user.trim();
      if (smtp_pass && !smtp_pass.startsWith('•')) conn.smtp_pass = encryptSecret(smtp_pass);
      if (smtp_secure !== undefined) conn.smtp_secure = Boolean(smtp_secure);
    }
    conn.last_test_status = 'untested';
    await conn.save();
    return res.status(200).json({ success: true, data: toPublic(conn) });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const deleteConnection = async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' });
    await conn.deleteOne();
    return res.status(200).json({ success: true, message: 'Connection deleted.' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const testConnection = async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' });
    const toEmail = req.user.email;
    await sendEmailViaConnection(conn, {
      toEmail, subject: `✅ Test email from "${conn.name}"`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2 style="color:#6D5EF5">Connection Test Successful 🎉</h2><p>Test email from <strong>${conn.name}</strong> (${conn.provider}) via the Notification System.</p></div>`,
    });
    conn.last_tested_at = new Date(); conn.last_test_status = 'ok';
    await conn.save();
    return res.status(200).json({ success: true, message: `Test email sent to ${toEmail}.`, data: toPublic(conn) });
  } catch (err) {
    await Connection.findByIdAndUpdate(req.params.id, { last_tested_at: new Date(), last_test_status: 'failed' }).catch(() => {});
    return res.status(400).json({ success: false, message: `Connection test failed: ${err.message}` });
  }
};
