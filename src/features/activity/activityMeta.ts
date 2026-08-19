import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/theme/colors';
import { ActivityType } from './types';

export function getActivityIcon(type: ActivityType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'feeding': return 'restaurant';
    case 'expense_added': return 'cash';
    case 'health_note': return 'medkit';
    case 'status_change': return 'swap-horizontal';
    case 'livestock_added': return 'add-circle';
    case 'sale': return 'trophy';
    default: return 'ellipse';
  }
}

export function getActivityColor(type: ActivityType): string {
  switch (type) {
    case 'feeding': return Colors.earth[500];
    case 'expense_added': return Colors.error;
    case 'health_note': return Colors.primary[500];
    case 'status_change': return '#9F7AEA';
    case 'livestock_added': return Colors.success;
    case 'sale': return Colors.category.cattle;
    default: return Colors.neutral[400];
  }
}

export function getActivityLabel(type: ActivityType): string {
  return type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
