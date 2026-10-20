import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { RangeSelector } from '../../components/ui/RangeSelector';
import { getAll as getAllLivestock } from '../../features/livestock/services/livestockService';
import { getAll as getAllIncome } from '../../features/income/services/incomeService';
import { getAll as getAllExpenses } from '../../features/expenses/services/expenseService';
import { getAll as getAllTypes } from '../../features/animalTypes/services/animalTypeService';
import { getCategoryLabel } from '../../features/livestock/livestockMeta';
import { Livestock } from '../../features/livestock/types';
import { Income } from '../../features/income/types';
import { Expense } from '../../features/expenses/types';
import { AnimalType } from '../../features/animalTypes/types';
import { useTheme } from '../../lib/theme/ThemeContext';
import { DatePreset, resolveRange, inRange } from '../../lib/utils/dateRange';

interface LedgerRow {
  id: string;
  date: string;
  description: string;
  entityName?: string;
  kind: 'income' | 'expense';
  amount: number;
}

export default function TypeLedgerScreen() {
  const { colors } = useTheme();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [preset, setPreset] = useState<DatePreset>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [ls, inc, exp, t] = await Promise.all([getAllLivestock(), getAllIncome(), getAllExpenses(), getAllTypes()]);
      setLivestock(ls);
      setIncome(inc);
      setExpenses(exp);
      setTypes(t);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const typeLabel = getCategoryLabel(category ?? '', types);
  const entities = livestock.filter((l) => l.category === category);
  const entityIds = new Set(entities.map((l) => l.id));
  const nameById: Record<string, string> = {};
  for (const l of livestock) nameById[l.id] = l.name;

  const range = resolveRange(preset, from, to);
  const rows: LedgerRow[] = [];

  for (const inc of income) {
    if (!inRange(inc.date, range.from, range.to)) continue;
    if (inc.livestockId && entityIds.has(inc.livestockId)) {
      rows.push({ id: `inc-${inc.id}`, date: inc.date, description: inc.description, entityName: nameById[inc.livestockId], kind: 'income', amount: inc.amount });
    }
  }
  for (const exp of expenses) {
    if (!inRange(exp.date, range.from, range.to)) continue;
    let attributed = 0;
    if (exp.allocations && exp.allocations.length > 0) {
      for (const a of exp.allocations) if (entityIds.has(a.livestockId)) attributed += a.amount;
    } else if (exp.livestockId && entityIds.has(exp.livestockId)) {
      attributed = exp.amount;
    }
    if (attributed > 0) {
      rows.push({ id: `exp-${exp.id}`, date: exp.date, description: exp.description, entityName: exp.livestockId ? nameById[exp.livestockId] : undefined, kind: 'expense', amount: attributed });
    }
  }
  rows.sort((a, b) => b.date.localeCompare(a.date));

  const totalIncome = rows.filter((r) => r.kind === 'income').reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows.filter((r) => r.kind === 'expense').reduce((s, r) => s + r.amount, 0);
  const net = totalIncome - totalExpense;

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
    <Screen>
      <Text className="text-lg font-semibold text-neutral-800 mb-1">{typeLabel}</Text>
      <Text className="text-sm text-neutral-500 mb-4">{entities.length} records · {range.label}</Text>

      <RangeSelector
        preset={preset}
        onPresetChange={setPreset}
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
      />

      <Card className="mt-4 mb-4 border border-neutral-300">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-neutral-600">Income</Text>
          <Text className="text-base font-bold" style={{ color: colors.success }}>₱{totalIncome.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-neutral-600">Expenses</Text>
          <Text className="text-base font-bold" style={{ color: colors.error }}>₱{totalExpense.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between items-center pt-2 border-t border-neutral-200">
          <Text className="text-base font-semibold text-neutral-800">Net Profit</Text>
          <Text className="text-lg font-bold" style={{ color: net >= 0 ? colors.success : colors.error }}>
            {net >= 0 ? '+' : ''}₱{net.toFixed(2)}
          </Text>
        </View>
      </Card>

      {rows.length === 0 ? (
        <EmptyState icon="list-outline" title="No transactions" subtitle="No income or expenses for this type in the selected range" />
      ) : (
        <Card className="p-0 mb-6">
          {rows.map((row, index) => {
            const isIncome = row.kind === 'income';
            const color = isIncome ? colors.success : colors.error;
            return (
              <View
                key={row.id}
                className={`flex-row items-center px-4 py-3 ${index < rows.length - 1 ? 'border-b border-neutral-100' : ''}`}
              >
                <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: colors.neutral[100] }}>
                  <Ionicons name={isIncome ? 'add-outline' : 'remove-outline'} size={16} color={color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-neutral-800" numberOfLines={1}>{row.description}</Text>
                  <Text className="text-xs text-neutral-400 mt-0.5" numberOfLines={1}>
                    {row.entityName ? `${row.entityName} · ` : ''}{row.date}
                  </Text>
                </View>
                <Text className="text-base font-semibold ml-3" style={{ color }}>
                  {isIncome ? '+' : '−'}₱{row.amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}