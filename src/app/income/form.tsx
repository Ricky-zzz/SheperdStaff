import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { Livestock } from '../../features/livestock/types';
import { getAll as getAllLivestock, updateStatus } from '../../features/livestock/services/livestockService';
import { log as logActivity } from '../../features/activity/services/activityService';
import type { IncomeCategory } from '../../features/income/types';
import { getIncomeCategoryMeta } from '../../features/income/incomeMeta';
import * as incomeService from '../../features/income/services/incomeService';
import { required, dateValid } from '../../lib/utils/validate';
import { DateInput } from '../../components/ui/DateInput';

const CATEGORIES: IncomeCategory[] = ['sale', 'milk', 'eggs', 'other'];

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function IncomeFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [category, setCategory] = useState<IncomeCategory>('sale');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [livestockId, setLivestockId] = useState<string | null>(null);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [markSold, setMarkSold] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const [ls, inc] = await Promise.all([getAllLivestock(), id ? incomeService.getById(id) : null]);
      setLivestock(ls);
      if (inc) {
        setCategory(inc.category);
        setDescription(inc.description);
        setAmount(String(inc.amount));
        setDate(inc.date);
        setLivestockId(inc.livestockId ?? null);
        setNotes(inc.notes ?? '');
      }
      setLoading(false);
    })();
  }, [id]);

  const meta = getIncomeCategoryMeta(category, colors);
  const showSoldToggle = category === 'sale' && !!livestockId && !isEdit;

  const handleSave = async () => {
    const e: Record<string, string> = {};
    const d = required(description);
    if (d) e.description = d;
    const dv = dateValid(date);
    if (dv) e.date = dv;
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) e.amount = 'Enter a valid amount';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        category,
        description: description.trim(),
        amount: numericAmount,
        date,
        livestockId: livestockId || undefined,
        notes: notes.trim() || undefined,
      };
      if (isEdit) {
        await incomeService.update(id, payload);
      } else {
        await incomeService.create({ id: `inc-${Date.now()}`, ...payload });
        if (markSold && livestockId) {
          await updateStatus(livestockId, 'sold');
          await logActivity({
            id: `act-${Date.now()}`,
            date,
            type: 'sale',
            description: `Sold for ₱${numericAmount.toFixed(2)}: ${description.trim()}`,
            livestockId,
          });
        } else {
          await logActivity({
            id: `act-${Date.now()}`,
            date,
            type: 'income',
            description: `${meta.label} income: ${description.trim()} ₱${numericAmount.toFixed(2)}`,
            livestockId: livestockId || undefined,
          });
        }
      }
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed to save') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete income?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await incomeService.remove(id as string);
            router.back();
          } catch (err: any) {
            setErrors({ form: String(err?.message ?? 'Failed to delete') });
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <FormScroll>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">{isEdit ? 'Edit Income' : 'Record Income'}</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Category *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORIES.map((c) => {
            const m = getIncomeCategoryMeta(c, colors);
            const sel = category === c;
            return (
              <TouchableOpacity
                key={c}
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${sel ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
                onPress={() => setCategory(c)}
              >
                <Ionicons name={m.icon} size={16} color={sel ? colors.white : m.color} />
                <Text className={`text-sm font-medium ${sel ? 'text-white' : 'text-neutral-600'}`}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Description *</Text>
        <TextInput
          className={`${inputClass} ${errors.description ? 'border-error' : 'border-border'}`}
          placeholder="e.g., Sold 4 hogs, Weekly egg surplus"
          placeholderTextColor={colors.neutral[400]}
          value={description}
          onChangeText={(v) => {
            setDescription(v);
            if (errors.description) setErrors((p) => ({ ...p, description: '' }));
          }}
        />
        {errors.description ? <Text className="text-xs text-error mb-3">{errors.description}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Amount (₱) *</Text>
        <TextInput
          className={`${inputClass} ${errors.amount ? 'border-error' : 'border-border'}`}
          placeholder="0.00"
          placeholderTextColor={colors.neutral[400]}
          value={amount}
          onChangeText={(v) => {
            setAmount(v);
            if (errors.amount) setErrors((p) => ({ ...p, amount: '' }));
          }}
          keyboardType="decimal-pad"
        />
        {errors.amount ? <Text className="text-xs text-error mb-3">{errors.amount}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Date *</Text>
        <DateInput value={date} onChange={setDate} error={errors.date} />
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Link to livestock (optional)</Text>
        <View className="flex-row flex-wrap gap-2 mb-1">
          <TouchableOpacity
            className={`px-3 py-2 rounded-full border ${!livestockId ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
            onPress={() => setLivestockId(null)}
          >
            <Text className={`text-sm ${!livestockId ? 'text-white' : 'text-neutral-600'}`}>None</Text>
          </TouchableOpacity>
          {livestock.map((l) => (
            <TouchableOpacity
              key={l.id}
              className={`px-3 py-2 rounded-full border ${livestockId === l.id ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => setLivestockId(l.id)}
            >
              <Text className={`text-sm ${livestockId === l.id ? 'text-white' : 'text-neutral-600'}`}>{l.name} · {l.quantity} head</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showSoldToggle && (
        <View className="flex-row items-center justify-between bg-card border border-border rounded-lg px-4 py-3 mb-5">
          <View className="flex-1">
            <Text className="text-sm font-medium text-neutral-700">Mark livestock as sold</Text>
            <Text className="text-xs text-neutral-400 mt-0.5">Flips status to Sold and logs a sale activity</Text>
          </View>
          <TouchableOpacity
            className={`w-12 h-7 rounded-full justify-center px-1 ${markSold ? 'bg-success' : 'bg-neutral-300'}`}
            onPress={() => setMarkSold((v) => !v)}
          >
            <View className={`w-5 h-5 rounded-full bg-white ${markSold ? 'self-end' : 'self-start'}`} />
          </TouchableOpacity>
        </View>
      )}

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
        <TextInput
          className={`${inputClass} border-border`}
          placeholder="Optional notes..."
          placeholderTextColor={colors.neutral[400]}
          value={notes}
          onChangeText={setNotes}
        />
        <View className="mb-3" />
      </View>

      <View className="flex-row gap-3 mt-4">
        {isEdit && (
          <TouchableOpacity className="w-14 py-4 rounded-lg border border-error items-center" onPress={handleDelete} disabled={deleting}>
            {deleting ? <ActivityIndicator size="small" color={colors.error} /> : <Ionicons name="trash-outline" size={18} color={colors.error} />}
          </TouchableOpacity>
        )}
        <TouchableOpacity className="flex-1 py-4 rounded-lg border border-border items-center" onPress={() => router.back()} disabled={saving}>
          <Text className="text-base font-semibold text-neutral-600">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-[2] flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600" onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.white} /> : <Ionicons name="checkmark-outline" size={20} color={colors.white} />}
          <Text className="text-base font-semibold text-white">{saving ? 'Saving...' : isEdit ? 'Save' : 'Record'}</Text>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </FormScroll>
  );
}