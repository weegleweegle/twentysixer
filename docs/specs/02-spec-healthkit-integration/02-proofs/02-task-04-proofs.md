# Task 4.0 Proof Artifacts — Nightly Midnight Background Sync

## TypeScript Verification

```
$ npx tsc --noEmit
exit:0
```

## Sync Logic (db/syncHealthKit.ts)

```typescript
export const SYNC_TASK_NAME = 'HEALTHKIT_DAILY_SYNC';

export async function syncTodayIfNeeded(): Promise<void> {
  if (Platform.OS !== 'ios') return;           // iOS only
  const today = getToday();
  const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
  if (lastSync === today) return;              // Already synced today
  const runs = await readOutdoorRuns(today);
  if (runs.length === 0) { /* mark done, return */ }
  const best = runs.reduce((a, b) => b.miles > a.miles ? b : a);
  await setLog(today, best.miles, '', 'healthkit'); // HealthKit always wins
  await AsyncStorage.setItem(LAST_SYNC_KEY, today);
}
```

## Background Task Registration (app/_layout.tsx)

```typescript
// Module-level task definition (required by expo-task-manager)
if (Platform.OS === 'ios') {
  TaskManager.defineTask(SYNC_TASK_NAME, async () => {
    await syncTodayIfNeeded();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  });
}

// useEffect registers with OS (~12h minimum interval)
BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
  minimumInterval: 60 * 60 * 12,
  stopOnTerminate: false,
  startOnBoot: true,
});
```

## Foreground Fallback (app/index.tsx)

```typescript
// Runs on every app open — ensures sync happens even if OS didn't fire background task
useEffect(() => {
  syncTodayIfNeeded();
}, []);
```

## Key Behaviours

| Scenario | Result |
|---|---|
| Not on iOS | Returns immediately (no-op) |
| Already synced today | Returns immediately (idempotent) |
| No runs in HealthKit | Marks sync done, no log entry written |
| Run found | Writes log with `source: 'healthkit'`, overwrites any manual entry |
| Multiple runs | Uses the longest distance run for the day |

## Files Created/Modified

- `db/syncHealthKit.ts` — new sync logic module
- `app/_layout.tsx` — background task definition + registration
- `app/index.tsx` — foreground sync on app open
