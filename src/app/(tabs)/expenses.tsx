import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { RangeSelector } from '../../components/ui/RangeSelector';
import { MiniBarChart } from '../../components/ui/MiniBarChart';
import { ExpenseItem } from '../../features/expenses/components/ExpenseItem';
import { IncomeItem } from '../../features/income/components/IncomeItem';
import { getExpenseCategoryMeta } from '../../features/expenses/expenseMeta';
import { getAll as getAllExpenses } from '../../features/expenses/services/expenseService';
import { getAll as getAllIncome } from '../../features/income/services/incomeService';
import { getAll as getAllLivestock } from '../../features/livestock/services/livestockService';
import { Expense, ExpenseCategory } from '../../features/expenses/types';
import { Income } from '../../features/income/types';
import { Livestock } from '../../features/livestock/types';
import { useTheme } from '../../lib/theme/ThemeContext';
import { DatePreset, resolveRange, inRange, lastMonths } from '../../lib/utils/dateRange';

const CATEGORIES: ExpenseCategory[] = ['feed', 'medicine', 'supplies', 'maintenance', 'labor', 'other'];
type Segment = 'expenses' | 'income';

export default function ExpensesScreen() {
  const { colors, colorMode } = useTheme();
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('expenses');
  const [preset, setPreset] = useState<DatePreset>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [allIncome, setAllIncome] = useState<Income[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [exp, inc, ls] = await Promise.all([getAllExpenses(), getAllIncome(), getAllLivestock()]);
      setAllExpenses(exp);
      setAllIncome(inc);
      setLivestock(ls);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [exp, inc, ls] = await Promise.all([getAllExpenses(), getAllIncome(), getAllLivestock()]);
      setAllExpenses(exp);
      setAllIncome(inc);
      setLivestock(ls);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const range = resolveRange(preset, from, to);
  const filteredExpenses = allExpenses.filter((e) => inRange(e.date, range.from, range.to));
  const filteredIncome = allIncome.filter((i) => inRange(i.date, range.from, range.to));

  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalInc = filteredIncome.reduce((s, i) => s + i.amount, 0);
  const net = totalInc - totalExpenses;

  const expensesByCategory = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const nameById: Record<string, string> = {};
  for (const l of livestock) nameById[l.id] = l.name;

  const expenseByEntity: Record<string, number> = {};
  for (const e of filteredExpenses) {
    if (e.allocations && e.allocations.length > 0) {
      for (const a of e.allocations) expenseByEntity[a.livestockId] = (expenseByEntity[a.livestockId] || 0) + a.amount;
    } else if (e.livestockId) {
      expenseByEntity[e.livestockId] = (expenseByEntity[e.livestockId] || 0) + e.amount;
    }
  }
  const incomeByEntity: Record<string, number> = {};
  for (const i of filteredIncome) {
    if (i.livestockId) incomeByEntity[i.livestockId] = (incomeByEntity[i.livestockId] || 0) + i.amount;
  }

  const topSpenders = Object.entries(expenseByEntity)
    .map(([id, amount]) => ({ id, name: nameById[id] ?? id, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  const topEarners = Object.entries(incomeByEntity)
    .map(([id, amount]) => ({ id, name: nameById[id] ?? id, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const filteredCategories = selectedCategory === 'all' ? filteredExpenses : filteredExpenses.filter((e) => e.category === selectedCategory);
  const sortedExpenses = [...filteredCategories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedIncome = [...filteredIncome].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentExpenses = sortedExpenses.slice(0, 5);
  const recentIncome = sortedIncome.slice(0, 5);

  const trendData = lastMonths(6).map((m) => ({
    label: m.label,
    value: allIncome.filter((i) => i.date.slice(0, 7) === m.key).reduce((s, i) => s + i.amount, 0),
  }));

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
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg border ${segment === 'expenses' ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
          onPress={() => setSegment('expenses')}
        >
          <Text className={`text-sm font-semibold text-center ${segment === 'expenses' ? 'text-white' : 'text-neutral-600'}`}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg border ${segment === 'income' ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
          onPress={() => setSegment('income')}
        >
          <Text className={`text-sm font-semibold text-center ${segment === 'income' ? 'text-white' : 'text-neutral-600'}`}>Income</Text>
        </TouchableOpacity>
      </View>

      <RangeSelector
        preset={preset}
        onPresetChange={setPreset}
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
      />

      {segment === 'expenses' ? (
        <>
          <Card className={`mt-4 mb-4 items-center ${colorMode === 'uniform' ? 'border border-neutral-300' : 'bg-primary-700'}`}>
            <Text className={`text-sm font-medium ${colorMode === 'uniform' ? 'text-neutral-600' : 'text-primary-200'}`}>Total Expenses · {range.label}</Text>
            <Text className="text-3xl font-bold mt-1" style={{ color: colorMode === 'uniform' ? colors.error : colors.white }}>₱{totalExpenses.toFixed(2)}</Text>
            <Text className={`text-sm mt-1 ${colorMode === 'uniform' ? 'text-neutral-400' : 'text-primary-300'}`}>{filteredExpenses.length} transactions</Text>
          </Card>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {CATEGORIES.map((key) => {
              const info = getExpenseCategoryMeta(key, colors, colorMode);
              const amount = expensesByCategory[key] || 0;
              const isSelected = selectedCategory === key;
              return (
                <TouchableOpacity
                  key={key}
                  className={`w-[31%] bg-card rounded-lg p-3 items-center shadow-sm ${isSelected ? 'border-2 border-primary-500' : ''}`}
                  onPress={() => setSelectedCategory(isSelected ? 'all' : key)}
                >
                  <View className="w-9 h-9 rounded-lg justify-center items-center mb-2" style={{ backgroundColor: info.color + '15' }}>
                    <Ionicons name={info.icon} size={18} color={info.color} />
                  </View>
                  <Text className="text-xs text-neutral-600 font-medium mb-0.5">{info.label}</Text>
                  <Text className="text-sm font-bold" style={{ color: info.color }}>₱{amount.toFixed(0)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {topSpenders.length > 0 && (
            <>
              <SectionHeader title="Top spenders" />
              <Card className="mb-5 p-0">
                {topSpenders.map((row, index) => (
                  <TouchableOpacity
                    key={row.id}
                    className={`flex-row items-center justify-between px-4 py-3 ${index < topSpenders.length - 1 ? 'border-b border-neutral-100' : ''}`}
                    onPress={() => router.push(`/livestock/${row.id}`)}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: colors.neutral[100] }}>
                        <Ionicons name="paw-outline" size={16} color={colors.neutral[500]} />
                      </View>
                      <Text className="text-base text-neutral-700 flex-1" numberOfLines={1}>{row.name}</Text>
                    </View>
                    <Text className="text-sm font-bold" style={{ color: colors.error }}>₱{row.amount.toFixed(0)}</Text>
                  </TouchableOpacity>
                ))}
              </Card>
            </>
          )}

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-neutral-800">
              {selectedCategory === 'all' ? 'Recent Expenses' : getExpenseCategoryMeta(selectedCategory, colors, colorMode).label}
            </Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.push('/expenses/all')}>
                <Text className="text-sm font-medium text-primary-600">See all</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center bg-primary-600 px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/expenses/new')}>
                <Ionicons name="add-outline" size={18} color={colors.white} />
                <Text className="text-sm text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {recentExpenses.map((expense) => (
            <TouchableOpacity key={expense.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/expenses/edit', params: { id: expense.id } })}>
              <ExpenseItem expense={expense} />
            </TouchableOpacity>
          ))}

          {recentExpenses.length === 0 && <EmptyState icon="wallet-outline" title="No expenses found" subtitle="No expenses in this range" />}
        </>
      ) : (
        <>
          <Card className={`mt-4 mb-4 items-center ${colorMode === 'uniform' ? 'border border-neutral-300' : 'bg-success'}`}>
            <Text className={`text-sm font-medium ${colorMode === 'uniform' ? 'text-neutral-600' : 'text-white'}`}>Total Income · {range.label}</Text>
            <Text className="text-3xl font-bold mt-1" style={{ color: colorMode === 'uniform' ? colors.success : colors.white }}>₱{totalInc.toFixed(2)}</Text>
            <Text className={`text-sm mt-1 ${colorMode === 'uniform' ? 'text-neutral-400' : 'text-white'}`}>{filteredIncome.length} entries · Net: {net >= 0 ? '+' : ''}₱{net.toFixed(2)}</Text>
          </Card>

          <Card className="mb-4">
            <MiniBarChart data={trendData} title="Income trend" />
          </Card>

          {topEarners.length > 0 && (
            <>
              <SectionHeader title="Top earners" />
              <Card className="mb-5 p-0">
                {topEarners.map((row, index) => (
                  <TouchableOpacity
                    key={row.id}
                    className={`flex-row items-center justify-between px-4 py-3 ${index < topEarners.length - 1 ? 'border-b border-neutral-100' : ''}`}
                    onPress={() => router.push(`/livestock/${row.id}`)}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: colors.neutral[100] }}>
                        <Ionicons name="paw-outline" size={16} color={colors.neutral[500]} />
                      </View>
                      <Text className="text-base text-neutral-700 flex-1" numberOfLines={1}>{row.name}</Text>
                    </View>
                    <Text className="text-sm font-bold" style={{ color: colors.success }}>₱{row.amount.toFixed(0)}</Text>
                  </TouchableOpacity>
                ))}
              </Card>
            </>
          )}

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-neutral-800">Recent Income</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.push('/income/all')}>
                <Text className="text-sm font-medium text-primary-600">See all</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center bg-success px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/income/form')}>
                <Ionicons name="add-outline" size={18} color={colors.white} />
                <Text className="text-sm text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {recentIncome.map((inc) => (
            <TouchableOpacity key={inc.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/income/form', params: { id: inc.id } })}>
              <IncomeItem income={inc} />
            </TouchableOpacity>
          ))}

          {recentIncome.length === 0 && <EmptyState icon="trending-up-outline" title="No income yet" subtitle="Record a sale or other farm income" />}
        </>
      )}
    </Screen>
  );
}