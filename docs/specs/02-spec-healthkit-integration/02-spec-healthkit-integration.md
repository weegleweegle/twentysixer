# 02-spec-healthkit-integration

## Introduction / Overview

This spec covers integrating Apple HealthKit into the MRTHN marathon training app so that outdoor runs recorded by the Apple Watch's built-in Workout app are automatically synced into the training log. A nightly background sync at midnight reads HealthKit for any outdoor runs logged that day and marks the matching training plan day as completed — no manual logging required for users who run with their Apple Watch.

## Goals

- Automatically sync outdoor runs from HealthKit into the training log once per day at midnight.
- Allow HealthKit data to overwrite manually-logged entries so the Watch is always the source of truth.
- Match any outdoor run on a training date to that day's planned workout, regardless of distance.
- Display an Apple Watch badge on completed days that were synced from HealthKit (calendar tile + day detail).
- Deliver only code changes — build setup (EAS Build, Apple Developer account) is out of scope.

## User Stories

**As a runner**, I want my Apple Watch outdoor runs to automatically appear in my training log so that I never have to manually log a workout after a run.

**As a runner**, I want my Watch's recorded distance to overwrite any distance I manually entered so that my log always reflects what I actually ran.

**As a runner**, I want to see a Watch badge on days synced from HealthKit so that I can tell at a glance which workouts came from my Watch vs. manual entry.

**As a runner**, I want the app to explain why it needs HealthKit access and then gracefully fall back to manual logging if I deny permission so that I'm never blocked from using the app.

## Demoable Units of Work

### Unit 1: HealthKit Permission + Read

**Purpose:** Establishes the foundation — the app requests HealthKit access on first launch and can read outdoor run workouts from HealthKit.

**Functional Requirements:**
- The system shall request HealthKit read permission for `HKWorkoutActivityType.running` on iOS on first app launch.
- The system shall display a one-time explanation sheet before the system permission prompt describing why access is needed.
- The system shall silently fall back to manual-only logging if the user denies permission, with no further prompts.
- The system shall only request HealthKit permissions on iOS; no permission flow shall appear on Android or web.
- The system shall expose a `readOutdoorRuns(date: string): Promise<{ miles: number }[]>` function that queries HealthKit for outdoor running workouts on a given date.

**Proof Artifacts:**
- Screenshot: iOS permission prompt appearing on first launch demonstrates the permission flow works.
- Screenshot: App functioning normally after permission denial demonstrates graceful fallback.
- Console log: `readOutdoorRuns('2026-06-02')` returning a workout entry demonstrates HealthKit read works.

---

### Unit 2: Nightly Sync (Midnight Cron)

**Purpose:** Automates daily syncing — at midnight the app checks HealthKit for any outdoor runs logged that day and writes them into the training log.

**Functional Requirements:**
- The system shall schedule a background task that runs once daily at midnight local time.
- The system shall query HealthKit for all outdoor running workouts on the current date.
- The system shall match any outdoor run found to the training plan day for that date, regardless of distance.
- The system shall call `logWorkout(date, actual_miles)` using the Watch-recorded distance for any matched day.
- The system shall overwrite any existing manual log entry for that date with the HealthKit distance (HealthKit always wins).
- The system shall skip the sync silently if HealthKit permission has not been granted.
- The system shall store the source of each log entry (`'healthkit'` or `'manual'`) in the existing SQLite `workout_logs` table via a new `source` column.

**Proof Artifacts:**
- Screenshot: Calendar tile showing checkmark after a simulated HealthKit run is injected for today's date demonstrates the sync writes correctly.
- SQLite query: `SELECT date, actual_miles, source FROM workout_logs` showing `source = 'healthkit'` demonstrates the source column is stored.

---

### Unit 3: Apple Watch Badge in UI

**Purpose:** Makes HealthKit-synced days visually distinct — an Apple Watch icon appears on the calendar tile and in the day detail panel for any workout synced from the Watch.

