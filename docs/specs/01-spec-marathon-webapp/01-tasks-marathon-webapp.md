# 01-tasks-marathon-webapp

## Relevant Files

- `tailwind.config.js` — Add light palette color tokens alongside existing dark `brand-*` tokens.
- `app/_layout.tsx` — Change status bar style from `light` to `dark`; update `contentStyle` background to white.
- `app/index.tsx` — Major changes: light theme classes, month pagination state, responsive panel layout, progress stats.
- `components/MonthCalendar.tsx` — Update text color classes for light theme.
- `components/DayCell.tsx` — Update text and background classes for light theme; adjust workout-type accent opacity for white background.
- `app/day/[date].tsx` — Update all dark `brand-*` classes to light equivalents; refactor to delegate to new `DayDetail` component.
- `components/DayDetail.tsx` — **New file.** Extracted day detail UI as a standalone component accepting `date` and `onClose` props; used by both the route screen and the desktop side panel.
- `data/trainingPlan.ts` — Add three helper exports: `getCurrentWeekNum`, `getTotalPlannedMiles`, `getWeekDates`.

### Notes

- No test suite is present in this repo. Proof artifacts are screenshots and manual interactions.
- NativeWind class changes take effect on next dev server reload. Use `expo start --web` to verify web layout.
- Use `useWindowDimensions()` from `react-native` (already available) to detect screen width — no new dependencies needed.
- All new `.tsx` files must be fully typed with no `any`.

## Tasks

### [x] 1.0 Light Theme

#### 1.0 Proof Artifact(s)

- Screenshot: CalendarScreen showing white background, dark text, and correctly colored workout-type accents (green easy, orange long, yellow race) demonstrates the light palette is applied to the calendar.
- Screenshot: Day detail screen showing white/light card backgrounds with readable dark text demonstrates all screens are rethemed.

#### 1.0 Tasks

- [x] 1.1 In `tailwind.config.js`, add a `light` color group under `theme.extend.colors` with these tokens: `bg: '#FFFFFF'`, `card: '#F2F2F7'`, `surface: '#E5E5EA'`, `border: '#C6C6C8'`, `text: '#1C1C1E'`, `subtle: '#3A3A3C'`, `muted: '#8E8E93'`. Keep all existing `brand-*` tokens untouched.
- [x] 1.2 In `app/_layout.tsx`, change `<StatusBar style="light" />` to `style="dark"` and update `contentStyle: { backgroundColor: '#FFFFFF' }`.
- [x] 1.3 In `app/index.tsx` (CalendarScreen), replace every `bg-brand-bg` with `bg-light-bg`, `text-white` with `text-light-text`, `text-brand-subtle` with `text-light-subtle`, `text-brand-muted` with `text-light-muted`, and `text-brand-primary` with `text-brand-primary` (accent unchanged). Update the countdown number color to `text-brand-primary` and legend dot colors to match.
- [x] 1.4 In `components/MonthCalendar.tsx`, replace `text-white` on the month header with `text-light-text` and `text-brand-muted` on day-of-week labels with `text-light-muted`.
- [x] 1.5 In `components/DayCell.tsx`, replace `text-brand-subtle` (day number) with `text-light-subtle` and `text-white` (today highlight) with `text-light-text`. Keep all workout-type background colors (`bg-brand-success/20`, `bg-brand-primary/25`, etc.) — they remain readable on white. Update `border-white/60` on today's cell to `border-light-border`.
- [x] 1.6 In `app/day/[date].tsx`, replace all dark background classes: `bg-brand-bg` → `bg-light-bg`, `bg-brand-card` → `bg-light-card`, `bg-brand-surface` → `bg-light-surface`. Replace all dark text classes: `text-white` → `text-light-text`, `text-brand-subtle` → `text-light-subtle`, `text-brand-muted` → `text-light-muted`. Keep all accent colors (`text-brand-success`, `text-brand-primary`, `text-yellow-400`, `text-blue-400`) unchanged.

---

### [x] 2.0 Month Pagination

#### 2.0 Proof Artifact(s)

- Screenshot: CalendarScreen showing a single month grid with Previous (‹) and Next (›) chevron buttons flanking the month/year heading demonstrates pagination replaces the all-months scroll.
- Screenshot: Previous button visually disabled (reduced opacity) when viewing today's month (May 2026) demonstrates the lower-bound guard.
- Screenshot: Next button visually disabled when viewing April 2027 demonstrates the upper-bound guard.

#### 2.0 Tasks

- [x] 2.1 In `app/index.tsx`, replace the `months` array that drives the `ScrollView` with a `currentIdx` state: `const [currentIdx, setCurrentIdx] = useState(0)` where index 0 is today's month.
- [x] 2.2 Remove the `ScrollView` wrapping all `MonthCalendar` instances. Render only `<MonthCalendar year={months[currentIdx].year} month={months[currentIdx].month} todayStr={today} />`.
- [x] 2.3 Add a navigation row above the calendar grid containing: a Previous button (`‹`), the current month/year label (e.g., "May 2026"), and a Next button (`›`). Style them using light theme tokens — the label in `text-light-text font-bold text-lg`, the chevrons as `Pressable` with `text-brand-primary text-2xl`.
- [x] 2.4 Wire the Previous button: `onPress={() => setCurrentIdx(i => i - 1)}`. Disable and visually dim it (opacity 0.3) when `currentIdx === 0`.
- [x] 2.5 Wire the Next button: `onPress={() => setCurrentIdx(i => i + 1)}`. Disable and visually dim it when `currentIdx === months.length - 1`.

