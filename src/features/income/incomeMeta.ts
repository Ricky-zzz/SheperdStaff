import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../lib/theme/themes';
import { IncomeCategory } from './types';

export interface IncomeCategoryMeta {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function getIncomeCategoryMeta(category: IncomeCategory, colors: ThemeColors): IncomeCategoryMeta {
  switch (category) {
    case 'sale': return { label: 'Sale', icon: 'pricetag', color: colors.success };
    case 'milk': return { label: 'Milk', icon: 'water', color: colors.category.duck };
    case 'eggs': return { label: 'Eggs', icon: 'egg', color: colors.earth[500] };
    case 'other': return { label: 'Other', icon: 'ellipsis-horizontal', color: colors.neutral[500] };
  }
}