import type { SQLiteDatabase } from 'expo-sqlite';
import { generateLivestockCode } from '../utils/livestockCode';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS livestock (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT,
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

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  dueTime TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  livestockId TEXT,
  recurrence TEXT NOT NULL DEFAULT 'none',
  seriesId TEXT,
  createdAt TEXT NOT NULL,
  completedAt TEXT,
  FOREIGN KEY (livestockId) REFERENCES livestock(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS animal_types (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS income (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  livestockId TEXT,
  notes TEXT,
  FOREIGN KEY (livestockId) REFERENCES livestock(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_income_livestockId ON income(livestockId);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  notes TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  salt TEXT NOT NULL,
  themeKey TEXT NOT NULL DEFAULT 'earth',
  darkMode INTEGER NOT NULL DEFAULT 0,
  appearance TEXT NOT NULL DEFAULT 'system',
  colorMode TEXT NOT NULL DEFAULT 'colorful',
  avatarUri TEXT,
  recoveryHash TEXT,
  recoverySalt TEXT,
  recoverySetAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pens (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  livestockIds TEXT NOT NULL DEFAULT '[]',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  animalTypeIds TEXT NOT NULL DEFAULT '[]',
  unit TEXT NOT NULL DEFAULT 'kg',
  quantity REAL NOT NULL DEFAULT 0,
  unitCost REAL NOT NULL DEFAULT 0,
  notes TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY NOT NULL,
  inventoryId TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity REAL NOT NULL,
  unitCost REAL,
  livestockId TEXT,
  feedingId TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (inventoryId) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (livestockId) REFERENCES livestock(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_livestockId ON expenses(livestockId);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_livestock_category ON livestock(category);
CREATE INDEX IF NOT EXISTS idx_livestock_status ON livestock(status);
CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_inventory_date ON inventory_transactions(date);
CREATE INDEX IF NOT EXISTS idx_inventory_item ON inventory_transactions(inventoryId);
`;

export async function ensureSchema(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(SCHEMA_SQL);
  // Migration: add allocations column if DB was created before M3 (no-op if exists)
  try {
    await database.execAsync('ALTER TABLE expenses ADD COLUMN allocations TEXT');
  } catch {
    // column already exists
  }
  // Migration: drop animal_types.icon (icons removed from animal types)
  try {
    const cols = await database.getAllAsync<{ name: string }>('PRAGMA table_info(animal_types)');
    if (cols.some((c) => c.name === 'icon')) {
      await database.execAsync('ALTER TABLE animal_types DROP COLUMN icon');
    }
  } catch {
    // table missing or already migrated
  }
  // Migration: task due time + recurrence (older installs)
  for (const ddl of [
    'ALTER TABLE tasks ADD COLUMN dueTime TEXT',
    "ALTER TABLE tasks ADD COLUMN recurrence TEXT NOT NULL DEFAULT 'none'",
    'ALTER TABLE tasks ADD COLUMN seriesId TEXT',
  ]) {
    try {
      await database.execAsync(ddl);
    } catch {
      // column already exists
    }
  }
  // Migration: lock recovery code (older installs). The code itself is never
  // stored — only a salted hash, like the password.
  for (const ddl of [
    'ALTER TABLE user_profile ADD COLUMN recoveryHash TEXT',
    'ALTER TABLE user_profile ADD COLUMN recoverySalt TEXT',
    'ALTER TABLE user_profile ADD COLUMN recoverySetAt TEXT',
  ]) {
    try {
      await database.execAsync(ddl);
    } catch {
      // column already exists
    }
  }
  // Migration: add user_profile.colorMode (older installs)
  try {
    const cols = await database.getAllAsync<{ name: string }>('PRAGMA table_info(user_profile)');
    if (cols.length > 0 && !cols.some((c) => c.name === 'colorMode')) {
      await database.execAsync("ALTER TABLE user_profile ADD COLUMN colorMode TEXT NOT NULL DEFAULT 'colorful'");
    }
    if (cols.length > 0 && !cols.some((c) => c.name === 'avatarUri')) {
      await database.execAsync('ALTER TABLE user_profile ADD COLUMN avatarUri TEXT');
    }
    if (cols.length > 0 && !cols.some((c) => c.name === 'appearance')) {
      await database.execAsync('ALTER TABLE user_profile ADD COLUMN appearance TEXT');
      // Preserve the user's existing light/dark choice; new installs default to system.
      await database.execAsync("UPDATE user_profile SET appearance = CASE WHEN darkMode = 1 THEN 'dark' ELSE 'light' END");
    }
  } catch {
    // table missing or already migrated
  }
  // Migration: add livestock.code and backfill unique Animal/Batch IDs (older installs)
  try {
    const cols = await database.getAllAsync<{ name: string }>('PRAGMA table_info(livestock)');
    if (cols.length > 0 && !cols.some((c) => c.name === 'code')) {
      await database.execAsync('ALTER TABLE livestock ADD COLUMN code TEXT');
    }
    const missing = await database.getAllAsync<{ id: string; category: string; type: string }>(
      "SELECT id, category, type FROM livestock WHERE code IS NULL OR code = ''"
    );
    for (const row of missing) {
      const code = await generateLivestockCode(database, row.category, row.type === 'group' ? 'group' : 'individual');
      await database.runAsync('UPDATE livestock SET code = ? WHERE id = ?', [code, row.id]);
    }
    await database.execAsync('CREATE UNIQUE INDEX IF NOT EXISTS idx_livestock_code ON livestock(code)');
  } catch {
    // table missing or already migrated
  }
}
