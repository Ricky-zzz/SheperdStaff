import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useTheme } from '../lib/theme/ThemeContext';
import { Task } from '../features/tasks/types';
import * as taskService from '../features/tasks/services/taskService';
import { getTaskBucketLabel } from '../features/tasks/taskMeta';
import { TaskItem } from '../features/tasks/components/TaskItem';
import * as livestockService from '../features/livestock/services/livestockService';
import * as activityService from '../features/activity/services/activityService';
import { toUserMessage } from '../lib/utils/errors';
import { generateId } from '../lib/utils/ids';

type Bucket = 'overdue' | 'today' | 'upcoming' | 'done';
const BUCKETS: Bucket[] = ['overdue', 'today', 'upcoming', 'done'];

export default function TasksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { show, showUndo } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [livestockNames, setLivestockNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [all, ls] = await Promise.all([taskService.getAll(), livestockService.getAll()]);
      setTasks(all);
      const map: Record<string, string> = {};
      for (const l of ls) map[l.id] = l.name;
      setLivestockNames(map);
    } catch (err) {
      setLoadError(toUserMessage(err, 'Could not load tasks.'));
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
      setLoadError(null);
    } catch (err) {
      setLoadError(toUserMessage(err, 'Could not refresh tasks.'));
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
    // Optimistic: flip immediately, roll back only if the write fails.
    const prev = tasks;
    const flipped: Task = {
      ...task,
      status: task.status === 'done' ? 'pending' : 'done',
      completedAt: task.status === 'done' ? undefined : new Date().toISOString(),
    };
    setTasks((cur) => cur.map((t) => (t.id === task.id ? flipped : t)));
    try {
      const next = await taskService.toggleDone(task.id);
      if (next && next.status === 'done') {
        await activityService.safeLog({
          id: generateId('act'),
          date: today,
          type: 'task_completed',
          description: `Completed task: ${next.title}`,
          livestockId: next.livestockId,
        });
        show(`Done: ${next.title}`);
      }
      await load();
    } catch (err) {
      setTasks(prev);
      show(toUserMessage(err, 'Could not update task.'));
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Delete task?', `“${task.title}” will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const snapshot = tasks;
          const deleted = task;
          setTasks((cur) => cur.filter((t) => t.id !== task.id));
          try {
            await taskService.remove(task.id);
            showUndo(`Deleted “${task.title}”`, () => {
              // DB-level undo: re-insert the exact row, then reload.
              void (async () => {
                try {
                  await taskService.restore(deleted);
                  await load();
                } catch (err) {
                  show(toUserMessage(err, 'Could not restore the task.'));
                }
              })();
            });
          } catch (err) {
            setTasks(snapshot);
            Alert.alert('Could not delete', toUserMessage(err, 'Could not delete this task.'));
            return;
          }
          await load();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <SkeletonList rows={5} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={loadError} onRetry={load}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-neutral-800">Task list</Text>
        <TouchableOpacity
          className="min-h-11 flex-row items-center justify-center bg-primary-600 px-3 py-2 rounded-lg gap-1"
          onPress={() => router.push('/tasks/form')}
          accessibilityRole="button"
          accessibilityLabel="New task"
        >
          <Ionicons name="add-outline" size={18} color={colors.onPrimary} />
          <Text className="text-sm text-onPrimary font-semibold">New Task</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <EmptyState
          icon="checkbox-outline"
          title="No tasks yet"
          subtitle={'Create a dated task like "Vaccinate herd on Mar 1"'}
          actionLabel="New Task"
          onAction={() => router.push('/tasks/form')}
        />
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
                    onDelete={() => handleDelete(task)}
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