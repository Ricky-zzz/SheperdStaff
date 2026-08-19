import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors } from '../../lib/theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = Colors.primary[600],
  subtitle,
  className,
  style,
}) => {
  return (
    <Card className={`flex-1 min-w-[140px] ${className ?? ''}`} style={style}>
      <View className="flex-row items-center mb-2">
        <View
          className="w-9 h-9 rounded-lg justify-center items-center mr-2"
          style={{ backgroundColor: color + '15' }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text className="text-sm text-neutral-500 font-medium flex-1">{title}</Text>
      </View>
      <Text className="text-2xl font-bold mt-1" style={{ color }}>
        {value}
      </Text>
      {subtitle && <Text className="text-xs text-neutral-400 mt-1">{subtitle}</Text>}
    </Card>
  );
};
