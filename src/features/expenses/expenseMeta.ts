import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/theme/colors';
import { ExpenseCategory } from './types';

export interface ExpenseCategoryMeta {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const EXPENSE_CATEGORY_META: Record<ExpenseCategory, ExpenseCategoryMeta> = {
  feed: { label: 'Feed', icon: 'restaurant', color: Colors.earth[500] },
  medicine: { label: 'Medicine', icon: 'medkit', color: Colors.error },
  supplies: { label: 'Supplies', icon: 'cube', color: Colors.category.cattle },
  maintenance: { label: 'Maintenance', icon: 'construct', color: Colors.category.goat },
  labor: { label: 'Labor', icon: 'people', color: Colors.category.chicken },
  other: { label: 'Other', icon: 'ellipsis-horizontal', color: Colors.neutral[500] },
};

export function getExpenseCategoryMeta(category: ExpenseCategory): ExpenseCategoryMeta {
  return EXPENSE_CATEGORY_META[category];
}
