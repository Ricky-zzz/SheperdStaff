import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/utils/format';
import { Expense } from '../types';
import { getExpenseCategoryMeta } from '../expenseMeta';

interface ExpenseItemProps {
  expense: Expense;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const meta = getExpenseCategoryMeta(expense.category);
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
          <Text className="text-xs text-neutral-400 mt-0.5">{expense.date}</Text>
          {expense.notes && (
            <Text className="text-xs text-neutral-500 italic mt-0.5" numberOfLines={1}>
              {expense.notes}
            </Text>
          )}
        </View>
        <Text className="text-lg font-bold text-neutral-800">{formatCurrency(expense.amount)}</Text>
      </View>
    </Card>
  );
};
