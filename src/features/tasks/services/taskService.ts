import { Task, TaskStatus, CreateTaskInput } from '../types';
import { getDb } from '../../../lib/db/client';

type TaskRow = {
  id: string;
  title: string;
  dueDate: string;
  notes: string | null;
  status: string;
  livestockId: string | null;
  createdAt: string;
  completedAt: string | null;
};

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.dueDate,
    notes: row.notes ?? undefined,
    status: row.status as TaskStatus,
    livestockId: row.livestockId ?? undefined,
    createdAt: row.createdAt,
    completedAt: row.completedAt ?? undefined,
  };
}

export async function getAll(): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TaskRow>('SELECT * FROM tasks ORDER BY dueDate ASC, createdAt DESC');
  return rows.map(parseRow);
}

export async function getById(id: string): Promise<Task | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
  return row ? parseRow(row) : undefined;
}

export async function create(input: CreateTaskInput): Promise<Task> {
  const db = await getDb();
  const task: Task = {
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO tasks (id, title, dueDate, notes, status, livestockId, createdAt, completedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [task.id, task.title, task.dueDate, task.notes ?? null, task.status, task.livestockId ?? null, task.createdAt, null]
  );
  return task;
}

export async function update(id: string, patch: Partial<Pick<Task, 'title' | 'dueDate' | 'notes' | 'livestockId'>>): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Task ${id} not found`);
  const next = { ...existing, ...patch, id };
  await (await getDb()).runAsync(
    'UPDATE tasks SET title=?, dueDate=?, notes=?, livestockId=? WHERE id=?',
    [next.title, next.dueDate, next.notes ?? null, next.livestockId ?? null, id]
  );
}

export async function toggleDone(id: string): Promise<Task | undefined> {
  const existing = await getById(id);
  if (!existing) return undefined;
  const done = existing.status !== 'done';
  const next: Task = {
    ...existing,
    status: done ? 'done' : 'pending',
    completedAt: done ? new Date().toISOString() : undefined,
  };
  await (await getDb()).runAsync(
    'UPDATE tasks SET status=?, completedAt=? WHERE id=?',
    [next.status, next.completedAt ?? null, id]
  );
  return next;
}

export async function remove(id: string): Promise<void> {
  await (await getDb()).runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function counts(): Promise<{ overdue: number; today: number; upcoming: number; done: number }> {
  const all = await getAll();
  const today = todayISO();
  const acc = { overdue: 0, today: 0, upcoming: 0, done: 0 };
  for (const t of all) {
    if (t.status === 'done') {
      acc.done++;
    } else if (t.dueDate < today) {
      acc.overdue++;
    } else if (t.dueDate === today) {
      acc.today++;
    } else {
      acc.upcoming++;
    }
  }
  return acc;
}

export async function nextDue(): Promise<Task | undefined> {
  const all = await getAll();
  const today = todayISO();
  const pending = all
    .filter((t) => t.status === 'pending' && t.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return pending[0];
}