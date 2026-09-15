import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadTrainingState, saveTrainingState } from './trainingStorage';
import { createEmptyTrainingState } from './types';
import type { TrainingState } from './types';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

describe('trainingStorage', () => {
  it('gibt einen leeren TrainingState zurück, wenn nichts gespeichert ist', () => {
    expect(loadTrainingState()).toEqual(createEmptyTrainingState());
  });

  it('speichert und lädt einen TrainingState unverändert', () => {
    const state: TrainingState = {
      currentWeek: 3,
      ratings: [{ exerciseId: 'ex-1', date: '2026-09-07', difficulty: 4 }],
      overrides: [{ exerciseId: 'ex-1', repsDelta: -2, note: 'weniger' }],
      equipmentAnswers: [{ date: '2026-09-07', pullupBar: true, kettlebell: false }],
      baselineTests: [{ date: '2026-09-07', pullups: 20 }],
      completedRuns: [{ runId: 'mo-run-easy', date: '2026-09-07' }],
    };
    saveTrainingState(state);
    expect(loadTrainingState()).toEqual(state);
  });

  it('gibt einen leeren TrainingState zurück bei kaputtem JSON', () => {
    localStorage.setItem('habit-tracker:training', '{not valid json');
    expect(loadTrainingState()).toEqual(createEmptyTrainingState());
  });

  it('füllt fehlende Felder mit leeren Defaults auf, wenn der gespeicherte Wert unvollständig ist', () => {
    localStorage.setItem('habit-tracker:training', JSON.stringify({ currentWeek: 2 }));
    expect(loadTrainingState()).toEqual({ ...createEmptyTrainingState(), currentWeek: 2 });
  });
});
