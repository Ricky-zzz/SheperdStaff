import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/theme/colors';
import { ExpenseCategory } from '../../features/expenses/types';
import { getById, update, remove, allocateBulk } from '../../features/expenses/services/expenseService';
import { getAll as getAllLivestock } from '../../features/livestock/services/livestockService';
import { Livestock } from '../../features/livestock/types';
import { log as logActivity } from '../../features/activity/services/activityService';
import { validateExpense } from '../../lib/utils/validate';

const CATEGORIES: { label: string; value: ExpenseCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Feed', value: 'feed', icon: 'restaurant' },
  { label: 'Medicine', value: 'medicine', icon: 'medkit' },
  { label: 'Supplies', value: 'supplies', icon: 'cube' },
  { label: 'Maintenance', value: 'maintenance', icon: 'construct' },
  { label: 'Labor', value: 'labor', icon: 'people' },
  { label: 'Other', value: 'other', icon: 'ellipsis-horizontal' },
];

const inputClass = 'bg-white border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';
type Scope = 'direct' | 'bulk';

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('feed');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [scope, setScope] = useState<Scope>('direct');
  const [selectedDirectId, setSelectedDirectId] = useState<string | null>(null);
  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const [l, e] = await Promise.all([getAllLivestock(), id ? getById(id as string) : null]);
      setLivestock(l);
      if (e) {
        setDescription(e.description);
        setAmount(String(e.amount));
        setCategory(e.category);
        setDate(e.date);
        setNotes(e.notes ?? '');
        if (e.allocations && e.allocations.length > 0) {
          setScope('bulk');
          setBulkIds(e.allocations.map((a) => a.livestockId));
        } else {
          setScope('direct');
          setSelectedDirectId(e.livestockId ?? null);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const numericAmount = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const selectedBulkLivestock = useMemo(() => livestock.filter((l) => bulkIds.includes(l.id)), [livestock, bulkIds]);

  const preview = useMemo(() => {
    if (scope !== 'bulk' || selectedBulkLivestock.length === 0 || numericAmount <= 0) return [];
    return allocateBulk(
      numericAmount,
      selectedBulkLivestock.map((l) => ({ id: l.id, quantity: l.quantity }))
    );
  }, [scope, selectedBulkLivestock, numericAmount]);

  const toggleBulk = (lid: string) => {
    setBulkIds((prev) => (prev.includes(lid) ? prev.filter((x) => x !== lid) : [...prev, lid]));
    if (errors.bulk) setErrors((p) => ({ ...p, bulk: '' }));
  };

  const handleSave = async () => {
    const e = validateExpense({ description, amount, date });
    if (scope === 'bulk' && bulkIds.length < 2) e.bulk = 'Pick at least 2 groups for bulk';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const patch: any = {
        description: description.trim(),
        amount: numericAmount,
        category,
        date,
        notes: notes.trim() || undefined,
      };
      if (scope === 'direct') {
        patch.livestockId = selectedDirectId || undefined;
        patch.allocations = undefined;
      } else {
        patch.livestockId = undefined;
        patch.allocations = preview;
      }
      await update(id as string, patch);
      await logActivity({
        id: `act-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'expense_added',
        description: `Expense updated: ${description.trim()}`,
        expenseId: id as string,
      });
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete expense?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await remove(id as string);
            router.replace('/(tabs)/expenses');
          } catch (err: any) {
            Alert.alert('Error', String(err?.message ?? 'Failed'));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center py-20">
        <ActivityIndicator color={Colors.primary[600]} />
      </View>
    );
  }

  const inputCls = (field: string) => `${inputClass} ${errors[field] ? 'border-error' : 'border-border'} mb-1`;

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Description *</Text>
        <TextInput className={inputCls('description')} placeholder="Description" placeholderTextColor={Colors.neutral[400]} value={description} onChangeText={(v) => { setDescription(v); if (errors.description) setErrors((p) => ({ ...p, description: '' })); }} />
        {errors.description ? <Text className="text-xs text-error mb-3">{errors.description}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Amount ($) *</Text>
        <TextInput className={inputCls('amount')} placeholder="0.00" placeholderTextColor={Colors.neutral[400]} value={amount} onChangeText={(v) => { setAmount(v); if (errors.amount) setErrors((p) => ({ ...p, amount: '' })); }} keyboardType="decimal-pad" />
        {errors.amount ? <Text className="text-xs text-error mb-3">{errors.amount}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Date</Text>
        <TextInput className={inputCls('date')} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.neutral[400]} value={date} onChangeText={(v) => { setDate(v); if (errors.date) setErrors((p) => ({ ...p, date: '' })); }} />
        {errors.date ? <Text className="text-xs text-error mb-3">{errors.date}</Text> : <View className="mb-3" />}
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Category</Text>
        <View className="flex-row flex-wrap gap-4">
          {CATEGORIES.map((cat) => {
            const sel = category === cat.value;
            return (
              <TouchableOpacity key={cat.value} className={`w-[30%] items-center py-4 rounded-xl border gap-2 ${sel ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setCategory(cat.value)}>
                <Ionicons name={cat.icon} size={22} color={sel ? Colors.white : Colors.neutral[500]} />
                <Text className={`text-sm font-medium ${sel ? 'text-white' : 'text-neutral-600'}`}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Scope</Text>
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${scope === 'direct' ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setScope('direct')}>
            <Ionicons name="person" size={18} color={scope === 'direct' ? Colors.white : Colors.neutral[500]} />
            <Text className={`text-sm font-medium ${scope === 'direct' ? 'text-white' : 'text-neutral-500'}`}>Direct</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${scope === 'bulk' ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setScope('bulk')}>
            <Ionicons name="people" size={18} color={scope === 'bulk' ? Colors.white : Colors.neutral[500]} />
            <Text className={`text-sm font-medium ${scope === 'bulk' ? 'text-white' : 'text-neutral-500'}`}>Bulk</Text>
          </TouchableOpacity>
        </View>

        {scope === 'direct' ? (
          <>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Link to (optional)</Text>
            <View className="flex-row flex-wrap gap-2 mb-2">
              <TouchableOpacity className={`px-3 py-2 rounded-full border ${!selectedDirectId ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setSelectedDirectId(null)}>
                <Text className={`text-sm ${!selectedDirectId ? 'text-white' : 'text-neutral-600'}`}>General</Text>
              </TouchableOpacity>
              {livestock.map((l) => (
                <TouchableOpacity key={l.id} className={`px-3 py-2 rounded-full border ${selectedDirectId === l.id ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setSelectedDirectId(l.id)}>
                  <Text className={`text-sm ${selectedDirectId === l.id ? 'text-white' : 'text-neutral-600'}`}>{l.name} · {l.quantity} head</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Which groups share? (pick 2+)</Text>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {livestock.map((l) => {
                const sel = bulkIds.includes(l.id);
                return (
                  <TouchableOpacity key={l.id} className={`px-3 py-2 rounded-full border ${sel ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => toggleBulk(l.id)}>
                    <Text className={`text-sm ${sel ? 'text-white' : 'text-neutral-600'}`}>{l.name} · {l.quantity} head {sel ? '✓' : ''}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.bulk ? <Text className="text-xs text-error mb-2">{errors.bulk}</Text> : null}
            {preview.length > 0 && (
              <View className="bg-white rounded-xl border border-border p-3 mt-2">
                <Text className="text-sm font-semibold text-neutral-700 mb-2">Auto-split preview:</Text>
                {preview.map((p) => {
                  const l = livestock.find((x) => x.id === p.livestockId);
                  return (
                    <View key={p.livestockId} className="flex-row justify-between py-1">
                      <Text className="text-sm text-neutral-600">{l?.name} ({l?.quantity} head)</Text>
                      <Text className="text-sm font-semibold text-neutral-800">${p.amount.toFixed(2)}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
        <TextInput className={`${inputClass} min-h-[80px] pt-3 border-border`} placeholder="Notes..." placeholderTextColor={Colors.neutral[400]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />
      </View>

      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity className="flex-1 py-4 rounded-lg border border-error items-center flex-row justify-center gap-2" onPress={handleDelete} disabled={deleting || saving}>
          {deleting ? <ActivityIndicator color={Colors.error} /> : <Ionicons name="trash-outline" size={18} color={Colors.error} />}
          <Text className="text-base font-semibold" style={{ color: Colors.error }}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-[2] flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600" onPress={handleSave} disabled={saving || deleting}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Ionicons name="checkmark" size={20} color={Colors.white} />}
          <Text className="text-base font-semibold text-white">{saving ? 'Saving...' : 'Update'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity className="py-3 items-center mt-2" onPress={() => router.back()}><Text className="text-sm text-neutral-500">Cancel</Text></TouchableOpacity>

      <View className="h-8" />
    </ScrollView>
  );
}
