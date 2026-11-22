import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Screen } from '../../components/ui/Screen';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterChip } from '../../components/ui/FilterChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { SkeletonList } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { LivestockCard } from '../../features/livestock/components/LivestockCard';
import { getAll, updateStatus, remove, getDeletionBlockers, describeDeletionBlockers } from '../../features/livestock/services/livestockService';
import { Livestock, LivestockCategory } from '../../features/livestock/types';
import { AnimalType } from '../../features/animalTypes/types';
import { getAll as getAllTypes } from '../../features/animalTypes/services/animalTypeService';
import { log as logActivity, safeLog } from '../../features/activity/services/activityService';
import { toUserMessage } from '../../lib/utils/errors';
import { generateId } from '../../lib/utils/ids';
import { lightHaptic, successHaptic } from '../../lib/utils/haptics';
import { useTheme } from '../../lib/theme/ThemeContext';

export default function LivestockScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<LivestockCategory | 'all'>('all');
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuAnimal, setMenuAnimal] = useState<Livestock | null>(null);
  const swipeRefs = useRef(new Map<string, Swipeable>());
  const closeAllSwipes = useCallback(() => {
    swipeRefs.current.forEach((r) => r.close());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [data, t] = await Promise.all([getAll(), getAllTypes()]);
      setLivestock(data);
      setTypes(t);
    } catch (err) {
      setLoadError(toUserMessage(err, 'Could not load livestock.'));
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
      setLoadError(null);
    } catch (err) {
      setLoadError(toUserMessage(err, 'Could not refresh.'));
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

  const handleMarkSold = async (animal?: Livestock | null) => {
    const target = animal ?? menuAnimal;
    if (!target) return;
    const prev = livestock;
    setLivestock((cur) => cur.map((a) => (a.id === target.id ? { ...a, status: 'sold' } : a)));
    setMenuAnimal(null);
    closeAllSwipes();
    void successHaptic();
    try {
      await updateStatus(target.id, 'sold');
      await logActivity({
        id: generateId('act'),
        date: new Date().toISOString().slice(0, 10),
        type: 'status_change',
        description: `${target.name} status changed to Sold`,
        livestockId: target.id,
      });
      show(`Marked sold: ${target.name}`);
      await load();
    } catch (err) {
      setLivestock(prev);
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
          `This animal already has ${describeDeletionBlockers(blockers)} recorded on the farm.\n\nUndo its feedings or delete/unlink those records first. Removing it now would leave them without an owner.`
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
                await safeLog({
                  id: generateId('act'),
                  date: new Date().toISOString().slice(0, 10),
                  type: 'livestock_deleted',
                  description: `${name} deleted`,
                });
                setMenuAnimal(null);
                show(`Deleted ${name}`);
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
      onPress={() => {
        void lightHaptic();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: (danger ? colors.error : colors.primary[600]) + '15' }}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.primary[600]} />
      </View>
      <Text className="text-base font-medium" style={{ color: danger ? colors.error : colors.neutral[800] }}>{label}</Text>
    </TouchableOpacity>
  );

  const renderSwipeActions = (animal: Livestock, side: 'left' | 'right') => (
    <TouchableOpacity
      className={`w-20 items-center justify-center my-2 rounded-xl ${side === 'left' ? 'bg-success mr-2' : 'bg-error ml-2'}`}
      onPress={() => {
        closeAllSwipes();
        if (side === 'left') void handleMarkSold(animal);
        else {
          setMenuAnimal(animal);
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={side === 'left' ? `Mark ${animal.name} sold` : `Delete ${animal.name}`}
    >
      <Ionicons
        name={side === 'left' ? 'pricetag-outline' : 'trash-outline'}
        size={22}
        color={side === 'left' ? colors.onSuccess : colors.onError}
      />
      <Text className={`text-xs font-semibold mt-1 ${side === 'left' ? 'text-onSuccess' : 'text-onError'}`}>
        {side === 'left' ? 'Sold' : 'Delete'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Screen>
        <SkeletonList rows={5} />
      </Screen>
    );
  }

  return (
    <>
      <Screen refreshing={refreshing} onRefresh={refresh} error={loadError} onRetry={load} scrollable={false} padded={false}>
        <FlatList
          data={filteredLivestock}
          keyExtractor={(item) => item.id}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary[600]} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListHeaderComponent={
            <View>
              <View className="flex-row gap-2 mb-4 items-center">
                <SearchBar value={search} onChangeText={setSearch} placeholder="Search name, breed, location or ID..." />
                <TouchableOpacity
                  className="w-12 h-12 rounded-lg bg-primary-600 justify-center items-center shadow-sm"
                  onPress={() => {
                    void lightHaptic();
                    router.push('/livestock/new');
                  }}
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
            </View>
          }
          renderItem={({ item: animal }) => (
            <Swipeable
              ref={(r) => {
                if (r) swipeRefs.current.set(animal.id, r);
              }}
              onSwipeableWillOpen={closeAllSwipes}
              renderLeftActions={
                animal.status !== 'sold' && animal.status !== 'deceased'
                  ? () => renderSwipeActions(animal, 'left')
                  : undefined
              }
              renderRightActions={() => renderSwipeActions(animal, 'right')}
              overshootLeft={false}
              overshootRight={false}
              friction={2}
            >
              <LivestockCard
                livestock={animal}
                types={types}
                onPress={() => router.push(`/livestock/${animal.id}`)}
                onLongPress={() => {
                  void lightHaptic();
                  setMenuAnimal(animal);
                }}
              />
            </Swipeable>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No livestock found"
              subtitle="Try adjusting your search or filters"
              actionLabel="Add livestock"
              actionVariant="plus"
              onAction={() => router.push('/livestock/new')}
            />
          }
        />
      </Screen>

      <BottomSheet visible={!!menuAnimal} onClose={() => setMenuAnimal(null)}>
        <View className="px-1">
          <Text className="text-lg font-semibold text-neutral-800 mb-1" numberOfLines={1}>{menuAnimal?.name}</Text>
          <Text className="text-xs text-neutral-500 mb-2">Long-press actions</Text>
          {menuRow('create-outline', 'Edit details', () => {
            const id = menuAnimal?.id;
            setMenuAnimal(null);
            if (id) router.push({ pathname: '/livestock/edit', params: { id } });
          })}
          {menuAnimal && menuAnimal.status !== 'sold' && menuAnimal.status !== 'deceased'
            ? menuRow('pricetag-outline', 'Mark as sold', () => void handleMarkSold())
            : null}
          {menuRow('trash-outline', 'Delete', () => void handleDeleteAnimal(), true)}
        </View>
      </BottomSheet>
    </>
  );
}
