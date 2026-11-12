import { AnimalType, CreateAnimalTypeInput, slugify } from '../types';
import { getDb } from '../../../lib/db/client';

type AnimalTypeRow = {
  id: string;
  name: string;
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
    'INSERT INTO animal_types (id, name, color, createdAt) VALUES (?, ?, ?, ?)',
    [row.id, row.name, row.color, row.createdAt]
  );
  return row;
}

export async function update(id: string, patch: Partial<Pick<AnimalType, 'name' | 'color'>>): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Animal type ${id} not found`);
  const next = { ...existing, ...patch, id };
  await (await getDb()).runAsync('UPDATE animal_types SET name=?, color=? WHERE id=?', [
    next.name,
    next.color,
    id,
  ]);
}

export async function isUsed(id: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM livestock WHERE category = ?', [id]);
  return (row?.c ?? 0) > 0;
}

/**
 * How many records depend on this type, so a blocked delete can tell the user
 * exactly what to fix instead of a generic error.
 */
export async function usage(id: string): Promise<{ livestock: number; inventory: number }> {
  const db = await getDb();
  const livestockRow = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM livestock WHERE category = ?', [id]);
  const rows = await db.getAllAsync<{ animalTypeIds: string }>('SELECT animalTypeIds FROM inventory_items');
  let inventory = 0;
  for (const row of rows) {
    try {
      const ids: string[] = JSON.parse(row.animalTypeIds || '[]');
      if (ids.includes(id)) inventory++;
    } catch {
      // Malformed JSON simply doesn't count as a dependency.
    }
  }
  return { livestock: livestockRow?.c ?? 0, inventory };
}

export async function remove(id: string): Promise<void> {
  const used = await usage(id);
  if (used.livestock > 0) {
    throw new Error(
      `This type is used by ${used.livestock} livestock record${used.livestock === 1 ? '' : 's'}. Reassign those records to another type first.`
    );
  }
  if (used.inventory > 0) {
    throw new Error(
      `This type is used by ${used.inventory} feed item${used.inventory === 1 ? '' : 's'}. Edit those feed items to remove the type first.`
    );
  }
  await (await getDb()).runAsync('DELETE FROM animal_types WHERE id = ?', [id]);
}