# 01-validation-marathon-webapp

**Validated:** 2026-05-06  
**Validated By:** Claude Sonnet 4.6  
**Commit Analyzed:** `9b987fa` — feat: light theme, month pagination, responsive day panel, progress stats

---

## 1. Executive Summary

| | |
|---|---|
| **Overall** | **PASS** — no CRITICAL or HIGH gate trips |
| **Implementation Ready** | **Yes** — all 22 functional requirements verified; 2 minor issues to clean up before final merge |
| **Requirements Verified** | 22 / 22 (100%) |
| **Proof Artifacts Working** | All code-verifiable artifacts confirmed; screenshot artifacts require manual browser verification |
| **Files Changed vs Expected** | 8 expected + 4 out-of-scope infrastructure files |

---

## 2. Coverage Matrix

### Functional Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-1 | App background renders as white `#FFFFFF` | **Verified** | `tailwind.config.js:9` `bg: '#FFFFFF'`; `app/_layout.tsx:13` `backgroundColor: '#FFFFFF'` |
| FR-2 | All `bg-brand-bg`, `bg-brand-card`, `bg-brand-surface` replaced with light equivalents | **Verified** | `grep brand-bg app/ components/` → zero matches |
| FR-3 | One calendar month displayed at a time | **Verified** | `app/index.tsx:57` `useState(0)` drives single `<MonthCalendar>` render |
| FR-4 | Previous and Next navigation controls provided | **Verified** | `app/index.tsx:148-168` ‹ and › Pressables with month/year label |
| FR-5 | Previous disabled at earliest navigable month | **Verified** | `app/index.tsx:153-154` `disabled={currentIdx === 0}`, opacity 0.3 |
| FR-6 | Next disabled at race month (April 2027) | **Verified** | `app/index.tsx:164-165` `disabled={currentIdx === months.length - 1}` |
| FR-7 | Initializes to current month on first load | **Verified** | `useState(0)` where `months[0]` is today's month via `viewStart` |
| FR-8 | Only months from today forward are navigable | **Verified** | `viewStart` computed from today; `monthsBetween(viewStart, end)` is the navigation range |
| FR-9 | Detects wide screen at ≥ 768px | **Verified** | `app/index.tsx:46-47` `useWindowDimensions(); isWide = width >= 768` |
| FR-10 | Side panel ~380px wide, calendar visible on left | **Verified** | `app/index.tsx:184-191` `width: 380`, `flexDirection: 'row'` |
| FR-11 | Narrow screen keeps full-screen modal | **Verified** | `handleDayPress` calls `router.push` when `!isWide`; `_layout.tsx` `presentation: 'modal'` intact |
| FR-12 | Panel shows on day tap, hides on close | **Verified** | `setSelectedDate(dateStr)` on tap; `setSelectedDate(null)` on close |
| FR-13 | Panel contains same content as day detail screen | **Verified** | `components/DayDetail.tsx` extracted from original `app/day/[date].tsx`; same JSX |
| FR-14 | Log, edit, undo available in side panel | **Verified** | `DayDetail.tsx:64-82` `handleSave`, `startEdit`, `handleUndo` via `useCompletions` |
| FR-15 | Close via Close button or tapping outside | **Verified** | Close button: `DayDetail.tsx:219`; outside-tap: `app/index.tsx:84` `Pressable` wrapper |
| FR-16 | Current week planned/actual in header | **Verified** | `app/index.tsx:65,119` `weekPlanned` / `weekActual` rendered in "This Week" card |
| FR-17 | Total planned/actual in header | **Verified** | `app/index.tsx:66-67,127-129` `totalPlanned=1110.2` / `totalActual` in "Total" card |
| FR-18 | Current week derived from today's date | **Verified** | `data/trainingPlan.ts:196` `getCurrentWeekNum(todayStr)` → `trainingPlan.get(todayStr)?.week` |
| FR-19 | `getWeeklyMileage()` used for planned weekly total | **Verified** | `app/index.tsx:64` `getWeeklyMileage(weekNum)` |
| FR-20 | Actual miles read from CompletionContext logs | **Verified** | `app/index.tsx:60,65` `useCompletions(); logs.get(d)?.actual_miles` |
| FR-21 | Stats update in real time on log/remove | **Verified** | `logs` is reactive `useState<Map>` in `CompletionContext`; derived values recompute on every render |
| FR-22 | Existing countdown remains in header | **Verified** | `app/index.tsx:108-115` countdown retained |

