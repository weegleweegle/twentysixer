# 02 Questions Round 1 - HealthKit Integration

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Sync Trigger

When should the app read from HealthKit to check for new runs?

- [ ] (A) Automatically every time the app opens (foreground launch)
- [ ] (B) Automatically when the app comes back to the foreground (e.g. after a run)
- [ ] (C) Manually — a "Sync from Apple Watch" button the user taps
- [ ] (D) Both automatic on foreground + a manual sync button
- [ ] (E) Other (describe)

## 2. Conflict Handling

What should happen if a day already has a manually-logged entry when a HealthKit run comes in for the same date?

- [ ] (A) HealthKit always wins — overwrite the manual entry with the Watch distance
- [ ] (B) Manual entry always wins — skip HealthKit if the day is already logged
- [ ] (C) Ask the user which one to keep
- [ ] (D) Keep both and show both (e.g. "Planned: 3 mi · Watch: 3.1 mi · Manual: 3.0 mi")
- [ ] (E) Other (describe)

## 3. Distance Matching

The Watch may log 3.12 mi for a planned 3 mi run. How should matching work?

- [ ] (A) Accept any outdoor run on the training day regardless of distance
- [ ] (B) Only match if the Watch distance is within 20% of the planned distance
- [ ] (C) Only match if the Watch distance is within 50% of the planned distance
- [ ] (D) Match by date only — if you ran at all that day, mark it done
- [ ] (E) Other (describe)

## 4. Source Indicator in UI

Should the app show how a workout was logged (Watch vs. manual)?

- [ ] (A) Yes — show a small Apple Watch icon / "Synced from Apple Watch" badge on completed days
- [ ] (B) Yes on the day detail panel only (not the calendar tile)
- [ ] (C) No — just show "Completed · X mi logged" the same as manual logs
- [ ] (D) Other (describe)

## 5. Permission Denial Handling

If the user denies HealthKit permission, what should the app do?

- [ ] (A) Show a one-time prompt explaining why access is needed, then silently fall back to manual logging
- [ ] (B) Show a persistent banner with a "Grant Access" button that opens Settings
- [ ] (C) Just silently fall back to manual logging with no message
- [ ] (D) Other (describe)

## 6. Platform Scope

- [ ] (A) iOS only — HealthKit doesn't exist on Android, so no Android changes needed
- [ ] (B) iOS + Android — add Google Fit / Health Connect integration for Android too
- [ ] (C) Other (describe)

## 7. Build Setup

EAS Build is required to run native modules on a real device. Do you have these set up?

- [ ] (A) I have an Apple Developer account and am ready to set up EAS Build
- [ ] (B) I have an Apple Developer account but haven't used EAS Build yet
- [ ] (C) I don't have an Apple Developer account yet
- [ ] (D) I just want the code changes — I'll handle build setup separately
- [ ] (E) Other (describe)
