import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { ListItem } from '../../components/ui/ListItem';
import { Colors } from '../../lib/theme/colors';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  route?: string;
  color?: string;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Farm Management',
    items: [
      { icon: 'map', label: 'Pens & Locations', subtitle: 'Manage farm areas', color: Colors.primary[600] },
      { icon: 'people', label: 'Caretakers', subtitle: 'Manage farm access', color: Colors.category.cattle },
      { icon: 'calendar', label: 'Activity History', subtitle: 'View all activities', route: '/activity', color: Colors.earth[600] },
    ],
  },
  {
    title: 'Data & Reports',
    items: [
      { icon: 'download', label: 'Export Data', subtitle: 'Download farm records', color: Colors.category.chicken },
      { icon: 'cloud-upload', label: 'Backup', subtitle: 'Save your data', color: Colors.category.goat },
    ],
  },
  {
    title: 'Settings',
    items: [
      { icon: 'notifications', label: 'Notifications', subtitle: 'Manage alerts', color: Colors.category.sheep },
      { icon: 'moon', label: 'Appearance', subtitle: 'Theme settings', color: Colors.neutral[600] },
      { icon: 'help-circle', label: 'Help & Support', subtitle: 'Get assistance', color: Colors.category.duck },
      { icon: 'information-circle', label: 'About', subtitle: 'Shepherd Staff v1.0', color: Colors.neutral[500] },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Card className="flex-row items-center mb-5 py-5">
        <View className="w-14 h-14 rounded-full bg-primary-100 justify-center items-center mr-4">
          <Ionicons name="person" size={32} color={Colors.primary[600]} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-neutral-800">Farm Owner</Text>
          <Text className="text-sm text-neutral-500 mt-0.5">Shepherd Staff Account</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-primary-50 justify-center items-center">
          <Ionicons name="create-outline" size={18} color={Colors.primary[600]} />
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
                iconColor={item.color || Colors.neutral[400]}
                title={item.label}
                subtitle={item.subtitle}
                showChevron={!!item.route}
                showBorder={index < section.items.length - 1}
                onPress={item.route ? () => router.push(item.route as any) : undefined}
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
