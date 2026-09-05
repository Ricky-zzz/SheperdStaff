import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { validateProfile } from '../../lib/utils/validate';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { profile, updateNameEmail } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const e = validateProfile({ name, email });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await updateNameEmail(name, email);
      router.back();
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Failed to save') });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'bg-card border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

  return (
    <View className="flex-1 bg-background p-4">
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Your name *</Text>
      <TextInput
        className={`${inputClass} ${errors.name ? 'border-error' : 'border-border'}`}
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (errors.name) setErrors((p) => ({ ...p, name: '' }));
        }}
        autoCapitalize="words"
      />
      {errors.name ? <Text className="text-xs text-error mb-3">{errors.name}</Text> : <View className="mb-3" />}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Your email *</Text>
      <TextInput
        className={`${inputClass} ${errors.email ? 'border-error' : 'border-border'}`}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (errors.email) setErrors((p) => ({ ...p, email: '' }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.email ? <Text className="text-xs text-error mb-3">{errors.email}</Text> : <View className="mb-3" />}

      <TouchableOpacity className="flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600 mt-4" onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text className="text-base font-semibold text-white">Save</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}