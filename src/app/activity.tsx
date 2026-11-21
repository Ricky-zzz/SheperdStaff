import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, SectionList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '../components/ui/Screen';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { ActivityItem } from '../features/activity/components/ActivityItem';
import { groupByDate } from '../features/activity/services/activityService';
import { Activity } from '../features/activity/types';
import { toUserMessage } from '../lib/utils/errors';
import { useTheme } from '../lib/theme/ThemeContext';

type Section = { title: string; data: Activity[] };

export default function ActivityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [grouped, setGrouped] = useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setGrouped(await groupByDate());
    } catch (err) {
      setLoadError(toUserMessage(err, 'Could not load activity.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setGrouped(await groupByDate());
      setLoadError(null);
    } catch (err) {
      setLoadError(toUserMessage(err, 'Could not refresh activity.'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const sections: Section[] = useMemo(
    () => Object.entries(grouped).map(([title, data]) => ({ title, data })),
    [grouped]
  );

  if (loading) {
    return (
      <Screen>
        <SkeletonList rows={6} />
      </Screen>
    );
  }

  return (
    <Screen error={loadError} onRetry={load} scrollable={false} padded={false}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary[600]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderSectionHeader={({ section }) => (
          <View className="bg-background pt-2 pb-2">
            <Text className="text-sm font-semibold text-neutral-500">{section.title}</Text>
          </View>
        )}
        renderItem={({ item, section, index }) => {
          const first = index === 0;
          const last = index === section.data.length - 1;
          return (
            <View
              className={`bg-card px-0 ${first ? 'rounded-t-xl' : ''} ${last ? 'rounded-b-xl mb-1' : ''}`}
              style={{
                borderTopWidth: first ? 1 : 0,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: last ? 1 : 0,
                borderColor: colors.border,
              }}
            >
              <ActivityItem
                activity={item}
                showBorder={!last}
                onPress={item.livestockId ? () => router.push(`/livestock/${item.livestockId}`) : undefined}
              />
            </View>
          );
        }}
        renderSectionFooter={() => <View className="mb-5" />}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="No activity yet"
            subtitle="Feedings, sales, and tasks will show up here"
            actionLabel="View livestock"
            onAction={() => router.push('/(tabs)/livestock')}
          />
        }
      />
    </Screen>
  );
}
