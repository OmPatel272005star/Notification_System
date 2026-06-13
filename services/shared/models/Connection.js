import mongoose from 'mongoose';
import { encryptSecret, decryptSecret, maskSecret } from '../utils/encryption.js';

const { Schema, model } = mongoose;

const connectionSchema = new Schema(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    provider:         { type: String, enum: ['brevo_api', 'smtp'], required: true },
    brevo_api_key:    { type: String, default: '' },
    smtp_host:        { type: String, trim: true, default: '' },
    smtp_port:        { type: Number, default: 587 },
    smtp_user:        { type: String, trim: true, default: '' },
    smtp_pass:        { type: String, default: '' },
    smtp_secure:      { type: Boolean, default: false },
    created_by:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    last_tested_at:   { type: Date },
    last_test_status: { type: String, enum: ['ok', 'failed', 'untested'], default: 'untested' },
  },
  { timestamps: true }
);

connectionSchema.index({ created_by: 1 });
connectionSchema.index({ provider: 1 });

const Connection = model('Connection', connectionSchema);
export default Connection;
export { encryptSecret, decryptSecret, maskSecret };
