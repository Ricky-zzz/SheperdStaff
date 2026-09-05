import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { validateProfile } from '../../lib/utils/validate';

export default function OnboardingIndexScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { draft, setDraft } = useAuth();
  const [name, setName] = useState(draft.name);
  const [email, setEmail] = useState(draft.email);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContinue = () => {
    const e = validateProfile({ name, email });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setDraft({ name: name.trim(), email: email.trim() });
    router.replace('/onboarding/password');
  };

  const inputClass = 'bg-card border rounded-lg px-4 py-3 text-base text-neutral-800 mb-1';

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-4">
          <Ionicons name="leaf" size={40} color={colors.primary[600]} />
        </View>
        <Text className="text-2xl font-bold text-neutral-800">Welcome to Shepherd Staff</Text>
        <Text className="text-sm text-neutral-500 text-center mt-2">
          Set up your farm profile to get started. Your data stays on this device.
        </Text>
      </View>

      <Text className="text-sm font-medium text-neutral-600 mb-2">Your name *</Text>
      <TextInput
        className={`${inputClass} ${errors.name ? 'border-error' : 'border-border'}`}
        placeholder="e.g., John Mwangi"
        placeholderTextColor={colors.neutral[400]}
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
        placeholder="e.g., john@example.com"
        placeholderTextColor={colors.neutral[400]}
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

      <TouchableOpacity className="flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600 mt-4" onPress={handleContinue}>
        <Text className="text-base font-semibold text-white">Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={colors.white} />
      </TouchableOpacity>
      <Text className="text-xs text-neutral-400 text-center mt-4">
        No email verification for now. Step 1 of 3
      </Text>
    </View>
  );
}