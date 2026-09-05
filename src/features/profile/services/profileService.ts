import { UserProfile, CreateProfileInput } from '../types';
import { getDb } from '../../../lib/db/client';

type ProfileRow = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  themeKey: string;
  darkMode: number;
  createdAt: string;
  updatedAt: string;
};

function parseRow(row: ProfileRow): UserProfile {
  return {
    ...row,
    darkMode: row.darkMode === 1,
  };
}

const SELECT_COLUMNS = 'id, name, email, passwordHash, salt, themeKey, darkMode, createdAt, updatedAt';

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
  await db.runAsync(
    `INSERT INTO user_profile (id, name, email, passwordHash, salt, themeKey, darkMode, createdAt, updatedAt)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.name, input.email, input.passwordHash, input.salt, input.themeKey, input.darkMode ? 1 : 0, now, now]
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

export async function updateTheme(id: number, themeKey: string, darkMode: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE user_profile SET themeKey = ?, darkMode = ?, updatedAt = ? WHERE id = ?',
    [themeKey, darkMode ? 1 : 0, new Date().toISOString(), id]
  );
}