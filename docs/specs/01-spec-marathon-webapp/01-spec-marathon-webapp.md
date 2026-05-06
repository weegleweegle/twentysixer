# 01-spec-marathon-webapp

## Introduction / Overview

This spec covers four targeted enhancements to the existing Expo/React Native marathon training app to align it with the intended web experience. The app already has the core calendar, workout logging, and day detail — but it uses a dark theme, shows all months in one scrollable list, opens day detail as a modal on all platforms, and only shows a countdown with no mileage progress. These four gaps need to be closed.

## Goals

- Switch the app from dark to light theme (white background, clean and minimal).
- Show one month at a time with prev/next pagination instead of all months stacked.
- Show day detail as a side panel on desktop (web) and full-screen on mobile.
- Add weekly and overall mileage progress stats alongside the existing countdown.

## User Stories

**As a runner**, I want to see the training calendar in a clean light theme so that it feels easy to scan at a glance without the eye-strain of a dark background.

**As a runner**, I want to page through months one at a time so that I can focus on one month without scrolling past irrelevant months.

**As a runner**, I want to tap a workout day and see details in a side panel on desktop so that I can keep the calendar visible while reviewing or logging a workout.

**As a runner**, I want to see my weekly and overall progress stats next to the countdown so that I know at a glance how I'm tracking against the plan.

## Demoable Units of Work

### Unit 1: Light Theme + Month Pagination

**Purpose:** Replaces the dark theme and scrollable-all-months view with a light, minimal design and single-month navigation.

