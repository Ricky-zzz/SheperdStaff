import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, actionLabel, onAction }) => {
  const { colors } = useTheme();
  return (
    <View className="items-center py-16 px-6">
      <View
        className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
        style={{ backgroundColor: colors.neutral[100] }}
      >
        <Ionicons name={icon} size={40} color={colors.neutral[500]} />
      </View>
      <Text className="text-lg font-semibold text-neutral-800 text-center">{title}</Text>
      {subtitle && <Text className="text-sm text-neutral-500 mt-2 text-center">{subtitle}</Text>}
      {actionLabel && onAction && (
        <View className="mt-5 w-full max-w-[240px]">
          <Button title={actionLabel} onPress={onAction} variant="primary" size="sm" />
        </View>
      )}
    </View>
  );
};
