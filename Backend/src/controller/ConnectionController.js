import nodemailer                     from 'nodemailer';
import Connection, {
  encryptSecret,
  decryptSecret,
  maskSecret,
}                                      from '../models/Connection.js';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper – build a safe (masked) connection object for API responses
// ─────────────────────────────────────────────────────────────────────────────
function toPublic(conn) {
  const obj = conn.toObject ? conn.toObject() : { ...conn };
  if (obj.brevo_api_key) obj.brevo_api_key = maskSecret(obj.brevo_api_key);
  if (obj.smtp_pass)     obj.smtp_pass     = maskSecret(obj.smtp_pass);
  return obj;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper – send one email via Brevo REST API v3 (no SDK needed)
// Docs: https://developers.brevo.com/reference/sendtransacemail
// ─────────────────────────────────────────────────────────────────────────────
async function sendViaBrevoApi({ apiKey, fromEmail, fromName, toEmail, toName, subject, html, text }) {
  const body = {
    sender:      { email: fromEmail, name: fromName || fromEmail },
    to:          [{ email: toEmail,  name: toName  || toEmail   }],
    subject,
    ...(html ? { htmlContent: html } : {}),
    ...(text ? { textContent: text } : {}),
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: {
      'accept':       'application/json',
      'content-type': 'application/json',
      'api-key':      apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.message || data?.error || `Brevo API error ${response.status}`;
    throw new Error(msg);
  }

  return data; // { messageId: '...' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper – send one email via Nodemailer SMTP
// ─────────────────────────────────────────────────────────────────────────────
async function sendViaSMTP({ host, port, user, pass, secure, fromEmail, fromName, toEmail, toName, subject, html, text }) {
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transport.sendMail({
    from:    `"${fromName || fromEmail}" <${fromEmail}>`,
    to:      `"${toName  || toEmail}"  <${toEmail}>`,
    subject,
    html:    html  || undefined,
    text:    text  || undefined,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported helper used by CampaignController to send a single message
// ─────────────────────────────────────────────────────────────────────────────
export async function sendEmailViaConnection(conn, { toEmail, toName, subject, html, text }) {
  const fromEmail = conn.email;
  const fromName  = conn.name;

  if (conn.provider === 'brevo_api') {
    const apiKey = decryptSecret(conn.brevo_api_key);
    return sendViaBrevoApi({ apiKey, fromEmail, fromName, toEmail, toName, subject, html, text });
  }

  if (conn.provider === 'smtp') {
    return sendViaSMTP({
      host:      conn.smtp_host,
      port:      conn.smtp_port,
      user:      conn.smtp_user,
      pass:      decryptSecret(conn.smtp_pass),
      secure:    conn.smtp_secure,
      fromEmail, fromName, toEmail, toName, subject, html, text,
    });
  }

  throw new Error(`Unsupported provider: ${conn.provider}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /connections
// ─────────────────────────────────────────────────────────────────────────────
export const createConnection = async (req, res) => {
  try {
    const { name, email, provider, brevo_api_key, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure } = req.body;

    if (!name?.trim())  return res.status(400).json({ success: false, message: 'name is required.' });
    if (!email?.trim()) return res.status(400).json({ success: false, message: 'email is required.' });
    if (!provider)      return res.status(400).json({ success: false, message: 'provider is required.' });

    if (provider === 'brevo_api' && !brevo_api_key?.trim()) {
      return res.status(400).json({ success: false, message: 'brevo_api_key is required for Brevo API provider.' });
    }
    if (provider === 'smtp' && (!smtp_host?.trim() || !smtp_user?.trim() || !smtp_pass?.trim())) {
      return res.status(400).json({ success: false, message: 'smtp_host, smtp_user, smtp_pass are required for SMTP provider.' });
    }

    const conn = await Connection.create({
      name:          name.trim(),
      email:         email.trim().toLowerCase(),
      provider,
      brevo_api_key: provider === 'brevo_api' ? encryptSecret(brevo_api_key) : '',
      smtp_host:     provider === 'smtp' ? smtp_host.trim()  : '',
      smtp_port:     provider === 'smtp' ? (smtp_port || 587) : 587,
      smtp_user:     provider === 'smtp' ? smtp_user.trim()  : '',
      smtp_pass:     provider === 'smtp' ? encryptSecret(smtp_pass) : '',
      smtp_secure:   provider === 'smtp' ? Boolean(smtp_secure) : false,
      created_by:    req.user.id,
    });

    return res.status(201).json({ success: true, data: toPublic(conn) });
  } catch (err) {
    console.error('[createConnection]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /connections
// ─────────────────────────────────────────────────────────────────────────────
export const getAllConnections = async (req, res) => {
  try {
    const connections = await Connection.find()
      .sort({ createdAt: -1 })
      .populate('created_by', 'display_name email');

    return res.status(200).json({
      success: true,
      data:    connections.map(toPublic),
      total:   connections.length,
    });
  } catch (err) {
    console.error('[getAllConnections]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /connections/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getConnectionById = async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id).populate('created_by', 'display_name email');
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' });
    return res.status(200).json({ success: true, data: toPublic(conn) });
  } catch (err) {
    console.error('[getConnectionById]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /connections/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateConnection = async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' });

    const { name, email, provider, brevo_api_key, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure } = req.body;

    if (name)     conn.name  = name.trim();
    if (email)    conn.email = email.trim().toLowerCase();
    if (provider) conn.provider = provider;

    if (conn.provider === 'brevo_api') {
      // Only re-encrypt if a new key was actually provided (not bullets placeholder)
      if (brevo_api_key && !brevo_api_key.startsWith('•')) {
        conn.brevo_api_key = encryptSecret(brevo_api_key);
      }
    }
    if (conn.provider === 'smtp') {
      if (smtp_host !== undefined) conn.smtp_host   = smtp_host.trim();
      if (smtp_port !== undefined) conn.smtp_port   = smtp_port;
      if (smtp_user !== undefined) conn.smtp_user   = smtp_user.trim();
      if (smtp_pass && !smtp_pass.startsWith('•')) {
        conn.smtp_pass = encryptSecret(smtp_pass);
      }
      if (smtp_secure !== undefined) conn.smtp_secure = Boolean(smtp_secure);
    }

    // Reset test status when credentials change
    conn.last_test_status = 'untested';

    await conn.save();
    return res.status(200).json({ success: true, data: toPublic(conn) });
  } catch (err) {
    console.error('[updateConnection]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /connections/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteConnection = async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' });
    await conn.deleteOne();
    return res.status(200).json({ success: true, message: 'Connection deleted.' });
  } catch (err) {
    console.error('[deleteConnection]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /connections/:id/test
// Sends a live probe email to verify credentials work.
// ─────────────────────────────────────────────────────────────────────────────
export const testConnection = async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ success: false, message: 'Connection not found.' });

    // Send the probe email to the requesting user's email
    const toEmail = req.user.email;
    const subject = `✅ Test email from "${conn.name}"`;
    const html    = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6D5EF5;">Connection Test Successful 🎉</h2>
        <p>This is a test email sent from your <strong>${conn.name}</strong> connection
           (${conn.provider === 'brevo_api' ? 'Brevo API' : 'SMTP'}) via the
           Notification System.</p>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">
          Sender: ${conn.email} &nbsp;|&nbsp; Provider: ${conn.provider}
        </p>
      </div>`;

    await sendEmailViaConnection(conn, { toEmail, subject, html });

    conn.last_tested_at   = new Date();
    conn.last_test_status = 'ok';
    await conn.save();

    return res.status(200).json({
      success: true,
      message: `Test email sent to ${toEmail}. Check your inbox.`,
      data:    toPublic(conn),
    });
  } catch (err) {
    console.error('[testConnection]', err);
    // Persist failure status
    try {
      await Connection.findByIdAndUpdate(req.params.id, {
        last_tested_at:   new Date(),
        last_test_status: 'failed',
      });
    } catch { /* ignore */ }

    return res.status(400).json({
      success: false,
      message: `Connection test failed: ${err.message}`,
    });
  }
};
