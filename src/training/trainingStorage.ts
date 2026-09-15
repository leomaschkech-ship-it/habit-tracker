import { createEmptyTrainingState } from './types';
import type { TrainingState } from './types';

const TRAINING_KEY = 'habit-tracker:training';

export function loadTrainingState(): TrainingState {
  try {
    const raw = localStorage.getItem(TRAINING_KEY);
    if (!raw) return createEmptyTrainingState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return createEmptyTrainingState();
    const empty = createEmptyTrainingState();
    return {
      currentWeek: typeof parsed.currentWeek === 'number' ? parsed.currentWeek : empty.currentWeek,
      ratings: Array.isArray(parsed.ratings) ? parsed.ratings : empty.ratings,
      overrides: Array.isArray(parsed.overrides) ? parsed.overrides : empty.overrides,
      equipmentAnswers: Array.isArray(parsed.equipmentAnswers) ? parsed.equipmentAnswers : empty.equipmentAnswers,
      baselineTests: Array.isArray(parsed.baselineTests) ? parsed.baselineTests : empty.baselineTests,
      completedRuns: Array.isArray(parsed.completedRuns) ? parsed.completedRuns : empty.completedRuns,
    };
  } catch {
    return createEmptyTrainingState();
  }
}

export function saveTrainingState(state: TrainingState): void {
  try {
    localStorage.setItem(TRAINING_KEY, JSON.stringify(state));
  } catch {
    // localStorage nicht beschreibbar (z.B. voll oder deaktiviert) - bewusst ignoriert, siehe storage.ts
  }
}
