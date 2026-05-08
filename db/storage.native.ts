import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

export interface WorkoutLog {
  date: string;
  actual_miles: number;
  notes: string;
  source: 'manual' | 'healthkit';
}

let _db: SQLiteDatabase | null = null;

async function getDb(): Promise<SQLiteDatabase> {
  if (_db) return _db;
  _db = await openDatabaseAsync('marathon.db');
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_log (
      date TEXT PRIMARY KEY,
      actual_miles REAL NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'manual'
    );
  `);
  // Migration: add source column if it doesn't exist yet (for existing installs)
  try {
    await _db.execAsync(`ALTER TABLE workout_log ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';`);
  } catch {
    // Column already exists — safe to ignore
  }
  return _db;
}

export async function getAllLogs(): Promise<WorkoutLog[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutLog>('SELECT date, actual_miles, notes, source FROM workout_log');
}

export async function setLog(
  date: string,
  actual_miles: number,
  notes: string,
  source: 'manual' | 'healthkit' = 'manual'
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO workout_log (date, actual_miles, notes, source) VALUES (?, ?, ?, ?)',
    date, actual_miles, notes, source
  );
}

export async function deleteLog(date: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM workout_log WHERE date = ?', date);
}
