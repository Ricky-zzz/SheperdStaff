import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { Badge, getStatusBadgeColor, getCategoryBadgeColor } from '../../../components/ui/Badge';
import { calculateAgeInMonths } from '../../../lib/utils/age';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { Livestock } from '../types';
import { getCategoryLabel, getCategoryIcon, getStatusLabel } from '../livestockMeta';

interface LivestockCardProps {
  livestock: Livestock;
  onPress: () => void;
}

export const LivestockCard: React.FC<LivestockCardProps> = ({ livestock, onPress }) => {
  const { colors } = useTheme();
  const statusColors = getStatusBadgeColor(livestock.status, colors);
  const categoryColors = getCategoryBadgeColor(livestock.category, colors);
  const ageMonths = calculateAgeInMonths(livestock.startDate);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-4">
        <View className="flex-row items-center mb-3">
          <View
            className="w-11 h-11 rounded-xl justify-center items-center mr-3"
            style={{ backgroundColor: categoryColors.bg }}
          >
            <Ionicons name={getCategoryIcon(livestock.category)} size={20} color={categoryColors.text} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-neutral-800">{livestock.name}</Text>
            <Text className="text-sm text-neutral-500 mt-0.5">
              {livestock.breed || getCategoryLabel(livestock.category)}
              {livestock.type === 'group' ? ` • ${livestock.quantity} head` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
        </View>

        <View className="flex-row flex-wrap gap-2 mb-3">
          <Badge label={getStatusLabel(livestock.status)} color={statusColors.bg} textColor={statusColors.text} />
          <Badge label={getCategoryLabel(livestock.category)} color={categoryColors.bg} textColor={categoryColors.text} />
          {livestock.type === 'group' && (
            <Badge label="Group" color={colors.neutral[100]} textColor={colors.neutral[600]} />
          )}
        </View>

        <View className="flex-row flex-wrap gap-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="location" size={14} color={colors.neutral[400]} />
            <Text className="text-xs text-neutral-500">{livestock.location}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar" size={14} color={colors.neutral[400]} />
            <Text className="text-xs text-neutral-500">{ageMonths} months</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="flag" size={14} color={colors.neutral[400]} />
            <Text className="text-xs text-neutral-500">{livestock.purpose}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
