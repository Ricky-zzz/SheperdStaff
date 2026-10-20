import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../lib/theme/themes';
import { ActivityType } from './types';

export function getActivityIcon(type: ActivityType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'feeding': return 'restaurant-outline';
    case 'expense_added': return 'cash-outline';
    case 'income': return 'trending-up-outline';
    case 'health_note': return 'medkit-outline';
    case 'status_change': return 'swap-horizontal-outline';
    case 'livestock_added': return 'add-circle-outline';
    case 'sale': return 'trophy-outline';
    case 'task_completed': return 'checkmark-circle-outline';
    default: return 'ellipse';
  }
}

export function getActivityColor(type: ActivityType, colors: ThemeColors): string {
  switch (type) {
    case 'feeding': return colors.earth[500];
    case 'expense_added': return colors.error;
    case 'income': return colors.success;
    case 'health_note': return colors.primary[500];
    case 'status_change': return '#9F7AEA';
    case 'livestock_added': return colors.success;
    case 'sale': return colors.category.cattle;
    case 'task_completed': return colors.success;
    default: return colors.neutral[400];
  }
}

export function getActivityLabel(type: ActivityType): string {
  return type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}