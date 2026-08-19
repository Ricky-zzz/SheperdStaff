import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { ActivityItem } from '../features/activity/components/ActivityItem';
import { groupByDate } from '../features/activity/services/activityService';

export default function ActivityScreen() {
  const router = useRouter();

  const groupedActivities = groupByDate();

  return (
    <Screen>
      {Object.entries(groupedActivities).map(([date, activities]) => (
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
