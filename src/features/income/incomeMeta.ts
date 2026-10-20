import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../lib/theme/themes';
import { ColorMode } from '../profile/types';
import { IncomeCategory } from './types';

export interface IncomeCategoryMeta {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function getIncomeCategoryMeta(category: IncomeCategory, colors: ThemeColors, mode: ColorMode = 'colorful'): IncomeCategoryMeta {
  const base = ((): IncomeCategoryMeta => {
    switch (category) {
      case 'sale': return { label: 'Sale', icon: 'pricetag-outline', color: colors.success };
      case 'milk': return { label: 'Milk', icon: 'water-outline', color: colors.category.duck };
      case 'eggs': return { label: 'Eggs', icon: 'egg-outline', color: colors.earth[500] };
      case 'other': return { label: 'Other', icon: 'ellipsis-horizontal-outline', color: colors.neutral[500] };
    }
  })();
  return mode === 'uniform' ? { ...base, color: colors.neutral[500] } : base;
}