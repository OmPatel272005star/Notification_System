import crypto from 'crypto';

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
