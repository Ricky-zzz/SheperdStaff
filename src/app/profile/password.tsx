import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { validateNewPassword } from '../../lib/utils/validate';
import { generatePassword, passwordStrength } from '../../lib/utils/password';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const strength = passwordStrength(password, colors);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const p = await generatePassword();
      setPassword(p);
      setConfirm(p);
      setErrors({});
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    const e = validateNewPassword({ password, confirm });
    if (!current) e.current = 'Required';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const ok = await changePassword(current, password);
      if (!ok) {
        setErrors({ current: 'Current password is incorrect' });
        setSaving(false);
        return;
      }
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

      <Text className="text-sm font-medium text-neutral-600 mb-2">Current password *</Text>
      <TextInput
        className={`${inputClass} ${errors.current ? 'border-error' : 'border-border'}`}
        value={current}
        onChangeText={(v) => {
          setCurrent(v);
          if (errors.current) setErrors((p) => ({ ...p, current: '' }));
        }}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.current ? <Text className="text-xs text-error mb-3">{errors.current}</Text> : <View className="mb-3" />}

      <Text className="text-sm font-medium text-neutral-600 mb-2">New password *</Text>
      <View className={`flex-row items-center ${inputClass} ${errors.password ? 'border-error' : 'border-border'}`}>
        <TextInput
          className="flex-1 text-base text-neutral-800 py-0"
          placeholder="At least 8 characters"
          placeholderTextColor={colors.neutral[400]}
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (errors.password) setErrors((p) => ({ ...p, password: '' }));
          }}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShow((s) => !s)} className="p-1">
          <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.neutral[500]} />
        </TouchableOpacity>
      </View>
      {errors.password ? <Text className="text-xs text-error mb-2">{errors.password}</Text> : null}

      {password.length > 0 && (
        <View className="mb-2">
          <View className="flex-row gap-1 mb-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i < strength.score ? strength.color : colors.neutral[200] }} />
            ))}
          </View>
          <Text className="text-xs" style={{ color: strength.color }}>
            Password strength: {strength.label}
          </Text>
        </View>
      )}

      <Text className="text-sm font-medium text-neutral-600 mb-2">Re-type new password *</Text>
      <TextInput
        className={`${inputClass} ${errors.confirm ? 'border-error' : 'border-border'}`}
        value={confirm}
        onChangeText={(v) => {
          setConfirm(v);
          if (errors.confirm) setErrors((p) => ({ ...p, confirm: '' }));
        }}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.confirm ? <Text className="text-xs text-error mb-3">{errors.confirm}</Text> : <View className="mb-3" />}

      <TouchableOpacity className="flex-row items-center justify-center gap-2 py-3 rounded-lg bg-primary-100 mb-2" onPress={handleGenerate} disabled={generating}>
        {generating ? (
          <ActivityIndicator size="small" color={colors.primary[600]} />
        ) : (
          <>
            <Ionicons name="key" size={18} color={colors.primary[600]} />
            <Text className="text-base font-semibold text-primary-700">Generate a strong password</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600 mt-2" onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text className="text-base font-semibold text-white">Change Password</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}