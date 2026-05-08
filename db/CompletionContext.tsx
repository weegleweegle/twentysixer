import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getAllLogs, setLog, deleteLog, type WorkoutLog } from './storage';

export type { WorkoutLog };

interface CompletionCtx {
  logs: Map<string, WorkoutLog>;
  logWorkout: (date: string, actual_miles: number, notes?: string, source?: 'manual' | 'healthkit') => Promise<void>;
  removeLog: (date: string) => Promise<void>;
}

const CompletionContext = createContext<CompletionCtx | null>(null);

export function CompletionProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<Map<string, WorkoutLog>>(new Map());

  const load = useCallback(async () => {
    const rows = await getAllLogs();
    setLogs(new Map(rows.map(r => [r.date, r])));
  }, []);

  useEffect(() => { load(); }, [load]);

  const logWorkout = useCallback(async (date: string, actual_miles: number, notes = '', source: 'manual' | 'healthkit' = 'manual') => {
    await setLog(date, actual_miles, notes, source);
    await load();
  }, [load]);

  const removeLog = useCallback(async (date: string) => {
    await deleteLog(date);
    await load();
  }, [load]);

  return (
    <CompletionContext.Provider value={{ logs, logWorkout, removeLog }}>
      {children}
    </CompletionContext.Provider>
  );
}

export function useCompletions() {
  const ctx = useContext(CompletionContext);
  if (!ctx) throw new Error('useCompletions must be used within CompletionProvider');
  return ctx;
}
