import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpenseItem } from '../../features/expenses/components/ExpenseItem';
import { EXPENSE_CATEGORY_META } from '../../features/expenses/expenseMeta';
import { getAll, total, totalByCategory } from '../../features/expenses/services/expenseService';
import { Expense, ExpenseCategory } from '../../features/expenses/types';
import { Colors } from '../../lib/theme/colors';

export default function ExpensesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, t, byCat] = await Promise.all([getAll(), total(), totalByCategory()]);
      setAllExpenses(all);
      setTotalExpenses(t);
      setExpensesByCategory(byCat);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredExpenses = selectedCategory === 'all' ? allExpenses : allExpenses.filter((e) => e.category === selectedCategory);
  const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color={Colors.primary[600]} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card className="bg-primary-700 mb-5 items-center">
        <Text className="text-sm text-primary-200 font-medium">Total Expenses</Text>
        <Text className="text-3xl font-bold text-white mt-1">${totalExpenses.toFixed(2)}</Text>
        <Text className="text-sm text-primary-300 mt-1">{allExpenses.length} transactions</Text>
      </Card>

      <View className="flex-row flex-wrap gap-2 mb-5">
        {(Object.entries(EXPENSE_CATEGORY_META) as [ExpenseCategory, (typeof EXPENSE_CATEGORY_META)[ExpenseCategory]][]).map(([key, info]) => {
          const amount = expensesByCategory[key] || 0;
          const isSelected = selectedCategory === key;
          return (
            <TouchableOpacity
              key={key}
              className={`w-[31%] bg-white rounded-xl p-3 items-center shadow-sm ${isSelected ? 'border-2 border-primary-500' : ''}`}
              onPress={() => setSelectedCategory(isSelected ? 'all' : key)}
            >
              <View className="w-9 h-9 rounded-lg justify-center items-center mb-2" style={{ backgroundColor: info.color + '15' }}>
                <Ionicons name={info.icon} size={18} color={info.color} />
              </View>
              <Text className="text-xs text-neutral-600 font-medium mb-0.5">{info.label}</Text>
              <Text className="text-sm font-bold" style={{ color: info.color }}>${amount.toFixed(0)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-neutral-800">
          {selectedCategory === 'all' ? 'All Expenses' : EXPENSE_CATEGORY_META[selectedCategory].label}
        </Text>
        <TouchableOpacity className="flex-row items-center bg-primary-600 px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/expenses/new')}>
          <Ionicons name="add" size={18} color={Colors.white} />
          <Text className="text-sm text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      {sortedExpenses.map((expense) => (
        <TouchableOpacity key={expense.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/expenses/edit', params: { id: expense.id } })}>
          <ExpenseItem expense={expense} />
        </TouchableOpacity>
      ))}

      {sortedExpenses.length === 0 && <EmptyState icon="wallet-outline" title="No expenses found" subtitle="No expenses in this category" />}
    </Screen>
  );
}