---

### [x] 3.0 Responsive Day Detail Panel

#### 3.0 Proof Artifact(s)

- Screenshot: Desktop browser (viewport ≥ 768px) showing the calendar on the left and the day detail panel on the right simultaneously demonstrates the side-panel layout.
- Screenshot: Mobile viewport (≤ 390px) showing the full-screen bottom-sheet modal demonstrates mobile behavior is unchanged.
- Interaction: Log a float mile value (e.g., 3.5 mi) via the side panel, then screenshot the calendar cell showing the ✓ checkmark without a page reload demonstrates the panel is wired to `CompletionContext`.

#### 3.0 Tasks

- [x] 3.1 Create `components/DayDetail.tsx`. Copy all JSX and logic from `app/day/[date].tsx` into this new component. The component signature is: `export default function DayDetail({ date, onClose }: { date: string; onClose: () => void })`. Replace `useLocalSearchParams` with the passed `date` prop. Replace `router.back()` with `onClose()`.
- [x] 3.2 Refactor `app/day/[date].tsx` to be a thin wrapper: extract `date` from `useLocalSearchParams`, import `DayDetail` from `components/DayDetail.tsx`, and render `<DayDetail date={date} onClose={() => router.back()} />`.
- [x] 3.3 In `app/index.tsx`, import `useWindowDimensions` from `react-native` and add `const { width } = useWindowDimensions()`. Add state: `const [selectedDate, setSelectedDate] = useState<string | null>(null)`. Define `const isWide = width >= 768`.
- [x] 3.4 Update the `onPress` handler passed to each `DayCell` in `app/index.tsx`: if `isWide`, call `setSelectedDate(dateStr)` instead of `router.push(...)`. Keep the `router.push` path for narrow screens.
- [x] 3.5 Wrap the entire CalendarScreen content in a `flex-row` `View` when `isWide`. The calendar column takes `flex-1`. When `selectedDate` is set and `isWide`, render `<DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />` in a fixed-width (380px) right panel with a left border (`border-l border-light-border`) and a white background.
- [x] 3.6 Add a close-on-outside-tap behavior: wrap the calendar column in a `Pressable` that calls `setSelectedDate(null)` when `isWide && selectedDate` and the user taps the calendar area (not a day cell). Ensure `DayCell` presses stop propagation so they don't immediately close the panel.

---

### [x] 4.0 Progress Summary Stats

#### 4.0 Proof Artifact(s)

- Screenshot: CalendarScreen header showing all three elements — countdown ("X days to go"), weekly stat ("Week: X.X / Y mi"), and overall stat ("Total: X.X / Y mi") — demonstrates the stats render correctly.
- Interaction: Log a workout, then screenshot the updated weekly and overall actual-miles numbers to demonstrate live reactivity via `CompletionContext`.

#### 4.0 Tasks

- [x] 4.1 In `data/trainingPlan.ts`, export `getCurrentWeekNum(todayStr: string): number | null`. Iterate `trainingPlan` to find the `TrainingDay` whose `date === todayStr` and return its `week`. Return `null` if today is outside the plan.
- [x] 4.2 In `data/trainingPlan.ts`, export `getTotalPlannedMiles(): number`. Sum `day.workout.miles` for every entry in `trainingPlan` where `day.workout.type !== 'rest'`.
- [x] 4.3 In `data/trainingPlan.ts`, export `getWeekDates(weekNum: number): string[]`. Return an array of all `date` strings where `day.week === weekNum`.
- [x] 4.4 In `app/index.tsx`, import `useCompletions` and the three new helpers. Derive: `weekNum = getCurrentWeekNum(today)`, `weekDates = weekNum ? getWeekDates(weekNum) : []`, `weekPlanned = weekNum ? getWeeklyMileage(weekNum) : 0`, `weekActual = weekDates.reduce((sum, d) => sum + (logs.get(d)?.actual_miles ?? 0), 0)`, `totalPlanned = getTotalPlannedMiles()`, `totalActual = [...logs.values()].reduce((sum, l) => sum + l.actual_miles, 0)`.
- [x] 4.5 Replace the existing countdown-only header in `app/index.tsx` with a three-block stat row. Keep the large countdown number as the primary element. Add two smaller stat blocks: "Week" showing `{weekActual.toFixed(1)} / {weekPlanned} mi` and "Total" showing `{totalActual.toFixed(1)} / {totalPlanned} mi`. Style secondary blocks with `text-light-muted text-xs` labels and `text-light-text font-semibold` values.
