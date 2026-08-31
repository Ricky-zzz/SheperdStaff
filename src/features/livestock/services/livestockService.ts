import { Livestock, LivestockCategory } from '../types';
import { getDb } from '../../../lib/db/client';

type LivestockRow = {
  id: string;
  name: string;
  category: string;
  type: string;
  quantity: number;
  breed: string | null;
  sex: string | null;
  startDate: string;
  location: string;
  purpose: string;
  status: string;
  notes: string | null;
  imageUrl: string | null;
  healthNotes: string;
  feedings: string;
  expenseIds: string;
};

function parseRow(row: LivestockRow): Livestock {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Livestock['category'],
    type: row.type as Livestock['type'],
    quantity: row.quantity,
    breed: row.breed ?? undefined,
    sex: (row.sex as Livestock['sex']) ?? undefined,
    startDate: row.startDate,
    location: row.location,
    purpose: row.purpose,
    status: row.status as Livestock['status'],
    notes: row.notes ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    healthNotes: JSON.parse(row.healthNotes || '[]'),
    feedings: JSON.parse(row.feedings || '[]'),
    expenseIds: JSON.parse(row.expenseIds || '[]'),
  };
}

export async function getAll(): Promise<Livestock[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LivestockRow>('SELECT * FROM livestock ORDER BY name ASC');
  return rows.map(parseRow);
}

export async function getById(id: string): Promise<Livestock | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<LivestockRow>('SELECT * FROM livestock WHERE id = ?', [id]);
  return row ? parseRow(row) : undefined;
}

export async function getByCategory(category: LivestockCategory): Promise<Livestock[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LivestockRow>('SELECT * FROM livestock WHERE category = ? ORDER BY name ASC', [category]);
  return rows.map(parseRow);
}

export async function count(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number | null }>('SELECT SUM(quantity) as c FROM livestock');
  return row?.c ?? 0;
}

export async function countGroups(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM livestock WHERE type = 'group'");
  return row?.c ?? 0;
}

export async function countByCategory(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ category: string; total: number }>(
    'SELECT category, SUM(quantity) as total FROM livestock GROUP BY category'
  );
  const acc: Record<string, number> = {};
  for (const r of rows) acc[r.category] = r.total;
  return acc;
}

export async function countByStatus(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ status: string; c: number }>(
    'SELECT status, COUNT(*) as c FROM livestock GROUP BY status'
  );
  const acc: Record<string, number> = {};
  for (const r of rows) acc[r.status] = r.c;
  return acc;
}

export async function search(query: string): Promise<Livestock[]> {
  const q = `%${query.toLowerCase()}%`;
  const db = await getDb();
  const rows = await db.getAllAsync<LivestockRow>(
    `SELECT * FROM livestock
     WHERE lower(name) LIKE ? OR lower(COALESCE(breed,'')) LIKE ? OR lower(location) LIKE ?
     ORDER BY name ASC`,
    [q, q, q]
  );
  return rows.map(parseRow);
}

// --- Write helpers (M2 will wire UI, but service is ready) ---

export async function create(input: Omit<Livestock, 'healthNotes' | 'feedings' | 'expenseIds'> & Partial<Pick<Livestock, 'healthNotes' | 'feedings' | 'expenseIds'>>): Promise<Livestock> {
  const db = await getDb();
  const row: Livestock = {
    healthNotes: [],
    feedings: [],
    expenseIds: [],
    ...input,
  } as Livestock;
  await db.runAsync(
    `INSERT INTO livestock (id, name, category, type, quantity, breed, sex, startDate, location, purpose, status, notes, imageUrl, healthNotes, feedings, expenseIds)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.name,
      row.category,
      row.type,
      row.quantity,
      row.breed ?? null,
      row.sex ?? null,
      row.startDate,
      row.location,
      row.purpose,
      row.status,
      row.notes ?? null,
      row.imageUrl ?? null,
      JSON.stringify(row.healthNotes),
      JSON.stringify(row.feedings),
      JSON.stringify(row.expenseIds),
    ]
  );
  return row;
}

export async function update(id: string, patch: Partial<Livestock>): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Livestock ${id} not found`);
  const next = { ...existing, ...patch, id };
  await (await getDb()).runAsync(
    `UPDATE livestock SET name=?, category=?, type=?, quantity=?, breed=?, sex=?, startDate=?, location=?, purpose=?, status=?, notes=?, imageUrl=?, healthNotes=?, feedings=?, expenseIds=? WHERE id=?`,
    [
      next.name,
      next.category,
      next.type,
      next.quantity,
      next.breed ?? null,
      next.sex ?? null,
      next.startDate,
      next.location,
      next.purpose,
      next.status,
      next.notes ?? null,
      next.imageUrl ?? null,
      JSON.stringify(next.healthNotes),
      JSON.stringify(next.feedings),
      JSON.stringify(next.expenseIds),
      id,
    ]
  );
}

export async function remove(id: string): Promise<void> {
  await (await getDb()).runAsync('DELETE FROM livestock WHERE id = ?', [id]);
}

export async function addHealthNote(livestockId: string, note: Livestock['healthNotes'][number]): Promise<void> {
  const l = await getById(livestockId);
  if (!l) throw new Error('Livestock not found');
  l.healthNotes.push(note);
  await update(livestockId, { healthNotes: l.healthNotes });
}

export async function addFeeding(livestockId: string, feeding: Livestock['feedings'][number]): Promise<void> {
  const l = await getById(livestockId);
  if (!l) throw new Error('Livestock not found');
  l.feedings.push(feeding);
  await update(livestockId, { feedings: l.feedings });
}

export async function updateStatus(livestockId: string, status: Livestock['status']): Promise<void> {
  await update(livestockId, { status });
}
