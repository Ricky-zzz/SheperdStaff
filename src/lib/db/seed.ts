import type { SQLiteDatabase } from 'expo-sqlite';
import { mockLivestock, mockPens, mockExpenses, mockActivities, mockTasks } from '../../data/mock';

export async function seedIfNeeded(database: SQLiteDatabase): Promise<boolean> {
  const row = await database.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM livestock');
  if (row && row.c > 0) return false;

  await database.withTransactionAsync(async () => {
    for (const l of mockLivestock) {
      await database.runAsync(
        `INSERT INTO livestock (id, name, category, type, quantity, breed, sex, startDate, location, purpose, status, notes, imageUrl, healthNotes, feedings, expenseIds)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          l.id,
          l.name,
          l.category,
          l.type,
          l.quantity,
          l.breed ?? null,
          l.sex ?? null,
          l.startDate,
          l.location,
          l.purpose,
          l.status,
          l.notes ?? null,
          l.imageUrl ?? null,
          JSON.stringify(l.healthNotes),
          JSON.stringify(l.feedings),
          JSON.stringify(l.expenseIds),
        ]
      );
    }

    for (const e of mockExpenses) {
      await database.runAsync(
        `INSERT INTO expenses (id, date, category, description, amount, livestockId, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [e.id, e.date, e.category, e.description, e.amount, e.livestockId ?? null, e.notes ?? null]
      );
    }

    for (const a of mockActivities) {
      await database.runAsync(
        `INSERT INTO activities (id, date, type, description, livestockId, expenseId)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [a.id, a.date, a.type, a.description, a.livestockId ?? null, a.expenseId ?? null]
      );
    }

    for (const p of mockPens) {
      await database.runAsync(
        `INSERT INTO pens (id, name, location, capacity, livestockIds, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.location, p.capacity, JSON.stringify(p.livestockIds), p.notes ?? null]
      );
    }

    for (const t of mockTasks) {
      await database.runAsync(
        `INSERT INTO tasks (id, title, dueDate, notes, status, livestockId, createdAt, completedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.title, t.dueDate, t.notes ?? null, t.status, t.livestockId ?? null, t.createdAt, t.completedAt ?? null]
      );
    }
  });

  return true;
}

export async function clearAll(database: SQLiteDatabase): Promise<void> {
  await database.execAsync('DELETE FROM activities; DELETE FROM expenses; DELETE FROM livestock; DELETE FROM pens;');
}

export async function reseed(database: SQLiteDatabase): Promise<void> {
  await clearAll(database);
  await seedIfNeeded(database);
}
