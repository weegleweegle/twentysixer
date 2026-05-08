import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { estimateTime, getWorkoutForDate, WorkoutType } from '../data/trainingPlan';
import { useCompletions } from '../db/CompletionContext';

const TYPE_META: Record<WorkoutType, { label: string; color: string; bg: string; emoji: string }> = {
  easy: { label: 'Easy Run', color: 'text-brand-success', bg: 'bg-brand-success/10', emoji: '🏃' },
  long: { label: 'Long Run', color: 'text-brand-primary', bg: 'bg-brand-primary/10', emoji: '🏔️' },
  race: { label: 'Race Day', color: 'text-yellow-500', bg: 'bg-yellow-500/10', emoji: '🏁' },
  cross: { label: 'Cross Train', color: 'text-blue-500', bg: 'bg-blue-500/10', emoji: '🚴' },
  rest: { label: 'Rest Day', color: 'text-light-muted', bg: 'bg-light-card', emoji: '😴' },
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-light-card rounded-2xl p-4 items-center">
      <Text className="text-light-muted text-xs font-medium tracking-wider uppercase mb-1">{label}</Text>
      <Text className="text-light-text text-xl font-bold">{value}</Text>
    </View>
  );
}

interface Props {
  date: string;
  onClose: () => void;
}

export default function DayDetail({ date, onClose }: Props) {
  const { logs, logWorkout, removeLog } = useCompletions();
  const td = getWorkoutForDate(date);
  const log = logs.get(date);

  const [editing, setEditing] = useState(false);
  const [milesInput, setMilesInput] = useState('');
  const [saving, setSaving] = useState(false);

  if (!td) {
    return (
      <View className="flex-1 bg-light-bg items-center justify-center">
        <Text className="text-light-subtle">No workout data for this day.</Text>
        <Pressable onPress={onClose} className="mt-4">
          <Text className="text-brand-primary">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const { workout, week } = td;
  const meta = TYPE_META[workout.type];
  const estTime = estimateTime(workout.miles, workout.type);
  const isRest = workout.type === 'rest';
  const canLog = !isRest;

  async function handleSave() {
    const miles = parseFloat(milesInput);
    if (isNaN(miles) || miles < 0) return;
    setSaving(true);
    await logWorkout(date, miles);
    setSaving(false);
    setEditing(false);
  }

  function startEdit() {
    setMilesInput(log ? String(log.actual_miles) : String(workout.miles));
    setEditing(true);
  }

  async function handleUndo() {
    await removeLog(date);
    setEditing(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="bg-light-bg"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Drag handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 rounded-full bg-light-border" />
        </View>

        {/* Header */}
        <View className="px-6 pt-5 pb-6">
          <Text className="text-light-muted text-xs font-medium tracking-widest uppercase mb-2">
            Week {week}
          </Text>
          <Text className="text-light-text text-2xl font-bold tracking-tight mb-0.5">
            {formatDate(date)}
          </Text>
        </View>

        {/* Workout type badge */}
        <View className="px-6 mb-6">
          <View className={`self-start flex-row items-center gap-2 px-4 py-2.5 rounded-2xl ${meta.bg}`}>
            <Text className="text-xl">{meta.emoji}</Text>
            <Text className={`font-bold text-base ${meta.color}`}>{meta.label}</Text>
          </View>
        </View>

        {/* Stats */}
        {!isRest && workout.miles > 0 && (
          <View className="px-6 flex-row gap-3 mb-6">
            <StatCard label="Distance" value={`${workout.miles} mi`} />
            {estTime ? <StatCard label="Est. Time" value={estTime} /> : null}
            <StatCard label="Pace" value={workout.type === 'long' || workout.type === 'race' ? '11:00/mi' : '10:30/mi'} />
          </View>
        )}

        {/* Log section */}
        {canLog && (
          <View className="px-6 mb-6">
            {log && !editing ? (
              log.source === 'healthkit' ? (
                /* HealthKit / Apple Watch entry — no Edit or Undo */
                <View className="bg-light-card rounded-2xl p-5 flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-brand-primary/15 items-center justify-center">
                    <Text className="text-base">⌚</Text>
                  </View>
                  <View>
                    <Text className="text-brand-primary text-sm font-bold">Synced from Apple Watch</Text>
                    <Text className="text-light-muted text-xs mt-0.5">{log.actual_miles} mi · auto-synced</Text>
                  </View>
                </View>
              ) : (
                /* Manual entry */
                <View className="bg-light-card rounded-2xl p-5 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-brand-success/20 items-center justify-center">
                      <Text className="text-brand-success text-base font-black">✓</Text>
                    </View>
                    <View>
                      <Text className="text-brand-success text-sm font-bold">Completed</Text>
                      <Text className="text-light-muted text-xs mt-0.5">{log.actual_miles} mi logged</Text>
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <Pressable onPress={startEdit}>
                      <Text className="text-light-subtle text-sm font-medium">Edit</Text>
                    </Pressable>
                    <Pressable onPress={handleUndo}>
                      <Text className="text-red-500 text-sm font-medium">Undo</Text>
                    </Pressable>
                  </View>
                </View>
              )
            ) : editing ? (
              <View className="bg-light-card rounded-2xl p-5">
                <Text className="text-light-muted text-xs font-semibold tracking-widest uppercase mb-3">
                  Log Miles
                </Text>
                <View className="flex-row items-center gap-3 mb-4">
                  <TextInput
                    className="flex-1 bg-light-surface rounded-xl px-4 py-3 text-light-text text-lg font-bold"
                    value={milesInput}
                    onChangeText={setMilesInput}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor="#8E8E93"
                    autoFocus
                    selectTextOnFocus
                  />
                  <Text className="text-light-subtle text-base font-medium">mi</Text>
                </View>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setEditing(false)}
                    className="flex-1 bg-light-surface rounded-xl py-3 items-center"
                  >
                    <Text className="text-light-subtle font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    disabled={saving}
                    className="flex-1 bg-brand-success/20 rounded-xl py-3 items-center"
                    style={({ pressed }) => ({ opacity: pressed || saving ? 0.6 : 1 })}
                  >
                    <Text className="text-brand-success font-bold">
                      {saving ? 'Saving…' : 'Save'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={startEdit}
                className="bg-brand-success/10 rounded-2xl p-5 items-center flex-row justify-center gap-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-brand-success text-lg font-black">+</Text>
                <Text className="text-brand-success font-bold text-sm">Log This Workout</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Notes */}
        <View className="px-6">
          <View className="bg-light-surface rounded-2xl p-5">
            <Text className="text-light-muted text-xs font-semibold tracking-widest uppercase mb-3">
              Notes
            </Text>
            {workout.type === 'easy' && (
              <Text className="text-light-subtle text-sm leading-relaxed">
                Keep this effort conversational — you should be able to speak in full sentences. Focus on easy, controlled breathing and consistent form.
              </Text>
            )}
            {workout.type === 'long' && (
              <Text className="text-light-subtle text-sm leading-relaxed">
                Your weekly long run builds endurance. Run at a slow, comfortable pace — 60–90 seconds per mile slower than goal pace. Fuel every 45–60 min on runs over 10 miles.
              </Text>
            )}
            {workout.type === 'race' && (
              <Text className="text-light-subtle text-sm leading-relaxed">
                Big Sur International Marathon 🎉{'\n\n'}One of the most scenic and challenging marathon courses in the world. The course runs along CA-1 on the rugged Big Sur coast. Expect significant elevation gain — save energy in the first half.
              </Text>
            )}
            {workout.type === 'rest' && (
              <Text className="text-light-subtle text-sm leading-relaxed">
                Rest days are where the gains happen. Let your body recover and adapt. Light walking or gentle stretching is fine. Stay hydrated.
              </Text>
            )}
            {workout.type === 'cross' && (
              <Text className="text-light-subtle text-sm leading-relaxed">
                Cross-training day — cycling, swimming, yoga, or any low-impact aerobic activity that gives your running muscles a break while maintaining fitness.
              </Text>
            )}
          </View>
        </View>

        {/* Close button */}
        <Pressable
          onPress={onClose}
          className="mx-6 mt-6 bg-light-card rounded-2xl py-4 items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text className="text-light-subtle font-semibold">Close</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
