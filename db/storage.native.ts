import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

export interface WorkoutLog {
  date: string;
  actual_miles: number;
  notes: string;
}

let _db: SQLiteDatabase | null = null;

async function getDb(): Promise<SQLiteDatabase> {
  if (_db) return _db;
  _db = await openDatabaseAsync('marathon.db');
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_log (
      date TEXT PRIMARY KEY,
      actual_miles REAL NOT NULL,
      notes TEXT NOT NULL DEFAULT ''
    );
  `);
  return _db;
}

export async function getAllLogs(): Promise<WorkoutLog[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutLog>('SELECT date, actual_miles, notes FROM workout_log');
}

export async function setLog(date: string, actual_miles: number, notes: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO workout_log (date, actual_miles, notes) VALUES (?, ?, ?)',
    date, actual_miles, notes
  );
}

export async function deleteLog(date: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM workout_log WHERE date = ?', date);
}
