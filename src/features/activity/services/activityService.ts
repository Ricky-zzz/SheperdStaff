import { Activity } from '../types';
import { mockActivities } from '../../../data/mock';

export function getAll(): Activity[] {
  return mockActivities;
}

export function getRecent(limit: number): Activity[] {
  return mockActivities.slice(0, limit);
}

export function groupByDate(): Record<string, Activity[]> {
  return mockActivities.reduce((groups, activity) => {
    if (!groups[activity.date]) groups[activity.date] = [];
    groups[activity.date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);
}
