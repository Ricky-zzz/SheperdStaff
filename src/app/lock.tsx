import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth/AuthContext';
import { useTheme } from '../lib/theme/ThemeContext';

export default function LockScreen() {
  const { profile, unlock } = useAuth();
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleUnlock = async () => {
    if (!password) return;
    setChecking(true);
    setError(null);
    try {
      const ok = await unlock(password);
      if (!ok) setError('Incorrect password. Try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View className="flex-1 bg-primary-900 items-center justify-center p-6">
      <View className="w-20 h-20 rounded-full bg-white/15 items-center justify-center mb-5">
        <Ionicons name="lock-closed" size={36} color={colors.white} />
      </View>
      <Text className="text-2xl font-bold text-white mb-1">Shepherd Staff</Text>
      <Text className="text-sm text-primary-200 mb-8">
        {profile ? `${profile.name} · locked` : 'Enter your password to continue'}
      </Text>

      <View className={`flex-row items-center bg-card rounded-xl px-4 py-3 w-full mb-3 ${error ? 'border-2 border-error' : ''}`}>
        <TextInput
          className="flex-1 text-base text-neutral-800 py-0"
          placeholder="Password"
          placeholderTextColor={colors.neutral[400]}
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setError(null);
          }}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleUnlock}
        />
        <TouchableOpacity onPress={() => setShow((s) => !s)} className="p-1">
          <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.neutral[500]} />
        </TouchableOpacity>
      </View>
      {error && <Text className="text-error mb-3">{error}</Text>}

      <TouchableOpacity className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-white/15 w-full" onPress={handleUnlock} disabled={checking}>
        {checking ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Ionicons name="lock-open" size={20} color={colors.white} />
            <Text className="text-base font-semibold text-white">Unlock</Text>
          </>
        )}
      </TouchableOpacity>

      <Text className="text-xs text-primary-300 text-center mt-6">
        Password is stored only on this device.
      </Text>
    </View>
  );
}