import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import {
  getAll as getAllLivestock,
  count as countLivestock,
  countByCategory as livestockByCategory,
  countByStatus,
} from '../../features/livestock/services/livestockService';
import {
  getAll as getAllExpenses,
  total as totalExpenses,
  totalByCategory as expensesByCategory,
} from '../../features/expenses/services/expenseService';
import { Colors } from '../../lib/theme/colors';

const CATEGORY_COLORS: Record<string, string> = {
  cattle: '#8B5CF6', pig: '#EC4899', chicken: '#F59E0B', goat: '#10B981', sheep: '#6366F1', duck: '#06B6D4',
};

const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  feed: '#D97706', medicine: '#EF4444', supplies: '#8B5CF6', maintenance: '#10B981', labor: '#F59E0B', other: '#78716C',
};

export default function ReportsScreen() {
  const livestockByCategoryMap = livestockByCategory();
  const expensesByCategoryMap = expensesByCategory();
  const totalLivestock = countLivestock();
  const totalExpensesValue = totalExpenses();

  const maxLivestock = Math.max(...Object.values(livestockByCategoryMap));
  const maxExpense = Math.max(...Object.values(expensesByCategoryMap));

  const statusCounts = countByStatus();
  const statusColors: Record<string, string> = { growing: '#48BB78', breeding: '#9F7AEA', active: '#10B981', for_sale: '#F59E0B', sold: '#3B82F6', deceased: '#EF4444' };

  return (
    <Screen>
      <View className="flex-row gap-3 mb-3">
        <Card className="flex-1 items-center py-5"><Ionicons name="paw" size={24} color={Colors.primary[600]} /><Text className="text-2xl font-bold text-neutral-800 mt-2">{totalLivestock}</Text><Text className="text-sm text-neutral-500 mt-1">Total Animals</Text></Card>
        <Card className="flex-1 items-center py-5"><Ionicons name="wallet" size={24} color={Colors.earth[600]} /><Text className="text-2xl font-bold text-neutral-800 mt-2">${totalExpensesValue.toFixed(0)}</Text><Text className="text-sm text-neutral-500 mt-1">Total Spent</Text></Card>
      </View>
      <View className="flex-row gap-3 mb-3">
        <Card className="flex-1 items-center py-5"><Ionicons name="list" size={24} color={Colors.category.cattle} /><Text className="text-2xl font-bold text-neutral-800 mt-2">{getAllLivestock().length}</Text><Text className="text-sm text-neutral-500 mt-1">Records</Text></Card>
        <Card className="flex-1 items-center py-5"><Ionicons name="receipt" size={24} color={Colors.category.chicken} /><Text className="text-2xl font-bold text-neutral-800 mt-2">{getAllExpenses().length}</Text><Text className="text-sm text-neutral-500 mt-1">Transactions</Text></Card>
      </View>

      <SectionHeader title="Livestock by Type" />
      <Card className="mb-2">
        {Object.entries(livestockByCategoryMap).map(([category, count]) => (
          <View key={category} className="flex-row items-center mb-3">
            <Text className="w-20 text-sm text-neutral-600 font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
            <View className="flex-1 h-5 bg-neutral-100 rounded-sm overflow-hidden mx-2">
              <View style={[styles.bar, { width: `${(count / maxLivestock) * 100}%`, backgroundColor: CATEGORY_COLORS[category] || Colors.neutral[400] }]} />
            </View>
            <Text className="w-12 text-sm font-semibold text-neutral-700 text-right">{count}</Text>
          </View>
        ))}
      </Card>

      <SectionHeader title="Expenses by Category" />
      <Card className="mb-2">
        {Object.entries(expensesByCategoryMap).sort(([, a], [, b]) => b - a).map(([category, amount]) => (
          <View key={category} className="flex-row items-center mb-3">
            <Text className="w-20 text-sm text-neutral-600 font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
            <View className="flex-1 h-5 bg-neutral-100 rounded-sm overflow-hidden mx-2">
              <View style={[styles.bar, { width: `${(amount / maxExpense) * 100}%`, backgroundColor: EXPENSE_CATEGORY_COLORS[category] || Colors.neutral[400] }]} />
            </View>
            <Text className="w-12 text-sm font-semibold text-neutral-700 text-right">${amount.toFixed(0)}</Text>
          </View>
        ))}
      </Card>

      <SectionHeader title="Livestock by Status" />
      <Card className="mb-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <View key={status} className="flex-row items-center mb-3">
            <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: statusColors[status] || Colors.neutral[400] }} />
            <Text className="flex-1 text-base text-neutral-700 font-medium">{status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}</Text>
            <Text className="text-sm text-neutral-500 mr-3">{count} records</Text>
            <Text className="w-11 text-base font-bold text-neutral-800 text-right">{((count / getAllLivestock().length) * 100).toFixed(0)}%</Text>
          </View>
        ))}
      </Card>

      <View className="h-8" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { height: '100%', borderRadius: 2 },
});
