import '../../global.css';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../lib/theme/colors';
import { initDb } from '../lib/db/client';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDb()
      .then(() => setReady(true))
      .catch((e) => setError(String(e?.message ?? e)));
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <StatusBar style="dark" />
        <ActivityIndicator />
      </View>
    );
  }

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <StatusBar style="dark" />
        <ActivityIndicator color={Colors.primary[600]} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="livestock/[id]"
          options={{
            headerShown: true,
            title: 'Livestock Details',
            headerTintColor: Colors.primary[700],
            headerStyle: { backgroundColor: Colors.white },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="livestock/new"
          options={{
            headerShown: true,
            title: 'Add Livestock',
            headerTintColor: Colors.primary[700],
            headerStyle: { backgroundColor: Colors.white },
            headerShadowVisible: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="livestock/edit"
          options={{
            headerShown: true,
            title: 'Edit Livestock',
            headerTintColor: Colors.primary[700],
            headerStyle: { backgroundColor: Colors.white },
            headerShadowVisible: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="expenses/new"
          options={{
            headerShown: true,
            title: 'Add Expense',
            headerTintColor: Colors.primary[700],
            headerStyle: { backgroundColor: Colors.white },
            headerShadowVisible: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="expenses/edit"
          options={{
            headerShown: true,
            title: 'Edit Expense',
            headerTintColor: Colors.primary[700],
            headerStyle: { backgroundColor: Colors.white },
            headerShadowVisible: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="activity"
          options={{
            headerShown: true,
            title: 'Activity History',
            headerTintColor: Colors.primary[700],
            headerStyle: { backgroundColor: Colors.white },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
