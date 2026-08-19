import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ActivityItem } from '../../features/activity/components/ActivityItem';
import * as livestockService from '../../features/livestock/services/livestockService';
import * as activityService from '../../features/activity/services/activityService';
import * as expenseService from '../../features/expenses/services/expenseService';
import { Colors } from '../../lib/theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const totalLivestock = livestockService.count();
  const totalGroups = livestockService.countGroups();
  const totalExpenses = expenseService.total();
  const monthExpenses = expenseService.thisMonth();
  const recentActivities = activityService.getRecent(5);

  return (
    <Screen>
      <View className="flex-row justify-between items-center mb-5">
        <View>
          <Text className="text-2xl font-bold text-neutral-900">Good morning!</Text>
          <Text className="text-base text-neutral-500 mt-1">Here's your farm overview</Text>
        </View>
        <TouchableOpacity className="w-11 h-11 rounded-full bg-primary-50 justify-center items-center" onPress={() => router.push('/activity')}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary[700]} />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-3 mb-3">
        <StatCard title="Total Livestock" value={totalLivestock} icon="paw" color={Colors.primary[600]} subtitle={`${totalGroups} groups`} />
        <StatCard title="This Month" value={`$${monthExpenses.toFixed(0)}`} icon="trending-up" color={Colors.earth[600]} subtitle="Expenses" />
      </View>
      <View className="flex-row gap-3 mb-3">
        <StatCard title="Active" value={livestockService.getAll().filter(l => l.status === 'active' || l.status === 'growing').length} icon="checkmark-circle" color={Colors.success} subtitle="Healthy & growing" />
        <StatCard title="Total Spent" value={`$${totalExpenses.toFixed(0)}`} icon="wallet" color={Colors.category.cattle} subtitle="All time" />
      </View>

      <SectionHeader title="Quick Actions" />

      <View className="flex-row gap-3">
        <TouchableOpacity className="flex-1 items-center gap-2" onPress={() => router.push('/livestock/new')}>
          <View className="w-[52px] h-[52px] rounded-xl justify-center items-center" style={{ backgroundColor: Colors.primary[100] }}>
            <Ionicons name="add-circle" size={24} color={Colors.primary[600]} />
          </View>
          <Text className="text-xs font-medium text-neutral-600 text-center">Add Animal</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 items-center gap-2" onPress={() => router.push('/expenses/new')}>
          <View className="w-[52px] h-[52px] rounded-xl justify-center items-center" style={{ backgroundColor: Colors.earth[100] }}>
            <Ionicons name="cash" size={24} color={Colors.earth[600]} />
          </View>
          <Text className="text-xs font-medium text-neutral-600 text-center">Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 items-center gap-2" onPress={() => router.push('/(tabs)/livestock')}>
          <View className="w-[52px] h-[52px] rounded-xl justify-center items-center bg-purple-100">
            <Ionicons name="list" size={24} color="#7C3AED" />
          </View>
          <Text className="text-xs font-medium text-neutral-600 text-center">View All</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 items-center gap-2" onPress={() => router.push('/(tabs)/reports')}>
          <View className="w-[52px] h-[52px] rounded-xl justify-center items-center bg-blue-100">
            <Ionicons name="bar-chart" size={24} color="#2563EB" />
          </View>
          <Text className="text-xs font-medium text-neutral-600 text-center">Reports</Text>
        </TouchableOpacity>
      </View>

      <SectionHeader title="Recent Activity" actionLabel="See all" onAction={() => router.push('/activity')} />

      <Card className="p-0 mb-5">
        {recentActivities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            showBorder={index < recentActivities.length - 1}
            onPress={activity.livestockId ? () => router.push(`/livestock/${activity.livestockId}`) : undefined}
          />
        ))}
      </Card>
    </Screen>
  );
}
