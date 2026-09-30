export type EquipmentTag = 'pullupbar' | 'kettlebell';

export type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';

export interface ExercisePrescription {
  id: string;
  name: string;
  // A function is used for exercises whose equipment need changes by week
  // (e.g. bodyweight in early weeks, weighted with a kettlebell later) -
  // see tue-dips in plan.ts.
  equipment?: EquipmentTag | ((week: number) => EquipmentTag | undefined);
  substitute?: { name: string; setsReps: string };
  setsRepsByWeek: (week: number) => { sets: number; reps: string; restSec: number };
}

export interface RunPrescription {
  id: string;
  name: string;
  hrZone: { min: number; max: number };
  detailByWeek: (week: number) => string;
  warmup?: string;
  coolDown?: string;
}

export interface CyclePrescription {
  id: string;
  name: string;
  hrZone: { min: number; max: number };
  detailByWeek: (week: number) => string;
  warmup?: string;
  coolDown?: string;
}

export interface DayPlan {
  day: Weekday;
  runs?: RunPrescription[];
  cycles?: CyclePrescription[];
  exercises?: ExercisePrescription[];
  strengthWarmup?: string;
}

export interface ExerciseRating {
  exerciseId: string;
  date: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface ExerciseOverride {
  exerciseId: string;
  repsDelta: number;
  note: string;
}

export interface EquipmentAnswer {
  date: string;
  pullupBar: boolean;
  kettlebell: boolean;
}

export interface BaselineTest {
  date: string;
  pullups?: number;
  pushups?: number;
  dips?: number;
  kbShoulderPressRepsRight?: number;
  kbShoulderPressRepsLeft?: number;
  easyPaceSecPerKm?: number;
  tempoPaceSecPerKm?: number;
}

export interface CompletedRun {
  runId: string;
  date: string;
}

export interface CardioModeAnswer {
  date: string;
  mode: 'run' | 'bike';
}

export interface GarminExerciseSet {
  exerciseName?: string;
  reps?: number;
  weightKg?: number;
}

export interface GarminActivity {
  date: string;
  type: 'running' | 'strength' | 'other';
  name?: string;
  distanceMeters?: number;
  durationSec?: number;
  averagePaceSecPerKm?: number;
  averageHrBpm?: number;
  exerciseSets?: GarminExerciseSet[];
}

export interface TrainingState {
  currentWeek: number;
  ratings: ExerciseRating[];
  overrides: ExerciseOverride[];
  equipmentAnswers: EquipmentAnswer[];
  baselineTests: BaselineTest[];
  completedRuns: CompletedRun[];
  garminActivities: GarminActivity[];
  garminVo2Max?: { value: number; date: string };
  cardioModeAnswers: CardioModeAnswer[];
}

export function createEmptyTrainingState(): TrainingState {
  return {
    currentWeek: 1,
    ratings: [],
    overrides: [],
    equipmentAnswers: [],
    baselineTests: [],
    completedRuns: [],
    garminActivities: [],
    cardioModeAnswers: [],
  };
}
