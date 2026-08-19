import { describe, expect, it } from 'vitest';
import { addDays, addMonths, firstWeekdayOffset, getMonthDays, toISODate } from './dateUtils';

describe('toISODate', () => {
  it('formatiert ein Datum als YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 7, 13))).toBe('2026-08-13');
  });

  it('füllt einstellige Monate/Tage mit führender Null', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addDays', () => {
  it('addiert Tage innerhalb eines Monats', () => {
    expect(addDays('2026-08-13', 1)).toBe('2026-08-14');
  });

  it('geht über einen Monatswechsel rückwärts', () => {
    expect(addDays('2026-08-01', -1)).toBe('2026-07-31');
  });

  it('geht über einen Jahreswechsel vorwärts', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('addMonths', () => {
  it('wechselt bei Dezember + 1 ins nächste Jahr', () => {
    expect(addMonths({ year: 2024, month: 11 }, 1)).toEqual({ year: 2025, month: 0 });
  });

  it('wechselt bei Januar - 1 ins vorherige Jahr', () => {
    expect(addMonths({ year: 2024, month: 0 }, -1)).toEqual({ year: 2023, month: 11 });
  });
});

describe('getMonthDays', () => {
  it('liefert 29 Tage für Februar im Schaltjahr 2024', () => {
    expect(getMonthDays(2024, 1)).toHaveLength(29);
  });

  it('liefert 28 Tage für Februar in einem Nicht-Schaltjahr', () => {
    expect(getMonthDays(2023, 1)).toHaveLength(28);
  });

  it('liefert 30 Tage für April', () => {
    expect(getMonthDays(2024, 3)).toHaveLength(30);
  });

  it('erster und letzter Eintrag entsprechen dem Monatsanfang/-ende', () => {
    const days = getMonthDays(2026, 7);
    expect(days[0]).toBe('2026-08-01');
    expect(days[days.length - 1]).toBe('2026-08-31');
  });
});

describe('firstWeekdayOffset', () => {
  it('gibt 0 zurück, wenn der Monat an einem Montag beginnt (Januar 2024)', () => {
    expect(firstWeekdayOffset(2024, 0)).toBe(0);
  });
});
