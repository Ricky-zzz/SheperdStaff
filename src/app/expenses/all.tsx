import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpenseItem } from '../../features/expenses/components/ExpenseItem';
import { getAll } from '../../features/expenses/services/expenseService';
import { Expense } from '../../features/expenses/types';
import { useTheme } from '../../lib/theme/ThemeContext';

export default function AllExpensesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setExpenses(await getAll());
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setExpenses(await getAll());
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

  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-neutral-800">{sorted.length} expenses</Text>
        <TouchableOpacity className="flex-row items-center bg-primary-600 px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/expenses/new')}>
          <Ionicons name="add-outline" size={18} color={colors.white} />
          <Text className="text-sm text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      {sorted.map((expense) => (
        <TouchableOpacity key={expense.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/expenses/edit', params: { id: expense.id } })}>
          <ExpenseItem expense={expense} />
        </TouchableOpacity>
      ))}

      {sorted.length === 0 && <EmptyState icon="wallet-outline" title="No expenses yet" subtitle="Add your first expense" />}
    </Screen>
  );
}