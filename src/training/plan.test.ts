import { describe, expect, it } from 'vitest';
import { WEEK_PLAN } from './plan';

describe('WEEK_PLAN', () => {
  it('enthält alle 7 Wochentage in der Reihenfolge Mo-So', () => {
    expect(WEEK_PLAN.map((day) => day.day)).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
  });

  it('Sonntag ist ein Ruhetag ohne Läufe oder Übungen', () => {
    const sunday = WEEK_PLAN.find((day) => day.day === 'So')!;
    expect(sunday.runs ?? []).toHaveLength(0);
    expect(sunday.exercises ?? []).toHaveLength(0);
  });

  it('Klimmzüge (Dienstag) nutzen in Woche 1 den normalen Griff und in Woche 5 den Neutral-Griff', () => {
    const tuesday = WEEK_PLAN.find((day) => day.day === 'Di')!;
    const pullups = tuesday.exercises!.find((exercise) => exercise.id === 'tue-pullups')!;
    expect(pullups.setsRepsByWeek(1).reps).toContain('Normaler Griff');
    expect(pullups.setsRepsByWeek(5).reps).toContain('Neutral-Griff');
  });

  it('Montags-Lauf steigt von 10km in Woche 1 auf 12km in Woche 5', () => {
    const monday = WEEK_PLAN.find((day) => day.day === 'Mo')!;
    const run = monday.runs!.find((r) => r.id === 'mo-run-easy')!;
    expect(run.detailByWeek(1)).toBe('10 km');
    expect(run.detailByWeek(5)).toBe('12 km');
  });

  it('Intervall-Läufe (Mittwoch) bleiben ab Woche 9 bei 6x5 min (letzte definierte Stufe)', () => {
    const wednesday = WEEK_PLAN.find((day) => day.day === 'Mi')!;
    const run = wednesday.runs!.find((r) => r.id === 'wed-run-intervals')!;
    expect(run.detailByWeek(9)).toBe('6×5 min');
    expect(run.detailByWeek(12)).toBe('6×5 min');
  });

  it('Gewichtete Klimmzüge (Samstag) verlieren ab Woche 9 den Bodyweight-Satz', () => {
    const saturday = WEEK_PLAN.find((day) => day.day === 'Sa')!;
    const weighted = saturday.exercises!.find((exercise) => exercise.id === 'sat-weighted-pullups')!;
    expect(weighted.setsRepsByWeek(9).reps).toContain('Nur gewichtet');
  });

  it('Dips (Dienstag) sind ab Woche 3 gewichtet', () => {
    const tuesday = WEEK_PLAN.find((day) => day.day === 'Di')!;
    const dips = tuesday.exercises!.find((exercise) => exercise.id === 'tue-dips')!;
    expect(dips.setsRepsByWeek(1).reps).toContain('ohne Gewicht');
    expect(dips.setsRepsByWeek(3).reps).toContain('gewichtet');
  });

  it('Dips (Dienstag) brauchen erst ab Woche 3 eine Kettlebell', () => {
    const tuesday = WEEK_PLAN.find((day) => day.day === 'Di')!;
    const dips = tuesday.exercises!.find((exercise) => exercise.id === 'tue-dips')!;
    expect(typeof dips.equipment).toBe('function');
    const equipmentFn = dips.equipment as (week: number) => string | undefined;
    expect(equipmentFn(1)).toBeUndefined();
    expect(equipmentFn(2)).toBeUndefined();
    expect(equipmentFn(3)).toBe('kettlebell');
  });

  it('Intervall-Läufe (Mittwoch) und Tempo-Läufe (Freitag) tragen Warm-up/Cool-down, der Montagslauf nicht', () => {
    const wednesday = WEEK_PLAN.find((day) => day.day === 'Mi')!;
    const wedRun = wednesday.runs!.find((r) => r.id === 'wed-run-intervals')!;
    expect(wedRun.warmup).toBe('10 min leicht trotten');
    expect(wedRun.coolDown).toBe('5 min auslaufen');

    const friday = WEEK_PLAN.find((day) => day.day === 'Fr')!;
    const friRun = friday.runs!.find((r) => r.id === 'fri-run-tempo')!;
    expect(friRun.warmup).toBe('10 min Easy');
    expect(friRun.coolDown).toBe('5–10 min Easy');

    const monday = WEEK_PLAN.find((day) => day.day === 'Mo')!;
    const moRun = monday.runs!.find((r) => r.id === 'mo-run-easy')!;
    expect(moRun.warmup).toBeUndefined();
    expect(moRun.coolDown).toBeUndefined();
  });

  it('Dienstag/Donnerstag/Samstag haben einen Kraft-Warm-up, Montag/Mittwoch/Freitag/Sonntag nicht', () => {
    const byDay = (day: string) => WEEK_PLAN.find((d) => d.day === day)!;
    expect(byDay('Di').strengthWarmup).toBe('Kettlebell Halos (2×8 pro Richtung), 10 Push-Ups locker');
    expect(byDay('Do').strengthWarmup).toBe('20 Bodyweight Squats, 10 Lunges pro Bein, 5 Min Mobilität');
    expect(byDay('Sa').strengthWarmup).toBe('Kettlebell Halos (2×8 pro Richtung)');

    expect(byDay('Mo').strengthWarmup).toBeUndefined();
    expect(byDay('Mi').strengthWarmup).toBeUndefined();
    expect(byDay('Fr').strengthWarmup).toBeUndefined();
    expect(byDay('So').strengthWarmup).toBeUndefined();
  });

  it('alle Übungs-Ids und alle Lauf-Ids über den gesamten Plan sind eindeutig', () => {
    const exerciseIds = WEEK_PLAN.flatMap((day) => day.exercises ?? []).map((exercise) => exercise.id);
    const runIds = WEEK_PLAN.flatMap((day) => day.runs ?? []).map((run) => run.id);

    expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
    expect(new Set(runIds).size).toBe(runIds.length);
  });

  it('Donnerstag enthält Wadenheben zur Schienbein-Prävention', () => {
    const thursday = WEEK_PLAN.find((day) => day.day === 'Do')!;
    const calfRaises = thursday.exercises!.find((exercise) => exercise.id === 'thu-calf-raises')!;
    expect(calfRaises.name).toContain('Wadenheben');
    expect(calfRaises.setsRepsByWeek(1)).toEqual({ sets: 3, reps: '12–15 pro Bein', restSec: 45 });
  });

  it('Kettlebell Pullover (Dienstag) ist Kettlebell-pflichtig und hat eine Ersatzübung', () => {
    const tuesday = WEEK_PLAN.find((day) => day.day === 'Di')!;
    const pullover = tuesday.exercises!.find((exercise) => exercise.id === 'tue-kb-pullover')!;
    expect(pullover.equipment).toBe('kettlebell');
    expect(pullover.substitute).toBeDefined();
    expect(pullover.setsRepsByWeek(1)).toEqual({ sets: 3, reps: '10–12', restSec: 70 });
  });

  it('jede Übung mit Equipment-Anforderung hat eine Ersatzübung definiert', () => {
    const equipmentExercises = WEEK_PLAN.flatMap((day) => day.exercises ?? []).filter(
      (exercise) => exercise.equipment !== undefined,
    );
    expect(equipmentExercises.length).toBeGreaterThan(0);
    for (const exercise of equipmentExercises) {
      expect(exercise.substitute).toBeDefined();
    }
  });
});
