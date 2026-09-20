import crypto from 'node:crypto';
import { config } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const PREFIX = 'enc:v1:';

let cachedKey: Buffer | null = null;

function getDerivedKey(): Buffer {
  if (cachedKey) return cachedKey;

  const rawKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim();
  const isProd = config.nodeEnv === 'production' || process.env.VERCEL === '1';

  if (!rawKey) {
    if (isProd) {
      throw new Error('[CRYPTO] GOOGLE_TOKEN_ENCRYPTION_KEY is required in production.');
    }
    // Fallback key ONLY for local development/testing
    cachedKey = crypto.scryptSync('huntiq_dev_encryption_key_insecure', 'huntiq_dev_salt', 32);
    return cachedKey;
  }

  // If 64 hex characters (32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    cachedKey = Buffer.from(rawKey, 'hex');
    return cachedKey;
  }

  // If 32-character UTF-8 string
  if (Buffer.byteLength(rawKey, 'utf8') === 32) {
    cachedKey = Buffer.from(rawKey, 'utf8');
    return cachedKey;
  }

  // Otherwise, deterministically derive 32-byte key
  cachedKey = crypto.scryptSync(rawKey, 'huntiq_token_salt_v1', 32);
  return cachedKey;
}

export class CryptoService {
  public static isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim());
  }

  /**
   * Encrypts a token using AES-256-GCM.
   * Output format: enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>
   */
  public static encryptToken(plaintext: string): string {
    if (!plaintext) return plaintext;
    // Do not double-encrypt
    if (plaintext.startsWith(PREFIX)) return plaintext;

    const key = getDerivedKey();
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    const tag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`;
  }

  /**
   * Decrypts an AES-256-GCM encrypted token.
   * Gracefully returns legacy plaintext tokens if they lack the encryption prefix.
   */
  public static decryptToken(encryptedOrPlain: string): string {
    if (!encryptedOrPlain) return encryptedOrPlain;
    if (!encryptedOrPlain.startsWith(PREFIX)) {
      // Legacy plaintext token from prior dev migrations
      return encryptedOrPlain;
    }

    const payload = encryptedOrPlain.slice(PREFIX.length);
    const parts = payload.split(':');
    if (parts.length !== 3) {
      throw new Error('[CRYPTO] Invalid encrypted token format.');
    }

    const [ivHex, tagHex, ciphertextHex] = parts;
    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  }
}
