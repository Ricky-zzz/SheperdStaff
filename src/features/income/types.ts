export type IncomeCategory = 'sale' | 'milk' | 'eggs' | 'other';

export interface Income {
  id: string;
  date: string;
  category: IncomeCategory;
  description: string;
  amount: number;
  livestockId?: string;
  notes?: string;
}

export interface CreateIncomeInput {
  id: string;
  date: string;
  category: IncomeCategory;
  description: string;
  amount: number;
  livestockId?: string;
  notes?: string;
}