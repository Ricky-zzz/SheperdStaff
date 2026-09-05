import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { validateNewPassword } from '../../lib/utils/validate';
import { generatePassword, passwordStrength } from '../../lib/utils/password';

export default function OnboardingPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { draft, setDraft } = useAuth();
  const [password, setPassword] = useState(draft.password);
  const [confirm, setConfirm] = useState(draft.password);
  const [show, setShow] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleContinue = () => {
    const e = validateNewPassword({ password, confirm });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setDraft({ password });
    router.replace('/onboarding/theme');
  };

  const inputClass = 'bg-card border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-4">
          <Ionicons name="lock-closed" size={36} color={colors.primary[600]} />
        </View>
        <Text className="text-2xl font-bold text-neutral-800">Create a password</Text>
        <Text className="text-sm text-neutral-500 text-center mt-2">
          The app will ask for this each time it opens. Stored securely on this device.
        </Text>
      </View>

      <Text className="text-sm font-medium text-neutral-600 mb-2">Password *</Text>
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

      <Text className="text-sm font-medium text-neutral-600 mb-2">Re-type password *</Text>
      <TextInput
        className={`${inputClass} ${errors.confirm ? 'border-error' : 'border-border'}`}
        placeholder="Re-type your password"
        placeholderTextColor={colors.neutral[400]}
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

      <TouchableOpacity className="flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600 mt-2" onPress={handleContinue}>
        <Text className="text-base font-semibold text-white">Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={colors.white} />
      </TouchableOpacity>
      <Text className="text-xs text-neutral-400 text-center mt-4">Step 2 of 3</Text>
    </View>
  );
}