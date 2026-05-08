import AppleHealthKit, {
  type HealthInputOptions,
  type HealthKitPermissions,
} from 'react-native-health';

const PERMS: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Workout],
    write: [],
  },
};

export function requestPermission(): Promise<boolean> {
  return new Promise(resolve => {
    AppleHealthKit.initHealthKit(PERMS, (err: string) => {
      resolve(!err);
    });
  });
}

export async function readOutdoorRuns(date: string): Promise<{ miles: number }[]> {
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.000Z`;

  const options: HealthInputOptions = {
    startDate: startOfDay,
    endDate: endOfDay,
  };

  return new Promise(resolve => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AppleHealthKit.getSamples(options, (err: string, results: any[]) => {
      if (err || !results) {
        resolve([]);
        return;
      }
      // Filter to outdoor running workouts (HKWorkoutActivityType 37 = Running)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runs = results
        .filter((w: any) => w.activityName === 'Running' || w.workoutActivityType === 37)
        .map((w: any) => ({ miles: w.distance ?? w.totalDistance ?? 0 }))
        .filter(r => r.miles > 0);
      resolve(runs);
    });
  });
}
