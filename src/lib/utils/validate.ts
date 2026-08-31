export function required(value: string | undefined | null): string | null {
  if (!value || !value.trim()) return 'Required';
  return null;
}

export function quantityValid(value: string, type: 'individual' | 'group'): string | null {
  if (type === 'individual') return null;
  const n = Number(value);
  if (!value.trim()) return 'Required for groups';
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return 'Enter a whole number > 0';
  if (n > 10000) return 'Too large';
  return null;
}

export function amountValid(value: string): string | null {
  if (!value.trim()) return 'Required';
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 'Enter a number > 0';
  return null;
}

export function dateValid(value: string): string | null {
  if (!value.trim()) return 'Required';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Use YYYY-MM-DD';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  return null;
}

export function validateLivestock(input: {
  name: string;
  type: 'individual' | 'group';
  quantity: string;
  location: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const n = required(input.name);
  if (n) errors.name = n;
  const q = quantityValid(input.quantity, input.type);
  if (q) errors.quantity = q;
  const l = required(input.location);
  if (l) errors.location = l;
  return errors;
}

export function validateExpense(input: { description: string; amount: string; date: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  const d = required(input.description);
  if (d) errors.description = d;
  const a = amountValid(input.amount);
  if (a) errors.amount = a;
  const dt = dateValid(input.date);
  if (dt) errors.date = dt;
  return errors;
}
