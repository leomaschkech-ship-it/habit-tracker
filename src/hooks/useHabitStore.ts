import { useEffect, useMemo, useState } from 'react';
import { type CreateHabitInput, archiveHabit, createHabit, updateHabit } from '../habits';
import { type EntryInput, findEntry, upsertEntry } from '../entries';
import { elapsedMinutes } from '../stopwatch';
import { todayISO, toISODate } from '../dateUtils';
import {
  loadEntries,
  loadHabits,
  loadStopwatches,
  saveEntries,
  saveHabits,
  saveStopwatches,
} from '../storage';
import type { DailyEntry, Habit } from '../types';

export function useHabitStore() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [entries, setEntries] = useState<DailyEntry[]>(() => loadEntries());
  const [stopwatches, setStopwatches] = useState<Record<string, number>>(() => {
    const loaded = loadStopwatches();
    const today = todayISO();
    const current: Record<string, number> = {};
    for (const [habitId, startedAt] of Object.entries(loaded)) {
      if (toISODate(new Date(startedAt)) === today) {
        current[habitId] = startedAt;
      }
    }
    return current;
  });

  useEffect(() => saveHabits(habits), [habits]);
  useEffect(() => saveEntries(entries), [entries]);
  useEffect(() => saveStopwatches(stopwatches), [stopwatches]);

  const activeHabits = useMemo(() => habits.filter((habit) => !habit.archived), [habits]);

  function addHabit(input: CreateHabitInput) {
    setHabits((prev) => [...prev, createHabit(input)]);
  }

  function removeHabit(habitId: string) {
    setHabits((prev) => archiveHabit(prev, habitId));
    setStopwatches((prev) => {
      if (!(habitId in prev)) return prev;
      const next = { ...prev };
      delete next[habitId];
      return next;
    });
  }

  function editHabit(habitId: string, patch: Parameters<typeof updateHabit>[2]) {
    setHabits((prev) => updateHabit(prev, habitId, patch));
  }

  function setEntry(habit: Habit, date: string, input: EntryInput) {
    setEntries((prev) => upsertEntry(prev, habit, date, input));
  }

  // For callers whose input depends on the latest entries (e.g. adding to a
  // value when several updates are applied in one batch).
  function updateEntry(habit: Habit, date: string, computeInput: (entries: DailyEntry[]) => EntryInput) {
    setEntries((prev) => upsertEntry(prev, habit, date, computeInput(prev)));
  }

  function incrementCount(habit: Habit, date: string) {
    setEntries((prev) => {
      const currentValue = findEntry(prev, habit.id, date)?.value ?? 0;
      return upsertEntry(prev, habit, date, { value: currentValue + 1 });
    });
  }

  function startStopwatch(habitId: string) {
    setStopwatches((prev) => ({ ...prev, [habitId]: Date.now() }));
  }

  function stopStopwatch(habit: Habit, date: string) {
    const startedAt = stopwatches[habit.id];
    if (startedAt === undefined) return;
    const minutes = elapsedMinutes(startedAt, Date.now());
    if (minutes > 0) {
      setEntries((prev) => {
        const currentValue = findEntry(prev, habit.id, date)?.value ?? 0;
        return upsertEntry(prev, habit, date, { value: currentValue + minutes });
      });
    }
    setStopwatches((prev) => {
      const next = { ...prev };
      delete next[habit.id];
      return next;
    });
  }

  return {
    habits,
    activeHabits,
    entries,
    stopwatches,
    addHabit,
    removeHabit,
    editHabit,
    setEntry,
    updateEntry,
    incrementCount,
    startStopwatch,
    stopStopwatch,
  };
}

export type HabitStore = ReturnType<typeof useHabitStore>;
