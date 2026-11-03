import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { Task } from '../types';
import { todayISO } from '../services/taskService';
import { formatDueTime, getRecurrenceLabel } from '../taskMeta';

interface TaskItemProps {
  task: Task;
  livestockName?: string;
  onPress: () => void;
  onToggle: () => void;
  onDelete?: () => void;
  showBorder?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, livestockName, onPress, onToggle, onDelete, showBorder = false }) => {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const isDone = task.status === 'done';
  const isOverdue = !isDone && task.dueDate < todayISO();

  const subtitleParts = [task.dueDate];
  if (task.dueTime) subtitleParts.push(formatDueTime(task.dueTime));
  if (task.recurrence !== 'none') subtitleParts.push(getRecurrenceLabel(task.recurrence));
  if (livestockName) subtitleParts.push(livestockName);
  if (task.notes) subtitleParts.push(task.notes);

  const renderActions = (side: 'left' | 'right') => (
    <TouchableOpacity
      className={`w-20 items-center justify-center ${side === 'left' ? 'bg-success' : 'bg-error'}`}
      onPress={() => {
        swipeableRef.current?.close();
        if (side === 'left') onToggle();
        else onDelete?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={side === 'left' ? (isDone ? 'Mark as not done' : 'Mark as done') : `Delete ${task.title}`}
    >
      <Ionicons
        name={side === 'left' ? (isDone ? 'arrow-undo-outline' : 'checkmark-outline') : 'trash-outline'}
        size={22}
        color={side === 'left' ? colors.onSuccess : colors.onError}
      />
      <Text className={`text-xs font-semibold mt-1 ${side === 'left' ? 'text-onSuccess' : 'text-onError'}`}>
        {side === 'left' ? (isDone ? 'Undo' : 'Done') : 'Delete'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={() => renderActions('left')}
      renderRightActions={onDelete ? () => renderActions('right') : undefined}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <View className={`flex-row items-center p-4 ${showBorder ? 'border-b border-neutral-100' : ''}`}>
      <TouchableOpacity
        className="w-9 h-9 rounded-full justify-center items-center mr-3 border"
        style={{
          borderColor: isDone ? colors.success : isOverdue ? colors.error : colors.border,
          backgroundColor: isDone ? colors.success + '22' : 'transparent',
        }}
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        accessibilityLabel={`Mark ${task.title} as ${isDone ? 'not done' : 'done'}`}
      >
        {isDone && <Ionicons name="checkmark-outline" size={18} color={colors.success} />}
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1"
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Edit task ${task.title}`}
      >
        <Text className={`text-base font-medium ${isDone ? 'text-neutral-500 line-through' : 'text-neutral-800'}`} numberOfLines={1}>
          {task.title}
        </Text>
        <Text className={`text-xs mt-0.5 ${isOverdue ? 'text-error' : 'text-neutral-500'}`} numberOfLines={1}>
          {subtitleParts.join(' • ')}
          {isOverdue ? ' • Overdue' : ''}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="p-2 ml-2 -mr-2"
        onPress={onPress}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${task.title}`}
      >
        <Ionicons name="create-outline" size={18} color={colors.neutral[500]} />
      </TouchableOpacity>
      </View>
    </Swipeable>
  );
};