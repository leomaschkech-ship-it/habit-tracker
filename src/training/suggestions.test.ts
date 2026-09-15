import { describe, expect, it } from 'vitest';
import { getSuggestion } from './suggestions';
import type { ExerciseRating } from './types';

describe('getSuggestion', () => {
  it('gibt null zurück, wenn keine Bewertung vorliegt', () => {
    expect(getSuggestion([], 'ex-1')).toBeNull();
  });

  it('schlägt mehr Wiederholungen vor bei Bewertung 1 oder 2', () => {
    const ratings: ExerciseRating[] = [{ exerciseId: 'ex-1', date: '2026-09-07', difficulty: 2 }];
    expect(getSuggestion(ratings, 'ex-1')).toEqual({
      direction: 'harder',
      repsDelta: 2,
      text: 'Letztes Mal war das leicht — 2 Wiederholungen mehr probieren?',
    });
  });

  it('schlägt weniger Wiederholungen vor bei Bewertung 4 oder 5', () => {
    const ratings: ExerciseRating[] = [{ exerciseId: 'ex-1', date: '2026-09-07', difficulty: 5 }];
    expect(getSuggestion(ratings, 'ex-1')).toEqual({
      direction: 'easier',
      repsDelta: -2,
      text: 'Letztes Mal war das schwer — 2 Wiederholungen weniger oder mehr Pause?',
    });
  });

  it('gibt null zurück bei Bewertung 3', () => {
    const ratings: ExerciseRating[] = [{ exerciseId: 'ex-1', date: '2026-09-07', difficulty: 3 }];
    expect(getSuggestion(ratings, 'ex-1')).toBeNull();
  });

  it('berücksichtigt nur die zuletzt eingetragene Bewertung dieser Übung', () => {
    const ratings: ExerciseRating[] = [
      { exerciseId: 'ex-1', date: '2026-09-01', difficulty: 5 },
      { exerciseId: 'ex-1', date: '2026-09-07', difficulty: 1 },
    ];
    expect(getSuggestion(ratings, 'ex-1')?.direction).toBe('harder');
  });

  it('ignoriert Bewertungen anderer Übungen', () => {
    const ratings: ExerciseRating[] = [{ exerciseId: 'ex-2', date: '2026-09-07', difficulty: 5 }];
    expect(getSuggestion(ratings, 'ex-1')).toBeNull();
  });
});
