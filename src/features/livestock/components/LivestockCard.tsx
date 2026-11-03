import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { Badge, getStatusBadgeColor, getCategoryBadgeColor } from '../../../components/ui/Badge';
import { calculateAgeInMonths } from '../../../lib/utils/age';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { Livestock } from '../types';
import { AnimalType } from '../../animalTypes/types';
import { getCategoryLabel, getStatusLabel } from '../livestockMeta';

interface LivestockCardProps {
  livestock: Livestock;
  onPress: () => void;
  onLongPress?: () => void;
  types?: AnimalType[];
}

export const LivestockCard: React.FC<LivestockCardProps> = ({ livestock, onPress, onLongPress, types = [] }) => {
  const { colors, colorMode, darkMode } = useTheme();
  const statusColors = getStatusBadgeColor(livestock.status, colors, colorMode, darkMode);
  const categoryColors = getCategoryBadgeColor(livestock.category, colors, types, colorMode, darkMode);
  const ageMonths = calculateAgeInMonths(livestock.startDate);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${livestock.name}, ${getStatusLabel(livestock.status)}, ${getCategoryLabel(livestock.category, types)}`}
      accessibilityHint={onLongPress ? 'Long press for actions' : undefined}
    >
      <Card className="mb-4">
        <View className="flex-row items-center mb-3">
          <View
            className="w-11 h-11 rounded-lg justify-center items-center mr-3"
            style={{ backgroundColor: colors.neutral[100] }}
          >
            <Ionicons name="paw-outline" size={20} color={colors.neutral[500]} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-neutral-800">{livestock.name}</Text>
              {livestock.code ? <Text className="text-xs text-neutral-500">{livestock.code}</Text> : null}
            </View>
            <Text className="text-sm text-neutral-500 mt-0.5">
              {livestock.breed || getCategoryLabel(livestock.category, types)}
              {livestock.type === 'group' ? ` • ${livestock.quantity} head` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={18} color={colors.neutral[500]} />
        </View>

        <View className="flex-row flex-wrap gap-2 mb-3">
          <Badge label={getStatusLabel(livestock.status)} color={statusColors.bg} textColor={statusColors.text} />
          <Badge label={getCategoryLabel(livestock.category, types)} color={categoryColors.bg} textColor={categoryColors.text} />
          {livestock.type === 'group' && (
            <Badge label="Group" color={colors.neutral[100]} textColor={colors.neutral[600]} />
          )}
        </View>

        <View className="flex-row flex-wrap gap-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color={colors.neutral[500]} />
            <Text className="text-xs text-neutral-500">{livestock.location}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
            <Text className="text-xs text-neutral-500">{ageMonths} months</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="flag-outline" size={14} color={colors.neutral[500]} />
            <Text className="text-xs text-neutral-500">{livestock.purpose}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
