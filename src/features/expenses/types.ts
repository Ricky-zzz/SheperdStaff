export type ExpenseCategory = 'feed' | 'medicine' | 'supplies' | 'maintenance' | 'labor' | 'other';

export interface ExpenseAllocation {
  livestockId: string;
  amount: number;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  livestockId?: string;
  /** Bulk expense: split across multiple livestock/groups. When present, livestockId is ignored and profit uses allocations. */
  allocations?: ExpenseAllocation[];
  notes?: string;
}
