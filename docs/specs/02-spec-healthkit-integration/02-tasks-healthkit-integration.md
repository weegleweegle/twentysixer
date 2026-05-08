# 02-tasks-healthkit-integration

## Relevant Files

- `db/storage.native.ts` - SQLite storage for iOS/Android. Needs `source` column migration and updated `WorkoutLog` type.
- `db/storage.web.ts` - localStorage storage for web. Needs `source` field added to `WorkoutLog` type and read/write logic.
- `db/CompletionContext.tsx` - React context that exposes `logWorkout`. Needs optional `source` param threaded through.
- `db/healthkit.ts` - **New file.** Stub implementation for web/Android — all functions are no-ops or return empty.
- `db/healthkit.ios.ts` - **New file.** Real iOS HealthKit implementation using `react-native-health`. Exports `requestPermission()` and `readOutdoorRuns(date)`.
- `db/syncHealthKit.ts` - **New file.** Business logic for the daily sync — reads HealthKit runs for a given date and calls `logWorkout`. Shared across platforms (guards internally).
- `components/DayCell.tsx` - Calendar tile. Needs ⌚ badge for `source === 'healthkit'` entries.
- `components/DayDetail.tsx` - Day detail panel. Needs "Synced from Apple Watch" label and hidden Edit/Undo for HealthKit entries.
- `components/HealthKitPermissionModal.tsx` - **New file.** One-time explanation modal shown before the iOS system HealthKit permission prompt.
- `app/index.tsx` - Main screen. Needs to render `HealthKitPermissionModal` and register the background sync task on mount.
- `app.json` - Needs `NSHealthShareUsageDescription`, `com.apple.developer.healthkit` entitlement, and `expo-background-fetch` / `expo-task-manager` plugins.

### Notes

- There are no automated tests in this repo — proof artifacts are screenshots and console/SQLite output as described per task.
- All HealthKit and background task code must be wrapped in `Platform.OS === 'ios'` guards so web and Android are unaffected.
- Follow the existing platform-split file pattern (`*.web.ts` / `*.ios.ts`) already used by `ProgressGraph` and `storage`.
- TypeScript throughout — no `any` types.
- Commit messages use `feat:` / `fix:` / `chore:` convention.

---

## Tasks

### [ ] 1.0 Add `source` Field to Storage Layer

#### 1.0 Proof Artifact(s)

- SQLite query: `SELECT date, actual_miles, source FROM workout_log` returns rows with `source` column demonstrates schema migration ran correctly.
- Code: `WorkoutLog` interface in `storage.native.ts` and `storage.web.ts` includes `source: 'manual' | 'healthkit'` demonstrates type safety across platforms.

#### 1.0 Tasks

- [ ] 1.1 In `db/storage.native.ts`, add `source TEXT NOT NULL DEFAULT 'manual'` to the `CREATE TABLE IF NOT EXISTS` statement so new databases get the column automatically.
- [ ] 1.2 In `db/storage.native.ts`, add a migration line after `CREATE TABLE` that runs `ALTER TABLE workout_log ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'` wrapped in a try/catch (SQLite throws if the column already exists — the catch can be silently ignored).
- [ ] 1.3 Update the `WorkoutLog` interface in `db/storage.native.ts` to add `source: 'manual' | 'healthkit'`.
- [ ] 1.4 Update `getAllLogs` in `db/storage.native.ts` to include `source` in the `SELECT` query.
- [ ] 1.5 Update `setLog` in `db/storage.native.ts` to accept an optional fourth argument `source: 'manual' | 'healthkit' = 'manual'` and include it in the `INSERT OR REPLACE` statement.
- [ ] 1.6 Mirror all the same `WorkoutLog` interface and `source` changes in `db/storage.web.ts` (localStorage version) so both platforms stay in sync.
- [ ] 1.7 In `db/CompletionContext.tsx`, update the `logWorkout` signature to accept an optional `source: 'manual' | 'healthkit' = 'manual'` parameter and pass it through to `setLog`.
- [ ] 1.8 Verify no TypeScript errors by running `npx tsc --noEmit` from the project root.

---

### [ ] 2.0 HealthKit Native Module Setup

#### 2.0 Proof Artifact(s)

