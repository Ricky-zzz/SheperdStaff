import React, { useState } from 'react';
import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { ProfileAvatar } from './ProfileAvatar';

export const ProfileMenuButton: React.FC = () => {
  const { profile, lock } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const close = () => setVisible(false);

  const go = (route: string) => {
    close();
    router.push(route as any);
  };

  const handleLogout = () => {
    close();
    Alert.alert('Log out', 'Lock the app? Your farm data stays on this device and can be opened with your password.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: lock },
    ]);
  };

  return (
    <>
      <TouchableOpacity
        className="p-1.5 -m-1"
        onPress={() => setVisible(true)}
        accessibilityLabel="Open profile menu"
        accessibilityRole="button"
      >
        <ProfileAvatar name={profile?.name} uri={profile?.avatarUri} size={34} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableOpacity
            className="absolute top-0 left-0 right-0 bottom-0"
            activeOpacity={1}
            onPress={close}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <View className="bg-card rounded-t-2xl px-5 pt-5" style={{ paddingBottom: 24 + insets.bottom }}>
            <View className="items-center mb-4">
              <ProfileAvatar name={profile?.name} uri={profile?.avatarUri} size={64} />
              <Text className="text-lg font-semibold text-neutral-800 mt-3">{profile?.name ?? 'Farm Owner'}</Text>
              <Text className="text-sm text-neutral-500 mt-0.5">{profile?.email ?? 'Shepherd Staff Account'}</Text>
            </View>

            <TouchableOpacity className="flex-row items-center gap-3 py-3 border-t border-border" onPress={() => go('/profile/edit')} accessibilityRole="button" accessibilityLabel="Profile, name, email, and photo">
              <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: colors.primary[100] }}>
                <Ionicons name="person-outline" size={18} color={colors.primary[700]} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-neutral-800">Profile</Text>
                <Text className="text-xs text-neutral-500 mt-0.5">Name, email, and photo</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color={colors.neutral[500]} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-3 py-3 border-t border-border" onPress={() => go('/profile/theme')} accessibilityRole="button" accessibilityLabel="Appearance, theme and dark mode">
              <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: colors.neutral[100] }}>
                <Ionicons name="moon-outline" size={18} color={colors.neutral[600]} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-neutral-800">Appearance</Text>
                <Text className="text-xs text-neutral-500 mt-0.5">Theme and dark mode</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color={colors.neutral[500]} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-3 py-3 border-t border-border" onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Log out, lock this device">
              <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: colors.error + '18' }}>
                <Ionicons name="log-out-outline" size={18} color={colors.error} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: colors.error }}>Log out</Text>
                <Text className="text-xs text-neutral-500 mt-0.5">Lock this device</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="mt-4 py-3 rounded-lg bg-background items-center" onPress={close} accessibilityRole="button" accessibilityLabel="Cancel">
              <Text className="text-sm font-medium text-neutral-600">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
