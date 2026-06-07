import mongoose from 'mongoose';
import { encryptSecret, decryptSecret, maskSecret } from '../../shared/utils/encryption.js';

const { Schema, model } = mongoose;

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

// Re-export encryption helpers so ConnectionController can import from one place
export { encryptSecret, decryptSecret, maskSecret };
