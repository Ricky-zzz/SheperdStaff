import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/theme/colors';
import { LivestockCategory, LivestockType, LivestockStatus } from '../../features/livestock/types';
import { getById, update } from '../../features/livestock/services/livestockService';
import { log as logActivity } from '../../features/activity/services/activityService';
import { validateLivestock } from '../../lib/utils/validate';
import { DateInput } from '../../components/ui/DateInput';

const CATEGORIES: { label: string; value: LivestockCategory }[] = [
  { label: 'Cattle', value: 'cattle' },
  { label: 'Pig', value: 'pig' },
  { label: 'Chicken', value: 'chicken' },
  { label: 'Goat', value: 'goat' },
  { label: 'Sheep', value: 'sheep' },
  { label: 'Duck', value: 'duck' },
  { label: 'Other', value: 'other' },
];

const STATUSES: { label: string; value: LivestockStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Growing', value: 'growing' },
  { label: 'Breeding', value: 'breeding' },
  { label: 'For Sale', value: 'for_sale' },
  { label: 'Sold', value: 'sold' },
  { label: 'Deceased', value: 'deceased' },
];

const baseInput = 'bg-white border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function EditLivestockScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState<LivestockType>('individual');
  const [category, setCategory] = useState<LivestockCategory>('cattle');
  const [breed, setBreed] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sex, setSex] = useState<'male' | 'female' | 'mixed'>('female');
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<LivestockStatus>('active');
  const [notes, setNotes] = useState('');
  const [initialStatus, setInitialStatus] = useState<LivestockStatus>('active');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const l = await getById(id as string);
      if (!l) {
        Alert.alert('Not found', 'Livestock not found');
        router.back();
        return;
      }
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
    } finally {
      setLoading(false);
    }
  }, [id, router]);

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
        <ActivityIndicator color={Colors.primary[600]} />
      </View>
    );
  }

  const inputClass = (field: string) => `${baseInput} ${errors[field] ? 'border-error' : 'border-border'} mb-1`;

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Edit Information</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Name *</Text>
        <TextInput className={inputClass('name')} placeholder="Name" placeholderTextColor={Colors.neutral[400]} value={name} onChangeText={(v) => { setName(v); if (errors.name) setErrors((p) => ({ ...p, name: '' })); }} />
        {errors.name ? <Text className="text-xs text-error mb-3">{errors.name}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Type</Text>
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${type === 'individual' ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setType('individual')}>
            <Ionicons name="person" size={18} color={type === 'individual' ? Colors.white : Colors.neutral[500]} />
            <Text className={`text-base font-medium ${type === 'individual' ? 'text-white' : 'text-neutral-500'}`}>Individual</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${type === 'group' ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setType('group')}>
            <Ionicons name="people" size={18} color={type === 'group' ? Colors.white : Colors.neutral[500]} />
            <Text className={`text-base font-medium ${type === 'group' ? 'text-white' : 'text-neutral-500'}`}>Group/Batch</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Category *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.value} className={`px-3 py-2 rounded-full border ${category === cat.value ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setCategory(cat.value)}>
              <Text className={`text-sm font-medium ${category === cat.value ? 'text-white' : 'text-neutral-600'}`}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Breed</Text>
        <TextInput className={inputClass('breed')} placeholder="Breed" placeholderTextColor={Colors.neutral[400]} value={breed} onChangeText={setBreed} />
        <View className="mb-3" />

        {type === 'group' && (
          <>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Quantity *</Text>
            <TextInput className={inputClass('quantity')} placeholder="Number" placeholderTextColor={Colors.neutral[400]} value={quantity} onChangeText={(v) => { setQuantity(v); if (errors.quantity) setErrors((p) => ({ ...p, quantity: '' })); }} keyboardType="numeric" />
            {errors.quantity ? <Text className="text-xs text-error mb-3">{errors.quantity}</Text> : <View className="mb-3" />}
          </>
        )}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Sex</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {(['male', 'female', 'mixed'] as const).map((s) => (
            <TouchableOpacity key={s} className={`px-3 py-2 rounded-full border ${sex === s ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setSex(s)}>
              <Text className={`text-sm font-medium ${sex === s ? 'text-white' : 'text-neutral-600'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Location *</Text>
        <TextInput className={inputClass('location')} placeholder="Location" placeholderTextColor={Colors.neutral[400]} value={location} onChangeText={(v) => { setLocation(v); if (errors.location) setErrors((p) => ({ ...p, location: '' })); }} />
        {errors.location ? <Text className="text-xs text-error mb-3">{errors.location}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Purpose</Text>
        <TextInput className={inputClass('purpose')} placeholder="Purpose" placeholderTextColor={Colors.neutral[400]} value={purpose} onChangeText={setPurpose} />
        <View className="mb-3" />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Start Date</Text>
        <DateInput value={startDate} onChange={setStartDate} />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Status</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => (
            <TouchableOpacity key={s.value} className={`px-3 py-2 rounded-full border ${status === s.value ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`} onPress={() => setStatus(s.value)}>
              <Text className={`text-sm font-medium ${status === s.value ? 'text-white' : 'text-neutral-600'}`}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
        <TextInput className={`${baseInput} min-h-[100px] pt-3 mb-4 border-border`} placeholder="Notes..." placeholderTextColor={Colors.neutral[400]} value={notes} onChangeText={setNotes} multiline numberOfLines={4} textAlignVertical="top" />
      </View>

      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity className="flex-1 py-4 rounded-lg border border-border items-center" onPress={() => router.back()} disabled={saving}>
          <Text className="text-base font-semibold text-neutral-600">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-[2] flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600" onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Ionicons name="checkmark" size={20} color={Colors.white} />}
          <Text className="text-base font-semibold text-white">{saving ? 'Saving...' : 'Update'}</Text>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
