import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadEntries, loadHabits, loadStopwatches, saveEntries, saveHabits, saveStopwatches } from './storage';
import type { DailyEntry, Habit } from './types';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

describe('storage', () => {
  it('loadHabits gibt leeres Array zurück, wenn nichts gespeichert ist', () => {
    expect(loadHabits()).toEqual([]);
  });

  it('speichert und lädt Habits unverändert', () => {
    const habits: Habit[] = [{ id: '1', name: 'Lesen', type: 'boolean', archived: false }];
    saveHabits(habits);
    expect(loadHabits()).toEqual(habits);
  });

  it('loadHabits gibt leeres Array zurück bei kaputtem JSON', () => {
    localStorage.setItem('habit-tracker:habits', '{not valid json');
    expect(loadHabits()).toEqual([]);
  });

  it('loadEntries gibt leeres Array zurück, wenn nichts gespeichert ist', () => {
    expect(loadEntries()).toEqual([]);
  });

  it('speichert und lädt Entries unverändert', () => {
    const entries: DailyEntry[] = [{ habitId: '1', date: '2026-08-13', done: true }];
    saveEntries(entries);
    expect(loadEntries()).toEqual(entries);
  });
});

describe('loadHabits Migration', () => {
  it('migriert alten Freitext-Unit zu "minutes"', () => {
    const raw = [{ id: '1', name: 'Lesen', type: 'number', target: 10, unit: 'min', archived: false }];
    localStorage.setItem('habit-tracker:habits', JSON.stringify(raw));
    const habits = loadHabits();
    expect(habits[0].unit).toBe('minutes');
  });

  it('migriert fehlenden Unit bei Zahl-Routinen zu "minutes"', () => {
    const raw = [{ id: '1', name: 'Lesen', type: 'number', target: 10, archived: false }];
    localStorage.setItem('habit-tracker:habits', JSON.stringify(raw));
    const habits = loadHabits();
    expect(habits[0].unit).toBe('minutes');
  });

  it('lässt bereits gültigen Unit unverändert', () => {
    const raw = [
      { id: '1', name: 'Liegestütze', type: 'number', target: 20, unit: 'count', archived: false },
    ];
    localStorage.setItem('habit-tracker:habits', JSON.stringify(raw));
    const habits = loadHabits();
    expect(habits[0].unit).toBe('count');
  });

  it('lässt boolean-Routinen unverändert (kein unit-Feld nötig)', () => {
    const raw = [{ id: '1', name: 'Pornofrei', type: 'boolean', archived: false }];
    localStorage.setItem('habit-tracker:habits', JSON.stringify(raw));
    const habits = loadHabits();
    expect(habits[0].unit).toBeUndefined();
  });
});

describe('stopwatches', () => {
  it('loadStopwatches gibt leeres Objekt zurück, wenn nichts gespeichert ist', () => {
    expect(loadStopwatches()).toEqual({});
  });

  it('speichert und lädt Stoppuhr-Zustände unverändert', () => {
    const stopwatches = { 'habit-1': 1723600000000 };
    saveStopwatches(stopwatches);
    expect(loadStopwatches()).toEqual(stopwatches);
  });

  it('loadStopwatches gibt leeres Objekt zurück bei kaputtem JSON', () => {
    localStorage.setItem('habit-tracker:stopwatches', '{not valid json');
    expect(loadStopwatches()).toEqual({});
  });

  it('loadStopwatches gibt leeres Objekt zurück, wenn gespeicherter Wert kein Objekt ist', () => {
    localStorage.setItem('habit-tracker:stopwatches', JSON.stringify([1, 2, 3]));
    expect(loadStopwatches()).toEqual({});
  });

  it('loadStopwatches filtert Werte heraus, die keine gültige Zahl sind', () => {
    localStorage.setItem('habit-tracker:stopwatches', JSON.stringify({ h1: 'abc', h2: 123 }));
    expect(loadStopwatches()).toEqual({ h2: 123 });
  });
});
