import { Ionicons } from '@expo/vector-icons';
import { InventoryUnit, StockTransaction } from './types';
import { ThemeColors } from '../../lib/theme/themes';

export const LOW_STOCK_THRESHOLD = 5;

export const UNIT_LABELS: Record<InventoryUnit, string> = {
  kg: 'kg',
  g: 'g',
  piece: 'pcs',
  bag: 'bags',
  liter: 'L',
};

export function isLowStock(quantity: number): boolean {
  return quantity <= LOW_STOCK_THRESHOLD;
}

export function getTransactionMeta(
  type: StockTransaction['type'],
  colors: ThemeColors
): { label: string; icon: keyof typeof Ionicons.glyphMap; color: string } {
  switch (type) {
    case 'restock':
      return { label: 'Restocked', icon: 'add-circle-outline', color: colors.success };
    case 'consume':
      return { label: 'Fed to livestock', icon: 'restaurant-outline', color: colors.earth[600] };
    default:
      return { label: 'Adjustment', icon: 'swap-horizontal-outline', color: colors.neutral[500] };
  }
}
