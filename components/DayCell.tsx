import { Pressable, Text, View } from 'react-native';
import { WorkoutType } from '../data/trainingPlan';
import { useCompletions } from '../db/CompletionContext';

interface Props {
  day: number | null;
  dateStr: string | null;
  workoutType: WorkoutType | null;
  miles: number;
  isToday: boolean;
  isPast: boolean;
  onPress: () => void;
}

const BG: Record<WorkoutType, string> = {
  rest: 'bg-transparent',
  easy: 'bg-brand-success/20',
  long: 'bg-brand-primary/25',
  race: 'bg-yellow-500/30',
  cross: 'bg-blue-500/20',
};

const MILES_COLOR: Record<WorkoutType, string> = {
  rest: 'text-brand-muted',
  easy: 'text-brand-success',
  long: 'text-brand-primary',
  race: 'text-yellow-400',
  cross: 'text-blue-400',
};

export default function DayCell({ day, dateStr, workoutType, miles, isToday, isPast, onPress }: Props) {
  const { logs } = useCompletions();
  const log = dateStr ? logs.get(dateStr) : undefined;
  const isCompleted = !!log;
  const isWatch = log?.source === 'healthkit';

  if (day === null) {
    return <View className="flex-1 aspect-square" />;
  }

  const hasWorkout = workoutType && workoutType !== 'rest';
  const bg = workoutType ? BG[workoutType] : 'bg-transparent';
  const milesColor = workoutType ? MILES_COLOR[workoutType] : 'text-brand-muted';
  const dimmed = isPast && !isToday && !isCompleted;

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 aspect-square m-0.5 rounded-xl items-center justify-center ${bg} ${isToday ? 'border border-light-border' : ''}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : dimmed ? 0.45 : 1 })}
    >
      <Text
        className={`text-xs font-semibold ${isToday ? 'text-light-text' : 'text-light-subtle'}`}
      >
        {day}
      </Text>
      {hasWorkout && miles > 0 && (
        <Text className={`text-[9px] font-bold mt-0.5 ${milesColor}`}>
          {miles}mi
        </Text>
      )}
      {workoutType === 'race' && (
        <Text className="text-[8px] mt-0.5">🏁</Text>
      )}
      {isCompleted && hasWorkout && (
        <View className="absolute top-0.5 right-1">
          {isWatch
            ? <Text className="text-[9px]">⌚</Text>
            : <Text className="text-brand-success text-[9px] font-black">✓</Text>
          }
        </View>
      )}
    </Pressable>
  );
}
