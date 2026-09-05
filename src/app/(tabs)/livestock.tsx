import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterChip } from '../../components/ui/FilterChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { LivestockCard } from '../../features/livestock/components/LivestockCard';
import { getAll } from '../../features/livestock/services/livestockService';
import { Livestock, LivestockCategory } from '../../features/livestock/types';
import { Colors } from '../../lib/theme/colors';

const FILTER_OPTIONS: { label: string; value: LivestockCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Cattle', value: 'cattle' },
  { label: 'Pigs', value: 'pig' },
  { label: 'Chickens', value: 'chicken' },
  { label: 'Goats', value: 'goat' },
];

export default function LivestockScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<LivestockCategory | 'all'>('all');
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAll();
      setLivestock(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setLivestock(await getAll());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredLivestock = livestock.filter((animal) => {
    const matchesSearch = search === '' || animal.name.toLowerCase().includes(search.toLowerCase()) || animal.breed?.toLowerCase().includes(search.toLowerCase()) || animal.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || animal.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row gap-2 mb-4">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search livestock..." />
        <TouchableOpacity className="w-11 h-11 rounded-lg bg-primary-600 justify-center items-center shadow-sm" onPress={() => router.push('/livestock/new')}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2 mb-4 flex-wrap">
        {FILTER_OPTIONS.map((filter) => (
          <FilterChip key={filter.value} label={filter.label} selected={selectedFilter === filter.value} onPress={() => setSelectedFilter(filter.value)} />
        ))}
      </View>

      <Text className="text-sm text-neutral-500 mb-3">
        {filteredLivestock.length} {filteredLivestock.length === 1 ? 'record' : 'records'} found
      </Text>

      {loading ? (
        <View className="py-10 items-center">
          <ActivityIndicator color={Colors.primary[600]} />
        </View>
      ) : (
        <>
          {filteredLivestock.map((animal) => (
            <LivestockCard key={animal.id} livestock={animal} onPress={() => router.push(`/livestock/${animal.id}`)} />
          ))}
          {filteredLivestock.length === 0 && <EmptyState icon="search" title="No livestock found" subtitle="Try adjusting your search or filters" />}
        </>
      )}
    </Screen>
  );
}
