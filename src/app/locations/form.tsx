import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import * as locationService from '../../features/locations/services/locationService';
import { validateLocation } from '../../lib/utils/validate';

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function LocationFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const loc = await locationService.getById(id);
      if (loc) {
        setName(loc.name);
        setNotes(loc.notes ?? '');
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    const e = validateLocation({ name });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit) {
        await locationService.update(id, { name: name.trim(), notes: notes.trim() || undefined });
      } else {
        await locationService.create({ id: `loc-${Date.now()}`, name: name.trim(), notes: notes.trim() || undefined });
      }
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed to save') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete location?', 'Only locations with no livestock can be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await locationService.remove(id as string);
            router.back();
          } catch (err: any) {
            Alert.alert('Cannot delete', String(err?.message ?? 'Failed to delete'));
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
    <View className="flex-1 bg-background p-4">
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Location name *</Text>
      <TextInput
        className={`${inputClass} ${errors.name ? 'border-error' : 'border-border'}`}
        placeholder="e.g., North Pasture, Barn Pen B"
        placeholderTextColor={colors.neutral[400]}
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (errors.name) setErrors((p) => ({ ...p, name: '' }));
        }}
      />
      {errors.name ? <Text className="text-xs text-error mb-3">{errors.name}</Text> : <View className="mb-3" />}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Notes</Text>
      <TextInput
        className={`${inputClass} border-border`}
        placeholder="Optional notes..."
        placeholderTextColor={colors.neutral[400]}
        value={notes}
        onChangeText={setNotes}
      />
      <View className="mb-3" />

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
          {saving ? <ActivityIndicator color={colors.white} /> : <Ionicons name="checkmark" size={20} color={colors.white} />}
          <Text className="text-base font-semibold text-white">{saving ? 'Saving...' : isEdit ? 'Save' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}