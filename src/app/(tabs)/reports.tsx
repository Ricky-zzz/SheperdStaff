import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { FilterChip } from '../../components/ui/FilterChip';
import {
  getAll as getAllLivestock,
  count as countLivestock,
  countByCategory as livestockByCategory,
  countByStatus,
} from '../../features/livestock/services/livestockService';
import { getAll as getAllExpenses } from '../../features/expenses/services/expenseService';
import { Livestock } from '../../features/livestock/types';
import { Expense } from '../../features/expenses/types';
import { useTheme } from '../../lib/theme/ThemeContext';

const CATEGORY_COLORS: Record<string, string> = {
  cattle: '#8B5CF6', pig: '#EC4899', chicken: '#F59E0B', goat: '#10B981', sheep: '#6366F1', duck: '#06B6D4',
};

const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  feed: '#D97706', medicine: '#EF4444', supplies: '#8B5CF6', maintenance: '#10B981', labor: '#F59E0B', other: '#78716C',
};

type Range = 'all' | '30d';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function ReportsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<Range>('all');
  const [allLivestock, setAllLivestock] = useState<Livestock[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [livestockByCategoryMap, setLivestockByCategoryMap] = useState<Record<string, number>>({});
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalLivestock, setTotalLivestock] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lByCat, sCounts, tL, allL, allE] = await Promise.all([
        livestockByCategory(),
        countByStatus(),
        countLivestock(),
        getAllLivestock(),
        getAllExpenses(),
      ]);
      setLivestockByCategoryMap(lByCat);
      setStatusCounts(sCounts);
      setTotalLivestock(tL);
      setAllLivestock(allL);
      setAllExpenses(allE);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [lByCat, sCounts, tL, allL, allE] = await Promise.all([
        livestockByCategory(),
        countByStatus(),
        countLivestock(),
        getAllLivestock(),
        getAllExpenses(),
      ]);
      setLivestockByCategoryMap(lByCat);
      setStatusCounts(sCounts);
      setTotalLivestock(tL);
      setAllLivestock(allL);
      setAllExpenses(allE);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const cutoff = range === '30d' ? isoDaysAgo(30) : null;
  const filteredExpenses = cutoff ? allExpenses.filter((e) => e.date >= cutoff) : allExpenses;
  const expensesByCategoryMap = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const totalSpent = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const txCount = filteredExpenses.length;

  const maxLivestock = Math.max(1, ...Object.values(livestockByCategoryMap));
  const maxExpense = Math.max(1, ...Object.values(expensesByCategoryMap));
  const statusColors: Record<string, string> = { growing: '#48BB78', breeding: '#9F7AEA', active: '#10B981', for_sale: '#F59E0B', sold: '#3B82F6', deceased: '#EF4444' };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row gap-2 mb-3">
        <FilterChip label="All time" selected={range === 'all'} onPress={() => setRange('all')} />
        <FilterChip label="Last 30 days" selected={range === '30d'} onPress={() => setRange('30d')} />
      </View>

      <View className="flex-row gap-3 mb-3">
        <Card className="flex-1 items-center py-5"><Ionicons name="paw" size={24} color={colors.primary[600]} /><Text className="text-2xl font-bold text-neutral-800 mt-2">{totalLivestock}</Text><Text className="text-sm text-neutral-500 mt-1">Total Animals</Text></Card>
        <Card className="flex-1 items-center py-5"><Ionicons name="wallet" size={24} color={colors.earth[600]} /><Text className="text-2xl font-bold text-neutral-800 mt-2">${totalSpent.toFixed(0)}</Text><Text className="text-sm text-neutral-500 mt-1">{range === '30d' ? 'Spent 30d' : 'Total Spent'}</Text></Card>
      </View>
      <View className="flex-row gap-3 mb-3">
        <Card className="flex-1 items-center py-5"><Ionicons name="list" size={24} color={colors.category.cattle} /><Text className="text-2xl font-bold text-neutral-800 mt-2">{allLivestock.length}</Text><Text className="text-sm text-neutral-500 mt-1">Records</Text></Card>
        <Card className="flex-1 items-center py-5"><Ionicons name="receipt" size={24} color={colors.category.chicken} /><Text className="text-2xl font-bold text-neutral-800 mt-2">{txCount}</Text><Text className="text-sm text-neutral-500 mt-1">Transactions</Text></Card>
      </View>

      <SectionHeader title="Livestock by Type" />
      <Card className="mb-2">
        {Object.entries(livestockByCategoryMap).map(([category, count]) => (
          <View key={category} className="flex-row items-center mb-3">
            <Text className="w-20 text-sm text-neutral-600 font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
            <View className="flex-1 h-5 bg-neutral-100 rounded-sm overflow-hidden mx-2">
              <View style={[styles.bar, { width: `${(count / maxLivestock) * 100}%`, backgroundColor: CATEGORY_COLORS[category] || colors.neutral[400] }]} />
            </View>
            <Text className="w-12 text-sm font-semibold text-neutral-700 text-right">{count}</Text>
          </View>
        ))}
      </Card>

      <SectionHeader title={`Expenses by Category (${range === '30d' ? '30d' : 'all'})`} />
      <Card className="mb-2">
        {Object.entries(expensesByCategoryMap).sort(([, a], [, b]) => b - a).map(([category, amount]) => (
          <View key={category} className="flex-row items-center mb-3">
            <Text className="w-20 text-sm text-neutral-600 font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
            <View className="flex-1 h-5 bg-neutral-100 rounded-sm overflow-hidden mx-2">
              <View style={[styles.bar, { width: `${(amount / maxExpense) * 100}%`, backgroundColor: EXPENSE_CATEGORY_COLORS[category] || colors.neutral[400] }]} />
            </View>
            <Text className="w-12 text-sm font-semibold text-neutral-700 text-right">${amount.toFixed(0)}</Text>
          </View>
        ))}
        {Object.keys(expensesByCategoryMap).length === 0 && (
          <Text className="text-sm text-neutral-400 py-2">No expenses in this range</Text>
        )}
      </Card>

      <SectionHeader title="Livestock by Status" />
      <Card className="mb-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <View key={status} className="flex-row items-center mb-3">
            <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: statusColors[status] || colors.neutral[400] }} />
            <Text className="flex-1 text-base text-neutral-700 font-medium">{status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}</Text>
            <Text className="text-sm text-neutral-500 mr-3">{count} records</Text>
            <Text className="w-11 text-base font-bold text-neutral-800 text-right">{allLivestock.length > 0 ? ((count / allLivestock.length) * 100).toFixed(0) : 0}%</Text>
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