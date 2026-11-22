import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { InventoryItem } from '../../features/inventory/types';
import { UNIT_LABELS } from '../../features/inventory/inventoryMeta';
import {
  adjust as adjustStock,
  getById as getInventoryById,
  AdjustDirection,
} from '../../features/inventory/services/inventoryService';
import { safeLog } from '../../features/activity/services/activityService';
import { toUserMessage } from '../../lib/utils/errors';
import { DateInput } from '../../components/ui/DateInput';
import { formatQuantity } from '../../lib/utils/format';

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

const DIRECTIONS: { key: AdjustDirection; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'add', label: 'Add stock', icon: 'add-circle-outline' },
  { key: 'remove', label: 'Remove stock', icon: 'remove-circle-outline' },
];

export default function AdjustStockScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<AdjustDirection>('add');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (id) setItem((await getInventoryById(id)) ?? null);
      setLoading(false);
    })();
  }, [id]);

  const numericQuantity = useMemo(() => {
    const n = Number(quantity);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [quantity]);

  const signed = direction === 'add' ? numericQuantity : -numericQuantity;
  const newOnHand = item ? Math.round((item.quantity + signed) * 100) / 100 : 0;
  const unit = item ? UNIT_LABELS[item.unit] : '';

  const handleSave = async () => {
    if (!item) return;
    const e: Record<string, string> = {};
    if (numericQuantity <= 0) e.quantity = 'Enter a quantity greater than zero';
    else if (newOnHand < 0) e.quantity = `Only ${formatQuantity(item.quantity)} ${unit} on hand`;
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const result = await adjustStock(item.id, {
        date,
        quantity: numericQuantity,
        direction,
        notes: notes.trim() || undefined,
      });
      await safeLog({
        id: `act-${Date.now()}`,
        date,
        type: 'stock_adjustment',
        description: `${item.name} stock ${result.delta > 0 ? '+' : '−'}${formatQuantity(Math.abs(result.delta))} ${unit} → ${formatQuantity(result.newQuantity)} left`,
      });
      router.back();
    } catch (err) {
      setErrors({ form: toUserMessage(err, 'Could not save the adjustment.') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary[600]} />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-neutral-500">Feed item not found</Text>
      </View>
    );
  }

  return (
    <FormScroll>
      {errors.form ? <Text className="text-sm text-error mb-3">{errors.form}</Text> : null}

      <View className="bg-card border border-border rounded-lg px-4 py-3 mb-5">
        <Text className="text-sm text-neutral-500">Adjusting</Text>
        <Text className="text-base font-semibold text-neutral-800 mt-1">{item.name}</Text>
        <Text className="text-sm text-neutral-500 mt-1">
          On hand: {formatQuantity(item.quantity)} {unit} · ₱{item.unitCost.toFixed(2)} / {unit}
        </Text>
      </View>

      <Text className="text-sm font-medium text-neutral-600 mb-2">Direction *</Text>
      <View className="flex-row gap-2 mb-4">
        {DIRECTIONS.map((d) => {
          const selected = direction === d.key;
          return (
            <TouchableOpacity
              key={d.key}
              className="flex-1 min-h-11 flex-row items-center justify-center gap-2 py-3 rounded-lg border"
              onPress={() => setDirection(d.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={d.label}
            >
              <Ionicons name={d.icon} size={18} color={selected ? colors.onPrimary : colors.neutral[500]} />
              <Text className={`text-sm font-medium ${selected ? 'text-onPrimary' : 'text-neutral-600'}`}>{d.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text className="text-sm font-medium text-neutral-600 mb-2">
        Quantity to {direction === 'add' ? 'add' : 'remove'} ({unit}) *
      </Text>
      <TextInput
        className={`${inputClass} ${errors.quantity ? 'border-error' : 'border-border'}`}
        placeholder="e.g. 5"
        placeholderTextColor={colors.neutral[500]}
        value={quantity}
        onChangeText={(v) => {
          setQuantity(v);
          if (errors.quantity) setErrors((p) => ({ ...p, quantity: '' }));
        }}
        keyboardType="decimal-pad"
        accessibilityLabel="Quantity to adjust"
      />
      {errors.quantity ? <Text className="text-xs text-error mb-3">{errors.quantity}</Text> : <View className="mb-3" />}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Date</Text>
      <DateInput value={date} onChange={setDate} />
      <View className="mb-3" />

      <Text className="text-sm font-medium text-neutral-600 mb-2">Reason</Text>
      <TextInput
        className={`${inputClass} min-h-[70px] pt-3`}
        placeholder="e.g. Stock count correction, spilled bag"
        placeholderTextColor={colors.neutral[500]}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {numericQuantity > 0 ? (
        <View className="bg-card border border-border rounded-lg p-3 mb-3">
          <View className="flex-row justify-between py-0.5">
            <Text className="text-sm text-neutral-600">Change</Text>
            <Text className="text-sm font-semibold" style={{ color: signed >= 0 ? colors.success : colors.error }}>
              {signed >= 0 ? '+' : '−'}
              {formatQuantity(Math.abs(signed))} {unit}
            </Text>
          </View>
          <View className="flex-row justify-between py-0.5">
            <Text className="text-sm text-neutral-600">New stock on hand</Text>
            <Text className="text-sm font-semibold text-neutral-800">
              {formatQuantity(newOnHand)} {unit}
            </Text>
          </View>
          <Text className="text-xs text-neutral-500 mt-2">
            Adjustments fix counting mistakes only. They never create an expense.
          </Text>
        </View>
      ) : null}

      <View className="flex-row gap-3 mt-2">
        <Button title="Cancel" variant="neutral" size="lg" className="flex-1" onPress={() => router.back()} disabled={saving} />
        <Button
          title={saving ? 'Saving…' : 'Save adjustment'}
          variant="primary"
          size="lg"
          className="flex-[2]"
          icon="checkmark-outline"
          loading={saving}
          onPress={handleSave}
          disabled={saving}
        />
      </View>
    </FormScroll>
  );
}
