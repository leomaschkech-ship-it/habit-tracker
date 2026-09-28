import { weekdayCode } from '../dateUtils';
import { findEntry, type EntryInput } from '../entries';
import { WEEK_PLAN } from '../training/plan';
import type { RunPrescription } from '../training/types';
import type { DailyEntry, Habit } from '../types';
import type { ActivitySport, GarminActivity } from './types';

export type ImportTarget = { kind: 'skip' } | { kind: 'run'; runId: string } | { kind: 'habit'; habitId: string };

export function plannedRunFor(activity: GarminActivity): RunPrescription | undefined {
  if (activity.sport !== 'running') return undefined;
  const dayPlan = WEEK_PLAN.find((day) => day.day === weekdayCode(activity.date));
  return dayPlan?.runs?.[0];
}

export function defaultTarget(
  activity: GarminActivity,
  activeHabits: Habit[],
  sportHabits: Partial<Record<ActivitySport, string>>,
): ImportTarget {
  const run = plannedRunFor(activity);
  if (run) return { kind: 'run', runId: run.id };
  const habitId = sportHabits[activity.sport];
  if (habitId && activeHabits.some((habit) => habit.id === habitId)) return { kind: 'habit', habitId };
  return { kind: 'skip' };
}

// Boolean habits are ticked off, minute habits get the activity's duration
// added, count habits count the activity once.
export function habitEntryFor(habit: Habit, activity: GarminActivity, entries: DailyEntry[]): EntryInput {
  if (habit.type === 'boolean') return { done: true };
  const current = findEntry(entries, habit.id, activity.date)?.value ?? 0;
  const delta = habit.unit === 'count' ? 1 : activity.durationMin;
  return { value: current + delta };
}
