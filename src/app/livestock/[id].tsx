import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Badge, getStatusBadgeColor, getCategoryBadgeColor } from '../../components/ui/Badge';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { HealthNoteItem } from '../../features/livestock/components/HealthNoteItem';
import { FeedingItem } from '../../features/livestock/components/FeedingItem';
import { ExpenseItem } from '../../features/expenses/components/ExpenseItem';
import { getStatusLabel, getCategoryLabel } from '../../features/livestock/livestockMeta';
import { formatAge } from '../../lib/utils/age';
import { getById, getByLivestockId as getExpensesForLivestock } from '../../features/expenses/services/expenseService';
import { getById as getLivestockById } from '../../features/livestock/services/livestockService';
import { Colors } from '../../lib/theme/colors';

export default function LivestockDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const animal = getLivestockById(id || '');
  const expenses = getExpensesForLivestock(id || '');

  if (!animal) {
    return <View className="flex-1 justify-center items-center"><Text className="text-lg text-neutral-500">Livestock not found</Text></View>;
  }

  const statusColors = getStatusBadgeColor(animal.status);
  const categoryColors = getCategoryBadgeColor(animal.category);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      <View className="flex-row flex-wrap gap-2 mb-4">
        <Badge label={getStatusLabel(animal.status).toUpperCase()} color={statusColors.bg} textColor={statusColors.text} size="md" />
        <Badge label={getCategoryLabel(animal.category).toUpperCase()} color={categoryColors.bg} textColor={categoryColors.text} size="md" />
        {animal.type === 'group' && <Badge label="GROUP" color={Colors.neutral[100]} textColor={Colors.neutral[600]} size="md" />}
      </View>

      <Card className="mb-5">
        <Text className="text-2xl font-bold text-neutral-900 mb-1">{animal.name}</Text>
        {animal.breed && <Text className="text-base text-neutral-500 mb-4">{animal.breed}</Text>}
        <View className="gap-3">
          {[
            { icon: 'layers', label: 'Quantity', value: String(animal.quantity) },
            { icon: 'calendar', label: 'Age', value: formatAge(animal.startDate) },
            { icon: 'location', label: 'Location', value: animal.location },
            { icon: 'flag', label: 'Purpose', value: animal.purpose },
            ...(animal.sex ? [{ icon: animal.sex === 'male' ? 'male' : 'female', label: 'Sex', value: animal.sex }] : []),
            { icon: 'time', label: 'Since', value: animal.startDate },
          ].map((item) => (
            <View key={item.label} className="flex-row items-center gap-3">
              <Ionicons name={item.icon as any} size={16} color={Colors.neutral[400]} />
              <Text className="text-sm text-neutral-500 w-20">{item.label}</Text>
              <Text className="text-sm font-semibold text-neutral-800 flex-1">{item.value}</Text>
            </View>
          ))}
        </View>
        {animal.notes && (
          <View className="mt-4 pt-4 border-t border-neutral-100">
            <Text className="text-sm font-semibold text-neutral-600 mb-2">Notes</Text>
            <Text className="text-base text-neutral-700" style={{ lineHeight: 22 }}>{animal.notes}</Text>
          </View>
        )}
      </Card>

      <SectionHeader title="Health Notes" />
      {animal.healthNotes.length > 0 ? (
        animal.healthNotes.map((note) => <HealthNoteItem key={note.id} note={note} />)
      ) : (
        <EmptyState icon="medkit-outline" title="No health notes recorded" />
      )}

      <SectionHeader title="Recent Feedings" />
      {animal.feedings.length > 0 ? (
        animal.feedings.map((feeding) => <FeedingItem key={feeding.id} feeding={feeding} />)
      ) : (
        <EmptyState icon="restaurant-outline" title="No feeding records" />
      )}

      <SectionHeader title="Expenses" />
      {expenses.length > 0 ? (
        <>
          {expenses.map((expense) => <ExpenseItem key={expense.id} expense={expense} />)}
          <Card className="flex-row justify-between items-center bg-primary-50 mt-2">
            <Text className="text-base font-semibold text-primary-700">Total Expenses</Text>
            <Text className="text-xl font-bold text-primary-700">${totalExpense.toFixed(2)}</Text>
          </Card>
        </>
      ) : (
        <EmptyState icon="wallet-outline" title="No expenses recorded" />
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
