import {
  InventoryItem,
  InventoryUnit,
  StockTransaction,
  RestockInput,
  ConsumeInput,
  ConsumeResult,
} from '../types';
import { getDb } from '../../../lib/db/client';

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
  const id = input.id ?? `inv-${Date.now()}`;
  const now = new Date().toISOString();
  const opening = Math.max(0, input.openingQuantity ?? 0);
  const unitCost = Math.max(0, input.unitCost);

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
        [`tx-${Date.now()}`, id, now.slice(0, 10), opening, unitCost, 'Opening stock', now]
      );
    }
    if (opening > 0 && unitCost > 0) {
      const total = round2(opening * unitCost);
      await db.runAsync(
        `INSERT INTO expenses (id, date, category, description, amount, livestockId, allocations, notes)
         VALUES (?, ?, 'feed', ?, ?, NULL, NULL, ?)`,
        [`exp-${Date.now()}`, now.slice(0, 10), `Opening stock: ${input.name} ${opening} ${input.unit}`, total, 'Recorded from inventory']
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
  const newQuantity = existing.quantity + input.quantity;
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
      [`tx-${Date.now()}`, id, input.date, input.quantity, unitCost, input.notes ?? null, now]
    );

    if (input.totalCost > 0) {
      expenseId = `exp-${Date.now()}`;
      await db.runAsync(
        `INSERT INTO expenses (id, date, category, description, amount, livestockId, allocations, notes)
         VALUES (?, ?, 'feed', ?, ?, NULL, NULL, ?)`,
        [
          expenseId,
          input.date,
          `Feed restock: ${existing.name} (${input.quantity} ${existing.unit})`,
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
  const cost = round2(input.quantity * existing.unitCost);
  const feedingId = `f-${Date.now()}`;
  const feeding = {
    id: feedingId,
    date: input.date,
    feedType: existing.name,
    amount: `${input.quantity} ${existing.unit}`,
    inventoryId: id,
    quantity: input.quantity,
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

    await db.runAsync('UPDATE inventory_items SET quantity = quantity - ? WHERE id = ?', [input.quantity, id]);

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
        `tx-${Date.now()}`,
        id,
        input.date,
        -input.quantity,
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
    quantity: input.quantity,
    unitCost: existing.unitCost,
    cost,
  };
}
