export type ExpenseCategory = 'feed' | 'medicine' | 'supplies' | 'maintenance' | 'labor' | 'other';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  livestockId?: string;
  notes?: string;
}
