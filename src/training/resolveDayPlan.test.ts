import { describe, expect, it } from 'vitest';
import { resolveDayPlan } from './resolveDayPlan';
import type { DayPlan } from './types';

const dayPlan: DayPlan = {
  day: 'Di',
  exercises: [
    {
      id: 'ex-1',
      name: 'Klimmzüge',
      equipment: 'pullupbar',
      substitute: { name: 'Rudern am Türrahmen', setsReps: '4×12–15' },
      setsRepsByWeek: () => ({ sets: 4, reps: '10–12', restSec: 90 }),
    },
    {
      id: 'ex-2',
      name: 'Liegestütze',
      setsRepsByWeek: () => ({ sets: 4, reps: '8–12', restSec: 60 }),
    },
    {
      id: 'ex-3',
      name: 'Kettlebell-Swing',
      equipment: 'kettlebell',
      substitute: { name: 'Rucksack-Swing', setsReps: '3×15' },
      setsRepsByWeek: () => ({ sets: 3, reps: '15', restSec: 60 }),
    },
    {
      id: 'ex-4',
      name: 'Superset',
      setsRepsByWeek: () => ({ sets: 4, reps: 'Satz A: 8–10 Dips, Satz B: 15–20 Plank-Taps', restSec: 120 }),
    },
    {
      id: 'ex-5',
      name: 'Dips',
      equipment: (week: number) => (week <= 2 ? undefined : 'kettlebell'),
      substitute: { name: 'Dips ohne Gewicht', setsReps: '3×8–12' },
      setsRepsByWeek: (week: number) =>
        week <= 2
          ? { sets: 3, reps: '8–12 (ohne Gewicht)', restSec: 60 }
          : { sets: 3, reps: '6–8 (gewichtet)', restSec: 60 },
    },
  ],
};

const deloadDayPlan: DayPlan = {
  day: 'Do',
  exercises: [
    {
      id: 'deload-ex',
      name: 'Goblet Squats',
      setsRepsByWeek: () => ({ sets: 4, reps: '6–10', restSec: 90 }),
    },
  ],
};

describe('resolveDayPlan', () => {
  it('zeigt die Standard-Übung, wenn keine Equipment-Antwort vorliegt', () => {
    const result = resolveDayPlan(dayPlan, 1, undefined);
    expect(result[0]).toEqual({
      id: 'ex-1',
      name: 'Klimmzüge',
      setsReps: '4×10–12',
      restSec: 90,
      substituted: false,
      adjustmentApplied: false,
      equipment: 'pullupbar',
    });
  });

  it('zeigt die Standard-Übung, wenn das Equipment vorhanden ist', () => {
    const result = resolveDayPlan(dayPlan, 1, { date: '2026-09-07', pullupBar: true, kettlebell: true });
    expect(result[0].substituted).toBe(false);
  });

  it('ersetzt die Übung durch die Ersatzübung, wenn das Equipment fehlt', () => {
    const result = resolveDayPlan(dayPlan, 1, { date: '2026-09-07', pullupBar: false, kettlebell: true });
    expect(result[0]).toEqual({
      id: 'ex-1',
      name: 'Rudern am Türrahmen',
      setsReps: '4×12–15',
      restSec: 90,
      substituted: true,
      adjustmentApplied: false,
      equipment: 'pullupbar',
    });
  });

  it('lässt Übungen ohne Equipment-Anforderung unverändert, egal was beantwortet wurde', () => {
    const result = resolveDayPlan(dayPlan, 1, { date: '2026-09-07', pullupBar: false, kettlebell: false });
    expect(result[1]).toEqual({
      id: 'ex-2',
      name: 'Liegestütze',
      setsReps: '4×8–12',
      restSec: 60,
      substituted: false,
      adjustmentApplied: false,
      equipment: undefined,
    });
  });

  it('ersetzt eine kettlebell-getaggte Übung, wenn kein Kettlebell vorhanden ist (answer.kettlebell-Zweig)', () => {
    const result = resolveDayPlan(dayPlan, 1, { date: '2026-09-07', pullupBar: true, kettlebell: false });
    expect(result[2]).toEqual({
      id: 'ex-3',
      name: 'Rucksack-Swing',
      setsReps: '3×15',
      restSec: 60,
      substituted: true,
      adjustmentApplied: false,
      equipment: 'kettlebell',
    });
  });

  it('behält eine kettlebell-getaggte Übung, wenn der Kettlebell vorhanden ist', () => {
    const result = resolveDayPlan(dayPlan, 1, { date: '2026-09-07', pullupBar: true, kettlebell: true });
    expect(result[2]).toEqual({
      id: 'ex-3',
      name: 'Kettlebell-Swing',
      setsReps: '3×15',
      restSec: 60,
      substituted: false,
      adjustmentApplied: false,
      equipment: 'kettlebell',
    });
  });

  it('wendet einen Reps-Override auf eine Range-Übung an', () => {
    const result = resolveDayPlan(dayPlan, 1, undefined, [
      { exerciseId: 'ex-2', repsDelta: 2, note: '2 Wiederholungen mehr' },
    ]);
    expect(result[1]).toEqual({
      id: 'ex-2',
      name: 'Liegestütze',
      setsReps: '4×10–14',
      restSec: 60,
      substituted: false,
      adjustmentApplied: true,
      equipment: undefined,
    });
  });

  it('lässt einen Reps-Override auf zusammengesetztem Text unverändert, markiert aber keine Anwendung', () => {
    const result = resolveDayPlan(dayPlan, 1, undefined, [
      { exerciseId: 'ex-4', repsDelta: 2, note: '2 Wiederholungen mehr' },
    ]);
    expect(result[3]).toEqual({
      id: 'ex-4',
      name: 'Superset',
      setsReps: '4×Satz A: 8–10 Dips, Satz B: 15–20 Plank-Taps',
      restSec: 120,
      substituted: false,
      adjustmentApplied: false,
      equipment: undefined,
    });
  });

  it('braucht bei einer wochenabhängigen Equipment-Funktion in einer Woche ohne Anforderung kein Equipment', () => {
    const result = resolveDayPlan(dayPlan, 1, { date: '2026-09-07', pullupBar: false, kettlebell: false });
    const dips = result.find((exercise) => exercise.id === 'ex-5')!;
    expect(dips.equipment).toBeUndefined();
    expect(dips.substituted).toBe(false);
    expect(dips.setsReps).toBe('3×8–12 (ohne Gewicht)');
  });

  it('braucht bei einer wochenabhängigen Equipment-Funktion in einer Woche mit Anforderung die Kettlebell und ersetzt korrekt', () => {
    const result = resolveDayPlan(dayPlan, 3, { date: '2026-09-07', pullupBar: false, kettlebell: false });
    const dips = result.find((exercise) => exercise.id === 'ex-5')!;
    expect(dips.equipment).toBe('kettlebell');
    expect(dips.substituted).toBe(true);
    expect(dips.name).toBe('Dips ohne Gewicht');
  });

  it('reduziert in der Deload-Woche (7) die Sets einer Kraftübung um die Hälfte', () => {
    const result = resolveDayPlan(deloadDayPlan, 7, undefined);
    expect(result[0].setsReps.startsWith('2×')).toBe(true);
  });

  it('lässt die Sets in Woche 6 und 8 unverändert (kein Deload)', () => {
    const week6 = resolveDayPlan(deloadDayPlan, 6, undefined);
    const week8 = resolveDayPlan(deloadDayPlan, 8, undefined);
    expect(week6[0].setsReps.startsWith('4×')).toBe(true);
    expect(week8[0].setsReps.startsWith('4×')).toBe(true);
  });
});
