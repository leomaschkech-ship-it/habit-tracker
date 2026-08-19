import { describe, expect, it } from 'vitest';
import { archiveHabit, createHabit, updateHabit } from './habits';
import type { Habit } from './types';

describe('createHabit', () => {
  it('erzeugt eine unarchivierte Habit mit generierter id', () => {
    const habit = createHabit({ name: 'Lesen', type: 'boolean' });
    expect(habit.id).toBeTruthy();
    expect(habit.name).toBe('Lesen');
    expect(habit.type).toBe('boolean');
    expect(habit.archived).toBe(false);
  });

  it('übernimmt target/unit nur bei type "number"', () => {
    const boolHabit = createHabit({ name: 'Pornofrei', type: 'boolean', target: 10, unit: 'minutes' });
    expect(boolHabit.target).toBeUndefined();
    expect(boolHabit.unit).toBeUndefined();

    const numberHabit = createHabit({ name: 'Lesen', type: 'number', target: 10, unit: 'minutes' });
    expect(numberHabit.target).toBe(10);
    expect(numberHabit.unit).toBe('minutes');
  });
});

describe('archiveHabit', () => {
  it('setzt archived nur bei der passenden id', () => {
    const habits: Habit[] = [
      { id: '1', name: 'Lesen', type: 'boolean', archived: false },
      { id: '2', name: 'Sport', type: 'boolean', archived: false },
    ];
    const result = archiveHabit(habits, '1');
    expect(result.find((h) => h.id === '1')?.archived).toBe(true);
    expect(result.find((h) => h.id === '2')?.archived).toBe(false);
  });
});

describe('updateHabit', () => {
  it('patcht nur die passende Habit', () => {
    const habits: Habit[] = [
      { id: '1', name: 'Lesen', type: 'number', target: 10, unit: 'minutes', archived: false },
      { id: '2', name: 'Sport', type: 'boolean', archived: false },
    ];
    const result = updateHabit(habits, '1', { name: 'Viel Lesen', target: 20 });
    expect(result.find((h) => h.id === '1')).toMatchObject({ name: 'Viel Lesen', target: 20, unit: 'minutes' });
    expect(result.find((h) => h.id === '2')?.name).toBe('Sport');
  });
});
