import { AnimalType, CreateAnimalTypeInput, slugify } from '../types';
import { getDb } from '../../../lib/db/client';

type AnimalTypeRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
};

function parseRow(row: AnimalTypeRow): AnimalType {
  return { ...row };
}

export async function getAll(): Promise<AnimalType[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<AnimalTypeRow>('SELECT * FROM animal_types ORDER BY name ASC');
  return rows.map(parseRow);
}

export async function getById(id: string): Promise<AnimalType | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<AnimalTypeRow>('SELECT * FROM animal_types WHERE id = ?', [id]);
  return row ? parseRow(row) : undefined;
}

export async function uniqueSlug(base: string): Promise<string> {
  const existing = await getAll();
  const ids = new Set(existing.map((t) => t.id));
  let slug = slugify(base);
  let n = 2;
  while (ids.has(slug)) {
    slug = `${slugify(base)}-${n++}`;
  }
  return slug;
}

export async function create(input: CreateAnimalTypeInput): Promise<AnimalType> {
  const db = await getDb();
  const row: AnimalType = { ...input, createdAt: new Date().toISOString() };
  await db.runAsync(
    'INSERT INTO animal_types (id, name, icon, color, createdAt) VALUES (?, ?, ?, ?, ?)',
    [row.id, row.name, row.icon, row.color, row.createdAt]
  );
  return row;
}

export async function update(id: string, patch: Partial<Pick<AnimalType, 'name' | 'icon' | 'color'>>): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Animal type ${id} not found`);
  const next = { ...existing, ...patch, id };
  await (await getDb()).runAsync('UPDATE animal_types SET name=?, icon=?, color=? WHERE id=?', [
    next.name,
    next.icon,
    next.color,
    id,
  ]);
}

export async function isUsed(id: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM livestock WHERE category = ?', [id]);
  return (row?.c ?? 0) > 0;
}

export async function remove(id: string): Promise<void> {
  if (await isUsed(id)) throw new Error('This animal type is used by livestock and cannot be deleted.');
  await (await getDb()).runAsync('DELETE FROM animal_types WHERE id = ?', [id]);
}