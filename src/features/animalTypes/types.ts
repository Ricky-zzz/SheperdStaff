export interface AnimalType {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CreateAnimalTypeInput {
  id: string;
  name: string;
  color: string;
}

export const ANIMAL_TYPE_COLORS = [
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#6366F1',
  '#06B6D4',
  '#EF4444',
  '#14B8A6',
] as const;

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'type';
}