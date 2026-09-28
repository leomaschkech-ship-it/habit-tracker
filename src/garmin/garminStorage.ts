import type { ActivitySport } from './types';

const GARMIN_KEY = 'habit-tracker:garmin';

export interface GarminImportState {
  importedIds: string[];
  // Remembers which habit the user last picked per sport, as the default for
  // the next import.
  sportHabits: Partial<Record<ActivitySport, string>>;
}

export function loadGarminState(): GarminImportState {
  try {
    const raw = localStorage.getItem(GARMIN_KEY);
    if (!raw) return { importedIds: [], sportHabits: {} };
    const parsed = JSON.parse(raw);
    return {
      importedIds: Array.isArray(parsed?.importedIds) ? parsed.importedIds.filter((id: unknown) => typeof id === 'string') : [],
      sportHabits: parsed?.sportHabits && typeof parsed.sportHabits === 'object' ? parsed.sportHabits : {},
    };
  } catch {
    return { importedIds: [], sportHabits: {} };
  }
}

export function saveGarminState(state: GarminImportState): void {
  try {
    localStorage.setItem(GARMIN_KEY, JSON.stringify(state));
  } catch {
    // siehe saveHabits in storage.ts
  }
}
