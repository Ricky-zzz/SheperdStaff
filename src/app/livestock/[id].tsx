import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
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
import { getByLivestockId as getExpensesForLivestock } from '../../features/expenses/services/expenseService';
import { getById as getLivestockById, remove, updateStatus, addHealthNote, addFeeding } from '../../features/livestock/services/livestockService';
import { log as logActivity } from '../../features/activity/services/activityService';
import { Livestock, HealthNoteType } from '../../features/livestock/types';
import { Expense } from '../../features/expenses/types';
import { useTheme } from '../../lib/theme/ThemeContext';

const STATUSES = [
  { label: 'Active', value: 'active' as const },
  { label: 'Growing', value: 'growing' as const },
  { label: 'Breeding', value: 'breeding' as const },
  { label: 'For Sale', value: 'for_sale' as const },
  { label: 'Sold', value: 'sold' as const },
  { label: 'Deceased', value: 'deceased' as const },
];

const HEALTH_TYPES: { label: string; value: HealthNoteType }[] = [
  { label: 'Observation', value: 'observation' },
  { label: 'Treatment', value: 'treatment' },
  { label: 'Vaccination', value: 'vaccination' },
  { label: 'Illness', value: 'illness' },
];

export default function LivestockDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [animal, setAnimal] = useState<Livestock | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // modals
  const [showHealth, setShowHealth] = useState(false);
  const [healthType, setHealthType] = useState<HealthNoteType>('observation');
  const [healthNote, setHealthNote] = useState('');
  const [healthSaving, setHealthSaving] = useState(false);

  const [showFeeding, setShowFeeding] = useState(false);
  const [feedType, setFeedType] = useState('');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedNotes, setFeedNotes] = useState('');
  const [feedingSaving, setFeedingSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [a, e] = await Promise.all([getLivestockById(id as string), getExpensesForLivestock(id as string)]);
      if (!a) setNotFound(true);
      else {
        setAnimal(a);
        setNotFound(false);
      }
      setExpenses(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = () => {
    Alert.alert('Delete', `Delete ${animal?.name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(id as string);
            await logActivity({
              id: `act-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              type: 'status_change',
              description: `${animal?.name} deleted`,
              livestockId: id as string,
            });
            router.replace('/(tabs)/livestock');
          } catch (e: any) {
            Alert.alert('Error', String(e?.message ?? 'Failed to delete'));
          }
        },
      },
    ]);
  };

  const handleStatus = async (newStatus: Livestock['status']) => {
    if (!animal || animal.status === newStatus) return;
    setStatusSaving(true);
    try {
      await updateStatus(animal.id, newStatus);
      await logActivity({
        id: `act-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'status_change',
        description: `${animal.name} status → ${newStatus}`,
        livestockId: animal.id,
      });
      await load();
    } catch (e: any) {
      Alert.alert('Error', String(e?.message ?? 'Failed'));
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAddHealth = async () => {
    if (!healthNote.trim()) {
      Alert.alert('Required', 'Note cannot be empty');
      return;
    }
    setHealthSaving(true);
    try {
      const note = {
        id: `hn-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: healthType,
        note: healthNote.trim(),
      };
      await addHealthNote(id as string, note);
      await logActivity({
        id: `act-${Date.now()}`,
        date: note.date,
        type: 'health_note',
        description: `Health note for ${animal?.name}: ${note.note.slice(0, 40)}`,
        livestockId: id as string,
      });
      setHealthNote('');
      setShowHealth(false);
      await load();
    } catch (e: any) {
      Alert.alert('Error', String(e?.message ?? 'Failed'));
    } finally {
      setHealthSaving(false);
    }
  };

  const handleAddFeeding = async () => {
    if (!feedType.trim() || !feedAmount.trim()) {
      Alert.alert('Required', 'Feed type and amount are required');
      return;
    }
    setFeedingSaving(true);
    try {
      const feeding = {
        id: `f-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        feedType: feedType.trim(),
        amount: feedAmount.trim(),
        notes: feedNotes.trim() || undefined,
      };
      await addFeeding(id as string, feeding);
      await logActivity({
        id: `act-${Date.now()}`,
        date: feeding.date,
        type: 'feeding',
        description: `Feeding for ${animal?.name}: ${feeding.feedType}`,
        livestockId: id as string,
      });
      setFeedType('');
      setFeedAmount('');
      setFeedNotes('');
      setShowFeeding(false);
      await load();
    } catch (e: any) {
      Alert.alert('Error', String(e?.message ?? 'Failed'));
    } finally {
      setFeedingSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center py-20">
        <ActivityIndicator color={colors.primary[600]} />
      </View>
    );
  }

  if (notFound || !animal) {
    return <View className="flex-1 justify-center items-center"><Text className="text-lg text-neutral-500">Livestock not found</Text></View>;
  }

const statusColors = getStatusBadgeColor(animal.status, colors);
  const categoryColors = getCategoryBadgeColor(animal.category, colors);
  const totalExpense = expenses.reduce((sum, e) => {
    const share = e.allocations?.find((a) => a.livestockId === animal.id)?.amount;
    return sum + (share ?? e.amount);
  }, 0);

  return (
    <>
      <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-2 mb-4">
          <Badge label={getStatusLabel(animal.status).toUpperCase()} color={statusColors.bg} textColor={statusColors.text} size="md" />
          <Badge label={getCategoryLabel(animal.category).toUpperCase()} color={categoryColors.bg} textColor={categoryColors.text} size="md" />
          {animal.type === 'group' && <Badge label="GROUP" color={colors.neutral[100]} textColor={colors.neutral[600]} size="md" />}
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg bg-primary-600" onPress={() => router.push({ pathname: '/livestock/edit', params: { id: animal.id } })}>
            <Ionicons name="create-outline" size={18} color={colors.white} />
            <Text className="text-sm font-semibold text-white">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border border-error bg-card" onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text className="text-sm font-semibold" style={{ color: colors.error }}>Delete</Text>
          </TouchableOpacity>
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
                <Ionicons name={item.icon as any} size={16} color={colors.neutral[400]} />
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

        {/* Status quick switch */}
        <View className="mb-2">
          <Text className="text-sm font-semibold text-neutral-700 mb-2">Change Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s.value}
                disabled={statusSaving}
                onPress={() => handleStatus(s.value)}
                className={`px-3 py-2 rounded-full border ${animal.status === s.value ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              >
                <Text className={`text-xs font-medium ${animal.status === s.value ? 'text-white' : 'text-neutral-600'}`}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SectionHeader title="Health Notes" actionLabel="Add" onAction={() => setShowHealth(true)} />
        {animal.healthNotes.length > 0 ? (
          animal.healthNotes.map((note) => <HealthNoteItem key={note.id} note={note} />)
        ) : (
          <EmptyState icon="medkit-outline" title="No health notes recorded" />
        )}

        <SectionHeader title="Recent Feedings" actionLabel="Add" onAction={() => setShowFeeding(true)} />
        {animal.feedings.length > 0 ? (
          animal.feedings.map((feeding) => <FeedingItem key={feeding.id} feeding={feeding} />)
        ) : (
          <EmptyState icon="restaurant-outline" title="No feeding records" />
        )}

      <SectionHeader title="Expenses" />
      {expenses.length > 0 ? (
        <>
          {expenses.map((expense) => (
            <TouchableOpacity key={expense.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/expenses/edit', params: { id: expense.id } })}>
              <ExpenseItem expense={expense} highlightLivestockId={animal.id} />
            </TouchableOpacity>
          ))}
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

      {/* Health Note Modal */}
      <Modal visible={showHealth} transparent animationType="slide" onRequestClose={() => setShowHealth(false)}>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-card rounded-t-2xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-neutral-800">Add Health Note</Text>
              <TouchableOpacity onPress={() => setShowHealth(false)}><Ionicons name="close" size={22} color={colors.neutral[500]} /></TouchableOpacity>
            </View>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {HEALTH_TYPES.map((h) => (
                <TouchableOpacity key={h.value} onPress={() => setHealthType(h.value)} className={`px-3 py-2 rounded-full border ${healthType === h.value ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}>
                  <Text className={`text-sm ${healthType === h.value ? 'text-white font-medium' : 'text-neutral-600'}`}>{h.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Note *</Text>
            <TextInput className="bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-4 min-h-[90px] pt-3" placeholder="Describe observation, treatment, etc." placeholderTextColor={colors.neutral[400]} value={healthNote} onChangeText={setHealthNote} multiline numberOfLines={4} textAlignVertical="top" />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 py-3 rounded-lg border border-border items-center" onPress={() => setShowHealth(false)} disabled={healthSaving}><Text className="font-semibold text-neutral-600">Cancel</Text></TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 rounded-lg bg-primary-600 items-center flex-row justify-center gap-2" onPress={handleAddHealth} disabled={healthSaving}>
                {healthSaving ? <ActivityIndicator color={colors.white} /> : null}
                <Text className="font-semibold text-white">{healthSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feeding Modal */}
      <Modal visible={showFeeding} transparent animationType="slide" onRequestClose={() => setShowFeeding(false)}>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-card rounded-t-2xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-neutral-800">Add Feeding</Text>
              <TouchableOpacity onPress={() => setShowFeeding(false)}><Ionicons name="close" size={22} color={colors.neutral[500]} /></TouchableOpacity>
            </View>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Feed Type *</Text>
            <TextInput className="bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-3" placeholder="e.g., Hay + Grain mix" placeholderTextColor={colors.neutral[400]} value={feedType} onChangeText={setFeedType} />
            <Text className="text-sm font-medium text-neutral-600 mb-2">Amount *</Text>
            <TextInput className="bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-3" placeholder="e.g., 15 kg" placeholderTextColor={colors.neutral[400]} value={feedAmount} onChangeText={setFeedAmount} />
            <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
            <TextInput className="bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-4" placeholder="Optional notes" placeholderTextColor={colors.neutral[400]} value={feedNotes} onChangeText={setFeedNotes} />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 py-3 rounded-lg border border-border items-center" onPress={() => setShowFeeding(false)} disabled={feedingSaving}><Text className="font-semibold text-neutral-600">Cancel</Text></TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 rounded-lg bg-primary-600 items-center flex-row justify-center gap-2" onPress={handleAddFeeding} disabled={feedingSaving}>
                {feedingSaving ? <ActivityIndicator color={colors.white} /> : null}
                <Text className="font-semibold text-white">{feedingSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
