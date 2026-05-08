# Task 2.0 Proof Artifacts — HealthKit Native Module Setup

## TypeScript Verification

```
$ npx tsc --noEmit
exit:0
```
No type errors across all platform files.

## app.json — iOS Entitlements & Plugins

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSHealthShareUsageDescription": "MRTHN reads your outdoor runs to automatically log workouts from your Apple Watch."
      },
      "entitlements": {
        "com.apple.developer.healthkit": true
      }
    },
    "plugins": [
      "expo-router",
      "expo-sqlite",
      "react-native-health",
      "expo-task-manager",
      "expo-background-fetch"
    ]
  }
}
```

## Platform-Split Module Interface

Both files export the same two functions:

```typescript
// db/healthkit.ts (stub — web / Android)
export async function requestPermission(): Promise<boolean>
export async function readOutdoorRuns(date: string): Promise<{ miles: number }[]>

// db/healthkit.ios.ts (real — iOS only, picked by Metro at bundle time)
export async function requestPermission(): Promise<boolean>
export async function readOutdoorRuns(date: string): Promise<{ miles: number }[]>
```

## Packages Installed

```json
"expo-background-fetch": "~14.0.9",
"expo-task-manager": "~14.0.9",
"react-native-health": "^1.19.0"
```

## Files Created/Modified

- `db/healthkit.ts` — stub (always returns false / [])
- `db/healthkit.ios.ts` — real HealthKit implementation via react-native-health
- `app.json` — NSHealthShareUsageDescription, healthkit entitlement, 3 new plugins
- `package.json` — 3 new dependencies added
