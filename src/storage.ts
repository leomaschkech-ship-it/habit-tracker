import type { DailyEntry, Habit } from './types';

const HABITS_KEY = 'habit-tracker:habits';
const ENTRIES_KEY = 'habit-tracker:entries';
const STOPWATCHES_KEY = 'habit-tracker:stopwatches';

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((habit: Habit) =>
      habit.type === 'number' && habit.unit !== 'count' && habit.unit !== 'minutes'
        ? { ...habit, unit: 'minutes' as const }
        : habit,
    );
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch {
    // localStorage nicht beschreibbar (z.B. voll oder deaktiviert) - bewusst ignoriert
  }
}

export function loadEntries(): DailyEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: DailyEntry[]): void {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch {
    // siehe saveHabits
  }
}

export function loadStopwatches(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STOPWATCHES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function saveStopwatches(stopwatches: Record<string, number>): void {
  try {
    localStorage.setItem(STOPWATCHES_KEY, JSON.stringify(stopwatches));
  } catch {
    // siehe saveHabits
  }
}