- Code diff: `app.json` includes `NSHealthShareUsageDescription` and `com.apple.developer.healthkit` entitlement demonstrates build config is correct.
- Console log: Calling `readOutdoorRuns('YYYY-MM-DD')` on iOS simulator returns an array (empty or with results) demonstrates the module is wired up correctly.
- Code: `db/healthkit.ts` (stub) and `db/healthkit.ios.ts` (real) exist and export the same interface demonstrates platform-split pattern is followed.

#### 2.0 Tasks

- [ ] 2.1 Install the native module: run `npx expo install react-native-health expo-task-manager expo-background-fetch` from the project root.
- [ ] 2.2 In `app.json`, add `"react-native-health"`, `"expo-task-manager"`, and `"expo-background-fetch"` to the `plugins` array.
- [ ] 2.3 In `app.json` under `expo.ios`, add `"infoPlist": { "NSHealthShareUsageDescription": "MRTHN reads your outdoor runs to automatically log workouts from your Apple Watch." }`.
- [ ] 2.4 In `app.json` under `expo.ios`, add `"entitlements": { "com.apple.developer.healthkit": true }`.
- [ ] 2.5 Create `db/healthkit.ios.ts`. This file is iOS-only and should import from `react-native-health`. Export two functions:
  - `requestPermission(): Promise<boolean>` — requests read permission for `HKWorkoutActivityType.running` and returns `true` if granted.
  - `readOutdoorRuns(date: string): Promise<{ miles: number }[]>` — queries HealthKit for all outdoor running workouts on the given date (format `'YYYY-MM-DD'`) and returns their distances in miles.
- [ ] 2.6 Create `db/healthkit.ts` as a stub for web and Android. Export the same two functions as no-ops: `requestPermission` always returns `false`, `readOutdoorRuns` always returns `[]`.
- [ ] 2.7 Verify no TypeScript errors by running `npx tsc --noEmit`.

---

### [ ] 3.0 One-Time Permission Explanation + HealthKit Request Flow

#### 3.0 Proof Artifact(s)

- Screenshot: Explanation modal appearing on first iOS app launch before the system HealthKit permission prompt demonstrates the one-time explanation flow.
- Screenshot: App calendar screen functioning normally after permission is denied demonstrates graceful fallback.
- Code: Permission-shown flag persisted so the explanation never appears twice demonstrates the one-time behaviour.

#### 3.0 Tasks

- [ ] 3.1 Create `components/HealthKitPermissionModal.tsx`. It should render a React Native `Modal` with:
  - A watch emoji (⌚) icon at the top.
  - A title: "Connect Apple Watch".
  - A short explanation: "MRTHN can automatically log your runs from your Apple Watch. We only read workout distance — no health data leaves your device."
  - Two buttons: "Connect" (calls `onConnect`) and "Not Now" (calls `onDismiss`).
  - Props: `visible: boolean`, `onConnect: () => void`, `onDismiss: () => void`.
- [ ] 3.2 In `app/index.tsx`, import `HealthKitPermissionModal` and add state to control its visibility: `const [showHKModal, setShowHKModal] = useState(false)`.
- [ ] 3.3 In `app/index.tsx`, add a `useEffect` on mount that checks `Platform.OS === 'ios'` and reads an `AsyncStorage` key `'hk_permission_asked'`. If the key is not set and the platform is iOS, set `showHKModal` to `true`.
- [ ] 3.4 Install `@react-native-async-storage/async-storage` by running `npx expo install @react-native-async-storage/async-storage` (needed to persist the one-time flag).
- [ ] 3.5 Wire up the `onConnect` handler in `app/index.tsx`: set `'hk_permission_asked'` in AsyncStorage, hide the modal, then call `requestPermission()` from `db/healthkit`. No special handling needed if denied — the app continues with manual logging.
- [ ] 3.6 Wire up the `onDismiss` handler: set `'hk_permission_asked'` in AsyncStorage and hide the modal. The app falls back to manual logging silently.
- [ ] 3.7 Render `<HealthKitPermissionModal visible={showHKModal} onConnect={...} onDismiss={...} />` in the `CalendarScreen` return, outside the `SafeAreaView` so it overlays correctly.
- [ ] 3.8 Verify no TypeScript errors by running `npx tsc --noEmit`.

---

### [ ] 4.0 Nightly Midnight Background Sync

#### 4.0 Proof Artifact(s)

