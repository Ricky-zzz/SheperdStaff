import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { formatQuantity } from '../../../lib/utils/format';
import { AnimalType } from '../../animalTypes/types';
import { InventoryItem } from '../types';
import { UNIT_LABELS, isLowStock } from '../inventoryMeta';

interface InventoryCardProps {
  item: InventoryItem;
  types: AnimalType[];
  onPress: () => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, types, onPress }) => {
  const { colors } = useTheme();
  const typeLabel =
    item.animalTypeIds.length === 0
      ? 'All animal types'
      : item.animalTypeIds.map((id) => types.find((t) => t.id === id)?.name ?? id).join(', ');
  const low = isLowStock(item.quantity);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatQuantity(item.quantity)} ${UNIT_LABELS[item.unit]} in stock`}
    >
      <Card className="mb-4">
        <View className="flex-row items-center mb-2">
          <View
            className="w-11 h-11 rounded-lg justify-center items-center mr-3"
            style={{ backgroundColor: colors.earth[100] }}
          >
            <Ionicons name="cube-outline" size={20} color={colors.earth[600]} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-neutral-800">{item.name}</Text>
            <Text className="text-xs text-neutral-500 mt-0.5">{typeLabel}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={18} color={colors.neutral[500]} />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold" style={{ color: low ? colors.error : colors.primary[700] }}>
              {formatQuantity(item.quantity)} {UNIT_LABELS[item.unit]}
            </Text>
            {low ? <Badge label={item.quantity <= 0 ? 'Out of stock' : 'Low stock'} color={colors.error + '18'} textColor={colors.error} /> : null}
          </View>
          <Text className="text-sm text-neutral-500">
            ₱{item.unitCost.toFixed(2)} / {UNIT_LABELS[item.unit]}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
