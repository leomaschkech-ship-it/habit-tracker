import { useEffect, useMemo, useState } from 'react';
import { todayISO } from '../dateUtils';
import { loadTrainingState, saveTrainingState } from '../training/trainingStorage';
import type { BaselineTest, EquipmentAnswer, ExerciseRating, TrainingState } from '../training/types';

export function useTrainingStore() {
  const [state, setState] = useState<TrainingState>(() => loadTrainingState());

  useEffect(() => saveTrainingState(state), [state]);

  function advanceWeek() {
    setState((prev) => ({ ...prev, currentWeek: Math.min(12, prev.currentWeek + 1), overrides: [] }));
  }

  function retreatWeek() {
    setState((prev) => ({ ...prev, currentWeek: Math.max(1, prev.currentWeek - 1) }));
  }

  function rateExercise(exerciseId: string, difficulty: ExerciseRating['difficulty']) {
    setState((prev) => ({
      ...prev,
      ratings: [...prev.ratings, { exerciseId, date: todayISO(), difficulty }],
    }));
  }

  function acceptSuggestion(exerciseId: string, repsDelta: number, note: string) {
    setState((prev) => ({
      ...prev,
      overrides: [
        ...prev.overrides.filter((override) => override.exerciseId !== exerciseId),
        { exerciseId, repsDelta, note },
      ],
    }));
  }

  function setEquipmentAnswer(date: string, pullupBar: boolean, kettlebell: boolean) {
    setState((prev) => ({
      ...prev,
      equipmentAnswers: [
        ...prev.equipmentAnswers.filter((answer) => answer.date !== date),
        { date, pullupBar, kettlebell },
      ],
    }));
  }

  function addBaselineTest(test: BaselineTest) {
    setState((prev) => ({ ...prev, baselineTests: [...prev.baselineTests, test] }));
  }

  function markRunCompleted(runId: string, date: string) {
    setState((prev) => {
      const alreadyLogged = prev.completedRuns.some((run) => run.runId === runId && run.date === date);
      if (alreadyLogged) return prev;
      return { ...prev, completedRuns: [...prev.completedRuns, { runId, date }] };
    });
  }

  function unmarkRunCompleted(runId: string, date: string) {
    setState((prev) => ({
      ...prev,
      completedRuns: prev.completedRuns.filter((run) => !(run.runId === runId && run.date === date)),
    }));
  }

  const equipmentAnswerFor = useMemo(() => {
    return (date: string): EquipmentAnswer | undefined =>
      state.equipmentAnswers.find((answer) => answer.date === date);
  }, [state.equipmentAnswers]);

  return {
    state,
    advanceWeek,
    retreatWeek,
    rateExercise,
    acceptSuggestion,
    setEquipmentAnswer,
    addBaselineTest,
    markRunCompleted,
    unmarkRunCompleted,
    equipmentAnswerFor,
  };
}

export type TrainingStore = ReturnType<typeof useTrainingStore>;
