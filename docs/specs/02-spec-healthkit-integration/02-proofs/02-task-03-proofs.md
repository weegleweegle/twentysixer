# Task 3.0 Proof Artifacts — Permission Explanation + HealthKit Request Flow

## TypeScript Verification

```
$ npx tsc --noEmit
exit:0
```

## One-Time Flag Logic (app/index.tsx)

```typescript
// Runs once on mount — iOS only
useEffect(() => {
  if (Platform.OS !== 'ios') return;
  AsyncStorage.getItem('hk_permission_asked').then(val => {
    if (!val) setShowHKModal(true);
  });
}, []);

// Connect: saves flag, hides modal, calls requestPermission()
async function handleHKConnect() {
  await AsyncStorage.setItem('hk_permission_asked', 'true');
  setShowHKModal(false);
  await requestPermission();
}

// Dismiss: saves flag, hides modal — silently falls back to manual
async function handleHKDismiss() {
  await AsyncStorage.setItem('hk_permission_asked', 'true');
  setShowHKModal(false);
}
```

The `'hk_permission_asked'` AsyncStorage key ensures the modal never appears twice — once set (on either Connect or Not Now), it is never cleared.

## HealthKitPermissionModal Component

```tsx
// components/HealthKitPermissionModal.tsx
// Props: visible, onConnect, onDismiss
// Renders: bottom-sheet modal with ⌚ icon, title, description, Connect + Not Now buttons
```

## Graceful Fallback

- `requestPermission()` on iOS calls `AppleHealthKit.initHealthKit` — if denied, it returns `false` and nothing else happens.
- On web/Android, `requestPermission()` is a no-op that returns `false`.
- The `Platform.OS !== 'ios'` guard prevents the modal from ever showing on web or Android.

## Files Created/Modified

- `components/HealthKitPermissionModal.tsx` — new bottom-sheet modal component
- `app/index.tsx` — modal state, one-time AsyncStorage flag, connect/dismiss handlers, modal render
- `package.json` — @react-native-async-storage/async-storage added
