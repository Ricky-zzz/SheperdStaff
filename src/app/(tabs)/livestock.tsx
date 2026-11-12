import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/ui/Screen';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterChip } from '../../components/ui/FilterChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { LivestockCard } from '../../features/livestock/components/LivestockCard';
import { getAll, updateStatus, remove, getDeletionBlockers, describeDeletionBlockers } from '../../features/livestock/services/livestockService';
import { Livestock, LivestockCategory } from '../../features/livestock/types';
import { AnimalType } from '../../features/animalTypes/types';
import { getAll as getAllTypes } from '../../features/animalTypes/services/animalTypeService';
import { log as logActivity, safeLog } from '../../features/activity/services/activityService';
import { toUserMessage } from '../../lib/utils/errors';
import { useTheme } from '../../lib/theme/ThemeContext';

export default function LivestockScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<LivestockCategory | 'all'>('all');
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuAnimal, setMenuAnimal] = useState<Livestock | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, t] = await Promise.all([getAll(), getAllTypes()]);
      setLivestock(data);
      setTypes(t);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [data, t] = await Promise.all([getAll(), getAllTypes()]);
      setLivestock(data);
      setTypes(t);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filterOptions: { label: string; value: LivestockCategory | 'all' }[] = [
    { label: 'All', value: 'all' },
    ...types.map((t) => ({ label: t.name, value: t.id })),
  ];

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredLivestock = livestock.filter((animal) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      animal.name.toLowerCase().includes(q) ||
      animal.breed?.toLowerCase().includes(q) ||
      animal.location.toLowerCase().includes(q) ||
      (animal.code ?? '').toLowerCase().includes(q);
    const matchesFilter = selectedFilter === 'all' || animal.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleMarkSold = async () => {
    if (!menuAnimal) return;
    try {
      await updateStatus(menuAnimal.id, 'sold');
      await logActivity({
        id: `act-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'status_change',
        description: `${menuAnimal.name} status changed to Sold`,
        livestockId: menuAnimal.id,
      });
      setMenuAnimal(null);
      await load();
    } catch (err) {
      Alert.alert('Could not update', toUserMessage(err, 'Could not update the status.'));
    }
  };

  const handleDeleteAnimal = async () => {
    if (!menuAnimal) return;
    const name = menuAnimal.name;
    const id = menuAnimal.id;
    try {
      const blockers = await getDeletionBlockers(id);
      if (blockers.total > 0) {
        Alert.alert(
          `Cannot delete ${name}`,
          `This animal already has ${describeDeletionBlockers(blockers)} recorded on the farm.\n\nUndo its feedings or delete/unlink those records first — removing it now would leave them without an owner.`
        );
        return;
      }
      Alert.alert(
        'Delete livestock?',
        `${name} will be removed. Nothing is recorded against it yet, so no history is left behind.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await remove(id);
                // The animal is already gone, so this log must not reference it —
                // a stale foreign key would fail the delete's error path.
                await safeLog({
                  id: `act-${Date.now()}`,
                  date: new Date().toISOString().slice(0, 10),
                  type: 'livestock_deleted',
                  description: `${name} deleted`,
                });
                setMenuAnimal(null);
                await load();
              } catch (err) {
                Alert.alert('Could not delete', toUserMessage(err, 'Could not delete this record.'));
              }
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Could not delete', toUserMessage(err, 'Could not delete this record.'));
    }
  };

  const menuRow = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress: () => void,
    danger = false
  ) => (
    <TouchableOpacity
      className="flex-row items-center gap-3 py-3.5 border-t border-border"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: (danger ? colors.error : colors.primary[600]) + '15' }}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.primary[600]} />
      </View>
      <Text className="text-base font-medium" style={{ color: danger ? colors.error : colors.neutral[800] }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row gap-2 mb-4">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search name, breed, location or ID..." />
        <TouchableOpacity
          className="w-11 h-11 rounded-lg bg-primary-600 justify-center items-center shadow-sm"
          onPress={() => router.push('/livestock/new')}
          accessibilityRole="button"
          accessibilityLabel="Add livestock"
        >
          <Ionicons name="add-outline" size={22} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2 mb-4 flex-wrap">
        {filterOptions.map((filter) => (
          <FilterChip key={filter.value} label={filter.label} selected={selectedFilter === filter.value} onPress={() => setSelectedFilter(filter.value)} />
        ))}
      </View>

      <Text className="text-sm text-neutral-500 mb-3">
        {filteredLivestock.length} {filteredLivestock.length === 1 ? 'record' : 'records'} found
      </Text>

      {loading ? (
        <View className="py-10 items-center">
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      ) : (
        <>
          {filteredLivestock.map((animal) => (
            <LivestockCard
              key={animal.id}
              livestock={animal}
              types={types}
              onPress={() => router.push(`/livestock/${animal.id}`)}
              onLongPress={() => setMenuAnimal(animal)}
            />
          ))}
          {filteredLivestock.length === 0 && <EmptyState icon="search" title="No livestock found" subtitle="Try adjusting your search or filters" />}
        </>
      )}
    </Screen>

    <Modal visible={!!menuAnimal} transparent animationType="fade" onRequestClose={() => setMenuAnimal(null)}>
      <View className="flex-1 bg-black/40 justify-end">
        <TouchableOpacity
          className="absolute top-0 left-0 right-0 bottom-0"
          activeOpacity={1}
          onPress={() => setMenuAnimal(null)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View className="bg-card rounded-t-2xl px-5 pt-5" style={{ paddingBottom: 24 + insets.bottom }}>
          <View className="w-9 h-1 rounded-full bg-neutral-300 self-center mb-4" accessibilityElementsHidden />
          <Text className="text-lg font-semibold text-neutral-800 mb-1" numberOfLines={1}>{menuAnimal?.name}</Text>
          <Text className="text-xs text-neutral-500 mb-2">Long-press actions</Text>
          {menuRow('create-outline', 'Edit details', () => {
            const id = menuAnimal?.id;
            setMenuAnimal(null);
            if (id) router.push({ pathname: '/livestock/edit', params: { id } });
          })}
          {menuAnimal && menuAnimal.status !== 'sold' && menuAnimal.status !== 'deceased'
            ? menuRow('pricetag-outline', 'Mark as sold', handleMarkSold)
            : null}
          {menuRow('trash-outline', 'Delete', handleDeleteAnimal, true)}
          <TouchableOpacity
            className="mt-4 py-3 rounded-lg bg-background items-center"
            onPress={() => setMenuAnimal(null)}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text className="text-sm font-medium text-neutral-600">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}