- Screenshot: Calendar tile showing a green checkmark after a test run is injected into HealthKit for today's date and sync is triggered manually demonstrates the sync writes correctly.
- SQLite query: `SELECT date, actual_miles, source FROM workout_log WHERE source = 'healthkit'` returns the synced entry demonstrates the source field is stored correctly.
- Code: Background task registered with `expo-task-manager` and `expo-background-fetch` demonstrates scheduling is wired up.

#### 4.0 Tasks

- [ ] 4.1 Create `db/syncHealthKit.ts`. This file contains the shared sync logic:
  - Export a constant `SYNC_TASK_NAME = 'HEALTHKIT_DAILY_SYNC'`.
  - Export an async function `syncTodayIfNeeded()` that:
    1. Returns early if `Platform.OS !== 'ios'`.
    2. Reads an AsyncStorage key `'hk_last_sync_date'`.
    3. Returns early if the stored date equals today's date (already synced today).
    4. Calls `readOutdoorRuns(today)` from `db/healthkit`.
    5. For each run returned, calls `logWorkout(today, run.miles, '', 'healthkit')` via a direct import of `setLog` from `db/storage` (not via context, since this runs outside React).
    6. Writes today's date to `'hk_last_sync_date'` in AsyncStorage.
- [ ] 4.2 In `app/_layout.tsx`, register the background task at the top level (outside any component) using `TaskManager.defineTask(SYNC_TASK_NAME, syncTodayIfNeeded)`. This must be at the module level, not inside a component or effect.
- [ ] 4.3 In `app/_layout.tsx`, add a `useEffect` in the `RootLayout` component that registers the background fetch on iOS: call `BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, { minimumInterval: 60 * 60 * 12, stopOnTerminate: false, startOnBoot: true })`. Wrap in `Platform.OS === 'ios'` guard.
- [ ] 4.4 In `app/index.tsx`, add a `useEffect` on mount that calls `syncTodayIfNeeded()` directly (the foreground sync). This catches the case where the OS didn't wake the app at midnight — when the user opens the app the next morning it will sync immediately.
- [ ] 4.5 Verify no TypeScript errors by running `npx tsc --noEmit`.

---

### [ ] 5.0 Apple Watch Badge in UI

#### 5.0 Proof Artifact(s)

- Screenshot: Calendar showing ⌚ badge on a HealthKit-synced day and a plain ✓ on a manually-logged day demonstrates correct badge rendering on both types.
- Screenshot: Day detail panel showing "Synced from Apple Watch" label (without Edit/Undo buttons) for a HealthKit entry demonstrates the detail panel UI.
- Screenshot: Day detail panel showing the standard "Completed · X mi logged" with Edit/Undo for a manual entry demonstrates no regression.

#### 5.0 Tasks

- [ ] 5.1 In `components/DayCell.tsx`, update the completion check to also read the log source: `const log = dateStr ? logs.get(dateStr) : undefined` and `const isHealthKit = log?.source === 'healthkit'`.
- [ ] 5.2 In `components/DayCell.tsx`, update the completed badge block to show ⌚ for HealthKit entries and ✓ for manual entries:
  ```tsx
  {isCompleted && hasWorkout && (
    <View className="absolute top-0.5 right-1">
      <Text className="text-[9px]">{isHealthKit ? '⌚' : '✓'}</Text>
    </View>
  )}
  ```
  Keep the existing green `text-brand-success` color on the ✓ but let the ⌚ render in its natural emoji color.
- [ ] 5.3 In `components/DayDetail.tsx`, read the log source in the component: `const isHealthKit = log?.source === 'healthkit'`.
- [ ] 5.4 In `components/DayDetail.tsx`, update the completed card (the `log && !editing` branch) to show two different states based on `isHealthKit`:
  - **HealthKit**: Show the ✓ icon, "Completed" label, and `X mi logged` text as before, but replace the Edit/Undo buttons with a "⌚ Synced from Apple Watch" label in `text-light-muted`.
  - **Manual**: No change — keep existing Edit/Undo buttons.
- [ ] 5.5 Verify no TypeScript errors by running `npx tsc --noEmit`.
- [ ] 5.6 Do a final visual check: open the app on web (or simulator), manually log a workout, confirm it shows ✓ with Edit/Undo. Then in the SQLite DB, manually update that row's `source` to `'healthkit'` and confirm the UI switches to ⌚ and "Synced from Apple Watch".
