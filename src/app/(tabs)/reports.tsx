import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { FilterChip } from '../../components/ui/FilterChip';
import { DateInput } from '../../components/ui/DateInput';
import { SkeletonList } from '../../components/ui/Skeleton';
import {
  getAll as getAllLivestock,
  count as countLivestock,
  countByCategory as livestockByCategory,
  countByStatus,
} from '../../features/livestock/services/livestockService';
import { getAll as getAllExpenses } from '../../features/expenses/services/expenseService';
import { getAll as getAllIncome } from '../../features/income/services/incomeService';
import { getExpenseCategoryMeta } from '../../features/expenses/expenseMeta';
import { shareReport } from '../../features/reports/services/reportPdf';
import { Livestock } from '../../features/livestock/types';
import { Expense } from '../../features/expenses/types';
import { Income } from '../../features/income/types';
import { AnimalType } from '../../features/animalTypes/types';
import { getAll as getAllTypes } from '../../features/animalTypes/services/animalTypeService';
import { getCategoryLabel } from '../../features/livestock/livestockMeta';
import { useTheme } from '../../lib/theme/ThemeContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { toUserMessage } from '../../lib/utils/errors';

type Preset = '7d' | '30d' | 'month' | 'all' | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All time' },
  { key: 'custom', label: 'Custom' },
];

