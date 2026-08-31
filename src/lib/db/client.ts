import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const database = await SQLite.openDatabaseAsync('shepherd.db');
    await database.execAsync('PRAGMA journal_mode = WAL;');
    await database.execAsync('PRAGMA foreign_keys = ON;');
    db = database;
    return database;
  })();
  return initPromise;
}

export async function initDb(): Promise<SQLite.SQLiteDatabase> {
  const database = await getDb();
  const { ensureSchema } = await import('./schema');
  await ensureSchema(database);
  const { seedIfNeeded } = await import('./seed');
  await seedIfNeeded(database);
  return database;
}

export function resetDbForTests() {
  db = null;
  initPromise = null;
}
