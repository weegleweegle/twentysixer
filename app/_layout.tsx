import '../global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CompletionProvider } from '../db/CompletionContext';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = '/favicon.svg';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <CompletionProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="day/[date]"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </CompletionProvider>
  );
}
