# Task 1.0 Proof Artifacts — Add `source` Field to Storage Layer

## TypeScript Verification

```
$ npx tsc --noEmit
exit:0
```
No type errors. All files compile cleanly.

## WorkoutLog Interface

Both platform implementations now include `source: 'manual' | 'healthkit'`:

```typescript
// db/storage.native.ts and db/storage.web.ts
export interface WorkoutLog {
  date: string;
  actual_miles: number;
  notes: string;
  source: 'manual' | 'healthkit';
}
```

## SQLite Schema (storage.native.ts)

```sql
CREATE TABLE IF NOT EXISTS workout_log (
  date TEXT PRIMARY KEY,
  actual_miles REAL NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual'
);

-- Migration for existing installs (error silently ignored if column exists):
ALTER TABLE workout_log ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';
```

## Updated setLog Signature

```typescript
// db/storage.native.ts & db/storage.web.ts
export async function setLog(
  date: string,
  actual_miles: number,
  notes: string,
  source: 'manual' | 'healthkit' = 'manual'
): Promise<void>

// db/CompletionContext.tsx
logWorkout: (date: string, actual_miles: number, notes?: string, source?: 'manual' | 'healthkit') => Promise<void>
```

## Web Backfill

`storage.web.ts` backfills `source: 'manual'` for any existing localStorage entries that pre-date this field:

```typescript
return new Map(arr.map(r => [r.date, { ...r, source: r.source ?? 'manual' }]));
```

## Files Changed

- `db/storage.native.ts` — added `source` to interface, schema, migration, SELECT, INSERT
- `db/storage.web.ts` — added `source` to interface, read backfill, write
- `db/storage.ts` — new TypeScript shim for Metro platform resolution
- `db/CompletionContext.tsx` — threaded optional `source` param through `logWorkout`
