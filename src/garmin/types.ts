export type ActivitySport = 'running' | 'cycling' | 'swimming' | 'walking' | 'hiking' | 'strength' | 'other';

export interface GarminActivity {
  // Start time in ms since epoch - stable across FIT/TCX/GPX exports of the
  // same activity, so it doubles as the de-duplication key.
  id: string;
  sport: ActivitySport;
  startMs: number;
  date: string; // "YYYY-MM-DD", local time
  durationMin: number;
  distanceKm?: number;
  avgHeartRate?: number;
}
