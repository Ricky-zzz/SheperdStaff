import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { ActivityItem } from '../features/activity/components/ActivityItem';
import { groupByDate } from '../features/activity/services/activityService';
import { Activity } from '../features/activity/types';
import { Colors } from '../lib/theme/colors';

export default function ActivityScreen() {
  const router = useRouter();
  const [grouped, setGrouped] = useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGrouped(await groupByDate());
    } finally {
      setLoading(false);
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
          <ActivityIndicator color={Colors.primary[600]} />
        </View>
      </Screen>
    );
  }

  const entries = Object.entries(grouped);

  if (entries.length === 0) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-base text-neutral-400">No activity yet</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
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
    </Screen>
  );
}
