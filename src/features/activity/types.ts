export type ActivityType =
  | 'livestock_added'
  | 'expense_added'
  | 'health_note'
  | 'status_change'
  | 'feeding'
  | 'sale';

export interface Activity {
  id: string;
  date: string;
  type: ActivityType;
  description: string;
  livestockId?: string;
  expenseId?: string;
}
