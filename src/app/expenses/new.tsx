import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme/ThemeContext';
import { ExpenseCategory } from '../../features/expenses/types';
import { create as createExpense } from '../../features/expenses/services/expenseService';
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

export default function AddExpenseScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('feed');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedDirectId, setSelectedDirectId] = useState<string | null>(null);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllLivestock().then(setLivestock).catch(() => {});
  }, []);

  const numericAmount = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const handleSave = async () => {
    const e = validateExpense({ description, amount, date });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const id = `exp-${Date.now()}`;
      await createExpense({
        id,
        date,
        category,
        description: description.trim(),
        amount: numericAmount,
        livestockId: selectedDirectId || undefined,
        notes: notes.trim() || undefined,
      });
      await logActivity({
        id: `act-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'expense_added',
        description: `Expense: ${description.trim()} ₱${numericAmount.toFixed(2)}`,
        expenseId: id,
        livestockId: selectedDirectId || undefined,
      });
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed to save') });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field: string) => `${inputClass} ${errors[field] ? 'border-error' : 'border-border'} mb-1`;
  const touch = (field: 'description' | 'amount', run: () => Record<string, string>) =>
    setErrors((prev) => ({ ...prev, [field]: run()[field] ?? '' }));

  return (
    <FormScroll>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Expense Details</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Description *</Text>
        <TextInput className={inputCls('description')} placeholder="e.g., Hay bales, Dewormer, Fence repair" placeholderTextColor={colors.neutral[500]} value={description} onChangeText={(v) => { setDescription(v); if (errors.description) setErrors((p) => ({ ...p, description: '' })); }} onBlur={() => touch('description', () => validateExpense({ description, amount, date }))} />
        {errors.description ? <Text className="text-xs text-error mb-3">{errors.description}</Text> : <View className="mb-3" />}

          <Text className="text-sm font-medium text-neutral-600 mb-2">Amount (₱) *</Text>
        <TextInput className={inputCls('amount')} placeholder="0.00" placeholderTextColor={colors.neutral[500]} value={amount} onChangeText={(v) => { setAmount(v); if (errors.amount) setErrors((p) => ({ ...p, amount: '' })); }} onBlur={() => touch('amount', () => validateExpense({ description, amount, date }))} keyboardType="decimal-pad" />
        {errors.amount ? <Text className="text-xs text-error mb-3">{errors.amount}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Date</Text>
        <DateInput value={date} onChange={(d) => { setDate(d); if (errors.date) setErrors((p) => ({ ...p, date: '' })); }} error={errors.date} />
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Category</Text>
        <View className="flex-row flex-wrap gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <TouchableOpacity key={cat.value} className={`w-[30%] items-center py-4 rounded-lg border gap-2 ${isSelected ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`} onPress={() => setCategory(cat.value)}>
                <Ionicons name={cat.icon} size={22} color={isSelected ? colors.onPrimary : colors.neutral[500]} />
                <Text className={`text-sm font-medium ${isSelected ? 'text-onPrimary' : 'text-neutral-600'}`}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-2">Link to livestock</Text>
        <Text className="text-sm text-neutral-500 mb-3">Optional. Link this expense to one animal or group so it shows in its record.</Text>
        <LivestockPicker livestock={livestock} value={selectedDirectId} onChange={setSelectedDirectId} noneLabel="General" />
        {livestock.length === 0 && <Text className="text-xs text-neutral-500">No livestock yet — will save as general expense.</Text>}
        <Text className="text-xs text-neutral-500 mt-2">
          For feed, restock from Feed Inventory instead so stock and cost stay in sync.
        </Text>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Additional Notes</Text>
        <TextInput className={`${inputClass} min-h-[80px] pt-3 border-border`} placeholder="Optional notes..." placeholderTextColor={colors.neutral[500]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />
      </View>

      <View className="flex-row gap-3 mt-4">
        <Button title="Cancel" variant="neutral" size="lg" className="flex-1" onPress={() => router.back()} disabled={saving} />
        <Button title={saving ? 'Saving...' : 'Save Expense'} variant="primary" size="lg" className="flex-[2]" icon="checkmark-outline" loading={saving} onPress={handleSave} disabled={saving} />
      </View>

    </FormScroll>
  );
}
