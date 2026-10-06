import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { ANIMAL_TYPE_ICONS, ANIMAL_TYPE_COLORS } from '../../features/animalTypes/types';
import * as animalTypeService from '../../features/animalTypes/services/animalTypeService';
import { validateAnimalType } from '../../lib/utils/validate';

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function AnimalTypeFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(ANIMAL_TYPE_ICONS[0]);
  const [color, setColor] = useState<string>(ANIMAL_TYPE_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const t = await animalTypeService.getById(id);
      if (t) {
        setName(t.name);
        setIcon(t.icon);
        setColor(t.color);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    const e = validateAnimalType({ name, icon, color });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit) {
        await animalTypeService.update(id, { name: name.trim(), icon, color });
      } else {
        const slug = await animalTypeService.uniqueSlug(name);
        await animalTypeService.create({ id: slug, name: name.trim(), icon, color });
      }
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed to save') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete animal type?', 'Only types with no livestock can be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await animalTypeService.remove(id as string);
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

      <Text className="text-sm font-medium text-neutral-600 mb-2">Type name *</Text>
      <TextInput
        className={`${inputClass} ${errors.name ? 'border-error' : 'border-border'}`}
        placeholder="e.g., Dairy Cows, Layers"
        placeholderTextColor={colors.neutral[400]}
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (errors.name) setErrors((p) => ({ ...p, name: '' }));
        }}
      />
      {errors.name ? <Text className="text-xs text-error mb-3">{errors.name}</Text> : <View className="mb-3" />}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Icon *</Text>
      <View className="flex-row flex-wrap gap-2 mb-1">
        {ANIMAL_TYPE_ICONS.map((ic) => (
          <TouchableOpacity
            key={ic}
            className={`w-12 h-12 rounded-lg justify-center items-center border ${icon === ic ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
            onPress={() => setIcon(ic)}
          >
            <Ionicons name={ic as any} size={22} color={icon === ic ? colors.white : colors.neutral[500]} />
          </TouchableOpacity>
        ))}
      </View>
      {errors.icon ? <Text className="text-xs text-error mb-3">{errors.icon}</Text> : <View className="mb-3" />}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Color *</Text>
      <View className="flex-row flex-wrap gap-2 mb-1">
        {ANIMAL_TYPE_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            className={`w-12 h-12 rounded-full items-center justify-center border-2 ${color === c ? 'border-primary-600' : 'border-border'}`}
            style={{ backgroundColor: c }}
            onPress={() => setColor(c)}
          >
            {color === c && <Ionicons name="checkmark" size={22} color={colors.white} />}
          </TouchableOpacity>
        ))}
      </View>
      {errors.color ? <Text className="text-xs text-error mb-3">{errors.color}</Text> : <View className="mb-3" />}

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