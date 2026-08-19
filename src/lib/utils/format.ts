export function formatCurrency(amount: number, decimals = 2): string {
  return `$${amount.toFixed(decimals)}`;
}

export function formatDate(date: string): string {
  return date;
}
