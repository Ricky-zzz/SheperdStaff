import '../../global.css';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth/AuthContext';
import { ThemeProvider, useTheme } from '../lib/theme/ThemeContext';

function LoadingView({ darkMode }: { darkMode: boolean }) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <ActivityIndicator color={colors.primary[600]} />
    </View>
  );
}

function RootNavigator() {
  const { state } = useAuth();
  const { colors, darkMode } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (state === 'loading' || !navState?.key) return;
    const root = segments[0];
    if (state === 'onboarding' && root !== 'onboarding') {
      router.replace('/onboarding');
    } else if (state === 'locked' && root !== 'lock' && root !== 'reset-password') {
      // `/reset-password` is the one screen reachable from the lock gate.
      router.replace('/lock');
    } else if (
      state === 'unlocked' &&
      (root === 'onboarding' || root === 'lock' || root === 'reset-password' || root === undefined)
    ) {
      router.replace('/(tabs)');
    }
  }, [state, segments, navState?.key, router]);

  if (state === 'loading') return <LoadingView darkMode={darkMode} />;

  const headerOptions = {
    headerShown: true,
    headerTintColor: colors.primary[700],
    headerStyle: { backgroundColor: colors.card },
    headerShadowVisible: false,
  };

  const modalOptions = {
    ...headerOptions,
    presentation: 'modal' as const,
  };

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={state === 'onboarding'}>
          <Stack.Screen name="onboarding/index" options={{ ...headerOptions, title: 'Welcome' }} />
          <Stack.Screen name="onboarding/password" options={{ ...headerOptions, title: 'Create Password' }} />
          <Stack.Screen name="onboarding/theme" options={{ ...headerOptions, title: 'Choose Theme' }} />
        </Stack.Protected>

        <Stack.Protected guard={state === 'unlocked'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="livestock/[id]"
            options={{ ...headerOptions, title: 'Livestock Details' }}
          />
          <Stack.Screen name="livestock/new" options={{ ...modalOptions, title: 'Add Livestock' }} />
          <Stack.Screen name="livestock/edit" options={{ ...modalOptions, title: 'Edit Livestock' }} />
          <Stack.Screen name="expenses/new" options={{ ...modalOptions, title: 'Add Expense' }} />
          <Stack.Screen name="expenses/edit" options={{ ...modalOptions, title: 'Edit Expense' }} />
          <Stack.Screen name="expenses/all" options={{ ...headerOptions, title: 'All Expenses' }} />
          <Stack.Screen name="income/form" options={{ ...modalOptions, title: 'Income' }} />
          <Stack.Screen name="income/all" options={{ ...headerOptions, title: 'All Income' }} />
          <Stack.Screen
            name="activity"
            options={{ ...headerOptions, title: 'Activity History' }}
          />
          <Stack.Screen name="profile/edit" options={{ ...modalOptions, title: 'Edit Profile' }} />
          <Stack.Screen name="profile/password" options={{ ...modalOptions, title: 'Change Password' }} />
          <Stack.Screen name="profile/recovery" options={{ ...headerOptions, title: 'Recovery Code' }} />
          <Stack.Screen name="profile/theme" options={{ ...modalOptions, title: 'Theme' }} />
          <Stack.Screen
            name="tasks"
            options={{ ...headerOptions, title: 'Tasks' }}
          />
          <Stack.Screen name="tasks/form" options={{ ...modalOptions, title: 'Task' }} />
          <Stack.Screen name="reports/type" options={{ ...headerOptions, title: 'Type Ledger' }} />
          <Stack.Screen
            name="locations"
            options={{ ...headerOptions, title: 'Locations' }}
          />
          <Stack.Screen name="locations/form" options={{ ...modalOptions, title: 'Location' }} />
          <Stack.Screen
            name="animal-types"
            options={{ ...headerOptions, title: 'Animal Types' }}
          />
          <Stack.Screen name="animal-types/form" options={{ ...modalOptions, title: 'Animal Type' }} />
          <Stack.Screen name="backup" options={{ ...headerOptions, title: 'Backup & Restore' }} />
          <Stack.Screen
            name="inventory"
            options={{ ...headerOptions, title: 'Feed Inventory' }}
          />
          <Stack.Screen name="inventory/[id]" options={{ ...headerOptions, title: 'Feed Details' }} />
          <Stack.Screen name="inventory/form" options={{ ...modalOptions, title: 'Feed Item' }} />
          <Stack.Screen name="inventory/restock" options={{ ...modalOptions, title: 'Restock Feed' }} />
          <Stack.Screen name="inventory/adjust" options={{ ...modalOptions, title: 'Adjust Stock' }} />
        </Stack.Protected>

        <Stack.Protected guard={state === 'locked'}>
          <Stack.Screen name="lock" />
          <Stack.Screen name="reset-password" options={{ ...headerOptions, title: 'Reset Password' }} />
        </Stack.Protected>

      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}