// Stub for web and Android — HealthKit is iOS only.
// At runtime, Metro picks healthkit.ios.ts on iOS devices.

export async function requestPermission(): Promise<boolean> {
  return false;
}

export async function readOutdoorRuns(_date: string): Promise<{ miles: number }[]> {
  return [];
}
