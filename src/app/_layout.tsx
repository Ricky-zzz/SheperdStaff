import '../../global.css';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth/AuthContext';
import { ThemeProvider, useTheme } from '../lib/theme/ThemeContext';

function LoadingView() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <StatusBar style="dark" />
      <ActivityIndicator color="#2F855A" />
    </View>
  );
}

function RootNavigator() {
  const { state } = useAuth();
  const { colors } = useTheme();

  if (state === 'loading') return <LoadingView />;

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
      <StatusBar style="dark" />
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
          <Stack.Screen
            name="activity"
            options={{ ...headerOptions, title: 'Activity History' }}
          />
          <Stack.Screen name="profile/edit" options={{ ...modalOptions, title: 'Edit Profile' }} />
          <Stack.Screen name="profile/password" options={{ ...modalOptions, title: 'Change Password' }} />
          <Stack.Screen name="profile/theme" options={{ ...modalOptions, title: 'Theme' }} />
          <Stack.Screen
            name="tasks"
            options={{ ...headerOptions, title: 'Tasks' }}
          />
          <Stack.Screen name="tasks/form" options={{ ...modalOptions, title: 'Task' }} />
        </Stack.Protected>

        <Stack.Protected guard={state === 'locked'}>
          <Stack.Screen name="lock" />
        </Stack.Protected>

        {state === 'onboarding' && <Redirect href="/onboarding" />}
        {state === 'locked' && <Redirect href="/lock" />}
        {state === 'unlocked' && <Redirect href="/(tabs)" />}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}