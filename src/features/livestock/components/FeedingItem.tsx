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
    <Card className="mb-2 p-3">
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons name="restaurant" size={16} color={colors.earth[600]} />
        <Text className="text-base font-medium text-neutral-800">{feeding.feedType}</Text>
        <Text className="text-xs text-neutral-400 ml-auto">{feeding.date}</Text>
      </View>
      <View className="flex-row gap-4">
        <Text className="text-sm text-neutral-600">Amount: {feeding.amount}</Text>
        {feeding.notes && <Text className="text-sm text-neutral-500 italic">{feeding.notes}</Text>}
      </View>
    </Card>
  );
};
