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

export async function getAll(): Promise<Activity[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ActivityRow>('SELECT * FROM activities ORDER BY date DESC');
  return rows.map(parseRow);
}

export async function getRecent(limit: number): Promise<Activity[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ActivityRow>('SELECT * FROM activities ORDER BY date DESC LIMIT ?', [limit]);
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

export async function clear(): Promise<void> {
  await (await getDb()).execAsync('DELETE FROM activities');
}
