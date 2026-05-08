export interface WorkoutLog {
  date: string;
  actual_miles: number;
  notes: string;
  source: 'manual' | 'healthkit';
}

const KEY = 'marathon_workout_log';

function readStore(): Map<string, WorkoutLog> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Map();
    const arr: WorkoutLog[] = JSON.parse(raw);
    // Backfill source for entries saved before this field existed
    return new Map(arr.map(r => [r.date, { ...r, source: r.source ?? 'manual' }]));
  } catch {
    return new Map();
  }
}

function writeStore(map: Map<string, WorkoutLog>) {
  localStorage.setItem(KEY, JSON.stringify([...map.values()]));
}

export async function getAllLogs(): Promise<WorkoutLog[]> {
  return [...readStore().values()];
}

export async function setLog(
  date: string,
  actual_miles: number,
  notes: string,
  source: 'manual' | 'healthkit' = 'manual'
): Promise<void> {
  const store = readStore();
  store.set(date, { date, actual_miles, notes, source });
  writeStore(store);
}

export async function deleteLog(date: string): Promise<void> {
  const store = readStore();
  store.delete(date);
  writeStore(store);
}
