import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { LivestockType, LivestockStatus } from '../../features/livestock/types';
import { getById, update } from '../../features/livestock/services/livestockService';
import { AnimalType } from '../../features/animalTypes/types';
import { getAll as getAllTypes } from '../../features/animalTypes/services/animalTypeService';
import { Location } from '../../features/locations/types';
import { getAll as getAllLocations } from '../../features/locations/services/locationService';
import { log as logActivity } from '../../features/activity/services/activityService';
import { validateLivestock } from '../../lib/utils/validate';
import { getCodeLabel } from '../../lib/utils/livestockCode';
import { DateInput } from '../../components/ui/DateInput';
import { Select } from '../../components/ui/Select';

const STATUSES: { label: string; value: LivestockStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Growing', value: 'growing' },
  { label: 'Breeding', value: 'breeding' },
  { label: 'For Sale', value: 'for_sale' },
  { label: 'Sold', value: 'sold' },
  { label: 'Deceased', value: 'deceased' },
];

const baseInput = 'bg-card border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function EditLivestockScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<LivestockType>('individual');
  const [category, setCategory] = useState('cattle');
  const [breed, setBreed] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sex, setSex] = useState<'male' | 'female' | 'mixed'>('female');
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<LivestockStatus>('active');
  const [notes, setNotes] = useState('');
  const [initialStatus, setInitialStatus] = useState<LivestockStatus>('active');
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [l, t, locs] = await Promise.all([getById(id as string), getAllTypes(), getAllLocations()]);
      if (!l) {
        Alert.alert('Not found', 'Livestock not found');
        router.back();
        return;
      }
      setCode(l.code);
      setName(l.name);
      setType(l.type);
      setCategory(l.category);
      setBreed(l.breed ?? '');
      setQuantity(String(l.quantity));
      setSex(l.sex ?? 'female');
      setLocation(l.location);
      setPurpose(l.purpose);
      setStartDate(l.startDate);
      setStatus(l.status);
      setInitialStatus(l.status);
      setNotes(l.notes ?? '');
      setTypes(t);
      setLocations(locs);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const typeOptions: AnimalType[] = types.some((t) => t.id === category)
    ? types
    : [{ id: category, name: category, color: '#78716C', createdAt: '' }, ...types];
  const locationOptions: Location[] = locations.some((l) => l.name === location) || !location
    ? locations
    : [{ id: 'current', name: location, createdAt: '' }, ...locations];

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    const e = validateLivestock({ name, type, quantity, location });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await update(id as string, {
        name: name.trim(),
        category,
        type,
        quantity: type === 'group' ? parseInt(quantity, 10) : 1,
        breed: breed.trim() || undefined,
        sex,
        startDate,
        location: location.trim(),
        purpose: purpose.trim() || 'General',
        status,
        notes: notes.trim() || undefined,
      });
      const today = new Date().toISOString().slice(0, 10);
      const desc = status !== initialStatus ? `${name.trim()} status changed to ${status}` : `${name.trim()} updated`;
      const typeLog = status !== initialStatus ? 'status_change' : 'health_note';
      await logActivity({
        id: `act-${Date.now()}`,
        date: today,
        type: typeLog as any,
        description: desc,
        livestockId: id as string,
      });
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed to save') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center py-20">
        <ActivityIndicator color={colors.primary[600]} />
      </View>
    );
  }

  const inputClass = (field: string) => `${baseInput} ${errors[field] ? 'border-error' : 'border-border'} mb-1`;
  const touch = (field: 'name' | 'quantity') =>
    setErrors((prev) => ({ ...prev, [field]: validateLivestock({ name, type, quantity, location })[field] ?? '' }));

  return (
    <FormScroll>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Edit Information</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Name *</Text>
        <TextInput className={inputClass('name')} placeholder="Name" placeholderTextColor={colors.neutral[500]} value={name} onChangeText={(v) => { setName(v); if (errors.name) setErrors((p) => ({ ...p, name: '' })); }} onBlur={() => touch('name')} />
        {errors.name ? <Text className="text-xs text-error mb-3">{errors.name}</Text> : <View className="mb-3" />}

        {code ? (
          <View className="bg-card border border-border rounded-lg px-4 py-3 mb-4 flex-row justify-between items-center">
            <Text className="text-sm text-neutral-500">{getCodeLabel(type)}</Text>
            <Text className="text-sm font-semibold text-neutral-800">{code}</Text>
          </View>
        ) : null}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Type</Text>
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${type === 'individual' ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`} onPress={() => setType('individual')}>
            <Ionicons name="person-outline" size={18} color={type === 'individual' ? colors.onPrimary : colors.neutral[500]} />
            <Text className={`text-base font-medium ${type === 'individual' ? 'text-onPrimary' : 'text-neutral-500'}`}>Individual</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${type === 'group' ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`} onPress={() => setType('group')}>
            <Ionicons name="people-outline" size={18} color={type === 'group' ? colors.onPrimary : colors.neutral[500]} />
            <Text className={`text-base font-medium ${type === 'group' ? 'text-onPrimary' : 'text-neutral-500'}`}>Group/Batch</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Category *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {typeOptions.map((t) => (
            <TouchableOpacity
              key={t.id}
              className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border ${category === t.id ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => setCategory(t.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: category === t.id }}
            >
              <Text className={`text-sm font-medium ${category === t.id ? 'text-onPrimary' : 'text-neutral-600'}`}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Breed</Text>
        <TextInput className={inputClass('breed')} placeholder="Breed" placeholderTextColor={colors.neutral[500]} value={breed} onChangeText={setBreed} />
        <View className="mb-3" />

        {type === 'group' && (
          <>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Quantity *</Text>
            <TextInput className={inputClass('quantity')} placeholder="Number" placeholderTextColor={colors.neutral[500]} value={quantity} onChangeText={(v) => { setQuantity(v); if (errors.quantity) setErrors((p) => ({ ...p, quantity: '' })); }} onBlur={() => touch('quantity')} keyboardType="numeric" />
            {errors.quantity ? <Text className="text-xs text-error mb-3">{errors.quantity}</Text> : <View className="mb-3" />}
          </>
        )}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Sex</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {(['male', 'female', 'mixed'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border ${sex === s ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => setSex(s)}
              accessibilityRole="button"
              accessibilityState={{ selected: sex === s }}
            >
              <Text className={`text-sm font-medium ${sex === s ? 'text-onPrimary' : 'text-neutral-600'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-neutral-600">Location *</Text>
          <TouchableOpacity
            onPress={() => router.push('/locations')}
            className="px-2 py-2 -my-2 -mr-2"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Manage locations"
          >
            <Text className="text-sm font-medium text-primary-600">Manage ›</Text>
          </TouchableOpacity>
        </View>
        <Select
          selectedValue={location}
          onValueChange={(v) => {
            setLocation(v);
            if (errors.location) setErrors((p) => ({ ...p, location: '' }));
          }}
          options={locationOptions.map((loc) => ({ label: loc.name, value: loc.name }))}
          placeholder="Select location"
          error={errors.location}
        />
        {errors.location ? <Text className="text-xs text-error mb-3">{errors.location}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Purpose</Text>
        <TextInput className={inputClass('purpose')} placeholder="Purpose" placeholderTextColor={colors.neutral[500]} value={purpose} onChangeText={setPurpose} />
        <View className="mb-3" />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Start Date</Text>
        <DateInput value={startDate} onChange={setStartDate} />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Status</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border ${status === s.value ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => setStatus(s.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: status === s.value }}
            >
              <Text className={`text-sm font-medium ${status === s.value ? 'text-onPrimary' : 'text-neutral-600'}`}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
        <TextInput className={`${baseInput} min-h-[100px] pt-3 mb-4 border-border`} placeholder="Notes..." placeholderTextColor={colors.neutral[500]} value={notes} onChangeText={setNotes} multiline numberOfLines={4} textAlignVertical="top" />
      </View>

      <View className="flex-row gap-3 mt-4">
        <Button title="Cancel" variant="neutral" size="lg" className="flex-1" onPress={() => router.back()} disabled={saving} />
        <Button title={saving ? 'Saving...' : 'Update'} variant="primary" size="lg" className="flex-[2]" icon="checkmark-outline" loading={saving} onPress={handleSave} disabled={saving} />
      </View>

    </FormScroll>
  );
}