**Functional Requirements:**
- The system shall render the app background as white (`#FFFFFF`) with dark text.
- The system shall replace all `bg-brand-bg`, `bg-brand-card`, `bg-brand-surface` dark tokens with light equivalents.
- The system shall display one calendar month at a time on the main screen.
- The system shall provide Previous and Next navigation controls to move between months.
- The system shall disable the Previous control when the current month is the earliest visible month (today's month).
- The system shall disable the Next control when the current month is the race month (April 2027).
- The system shall initialize to the current month on first load.
- The system shall maintain the existing rule: only months from today forward are navigable.

**Proof Artifacts:**
- Screenshot: main screen showing white background, dark text, single month grid with prev/next controls demonstrates light theme and pagination are working.
- Screenshot: Previous button disabled on today's month demonstrates the lower bound is enforced.

---

### Unit 2: Responsive Day Detail Panel

**Purpose:** Shows workout detail as a side panel on desktop web instead of a full-screen modal, while keeping full-screen behavior on mobile.

**Functional Requirements:**
- The system shall detect whether the app is running on a wide screen (desktop web, viewport width ≥ 768px).
- On wide screens, the system shall render the day detail as a fixed panel on the right side of the screen (approximately 380px wide), with the calendar remaining visible on the left.
- On narrow screens (mobile), the system shall continue to use the existing full-screen bottom-sheet modal behavior.
- The system shall show the side panel when a workout day is tapped and hide it when closed.
- The side panel shall contain the same content as the existing day detail screen: workout type, stats, log miles input, and notes.
- The user shall be able to log, edit, and undo a workout from the side panel.
- The system shall allow closing the side panel via a Close button or by tapping outside it.

**Proof Artifacts:**
- Screenshot: desktop browser at ≥768px width showing calendar on left and day detail panel on right demonstrates the responsive layout.
- Screenshot: mobile view showing the existing full-screen modal demonstrates mobile behavior is unchanged.
- Interaction: log a float mile value in the side panel and verify the calendar cell shows the ✓ checkmark demonstrates the panel is wired to CompletionContext correctly.

---

### Unit 3: Progress Summary Stats

**Purpose:** Adds weekly planned/actual mileage and overall planned/actual mileage stats to the header alongside the existing countdown.

**Functional Requirements:**
- The system shall display the current week's planned mileage and actual logged mileage in the header (e.g., "This week: 8.5 / 12 mi").
- The system shall display total planned mileage and total logged mileage across all weeks in the header (e.g., "Total: 32.5 / 459 mi").
- The system shall calculate the current week number based on today's date and the training plan's week boundaries.
- The system shall use `getWeeklyMileage()` from `data/trainingPlan.ts` for planned weekly totals.
- The system shall read actual logged miles from CompletionContext's `logs` map.
- The system shall update the stats in real time when a workout is logged or removed.
- The existing countdown ("X days to go") shall remain in the header.

**Proof Artifacts:**
- Screenshot: header showing countdown, weekly stat, and overall stat demonstrates all three elements render correctly.
- Interaction: log a workout and verify the weekly and overall actual mileage numbers update immediately demonstrates live reactivity.

---

## Non-Goals (Out of Scope)

1. **Notes field in logging**: The `WorkoutLog` schema already stores `notes`, but adding a notes input to the UI is not included in this spec.
2. **User authentication**: There is no login or account system — all data stays local to the device/browser.
3. **Push notifications or reminders**: No workout reminders or alerts.
4. **Custom training plan editing**: The Hal Higdon Novice 1 plan is fixed in `data/trainingPlan.ts` and is not user-editable.
5. **Dark mode toggle**: The app is light-only; no toggle or system-preference detection.

## Design Considerations

- **Light theme palette**: White (`#FFFFFF`) backgrounds, near-black (`#111827` or similar) for primary text, medium gray for secondary text, and retain the existing accent colors (green for easy runs, orange/amber for long runs, yellow for race day) adjusted for visibility on white.
- **Month navigation**: Prev/Next as simple icon buttons (chevrons) flanking the month/year label. Keep the same 7-column calendar grid layout.
- **Side panel**: Right-aligned, fixed width ~380px, with a subtle border or shadow to separate it from the calendar. Should not push the calendar — it overlays or sits beside it in a flex layout.
- **Stats layout**: Three stat blocks in the header row — countdown (largest, existing style), weekly progress, overall progress. Use concise labels ("Week", "Total").

## Repository Standards

- **Framework**: Expo + Expo Router. File-based routing under `app/`. Follow existing screen conventions.
- **Styling**: NativeWind (Tailwind CSS classes on React Native components). Add new color tokens to `tailwind.config.js` if needed; do not hardcode hex colors in components.
- **State**: CompletionContext (`db/CompletionContext.tsx`) is the source of truth for logged workouts. Do not introduce a second state layer.
- **Storage**: Platform-split via `db/storage.web.ts` and `db/storage.native.ts`. Keep this abstraction intact.
- **TypeScript**: All new files must be `.tsx` or `.ts` with proper types. No `any`.
- **No test suite present**: Proof artifacts are screenshots and manual interactions.

## Technical Considerations

- **Responsive detection**: Use React Native's `useWindowDimensions()` hook to detect screen width at runtime. Threshold: 768px. This is already the standard approach for responsive layouts in React Native Web.
- **Side panel**: On web, implement as an absolutely/fixed-positioned `View` over or beside the calendar. On native, keep the existing `expo-router` modal (`presentation: 'modal'`). Consider a conditional render in `_layout.tsx` or a wrapper component.
- **Tailwind tokens**: The current config uses `brand-*` tokens for the dark palette. Add a new light palette (e.g., `light-bg`, `light-card`) rather than overwriting the existing tokens, in case native dark styling is needed later.
- **Progress calculation**: `getWeeklyMileage(weekNum)` returns planned miles. Actual miles come from iterating `logs` filtered by date range for the current week. The current week number is derivable from today's date against `getPlanStartMonday()` (unexported — may need to export or duplicate logic).

## Security Considerations

No specific security considerations. All data is stored locally (localStorage on web, expo-sqlite on native). No network requests, no credentials.

## Success Metrics

1. **Light theme renders correctly**: All screens show white/light backgrounds with no dark `#0A0A0A` bleed-through on web.
2. **Pagination works end-to-end**: User can navigate from today's month (May 2026) to April 2027 and back, one month at a time, with boundary controls disabled correctly.
3. **Responsive panel works**: Day detail opens as side panel on a 1280px browser window and as full-screen modal on a 390px mobile viewport.
4. **Stats are accurate and live**: Weekly and overall planned/actual numbers match manually calculated values and update immediately after logging.

## Open Questions

1. Should the side panel close automatically when the user navigates to a different month (taps prev/next), or stay open on the last-selected day?
2. For the "total planned miles" stat, should race week (26.2 mi) be included in the total, or only training miles?
