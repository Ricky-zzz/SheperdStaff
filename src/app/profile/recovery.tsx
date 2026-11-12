import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../lib/theme/ThemeContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { generateRecoveryCode } from '../../lib/utils/password';
import { formatDateTime } from '../../lib/utils/format';
import * as MailComposer from 'expo-mail-composer';

function confirmRemoval(onRemove: () => void) {
  Alert.alert(
    'Remove recovery code?',
    'Without it, a forgotten password can only be fixed by erasing all data.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]
  );
}

export default function RecoveryCodeScreen() {
  const { colors } = useTheme();
  const { profile, recoveryConfigured, setRecoveryCode, removeRecoveryCode } = useAuth();
  // Shown once after generating; never persisted in plain text.
  const [revealed, setRevealed] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    setSaving(true);
    try {
      const code = await generateRecoveryCode();
      await setRecoveryCode(code);
      setRevealed(code);
    } catch {
      Alert.alert('Could not generate', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEmail = async () => {
    if (!revealed) return;
    try {
      const available = await MailComposer.isAvailableAsync().catch(() => false);
      if (!available) {
        Alert.alert('No mail app', 'No email app is configured on this device. Write the code down instead.');
        return;
      }
      await MailComposer.composeAsync({
        recipients: profile?.email ? [profile.email] : [],
        subject: 'Shepherd Staff recovery code',
        body: [
          'My Shepherd Staff recovery code (keep this private):',
          '',
          revealed,
          '',
          'Use it on the lock screen via “Forgot password?” to set a new password',
          'without losing any farm records.',
        ].join('\n'),
      });
    } catch {
      Alert.alert('Could not open mail', 'Write the code down instead — it is only shown once.');
    }
  };

  const handleRemove = async () => {
    try {
      await removeRecoveryCode();
      setRevealed('');
    } catch {
      Alert.alert('Could not remove', 'Please try again.');
    }
  };

  return (
    <FormScroll>
      <View className="items-center mb-5">
        <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-3">
          <Ionicons name="shield-checkmark-outline" size={30} color={colors.primary[600]} />
        </View>
        <Text className="text-xl font-bold text-neutral-800 text-center">Lock recovery code</Text>
        <Text className="text-sm text-neutral-500 text-center mt-2">
          If you forget your password, this code lets you set a new one without losing any farm records. Save
          it somewhere safe — only a salted hash is stored on the device.
        </Text>
      </View>

      {revealed ? (
        <View className="bg-card border-2 border-primary-500 rounded-lg p-4 mb-4">
          <Text className="text-sm font-medium text-neutral-600 mb-2">Your recovery code</Text>
          <Text selectable className="text-2xl font-bold text-neutral-900 text-center tracking-widest mb-3">
            {revealed}
          </Text>
          <Text className="text-xs text-neutral-500 mb-4">
            This is the only time it is shown. Email it to yourself or write it down before leaving this
            screen.
          </Text>
          <Button
            title="Email it to me"
            variant="secondary"
            size="md"
            icon="mail-outline"
            onPress={handleEmail}
            className="mb-2"
          />
          <Button title="I've saved it" variant="primary" size="md" icon="checkmark-outline" onPress={() => setRevealed('')} />
        </View>
      ) : (
        <View className="bg-card border border-border rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-neutral-600">Status</Text>
            <Text className="text-sm font-semibold" style={{ color: recoveryConfigured ? colors.success : colors.warning }}>
              {recoveryConfigured ? 'Set up' : 'Not set up'}
            </Text>
          </View>
          {recoveryConfigured && profile?.recoverySetAt ? (
            <Text className="text-xs text-neutral-500 mb-4">
              Saved {formatDateTime(new Date(profile.recoverySetAt).getTime())}
            </Text>
          ) : (
            <Text className="text-xs text-neutral-500 mb-4">
              Without a code, a forgotten password means erasing your data to start over.
            </Text>
          )}

          <Button
            title={saving ? 'Generating…' : recoveryConfigured ? 'Generate a new code' : 'Generate recovery code'}
            variant="primary"
            size="lg"
            icon="refresh-outline"
            loading={saving}
            onPress={handleGenerate}
            className="mb-2"
          />
          {recoveryConfigured ? (
            <Button title="Remove code" variant="neutral" size="md" onPress={() => confirmRemoval(handleRemove)} />
          ) : null}
        </View>
      )}

      <View className="flex-row items-start gap-2 mt-1">
        <Ionicons name="information-circle-outline" size={16} color={colors.neutral[500]} style={{ marginTop: 2 }} />
        <Text className="text-xs text-neutral-500 flex-1">
          Shepherd Staff has no server, so no email is ever sent for you. The app only opens your mail app to
          help you send the code to yourself.
        </Text>
      </View>
    </FormScroll>
  );
}