**Functional Requirements:**
- The system shall display a small Apple Watch icon (⌚) on the calendar tile for any day whose log has `source = 'healthkit'`.
- The system shall display a "Synced from Apple Watch" label with a watch icon in the day detail panel for any day with `source = 'healthkit'`.
- The system shall display the standard "Completed · X mi logged" UI without any badge for days with `source = 'manual'`.
- The system shall display no badge for days that are not yet logged.

**Proof Artifacts:**
- Screenshot: Calendar showing ⌚ badge on a HealthKit-synced day and no badge on a manually-logged day demonstrates correct badge rendering.
- Screenshot: Day detail panel showing "Synced from Apple Watch" label for a HealthKit-synced entry demonstrates the detail panel UI.

---

## Non-Goals (Out of Scope)

1. **EAS Build / Apple Developer setup**: The spec delivers code changes only. Configuring EAS Build, provisioning profiles, or App Store submission is the developer's responsibility.
2. **Android / Google Fit**: No Health Connect or Google Fit integration — iOS HealthKit only.
3. **Write to HealthKit**: The app only reads from HealthKit; it will not write workouts back.
4. **Real-time / live sync**: Sync runs once at midnight, not continuously or in real time.
5. **Manual sync button**: No UI button to trigger a sync on demand.
6. **Heart rate, pace, or route data**: Only workout date and total distance are used from HealthKit.
7. **Historical backfill**: The nightly sync only processes the current date; past HealthKit runs are not retroactively imported.

## Design Considerations

- The Apple Watch badge on the calendar tile should be small and unobtrusive — an `⌚` emoji or a small icon overlaid in the corner of the day cell, similar to how the existing green checkmark is displayed.
- The day detail panel should show "Synced from Apple Watch" in the same completed card where "Edit" and "Undo" currently appear, replacing those actions (since HealthKit is the source of truth, manual editing of Watch-synced entries is not supported in this version).
- The one-time HealthKit explanation should appear as a bottom sheet or modal before the iOS system permission prompt.

## Repository Standards

- Follow the existing NativeWind / Tailwind class pattern for all new UI elements.
- New data access functions go in the `db/` directory (alongside `storage.ts` and `CompletionContext.tsx`).
- Platform-specific code uses `.ios.ts` / `.web.ts` file extensions (matching the existing `ProgressGraph.web.tsx` pattern).
- TypeScript throughout — no `any` types.
- Commit messages follow the `feat:` / `fix:` / `chore:` convention used in the repo.

## Technical Considerations

- **Library**: Use `react-native-health` for HealthKit access. This is a native module and requires a development build (Expo Go will not work).
- **Background task**: Use `expo-background-fetch` + `expo-task-manager` to schedule the midnight sync. On iOS, background fetch timing is approximate and controlled by the OS.
- **Source column migration**: The existing `workout_logs` SQLite table needs a new `source TEXT DEFAULT 'manual'` column added via a migration in `db/storage.ts`.
- **Platform guard**: All HealthKit calls must be wrapped in `Platform.OS === 'ios'` guards so the app continues to work on web and Android.
- **`app.json` entitlements**: The `NSHealthShareUsageDescription` key and the `com.apple.developer.healthkit` entitlement must be added to `app.json` for the native build to work.

## Security Considerations

- HealthKit data is read-only and only accessed locally on-device — no health data is sent to any server.
- No API keys or credentials are required for HealthKit.
- The `NSHealthShareUsageDescription` string in `app.json` must clearly describe the usage to satisfy App Store review.

## Success Metrics

1. **Auto-sync accuracy**: Any outdoor run logged on the Apple Watch on a training day appears as completed in the app by midnight with no user action.
2. **Graceful degradation**: App is fully functional for manual logging when HealthKit permission is denied.
3. **Visual clarity**: Users can distinguish Watch-synced vs. manually-logged days at a glance on the calendar.

## Open Questions

No open questions at this time.
