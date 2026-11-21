import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { getDb } from '../../../lib/db/client';
import { ensureSchema } from '../../../lib/db/schema';
import { fileStamp } from '../../../lib/utils/format';
import { BackupEntry, ExportResult, RestoreSummary } from '../types';

const BACKUP_DIR_NAME = 'backups';
const BACKUP_PREFIX = 'shepherd-backup-';
const BACKUP_EXT = '.sqlite';
const EXPORT_PREFIX = 'shepherd-export-';
/** Keep only the newest local copies so backups never pile up. */
const MAX_LOCAL_BACKUPS = 5;
/** The 16-byte header every SQLite file starts with ("SQLite format 3" + NUL). */
const SQLITE_MAGIC = 'SQLite format 3' + String.fromCharCode(0);

/** Tables a valid Shepherd Staff backup must contain. */
const REQUIRED_TABLES = [
  'livestock',
  'expenses',
  'income',
  'tasks',
  'activities',
  'animal_types',
  'locations',
  'inventory_items',
  'inventory_transactions',
  'user_profile',
] as const;

/** Tables written to the readable JSON export (the profile is excluded). */
const EXPORT_TABLES = [
  'livestock',
  'expenses',
  'income',
  'tasks',
  'activities',
  'animal_types',
  'locations',
  'inventory_items',
  'inventory_transactions',
  'pens',
] as const;