function getStatusDotColor(status: string, colors: ReturnType<typeof useTheme>['colors']): string {
  switch (status) {
    case 'growing': return colors.primary[500];
    case 'breeding': return colors.category.pig;
    case 'active': return colors.success;
    case 'for_sale': return colors.warning;
    case 'sold': return colors.category.duck;
    case 'deceased': return colors.error;
    default: return colors.neutral[500];
  }
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

function monthStartISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function ReportsScreen() {
  const { colors, colorMode } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showAllEntities, setShowAllEntities] = useState(false);
  const [preset, setPreset] = useState<Preset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [allLivestock, setAllLivestock] = useState<Livestock[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [allIncome, setAllIncome] = useState<Income[]>([]);
  const [livestockByCategoryMap, setLivestockByCategoryMap] = useState<Record<string, number>>({});
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalLivestock, setTotalLivestock] = useState(0);
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [lByCat, sCounts, tL, allL, allE, allI, t] = await Promise.all([
        livestockByCategory(),
        countByStatus(),
        countLivestock(),
        getAllLivestock(),
        getAllExpenses(),
        getAllIncome(),
        getAllTypes(),
      ]);
      setLivestockByCategoryMap(lByCat);
      setStatusCounts(sCounts);
      setTotalLivestock(tL);
      setAllLivestock(allL);
      setAllExpenses(allE);
      setAllIncome(allI);
      setTypes(t);
    } catch (err) {
      setLoadError(toUserMessage(err, 'Could not load report.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [lByCat, sCounts, tL, allL, allE, allI, t] = await Promise.all([
        livestockByCategory(),
        countByStatus(),
        countLivestock(),
        getAllLivestock(),
        getAllExpenses(),
        getAllIncome(),
        getAllTypes(),
      ]);
      setLivestockByCategoryMap(lByCat);
      setStatusCounts(sCounts);
      setTotalLivestock(tL);
      setAllLivestock(allL);
      setAllExpenses(allE);
      setAllIncome(allI);
      setTypes(t);
      setLoadError(null);
    } catch (err) {
      setLoadError(toUserMessage(err, 'Could not refresh report.'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const categoryColors: Record<string, string> = {};
  for (const t of types) categoryColors[t.id] = t.color;

  const today = toISODate(new Date());

  const range = useMemo(() => {
    switch (preset) {
      case '7d': return { from: daysAgoISO(7), to: today, label: 'Last 7 days' };
      case '30d': return { from: daysAgoISO(30), to: today, label: 'Last 30 days' };
      case 'month': return { from: monthStartISO(), to: today, label: 'This month' };
      case 'all': return { from: '', to: '', label: 'All time' };
      case 'custom': {
        const label = customFrom || customTo ? `${customFrom || '…'} → ${customTo || today}` : 'Custom range';
        return { from: customFrom, to: customTo || today, label };
      }
    }
  }, [preset, customFrom, customTo, today]);

  const inRange = (date: string) => (!range.from || date >= range.from) && (!range.to || date <= range.to);

  const filteredExpenses = allExpenses.filter((e) => inRange(e.date));
  const filteredIncome = allIncome.filter((i) => inRange(i.date));

  const totalSpent = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalEarned = filteredIncome.reduce((s, i) => s + i.amount, 0);
  const txCount = filteredExpenses.length + filteredIncome.length;

  const feedUsedByEntity: Record<string, number> = {};
  let totalFeedUsed = 0;
  for (const l of allLivestock) {
    for (const f of l.feedings) {
      const cost = f.cost ?? 0;
      if (cost <= 0 || !inRange(f.date)) continue;
      feedUsedByEntity[l.id] = (feedUsedByEntity[l.id] || 0) + cost;
      totalFeedUsed += cost;
    }
  }

  // Cash basis: feed purchases already sit inside expenses, so profit is
  // income − expenses. Feed used is reported separately, not subtracted again
  // (that would double-count every kilo of feed purchased and consumed).
  const netProfit = totalEarned - totalSpent;

  const expensesByCategoryMap = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const expenseByEntity: Record<string, number> = {};
  for (const e of filteredExpenses) {
    // Feed purchases stay at farm level (cash expenses). An animal's feed cost
    // is what it actually consumed, so it is never counted twice.
    if (e.category === 'feed') continue;
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

  const entityRows = allLivestock
    .map((l) => {
      const income = incomeByEntity[l.id] || 0;
      const feed = feedUsedByEntity[l.id] || 0;
      const expenses = (expenseByEntity[l.id] || 0) + feed;
      return { id: l.id, name: l.name, category: l.category, categoryLabel: getCategoryLabel(l.category, types), income, expenses, feed, profit: income - expenses };
    })
    .sort((a, b) => b.profit - a.profit);

  const typeMap: Record<string, { income: number; expenses: number }> = {};
  for (const r of entityRows) {
    const t = typeMap[r.category] || { income: 0, expenses: 0 };
    t.income += r.income;
    t.expenses += r.expenses;
    typeMap[r.category] = t;
  }
  const typeRows = Object.entries(typeMap)
    .map(([key, v]) => ({ key, label: getCategoryLabel(key, types), income: v.income, expenses: v.expenses, profit: v.income - v.expenses }))
    .sort((a, b) => b.profit - a.profit);

  const expenseRows = Object.entries(expensesByCategoryMap)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({ category, amount, label: getExpenseCategoryMeta(category as Expense['category'], colors, colorMode).label }));

  const maxLivestock = Math.max(1, ...Object.values(livestockByCategoryMap));
  const maxExpense = Math.max(1, ...Object.values(expensesByCategoryMap));
  const maxTypeProfit = Math.max(1, ...typeRows.map((r) => Math.abs(r.profit)));
  const visibleEntities = showAllEntities ? entityRows : entityRows.slice(0, 5);

  const handleShare = async () => {
    setSharing(true);
    try {
      const ok = await shareReport({
        farmName: profile?.name ? `${profile.name}'s Farm` : 'My Farm',
        rangeLabel: range.label,
        generatedAt: new Date().toLocaleString(),
        totals: { animals: totalLivestock, records: allLivestock.length, income: totalEarned, expenses: totalSpent, feedUsed: totalFeedUsed, profit: netProfit, transactions: txCount },
        byType: typeRows.map((r) => ({ label: r.label, income: r.income, expenses: r.expenses, profit: r.profit })),
        byEntity: entityRows.map((r) => ({ name: r.name, categoryLabel: r.categoryLabel, income: r.income, expenses: r.expenses, profit: r.profit })),
        expensesByCategory: expenseRows.map((r) => ({ label: r.label, amount: r.amount })),
      });
      if (!ok) Alert.alert('Sharing unavailable', 'This device cannot open the share sheet.');
    } catch {
      Alert.alert('Failed', 'Could not generate the report.');
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={loadError} onRetry={load}>
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-lg font-semibold text-neutral-800">Farm Report</Text>
          <Text className="text-xs text-neutral-500 mt-0.5">{range.label}</Text>
        </View>
        <TouchableOpacity
          className="min-h-11 flex-row items-center justify-center gap-1 bg-primary-600 px-3 py-2 rounded-lg"
          onPress={handleShare}
          disabled={sharing}
          accessibilityRole="button"
          accessibilityLabel="Share report as PDF"
        >
          {sharing ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Ionicons name="share-outline" size={16} color={colors.onPrimary} />}
          <Text className="text-sm text-onPrimary font-semibold">Share</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-2 mb-3">
        {PRESETS.map((p) => (
          <FilterChip key={p.key} label={p.label} selected={preset === p.key} onPress={() => setPreset(p.key)} />
        ))}
      </View>

      {preset === 'custom' && (
        <View className="mb-3">
          <Text className="text-sm font-medium text-neutral-600 mb-1">From</Text>
          <DateInput value={customFrom} onChange={setCustomFrom} />
          <Text className="text-sm font-medium text-neutral-600 mb-1">To</Text>
          <DateInput value={customTo} onChange={setCustomTo} />
        </View>
      )}

      <View className="flex-row gap-3 mb-3">
        <Card className="flex-1 items-center py-5"><Ionicons name="paw-outline" size={24} color={colors.primary[600]} /><Text className="text-2xl font-bold text-neutral-800 mt-2">{totalLivestock}</Text><Text className="text-sm text-neutral-500 mt-1">Total Animals</Text></Card>
        <Card className="flex-1 items-center py-5"><Ionicons name="wallet-outline" size={24} color={colors.earth[600]} /><Text className="text-2xl font-bold text-neutral-800 mt-2">₱{totalSpent.toFixed(0)}</Text><Text className="text-sm text-neutral-500 mt-1">Expenses</Text></Card>
      </View>
      <View className="flex-row gap-3 mb-3">
        <Card className="flex-1 items-center py-5"><Ionicons name="trending-up-outline" size={24} color={colors.success} /><Text className="text-2xl font-bold mt-2" style={{ color: colors.success }}>₱{totalEarned.toFixed(0)}</Text><Text className="text-sm text-neutral-500 mt-1">Income</Text></Card>
        <Card className="flex-1 items-center py-5">
          <Ionicons name={netProfit >= 0 ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'} size={24} color={netProfit >= 0 ? colors.success : colors.error} />
          <Text className="text-2xl font-bold mt-2" style={{ color: netProfit >= 0 ? colors.success : colors.error }}>
            {netProfit >= 0 ? '+' : ''}₱{netProfit.toFixed(0)}
          </Text>
          <Text className="text-sm text-neutral-500 mt-1">Net Profit</Text>
        </Card>
      </View>
      <Text className="text-xs text-neutral-500 -mt-1 mb-3 text-center">
        Cash profit = Income − Expenses
        {totalFeedUsed > 0 ? ` · Feed used ₱${totalFeedUsed.toFixed(0)} (counted inside expenses when purchased)` : ''}
        {' · '}{txCount} transactions · {allLivestock.length} records
      </Text>

      <SectionHeader title="Profit by Animal Type" />
      <Card className="mb-4">
        {typeRows.map((row) => (
          <TouchableOpacity
            key={row.key}
            className="mb-3"
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/reports/type', params: { category: row.key } })}
            accessibilityRole="button"
            accessibilityLabel={`${row.label} profit ${row.profit >= 0 ? 'plus' : 'minus'} ${Math.abs(row.profit).toFixed(0)} pesos`}
          >
            <View className="flex-row items-center mb-1.5">
              <Text className="flex-1 text-sm text-neutral-600 font-medium mr-2" numberOfLines={1}>{row.label}</Text>
              <Text className="text-sm font-semibold" style={{ color: row.profit >= 0 ? colors.success : colors.error }}>
                {row.profit >= 0 ? '+' : ''}₱{row.profit.toFixed(0)}
              </Text>
              <View className="ml-1">
                <Ionicons name="chevron-forward-outline" size={14} color={colors.neutral[500]} />
              </View>
            </View>
            <View className="h-5 bg-neutral-100 rounded-sm overflow-hidden">
              <View className="h-full rounded-sm" style={{ width: `${(Math.abs(row.profit) / maxTypeProfit) * 100}%`, backgroundColor: row.profit >= 0 ? colors.success : colors.error }} />
            </View>
          </TouchableOpacity>
        ))}
        {typeRows.length === 0 && <Text className="text-sm text-neutral-500 py-2">No data in this range</Text>}
      </Card>

      <SectionHeader title="Profit by Animal / Group" />
      <Card className="mb-2 p-0">
        {visibleEntities.map((row, index) => (
          <TouchableOpacity
            key={row.id}
            className={`px-4 py-3 ${index < visibleEntities.length - 1 ? 'border-b border-neutral-100' : ''}`}
            activeOpacity={0.7}
            onPress={() => router.push(`/livestock/${row.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${row.name}, profit ${row.profit >= 0 ? 'plus' : 'minus'} ${Math.abs(row.profit).toFixed(0)} pesos`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-medium text-neutral-800" numberOfLines={1}>{row.name}</Text>
                <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={1}>
                  {row.categoryLabel} · Income ₱{row.income.toFixed(0)} · Expenses ₱{row.expenses.toFixed(0)}
                  {row.feed > 0 ? ` (feed ₱${row.feed.toFixed(0)})` : ''}
                </Text>
              </View>
              <Text className="text-base font-bold ml-3" style={{ color: row.profit >= 0 ? colors.success : colors.error }}>
                {row.profit >= 0 ? '+' : ''}₱{row.profit.toFixed(0)}
              </Text>
              <Ionicons name="chevron-forward-outline" size={16} color={colors.neutral[500]} />
            </View>
          </TouchableOpacity>
        ))}
        {entityRows.length > 5 && (
          <TouchableOpacity
            className="py-3 items-center border-t border-neutral-100"
            onPress={() => setShowAllEntities((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showAllEntities ? 'Show less' : `View all ${entityRows.length}`}
          >
            <Text className="text-sm font-medium text-primary-600">{showAllEntities ? 'Show less' : `View all (${entityRows.length})`}</Text>
          </TouchableOpacity>
        )}
        {entityRows.length === 0 && <Text className="text-sm text-neutral-500 p-4">No livestock yet</Text>}
      </Card>

      <SectionHeader title="Livestock by Type" />
      <Card className="mb-4">
        {Object.entries(livestockByCategoryMap).map(([category, count]) => (
          <View key={category} className="mb-3">
            <View className="flex-row justify-between mb-1.5">
              <Text className="flex-1 text-sm text-neutral-600 font-medium mr-2" numberOfLines={1}>{getCategoryLabel(category, types)}</Text>
              <Text className="text-sm font-semibold text-neutral-700">{count}</Text>
            </View>
            <View className="h-5 bg-neutral-100 rounded-sm overflow-hidden">
              <View className="h-full rounded-sm" style={{ width: `${(count / maxLivestock) * 100}%`, backgroundColor: colorMode === 'uniform' ? colors.neutral[500] : categoryColors[category] || colors.neutral[500] }} />
            </View>
          </View>
        ))}
      </Card>

      <SectionHeader title="Expenses by Category" />
      <Card className="mb-4">
        {expenseRows.map((row) => (
          <View key={row.category} className="mb-3">
            <View className="flex-row justify-between mb-1.5">
              <Text className="flex-1 text-sm text-neutral-600 font-medium mr-2" numberOfLines={1}>{row.label}</Text>
              <Text className="text-sm font-semibold text-neutral-700">₱{row.amount.toFixed(0)}</Text>
            </View>
            <View className="h-5 bg-neutral-100 rounded-sm overflow-hidden">
              <View className="h-full rounded-sm" style={{ width: `${(row.amount / maxExpense) * 100}%`, backgroundColor: getExpenseCategoryMeta(row.category as Expense['category'], colors, colorMode).color }} />
            </View>
          </View>
        ))}
        {expenseRows.length === 0 && <Text className="text-sm text-neutral-500 py-2">No expenses in this range</Text>}
      </Card>

      <SectionHeader title="Livestock by Status" />
      <Card className="mb-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <View key={status} className="flex-row items-center mb-3">
            <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colorMode === 'uniform' ? colors.neutral[500] : getStatusDotColor(status, colors) }} />
            <View className="flex-1 mr-2">
              <Text className="text-base text-neutral-700 font-medium">{status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}</Text>
              <Text className="text-xs text-neutral-500 mt-0.5">{count} records</Text>
            </View>
            <Text className="text-base font-bold text-neutral-800">{allLivestock.length > 0 ? ((count / allLivestock.length) * 100).toFixed(0) : 0}%</Text>
          </View>
        ))}
      </Card>

    </Screen>
  );
}