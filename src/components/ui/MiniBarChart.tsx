import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';

interface MiniBarChartProps {
  data: { label: string; value: number }[];
  title?: string;
}

const MAX_BAR = 92;

export const MiniBarChart: React.FC<MiniBarChartProps> = ({ data, title = 'Last 6 months' }) => {
  const { colors, colorMode } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const last = data.length > 0 ? data[data.length - 1].value : 0;
  const prev = data.length > 1 ? data[data.length - 2].value : 0;
  const up = last >= prev;
  const accent = up ? colors.success : colors.error;
  const barColor = colorMode === 'uniform' ? colors.neutral[400] : colors.primary[400];

  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-medium text-neutral-600">{title}</Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name={up ? 'trending-up-outline' : 'trending-down-outline'} size={16} color={accent} />
          <Text className="text-xs font-semibold" style={{ color: accent }}>{up ? 'Up' : 'Down'}</Text>
        </View>
      </View>
      <View className="flex-row items-end gap-2 h-28">
        {data.map((d) => (
          <View key={d.label} className="flex-1 items-center">
            <View
              className="w-full rounded-t-sm"
              style={{ height: Math.max(2, (d.value / max) * MAX_BAR), backgroundColor: barColor }}
            />
            <Text className="text-[10px] text-neutral-400 mt-1">{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};