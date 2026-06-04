import mongoose from 'mongoose';
import crypto   from 'crypto';

const { Schema, model } = mongoose;

// ─────────────────────────────────────────────────────────────────────────────
// Encryption helpers (AES-256-GCM)
// Requires ENCRYPTION_KEY in .env — exactly 32-char hex string (64 hex chars)
// ─────────────────────────────────────────────────────────────────────────────
const ALGO = 'aes-256-gcm';

export function encryptSecret(plaintext) {
  if (!plaintext) return '';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  const iv  = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Store as: iv(hex):tag(hex):ciphertext(hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSecret(stored) {
  if (!stored || !stored.includes(':')) return stored || '';
  try {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
    const [ivHex, tagHex, ctHex] = stored.split(':');
    const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ctHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}

/** Replace a secret with mask bullets — used in GET responses */
export function maskSecret(value) {
  return value ? '••••••••' : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────
const connectionSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type:     String,
      required: true,
      trim:     true,
    },

    /** Sender email address (display / from address) */
    email: {
      type:      String,
      required:  true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },

    // ── Provider ─────────────────────────────────────────────────────────────
    /**
     * 'brevo_api'  – Brevo transactional email via official SDK (API key)
     * 'smtp'       – any SMTP server (Brevo SMTP, Gmail, custom, etc.)
     */
    provider: {
      type:     String,
      enum:     ['brevo_api', 'smtp'],
      required: true,
    },

    // ── Brevo API path ────────────────────────────────────────────────────────
    /** AES-256-GCM encrypted Brevo API key */
    brevo_api_key: {
      type:    String,
      default: '',
    },

    // ── SMTP path ─────────────────────────────────────────────────────────────
    smtp_host:   { type: String, trim: true, default: '' },
    smtp_port:   { type: Number, default: 587 },
    smtp_user:   { type: String, trim: true, default: '' },
    /** AES-256-GCM encrypted SMTP password */
    smtp_pass:   { type: String, default: '' },
    smtp_secure: { type: Boolean, default: false }, // true = TLS on 465

    // ── Ownership ─────────────────────────────────────────────────────────────
    created_by: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // ── Test status ───────────────────────────────────────────────────────────
    last_tested_at: { type: Date },
    last_test_status: {
      type:    String,
      enum:    ['ok', 'failed', 'untested'],
      default: 'untested',
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
connectionSchema.index({ created_by: 1 });
connectionSchema.index({ provider: 1 });
connectionSchema.index({ email: 1, created_by: 1 }); // scoped, not global unique

const Connection = model('Connection', connectionSchema);
export default Connection;
