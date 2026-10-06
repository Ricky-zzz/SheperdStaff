import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { ListItem } from '../components/ui/ListItem';
import { EmptyState } from '../components/ui/EmptyState';
import { useTheme } from '../lib/theme/ThemeContext';
import { Location } from '../features/locations/types';
import * as locationService from '../features/locations/services/locationService';

export default function LocationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLocations(await locationService.getAll());
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setLocations(await locationService.getAll());
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
        <Text className="text-lg font-semibold text-neutral-800">Farm locations</Text>
        <TouchableOpacity className="flex-row items-center bg-primary-600 px-3 py-2 rounded-lg gap-1" onPress={() => router.push('/locations/form')}>
          <Ionicons name="add" size={18} color={colors.white} />
          <Text className="text-sm text-white font-semibold">New</Text>
        </TouchableOpacity>
      </View>

      {locations.length === 0 ? (
        <EmptyState icon="map-outline" title="No locations yet" subtitle="Add places like pastures, pens, and coops" />
      ) : (
        <Card className="p-0 mb-5">
          {locations.map((loc, index) => (
            <ListItem
              key={loc.id}
              icon="map"
              iconColor={colors.primary[600]}
              title={loc.name}
              subtitle={loc.notes}
              showChevron
              showBorder={index < locations.length - 1}
              onPress={() => router.push({ pathname: '/locations/form', params: { id: loc.id } })}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}