function ensureBackupDir(): Directory {
  const dir = new Directory(Paths.document, BACKUP_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function toEntry(file: File): BackupEntry {
  return {
    uri: file.uri,
    name: file.name,
    size: file.size,
    createdAt: file.modificationTime ?? Date.now(),
  };
}

function isBackupFile(uri: string): boolean {
  const name = uri.split('/').pop() ?? '';
  return name.startsWith(BACKUP_PREFIX) && name.endsWith(BACKUP_EXT);
}

function pruneBackups(dir: Directory): void {
  try {
    const entries = listBackupEntries(dir);
    for (const stale of entries.slice(MAX_LOCAL_BACKUPS)) {
      try {
        new File(stale.uri).delete();
      } catch {
        // Best effort — a backup we cannot delete is not worth failing for.
      }
    }
  } catch {
    // Listing failures must never break a backup that was just written.
  }
}

/** Newest-first list of `.sqlite` backups stored on this device. */
export function listBackupEntries(dir?: Directory): BackupEntry[] {
  try {
    const d = dir ?? ensureBackupDir();
    if (!d.exists) return [];
    return d
      .list()
      .filter((e) => isBackupFile(e.uri))
      .map((e) => toEntry(e as File))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/**
 * Snapshot the whole database (profile, settings and all farm records) into a
 * timestamped `.sqlite` file. WAL is checkpointed first so the snapshot holds
 * every committed change.
 */
export async function createBackup(): Promise<BackupEntry> {
  const db = await getDb();
  try {
    await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {
    // Checkpoint is advisory; serializeAsync still returns committed data.
  }
  const bytes = await db.serializeAsync();
  if (!bytes || bytes.length < 100) {
    throw new Error('Could not read the database to create a backup.');
  }

  const dir = ensureBackupDir();
  const file = new File(dir, `${BACKUP_PREFIX}${fileStamp()}${BACKUP_EXT}`);
  if (file.exists) file.delete();
  file.create({ intermediates: true });
  file.write(bytes);

  const entry = toEntry(file);
  pruneBackups(dir);
  return entry;
}

/** Open the native share sheet (Gmail, Drive, WhatsApp, Files, …). */
export async function shareBackup(entry: BackupEntry): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(entry.uri, {
    mimeType: 'application/octet-stream',
    dialogTitle: 'Share Shepherd Staff backup',
    UTI: 'public.database',
  });
  return true;
}

export async function isEmailAvailable(): Promise<boolean> {
  try {
    return await MailComposer.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Attach the backup to a new message. The app never sends mail itself — it
 * only opens the device's composer, so no server or network is involved.
 */
export async function emailBackup(entry: BackupEntry, recipient?: string): Promise<boolean> {
  if (!(await isEmailAvailable())) return false;
  const date = new Date(entry.createdAt);
  await MailComposer.composeAsync({
    recipients: recipient ? [recipient] : [],
    subject: `Shepherd Staff backup — ${date.toISOString().slice(0, 10)}`,
    body: [
      'Backup of my Shepherd Staff farm records.',
      '',
      `File: ${entry.name} (${Math.max(1, Math.round(entry.size / 1024))} KB)`,
      '',
      'To restore: open Shepherd Staff, go to More → Backup & Restore,',
      'then “Restore from file” and pick this attachment.',
      '',
      'Keep this message private — the backup includes your farm data,',
      'your local lock password and recovery code.',
    ].join('\n'),
    attachments: [entry.uri],
  });
  return true;
}

/** Ask the system for a backup file. Returns null when the user cancels. */
export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

function looksLikeSqlite(bytes: Uint8Array): boolean {
  if (bytes.length < SQLITE_MAGIC.length) return false;
  for (let i = 0; i < SQLITE_MAGIC.length; i++) {
    if (bytes[i] !== SQLITE_MAGIC.charCodeAt(i)) return false;
  }
  return true;
}

/**
 * Replace the live database with the contents of `bytes`.
 *
 * The bytes are deserialized into an in-memory database, validated, and then
 * copied over the open database with SQLite's backup API — no file paths or
 * connection juggling. A safety backup of the current data is written first,
 * so a wrong file can always be undone.
 */
export async function restoreFromBytes(bytes: Uint8Array): Promise<RestoreSummary> {
  if (!looksLikeSqlite(bytes)) {
    throw new Error('That file is not a Shepherd Staff backup.');
  }

  const source = await SQLite.deserializeDatabaseAsync(bytes);
  try {
    const tables = await source.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table'"
    );
    const present = new Set(tables.map((t) => t.name));
    const missing = REQUIRED_TABLES.filter((t) => !present.has(t));
    if (missing.length > 0) {
      throw new Error('That file is not a Shepherd Staff backup (it is missing the expected tables).');
    }

    const integrity = await source.getFirstAsync<{ integrity_check: string }>('PRAGMA integrity_check');
    if (integrity && integrity.integrity_check !== 'ok') {
      throw new Error('That backup file is damaged and was not restored.');
    }

    // Capture the source's shape first: the native backup call does not always
    // report failure, so we verify the copy actually landed before succeeding.
    const countSource = async (table: string) =>
      (await source.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM ${table}`))?.c ?? 0;
    const expected: Record<string, number> = {};
    for (const t of REQUIRED_TABLES) expected[t] = await countSource(t);

    await createBackup();

    const db = await getDb();
    await SQLite.backupDatabaseAsync({ sourceDatabase: source, destDatabase: db });
    await ensureSchema(db);

    const count = async (table: string) =>
      (await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM ${table}`))?.c ?? 0;
    for (const table of REQUIRED_TABLES) {
      const actual = await count(table);
      if (actual !== expected[table]) {
        throw new Error(
          'The restore did not complete. Your previous data was kept and a safety copy was saved — try again.'
        );
      }
    }

    const profileCount =
      (await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM user_profile'))?.c ?? 0;

    return {
      livestock: await count('livestock'),
      expenses: await count('expenses'),
      income: await count('income'),
      inventoryItems: await count('inventory_items'),
      hasProfile: profileCount > 0,
    };
  } finally {
    await source.closeAsync().catch(() => {});
  }
}

export async function restoreFromUri(uri: string): Promise<RestoreSummary> {
  const file = new File(uri);
  if (!file.exists) {
    throw new Error('That file could not be found. Try downloading it again.');
  }
  const bytes = await file.bytes();
  return restoreFromBytes(bytes);
}

/**
 * Readable JSON copy of the farm data for spreadsheets or sharing.
 * The profile (and its password hash) is deliberately excluded.
 */
export async function exportDataJson(): Promise<ExportResult> {
  const db = await getDb();
  const payload: Record<string, unknown> = {
    app: 'Shepherd Staff',
    exportedAt: new Date().toISOString(),
  };
  let records = 0;
  for (const table of EXPORT_TABLES) {
    try {
      const rows = await db.getAllAsync(`SELECT * FROM ${table}`);
      payload[table] = rows;
      records += rows.length;
    } catch {
      // A table missing from an older export should not fail the whole file.
      payload[table] = [];
    }
  }

  const file = new File(Paths.cache, `${EXPORT_PREFIX}${fileStamp()}.json`);
  if (file.exists) file.delete();
  file.create({ intermediates: true });
  file.write(JSON.stringify(payload, null, 2));

  return { uri: file.uri, name: file.name, size: file.size, records };
}

export async function shareExport(result: ExportResult): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Share farm data',
    UTI: 'public.json',
  });
  return true;
}
