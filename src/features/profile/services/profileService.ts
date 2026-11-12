import { UserProfile, CreateProfileInput, ColorMode, Appearance } from '../types';
import { getDb } from '../../../lib/db/client';

type ProfileRow = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  themeKey: string;
  darkMode: number;
  appearance: string | null;
  colorMode: string | null;
  avatarUri: string | null;
  recoveryHash: string | null;
  recoverySalt: string | null;
  recoverySetAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function parseAppearance(value: string | null, darkMode: number): Appearance {
  if (value === 'system' || value === 'light' || value === 'dark') return value;
  return darkMode === 1 ? 'dark' : 'light';
}

function parseRow(row: ProfileRow): UserProfile {
  return {
    ...row,
    darkMode: row.darkMode === 1,
    appearance: parseAppearance(row.appearance, row.darkMode),
    colorMode: (row.colorMode === 'uniform' ? 'uniform' : 'colorful') as ColorMode,
    avatarUri: row.avatarUri ?? undefined,
    recoveryHash: row.recoveryHash ?? undefined,
    recoverySalt: row.recoverySalt ?? undefined,
    recoverySetAt: row.recoverySetAt ?? undefined,
  };
}

const SELECT_COLUMNS =
  'id, name, email, passwordHash, salt, themeKey, darkMode, appearance, colorMode, avatarUri, recoveryHash, recoverySalt, recoverySetAt, createdAt, updatedAt';

export async function getProfile(): Promise<UserProfile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ProfileRow>(`SELECT ${SELECT_COLUMNS} FROM user_profile WHERE id = 1`);
  return row ? parseRow(row) : null;
}

export async function hasProfile(): Promise<boolean> {
  return (await getProfile()) !== null;
}

export async function createProfile(input: CreateProfileInput): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const appearance = input.appearance ?? (input.darkMode ? 'dark' : 'light');
  await db.runAsync(
    `INSERT INTO user_profile (id, name, email, passwordHash, salt, themeKey, darkMode, appearance, colorMode, createdAt, updatedAt)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.name, input.email, input.passwordHash, input.salt, input.themeKey, input.darkMode ? 1 : 0, appearance, input.colorMode, now, now]
  );
}

export async function updateProfileNameEmail(id: number, name: string, email: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE user_profile SET name = ?, email = ?, updatedAt = ? WHERE id = ?',
    [name, email, new Date().toISOString(), id]
  );
}

export async function updatePassword(id: number, passwordHash: string, salt: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE user_profile SET passwordHash = ?, salt = ?, updatedAt = ? WHERE id = ?',
    [passwordHash, salt, new Date().toISOString(), id]
  );
}

/** Store the salted hash of the recovery code (the code itself is never saved). */
export async function updateRecoveryCode(
  id: number,
  recoveryHash: string,
  recoverySalt: string
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE user_profile SET recoveryHash = ?, recoverySalt = ?, recoverySetAt = ?, updatedAt = ? WHERE id = ?',
    [recoveryHash, recoverySalt, now, now, id]
  );
}

/** Drop the recovery code (leaves the password untouched). */
export async function clearRecoveryCode(id: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE user_profile SET recoveryHash = NULL, recoverySalt = NULL, recoverySetAt = NULL, updatedAt = ? WHERE id = ?',
    [now, id]
  );
}

export async function updateTheme(id: number, themeKey: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE user_profile SET themeKey = ?, updatedAt = ? WHERE id = ?',
    [themeKey, new Date().toISOString(), id]
  );
}

export async function updateAppearance(id: number, appearance: Appearance): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE user_profile SET appearance = ?, darkMode = ?, updatedAt = ? WHERE id = ?',
    [appearance, appearance === 'dark' ? 1 : 0, new Date().toISOString(), id]
  );
}

export async function updateColorMode(id: number, colorMode: ColorMode): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE user_profile SET colorMode = ?, updatedAt = ? WHERE id = ?',
    [colorMode, new Date().toISOString(), id]
  );
}

export async function updateAvatar(id: number, avatarUri: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE user_profile SET avatarUri = ?, updatedAt = ? WHERE id = ?',
    [avatarUri, new Date().toISOString(), id]
  );
}