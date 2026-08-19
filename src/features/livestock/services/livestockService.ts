import { Livestock, LivestockCategory } from '../types';
import { mockLivestock } from '../../../data/mock';

export function getAll(): Livestock[] {
  return mockLivestock;
}

export function getById(id: string): Livestock | undefined {
  return mockLivestock.find((l) => l.id === id);
}

export function getByCategory(category: LivestockCategory): Livestock[] {
  return mockLivestock.filter((l) => l.category === category);
}

export function count(): number {
  return mockLivestock.reduce((sum, l) => sum + l.quantity, 0);
}

export function countGroups(): number {
  return mockLivestock.filter((l) => l.type === 'group').length;
}

export function countByCategory(): Record<string, number> {
  return mockLivestock.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + l.quantity;
    return acc;
  }, {} as Record<string, number>);
}

export function countByStatus(): Record<string, number> {
  return mockLivestock.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function search(query: string): Livestock[] {
  const q = query.toLowerCase();
  return mockLivestock.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.breed?.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q)
  );
}
