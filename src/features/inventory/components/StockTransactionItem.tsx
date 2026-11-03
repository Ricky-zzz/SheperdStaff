import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { formatQuantity } from '../../../lib/utils/format';
import { InventoryItem, StockTransaction } from '../types';
import { getTransactionMeta, UNIT_LABELS } from '../inventoryMeta';

interface StockTransactionItemProps {
  transaction: StockTransaction;
  item: InventoryItem;
  livestockName?: string;
}

export const StockTransactionItem: React.FC<StockTransactionItemProps> = ({ transaction, item, livestockName }) => {
  const { colors } = useTheme();
  const meta = getTransactionMeta(transaction.type, colors);
  const positive = transaction.quantity >= 0;

  return (
    <Card className="mb-4 p-4">
      <View className="flex-row items-center gap-2 mb-1">
        <Ionicons name={meta.icon} size={16} color={meta.color} />
        <Text className="text-sm font-medium text-neutral-800 flex-1">{meta.label}</Text>
        <Text className="text-xs text-neutral-500">{transaction.date}</Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-neutral-600">
          {positive ? '+' : '−'}
          {formatQuantity(Math.abs(transaction.quantity))} {UNIT_LABELS[item.unit]}
          {livestockName ? ` · ${livestockName}` : ''}
        </Text>
        {transaction.unitCost !== undefined && transaction.type !== 'consume' ? (
          <Text className="text-xs text-neutral-500">
            ₱{(Math.abs(transaction.quantity) * transaction.unitCost).toFixed(2)}
          </Text>
        ) : null}
      </View>
      {transaction.notes ? (
        <Text className="text-xs text-neutral-500 mt-1 italic" numberOfLines={1}>
          {transaction.notes}
        </Text>
      ) : null}
    </Card>
  );
};
