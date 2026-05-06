export type WorkoutType = 'rest' | 'easy' | 'long' | 'race' | 'cross';

export interface Workout {
  type: WorkoutType;
  miles: number;
  label: string;
}

export interface TrainingDay {
  date: string; // YYYY-MM-DD
  week: number;
  dayOfWeek: number; // 0=Sun, 1=Mon ... 6=Sat
  workout: Workout;
}

// 50-week plan: weeks 1-16 base, 17-32 development, 33-50 Hal Higdon Novice 1
// Mon=rest, Tue=easy, Wed=easy, Thu=easy, Fri=rest, Sat=long/easy, Sun=rest (or race week 50)
// Format: [tue_mi, wed_mi, thu_mi, sat_mi]
const PLAN_WEEKS: [number, number, number, number][] = [
  // --- Phase 1: Base Building (weeks 1–16, May 11 – Aug 30, 2026) ---
  [2, 2, 2, 3],    // week 1  (9 mi)
  [2, 2, 2, 4],    // week 2  (10)
  [2, 3, 2, 4],    // week 3  (11)
  [2, 2, 2, 3],    // week 4  (9 — cutback)
  [3, 3, 3, 4],    // week 5  (13)
  [3, 3, 3, 5],    // week 6  (14)
  [3, 4, 3, 5],    // week 7  (15)
  [3, 3, 3, 4],    // week 8  (13 — cutback)
  [3, 4, 3, 6],    // week 9  (16)
  [3, 4, 3, 7],    // week 10 (17)
  [4, 4, 4, 7],    // week 11 (19)
  [3, 3, 3, 5],    // week 12 (14 — cutback)
  [4, 4, 4, 8],    // week 13 (20)
  [4, 5, 4, 8],    // week 14 (21)
  [4, 5, 4, 9],    // week 15 (22)
  [3, 3, 3, 6],    // week 16 (15 — cutback)
  // --- Phase 2: Development (weeks 17–32, Aug 31 – Dec 20, 2026) ---
  [4, 5, 4, 10],   // week 17 (23)
  [5, 5, 5, 10],   // week 18 (25)
  [5, 5, 5, 11],   // week 19 (26)
  [4, 4, 4, 7],    // week 20 (19 — cutback)
  [5, 5, 5, 12],   // week 21 (27)
  [5, 6, 5, 12],   // week 22 (28)
  [5, 6, 5, 13],   // week 23 (29)
  [4, 4, 4, 8],    // week 24 (20 — cutback)
  [5, 6, 5, 14],   // week 25 (30)
  [6, 6, 6, 14],   // week 26 (32)
  [6, 6, 6, 15],   // week 27 (33)
  [4, 5, 4, 9],    // week 28 (22 — cutback)
  [6, 6, 6, 16],   // week 29 (34)
  [6, 7, 6, 16],   // week 30 (35)
  [5, 5, 5, 12],   // week 31 (27)
  [3, 3, 3, 6],    // week 32 (15 — transition)
  // --- Phase 3: Hal Higdon Novice 1 (weeks 33–50, Dec 21, 2026 – Apr 25, 2027) ---
  [3, 3, 3, 6],    // week 33 (HH wk 1)
  [3, 3, 3, 7],    // week 34 (HH wk 2)
  [3, 3, 3, 5],    // week 35 (HH wk 3 — cutback)
  [3, 3, 3, 9],    // week 36 (HH wk 4)
  [3, 4, 3, 10],   // week 37 (HH wk 5)
  [3, 4, 3, 7],    // week 38 (HH wk 6 — cutback)
  [4, 4, 4, 11],   // week 39 (HH wk 7)
  [4, 5, 4, 13],   // week 40 (HH wk 8)
  [4, 5, 4, 10],   // week 41 (HH wk 9 — cutback)
  [4, 5, 4, 15],   // week 42 (HH wk 10)
  [5, 5, 5, 16],   // week 43 (HH wk 11)
  [5, 6, 5, 12],   // week 44 (HH wk 12 — cutback)
  [5, 6, 5, 18],   // week 45 (HH wk 13)
  [5, 6, 5, 14],   // week 46 (HH wk 14 — cutback)
  [5, 6, 5, 20],   // week 47 (HH wk 15)
  [5, 4, 5, 20],   // week 48 (HH wk 16)
  [4, 3, 3, 12],   // week 49 (HH wk 17 — taper)
  [2, 2, 2, 0],    // week 50 (HH wk 18 — race week)
];

// RACE_DATE is the Big Sur Marathon — last Sunday of April 2027
export const RACE_DATE = '2027-04-25';

