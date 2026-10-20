import { TaskRecurrence, TaskStatus } from './types';
import { formatTime } from '../../lib/utils/format';

export const RECURRENCE_OPTIONS: TaskRecurrence[] = ['none', 'daily', 'weekly', 'monthly'];

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

export function getRecurrenceLabel(recurrence: TaskRecurrence): string {
  switch (recurrence) {
    case 'none': return 'Does not repeat';
    case 'daily': return 'Daily';
    case 'weekly': return 'Weekly';
    case 'monthly': return 'Monthly';
  }
}

export function formatDueDate(dueDate: string): string {
  return dueDate;
}

export function formatDueTime(dueTime?: string): string {
  return dueTime ? formatTime(dueTime) : '';
}
