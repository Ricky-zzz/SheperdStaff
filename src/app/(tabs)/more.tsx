import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { ListItem } from '../../components/ui/ListItem';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTheme } from '../../lib/theme/ThemeContext';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  route?: string;
  color?: string;
  onPress?: () => void;
}

export default function MoreScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const handleLoadSampleData = () => {
    Alert.alert('Load sample data?', 'Adds demo livestock, expenses, and tasks. Only runs if the database is empty — your existing data is never touched.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Load',
        onPress: async () => {
          try {
            const { seedIfNeeded } = await import('../../lib/db/seed');
            const { getDb } = await import('../../lib/db/client');
            const seeded = await seedIfNeeded(await getDb());
            Alert.alert(
              seeded ? 'Sample data loaded' : 'Nothing to load',
              seeded ? 'Demo livestock, expenses, and tasks have been added.' : 'The database already has data, so nothing was seeded.'
            );
          } catch {
            Alert.alert('Failed', 'Could not load sample data.');
          }
        },
      },
    ]);
  };

  const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Farm Management',
      items: [
        { icon: 'map', label: 'Pens & Locations', subtitle: 'Manage farm areas', color: colors.primary[600] },
        { icon: 'people', label: 'Caretakers', subtitle: 'Manage farm access', color: colors.category.cattle },
        { icon: 'calendar', label: 'Activity History', subtitle: 'View all activities', route: '/activity', color: colors.earth[600] },
      ],
    },
    {
      title: 'Data & Reports',
      items: [
        { icon: 'flask', label: 'Load Sample Data', subtitle: 'Add demo records (only if empty)', color: colors.category.duck, onPress: handleLoadSampleData },
        { icon: 'download', label: 'Export Data', subtitle: 'Download farm records', color: colors.category.chicken },
        { icon: 'cloud-upload', label: 'Backup', subtitle: 'Save your data', color: colors.category.goat },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: 'key', label: 'Change Password', subtitle: 'Update your lock password', route: '/profile/password', color: colors.earth[600] },
        { icon: 'moon', label: 'Appearance', subtitle: 'Theme settings', route: '/profile/theme', color: colors.neutral[600] },
        { icon: 'notifications', label: 'Notifications', subtitle: 'Manage alerts', color: colors.category.sheep },
        { icon: 'help-circle', label: 'Help & Support', subtitle: 'Get assistance', color: colors.category.duck },
        { icon: 'information-circle', label: 'About', subtitle: 'Shepherd Staff v1.0', color: colors.neutral[500] },
      ],
    },
  ];

  return (
    <Screen>
      <Card className="flex-row items-center mb-5 py-5">
        <View className="w-14 h-14 rounded-full bg-primary-100 justify-center items-center mr-4">
          <Ionicons name="person" size={32} color={colors.primary[600]} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-neutral-800">{profile?.name ?? 'Farm Owner'}</Text>
          <Text className="text-sm text-neutral-500 mt-0.5">{profile?.email ?? 'Shepherd Staff Account'}</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-primary-50 justify-center items-center" onPress={() => router.push('/profile/edit')}>
          <Ionicons name="create-outline" size={18} color={colors.primary[600]} />
        </TouchableOpacity>
      </Card>

      {MENU_SECTIONS.map((section) => (
        <View key={section.title} className="mb-5">
          <Text className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">{section.title}</Text>
          <Card className="p-0">
            {section.items.map((item, index) => (
              <ListItem
                key={item.label}
                icon={item.icon}
                iconColor={item.color || colors.neutral[400]}
                title={item.label}
                subtitle={item.subtitle}
                showChevron={!!item.route}
                showBorder={index < section.items.length - 1}
                onPress={item.onPress ?? (item.route ? () => router.push(item.route as any) : undefined)}
              />
            ))}
          </Card>
        </View>
      ))}

      <Text className="text-sm text-neutral-400 text-center mt-5">Shepherd Staff v1.0.0</Text>
      <Text className="text-xs text-neutral-300 text-center mt-1 mb-8">Mobile Livestock Management System</Text>
    </Screen>
  );
}