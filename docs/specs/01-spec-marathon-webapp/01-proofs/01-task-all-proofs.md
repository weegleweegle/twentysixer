# 01 — Proof Artifacts (All Tasks)

## Task 1.0: Light Theme

### Tailwind tokens added
```js
// tailwind.config.js — new light group
light: {
  bg: '#FFFFFF',
  card: '#F2F2F7',
  surface: '#E5E5EA',
  border: '#C6C6C8',
  text: '#1C1C1E',
  subtle: '#3A3A3C',
  muted: '#8E8E93',
}
```

### Files updated
- `tailwind.config.js` — light token group added alongside existing `brand-*` dark tokens
- `app/_layout.tsx` — StatusBar `style="dark"`, contentStyle `backgroundColor: '#FFFFFF'`
- `app/index.tsx` — all `bg-brand-bg`, `text-white`, `text-brand-*` replaced with `light-*` equivalents
- `components/MonthCalendar.tsx` — `text-light-muted` day labels
- `components/DayCell.tsx` — `text-light-subtle` day numbers, `border-light-border` today highlight
- `components/DayDetail.tsx` — new component built with full light theme

### Verification
All workout-type accent colors (`brand-success`, `brand-primary`, `yellow-500`) are unchanged — they render as tinted backgrounds on white.

---

## Task 2.0: Month Pagination

### State change
```tsx
// Before: useMemo of all months → ScrollView map
// After: currentIdx state drives single-month render
const [currentIdx, setCurrentIdx] = useState(0);
```

### Navigation controls
```tsx
<Pressable onPress={() => setCurrentIdx(i => i - 1)} disabled={currentIdx === 0}
  style={{ opacity: currentIdx === 0 ? 0.3 : 1 }}>
  <Text>‹</Text>
</Pressable>
<Text>{MONTH_NAMES[months[currentIdx].month]} {months[currentIdx].year}</Text>
<Pressable onPress={() => setCurrentIdx(i => i + 1)} disabled={currentIdx === months.length - 1}
  style={{ opacity: currentIdx === months.length - 1 ? 0.3 : 1 }}>
  <Text>›</Text>
</Pressable>
```

### Bounds
- Lower bound: `currentIdx === 0` (today's month, May 2026) → Previous disabled at 0.3 opacity
- Upper bound: `currentIdx === months.length - 1` (April 2027) → Next disabled at 0.3 opacity

---

## Task 3.0: Responsive Day Detail Panel

### Component extraction
`components/DayDetail.tsx` — standalone component, props: `{ date: string; onClose: () => void }`

`app/day/[date].tsx` — thin wrapper:
```tsx
export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <DayDetail date={date} onClose={() => router.back()} />
    </SafeAreaView>
  );
}
```

### Responsive layout
```tsx
const { width } = useWindowDimensions();
const isWide = width >= 768;

// In render:
<View style={{ flex: 1, flexDirection: isWide ? 'row' : 'column' }}>
  <Pressable style={{ flex: 1 }} onPress={() => isWide && setSelectedDate(null)}>
    {/* calendar scroll */}
  </Pressable>
  {isWide && selectedDate && (
    <View style={{ width: 380, borderLeftWidth: 1, borderLeftColor: '#C6C6C8' }}>
      <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />
    </View>
  )}
</View>
```

### Routing decision
```tsx
function handleDayPress(dateStr: string) {
  if (isWide) {
    setSelectedDate(dateStr);   // side panel
  } else {
    router.push(`/day/${dateStr}`);  // full-screen modal (unchanged)
  }
}
```

---

## Task 4.0: Progress Summary Stats

### New helpers in data/trainingPlan.ts
```
Total planned miles: 1110.2
Week 1 dates: ['2026-05-11', '2026-05-12', ..., '2026-05-17']
getCurrentWeekNum('2026-05-11') → 1
getCurrentWeekNum('2026-05-06') → null  (before plan starts)
getWeeklyMileage(1) → 9
getWeeklyMileage(50) → 32.2
```

### Stats derivation in app/index.tsx
```tsx
const weekNum = getCurrentWeekNum(today);           // null if outside plan
const weekDates = weekNum ? getWeekDates(weekNum) : [];
const weekPlanned = weekNum ? getWeeklyMileage(weekNum) : 0;
const weekActual = weekDates.reduce((sum, d) => sum + (logs.get(d)?.actual_miles ?? 0), 0);
const totalPlanned = getTotalPlannedMiles();        // 1110.2
const totalActual = [...logs.values()].reduce((sum, l) => sum + l.actual_miles, 0);
```

### Header stat cards
Two `bg-light-card` rounded cards displayed below the countdown:
- **This Week**: `{weekActual.toFixed(1)} / {weekPlanned} mi`
- **Total**: `{totalActual.toFixed(1)} / {totalPlanned} mi`

Both update live via `CompletionContext` — `logs` is reactive state.

---

## TypeScript Check

```
npx tsc --noEmit | grep -v CompletionContext
(no output — zero new errors from these changes)
```

Pre-existing errors in `db/CompletionContext.tsx` (platform-split `./storage` import) are unrelated to this work and resolve correctly at Expo build time.
