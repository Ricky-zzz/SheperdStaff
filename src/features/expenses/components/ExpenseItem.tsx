import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/utils/format';
import { Expense } from '../types';
import { getExpenseCategoryMeta } from '../expenseMeta';

interface ExpenseItemProps {
  expense: Expense;
  /** When shown in a livestock detail, show the allocated share instead of full amount */
  highlightLivestockId?: string;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, highlightLivestockId }) => {
  const meta = getExpenseCategoryMeta(expense.category);
  const isBulk = !!(expense.allocations && expense.allocations.length > 0);
  const share = highlightLivestockId ? expense.allocations?.find((a) => a.livestockId === highlightLivestockId)?.amount : undefined;
  const displayAmount = share ?? expense.amount;
  return (
    <Card className="mb-2 p-3">
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-lg justify-center items-center mr-3"
          style={{ backgroundColor: meta.color + '15' }}
        >
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-neutral-800">{expense.description}</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">
            {expense.date}
            {isBulk ? ` • Bulk split ${expense.allocations!.length} ways` : ''}
          </Text>
          {expense.notes && (
            <Text className="text-xs text-neutral-500 italic mt-0.5" numberOfLines={1}>
              {expense.notes}
            </Text>
          )}
          {isBulk && highlightLivestockId && share !== undefined && (
            <Text className="text-xs text-primary-600 mt-0.5">Share: {formatCurrency(share)} of {formatCurrency(expense.amount)}</Text>
          )}
        </View>
        <Text className="text-lg font-bold text-neutral-800">{formatCurrency(displayAmount)}</Text>
      </View>
    </Card>
  );
};
