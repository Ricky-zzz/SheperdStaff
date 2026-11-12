import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../lib/theme/ThemeContext';
import { InventoryItem } from '../../features/inventory/types';
import { UNIT_LABELS } from '../../features/inventory/inventoryMeta';
import * as inventoryService from '../../features/inventory/services/inventoryService';
import { log as logActivity } from '../../features/activity/services/activityService';
import { DateInput } from '../../components/ui/DateInput';
import { formatQuantity } from '../../lib/utils/format';
import { toUserMessage } from '../../lib/utils/errors';

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function RestockScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (id) setItem((await inventoryService.getById(id as string)) ?? null);
      setLoading(false);
    })();
  }, [id]);

  const numericQuantity = useMemo(() => {
    const n = Number(quantity);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [quantity]);

  const numericCost = useMemo(() => {
    const n = Number(totalCost);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [totalCost]);

  const previewUnitCost = useMemo(() => {
    if (!item || numericQuantity <= 0 || numericCost <= 0) return 0;
    return numericCost / numericQuantity;
  }, [item, numericQuantity, numericCost]);

  const previewAvgCost = useMemo(() => {
    if (!item || numericQuantity <= 0) return item?.unitCost ?? 0;
    const totalQty = item.quantity + numericQuantity;
    if (totalQty <= 0) return item.unitCost;
    if (numericCost <= 0) return item.unitCost;
    return (item.quantity * item.unitCost + numericCost) / totalQty;
  }, [item, numericQuantity, numericCost]);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (numericQuantity <= 0) e.quantity = 'Enter a quantity greater than zero';
    if (totalCost.trim() !== '' && Number.isNaN(Number(totalCost))) e.totalCost = 'Enter a valid amount';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const { expenseId } = await inventoryService.restock(id as string, {
        date,
        quantity: numericQuantity,
        totalCost: numericCost,
        notes: notes.trim() || undefined,
      });
      if (expenseId && item) {
        await logActivity({
          id: `act-${Date.now()}`,
          date,
          type: 'expense_added',
          description: `Feed restock: ${item.name} (${numericQuantity} ${UNIT_LABELS[item.unit]}) ₱${numericCost.toFixed(2)}`,
          expenseId,
        });
      }
      router.back();
    } catch (err) {
      setErrors({ form: toUserMessage(err, 'Could not record the restock.') });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !item) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <FormScroll>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="bg-card border border-border rounded-lg px-4 py-3 mb-5">
        <Text className="text-sm text-neutral-500">Restocking</Text>
        <Text className="text-base font-semibold text-neutral-800 mt-1">{item.name}</Text>
        <Text className="text-sm text-neutral-500 mt-1">
          On hand: {formatQuantity(item.quantity)} {UNIT_LABELS[item.unit]} · ₱{item.unitCost.toFixed(2)} / {UNIT_LABELS[item.unit]}
        </Text>
      </View>

      <Text className="text-sm font-medium text-neutral-600 mb-2">Quantity added ({UNIT_LABELS[item.unit]}) *</Text>
      <TextInput
        className={`${inputClass} ${errors.quantity ? 'border-error' : 'border-border'}`}
        placeholder="e.g., 50"
        placeholderTextColor={colors.neutral[500]}
        value={quantity}
        onChangeText={(v) => {
          setQuantity(v);
          if (errors.quantity) setErrors((p) => ({ ...p, quantity: '' }));
        }}
        keyboardType="decimal-pad"
      />
      {errors.quantity ? <Text className="text-xs text-error mb-3">{errors.quantity}</Text> : <View className="mb-3" />}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Total purchase cost (₱)</Text>
      <TextInput
        className={`${inputClass} ${errors.totalCost ? 'border-error' : 'border-border'}`}
        placeholder="e.g., 2750.00 (leave empty if not purchased)"
        placeholderTextColor={colors.neutral[500]}
        value={totalCost}
        onChangeText={(v) => {
          setTotalCost(v);
          if (errors.totalCost) setErrors((p) => ({ ...p, totalCost: '' }));
        }}
        keyboardType="decimal-pad"
      />
      {errors.totalCost ? <Text className="text-xs text-error mb-3">{errors.totalCost}</Text> : <View className="mb-3" />}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Date</Text>
      <DateInput value={date} onChange={setDate} />
      <View className="mb-3" />

      <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
      <TextInput
        className={`${inputClass} min-h-[70px] pt-3 mb-3`}
        placeholder="e.g., Bought from agri supply"
        placeholderTextColor={colors.neutral[500]}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {numericQuantity > 0 && (
        <View className="bg-card border border-border rounded-lg p-3 mb-3">
          {numericCost > 0 ? (
            <View className="flex-row justify-between py-0.5">
              <Text className="text-sm text-neutral-600">Purchase unit cost</Text>
              <Text className="text-sm font-semibold text-neutral-800">₱{previewUnitCost.toFixed(2)} / {UNIT_LABELS[item.unit]}</Text>
            </View>
          ) : null}
          <View className="flex-row justify-between py-0.5">
            <Text className="text-sm text-neutral-600">New stock on hand</Text>
            <Text className="text-sm font-semibold text-neutral-800">
              {formatQuantity(item.quantity + numericQuantity)} {UNIT_LABELS[item.unit]}
            </Text>
          </View>
          <View className="flex-row justify-between py-0.5">
            <Text className="text-sm text-neutral-600">New average cost</Text>
            <Text className="text-sm font-semibold text-neutral-800">₱{previewAvgCost.toFixed(2)} / {UNIT_LABELS[item.unit]}</Text>
          </View>
          {numericCost > 0 ? (
            <Text className="text-xs text-neutral-500 mt-2">
              ₱{numericCost.toFixed(2)} will be recorded as a feed expense on {date}.
            </Text>
          ) : null}
        </View>
      )}

      <View className="flex-row gap-3 mt-2">
        <Button title="Cancel" variant="neutral" size="lg" className="flex-1" onPress={() => router.back()} disabled={saving} />
        <Button title={saving ? 'Saving...' : 'Add Stock'} variant="primary" size="lg" className="flex-[2]" icon="checkmark-outline" loading={saving} onPress={handleSave} disabled={saving} />
      </View>

    </FormScroll>
  );
}
