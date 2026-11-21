import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { Livestock } from '../../features/livestock/types';
import { LivestockPicker } from '../../components/ui/LivestockPicker';
import { getAll as getAllLivestock, updateStatus } from '../../features/livestock/services/livestockService';
import { log as logActivity, safeLog } from '../../features/activity/services/activityService';
import type { IncomeCategory } from '../../features/income/types';
import { getIncomeCategoryMeta } from '../../features/income/incomeMeta';
import * as incomeService from '../../features/income/services/incomeService';
import { required, dateValid } from '../../lib/utils/validate';
import { toUserMessage } from '../../lib/utils/errors';
import { DateInput } from '../../components/ui/DateInput';
import { useToast } from '../../components/ui/Toast';
import { generateId } from '../../lib/utils/ids';

const CATEGORIES: IncomeCategory[] = ['sale', 'milk', 'eggs', 'other'];

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function IncomeFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { show, showUndo } = useToast();
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
        await incomeService.create({ id: generateId('inc'), ...payload });
        if (markSold && livestockId) {
          await updateStatus(livestockId, 'sold');
          await logActivity({
            id: generateId('act'),
            date,
            type: 'sale',
            description: `Sold for ₱${numericAmount.toFixed(2)}: ${description.trim()}`,
            livestockId,
          });
        } else {
          await logActivity({
            id: generateId('act'),
            date,
            type: 'income',
            description: `${meta.label} income: ${description.trim()} ₱${numericAmount.toFixed(2)}`,
            livestockId: livestockId || undefined,
          });
        }
      }
      router.back();
    } catch (err) {
      setErrors({ form: toUserMessage(err, 'Could not save the income entry.') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete income?', 'You can undo this right after deleting.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            const snapshot = await incomeService.getById(id as string);
            await incomeService.remove(id as string);
            await safeLog({
              id: generateId('act'),
              date: new Date().toISOString().slice(0, 10),
              type: 'income',
              description: `Income deleted: ${description.trim() || 'entry'}`,
            });
            router.back();
            if (snapshot) {
              showUndo(`Deleted “${snapshot.description}”`, () => {
                // DB-level undo: re-insert the exact row.
                void (async () => {
                  try {
                    await incomeService.create(snapshot);
                  } catch (err) {
                    show(toUserMessage(err, 'Could not restore the income entry.'));
                  }
                })();
              });
            }
          } catch (err) {
            setErrors({ form: toUserMessage(err, 'Could not delete this income entry.') });
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
                className={`min-h-[44px] flex-row items-center justify-center gap-1.5 px-3 py-2 rounded-full border ${sel ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
                onPress={() => setCategory(c)}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
              >
                <Ionicons name={m.icon} size={16} color={sel ? colors.onPrimary : m.color} />
                <Text className={`text-sm font-medium ${sel ? 'text-onPrimary' : 'text-neutral-600'}`}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Description *</Text>
        <TextInput
          className={`${inputClass} ${errors.description ? 'border-error' : 'border-border'}`}
          placeholder="e.g., Sold 4 hogs, Weekly egg surplus"
          placeholderTextColor={colors.neutral[500]}
          value={description}
          onChangeText={(v) => {
            setDescription(v);
            if (errors.description) setErrors((p) => ({ ...p, description: '' }));
          }}
          onBlur={() => setErrors((p) => ({ ...p, description: required(description) ?? '' }))}
        />
        {errors.description ? <Text className="text-xs text-error mb-3">{errors.description}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Amount (₱) *</Text>
        <TextInput
          className={`${inputClass} ${errors.amount ? 'border-error' : 'border-border'}`}
          placeholder="0.00"
          placeholderTextColor={colors.neutral[500]}
          value={amount}
          onChangeText={(v) => {
            setAmount(v);
            if (errors.amount) setErrors((p) => ({ ...p, amount: '' }));
          }}
          onBlur={() =>
            setErrors((p) => ({
              ...p,
              amount: !amount || isNaN(Number(amount)) || Number(amount) <= 0 ? 'Enter a valid amount' : '',
            }))
          }
          keyboardType="decimal-pad"
        />
        {errors.amount ? <Text className="text-xs text-error mb-3">{errors.amount}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Date *</Text>
        <DateInput value={date} onChange={setDate} error={errors.date} />
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Link to livestock (optional)</Text>
        <LivestockPicker livestock={livestock} value={livestockId} onChange={setLivestockId} />
      </View>

      {showSoldToggle && (
        <View className="flex-row items-center justify-between bg-card border border-border rounded-lg px-4 py-3 mb-5">
          <View className="flex-1 mr-3">
            <Text className="text-sm font-medium text-neutral-700">Mark livestock as sold</Text>
            <Text className="text-xs text-neutral-500 mt-0.5">Flips status to Sold and logs a sale activity</Text>
          </View>
          <Switch
            value={markSold}
            onValueChange={setMarkSold}
            trackColor={{ true: colors.success, false: colors.neutral[300] }}
            accessibilityLabel="Mark livestock as sold"
          />
        </View>
      )}

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
        <TextInput
          className={`${inputClass} border-border`}
          placeholder="Optional notes..."
          placeholderTextColor={colors.neutral[500]}
          value={notes}
          onChangeText={setNotes}
        />
        <View className="mb-3" />
      </View>

      <View className="flex-row gap-3 mt-4">
        {isEdit && (
          <TouchableOpacity className="w-14 py-4 rounded-lg border border-error items-center" onPress={handleDelete} disabled={deleting} accessibilityRole="button" accessibilityLabel="Delete">
            {deleting ? <ActivityIndicator size="small" color={colors.error} /> : <Ionicons name="trash-outline" size={18} color={colors.error} />}
          </TouchableOpacity>
        )}
        <Button title="Cancel" variant="neutral" size="lg" className="flex-1" onPress={() => router.back()} disabled={saving} />
        <Button title={saving ? 'Saving...' : isEdit ? 'Save' : 'Record'} variant="primary" size="lg" className="flex-[2]" icon="checkmark-outline" loading={saving} onPress={handleSave} disabled={saving} />
      </View>

    </FormScroll>
  );
}