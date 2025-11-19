import crypto from 'crypto';
import { getEnv } from '../env';

const ENCRYPTION_KEY_RAW = getEnv().encryption_key;

// Generate a 32-byte (256-bit) key from the encryption key string
// If it's already a hex string of correct length, use it directly
// Otherwise, hash it to get a consistent 32-byte key
function getEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY_RAW) {
    throw new Error('Encryption key is not configured in env.json');
  }
  
  // If it's a valid hex string of 64 characters (32 bytes), use it directly
  if (/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY_RAW)) {
    return Buffer.from(ENCRYPTION_KEY_RAW, 'hex');
  }
  
  // Otherwise, create a 32-byte key by hashing the string
  return crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();
}

const ENCRYPTION_KEY = getEncryptionKey();
const algorithm = 'aes-256-ctr';
const IV_LENGTH = 16;

export function encrypt(text: string) {
  if (!text) {
    return text;
  }
  
  try {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(text: string) {
  if (!text) {
    return text;
  }
  
  try {
    let textParts = text.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    let iv = Buffer.from(textParts[0], 'hex');
    let encryptedText = Buffer.from(textParts[1], 'hex');
    let decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}