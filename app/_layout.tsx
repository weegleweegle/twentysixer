import '../global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { CompletionProvider } from '../db/CompletionContext';
import { SYNC_TASK_NAME, syncTodayIfNeeded } from '../db/syncHealthKit';

// Register the background task at module level (required by expo-task-manager)
if (Platform.OS === 'ios') {
  TaskManager.defineTask(SYNC_TASK_NAME, async () => {
    try {
      await syncTodayIfNeeded();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

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

  // Register background fetch on iOS (OS controls exact timing, ~12h minimum interval)
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
      minimumInterval: 60 * 60 * 12, // 12 hours — OS may wake more or less often
      stopOnTerminate: false,
      startOnBoot: true,
    }).catch(() => {
      // Task may already be registered on subsequent launches — safe to ignore
    });
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
