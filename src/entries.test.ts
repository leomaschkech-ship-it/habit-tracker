import { describe, expect, it } from 'vitest';
import { findEntry, upsertEntry } from './entries';
import type { DailyEntry, Habit } from './types';

const boolHabit: Habit = { id: 'h1', name: 'Pornofrei', type: 'boolean', archived: false };
const numberHabit: Habit = { id: 'h2', name: 'Lesen', type: 'number', target: 10, unit: 'minutes', archived: false };

describe('findEntry', () => {
  it('findet den passenden Eintrag', () => {
    const entries: DailyEntry[] = [{ habitId: 'h1', date: '2026-08-13', done: true }];
    expect(findEntry(entries, 'h1', '2026-08-13')).toEqual(entries[0]);
  });

  it('gibt undefined zurück, wenn nichts passt', () => {
    expect(findEntry([], 'h1', '2026-08-13')).toBeUndefined();
  });
});

describe('upsertEntry', () => {
  it('legt für eine boolean-Habit einen neuen Eintrag mit done an', () => {
    const result = upsertEntry([], boolHabit, '2026-08-13', { done: true });
    expect(result).toEqual([{ habitId: 'h1', date: '2026-08-13', done: true, value: undefined }]);
  });

  it('setzt done bei number-Habit automatisch anhand des Ziels (Ziel erreicht)', () => {
    const result = upsertEntry([], numberHabit, '2026-08-13', { value: 10 });
    expect(result[0]).toMatchObject({ done: true, value: 10 });
  });

  it('setzt done bei number-Habit automatisch anhand des Ziels (Ziel nicht erreicht)', () => {
    const result = upsertEntry([], numberHabit, '2026-08-13', { value: 5 });
    expect(result[0]).toMatchObject({ done: false, value: 5 });
  });

  it('ersetzt einen bestehenden Eintrag statt zu duplizieren', () => {
    const existing: DailyEntry[] = [{ habitId: 'h1', date: '2026-08-13', done: false }];
    const result = upsertEntry(existing, boolHabit, '2026-08-13', { done: true });
    expect(result).toHaveLength(1);
    expect(result[0].done).toBe(true);
  });
});
