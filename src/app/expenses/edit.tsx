import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { ExpenseCategory, ExpenseAllocation } from '../../features/expenses/types';
import { getById, update, remove } from '../../features/expenses/services/expenseService';
import { getAll as getAllLivestock } from '../../features/livestock/services/livestockService';
import { Livestock } from '../../features/livestock/types';
import { LivestockPicker } from '../../components/ui/LivestockPicker';
import { log as logActivity } from '../../features/activity/services/activityService';
import { validateExpense } from '../../lib/utils/validate';
import { DateInput } from '../../components/ui/DateInput';

const CATEGORIES: { label: string; value: ExpenseCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Feed', value: 'feed', icon: 'restaurant-outline' },
  { label: 'Medicine', value: 'medicine', icon: 'medkit-outline' },
  { label: 'Supplies', value: 'supplies', icon: 'cube-outline' },
  { label: 'Maintenance', value: 'maintenance', icon: 'construct-outline' },
  { label: 'Labor', value: 'labor', icon: 'people-outline' },
  { label: 'Other', value: 'other', icon: 'ellipsis-horizontal-outline' },
];

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function EditExpenseScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('feed');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDirectId, setSelectedDirectId] = useState<string | null>(null);
  const [legacyAllocations, setLegacyAllocations] = useState<ExpenseAllocation[] | undefined>(undefined);
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
          setLegacyAllocations(e.allocations);
        } else {
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

  const nameById: Record<string, string> = {};
  for (const l of livestock) nameById[l.id] = l.name;

  const handleSave = async () => {
    const e = validateExpense({ description, amount, date });
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
        livestockId: legacyAllocations ? undefined : selectedDirectId || undefined,
      };
      if (!legacyAllocations) patch.allocations = undefined;
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
            const desc = description.trim() || 'Expense';
            await remove(id as string);
            await logActivity({
              id: `act-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              type: 'expense_added',
              description: `Expense deleted: ${desc}`,
              expenseId: id as string,
            });
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
        <ActivityIndicator color={colors.primary[600]} />
      </View>
    );
  }

  const inputCls = (field: string) => `${inputClass} ${errors[field] ? 'border-error' : 'border-border'} mb-1`;
  const touch = (field: 'description' | 'amount', run: () => Record<string, string>) =>
    setErrors((prev) => ({ ...prev, [field]: run()[field] ?? '' }));

  return (
    <FormScroll>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Description *</Text>
        <TextInput className={inputCls('description')} placeholder="Description" placeholderTextColor={colors.neutral[500]} value={description} onChangeText={(v) => { setDescription(v); if (errors.description) setErrors((p) => ({ ...p, description: '' })); }} onBlur={() => touch('description', () => validateExpense({ description, amount, date }))} />
        {errors.description ? <Text className="text-xs text-error mb-3">{errors.description}</Text> : <View className="mb-3" />}

          <Text className="text-sm font-medium text-neutral-600 mb-2">Amount (₱) *</Text>
        <TextInput className={inputCls('amount')} placeholder="0.00" placeholderTextColor={colors.neutral[500]} value={amount} onChangeText={(v) => { setAmount(v); if (errors.amount) setErrors((p) => ({ ...p, amount: '' })); }} onBlur={() => touch('amount', () => validateExpense({ description, amount, date }))} keyboardType="decimal-pad" />
        {errors.amount ? <Text className="text-xs text-error mb-3">{errors.amount}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Date</Text>
        <DateInput value={date} onChange={(d) => { setDate(d); if (errors.date) setErrors((p) => ({ ...p, date: '' })); }} error={errors.date} />
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Category</Text>
        <View className="flex-row flex-wrap gap-4">
          {CATEGORIES.map((cat) => {
            const sel = category === cat.value;
            return (
              <TouchableOpacity key={cat.value} className={`w-[30%] items-center py-4 rounded-lg border gap-2 ${sel ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`} onPress={() => setCategory(cat.value)}>
                <Ionicons name={cat.icon} size={22} color={sel ? colors.onPrimary : colors.neutral[500]} />
                <Text className={`text-sm font-medium ${sel ? 'text-onPrimary' : 'text-neutral-600'}`}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {legacyAllocations ? (
        <View className="mb-5">
          <Text className="text-sm font-medium text-neutral-600 mb-2">Split across groups</Text>
          <View className="bg-card rounded-lg border border-border p-3">
            <Text className="text-xs text-neutral-500 mb-2">
              This expense was recorded with an automatic split (before feed inventory). Line items are kept as saved and shown in each group on top of its expenses.
            </Text>
            {legacyAllocations.map((a) => (
              <View key={a.livestockId} className="flex-row justify-between py-1">
                <Text className="text-sm text-neutral-600">{nameById[a.livestockId] ?? a.livestockId}</Text>
                <Text className="text-sm font-semibold text-neutral-800">₱{a.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="mb-5">
          <Text className="text-sm font-medium text-neutral-600 mb-2">Link to livestock (optional)</Text>
          <LivestockPicker livestock={livestock} value={selectedDirectId} onChange={setSelectedDirectId} noneLabel="General" />
        </View>
      )}

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
        <TextInput className={`${inputClass} min-h-[80px] pt-3 border-border`} placeholder="Notes..." placeholderTextColor={colors.neutral[500]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />
      </View>

      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity className="flex-1 py-4 rounded-lg border border-error items-center flex-row justify-center gap-2" onPress={handleDelete} disabled={deleting || saving}>
          {deleting ? <ActivityIndicator color={colors.error} /> : <Ionicons name="trash-outline" size={18} color={colors.error} />}
          <Text className="text-base font-semibold" style={{ color: colors.error }}>Delete</Text>
        </TouchableOpacity>
        <Button title={saving ? 'Saving...' : 'Update'} variant="primary" size="lg" className="flex-[2]" icon="checkmark-outline" loading={saving} onPress={handleSave} disabled={saving || deleting} />
      </View>
      <TouchableOpacity className="py-3 items-center mt-2" onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cancel and go back"><Text className="text-sm text-neutral-500">Cancel</Text></TouchableOpacity>

    </FormScroll>
  );
}
