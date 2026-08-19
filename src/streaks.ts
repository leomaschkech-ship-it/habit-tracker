import { addDays } from './dateUtils';
import type { DailyEntry } from './types';

function isDoneOn(entries: DailyEntry[], habitId: string, date: string): boolean {
  return entries.some((entry) => entry.habitId === habitId && entry.date === date && entry.done);
}

export function calculateCurrentStreak(entries: DailyEntry[], habitId: string, todayIso: string): number {
  let cursor = isDoneOn(entries, habitId, todayIso) ? todayIso : addDays(todayIso, -1);
  let streak = 0;
  while (isDoneOn(entries, habitId, cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function calculateLongestStreak(entries: DailyEntry[], habitId: string): number {
  const doneDates = entries
    .filter((entry) => entry.habitId === habitId && entry.done)
    .map((entry) => entry.date)
    .sort();

  let longest = 0;
  let current = 0;
  let previousDate: string | null = null;

  for (const date of doneDates) {
    current = previousDate !== null && addDays(previousDate, 1) === date ? current + 1 : 1;
    longest = Math.max(longest, current);
    previousDate = date;
  }

  return longest;
}
