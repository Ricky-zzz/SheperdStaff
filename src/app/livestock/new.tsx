import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { LivestockType, LivestockStatus } from '../../features/livestock/types';
import { create as createLivestock } from '../../features/livestock/services/livestockService';
import { AnimalType } from '../../features/animalTypes/types';
import { getAll as getAllTypes } from '../../features/animalTypes/services/animalTypeService';
import { Location } from '../../features/locations/types';
import { getAll as getAllLocations } from '../../features/locations/services/locationService';
import { log as logActivity } from '../../features/activity/services/activityService';
import { validateLivestock } from '../../lib/utils/validate';
import { DateInput } from '../../components/ui/DateInput';

const STATUSES: { label: string; value: LivestockStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Growing', value: 'growing' },
  { label: 'Breeding', value: 'breeding' },
  { label: 'For Sale', value: 'for_sale' },
];

const baseInput = 'bg-card border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function AddLivestockScreen() {
  const { colors } = useTheme();
  const router = useRouter();
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
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, l] = await Promise.all([getAllTypes(), getAllLocations()]);
      setTypes(t);
      setLocations(l);
      setCategory((prev) => (t.some((x) => x.id === prev) ? prev : t[0]?.id ?? prev));
    })();
  }, []);

  const handleSave = async () => {
    const e = validateLivestock({ name, type, quantity, location });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const id = `livestock-${Date.now()}`;
      const today = new Date().toISOString().slice(0, 10);
      await createLivestock({
        id,
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
        healthNotes: [],
        feedings: [],
        expenseIds: [],
      });
      await logActivity({
        id: `act-${Date.now()}`,
        date: today,
        type: 'livestock_added',
        description: `${name.trim()} added (${type === 'group' ? quantity + ' head' : 'individual'})`,
        livestockId: id,
      });
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed to save') });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field: string) =>
    `${baseInput} ${errors[field] ? 'border-error' : 'border-border'} mb-1`;

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Basic Information</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Name *</Text>
        <TextInput
          className={inputClass('name')}
          placeholder="e.g., Bessie or Chicken Batch 01"
          placeholderTextColor={colors.neutral[400]}
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (errors.name) setErrors((p) => ({ ...p, name: '' }));
          }}
        />
        {errors.name ? <Text className="text-xs text-error mb-3">{errors.name}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Type</Text>
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${type === 'individual' ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
            onPress={() => setType('individual')}
          >
            <Ionicons name="person" size={18} color={type === 'individual' ? colors.white : colors.neutral[500]} />
            <Text className={`text-base font-medium ${type === 'individual' ? 'text-white' : 'text-neutral-500'}`}>Individual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${type === 'group' ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
            onPress={() => setType('group')}
          >
            <Ionicons name="people" size={18} color={type === 'group' ? colors.white : colors.neutral[500]} />
            <Text className={`text-base font-medium ${type === 'group' ? 'text-white' : 'text-neutral-500'}`}>Group/Batch</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Category *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {types.map((t) => (
            <TouchableOpacity
              key={t.id}
              className={`px-3 py-2 rounded-full border ${category === t.id ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => setCategory(t.id)}
            >
              <Text className={`text-sm font-medium ${category === t.id ? 'text-white' : 'text-neutral-600'}`}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Breed</Text>
        <TextInput
          className={inputClass('breed')}
          placeholder="e.g., Holstein, Rhode Island Red"
          placeholderTextColor={colors.neutral[400]}
          value={breed}
          onChangeText={setBreed}
        />
        <View className="mb-3" />

        {type === 'group' && (
          <>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Quantity *</Text>
            <TextInput
              className={inputClass('quantity')}
              placeholder="Number of animals"
              placeholderTextColor={colors.neutral[400]}
              value={quantity}
              onChangeText={(v) => {
                setQuantity(v);
                if (errors.quantity) setErrors((p) => ({ ...p, quantity: '' }));
              }}
              keyboardType="numeric"
            />
            {errors.quantity ? <Text className="text-xs text-error mb-3">{errors.quantity}</Text> : <View className="mb-3" />}
          </>
        )}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Sex</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {(['male', 'female', 'mixed'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              className={`px-3 py-2 rounded-full border ${sex === s ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => setSex(s)}
            >
              <Text className={`text-sm font-medium ${sex === s ? 'text-white' : 'text-neutral-600'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Location & Purpose</Text>

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-neutral-600">Location *</Text>
          <TouchableOpacity onPress={() => router.push('/locations')}>
            <Text className="text-sm font-medium text-primary-600">Manage →</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap gap-2 mb-1">
          {locations.map((loc) => (
            <TouchableOpacity
              key={loc.id}
              className={`px-3 py-2 rounded-full border ${location === loc.name ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => {
                setLocation(loc.name);
                if (errors.location) setErrors((p) => ({ ...p, location: '' }));
              }}
            >
              <Text className={`text-sm font-medium ${location === loc.name ? 'text-white' : 'text-neutral-600'}`}>{loc.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.location ? <Text className="text-xs text-error mb-3">{errors.location}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Purpose</Text>
        <TextInput
          className={inputClass('purpose')}
          placeholder="e.g., Dairy, Meat, Breeding, Egg production"
          placeholderTextColor={colors.neutral[400]}
          value={purpose}
          onChangeText={setPurpose}
        />
        <View className="mb-3" />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Start Date</Text>
        <DateInput value={startDate} onChange={setStartDate} />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Status</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              className={`px-3 py-2 rounded-full border ${status === s.value ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => setStatus(s.value)}
            >
              <Text className={`text-sm font-medium ${status === s.value ? 'text-white' : 'text-neutral-600'}`}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Additional Notes</Text>
        <TextInput
          className={`${baseInput} min-h-[100px] pt-3 mb-4 border-border`}
          placeholder="Any additional information..."
          placeholderTextColor={colors.neutral[400]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity className="flex-1 py-4 rounded-lg border border-border items-center" onPress={() => router.back()} disabled={saving}>
          <Text className="text-base font-semibold text-neutral-600">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-[2] flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600" onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.white} /> : <Ionicons name="checkmark" size={20} color={colors.white} />}
          <Text className="text-base font-semibold text-white">{saving ? 'Saving...' : 'Save Record'}</Text>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