---

### Repository Standards

| Standard | Status | Evidence & Notes |
|---|---|---|
| Expo + Expo Router file-based routing | **Verified** | `app/index.tsx`, `app/day/[date].tsx` follow `app/` routing convention; `_layout.tsx` unchanged |
| NativeWind Tailwind styling — no hardcoded hex | **Partial** | All component `className` props use tokens; two `style` prop hex values in `app/index.tsx:189-190` (see Issues) |
| CompletionContext as sole state source | **Verified** | No second state layer introduced; `useCompletions` used in `DayDetail` and `index.tsx` |
| Storage abstraction untouched | **Verified** | `db/storage.web.ts` and `db/storage.native.ts` unchanged |
| TypeScript — no `any` types | **Verified** | `grep ": any" app/ components/ data/` → zero results; all new files fully typed |
| No test suite — proof artifacts as evidence | **Verified** | Consistent with repo convention; all proof artifacts are code inspection + CLI output |

---

### Proof Artifacts

| Task | Artifact | Status | Verification |
|---|---|---|---|
| 1.0 Light Theme | `tailwind.config.js` — light token group | **Verified** | `light:` block confirmed at line 8; 7 tokens present |
| 1.0 Light Theme | No dark `brand-bg`/`text-white` in app or component files | **Verified** | `grep brand-bg app/ components/` → 0 matches |
| 1.0 Light Theme | StatusBar `style="dark"`, contentStyle white | **Verified** | `app/_layout.tsx:9,13` confirmed |
| 2.0 Pagination | `currentIdx` state + single MonthCalendar render | **Verified** | `app/index.tsx:57,174` confirmed |
| 2.0 Pagination | Previous bound: `disabled={currentIdx === 0}`, opacity 0.3 | **Verified** | `app/index.tsx:153-154` confirmed |
| 2.0 Pagination | Next bound: `disabled={currentIdx === months.length - 1}` | **Verified** | `app/index.tsx:164-165` confirmed |
| 3.0 Responsive Panel | `DayDetail` component with `{ date, onClose }` props | **Verified** | `components/DayDetail.tsx:36-39` confirmed |
| 3.0 Responsive Panel | `app/day/[date].tsx` thin wrapper | **Verified** | File is 13 lines total; delegates to `DayDetail` |
| 3.0 Responsive Panel | `useWindowDimensions` + `isWide` + `flex-row` layout | **Verified** | `app/index.tsx:46-47,79` confirmed |
| 3.0 Responsive Panel | `handleDayPress` routes by width | **Verified** | `app/index.tsx:69-75` confirmed |
| 4.0 Progress Stats | `getCurrentWeekNum` exported | **Verified** | `data/trainingPlan.ts:196` confirmed |
| 4.0 Progress Stats | `getWeekDates` exported | **Verified** | `data/trainingPlan.ts:200` confirmed |
| 4.0 Progress Stats | `getTotalPlannedMiles` → 1110.2 | **Verified** | CLI: `npx tsx` → `1110.2` ✓ |
| 4.0 Progress Stats | `getCurrentWeekNum('2026-05-06')` → null | **Verified** | CLI: `npx tsx` → `null` ✓ (today is before plan start) |
| 4.0 Progress Stats | Stats wired to `useCompletions().logs` | **Verified** | `app/index.tsx:60,65,67` confirmed; `logs` is reactive state |
| All | Zero TypeScript errors in changed files | **Verified** | `npx tsc --noEmit \| grep -v CompletionContext` → no output |

---

## 3. Validation Issues

