const MONTH_IN_MS = 1000 * 60 * 60 * 24 * 30;

export function calculateAgeInMonths(startDate: string): number {
  return Math.floor((Date.now() - new Date(startDate).getTime()) / MONTH_IN_MS);
}

export function formatAge(startDate: string): string {
  const months = calculateAgeInMonths(startDate);
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return years > 0 ? `${years}y ${remaining}m` : `${months} months`;
}
