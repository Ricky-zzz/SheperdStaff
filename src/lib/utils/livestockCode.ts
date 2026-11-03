import type { SQLiteDatabase } from 'expo-sqlite';
import type { LivestockType } from '../../features/livestock/types';

const CATEGORY_PREFIXES: Record<string, string> = {
  cattle: 'CAT',
  pig: 'PIG',
  chicken: 'CHK',
  goat: 'GOT',
  sheep: 'SHP',
  duck: 'DCK',
  other: 'OTH',
};

export function getCodePrefix(category: string): string {
  const known = CATEGORY_PREFIXES[category.toLowerCase()];
  if (known) return known;
  const cleaned = category.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 3);
  return cleaned || 'AST';
}

export function getCodeLabel(type: LivestockType): string {
  return type === 'group' ? 'Batch ID' : 'Animal ID';
}

export function codeScopePrefix(category: string, type: LivestockType): string {
  return `${getCodePrefix(category)}-${type === 'group' ? 'B' : 'A'}`;
}

export async function generateLivestockCode(
  db: SQLiteDatabase,
  category: string,
  type: LivestockType
): Promise<string> {
  const prefix = codeScopePrefix(category, type);
  const rows = await db.getAllAsync<{ code: string | null }>(
    'SELECT code FROM livestock WHERE code LIKE ?',
    [`${prefix}%`]
  );
  let max = 0;
  for (const row of rows) {
    const n = parseInt((row.code ?? '').slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}
