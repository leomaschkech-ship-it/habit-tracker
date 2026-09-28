import { describe, expect, it } from 'vitest';
import type { DailyEntry, Habit } from '../types';
import { defaultTarget, habitEntryFor } from './importPlan';
import type { GarminActivity } from './types';

function activity(overrides: Partial<GarminActivity> = {}): GarminActivity {
  return {
    id: '1',
    sport: 'running',
    startMs: 0,
    date: '2026-09-28', // Monday
    durationMin: 55,
    ...overrides,
  };
}

const booleanHabit: Habit = { id: 'h-bool', name: 'Sport', type: 'boolean', archived: false };
const minutesHabit: Habit = { id: 'h-min', name: 'Bewegung', type: 'number', unit: 'minutes', target: 30, archived: false };
const countHabit: Habit = { id: 'h-count', name: 'Einheiten', type: 'number', unit: 'count', target: 1, archived: false };

describe('defaultTarget', () => {
  it('matches a run to the planned run of that weekday', () => {
    expect(defaultTarget(activity(), [], {})).toEqual({ kind: 'run', runId: 'mo-run-easy' });
  });

  it('uses the remembered habit when no run is planned that day', () => {
    const sunday = activity({ date: '2026-09-27' });
    expect(defaultTarget(sunday, [booleanHabit], { running: 'h-bool' })).toEqual({ kind: 'habit', habitId: 'h-bool' });
  });

  it('ignores a remembered habit that is no longer active', () => {
    const ride = activity({ sport: 'cycling' });
    expect(defaultTarget(ride, [], { cycling: 'h-bool' })).toEqual({ kind: 'skip' });
  });
});

describe('habitEntryFor', () => {
  const entries: DailyEntry[] = [{ habitId: 'h-min', date: '2026-09-28', done: false, value: 10 }];

  it('ticks off boolean habits', () => {
    expect(habitEntryFor(booleanHabit, activity(), entries)).toEqual({ done: true });
  });

  it('adds the duration to minute habits', () => {
    expect(habitEntryFor(minutesHabit, activity(), entries)).toEqual({ value: 65 });
  });

  it('counts the activity once for count habits', () => {
    expect(habitEntryFor(countHabit, activity(), entries)).toEqual({ value: 1 });
  });
});
