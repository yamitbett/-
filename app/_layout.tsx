import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider } from '../src/store/AppStore';
import { colors } from '../src/theme/theme';
import { enableRTL } from '../src/theme/rtl';

enableRTL();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <AppStoreProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_left',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="workout/[sessionId]"
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="workout/summary" options={{ animation: 'fade' }} />
            <Stack.Screen name="exercise/[id]" />
            <Stack.Screen
              name="exercise/picker"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="program/[id]" />
            <Stack.Screen
              name="food/search"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        </AppStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
