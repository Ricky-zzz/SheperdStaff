import { Income, CreateIncomeInput } from '../types';
import { getDb } from '../../../lib/db/client';

type IncomeRow = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  livestockId: string | null;
  notes: string | null;
};

function parseRow(row: IncomeRow): Income {
  return {
    id: row.id,
    date: row.date,
    category: row.category as Income['category'],
    description: row.description,
    amount: row.amount,
    livestockId: row.livestockId ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function getAll(): Promise<Income[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<IncomeRow>('SELECT * FROM income ORDER BY date DESC');
  return rows.map(parseRow);
}

export async function getById(id: string): Promise<Income | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<IncomeRow>('SELECT * FROM income WHERE id = ?', [id]);
  return row ? parseRow(row) : undefined;
}

export async function getByLivestockId(livestockId: string): Promise<Income[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<IncomeRow>(
    'SELECT * FROM income WHERE livestockId = ? ORDER BY date DESC',
    [livestockId]
  );
  return rows.map(parseRow);
}

export async function totalByLivestockId(livestockId: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number | null }>(
    'SELECT SUM(amount) as c FROM income WHERE livestockId = ?',
    [livestockId]
  );
  return row?.c ?? 0;
}

export async function total(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number | null }>('SELECT SUM(amount) as c FROM income');
  return row?.c ?? 0;
}

export async function totalByCategory(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ category: string; total: number }>(
    'SELECT category, SUM(amount) as total FROM income GROUP BY category'
  );
  const acc: Record<string, number> = {};
  for (const r of rows) acc[r.category] = r.total;
  return acc;
}

export async function create(input: CreateIncomeInput): Promise<Income> {
  const db = await getDb();
  const row: Income = { ...input };
  await db.runAsync(
    `INSERT INTO income (id, date, category, description, amount, livestockId, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [row.id, row.date, row.category, row.description, row.amount, row.livestockId ?? null, row.notes ?? null]
  );
  return row;
}

export async function update(id: string, patch: Partial<Pick<Income, 'date' | 'category' | 'description' | 'amount' | 'livestockId' | 'notes'>>): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Income ${id} not found`);
  const next = { ...existing, ...patch, id };
  await (await getDb()).runAsync(
    'UPDATE income SET date=?, category=?, description=?, amount=?, livestockId=?, notes=? WHERE id=?',
    [next.date, next.category, next.description, next.amount, next.livestockId ?? null, next.notes ?? null, id]
  );
}

export async function remove(id: string): Promise<void> {
  await (await getDb()).runAsync('DELETE FROM income WHERE id = ?', [id]);
}