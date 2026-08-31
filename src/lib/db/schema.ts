import type { SQLiteDatabase } from 'expo-sqlite';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS livestock (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  breed TEXT,
  sex TEXT,
  startDate TEXT NOT NULL,
  location TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  imageUrl TEXT,
  healthNotes TEXT NOT NULL DEFAULT '[]',
  feedings TEXT NOT NULL DEFAULT '[]',
  expenseIds TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  livestockId TEXT,
  allocations TEXT,
  notes TEXT,
  FOREIGN KEY (livestockId) REFERENCES livestock(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  livestockId TEXT,
  expenseId TEXT,
  FOREIGN KEY (livestockId) REFERENCES livestock(id) ON DELETE SET NULL,
  FOREIGN KEY (expenseId) REFERENCES expenses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pens (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  livestockIds TEXT NOT NULL DEFAULT '[]',
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_expenses_livestockId ON expenses(livestockId);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_livestock_category ON livestock(category);
CREATE INDEX IF NOT EXISTS idx_livestock_status ON livestock(status);
`;

export async function ensureSchema(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(SCHEMA_SQL);
  // Migration: add allocations column if DB was created before M3 (no-op if exists)
  try {
    await database.execAsync('ALTER TABLE expenses ADD COLUMN allocations TEXT');
  } catch {
    // column already exists
  }
}
