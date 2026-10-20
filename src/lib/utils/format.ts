export function formatCurrency(amount: number, decimals = 2): string {
  return `₱${amount.toFixed(decimals)}`;
}

export function formatDate(date: string): string {
  return date;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}
