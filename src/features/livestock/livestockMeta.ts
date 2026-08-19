import { Ionicons } from '@expo/vector-icons';
import { LivestockCategory, LivestockStatus } from './types';

export function getCategoryLabel(category: LivestockCategory): string {
  switch (category) {
    case 'cattle': return 'Cattle';
    case 'pig': return 'Pig';
    case 'chicken': return 'Chicken';
    case 'goat': return 'Goat';
    case 'sheep': return 'Sheep';
    case 'duck': return 'Duck';
    default: return 'Other';
  }
}

export function getCategoryIcon(category: LivestockCategory): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'cattle': return 'fitness';
    case 'pig': return 'nutrition';
    case 'chicken': return 'egg';
    case 'goat': return 'leaf';
    default: return 'paw';
  }
}

export function getStatusLabel(status: LivestockStatus): string {
  switch (status) {
    case 'growing': return 'Growing';
    case 'breeding': return 'Breeding';
    case 'for_sale': return 'For Sale';
    case 'sold': return 'Sold';
    case 'deceased': return 'Deceased';
    case 'active': return 'Active';
    default: return status;
  }
}
