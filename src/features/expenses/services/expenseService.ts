import { Expense, ExpenseCategory } from '../types';
import { mockExpenses } from '../../../data/mock';

export function getAll(): Expense[] {
  return mockExpenses;
}

export function getById(id: string): Expense | undefined {
  return mockExpenses.find((e) => e.id === id);
}

export function getByLivestockId(livestockId: string): Expense[] {
  return mockExpenses.filter((e) => e.livestockId === livestockId);
}

export function getByCategory(category: ExpenseCategory): Expense[] {
  return mockExpenses.filter((e) => e.category === category);
}

export function total(): number {
  return mockExpenses.reduce((sum, e) => sum + e.amount, 0);
}

export function totalByCategory(): Record<string, number> {
  return mockExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
}

export function thisMonth(): number {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  return mockExpenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function sorted(): Expense[] {
  return [...mockExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
