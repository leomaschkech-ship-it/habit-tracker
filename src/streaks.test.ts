import { describe, expect, it } from 'vitest';
import { calculateCurrentStreak, calculateLongestStreak } from './streaks';
import type { DailyEntry } from './types';

function entry(date: string, done: boolean): DailyEntry {
  return { habitId: 'h1', date, done };
}

describe('calculateCurrentStreak', () => {
  it('gibt 0 zurück, wenn keine Einträge existieren', () => {
    expect(calculateCurrentStreak([], 'h1', '2026-08-13')).toBe(0);
  });

  it('zählt aufeinanderfolgende erledigte Tage bis heute', () => {
    const entries = [entry('2026-08-11', true), entry('2026-08-12', true), entry('2026-08-13', true)];
    expect(calculateCurrentStreak(entries, 'h1', '2026-08-13')).toBe(3);
  });

  it('zählt ab gestern, wenn heute noch kein Eintrag existiert', () => {
    const entries = [entry('2026-08-11', true), entry('2026-08-12', true)];
    expect(calculateCurrentStreak(entries, 'h1', '2026-08-13')).toBe(2);
  });

  it('bricht die Serie bei einer Lücke ab', () => {
    const entries = [entry('2026-08-09', true), entry('2026-08-11', true), entry('2026-08-12', true)];
    expect(calculateCurrentStreak(entries, 'h1', '2026-08-13')).toBe(2);
  });

  it('gibt 0 zurück, wenn heute und gestern nicht erledigt sind', () => {
    const entries = [entry('2026-08-13', false), entry('2026-08-12', false)];
    expect(calculateCurrentStreak(entries, 'h1', '2026-08-13')).toBe(0);
  });
});

describe('calculateLongestStreak', () => {
  it('gibt 0 zurück, wenn keine Einträge existieren', () => {
    expect(calculateLongestStreak([], 'h1')).toBe(0);
  });

  it('findet die längste Serie auch bei mehreren getrennten Serien', () => {
    const entries = [
      entry('2026-08-01', true),
      entry('2026-08-02', true),
      entry('2026-08-05', true),
      entry('2026-08-06', true),
      entry('2026-08-07', true),
      entry('2026-08-08', true),
      entry('2026-08-09', true),
    ];
    expect(calculateLongestStreak(entries, 'h1')).toBe(5);
  });

  it('funktioniert unabhängig von der Reihenfolge der Einträge', () => {
    const entries = [entry('2026-08-03', true), entry('2026-08-01', true), entry('2026-08-02', true)];
    expect(calculateLongestStreak(entries, 'h1')).toBe(3);
  });

  it('ignoriert Einträge anderer Habits', () => {
    const entries: DailyEntry[] = [
      entry('2026-08-01', true),
      { habitId: 'h2', date: '2026-08-02', done: true },
    ];
    expect(calculateLongestStreak(entries, 'h1')).toBe(1);
  });
});
