/** Collision-resistant local ids. Date.now() alone collides within the same ms
 * (rapid double-tap, batch restock, seed). Random suffix keeps them unique
 * without a dependency. */
export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}
