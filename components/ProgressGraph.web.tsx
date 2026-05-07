import { useEffect, useRef, useState } from 'react';
import { trainingPlan } from '../data/trainingPlan';
import type { WorkoutLog } from '../db/CompletionContext';

interface Props {
  logs: Map<string, WorkoutLog>;
}

export default function ProgressGraph({ logs }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const measure = () =>
      setSize({ width: Math.floor(el.clientWidth), height: Math.floor(el.clientHeight) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const runningDays = [...trainingPlan.values()]
    .filter(d => d.workout.miles > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const total = runningDays.length;
  if (total < 2) return null;

  const { width, height } = size;
  const maxMiles = 27;
  const pad = 3;
  const iw = width - pad * 2;
  const ih = height - pad * 2;

  // collect logged entries in chronological plan order
  const loggedEntries = runningDays
    .map(d => {
      const log = logs.get(d.date);
      return log ? { miles: log.actual_miles, key: d.date } : null;
    })
    .filter((p): p is { miles: number; key: string } => p !== null);

  const py = (miles: number) => pad + ih - Math.min(miles / maxMiles, 1) * ih;

  // position each logged run at its proportional place in the full plan
  const loggedPts = loggedEntries.map(e => ({
    x: pad + (runningDays.findIndex(d => d.date === e.key) / (total - 1)) * iw,
    y: py(e.miles),
    key: e.key,
  }));

  const toD = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div ref={divRef} style={{ flex: 1, alignSelf: 'stretch', position: 'relative' }}>
      {width > 0 && height > 0 && (
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          {loggedPts.length > 1 && (
            <path
              d={toD(loggedPts)}
              fill="none"
              stroke="#FF6B35"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {loggedPts.map(p => (
            <circle key={p.key} cx={p.x} cy={p.y} r={2.5} fill="#FF6B35" />
          ))}
        </svg>
      )}
    </div>
  );
}
