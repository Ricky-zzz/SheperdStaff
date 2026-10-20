import { Task, TaskRecurrence, TaskStatus, CreateTaskInput } from '../types';
import { getDb } from '../../../lib/db/client';

type TaskRow = {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string | null;
  notes: string | null;
  status: string;
  livestockId: string | null;
  recurrence: string;
  seriesId: string | null;
  createdAt: string;
  completedAt: string | null;
};

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function advanceDueDate(dueDate: string, recurrence: TaskRecurrence): string {
  const [y, m, d] = dueDate.split('-').map(Number);
  if (recurrence === 'daily' || recurrence === 'weekly') {
    const next = new Date(y, m - 1, d + (recurrence === 'daily' ? 1 : 7));
    return toISO(next);
  }
  const monthIndex = m;
  const year = y + Math.floor(monthIndex / 12);
  const month = monthIndex % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(Math.min(d, lastDay)).padStart(2, '0')}`;
}

function parseRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.dueDate,
    dueTime: row.dueTime ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status as TaskStatus,
    livestockId: row.livestockId ?? undefined,
    recurrence: (row.recurrence as TaskRecurrence) || 'none',
    seriesId: row.seriesId ?? undefined,
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
  const recurrence = input.recurrence ?? 'none';
  const task: Task = {
    ...input,
    recurrence,
    seriesId: input.seriesId ?? (recurrence === 'none' ? undefined : input.id),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO tasks (id, title, dueDate, dueTime, notes, status, livestockId, recurrence, seriesId, createdAt, completedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.title,
      task.dueDate,
      task.dueTime ?? null,
      task.notes ?? null,
      task.status,
      task.livestockId ?? null,
      task.recurrence,
      task.seriesId ?? null,
      task.createdAt,
      null,
    ]
  );
  return task;
}

export async function update(
  id: string,
  patch: Partial<Pick<Task, 'title' | 'dueDate' | 'dueTime' | 'notes' | 'livestockId' | 'recurrence'>>
): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new Error(`Task ${id} not found`);
  const next = { ...existing, ...patch, id };
  const seriesId = next.recurrence === 'none' ? existing.seriesId : existing.seriesId ?? id;
  await (await getDb()).runAsync(
    'UPDATE tasks SET title=?, dueDate=?, dueTime=?, notes=?, livestockId=?, recurrence=?, seriesId=? WHERE id=?',
    [
      next.title,
      next.dueDate,
      next.dueTime ?? null,
      next.notes ?? null,
      next.livestockId ?? null,
      next.recurrence,
      seriesId ?? null,
      id,
    ]
  );
}

async function spawnNext(task: Task): Promise<void> {
  if (task.recurrence === 'none') return;
  const db = await getDb();
  const seriesId = task.seriesId ?? task.id;
  const alreadySpawned = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM tasks WHERE seriesId = ? AND status = ? AND dueDate > ? LIMIT 1',
    [seriesId, 'pending', task.dueDate]
  );
  if (alreadySpawned) return;
  await create({
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: task.title,
    dueDate: advanceDueDate(task.dueDate, task.recurrence),
    dueTime: task.dueTime,
    notes: task.notes,
    livestockId: task.livestockId,
    recurrence: task.recurrence,
    seriesId,
  });
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
  if (done) await spawnNext(existing);
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
