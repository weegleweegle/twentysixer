import { Text, View } from 'react-native';
import { getWorkoutForDate } from '../data/trainingPlan';
import DayCell from './DayCell';

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  year: number;
  month: number;
  todayStr: string;
  onDayPress: (dateStr: string) => void;
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function MonthCalendar({ year, month, todayStr, onDayPress }: Props) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View className="mb-4 px-4">
      {/* Day-of-week labels */}
      <View className="flex-row mb-1">
        {DOW_LABELS.map((l, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-light-muted text-[11px] font-medium">{l}</Text>
          </View>
        ))}
      </View>

      {/* Calendar rows */}
      {rows.map((row, ri) => (
        <View key={ri} className="flex-row">
          {row.map((day, ci) => {
            const dateStr = day ? toISO(year, month, day) : null;
            const td = dateStr ? getWorkoutForDate(dateStr) : null;
            const isPast = dateStr ? dateStr < todayStr : false;

            return (
              <DayCell
                key={ci}
                day={day}
                dateStr={dateStr}
                workoutType={td?.workout.type ?? null}
                miles={td?.workout.miles ?? 0}
                isToday={dateStr === todayStr}
                isPast={isPast}
                onPress={() => {
                  if (dateStr && td) onDayPress(dateStr);
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
