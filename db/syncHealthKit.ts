import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readOutdoorRuns } from './healthkit';
import { setLog } from './storage';

export const SYNC_TASK_NAME = 'HEALTHKIT_DAILY_SYNC';

const LAST_SYNC_KEY = 'hk_last_sync_date';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Syncs today's outdoor runs from HealthKit into the workout log.
 * Skips silently if:
 *  - Not on iOS
 *  - Already synced today
 *  - No HealthKit runs found
 *
 * HealthKit always wins — any existing manual entry for today is overwritten.
 */
export async function syncTodayIfNeeded(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  const today = getToday();
  const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
  if (lastSync === today) return; // Already synced today

  const runs = await readOutdoorRuns(today);
  if (runs.length === 0) {
    // No runs today — still mark sync as done so we don't keep retrying
    await AsyncStorage.setItem(LAST_SYNC_KEY, today);
    return;
  }

  // Use the first (or longest) run for the day
  const best = runs.reduce((a, b) => (b.miles > a.miles ? b : a));
  await setLog(today, best.miles, '', 'healthkit');
  await AsyncStorage.setItem(LAST_SYNC_KEY, today);
}
