import type { DayPlan, ExercisePrescription, RunPrescription } from './types';

// exercise/run ids are localStorage keys for ratings/overrides — never rename an existing id.

function byWeekBand<T>(week: number, bands: Array<{ upTo: number; value: T }>): T {
  const match = bands.find((band) => week <= band.upTo);
  return (match ?? bands[bands.length - 1]).value;
}

export function isDeloadWeek(week: number): boolean {
  return week === 7;
}

// --- Montag ---

const moRunEasy: RunPrescription = {
  id: 'mo-run-easy',
  name: 'Aerobe Basis (Zone 2)',
  hrZone: { min: 113, max: 132 },
  detailByWeek: (week) =>
    byWeekBand(week, [
      { upTo: 2, value: '10 km' },
      { upTo: 4, value: '11 km' },
      { upTo: 6, value: '12 km' },
      { upTo: 8, value: '10 km (locker)' },
      { upTo: Infinity, value: '12 km' },
    ]),
};

const moPushupsLight: ExercisePrescription = {
  id: 'mo-pushups-light',
  name: 'Liegestütze leicht',
  // Pause nicht im Plan-Dokument spezifiziert - 30 sec als sinnvoller Default für leichte Aktivierung.
  setsRepsByWeek: () => ({ sets: 2, reps: '10', restSec: 30 }),
};

// --- Dienstag ---

const tueKbPush: ExercisePrescription = {
  id: 'tue-kb-push',
  name: 'Kettlebell-Push (Schulterdruck), einarmig alternierend',
  equipment: 'kettlebell',
  substitute: { name: 'Pike Push-Ups (schulterschonend statt Überkopf-Gewicht)', setsReps: '4×8–10' },
  setsRepsByWeek: () => ({ sets: 4, reps: '6–8 pro Seite', restSec: 90 }),
};

const tuePushups: ExercisePrescription = {
  id: 'tue-pushups',
  name: 'Liegestütze-Varianten',
  setsRepsByWeek: (week) => ({
    sets: 4,
    reps: byWeekBand(week, [
      { upTo: 2, value: '8–12 (normal)' },
      { upTo: 4, value: '8–12 (enger Griff)' },
      { upTo: Infinity, value: '8–12 (Archer/mit Pause)' },
    ]),
    restSec: 60,
  }),
};

const tueDips: ExercisePrescription = {
  id: 'tue-dips',
  name: 'Dips an Stuhl/Bank',
  // Nur ab Woche 3 gewichtet (siehe setsRepsByWeek) - in Woche 1-2 ist es
  // reines Bodyweight und braucht keine Kettlebell.
  equipment: (week) => (week <= 2 ? undefined : 'kettlebell'),
  substitute: { name: 'Dips ohne Zusatzgewicht (Bodyweight)', setsReps: '3×8–12' },
  setsRepsByWeek: (week) =>
    byWeekBand(week, [
      { upTo: 2, value: { sets: 3, reps: '8–12 (ohne Gewicht)', restSec: 60 } },
      { upTo: Infinity, value: { sets: 3, reps: '6–8 (gewichtet, KB im Schoß)', restSec: 60 } },
    ]),
};

const tuePullups: ExercisePrescription = {
  id: 'tue-pullups',
  name: 'Klimmzüge (enge Varianten für Schulter)',
  equipment: 'pullupbar',
  substitute: { name: 'Handtuch-/Band-Rudern am Türrahmen (oder Inverted Rows)', setsReps: '4×12–15' },
  setsRepsByWeek: (week) => ({
    sets: 4,
    reps: byWeekBand(week, [
      { upTo: 2, value: '10–12 (Normaler Griff, Obergriff)' },
      { upTo: 4, value: '8–10 (Enger Griff, Obergriff)' },
      { upTo: Infinity, value: '8–10 (Neutral-Griff, falls verfügbar)' },
    ]),
    restSec: 90,
  }),
};

const tueKbPullover: ExercisePrescription = {
  id: 'tue-kb-pullover',
  name: 'Kettlebell Pullover (stehend)',
  equipment: 'kettlebell',
  substitute: { name: 'Standing Pullover mit gefülltem Rucksack', setsReps: '3×10–12' },
  setsRepsByWeek: () => ({ sets: 3, reps: '10–12', restSec: 70 }),
};

