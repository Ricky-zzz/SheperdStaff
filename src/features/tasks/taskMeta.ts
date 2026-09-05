import { TaskStatus } from './types';

export function getTaskStatusLabel(status: TaskStatus): string {
  return status === 'done' ? 'Done' : 'Pending';
}

export function getTaskBucketLabel(bucket: 'overdue' | 'today' | 'upcoming' | 'done'): string {
  switch (bucket) {
    case 'overdue': return 'Overdue';
    case 'today': return 'Today';
    case 'upcoming': return 'Upcoming';
    case 'done': return 'Completed';
  }
}

export function formatDueDate(dueDate: string): string {
  return dueDate;
}