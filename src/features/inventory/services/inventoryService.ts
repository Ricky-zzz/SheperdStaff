import {
  InventoryItem,
  InventoryUnit,
  StockTransaction,
  RestockInput,
  ConsumeInput,
  ConsumeResult,
} from '../types';
import { getDb } from '../../../lib/db/client';
import { formatQuantity } from '../../../lib/utils/format';
import { generateId } from '../../../lib/utils/ids';
import type { FeedingRecord } from '../../livestock/types';

type ItemRow = {
  id: string;
  name: string;
  animalTypeIds: string;
  unit: string;
  quantity: number;
  unitCost: number;
  notes: string | null;
  createdAt: string;
};

type TxRow = {
  id: string;
  inventoryId: string;
  date: string;
  type: string;
  quantity: number;
  unitCost: number | null;
  livestockId: string | null;
  feedingId: string | null;
  notes: string | null;
  createdAt: string;
};

function parseItem(row: ItemRow): InventoryItem {
  let animalTypeIds: string[] = [];
  try {
    animalTypeIds = JSON.parse(row.animalTypeIds || '[]');
  } catch {
    animalTypeIds = [];
  }
  return {
    id: row.id,
    name: row.name,
    animalTypeIds,
    unit: (row.unit as InventoryUnit) ?? 'kg',
    quantity: row.quantity,
    unitCost: row.unitCost,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
  };
}

function parseTx(row: TxRow): StockTransaction {
  return {
    id: row.id,
    inventoryId: row.inventoryId,
    date: row.date,
    type: row.type as StockTransaction['type'],
    quantity: row.quantity,
    unitCost: row.unitCost ?? undefined,
    livestockId: row.livestockId ?? undefined,
    feedingId: row.feedingId ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function getAll(): Promise<InventoryItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ItemRow>('SELECT * FROM inventory_items ORDER BY name ASC');
  return rows.map(parseItem);
}

export async function getById(id: string): Promise<InventoryItem | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<ItemRow>('SELECT * FROM inventory_items WHERE id = ?', [id]);
  return row ? parseItem(row) : undefined;
}

export async function getCompatible(animalTypeId: string): Promise<InventoryItem[]> {
  const items = await getAll();
  return items.filter((i) => i.animalTypeIds.length === 0 || i.animalTypeIds.includes(animalTypeId));
}

export async function totalStockValue(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ v: number | null }>(
    'SELECT SUM(quantity * unitCost) as v FROM inventory_items'
  );
  return round2(row?.v ?? 0);
}

export async function getTransactions(inventoryId: string, limit = 50): Promise<StockTransaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TxRow>(
    'SELECT * FROM inventory_transactions WHERE inventoryId = ? ORDER BY date DESC, createdAt DESC LIMIT ?',
    [inventoryId, limit]
  );
  return rows.map(parseTx);
}

export interface CreateInventoryInput {
  id?: string;
  name: string;
  animalTypeIds: string[];
  unit: InventoryUnit;
  openingQuantity?: number;
  unitCost: number;
  notes?: string;
}

export async function create(input: CreateInventoryInput): Promise<InventoryItem> {
  const db = await getDb();
  const id = input.id ?? generateId('inv');
  const now = new Date().toISOString();
  const opening = round2(Math.max(0, input.openingQuantity ?? 0));
  const unitCost = round2(Math.max(0, input.unitCost));

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO inventory_items (id, name, animalTypeIds, unit, quantity, unitCost, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.name, JSON.stringify(input.animalTypeIds), input.unit, opening, unitCost, input.notes ?? null, now]
    );
    if (opening > 0) {
      await db.runAsync(
        `INSERT INTO inventory_transactions (id, inventoryId, date, type, quantity, unitCost, livestockId, feedingId, notes, createdAt)
         VALUES (?, ?, ?, 'restock', ?, ?, NULL, NULL, ?, ?)`,
        [generateId('tx'), id, now.slice(0, 10), opening, unitCost, 'Opening stock', now]
      );
    }
    if (opening > 0 && unitCost > 0) {
      const total = round2(opening * unitCost);
      await db.runAsync(
        `INSERT INTO expenses (id, date, category, description, amount, livestockId, allocations, notes)
         VALUES (?, ?, 'feed', ?, ?, NULL, NULL, ?)`,
        [generateId('exp'), now.slice(0, 10), `Opening stock: ${input.name} ${opening} ${input.unit}`, total, 'Recorded from inventory']
      );
    }
  });

  return {
    id,
    name: input.name,
    animalTypeIds: input.animalTypeIds,
    unit: input.unit,
    quantity: opening,
    unitCost,
    notes: input.notes,
    createdAt: now,
  };
}

