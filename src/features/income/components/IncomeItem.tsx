import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { Income } from '../types';
import { getIncomeCategoryMeta } from '../incomeMeta';

export const IncomeItem: React.FC<{ income: Income }> = ({ income }) => {
  const { colors } = useTheme();
  const meta = getIncomeCategoryMeta(income.category, colors);
  return (
    <Card className="mb-2 p-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-8 h-8 rounded-lg justify-center items-center" style={{ backgroundColor: meta.color + '15' }}>
            <Ionicons name={meta.icon} size={16} color={meta.color} />
          </View>
          <Text className="text-xs font-semibold uppercase" style={{ color: meta.color }}>{meta.label}</Text>
        </View>
        <Text className="text-base font-bold text-success">+₱{income.amount.toFixed(2)}</Text>
      </View>
      <Text className="text-base font-medium text-neutral-800" numberOfLines={1}>{income.description}</Text>
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-xs text-neutral-400">{income.date}</Text>
        {income.notes && (
          <Text className="text-xs text-neutral-400 flex-1 text-right ml-3" numberOfLines={1}>{income.notes}</Text>
        )}
      </View>
    </Card>
  );
};