import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { ActivityItem } from '../features/activity/components/ActivityItem';
import { groupByDate } from '../features/activity/services/activityService';
import { Activity } from '../features/activity/types';
import { useTheme } from '../lib/theme/ThemeContext';

export default function ActivityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [grouped, setGrouped] = useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGrouped(await groupByDate());
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setGrouped(await groupByDate());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const entries = Object.entries(grouped);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      ) : entries.length === 0 ? (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-base text-neutral-400">No activity yet</Text>
        </View>
      ) : (
        <>
          {entries.map(([date, activities]) => (
            <View key={date} className="mb-5">
              <Text className="text-sm font-semibold text-neutral-500 mb-2">{date}</Text>
              <Card className="p-0">
                {activities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    showBorder={index < activities.length - 1}
                    onPress={activity.livestockId ? () => router.push(`/livestock/${activity.livestockId}`) : undefined}
                  />
                ))}
              </Card>
            </View>
          ))}
          <View className="h-8" />
        </>
      )}
    </Screen>
  );
}