import type { DailyEntry, Habit } from './types';

export function findEntry(entries: DailyEntry[], habitId: string, date: string): DailyEntry | undefined {
  return entries.find((entry) => entry.habitId === habitId && entry.date === date);
}

export interface EntryInput {
  done?: boolean;
  value?: number;
}

export function upsertEntry(
  entries: DailyEntry[],
  habit: Habit,
  date: string,
  input: EntryInput,
): DailyEntry[] {
  const done =
    habit.type === 'number' ? (input.value ?? 0) >= (habit.target ?? 0) : Boolean(input.done);

  const newEntry: DailyEntry = {
    habitId: habit.id,
    date,
    done,
    value: habit.type === 'number' ? input.value : undefined,
  };

  const existingIndex = entries.findIndex((entry) => entry.habitId === habit.id && entry.date === date);
  if (existingIndex === -1) {
    return [...entries, newEntry];
  }
  const next = [...entries];
  next[existingIndex] = newEntry;
  return next;
}
