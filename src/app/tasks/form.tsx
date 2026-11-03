import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { Livestock } from '../../features/livestock/types';
import { LivestockPicker } from '../../components/ui/LivestockPicker';
import { getAll as getAllLivestock } from '../../features/livestock/services/livestockService';
import * as taskService from '../../features/tasks/services/taskService';
import { required, dateValid } from '../../lib/utils/validate';
import { DateInput } from '../../components/ui/DateInput';
import { TimeInput } from '../../components/ui/TimeInput';
import { TaskRecurrence } from '../../features/tasks/types';
import { RECURRENCE_OPTIONS, getRecurrenceLabel } from '../../features/tasks/taskMeta';

const inputClass = 'bg-card border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

export default function TaskFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(taskService.todayISO());
  const [dueTime, setDueTime] = useState<string | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none');
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
        setDueTime(t.dueTime);
        setRecurrence(t.recurrence);
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
        dueTime,
        notes: notes.trim() || undefined,
        livestockId: livestockId || undefined,
        recurrence,
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
  const touchTitle = () => setErrors((prev) => ({ ...prev, title: required(title) ?? '' }));

  return (
    <FormScroll>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">{isEdit ? 'Task Details' : 'New Task'}</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Task title *</Text>
        <TextInput className={inputCls('title')} placeholder="e.g., Vaccinate herd, Buy feed" placeholderTextColor={colors.neutral[500]} value={title} onChangeText={(v) => { setTitle(v); if (errors.title) setErrors((p) => ({ ...p, title: '' })); }} onBlur={touchTitle} />
        {errors.title ? <Text className="text-xs text-error mb-3">{errors.title}</Text> : <View className="mb-3" />}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Due date *</Text>
        <DateInput value={dueDate} onChange={(d) => { setDueDate(d); if (errors.dueDate) setErrors((p) => ({ ...p, dueDate: '' })); }} error={errors.dueDate} allowFuture />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Time (optional)</Text>
        <TimeInput value={dueTime} onChange={setDueTime} />
        <View className="mb-3" />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Repeat</Text>
        <View className="flex-row flex-wrap gap-2">
          {RECURRENCE_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border ${recurrence === r ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => setRecurrence(r)}
              accessibilityRole="button"
              accessibilityState={{ selected: recurrence === r }}
            >
              <Text className={`text-sm ${recurrence === r ? 'text-onPrimary' : 'text-neutral-600'}`}>
                {r === 'none' ? 'None' : getRecurrenceLabel(r)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {recurrence !== 'none' ? (
          <Text className="text-xs text-neutral-500 mt-2">
            Completing this task will create the next one automatically.
          </Text>
        ) : null}
      </View>

      <View className="mb-5">
        <Text className="text-sm font-medium text-neutral-600 mb-2">Link to livestock (optional)</Text>
        <LivestockPicker livestock={livestock} value={livestockId} onChange={setLivestockId} />
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Additional Notes</Text>
        <TextInput className={`${inputClass} min-h-[80px] pt-3 border-border`} placeholder="Optional notes..." placeholderTextColor={colors.neutral[500]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />
      </View>

      <View className="flex-row gap-3 mt-4">
        {isEdit && (
          <TouchableOpacity className="w-14 py-4 rounded-lg border border-error items-center" onPress={handleDelete} disabled={deleting} accessibilityRole="button" accessibilityLabel="Delete">
            {deleting ? <ActivityIndicator size="small" color={colors.error} /> : <Ionicons name="trash-outline" size={18} color={colors.error} />}
          </TouchableOpacity>
        )}
        <Button title="Cancel" variant="neutral" size="lg" className="flex-1" onPress={() => router.back()} disabled={saving} />
        <Button title={saving ? 'Saving...' : isEdit ? 'Save Task' : 'Add Task'} variant="primary" size="lg" className="flex-[2]" icon="checkmark-outline" loading={saving} onPress={handleSave} disabled={saving} />
      </View>

    </FormScroll>
  );
}