const tueDeadhangs: ExercisePrescription = {
  id: 'tue-deadhangs',
  name: 'Deadhangs (Klimmzugstange)',
  equipment: 'pullupbar',
  substitute: { name: 'Kein Ersatz nötig – heute auslassen', setsReps: '–' },
  setsRepsByWeek: () => ({ sets: 3, reps: 'max. Zeit (Ziel 20–30 sec)', restSec: 60 }),
};

const tuePlankTaps: ExercisePrescription = {
  id: 'tue-planktaps',
  name: 'Arm-Plank-Taps (Finisher)',
  setsRepsByWeek: () => ({ sets: 1, reps: '20 Taps', restSec: 0 }),
};

// --- Mittwoch ---

const wedRunIntervals: RunPrescription = {
  id: 'wed-run-intervals',
  name: 'Intervall-Training (VO2 Max)',
  hrZone: { min: 169, max: 179 },
  detailByWeek: (week) =>
    byWeekBand(week, [
      { upTo: 2, value: '4×4 min' },
      { upTo: 4, value: '5×4 min' },
      { upTo: 6, value: '6×4 min' },
      { upTo: 8, value: '5×5 min' },
      { upTo: Infinity, value: '6×5 min' },
    ]),
  warmup: '10 min leicht trotten',
  coolDown: '5 min auslaufen',
};

// --- Donnerstag (keine Wochen-Progression im Plan-Dokument, konstant) ---

const thuGobletSquat: ExercisePrescription = {
  id: 'thu-goblet-squat',
  name: 'Goblet Squats',
  equipment: 'kettlebell',
  substitute: { name: 'Kniebeuge mit gefülltem Rucksack', setsReps: '4×6–10' },
  setsRepsByWeek: () => ({ sets: 4, reps: '6–10', restSec: 90 }),
};

const thuBulgarianSplit: ExercisePrescription = {
  id: 'thu-bulgarian-split',
  name: 'Bulgarian Split Squats',
  setsRepsByWeek: () => ({ sets: 3, reps: '8–10 pro Bein', restSec: 60 }),
};

const thuSingleLegDeadlift: ExercisePrescription = {
  id: 'thu-single-leg-deadlift',
  name: 'Einbein-Deadlifts mit Kettlebell',
  equipment: 'kettlebell',
  substitute: { name: 'Einbein-Deadlift mit gefülltem Rucksack', setsReps: '3×6–8 pro Bein' },
  setsRepsByWeek: () => ({ sets: 3, reps: '6–8 pro Bein', restSec: 60 }),
};

const thuGluteBridge: ExercisePrescription = {
  id: 'thu-glute-bridge',
  name: 'Glute Bridge Holds',
  setsRepsByWeek: () => ({ sets: 3, reps: '30–45 sec', restSec: 45 }),
};

const thuCoreCircuit: ExercisePrescription = {
  id: 'thu-core-circuit',
  name: 'Core-Circuit (Plank, Side Plank re/li, Dead Bugs)',
  setsRepsByWeek: () => ({ sets: 3, reps: '45 sec Arbeit / 15 sec Pause je Übung', restSec: 0 }),
};

const thuCalfRaises: ExercisePrescription = {
  id: 'thu-calf-raises',
  name: 'Einbeinige Wadenheben (exzentrisch betont)',
  setsRepsByWeek: () => ({ sets: 3, reps: '12–15 pro Bein', restSec: 45 }),
};

// --- Freitag ---

const friRunTempo: RunPrescription = {
  id: 'fri-run-tempo',
  name: 'Tempo-Run',
  hrZone: { min: 150, max: 169 },
  detailByWeek: (week) =>
    byWeekBand(week, [
      { upTo: 2, value: '20 min' },
      { upTo: 4, value: '25 min' },
      { upTo: 6, value: '30 min' },
      { upTo: 8, value: '25 min' },
      { upTo: Infinity, value: '30 min' },
    ]),
  warmup: '10 min Easy',
  coolDown: '5–10 min Easy',
};

// --- Samstag ---

const satPushupPyramid: ExercisePrescription = {
  id: 'sat-pushup-pyramid',
  name: 'Push-Up-Pyramide',
  setsRepsByWeek: () => ({
    sets: 6,
    reps: '20-15-10-10-15-20 (bei Bedarf anfangs proportional reduzieren)',
    restSec: 40,
  }),
};

