import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { StockTransactionItem } from '../../features/inventory/components/StockTransactionItem';
import * as inventoryService from '../../features/inventory/services/inventoryService';
import { InventoryItem, StockTransaction } from '../../features/inventory/types';
import { UNIT_LABELS, isLowStock } from '../../features/inventory/inventoryMeta';
import { formatQuantity } from '../../lib/utils/format';
import { AnimalType } from '../../features/animalTypes/types';
import { getAll as getAllTypes } from '../../features/animalTypes/services/animalTypeService';
import { getAll as getAllLivestock } from '../../features/livestock/services/livestockService';
import { Livestock } from '../../features/livestock/types';
import { useTheme } from '../../lib/theme/ThemeContext';

export default function InventoryDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [i, tx, t, ls] = await Promise.all([
        inventoryService.getById(id as string),
        inventoryService.getTransactions(id as string),
        getAllTypes(),
        getAllLivestock(),
      ]);
      if (!i) setNotFound(true);
      else {
        setItem(i);
        setNotFound(false);
      }
      setTransactions(tx);
      setTypes(t);
      setLivestock(ls);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center py-20">
        <ActivityIndicator color={colors.primary[600]} />
      </View>
    );
  }

  if (notFound || !item) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-lg text-neutral-500">Feed item not found</Text>
      </View>
    );
  }

  const typeLabel =
    item.animalTypeIds.length === 0
      ? 'All animal types'
      : item.animalTypeIds.map((tid) => types.find((t) => t.id === tid)?.name ?? tid).join(', ');
  const low = isLowStock(item.quantity);
  const nameById: Record<string, string> = {};
  for (const l of livestock) nameById[l.id] = l.name;

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      <View className="flex-row flex-wrap gap-2 mb-4">
        <Badge label={typeLabel.toUpperCase()} color={colors.neutral[100]} textColor={colors.neutral[600]} size="md" />
        {low ? <Badge label={item.quantity <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'} color={colors.error + '18'} textColor={colors.error} size="md" /> : null}
      </View>

      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-lg bg-primary-600"
          onPress={() => router.push({ pathname: '/inventory/restock', params: { id: item.id } })}
          accessibilityRole="button"
          accessibilityLabel={`Restock ${item.name}`}
        >
          <Ionicons name="add-outline" size={16} color={colors.onPrimary} />
          <Text className="text-xs font-semibold text-onPrimary">Restock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-lg border border-border bg-card"
          onPress={() => router.push({ pathname: '/inventory/adjust', params: { id: item.id } })}
          accessibilityRole="button"
          accessibilityLabel={`Adjust stock for ${item.name}`}
        >
          <Ionicons name="swap-horizontal-outline" size={16} color={colors.primary[600]} />
          <Text className="text-xs font-semibold" style={{ color: colors.primary[600] }}>Adjust</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-lg border border-border bg-card"
          onPress={() => router.push({ pathname: '/inventory/form', params: { id: item.id } })}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${item.name}`}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary[600]} />
          <Text className="text-xs font-semibold" style={{ color: colors.primary[600] }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Card className="mb-5">
        <Text className="text-2xl font-bold text-neutral-900 mb-3">{item.name}</Text>
        <View className="gap-3">
          {[
            { icon: 'cube-outline', label: 'On hand', value: `${formatQuantity(item.quantity)} ${UNIT_LABELS[item.unit]}` },
            { icon: 'pricetag-outline', label: 'Unit cost', value: `₱${item.unitCost.toFixed(2)} / ${UNIT_LABELS[item.unit]}` },
            { icon: 'cash-outline', label: 'Stock value', value: `₱${(item.quantity * item.unitCost).toFixed(2)}` },
            { icon: 'paw-outline', label: 'Suitable for', value: typeLabel },
          ].map((row) => (
            <View key={row.label} className="flex-row items-center gap-3">
              <Ionicons name={row.icon as any} size={16} color={colors.neutral[500]} />
              <Text className="text-sm text-neutral-500 w-24">{row.label}</Text>
              <Text className="text-sm font-semibold text-neutral-800 flex-1">{row.value}</Text>
            </View>
          ))}
        </View>
        {item.notes ? (
          <View className="mt-4 pt-4 border-t border-neutral-100">
            <Text className="text-sm font-semibold text-neutral-600 mb-2">Notes</Text>
            <Text className="text-base text-neutral-700">{item.notes}</Text>
          </View>
        ) : null}
      </Card>

      <SectionHeader title="Stock History" />
      {transactions.length > 0 ? (
        transactions.map((tx) => (
          <StockTransactionItem
            key={tx.id}
            transaction={tx}
            item={item}
            livestockName={tx.livestockId ? nameById[tx.livestockId] : undefined}
          />
        ))
      ) : (
        <EmptyState icon="time-outline" title="No stock movements yet" subtitle="Restock this feed to start the history" />
      )}

    </ScrollView>
  );
}
