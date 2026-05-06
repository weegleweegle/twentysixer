import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MonthCalendar from '../components/MonthCalendar';
import DayDetail from '../components/DayDetail';
import {
  getPlanBounds,
  RACE_DATE,
  getWeeklyMileage,
  getCurrentWeekNum,
  getTotalPlannedMiles,
  getWeekDates,
} from '../data/trainingPlan';
import { useCompletions } from '../db/CompletionContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function daysUntil(target: string): number {
  const now = new Date(getToday() + 'T00:00:00');
  const race = new Date(target + 'T00:00:00');
  return Math.round((race.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function monthsBetween(startStr: string, endStr: string): { year: number; month: number }[] {
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  const results = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    results.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur.setMonth(cur.getMonth() + 1);
  }
  return results;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const today = getToday();
  const { end } = getPlanBounds();
  const countdown = daysUntil(RACE_DATE);

  const todayDate = new Date(today + 'T00:00:00');
  const viewStart = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-01`;
  const months = useMemo(() => monthsBetween(viewStart, end), [viewStart, end]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { logs } = useCompletions();

  const weekNum = getCurrentWeekNum(today);
  const weekDates = weekNum ? getWeekDates(weekNum) : [];
  const weekPlanned = weekNum ? getWeeklyMileage(weekNum) : 0;
  const weekActual = weekDates.reduce((sum, d) => sum + (logs.get(d)?.actual_miles ?? 0), 0);
  const totalPlanned = getTotalPlannedMiles();
  const totalActual = [...logs.values()].reduce((sum, l) => sum + l.actual_miles, 0);

  function handleDayPress(dateStr: string) {
    if (isWide) {
      setSelectedDate(dateStr);
    } else {
      router.push(`/day/${dateStr}`);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View style={{ flex: 1, flexDirection: isWide ? 'row' : 'column' }}>

        {/* Calendar column — tap background to close panel */}
        <Pressable
          style={{ flex: 1 }}
          onPress={() => isWide && setSelectedDate(null)}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Header */}
            <View className="px-4 pt-6 pb-4">
              <Text className="text-light-muted text-xs font-semibold tracking-widest uppercase mb-1">
                Big Sur Marathon
              </Text>
              <Text className="text-light-text text-3xl font-bold tracking-tight">
                Training Plan
              </Text>

              {/* Countdown */}
              <View className="flex-row items-baseline mt-3 gap-2">
                <Text className="text-brand-primary text-5xl font-black tracking-tighter">
                  {countdown}
                </Text>
                <Text className="text-light-subtle text-base font-medium">
                  days to go
                </Text>
              </View>
              <Text className="text-light-muted text-xs mt-1">
                April 25, 2027 · Hal Higdon Novice 1 (50 weeks)
              </Text>

              {/* Weekly + Overall progress */}
              <View className="flex-row gap-3 mt-4">
                <View className="flex-1 bg-light-card rounded-xl p-3">
                  <Text className="text-light-muted text-[10px] font-semibold tracking-widest uppercase mb-1">
                    This Week
                  </Text>
                  <Text className="text-light-text text-sm font-bold">
                    {weekActual.toFixed(1)}{' '}
                    <Text className="text-light-muted font-normal">/ {weekPlanned} mi</Text>
                  </Text>
                </View>
                <View className="flex-1 bg-light-card rounded-xl p-3">
                  <Text className="text-light-muted text-[10px] font-semibold tracking-widest uppercase mb-1">
                    Total
                  </Text>
                  <Text className="text-light-text text-sm font-bold">
                    {totalActual.toFixed(1)}{' '}
                    <Text className="text-light-muted font-normal">/ {totalPlanned} mi</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Legend */}
            <View className="flex-row px-4 mb-4 gap-4">
              {[
                { color: 'bg-brand-success', label: 'Easy' },
                { color: 'bg-brand-primary', label: 'Long' },
                { color: 'bg-yellow-500', label: 'Race' },
              ].map(({ color, label }) => (
                <View key={label} className="flex-row items-center gap-1.5">
                  <View className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <Text className="text-light-subtle text-xs">{label}</Text>
                </View>
              ))}
            </View>

            {/* Month navigation */}
            <View className="flex-row items-center justify-between px-4 mb-2">
              <Pressable
                onPress={() => setCurrentIdx(i => i - 1)}
                disabled={currentIdx === 0}
                style={{ opacity: currentIdx === 0 ? 0.3 : 1 }}
                hitSlop={12}
              >
                <Text className="text-brand-primary text-2xl font-bold px-2">‹</Text>
              </Pressable>
              <Text className="text-light-text font-bold text-base">
                {MONTH_NAMES[months[currentIdx].month]} {months[currentIdx].year}
              </Text>
              <Pressable
                onPress={() => setCurrentIdx(i => i + 1)}
                disabled={currentIdx === months.length - 1}
                style={{ opacity: currentIdx === months.length - 1 ? 0.3 : 1 }}
                hitSlop={12}
              >
                <Text className="text-brand-primary text-2xl font-bold px-2">›</Text>
              </Pressable>
            </View>

            {/* Calendar — single month */}
            <MonthCalendar
              key={`${months[currentIdx].year}-${months[currentIdx].month}`}
              year={months[currentIdx].year}
              month={months[currentIdx].month}
              todayStr={today}
              onDayPress={handleDayPress}
            />
          </ScrollView>
        </Pressable>

        {/* Desktop side panel */}
        {isWide && selectedDate && (
          <View
            style={{
              width: 380,
              borderLeftWidth: 1,
              borderLeftColor: '#C6C6C8',
              backgroundColor: '#FFFFFF',
            }}
          >
            <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
