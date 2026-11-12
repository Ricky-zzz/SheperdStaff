export type ActivityType =
  | 'livestock_added'
  | 'livestock_deleted'
  | 'expense_added'
  | 'expense_deleted'
  | 'income'
  | 'health_note'
  | 'status_change'
  | 'feeding'
  | 'feeding_undone'
  | 'stock_adjustment'
  | 'sale'
  | 'task_completed';

export interface Activity {
  id: string;
  date: string;
  type: ActivityType;
  description: string;
  livestockId?: string;
  expenseId?: string;
}
