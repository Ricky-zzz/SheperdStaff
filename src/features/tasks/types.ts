export type TaskStatus = 'pending' | 'done';

export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  notes?: string;
  status: TaskStatus;
  livestockId?: string;
  recurrence: TaskRecurrence;
  seriesId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateTaskInput {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  notes?: string;
  livestockId?: string;
  recurrence?: TaskRecurrence;
  seriesId?: string;
}
