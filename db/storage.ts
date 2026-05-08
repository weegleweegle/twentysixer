// This file exists solely for TypeScript resolution.
// At runtime, Metro picks storage.native.ts (iOS/Android) or storage.web.ts (web).
// The interfaces and signatures must stay in sync across all three files.
export type { WorkoutLog } from './storage.native';
export { getAllLogs, setLog, deleteLog } from './storage.native';