export async function update(
  id: string,
  patch: Partial<Pick<InventoryItem, 'name' | 'animalTypeIds' | 'unit' | 'notes'>>
): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Inventory item ${id} not found`);
  const next = { ...existing, ...patch };
  await (await getDb()).runAsync(
    'UPDATE inventory_items SET name = ?, animalTypeIds = ?, unit = ?, notes = ? WHERE id = ?',
    [next.name, JSON.stringify(next.animalTypeIds), next.unit, next.notes ?? null, id]
  );
}

export async function remove(id: string): Promise<void> {
  await (await getDb()).runAsync('DELETE FROM inventory_items WHERE id = ?', [id]);
}

export async function restock(id: string, input: RestockInput): Promise<{ expenseId?: string }> {
  const db = await getDb();
  const existing = await getById(id);
  if (!existing) throw new Error('Inventory item not found');
  if (input.quantity <= 0) throw new Error('Quantity must be greater than zero');

  const now = new Date().toISOString();
  const qty = round2(input.quantity);
  const newQuantity = round2(existing.quantity + qty);
  const avgCost =
    input.totalCost > 0
      ? Math.round(((existing.quantity * existing.unitCost + input.totalCost) / newQuantity) * 10000) / 10000
      : existing.unitCost;
  const unitCost = input.quantity > 0 && input.totalCost > 0 ? round2(input.totalCost / input.quantity) : existing.unitCost;
  let expenseId: string | undefined;

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE inventory_items SET quantity = ?, unitCost = ? WHERE id = ?', [
      newQuantity,
      avgCost,
      id,
    ]);

    await db.runAsync(
      `INSERT INTO inventory_transactions (id, inventoryId, date, type, quantity, unitCost, livestockId, feedingId, notes, createdAt)
       VALUES (?, ?, ?, 'restock', ?, ?, NULL, NULL, ?, ?)`,
      [generateId('tx'), id, input.date, qty, unitCost, input.notes ?? null, now]
    );

    if (input.totalCost > 0) {
      expenseId = generateId('exp');
      await db.runAsync(
        `INSERT INTO expenses (id, date, category, description, amount, livestockId, allocations, notes)
         VALUES (?, ?, 'feed', ?, ?, NULL, NULL, ?)`,
        [
          expenseId,
          input.date,
          `Feed restock: ${existing.name} (${qty} ${existing.unit})`,
          round2(input.totalCost),
          input.notes ?? 'Recorded from inventory',
        ]
      );
    }
  });

  return { expenseId };
}

export async function consume(id: string, input: ConsumeInput): Promise<ConsumeResult> {
  const db = await getDb();
  const existing = await getById(id);
  if (!existing) throw new Error('Inventory item not found');
  if (input.quantity <= 0) throw new Error('Quantity must be greater than zero');
  if (input.quantity > existing.quantity) {
    throw new Error(`Not enough stock — only ${existing.quantity} ${existing.unit} left`);
  }

  const now = new Date().toISOString();
  const qty = round2(input.quantity);
  const cost = round2(qty * existing.unitCost);
  const feedingId = generateId('f');
  const feeding = {
    id: feedingId,
    date: input.date,
    feedType: existing.name,
    amount: `${qty} ${existing.unit}`,
    inventoryId: id,
    quantity: qty,
    unit: existing.unit,
    unitCost: existing.unitCost,
    cost,
    notes: input.notes,
  };

  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<{ feedings: string }>('SELECT feedings FROM livestock WHERE id = ?', [
      input.livestockId,
    ]);
    if (!row) throw new Error('Livestock not found');

    await db.runAsync('UPDATE inventory_items SET quantity = round(quantity - ?, 2) WHERE id = ?', [qty, id]);

    let feedings: unknown[] = [];
    try {
      feedings = JSON.parse(row.feedings || '[]');
    } catch {
      feedings = [];
    }
    feedings.push(feeding);
    await db.runAsync('UPDATE livestock SET feedings = ? WHERE id = ?', [
      JSON.stringify(feedings),
      input.livestockId,
    ]);

    await db.runAsync(
      `INSERT INTO inventory_transactions (id, inventoryId, date, type, quantity, unitCost, livestockId, feedingId, notes, createdAt)
       VALUES (?, ?, ?, 'consume', ?, ?, ?, ?, ?, ?)`,
      [
        generateId('tx'),
        id,
        input.date,
        -qty,
        existing.unitCost,
        input.livestockId,
        feedingId,
        input.notes ?? null,
        now,
      ]
    );
  });

  return {
    feedingId,
    feedName: existing.name,
    unit: existing.unit,
    quantity: qty,
    unitCost: existing.unitCost,
    cost,
  };
}

export type AdjustDirection = 'add' | 'remove';

export interface AdjustInput {
  date: string;
  /** Positive amount combined with `direction`. */
  quantity: number;
  direction: AdjustDirection;
  notes?: string;
}

export interface AdjustResult {
  itemId: string;
  delta: number;
  newQuantity: number;
}

/**
 * Manual stock correction (spillage, count fix, units bought without a
 * receipt). Unlike a restock this never creates an expense — it only moves
 * stock and records an `adjustment` transaction for the audit trail.
 */
export async function adjust(id: string, input: AdjustInput): Promise<AdjustResult> {
  const db = await getDb();
  const existing = await getById(id);
  if (!existing) throw new Error('Inventory item not found');
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  const qty = round2(input.quantity);
  const delta = input.direction === 'add' ? qty : -qty;
  const newQuantity = round2(existing.quantity + delta);
  if (newQuantity < 0) {
    throw new Error(
      `Cannot remove ${round2(input.quantity)} ${existing.unit} — only ${formatQuantity(existing.quantity)} ${existing.unit} on hand.`
    );
  }

  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE inventory_items SET quantity = ? WHERE id = ?', [newQuantity, id]);
    await db.runAsync(
      `INSERT INTO inventory_transactions (id, inventoryId, date, type, quantity, unitCost, livestockId, feedingId, notes, createdAt)
       VALUES (?, ?, ?, 'adjustment', ?, ?, NULL, NULL, ?, ?)`,
      [
        generateId('tx'),
        id,
        input.date,
        delta,
        existing.unitCost,
        input.notes ?? (delta > 0 ? 'Stock added' : 'Stock removed'),
        now,
      ]
    );
  });

  return { itemId: id, delta, newQuantity };
}

export interface UndoFeedingResult {
  feedingDate: string;
  feedName: string;
  cost: number;
  /** False when the feed item no longer exists, so no stock came back. */
  stockRestored: boolean;
  restoredQuantity?: number;
  restoredUnit?: string;
}

/**
 * Undo a feeding: remove it from the animal and, when the feed still exists,
 * put the quantity back on the shelf as an `adjustment` so history stays
 * auditable (the original consume row is never rewritten).
 */
export async function undoFeeding(livestockId: string, feedingId: string): Promise<UndoFeedingResult> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ feedings: string }>('SELECT feedings FROM livestock WHERE id = ?', [
    livestockId,
  ]);
  if (!row) throw new Error('Livestock not found');

  let feedings: FeedingRecord[] = [];
  try {
    feedings = JSON.parse(row.feedings || '[]');
  } catch {
    feedings = [];
  }
  const feeding = feedings.find((f) => f.id === feedingId);
  if (!feeding) throw new Error('That feeding record was not found.');

  const remaining = feedings.filter((f) => f.id !== feedingId);
  const now = new Date().toISOString();
  let stockRestored = false;
  let restoredQuantity: number | undefined;
  let restoredUnit: string | undefined;
  let feedName = feeding.feedType;

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE livestock SET feedings = ? WHERE id = ?', [JSON.stringify(remaining), livestockId]);

    if (feeding.inventoryId && feeding.quantity && feeding.quantity > 0) {
      const item = await db.getFirstAsync<ItemRow>('SELECT * FROM inventory_items WHERE id = ?', [
        feeding.inventoryId,
      ]);
      if (item) {
        const newQuantity = round2(item.quantity + feeding.quantity);
        await db.runAsync('UPDATE inventory_items SET quantity = ? WHERE id = ?', [newQuantity, item.id]);
        await db.runAsync(
          `INSERT INTO inventory_transactions (id, inventoryId, date, type, quantity, unitCost, livestockId, feedingId, notes, createdAt)
           VALUES (?, ?, ?, 'adjustment', ?, ?, ?, ?, ?, ?)`,
          [
            generateId('tx'),
            item.id,
            now.slice(0, 10),
            feeding.quantity,
            feeding.unitCost ?? item.unitCost,
            livestockId,
            feedingId,
            'Feeding undone — stock returned',
            now,
          ]
        );
        stockRestored = true;
        restoredQuantity = feeding.quantity;
        restoredUnit = item.unit;
        feedName = item.name;
      }
    }
  });

  return {
    feedingDate: feeding.date,
    feedName,
    cost: feeding.cost ?? 0,
    stockRestored,
    restoredQuantity,
    restoredUnit,
  };
}
