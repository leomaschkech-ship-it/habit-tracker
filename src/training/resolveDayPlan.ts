import { isDeloadWeek } from './plan';
import { applyRepsDelta } from './repsAdjustment';
import type { DayPlan, EquipmentAnswer, EquipmentTag, ExerciseOverride, ExercisePrescription } from './types';

export interface ResolvedExercise {
  id: string;
  name: string;
  setsReps: string;
  restSec: number;
  substituted: boolean;
  adjustmentApplied: boolean;
  equipment: EquipmentTag | undefined;
}

export function resolveDayPlan(
  dayPlan: DayPlan,
  week: number,
  answer: EquipmentAnswer | undefined,
  overrides: ExerciseOverride[] = [],
): ResolvedExercise[] {
  return (dayPlan.exercises ?? []).map((exercise) => resolveExercise(exercise, week, answer, overrides));
}

function resolveExercise(
  exercise: ExercisePrescription,
  week: number,
  answer: EquipmentAnswer | undefined,
  overrides: ExerciseOverride[],
): ResolvedExercise {
  const prescription = exercise.setsRepsByWeek(week);
  const equipmentThisWeek =
    typeof exercise.equipment === 'function' ? exercise.equipment(week) : exercise.equipment;
  const isMissing =
    equipmentThisWeek !== undefined &&
    answer !== undefined &&
    !(equipmentThisWeek === 'pullupbar' ? answer.pullupBar : answer.kettlebell);

  if (isMissing && exercise.substitute) {
    // Substitutes already show fixed bodyweight-equivalent numbers, not the
    // progressive base numbers, so deload and reps overrides intentionally do
    // not apply here.
    return {
      id: exercise.id,
      name: exercise.substitute.name,
      setsReps: exercise.substitute.setsReps,
      restSec: prescription.restSec,
      substituted: true,
      adjustmentApplied: false,
      equipment: equipmentThisWeek,
    };
  }

  const sets = isDeloadWeek(week) ? Math.max(1, Math.round(prescription.sets * 0.5)) : prescription.sets;

  const override = overrides.find((o) => o.exerciseId === exercise.id);
  let reps = prescription.reps;
  let adjustmentApplied = false;
  if (override) {
    const adjustment = applyRepsDelta(prescription.reps, override.repsDelta);
    reps = adjustment.text;
    adjustmentApplied = adjustment.applied;
  }

  return {
    id: exercise.id,
    name: exercise.name,
    setsReps: `${sets}×${reps}`,
    restSec: prescription.restSec,
    substituted: false,
    adjustmentApplied,
    equipment: equipmentThisWeek,
  };
}
