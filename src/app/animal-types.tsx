import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useTheme } from '../lib/theme/ThemeContext';
import { AnimalType } from '../features/animalTypes/types';
import * as animalTypeService from '../features/animalTypes/services/animalTypeService';

export default function AnimalTypesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTypes(await animalTypeService.getAll());
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setTypes(await animalTypeService.getAll());
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

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-neutral-800">Animal types</Text>
        <TouchableOpacity className="flex-row items-center bg-primary-600 px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/animal-types/form')}>
          <Ionicons name="add" size={18} color={colors.white} />
          <Text className="text-sm text-white font-semibold">New</Text>
        </TouchableOpacity>
      </View>

      {types.length === 0 ? (
        <EmptyState icon="paw-outline" title="No animal types yet" subtitle="Add types like Cattle, Goats, Ducks" />
      ) : (
        <Card className="p-0 mb-5">
          {types.map((t, index) => (
            <TouchableOpacity
              key={t.id}
              className={`flex-row items-center p-4 ${index < types.length - 1 ? 'border-b border-neutral-100' : ''}`}
              onPress={() => router.push({ pathname: '/animal-types/form', params: { id: t.id } })}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-lg justify-center items-center mr-3" style={{ backgroundColor: t.color + '1F' }}>
                <Ionicons name={t.icon as any} size={20} color={t.color} />
              </View>
              <Text className="flex-1 text-base font-medium text-neutral-800">{t.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
            </TouchableOpacity>
          ))}
        </Card>
      )}
    </Screen>
  );
}