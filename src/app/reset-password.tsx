import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FormScroll } from '../components/ui/FormScroll';
import { Button } from '../components/ui/Button';
import { useTheme } from '../lib/theme/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { validateNewPassword } from '../lib/utils/validate';
import { passwordStrength } from '../lib/utils/password';

const inputClass = 'bg-background border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

/** Two-step confirmation: `Alert.prompt` is iOS-only, so ask twice instead. */
function confirmErase(onErase: () => void) {
  Alert.alert(
    'Erase everything?',
    'This deletes every farm record, your profile, your password and your recovery code on this device. It cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Last chance', 'Really erase all data? A backup is the only way to get it back.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Erase everything', style: 'destructive', onPress: onErase },
          ]),
      },
    ]
  );
}

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { profile, recoveryConfigured, resetPasswordWithRecovery, eraseAllData } = useAuth();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const strength = passwordStrength(password, colors);

  const handleReset = async () => {
    const e: Record<string, string> = {};
    if (!normalize(code).length) e.code = 'Enter your recovery code';
    Object.assign(e, validateNewPassword({ password, confirm }));
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const ok = await resetPasswordWithRecovery(code, password);
      if (!ok) {
        setErrors({ code: 'That recovery code does not match this device.' });
        setSaving(false);
        return;
      }
      Alert.alert('Password updated', 'Your password was reset and your farm data is untouched.');
    } catch (err: any) {
      setErrors({ form: String(err?.message ?? 'Could not reset the password.') });
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const handleErase = async () => {
    try {
      await eraseAllData();
    } catch {
      Alert.alert('Could not erase', 'Please try again.');
    }
  };

  const inputCls = (field: string) => `${inputClass} ${errors[field] ? 'border-error' : 'border-border'}`;

  return (
    <FormScroll>
      <View className="items-center mb-5">
        <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-3">
          <Ionicons name="key-outline" size={30} color={colors.primary[600]} />
        </View>
        <Text className="text-xl font-bold text-neutral-800 text-center">Forgot your password?</Text>
        <Text className="text-sm text-neutral-500 text-center mt-2">
          Shepherd Staff works entirely offline, so recovery happens on this device using the recovery code
          you saved. Your farm data is never touched by a password reset.
        </Text>
      </View>

      {errors.form ? <Text className="text-sm text-error mb-3">{errors.form}</Text> : null}

      {!recoveryConfigured ? (
        <View className="bg-card border border-warning rounded-lg p-4 mb-5">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="warning-outline" size={18} color={colors.warning} />
            <Text className="text-base font-semibold text-neutral-800">No recovery code on this device</Text>
          </View>
          <Text className="text-sm text-neutral-600 mb-4">
            {profile ? `${profile.name}, you ` : 'You '}
            have not set a recovery code yet, so the forgotten password cannot be verified here. Erasing the
            app data and starting over is the only remaining option — or go back and unlock with your password
            if you remember it.
          </Text>
          <Button
            title="Back to lock screen"
            variant="neutral"
            size="md"
            onPress={() => router.back()}
          />
        </View>
      ) : (
        <View className="bg-card border border-border rounded-lg p-4 mb-4">
          <Text className="text-sm font-medium text-neutral-600 mb-2">Recovery code *</Text>
          <TextInput
            className={`${inputCls('code')} bg-card`}
            placeholder="XXXX-XXXX-XXXX"
            placeholderTextColor={colors.neutral[500]}
            value={code}
            onChangeText={(v) => {
              setCode(v);
              if (errors.code) setErrors((p) => ({ ...p, code: '' }));
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel="Recovery code"
          />
          {errors.code ? (
            <Text className="text-xs text-error mb-3">{errors.code}</Text>
          ) : (
            <View className="mb-3" />
          )}

          <Text className="text-sm font-medium text-neutral-600 mb-2">New password *</Text>
          <View className={`flex-row items-center ${inputCls('password')} bg-card`}>
            <TextInput
              className="flex-1 text-base text-neutral-800 py-0"
              placeholder="At least 8 characters"
              placeholderTextColor={colors.neutral[500]}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((p) => ({ ...p, password: '' }));
              }}
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="New password"
            />
            <TouchableOpacity
              onPress={() => setShow((s) => !s)}
              className="p-2.5 -mr-2"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={show ? 'Hide password' : 'Show password'}
            >
              <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text className="text-xs text-error mb-2">{errors.password}</Text> : null}

          {password.length > 0 ? (
            <View className="mb-3 mt-2">
              <View className="flex-row gap-1 mb-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    className="flex-1 h-1.5 rounded-full"
                    style={{ backgroundColor: i < strength.score ? strength.color : colors.neutral[200] }}
                  />
                ))}
              </View>
              <Text className="text-xs" style={{ color: strength.color }}>
                Password strength: {strength.label}
              </Text>
            </View>
          ) : (
            <View className="mb-3" />
          )}

          <Text className="text-sm font-medium text-neutral-600 mb-2">Re-type new password *</Text>
          <TextInput
            className={`${inputCls('confirm')} bg-card`}
            placeholder="Re-type your new password"
            placeholderTextColor={colors.neutral[500]}
            value={confirm}
            onChangeText={(v) => {
              setConfirm(v);
              if (errors.confirm) setErrors((p) => ({ ...p, confirm: '' }));
            }}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Re-type new password"
          />
          {errors.confirm ? <Text className="text-xs text-error mb-3">{errors.confirm}</Text> : null}

          <Button
            title="Reset password"
            variant="primary"
            size="lg"
            icon="checkmark-outline"
            loading={saving}
            onPress={handleReset}
            className="mt-2"
          />
        </View>
      )}

      <TouchableOpacity
        className="items-center py-3"
        onPress={() => confirmErase(handleErase)}
        accessibilityRole="button"
        accessibilityLabel="Erase all data and start over"
      >
        <Text className="text-sm text-error">Erase all data and start over</Text>
        <Text className="text-xs text-neutral-500 mt-1">Deletes every record and starts onboarding again</Text>
      </TouchableOpacity>
    </FormScroll>
  );
}

function normalize(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