| Severity | Issue | Impact | Recommendation |
|---|---|---|---|
| **MEDIUM** | `app.json:8` `userInterfaceStyle` changed from `"light"` to `"dark"` in the spec commit. For a light-only app (dark mode explicitly out of scope), this should remain `"light"`. Evidence: `git diff HEAD~1 -- app.json` shows the regression. | On iOS, the OS may apply dark-mode appearance to system UI (dialogs, keyboard) even though the app renders a light theme. | Revert: `"userInterfaceStyle": "light"` in `app.json`. |
| **LOW** | Two hardcoded hex colors in `app/index.tsx:189-190`: `borderLeftColor: '#C6C6C8'` and `backgroundColor: '#FFFFFF'`. These match `light-border` and `light-bg` tokens respectively but bypass the token system. Repository standard: "do not hardcode hex colors in components." | Token drift risk if palette changes. `backgroundColor: '#FFFFFF'` is avoidable; `borderLeftColor` is partially justified since NativeWind does not map `border-l-*` to `borderLeftColor` in React Native style props. | Replace `backgroundColor: '#FFFFFF'` with `className="bg-light-bg"` on the panel `View`. Document `borderLeftColor` hardcode with an inline comment noting NativeWind limitation. |
| **LOW** | `app.json`, `index.ts`, `package.json`, `package-lock.json` changed in the spec commit but not listed in "Relevant Files." Commit message does not explicitly call these out. | Reduces traceability — a reviewer cannot tell from the task list alone that these files were in scope. | Add a note to task list "Relevant Files" that `index.ts` (Expo Router entry), `package.json` (dependency additions), and `app.json` (app config) were also modified as infrastructure prerequisites. |
| **LOW (open question)** | Spec Open Question 1 is unresolved: the side panel does not close when the user navigates to a different month. `selectedDate` stays set, potentially showing details for a day in a month no longer visible. | Minor UX inconsistency on desktop — panel shows stale context if user pages away. | Decide and document: either call `setSelectedDate(null)` in the prev/next `onPress` handlers, or keep current behavior and close the open question in the spec. |

---

## 4. Evidence Appendix

### Git Commit Analyzed

```
commit 9b987fafbbefced0c40847323fc79a5ad7f1ce3a
feat: light theme, month pagination, responsive day panel, progress stats
12 files changed, 1295 insertions(+)
```

### Files Changed vs Relevant Files

| File | In Relevant Files? | Notes |
|---|---|---|
| `tailwind.config.js` | ✅ Yes | |
| `app/_layout.tsx` | ✅ Yes | |
| `app/index.tsx` | ✅ Yes | |
| `app/day/[date].tsx` | ✅ Yes | |
| `components/MonthCalendar.tsx` | ✅ Yes | |
| `components/DayCell.tsx` | ✅ Yes | |
| `components/DayDetail.tsx` | ✅ Yes | New file |
| `data/trainingPlan.ts` | ✅ Yes | |
| `docs/specs/01-spec-marathon-webapp/` | ✅ Yes (docs) | Spec, tasks, proofs |
| `app.json` | ⚠️ Not listed | Infrastructure; `userInterfaceStyle` regression |
| `index.ts` | ⚠️ Not listed | Infrastructure; Expo Router entry point (correct change) |
| `package.json` | ⚠️ Not listed | Infrastructure; added expo-router, nativewind, etc. |
| `package-lock.json` | ⚠️ Not listed | Auto-generated from package.json |

### Key CLI Verification Results

```
$ npx tsx -e "import { getTotalPlannedMiles, getCurrentWeekNum } from './data/trainingPlan'; ..."
Total planned miles: 1110.2
getCurrentWeekNum('2026-05-11') → 1
getCurrentWeekNum('2026-05-06') → null
getWeeklyMileage(1) → 9
getWeeklyMileage(50) → 32.2
Plan size: 350 days / 50 weeks

$ npx tsc --noEmit | grep -v CompletionContext
(no output — zero new errors)

$ grep -rn "bg-brand-bg|text-white\b" app/ components/
(no output — zero dark token leakage)

$ grep -rn ": any\b|as any\b" app/ components/ data/
(no output — no any types)
```

### Open Questions Status

| # | Question | Resolution |
|---|---|---|
| 1 | Does panel close on month navigation? | **Unresolved** — current behavior keeps panel open. See issue above. |
| 2 | Does total include race day 26.2 mi? | **Implicitly resolved** — `getTotalPlannedMiles()` sums all miles including race (total = 1110.2). Recommend closing this in the spec. |
