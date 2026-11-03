import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FormScroll } from '../../components/ui/FormScroll';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../../lib/theme/ThemeContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { ProfileAvatar } from '../../features/profile/components/ProfileAvatar';
import { validateProfile } from '../../lib/utils/validate';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { profile, updateNameEmail, updateAvatar } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(profile?.avatarUri);
  const [originalAvatar] = useState(profile?.avatarUri);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);

  const handlePickPhoto = async () => {
    setPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo access to choose a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled || !result.assets[0]) return;

      const dir = `${FileSystem.documentDirectory}avatars/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
      const dest = `${dir}avatar-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: result.assets[0].uri, to: dest });
      setAvatarUri(dest);
    } catch {
      Alert.alert('Failed', 'Could not use that photo.');
    } finally {
      setPicking(false);
    }
  };

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
      await updateAvatar(avatarUri ?? null);
      if (originalAvatar && originalAvatar !== avatarUri) {
        FileSystem.deleteAsync(originalAvatar, { idempotent: true }).catch(() => {});
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
    <FormScroll>
      {errors.form && <Text className="text-sm text-error mb-3">{errors.form}</Text>}

      <View className="items-center mb-6">
        <ProfileAvatar name={name || profile?.name} uri={avatarUri} size={92} />
        <View className="flex-row gap-4 mt-3">
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-2 py-3 -mx-2"
            onPress={handlePickPhoto}
            disabled={picking}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={avatarUri ? 'Change photo' : 'Add photo'}
          >
            {picking ? (
              <ActivityIndicator size="small" color={colors.primary[600]} />
            ) : (
              <Ionicons name="camera-outline" size={18} color={colors.primary[600]} />
            )}
            <Text className="text-sm font-medium" style={{ color: colors.primary[600] }}>
              {avatarUri ? 'Change photo' : 'Add photo'}
            </Text>
          </TouchableOpacity>
          {avatarUri ? (
            <TouchableOpacity
              className="flex-row items-center gap-1.5 px-2 py-3"
              onPress={() => setAvatarUri(undefined)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text className="text-sm font-medium" style={{ color: colors.error }}>Remove</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text className="text-sm font-medium text-neutral-600 mb-2">Your name *</Text>
      <TextInput
        className={`${inputClass} ${errors.name ? 'border-error' : 'border-border'}`}
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (errors.name) setErrors((p) => ({ ...p, name: '' }));
        }}
        autoCapitalize="words"
        accessibilityLabel="Your name"
        onBlur={() => setErrors((prev) => ({ ...prev, name: validateProfile({ name, email }).name ?? '' }))}
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
        accessibilityLabel="Your email"
        onBlur={() => setErrors((prev) => ({ ...prev, email: validateProfile({ name, email }).email ?? '' }))}
      />
      {errors.email ? <Text className="text-xs text-error mb-3">{errors.email}</Text> : <View className="mb-3" />}

      <Button
        title="Save"
        variant="primary"
        size="lg"
        className="mt-4"
        icon="checkmark-outline"
        loading={saving}
        onPress={handleSave}
      />
    </FormScroll>
  );
}
