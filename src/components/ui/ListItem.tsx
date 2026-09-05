import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';

interface ListItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  showBorder?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  right,
  showChevron = false,
  onPress,
  showBorder = false,
}) => {
  const { colors } = useTheme();
  const color = iconColor ?? colors.neutral[400];
  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 ${showBorder ? 'border-b border-neutral-100' : ''}`}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View
        className="w-10 h-10 rounded-lg justify-center items-center mr-3"
        style={{ backgroundColor: color + '15' }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-neutral-800">{title}</Text>
        {subtitle && <Text className="text-sm text-neutral-500 mt-0.5">{subtitle}</Text>}
      </View>
      {right}
      {showChevron && <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />}
    </TouchableOpacity>
  );
};
