export type TaskStatus = 'pending' | 'done';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  notes?: string;
  status: TaskStatus;
  livestockId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateTaskInput {
  id: string;
  title: string;
  dueDate: string;
  notes?: string;
  livestockId?: string;
}