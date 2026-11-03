export type InventoryUnit = 'kg' | 'g' | 'piece' | 'bag' | 'liter';

export const INVENTORY_UNITS: InventoryUnit[] = ['kg', 'g', 'piece', 'bag', 'liter'];

export interface InventoryItem {
  id: string;
  name: string;
  /** Animal type ids this feed is for. Empty array = suitable for all types. */
  animalTypeIds: string[];
  unit: InventoryUnit;
  /** Current stock on hand. */
  quantity: number;
  /** Average cost per unit. */
  unitCost: number;
  notes?: string;
  createdAt: string;
}

export type StockTransactionType = 'restock' | 'consume' | 'adjustment';

export interface StockTransaction {
  id: string;
  inventoryId: string;
  date: string;
  type: StockTransactionType;
  /** Signed: restock positive, consumption negative. */
  quantity: number;
  unitCost?: number;
  livestockId?: string;
  feedingId?: string;
  notes?: string;
  createdAt: string;
}

export interface RestockInput {
  date: string;
  quantity: number;
  totalCost: number;
  notes?: string;
}

export interface ConsumeInput {
  livestockId: string;
  quantity: number;
  date: string;
  notes?: string;
}

export interface ConsumeResult {
  feedingId: string;
  feedName: string;
  unit: InventoryUnit;
  quantity: number;
  unitCost: number;
  cost: number;
}