// Plan start = race week Monday minus (PLAN_WEEKS.length - 1) * 7 days
// With 50 weeks this resolves to Monday May 11, 2026
function getPlanStartMonday(): Date {
  const race = new Date(RACE_DATE + 'T00:00:00');
  const lastWeekMon = new Date(race);
  lastWeekMon.setDate(race.getDate() - 6);
  const week1Mon = new Date(lastWeekMon);
  week1Mon.setDate(lastWeekMon.getDate() - (PLAN_WEEKS.length - 1) * 7);
  return week1Mon;
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

// Pace estimates in seconds per mile
const EASY_PACE = 10 * 60 + 30; // 10:30/mi
const LONG_PACE = 11 * 60;      // 11:00/mi

export function estimateTime(miles: number, type: WorkoutType): string {
  if (miles === 0) return '';
  const pace = type === 'long' || type === 'race' ? LONG_PACE : EASY_PACE;
  const totalSec = Math.round(miles * pace);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function buildPlan(): Map<string, TrainingDay> {
  const map = new Map<string, TrainingDay>();
  const week1Mon = getPlanStartMonday();

  PLAN_WEEKS.forEach(([tue, wed, thu, sat], i) => {
    const weekNum = i + 1;
    const mon = addDays(week1Mon, i * 7);
    const isRaceWeek = weekNum === PLAN_WEEKS.length;

    // Mon — rest
    map.set(toISO(mon), {
      date: toISO(mon), week: weekNum, dayOfWeek: 1,
      workout: { type: 'rest', miles: 0, label: 'Rest' },
    });
    // Tue
    map.set(toISO(addDays(mon, 1)), {
      date: toISO(addDays(mon, 1)), week: weekNum, dayOfWeek: 2,
      workout: { type: 'easy', miles: tue, label: `${tue} mi easy` },
    });
    // Wed
    map.set(toISO(addDays(mon, 2)), {
      date: toISO(addDays(mon, 2)), week: weekNum, dayOfWeek: 3,
      workout: { type: 'easy', miles: wed, label: `${wed} mi easy` },
    });
    // Thu
    map.set(toISO(addDays(mon, 3)), {
      date: toISO(addDays(mon, 3)), week: weekNum, dayOfWeek: 4,
      workout: { type: 'easy', miles: thu, label: `${thu} mi easy` },
    });
    // Fri — rest
    map.set(toISO(addDays(mon, 4)), {
      date: toISO(addDays(mon, 4)), week: weekNum, dayOfWeek: 5,
      workout: { type: 'rest', miles: 0, label: 'Rest' },
    });
    // Sat
    if (isRaceWeek) {
      map.set(toISO(addDays(mon, 5)), {
        date: toISO(addDays(mon, 5)), week: weekNum, dayOfWeek: 6,
        workout: { type: 'rest', miles: 0, label: 'Rest' },
      });
    } else {
      const isLong = sat >= 10;
      map.set(toISO(addDays(mon, 5)), {
        date: toISO(addDays(mon, 5)), week: weekNum, dayOfWeek: 6,
        workout: { type: isLong ? 'long' : 'easy', miles: sat, label: `${sat} mi${isLong ? ' long' : ''}` },
      });
    }
    // Sun — rest (or race)
    const sun = addDays(mon, 6);
    if (isRaceWeek) {
      map.set(toISO(sun), {
        date: toISO(sun), week: weekNum, dayOfWeek: 0,
        workout: { type: 'race', miles: 26.2, label: 'Big Sur Marathon 🏁' },
      });
    } else {
      map.set(toISO(sun), {
        date: toISO(sun), week: weekNum, dayOfWeek: 0,
        workout: { type: 'rest', miles: 0, label: 'Rest' },
      });
    }
  });

  return map;
}

export const trainingPlan: Map<string, TrainingDay> = buildPlan();

export function getWorkoutForDate(dateStr: string): TrainingDay | null {
  return trainingPlan.get(dateStr) ?? null;
}

export function getPlanBounds(): { start: string; end: string } {
  return { start: toISO(getPlanStartMonday()), end: RACE_DATE };
}

export function getWeeklyMileage(weekNum: number): number {
  let total = 0;
  trainingPlan.forEach((day) => {
    if (day.week === weekNum) total += day.workout.miles;
  });
  return total;
}

export function getCurrentWeekNum(todayStr: string): number | null {
  return trainingPlan.get(todayStr)?.week ?? null;
}

export function getWeekDates(weekNum: number): string[] {
  const dates: string[] = [];
  trainingPlan.forEach((day) => {
    if (day.week === weekNum) dates.push(day.date);
  });
  return dates;
}

export function getTotalPlannedMiles(): number {
  let total = 0;
  trainingPlan.forEach((day) => {
    total += day.workout.miles;
  });
  return total;
}
