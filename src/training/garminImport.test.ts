import { describe, expect, it } from 'vitest';
import { mergeGarminActivities, parseGarminExport } from './garminImport';
import type { GarminActivity } from './types';

describe('parseGarminExport', () => {
  it('parses a valid export', () => {
    const raw = {
      exportedAt: '2026-09-29T18:00:00.000Z',
      vo2Max: { value: 50.2, date: '2026-09-29' },
      activities: [{ date: '2026-09-28', type: 'running', distanceMeters: 12000 }],
    };
    expect(parseGarminExport(raw)).toEqual({
      activities: [{ date: '2026-09-28', type: 'running', distanceMeters: 12000 }],
      vo2Max: { value: 50.2, date: '2026-09-29' },
    });
  });

  it('returns null for non-object input', () => {
    expect(parseGarminExport('not an object')).toBeNull();
    expect(parseGarminExport(null)).toBeNull();
  });

  it('defaults activities to [] when missing or not an array', () => {
    expect(parseGarminExport({})).toEqual({ activities: [], vo2Max: undefined });
  });

  it('filters out activities with an invalid type', () => {
    const raw = {
      activities: [
        { date: '2026-09-28', type: 'running' },
        { date: '2026-09-28', type: 'not-a-real-type' },
        { date: '2026-09-28' },
      ],
    };
    expect(parseGarminExport(raw)!.activities).toEqual([{ date: '2026-09-28', type: 'running' }]);
  });

  it('leaves vo2Max undefined when malformed', () => {
    expect(parseGarminExport({ vo2Max: { value: 'not a number' } })!.vo2Max).toBeUndefined();
  });
});

describe('mergeGarminActivities', () => {
  const existing: GarminActivity[] = [
    { date: '2026-09-07', type: 'running', distanceMeters: 10000 },
    { date: '2026-09-08', type: 'strength' },
  ];

  it('keeps entries from existing that were not re-imported', () => {
    const merged = mergeGarminActivities(existing, []);
    expect(merged).toHaveLength(2);
  });

  it('overwrites same date+type entries with the incoming (last import wins)', () => {
    const merged = mergeGarminActivities(existing, [{ date: '2026-09-07', type: 'running', distanceMeters: 10500 }]);
    const sept7 = merged.find((activity) => activity.date === '2026-09-07');
    expect(sept7?.distanceMeters).toBe(10500);
  });

  it('appends a new date+type combination', () => {
    const merged = mergeGarminActivities(existing, [{ date: '2026-09-09', type: 'running' }]);
    expect(merged).toHaveLength(3);
  });

  it('sorts newest-first', () => {
    const merged = mergeGarminActivities(existing, [{ date: '2026-09-09', type: 'running' }]);
    expect(merged.map((activity) => activity.date)).toEqual(['2026-09-09', '2026-09-08', '2026-09-07']);
  });
});
