import type { SQLiteDatabase } from 'expo-sqlite';
import { mockLivestock, mockPens, mockExpenses, mockActivities, mockTasks, mockAnimalTypes, mockLocations } from '../../data/mock';

export async function seedIfNeeded(database: SQLiteDatabase): Promise<boolean> {
  const [lv, at, loc] = await Promise.all([
    database.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM livestock'),
    database.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM animal_types'),
    database.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM locations'),
  ]);
  if ((lv?.c ?? 0) > 0 && (at?.c ?? 0) > 0 && (loc?.c ?? 0) > 0) return false;

  await database.withTransactionAsync(async () => {
    if ((at?.c ?? 0) === 0) {
      for (const t of mockAnimalTypes) {
        await database.runAsync(
          `INSERT INTO animal_types (id, name, color, createdAt)
           VALUES (?, ?, ?, ?)`,
          [t.id, t.name, t.color, t.createdAt]
        );
      }
    }

    if ((loc?.c ?? 0) === 0) {
      for (const l of mockLocations) {
        await database.runAsync(
          `INSERT INTO locations (id, name, notes, createdAt)
           VALUES (?, ?, ?, ?)`,
          [l.id, l.name, l.notes ?? null, l.createdAt]
        );
      }
    }

    if ((lv?.c ?? 0) > 0) return;

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
  await database.execAsync('DELETE FROM activities; DELETE FROM expenses; DELETE FROM tasks; DELETE FROM livestock; DELETE FROM pens; DELETE FROM animal_types; DELETE FROM locations;');
}

export async function reseed(database: SQLiteDatabase): Promise<void> {
  await clearAll(database);
  await seedIfNeeded(database);
}
