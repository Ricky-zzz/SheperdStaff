import * as Crypto from 'expo-crypto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*';

export async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export async function verifyPassword(password: string, passwordHash: string, salt: string): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === passwordHash;
}

export async function generatePassword(length = 14): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(length + 16);
  const classes = [UPPER, LOWER, DIGITS, SYMBOLS];
  const all = classes.join('');
  const result: string[] = classes.map((c, i) => c[bytes[i] % c.length]);
  for (let i = result.length; i < length; i++) {
    result.push(all[bytes[i] % all.length]);
  }
  for (let i = result.length - 1; i > 0; i--) {
    const j = bytes[length + i] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.join('');
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export function passwordStrength(password: string, colors: { error: string; warning: string; success: string }): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const label = score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : score <= 4 ? 'Good' : 'Strong';
  const color = score <= 1 ? colors.error : score <= 3 ? colors.warning : colors.success;
  return { score, label, color };
}

/** 32 unambiguous characters (no 0/O, 1/I/L) so codes are easy to retype. */
const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * A 12-character code (≈60 bits) shown as `XXXX-XXXX-XXXX`.
 * Used to unlock after a forgotten password — no email or server required.
 */
export async function generateRecoveryCode(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(12);
  const chars = Array.from(bytes, (b) => RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]);
  return [chars.slice(0, 4).join(''), chars.slice(4, 8).join(''), chars.slice(8, 12).join('')].join('-');
}

/**
 * Canonical form of a typed code: uppercase, separators ignored, so
 * `shpr-abcd-efgh-jkln` matches `ABCD-EFGH-JKLN`.
 */
export function normalizeRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export async function verifyRecoveryCode(
  code: string,
  recoveryHash: string,
  recoverySalt: string
): Promise<boolean> {
  const normalized = normalizeRecoveryCode(code);
  if (normalized.length !== 12) return false;
  const hash = await hashPassword(normalized, recoverySalt);
  return hash === recoveryHash;
}