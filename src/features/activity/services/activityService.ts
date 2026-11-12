import { Activity } from '../types';
import { getDb } from '../../../lib/db/client';

type ActivityRow = {
  id: string;
  date: string;
  type: string;
  description: string;
  livestockId: string | null;
  expenseId: string | null;
};

function parseRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    date: row.date,
    type: row.type as Activity['type'],
    description: row.description,
    livestockId: row.livestockId ?? undefined,
    expenseId: row.expenseId ?? undefined,
  };
}

// Newest first; `rowid` breaks same-day ties by insertion order so the list
// is stable across reloads.
export const ACTIVITY_ORDER = 'ORDER BY date DESC, rowid DESC';

export async function getAll(): Promise<Activity[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ActivityRow>(`SELECT * FROM activities ${ACTIVITY_ORDER}`);
  return rows.map(parseRow);
}

export async function getRecent(limit: number): Promise<Activity[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ActivityRow>(`SELECT * FROM activities ${ACTIVITY_ORDER} LIMIT ?`, [limit]);
  return rows.map(parseRow);
}

export async function groupByDate(): Promise<Record<string, Activity[]>> {
  const all = await getAll();
  const groups: Record<string, Activity[]> = {};
  for (const a of all) {
    if (!groups[a.date]) groups[a.date] = [];
    groups[a.date].push(a);
  }
  return groups;
}

export async function log(entry: Activity): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO activities (id, date, type, description, livestockId, expenseId)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [entry.id, entry.date, entry.type, entry.description, entry.livestockId ?? null, entry.expenseId ?? null]
  );
}

/**
 * Log an entry but never let it break the caller's flow.
 *
 * Activity history is a convenience, not the source of truth. Using this
 * after a destructive action means a stale foreign key (or any other write
 * failure) can't turn a successful delete into an error alert.
 */
export async function safeLog(entry: Activity): Promise<void> {
  try {
    await log(entry);
  } catch {
    // Intentionally ignored — the caller's action already succeeded.
  }
}

export async function clear(): Promise<void> {
  await (await getDb()).execAsync('DELETE FROM activities');
}
