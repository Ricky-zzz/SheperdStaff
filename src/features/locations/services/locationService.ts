import { Location, CreateLocationInput } from '../types';
import { getDb } from '../../../lib/db/client';

type LocationRow = {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string;
};

function parseRow(row: LocationRow): Location {
  return { id: row.id, name: row.name, notes: row.notes ?? undefined, createdAt: row.createdAt };
}

export async function getAll(): Promise<Location[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LocationRow>('SELECT * FROM locations ORDER BY name ASC');
  return rows.map(parseRow);
}

export async function getById(id: string): Promise<Location | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<LocationRow>('SELECT * FROM locations WHERE id = ?', [id]);
  return row ? parseRow(row) : undefined;
}

export async function create(input: CreateLocationInput): Promise<Location> {
  const db = await getDb();
  const row: Location = { ...input, createdAt: new Date().toISOString() };
  await db.runAsync('INSERT INTO locations (id, name, notes, createdAt) VALUES (?, ?, ?, ?)', [
    row.id,
    row.name,
    row.notes ?? null,
    row.createdAt,
  ]);
  return row;
}

export async function update(id: string, patch: Partial<Pick<Location, 'name' | 'notes'>>): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Location ${id} not found`);
  const next = { ...existing, ...patch, id };
  await (await getDb()).runAsync('UPDATE locations SET name=?, notes=? WHERE id=?', [
    next.name,
    next.notes ?? null,
    id,
  ]);
}

export async function isUsed(name: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM livestock WHERE location = ?', [name]);
  return (row?.c ?? 0) > 0;
}

export async function remove(id: string): Promise<void> {
  const existing = await getById(id);
  if (!existing) return;
  if (await isUsed(existing.name)) throw new Error('This location is used by livestock and cannot be deleted.');
  await (await getDb()).runAsync('DELETE FROM locations WHERE id = ?', [id]);
}