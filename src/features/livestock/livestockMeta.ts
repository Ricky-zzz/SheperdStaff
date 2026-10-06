import { Ionicons } from '@expo/vector-icons';
import { LivestockCategory, LivestockStatus } from './types';
import { AnimalType } from '../animalTypes/types';

export function getCategoryLabel(category: LivestockCategory, types: AnimalType[] = []): string {
  const found = types.find((t) => t.id === category);
  if (found) return found.name;
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function getCategoryIcon(category: LivestockCategory, types: AnimalType[] = []): keyof typeof Ionicons.glyphMap {
  const icon = types.find((t) => t.id === category)?.icon;
  return (icon as keyof typeof Ionicons.glyphMap | undefined) ?? 'paw';
}

export function getCategoryColor(category: LivestockCategory, types: AnimalType[] = []): string | undefined {
  return types.find((t) => t.id === category)?.color;
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