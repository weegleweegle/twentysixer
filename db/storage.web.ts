export interface WorkoutLog {
  date: string;
  actual_miles: number;
  notes: string;
}

const KEY = 'marathon_workout_log';

function readStore(): Map<string, WorkoutLog> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Map();
    const arr: WorkoutLog[] = JSON.parse(raw);
    return new Map(arr.map(r => [r.date, r]));
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

export async function setLog(date: string, actual_miles: number, notes: string): Promise<void> {
  const store = readStore();
  store.set(date, { date, actual_miles, notes });
  writeStore(store);
}

export async function deleteLog(date: string): Promise<void> {
  const store = readStore();
  store.delete(date);
  writeStore(store);
}
