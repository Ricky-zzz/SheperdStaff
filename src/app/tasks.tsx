import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useTheme } from '../lib/theme/ThemeContext';
import { Task } from '../features/tasks/types';
import * as taskService from '../features/tasks/services/taskService';
import { getTaskBucketLabel } from '../features/tasks/taskMeta';
import { TaskItem } from '../features/tasks/components/TaskItem';
import * as livestockService from '../features/livestock/services/livestockService';
import * as activityService from '../features/activity/services/activityService';

type Bucket = 'overdue' | 'today' | 'upcoming' | 'done';
const BUCKETS: Bucket[] = ['overdue', 'today', 'upcoming', 'done'];

export default function TasksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [livestockNames, setLivestockNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, ls] = await Promise.all([taskService.getAll(), livestockService.getAll()]);
      setTasks(all);
      const map: Record<string, string> = {};
      for (const l of ls) map[l.id] = l.name;
      setLivestockNames(map);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [all, ls] = await Promise.all([taskService.getAll(), livestockService.getAll()]);
      setTasks(all);
      const map: Record<string, string> = {};
      for (const l of ls) map[l.id] = l.name;
      setLivestockNames(map);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const today = taskService.todayISO();

  const buckets = useCallback(() => {
    const acc: Record<Bucket, Task[]> = { overdue: [], today: [], upcoming: [], done: [] };
    for (const t of tasks) {
      if (t.status === 'done') acc.done.push(t);
      else if (t.dueDate < today) acc.overdue.push(t);
      else if (t.dueDate === today) acc.today.push(t);
      else acc.upcoming.push(t);
    }
    const sortByDate = (a: Task, b: Task) => a.dueDate.localeCompare(b.dueDate);
    acc.overdue.sort(sortByDate);
    acc.upcoming.sort(sortByDate);
    acc.today.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    acc.done.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
    return acc;
  }, [tasks, today]);

  const grouped = buckets();

  const handleToggle = async (task: Task) => {
    const next = await taskService.toggleDone(task.id);
    if (next && next.status === 'done') {
      await activityService.log({
        id: `act-${Date.now()}`,
        date: today,
        type: 'task_completed',
        description: `Completed task: ${next.title}`,
        livestockId: next.livestockId,
      });
    }
    await load();
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-neutral-800">Task list</Text>
        <TouchableOpacity className="flex-row items-center bg-primary-600 px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/tasks/form')}>
          <Ionicons name="add" size={18} color={colors.white} />
          <Text className="text-sm text-white font-semibold">New Task</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <EmptyState icon="checkbox-outline" title="No tasks yet" subtitle={'Create a dated task like "Vaccinate herd on Mar 1"'} />
      ) : (
        BUCKETS.map((bucket) => {
          const items = grouped[bucket];
          if (items.length === 0) return null;
          return (
            <View key={bucket} className="mb-5">
              <Text className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                {getTaskBucketLabel(bucket)} ({items.length})
              </Text>
              <Card className="p-0">
                {items.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    livestockName={task.livestockId ? livestockNames[task.livestockId] : undefined}
                    showBorder={index < items.length - 1}
                    onToggle={() => handleToggle(task)}
                    onPress={() => router.push({ pathname: '/tasks/form', params: { id: task.id } })}
                  />
                ))}
              </Card>
            </View>
          );
        })
      )}
    </Screen>
  );
}