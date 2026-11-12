import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { InventoryUnit, INVENTORY_UNITS } from '../../features/inventory/types';
import { UNIT_LABELS } from '../../features/inventory/inventoryMeta';
import * as inventoryService from '../../features/inventory/services/inventoryService';
import { AnimalType } from '../../features/animalTypes/types';
import { getAll as getAllTypes } from '../../features/animalTypes/services/animalTypeService';
import { log as logActivity } from '../../features/activity/services/activityService';
import { toUserMessage } from '../../lib/utils/errors';

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function InventoryFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [name, setName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [unit, setUnit] = useState<InventoryUnit>('kg');
  const [openingQuantity, setOpeningQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [notes, setNotes] = useState('');
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getAllTypes();
      setTypes(t);
      if (isEdit) {
        const item = await inventoryService.getById(id as string);
        if (item) {
          setName(item.name);
          setSelectedTypes(item.animalTypeIds);
          setUnit(item.unit);
          setUnitCost(String(item.unitCost));
          setNotes(item.notes ?? '');
          setCurrentStock(item.quantity);
        }
      }
      setLoading(false);
    })();
  }, [id, isEdit]);

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) => (prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]));
  };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    const opening = isEdit ? 0 : Number(openingQuantity || '0');
    if (!isEdit && (!Number.isFinite(opening) || opening < 0)) e.openingQuantity = 'Enter a valid quantity';
    const cost = Number(unitCost || '0');
    if (!isEdit && (!Number.isFinite(cost) || cost < 0)) e.unitCost = 'Enter a valid cost';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit) {
        await inventoryService.update(id as string, {
          name: name.trim(),
          animalTypeIds: selectedTypes,
          unit,
          notes: notes.trim() || undefined,
        });
      } else {
        const item = await inventoryService.create({
          name: name.trim(),
          animalTypeIds: selectedTypes,
          unit,
          openingQuantity: opening,
          unitCost: cost,
          notes: notes.trim() || undefined,
        });
        await logActivity({
          id: `act-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          type: 'expense_added',
          description: `Inventory item added: ${item.name} (${item.quantity} ${UNIT_LABELS[item.unit]})`,
        });
      }
      router.back();
    } catch (err) {
      setErrors({ form: toUserMessage(err, 'Could not save the feed item.') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete feed item?', 'Stock history for this feed will also be removed. Recorded purchase expenses are kept.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await inventoryService.remove(id as string);
            router.replace('/inventory');
          } catch (err) {
            Alert.alert('Could not delete', toUserMessage(err, 'Could not delete this feed item.'));
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
        <Text className="text-lg font-semibold text-neutral-800 mb-4">{isEdit ? 'Edit Feed Item' : 'New Feed Item'}</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Feed name *</Text>
        <TextInput
          className={`${inputClass} ${errors.name ? 'border-error' : 'border-border'}`}
          placeholder="e.g., Broiler finisher pellets"
          placeholderTextColor={colors.neutral[500]}
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (errors.name) setErrors((p) => ({ ...p, name: '' }));
          }}
        />
        {errors.name ? <Text className="text-xs text-error mb-3">{errors.name}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Suitable for</Text>
        <Text className="text-xs text-neutral-500 mb-2">Leave empty to allow this feed for any animal type.</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {types.map((t) => {
            const selected = selectedTypes.includes(t.id);
            return (
              <TouchableOpacity
                key={t.id}
                className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border ${selected ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
                onPress={() => toggleType(t.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text className={`text-sm font-medium ${selected ? 'text-onPrimary' : 'text-neutral-600'}`}>{t.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Unit</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {INVENTORY_UNITS.map((u) => {
            const selected = unit === u;
            return (
              <TouchableOpacity
                key={u}
                className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border ${selected ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
                onPress={() => setUnit(u)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text className={`text-sm font-medium ${selected ? 'text-onPrimary' : 'text-neutral-600'}`}>{UNIT_LABELS[u]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isEdit ? (
          <View className="bg-card border border-border rounded-lg px-4 py-3 mb-4">
            <Text className="text-sm text-neutral-500">Current stock</Text>
            <Text className="text-base font-semibold text-neutral-800 mt-1">
              {currentStock} {UNIT_LABELS[unit]} · ₱{Number(unitCost || '0').toFixed(2)} per {UNIT_LABELS[unit]}
            </Text>
            <Text className="text-xs text-neutral-500 mt-1">Use Restock on the item page to add stock and update the average cost.</Text>
          </View>
        ) : (
          <>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Opening stock ({UNIT_LABELS[unit]})</Text>
            <TextInput
              className={`${inputClass} ${errors.openingQuantity ? 'border-error' : 'border-border'}`}
              placeholder="e.g., 50"
              placeholderTextColor={colors.neutral[500]}
              value={openingQuantity}
              onChangeText={(v) => {
                setOpeningQuantity(v);
                if (errors.openingQuantity) setErrors((p) => ({ ...p, openingQuantity: '' }));
              }}
              keyboardType="decimal-pad"
            />
            {errors.openingQuantity ? <Text className="text-xs text-error mb-3">{errors.openingQuantity}</Text> : <View className="mb-3" />}

            <Text className="text-sm font-medium text-neutral-600 mb-2">Cost per {UNIT_LABELS[unit]} (₱)</Text>
            <TextInput
              className={`${inputClass} ${errors.unitCost ? 'border-error' : 'border-border'}`}
              placeholder="e.g., 55.00"
              placeholderTextColor={colors.neutral[500]}
              value={unitCost}
              onChangeText={(v) => {
                setUnitCost(v);
                if (errors.unitCost) setErrors((p) => ({ ...p, unitCost: '' }));
              }}
              keyboardType="decimal-pad"
            />
            {errors.unitCost ? <Text className="text-xs text-error mb-3">{errors.unitCost}</Text> : <View className="mb-3" />}
            <Text className="text-xs text-neutral-500 mb-3">
              Opening stock with a cost is recorded once as a feed expense.
            </Text>
          </>
        )}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
        <TextInput
          className={`${inputClass} min-h-[80px] pt-3 mb-3`}
          placeholder="Optional notes..."
          placeholderTextColor={colors.neutral[500]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View className="flex-row gap-3 mt-4">
        {isEdit && (
          <TouchableOpacity className="w-14 py-4 rounded-lg border border-error items-center" onPress={handleDelete} disabled={deleting} accessibilityRole="button" accessibilityLabel="Delete">
            {deleting ? <ActivityIndicator size="small" color={colors.error} /> : <Ionicons name="trash-outline" size={18} color={colors.error} />}
          </TouchableOpacity>
        )}
        <Button title="Cancel" variant="neutral" size="lg" className="flex-1" onPress={() => router.back()} disabled={saving} />
        <Button title={saving ? 'Saving...' : isEdit ? 'Save' : 'Add Feed'} variant="primary" size="lg" className="flex-[2]" icon="checkmark-outline" loading={saving} onPress={handleSave} disabled={saving} />
      </View>

    </FormScroll>
  );
}