const satDipsSuperset: ExercisePrescription = {
  id: 'sat-dips-superset',
  name: 'Dips-Superset',
  setsRepsByWeek: () => ({ sets: 4, reps: 'Satz A: 8–10 Dips, Satz B: 15–20 Plank-Taps', restSec: 120 }),
};

const satTurkishGetup: ExercisePrescription = {
  id: 'sat-turkish-getup',
  name: 'Kettlebell-Türkish-Get-Up',
  equipment: 'kettlebell',
  substitute: {
    name: 'Turkish-Get-Up-Bewegungsmuster mit gefülltem Rucksack',
    setsReps: '3×2–4 pro Seite (steigert sich analog zur Woche)',
  },
  setsRepsByWeek: (week) =>
    byWeekBand(week, [
      { upTo: 4, value: { sets: 3, reps: '2 pro Seite', restSec: 90 } },
      { upTo: 8, value: { sets: 3, reps: '3 pro Seite', restSec: 90 } },
      { upTo: Infinity, value: { sets: 3, reps: '4 pro Seite', restSec: 90 } },
    ]),
};

const satPushupSuperset: ExercisePrescription = {
  id: 'sat-pushup-superset',
  name: 'Liegestütze-Superset (Wide + Diamond)',
  setsRepsByWeek: () => ({ sets: 3, reps: 'Satz A: 8–10 Wide Grip, Satz B: 10–12 Diamond', restSec: 90 }),
};

const satWeightedPullups: ExercisePrescription = {
  id: 'sat-weighted-pullups',
  name: 'Gewichtete Klimmzüge-Superset',
  equipment: 'pullupbar',
  substitute: { name: 'Inverted Rows / Handtuch-Rudern am Türrahmen', setsReps: '3×12–15' },
  setsRepsByWeek: (week) =>
    byWeekBand(week, [
      { upTo: 4, value: { sets: 3, reps: 'Satz A: gewichtet 4–6, Satz B: Bodyweight breit 8–10', restSec: 120 } },
      { upTo: 8, value: { sets: 3, reps: 'Satz A: gewichtet 5–7, Satz B: Bodyweight 10–12', restSec: 120 } },
      { upTo: Infinity, value: { sets: 3, reps: 'Nur gewichtet 6–8 (kein Bodyweight-Satz mehr)', restSec: 120 } },
    ]),
};

const satShoulderHold: ExercisePrescription = {
  id: 'sat-shoulder-hold',
  name: 'Schulterdruck-Hold (Finisher)',
  equipment: 'kettlebell',
  substitute: { name: 'Plank Hold', setsReps: '3×20 sec' },
  // Pause zwischen Saetzen nicht im Plan-Dokument spezifiziert - 30 sec als sinnvoller Default.
  setsRepsByWeek: () => ({ sets: 3, reps: '20 sec', restSec: 30 }),
};

export const WEEK_PLAN: DayPlan[] = [
  { day: 'Mo', runs: [moRunEasy], exercises: [moPushupsLight] },
  {
    day: 'Di',
    exercises: [tueKbPush, tuePushups, tueDips, tuePullups, tueKbPullover, tueDeadhangs, tuePlankTaps],
    strengthWarmup: 'Kettlebell Halos (2×8 pro Richtung), 10 Push-Ups locker',
  },
  { day: 'Mi', runs: [wedRunIntervals] },
  {
    day: 'Do',
    exercises: [thuGobletSquat, thuBulgarianSplit, thuSingleLegDeadlift, thuGluteBridge, thuCoreCircuit, thuCalfRaises],
    strengthWarmup: '20 Bodyweight Squats, 10 Lunges pro Bein, 5 Min Mobilität',
  },
  { day: 'Fr', runs: [friRunTempo] },
  {
    day: 'Sa',
    exercises: [
      satPushupPyramid,
      satDipsSuperset,
      satTurkishGetup,
      satPushupSuperset,
      satWeightedPullups,
      satShoulderHold,
    ],
    strengthWarmup: 'Kettlebell Halos (2×8 pro Richtung)',
  },
  { day: 'So' },
];
