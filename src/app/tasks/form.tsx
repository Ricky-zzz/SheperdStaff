import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { Livestock } from '../../features/livestock/types';
import { getAll as getAllLivestock } from '../../features/livestock/services/livestockService';
import * as taskService from '../../features/tasks/services/taskService';
import { required, dateValid } from '../../lib/utils/validate';
import { DateInput } from '../../components/ui/DateInput';

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function TaskFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(taskService.todayISO());
  const [notes, setNotes] = useState('');
  const [livestockId, setLivestockId] = useState<string | null>(null);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const [ls, t] = await Promise.all([getAllLivestock(), id ? taskService.getById(id) : null]);
      setLivestock(ls);
      if (t) {
        setTitle(t.title);
        setDueDate(t.dueDate);
        setNotes(t.notes ?? '');
        setLivestockId(t.livestockId ?? null);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    const t = required(title);
    if (t) e.title = t;
    const d = dateValid(dueDate);
    if (d) e.dueDate = d;
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        dueDate,
        notes: notes.trim() || undefined,
        livestockId: livestockId || undefined,
      };
      if (isEdit) {
        await taskService.update(id, payload);
      } else {
        await taskService.create({ id: `task-${Date.now()}`, ...payload });
      }
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed to save') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete task?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await taskService.remove(id as string);
            router.back();
          } catch {
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

  const inputCls = (field: string) => `${inputClass} ${errors[field] ? 'border-error' : 'border-border'} mb-1`;

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">{isEdit ? 'Task Details' : 'New Task'}</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Task title *</Text>
        <TextInput className={inputCls('title')} placeholder="e.g., Vaccinate herd, Buy feed" placeholderTextColor={colors.neutral[400]} value={title} onChangeText={(v) => { setTitle(v); if (errors.title) setErrors((p) => ({ ...p, title: '' })); }} />
        {errors.title ? <Text className="text-xs text-error mb-3">{errors.title}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Due date *</Text>
        <DateInput value={dueDate} onChange={(d) => { setDueDate(d); if (errors.dueDate) setErrors((p) => ({ ...p, dueDate: '' })); }} error={errors.dueDate} />
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Link to livestock (optional)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity className={`px-3 py-2 rounded-full border ${!livestockId ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`} onPress={() => setLivestockId(null)}>
            <Text className={`text-sm ${!livestockId ? 'text-white' : 'text-neutral-600'}`}>None</Text>
          </TouchableOpacity>
          {livestock.map((l) => (
            <TouchableOpacity key={l.id} className={`px-3 py-2 rounded-full border ${livestockId === l.id ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`} onPress={() => setLivestockId(l.id)}>
              <Text className={`text-sm ${livestockId === l.id ? 'text-white' : 'text-neutral-600'}`}>{l.name} · {l.quantity} head</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Additional Notes</Text>
        <TextInput className={`${inputClass} min-h-[80px] pt-3 border-border`} placeholder="Optional notes..." placeholderTextColor={colors.neutral[400]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />
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
          {saving ? <ActivityIndicator color={colors.white} /> : <Ionicons name="checkmark" size={20} color={colors.white} />}
          <Text className="text-base font-semibold text-white">{saving ? 'Saving...' : isEdit ? 'Save Task' : 'Add Task'}</Text>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}