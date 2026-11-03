import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { FeedingRecord } from '../types';

interface FeedingItemProps {
  feeding: FeedingRecord;
}

export const FeedingItem: React.FC<FeedingItemProps> = ({ feeding }) => {
  const { colors } = useTheme();
  return (
    <Card className="mb-4 p-4">
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons name="restaurant-outline" size={16} color={colors.earth[600]} />
        <Text className="text-base font-medium text-neutral-800">{feeding.feedType}</Text>
        <Text className="text-xs text-neutral-500 ml-auto">{feeding.date}</Text>
      </View>
      <View className="flex-row items-center flex-wrap gap-x-4 gap-y-1">
        <Text className="text-sm text-neutral-600">Amount: {feeding.amount}</Text>
        {feeding.cost !== undefined ? (
          <Text className="text-sm font-medium" style={{ color: colors.error }}>Cost: ₱{feeding.cost.toFixed(2)}</Text>
        ) : null}
        {feeding.inventoryId ? (
          <Text className="text-xs text-neutral-500">from inventory</Text>
        ) : null}
        {feeding.notes && <Text className="text-sm text-neutral-500 italic">{feeding.notes}</Text>}
      </View>
    </Card>
  );
};
