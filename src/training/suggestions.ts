import type { ExerciseRating } from './types';

export interface Suggestion {
  direction: 'easier' | 'harder';
  repsDelta: number;
  text: string;
}

export function getSuggestion(ratings: ExerciseRating[], exerciseId: string): Suggestion | null {
  const relevant = ratings.filter((rating) => rating.exerciseId === exerciseId);
  const latest = relevant[relevant.length - 1];
  if (!latest) return null;

  if (latest.difficulty <= 2) {
    return {
      direction: 'harder',
      repsDelta: 2,
      text: 'Letztes Mal war das leicht — 2 Wiederholungen mehr probieren?',
    };
  }

  if (latest.difficulty >= 4) {
    return {
      direction: 'easier',
      repsDelta: -2,
      text: 'Letztes Mal war das schwer — 2 Wiederholungen weniger oder mehr Pause?',
    };
  }

  return null;
}
