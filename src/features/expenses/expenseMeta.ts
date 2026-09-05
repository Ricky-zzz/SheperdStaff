import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../lib/theme/themes';
import { ExpenseCategory } from './types';

export interface ExpenseCategoryMeta {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function getExpenseCategoryMeta(category: ExpenseCategory, colors: ThemeColors): ExpenseCategoryMeta {
  switch (category) {
    case 'feed': return { label: 'Feed', icon: 'restaurant', color: colors.earth[500] };
    case 'medicine': return { label: 'Medicine', icon: 'medkit', color: colors.error };
    case 'supplies': return { label: 'Supplies', icon: 'cube', color: colors.category.cattle };
    case 'maintenance': return { label: 'Maintenance', icon: 'construct', color: colors.category.goat };
    case 'labor': return { label: 'Labor', icon: 'people', color: colors.category.chicken };
    case 'other': return { label: 'Other', icon: 'ellipsis-horizontal', color: colors.neutral[500] };
  }
}