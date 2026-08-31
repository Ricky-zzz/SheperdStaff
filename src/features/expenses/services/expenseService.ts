import { Expense, ExpenseCategory, ExpenseAllocation } from '../types';
import { getDb } from '../../../lib/db/client';

type ExpenseRow = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  livestockId: string | null;
  allocations: string | null;
  notes: string | null;
};

function parseRow(row: ExpenseRow): Expense {
  let allocations: ExpenseAllocation[] | undefined = undefined;
  if (row.allocations) {
    try {
      allocations = JSON.parse(row.allocations);
    } catch {
      allocations = undefined;
    }
  }
  return {
    id: row.id,
    date: row.date,
    category: row.category as Expense['category'],
    description: row.description,
    amount: row.amount,
    livestockId: row.livestockId ?? undefined,
    allocations,
    notes: row.notes ?? undefined,
  };
}

export async function getAll(): Promise<Expense[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExpenseRow>('SELECT * FROM expenses ORDER BY date DESC');
  return rows.map(parseRow);
}

export async function getById(id: string): Promise<Expense | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<ExpenseRow>('SELECT * FROM expenses WHERE id = ?', [id]);
  return row ? parseRow(row) : undefined;
}

export async function getByLivestockId(livestockId: string): Promise<Expense[]> {
  const all = await getAll();
  return all.filter(
    (e) => e.livestockId === livestockId || e.allocations?.some((a) => a.livestockId === livestockId)
  );
}

export async function getAllocatedTotal(livestockId: string): Promise<number> {
  const expenses = await getByLivestockId(livestockId);
  let sum = 0;
  for (const e of expenses) {
    if (e.allocations && e.allocations.length > 0) {
      const share = e.allocations.find((a) => a.livestockId === livestockId);
      if (share) sum += share.amount;
    } else if (e.livestockId === livestockId) {
      sum += e.amount;
    }
  }
  return sum;
}

export async function getByCategory(category: ExpenseCategory): Promise<Expense[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExpenseRow>('SELECT * FROM expenses WHERE category = ? ORDER BY date DESC', [category]);
  return rows.map(parseRow);
}

export async function total(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number | null }>('SELECT SUM(amount) as c FROM expenses');
  return row?.c ?? 0;
}

export async function totalByCategory(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ category: string; total: number }>(
    'SELECT category, SUM(amount) as total FROM expenses GROUP BY category'
  );
  const acc: Record<string, number> = {};
  for (const r of rows) acc[r.category] = r.total;
  return acc;
}

export async function thisMonth(): Promise<number> {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${yyyy}-${mm}`;
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number | null }>(
    "SELECT SUM(amount) as c FROM expenses WHERE substr(date,1,7) = ?",
    [prefix]
  );
  return row?.c ?? 0;
}

export async function sorted(): Promise<Expense[]> {
  return getAll();
}

export function allocateBulk(amount: number, selected: { id: string; quantity: number }[]): ExpenseAllocation[] {
  const totalQty = selected.reduce((s, g) => s + (g.quantity || 1), 0);
  if (totalQty === 0) return selected.map((s) => ({ livestockId: s.id, amount: 0 }));
  let running = 0;
  return selected.map((s, idx) => {
    if (idx === selected.length - 1) {
      return { livestockId: s.id, amount: Math.round((amount - running) * 100) / 100 };
    }
    const share = Math.round((amount * s.quantity) / totalQty * 100) / 100;
    running += share;
    return { livestockId: s.id, amount: share };
  });
}

// --- Writes ---

export async function create(input: Expense): Promise<Expense> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO expenses (id, date, category, description, amount, livestockId, allocations, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.id,
      input.date,
      input.category,
      input.description,
      input.amount,
      input.livestockId ?? null,
      input.allocations ? JSON.stringify(input.allocations) : null,
      input.notes ?? null,
    ]
  );
  return input;
}

export async function update(id: string, patch: Partial<Expense>): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Expense ${id} not found`);
  const next = { ...existing, ...patch, id };
  await (await getDb()).runAsync(
    `UPDATE expenses SET date=?, category=?, description=?, amount=?, livestockId=?, allocations=?, notes=? WHERE id=?`,
    [
      next.date,
      next.category,
      next.description,
      next.amount,
      next.livestockId ?? null,
      next.allocations ? JSON.stringify(next.allocations) : null,
      next.notes ?? null,
      id,
    ]
  );
}

export async function remove(id: string): Promise<void> {
  await (await getDb()).runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}
