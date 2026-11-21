import { Livestock, LivestockCategory } from '../types';
import { getDb } from '../../../lib/db/client';
import { generateLivestockCode } from '../../../lib/utils/livestockCode';

type LivestockRow = {
  id: string;
  code: string | null;
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

function safeParseArray<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

function parseRow(row: LivestockRow): Livestock {
  return {
    id: row.id,
    code: row.code ?? '',
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
    healthNotes: safeParseArray(row.healthNotes, []),
    feedings: safeParseArray(row.feedings, []),
    expenseIds: safeParseArray(row.expenseIds, []),
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
     WHERE lower(name) LIKE ? OR lower(COALESCE(breed,'')) LIKE ? OR lower(location) LIKE ? OR lower(COALESCE(code,'')) LIKE ?
     ORDER BY name ASC`,
    [q, q, q, q]
  );
  return rows.map(parseRow);
}

// --- Write helpers (M2 will wire UI, but service is ready) ---

export async function create(
  input: Omit<Livestock, 'code' | 'healthNotes' | 'feedings' | 'expenseIds'> &
    Partial<Pick<Livestock, 'code' | 'healthNotes' | 'feedings' | 'expenseIds'>>
): Promise<Livestock> {
  const db = await getDb();
  // Retry on UNIQUE(code) collision: two rapid creates can generate the same
  // sequential code before either row commits.
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const code =
      attempt === 0 && input.code
        ? input.code
        : await generateLivestockCode(db, input.category, input.type);
    const row: Livestock = {
      healthNotes: [],
      feedings: [],
      expenseIds: [],
      ...input,
      code,
    } as Livestock;
    try {
      await db.runAsync(
        `INSERT INTO livestock (id, code, name, category, type, quantity, breed, sex, startDate, location, purpose, status, notes, imageUrl, healthNotes, feedings, expenseIds)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.code,
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
    } catch (e) {
      lastError = e;
      const msg = String(e);
      if (!msg.includes('UNIQUE') || attempt === 2) throw e;
      // Otherwise loop and generate the next code.
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Could not create livestock');
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
  const db = await getDb();
  const blockers = await getDeletionBlockers(id);
  if (blockers.total > 0) {
    throw new Error(deletionBlockedMessage(blockers));
  }
  // Nothing references the animal any more. The only row still pointing at it
  // is its own automatic `livestock_added` bookkeeping entry — removing it in
  // the same transaction keeps the activity log free of parentless links.
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM activities WHERE livestockId = ? AND type = 'livestock_added'", [id]);
    await db.runAsync('DELETE FROM livestock WHERE id = ?', [id]);
  });
}

/**
 * Everything recorded against an animal that would be orphaned (or lost) by a
 * delete. Zero means the record is still untouched and can be removed as a
 * mistake.
 *
 * The automatic `livestock_added` entry is deliberately excluded: creating an
 * animal writes one, so counting it would make every animal undeletable.
 */
export interface DeletionBlockers {
  feedings: number;
  healthNotes: number;
  expenses: number;
  income: number;
  tasks: number;
  stockMovements: number;
  activities: number;
  total: number;
}

export async function getDeletionBlockers(id: string): Promise<DeletionBlockers> {
  const db = await getDb();
  const animal = await getById(id);
  const empty: DeletionBlockers = {
    feedings: 0,
    healthNotes: 0,
    expenses: 0,
    income: 0,
    tasks: 0,
    stockMovements: 0,
    activities: 0,
    total: 0,
  };
  if (!animal) return empty;

  const count = async (sql: string, params: string[]): Promise<number> => {
    const row = await db.getFirstAsync<{ c: number }>(sql, params);
    return row?.c ?? 0;
  };

  // Expenses linked directly, through the legacy bulk split, or listed in the
  // animal's own expenseIds — de-duplicated by expense id.
  const expenseIds = new Set<string>();
  const allExpenses = await db.getAllAsync<{ id: string; livestockId: string | null; allocations: string | null }>(
    'SELECT id, livestockId, allocations FROM expenses'
  );
  for (const expense of allExpenses) {
    let hit = expense.livestockId === id || animal.expenseIds.includes(expense.id);
    if (!hit && expense.allocations) {
      try {
        const allocations = JSON.parse(expense.allocations);
        hit = Array.isArray(allocations) && allocations.some((a) => a?.livestockId === id);
      } catch {
        hit = false;
      }
    }
    if (hit) expenseIds.add(expense.id);
  }

  const blockers: DeletionBlockers = {
    feedings: animal.feedings.length,
    healthNotes: animal.healthNotes.length,
    expenses: expenseIds.size,
    income: await count('SELECT COUNT(*) as c FROM income WHERE livestockId = ?', [id]),
    tasks: await count('SELECT COUNT(*) as c FROM tasks WHERE livestockId = ?', [id]),
    stockMovements: await count('SELECT COUNT(*) as c FROM inventory_transactions WHERE livestockId = ?', [id]),
    activities: await count("SELECT COUNT(*) as c FROM activities WHERE livestockId = ? AND type != 'livestock_added'", [id]),
    total: 0,
  };
  blockers.total =
    blockers.feedings +
    blockers.healthNotes +
    blockers.expenses +
    blockers.income +
    blockers.tasks +
    blockers.stockMovements +
    blockers.activities;
  return blockers;
}

/** Comma list of what is blocking, e.g. "4 feeding records, 2 expenses". */
export function describeDeletionBlockers(b: DeletionBlockers): string {
  const parts: string[] = [];
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  if (b.feedings) parts.push(plural(b.feedings, 'feeding record', 'feeding records'));
  if (b.healthNotes) parts.push(plural(b.healthNotes, 'health note', 'health notes'));
  if (b.expenses) parts.push(plural(b.expenses, 'linked expense', 'linked expenses'));
  if (b.income) parts.push(plural(b.income, 'income entry', 'income entries'));
  if (b.tasks) parts.push(plural(b.tasks, 'task', 'tasks'));
  if (b.stockMovements) parts.push(plural(b.stockMovements, 'feed-stock movement', 'feed-stock movements'));
  if (b.activities) parts.push(plural(b.activities, 'activity', 'activities'));
  return parts.join(', ');
}

export function deletionBlockedMessage(b: DeletionBlockers): string {
  return `This animal has ${describeDeletionBlockers(b)} recorded on the farm. Undo, delete or unlink those first so nothing is left without an owner.`;
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
