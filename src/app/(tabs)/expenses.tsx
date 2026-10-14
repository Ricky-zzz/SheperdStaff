import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpenseItem } from '../../features/expenses/components/ExpenseItem';
import { IncomeItem } from '../../features/income/components/IncomeItem';
import { getExpenseCategoryMeta } from '../../features/expenses/expenseMeta';
import { getAll, total, totalByCategory } from '../../features/expenses/services/expenseService';
import { getAll as getAllIncome, total as totalIncome } from '../../features/income/services/incomeService';
import { Expense, ExpenseCategory } from '../../features/expenses/types';
import { Income } from '../../features/income/types';
import { useTheme } from '../../lib/theme/ThemeContext';

const CATEGORIES: ExpenseCategory[] = ['feed', 'medicine', 'supplies', 'maintenance', 'labor', 'other'];

type Segment = 'expenses' | 'income';

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('expenses');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});
  const [allIncome, setAllIncome] = useState<Income[]>([]);
  const [totalInc, setTotalInc] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, t, byCat, inc, incTotal] = await Promise.all([
        getAll(),
        total(),
        totalByCategory(),
        getAllIncome(),
        totalIncome(),
      ]);
      setAllExpenses(all);
      setTotalExpenses(t);
      setExpensesByCategory(byCat);
      setAllIncome(inc);
      setTotalInc(incTotal);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [all, t, byCat, inc, incTotal] = await Promise.all([
        getAll(),
        total(),
        totalByCategory(),
        getAllIncome(),
        totalIncome(),
      ]);
      setAllExpenses(all);
      setTotalExpenses(t);
      setExpensesByCategory(byCat);
      setAllIncome(inc);
      setTotalInc(incTotal);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      </Screen>
    );
  }

  const filteredExpenses = selectedCategory === 'all' ? allExpenses : allExpenses.filter((e) => e.category === selectedCategory);
  const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedIncome = [...allIncome].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const net = totalInc - totalExpenses;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {/* Segment toggle */}
      <View className="flex-row gap-2 mb-5">
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

      {segment === 'expenses' ? (
        <>
          <Card className="bg-primary-700 mb-5 items-center">
            <Text className="text-sm text-primary-200 font-medium">Total Expenses</Text>
            <Text className="text-3xl font-bold text-white mt-1">₱{totalExpenses.toFixed(2)}</Text>
            <Text className="text-sm text-primary-300 mt-1">{allExpenses.length} transactions</Text>
          </Card>

          <View className="flex-row flex-wrap gap-2 mb-5">
            {CATEGORIES.map((key) => {
              const info = getExpenseCategoryMeta(key, colors);
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

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-neutral-800">
              {selectedCategory === 'all' ? 'All Expenses' : getExpenseCategoryMeta(selectedCategory, colors).label}
            </Text>
            <TouchableOpacity className="flex-row items-center bg-primary-600 px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/expenses/new')}>
              <Ionicons name="add" size={18} color={colors.white} />
              <Text className="text-sm text-white font-semibold">Add</Text>
            </TouchableOpacity>
          </View>

          {sortedExpenses.map((expense) => (
            <TouchableOpacity key={expense.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/expenses/edit', params: { id: expense.id } })}>
              <ExpenseItem expense={expense} />
            </TouchableOpacity>
          ))}

          {sortedExpenses.length === 0 && <EmptyState icon="wallet-outline" title="No expenses found" subtitle="No expenses in this category" />}
        </>
      ) : (
        <>
          <Card className="bg-success mb-5 items-center">
            <Text className="text-sm text-white font-medium">Total Income</Text>
            <Text className="text-3xl font-bold text-white mt-1">₱{totalInc.toFixed(2)}</Text>
            <Text className="text-sm text-white mt-1">{allIncome.length} entries · Net: {net >= 0 ? '+' : ''}₱{net.toFixed(2)}</Text>
          </Card>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-neutral-800">All Income</Text>
            <TouchableOpacity className="flex-row items-center bg-success px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/income/form')}>
              <Ionicons name="add" size={18} color={colors.white} />
              <Text className="text-sm text-white font-semibold">Add</Text>
            </TouchableOpacity>
          </View>

          {sortedIncome.map((inc) => (
            <TouchableOpacity key={inc.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/income/form', params: { id: inc.id } })}>
              <IncomeItem income={inc} />
            </TouchableOpacity>
          ))}

          {sortedIncome.length === 0 && <EmptyState icon="trending-up-outline" title="No income yet" subtitle="Record a sale or other farm income" />}
        </>
      )}
    </Screen>
  );
}