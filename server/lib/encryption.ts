import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : null;

export function encrypt(plaintext: string): string {
  if (!KEY) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decrypt(ciphertext: string): string {
  if (!KEY) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const buffer = Buffer.from(ciphertext, 'base64');
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
