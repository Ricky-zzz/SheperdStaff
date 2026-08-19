import '../../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../lib/theme/colors';

export default function RootLayout() {
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
