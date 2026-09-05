import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { Task } from '../types';
import { todayISO } from '../services/taskService';

interface TaskItemProps {
  task: Task;
  livestockName?: string;
  onPress: () => void;
  onToggle: () => void;
  showBorder?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, livestockName, onPress, onToggle, showBorder = false }) => {
  const { colors } = useTheme();
  const isDone = task.status === 'done';
  const isOverdue = !isDone && task.dueDate < todayISO();

  const subtitleParts = [task.dueDate];
  if (livestockName) subtitleParts.push(livestockName);
  if (task.notes) subtitleParts.push(task.notes);

  return (
    <View className={`flex-row items-center p-4 ${showBorder ? 'border-b border-neutral-100' : ''}`}>
      <TouchableOpacity
        className="w-9 h-9 rounded-full justify-center items-center mr-3 border"
        style={{
          borderColor: isDone ? colors.success : isOverdue ? colors.error : colors.border,
          backgroundColor: isDone ? colors.success + '22' : 'transparent',
        }}
        onPress={onToggle}
        hitSlop={8}
      >
        {isDone && <Ionicons name="checkmark" size={18} color={colors.success} />}
      </TouchableOpacity>

      <TouchableOpacity className="flex-1" onPress={onPress} activeOpacity={0.7}>
        <Text className={`text-base font-medium ${isDone ? 'text-neutral-400 line-through' : 'text-neutral-800'}`} numberOfLines={1}>
          {task.title}
        </Text>
        <Text className={`text-xs mt-0.5 ${isOverdue ? 'text-error' : 'text-neutral-400'}`} numberOfLines={1}>
          {subtitleParts.join(' • ')}
          {isOverdue ? ' • Overdue' : ''}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="p-1 ml-2" onPress={onPress} hitSlop={8}>
        <Ionicons name="create-outline" size={18} color={colors.neutral[400]} />
      </TouchableOpacity>
    </View>
  );
};