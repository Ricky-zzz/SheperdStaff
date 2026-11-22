import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme/ThemeContext';
import { ProfileMenuButton } from '../../features/profile/components/ProfileMenuButton';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 4,
        },
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.primary[800],
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
        },
        headerRight: () => <ProfileMenuButton />,
        headerShadowVisible: false,
        headerLeft: () => (
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: 30, height: 30, borderRadius: 8, marginLeft: 16 }}
            accessibilityIgnoresInvertColors
          />
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', headerTitle: 'Shepherd Staff', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="livestock" options={{ title: 'Livestock', tabBarIcon: ({ color, size }) => <Ionicons name="paw-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="expenses" options={{ title: 'Expenses', tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}