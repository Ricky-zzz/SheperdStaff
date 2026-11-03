import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { ListItem } from '../../components/ui/ListItem';
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
  const { colors, colorMode } = useTheme();
  const menuColor = (c: string) => (colorMode === 'uniform' ? colors.neutral[500] : c);

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
        { icon: 'map-outline', label: 'Locations', subtitle: 'Manage farm areas', route: '/locations', color: menuColor(colors.primary[600]) },
        { icon: 'paw-outline', label: 'Animal Types', subtitle: 'Manage livestock categories', route: '/animal-types', color: menuColor(colors.category.cattle) },
        { icon: 'cube-outline', label: 'Feed Inventory', subtitle: 'Feed stock and restocking', route: '/inventory', color: menuColor(colors.category.chicken) },
        { icon: 'calendar-outline', label: 'Activity History', subtitle: 'View all activities', route: '/activity', color: menuColor(colors.earth[600]) },
      ],
    },
    {
      title: 'Data & Reports',
      items: [
        { icon: 'flask-outline', label: 'Load Sample Data', subtitle: 'Add demo records (only if empty)', color: menuColor(colors.category.duck), onPress: handleLoadSampleData },
        { icon: 'download-outline', label: 'Export Data', subtitle: 'Download farm records', color: menuColor(colors.category.chicken) },
        { icon: 'cloud-upload-outline', label: 'Backup', subtitle: 'Save your data', color: menuColor(colors.category.goat) },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: 'key-outline', label: 'Change Password', subtitle: 'Update your lock password', route: '/profile/password', color: menuColor(colors.earth[600]) },
        { icon: 'moon-outline', label: 'Appearance', subtitle: 'Theme settings', route: '/profile/theme', color: menuColor(colors.neutral[600]) },
        { icon: 'notifications-outline', label: 'Notifications', subtitle: 'Manage alerts', color: menuColor(colors.category.sheep) },
        { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'Get assistance', color: menuColor(colors.category.duck) },
        { icon: 'information-circle-outline', label: 'About', subtitle: 'Shepherd Staff v1.0', color: menuColor(colors.neutral[500]) },
      ],
    },
  ];

  return (
    <Screen>
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} className="mb-5">
          <Text className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">{section.title}</Text>
          <Card className="p-0">
            {section.items.map((item, index) => (
              <ListItem
                key={item.label}
                icon={item.icon}
                iconColor={item.color || colors.neutral[500]}
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

      <Text className="text-sm text-neutral-500 text-center mt-5">Shepherd Staff v1.0.0</Text>
      <Text className="text-xs text-neutral-500 text-center mt-1 mb-8">Mobile Livestock Management System</Text>
    </Screen>
  );
}