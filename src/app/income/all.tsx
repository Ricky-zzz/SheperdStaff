import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { EmptyState } from '../../components/ui/EmptyState';
import { IncomeItem } from '../../features/income/components/IncomeItem';
import { getAll } from '../../features/income/services/incomeService';
import { Income } from '../../features/income/types';
import { useTheme } from '../../lib/theme/ThemeContext';

export default function AllIncomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setIncome(await getAll());
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setIncome(await getAll());
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

  const sorted = [...income].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-neutral-800">{sorted.length} income entries</Text>
        <TouchableOpacity className="flex-row items-center bg-success px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/income/form')}>
          <Ionicons name="add-outline" size={18} color={colors.white} />
          <Text className="text-sm text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      {sorted.map((entry) => (
        <TouchableOpacity key={entry.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/income/form', params: { id: entry.id } })}>
          <IncomeItem income={entry} />
        </TouchableOpacity>
      ))}

      {sorted.length === 0 && <EmptyState icon="trending-up-outline" title="No income yet" subtitle="Record a sale or other farm income" />}
    </Screen>
  );
}