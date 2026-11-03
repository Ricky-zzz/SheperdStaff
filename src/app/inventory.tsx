import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { SearchBar } from '../components/ui/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import { InventoryCard } from '../features/inventory/components/InventoryCard';
import { getAll, totalStockValue } from '../features/inventory/services/inventoryService';
import { InventoryItem } from '../features/inventory/types';
import { AnimalType } from '../features/animalTypes/types';
import { getAll as getAllTypes } from '../features/animalTypes/services/animalTypeService';
import { useTheme } from '../lib/theme/ThemeContext';

export default function InventoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [stockValue, setStockValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, t, value] = await Promise.all([getAll(), getAllTypes(), totalStockValue()]);
      setItems(data);
      setTypes(t);
      setStockValue(value);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [data, t, value] = await Promise.all([getAll(), getAllTypes(), totalStockValue()]);
      setItems(data);
      setTypes(t);
      setStockValue(value);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const query = search.trim().toLowerCase();
  const typeName = (id: string) => types.find((t) => t.id === id)?.name ?? id;
  const filtered = items.filter((item) => {
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.animalTypeIds.some((id) => typeName(id).toLowerCase().includes(query))
    );
  });

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row gap-2 mb-4">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search feed..." />
        <TouchableOpacity
          className="w-11 h-11 rounded-lg bg-primary-600 justify-center items-center shadow-sm"
          onPress={() => router.push('/inventory/form')}
          accessibilityRole="button"
          accessibilityLabel="Add feed item"
        >
          <Ionicons name="add-outline" size={22} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <Card className="mb-4 flex-row items-center">
        <View className="flex-1">
          <Text className="text-sm text-neutral-500">{items.length} {items.length === 1 ? 'feed item' : 'feed items'}</Text>
          <Text className="text-2xl font-bold text-neutral-800 mt-1">₱{stockValue.toFixed(2)}</Text>
          <Text className="text-xs text-neutral-500 mt-0.5">Current stock value</Text>
        </View>
        <View className="w-12 h-12 rounded-lg items-center justify-center" style={{ backgroundColor: colors.earth[100] }}>
          <Ionicons name="cube-outline" size={24} color={colors.earth[600]} />
        </View>
      </Card>

      {loading ? (
        <View className="py-10 items-center">
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      ) : (
        <>
          {filtered.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              types={types}
              onPress={() => router.push(`/inventory/${item.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon="cube-outline"
              title={items.length === 0 ? 'No feed in inventory' : 'No matching feed'}
              subtitle={items.length === 0 ? 'Add feed items to track stock and feeding costs' : 'Try a different search'}
            />
          )}
        </>
      )}
    </Screen>
  );
}
