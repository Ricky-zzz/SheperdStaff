export type DatePreset = '7d' | '30d' | 'month' | 'all' | 'custom';

export const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All time' },
  { key: 'custom', label: 'Custom' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

export function monthStartISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export interface ResolvedRange {
  from: string;
  to: string;
  label: string;
}

export function resolveRange(preset: DatePreset, customFrom: string, customTo: string): ResolvedRange {
  const today = toISODate(new Date());
  switch (preset) {
    case '7d':
      return { from: daysAgoISO(7), to: today, label: 'Last 7 days' };
    case '30d':
      return { from: daysAgoISO(30), to: today, label: 'Last 30 days' };
    case 'month':
      return { from: monthStartISO(), to: today, label: 'This month' };
    case 'all':
      return { from: '', to: '', label: 'All time' };
    case 'custom':
      return {
        from: customFrom,
        to: customTo,
        label: customFrom || customTo ? `${customFrom || '…'} → ${customTo || 'today'}` : 'Custom range',
      };
  }
}

export function inRange(date: string, from: string, to: string): boolean {
  return (!from || date >= from) && (!to || date <= to);
}

export function lastMonths(count: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: MONTHS[d.getMonth()],
    });
  }
  return out;
}