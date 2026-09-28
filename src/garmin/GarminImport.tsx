import { type ChangeEvent, useState } from 'react';
import type { HabitStore } from '../hooks/useHabitStore';
import type { TrainingStore } from '../hooks/useTrainingStore';
import { loadGarminState, saveGarminState } from './garminStorage';
import { type ImportTarget, defaultTarget, habitEntryFor, plannedRunFor } from './importPlan';
import { dedupeActivities, parseActivityFile } from './parseActivityFile';
import type { ActivitySport, GarminActivity } from './types';

const SPORT_LABELS: Record<ActivitySport, string> = {
  running: 'Laufen',
  cycling: 'Radfahren',
  swimming: 'Schwimmen',
  walking: 'Gehen',
  hiking: 'Wandern',
  strength: 'Training',
  other: 'Aktivität',
};

interface GarminImportProps {
  habitStore: HabitStore;
  trainingStore: TrainingStore;
}

function targetKey(target: ImportTarget): string {
  if (target.kind === 'run') return `run:${target.runId}`;
  if (target.kind === 'habit') return `habit:${target.habitId}`;
  return 'skip';
}

function parseTargetKey(key: string): ImportTarget {
  if (key.startsWith('run:')) return { kind: 'run', runId: key.slice(4) };
  if (key.startsWith('habit:')) return { kind: 'habit', habitId: key.slice(6) };
  return { kind: 'skip' };
}

function describe(activity: GarminActivity): string {
  const [year, month, day] = activity.date.split('-');
  const parts = [`${day}.${month}.${year}`, `${activity.durationMin} min`];
  if (activity.distanceKm !== undefined) parts.push(`${activity.distanceKm.toFixed(2).replace('.', ',')} km`);
  if (activity.avgHeartRate !== undefined) parts.push(`Ø ${activity.avgHeartRate} bpm`);
  return parts.join(' · ');
}

export function GarminImport({ habitStore, trainingStore }: GarminImportProps) {
  const [garminState, setGarminState] = useState(() => loadGarminState());
  const [activities, setActivities] = useState<GarminActivity[]>([]);
  const [targets, setTargets] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const errors: string[] = [];
    const parsed: GarminActivity[] = [];
    for (const file of files) {
      try {
        parsed.push(...(await parseActivityFile(file.name, new Uint8Array(await file.arrayBuffer()))));
      } catch (error) {
        errors.push(error instanceof Error ? error.message : `${file.name}: nicht lesbar`);
      }
    }

    const found = dedupeActivities(parsed);
    const fresh = found.filter((activity) => !garminState.importedIds.includes(activity.id));
    setActivities(fresh);
    setTargets(
      Object.fromEntries(
        fresh.map((activity) => [
          activity.id,
          targetKey(defaultTarget(activity, habitStore.activeHabits, garminState.sportHabits)),
        ]),
      ),
    );

    const skipped = found.length - fresh.length;
    const notes = [...errors];
    if (found.length === 0 && errors.length === 0) notes.push('Keine Aktivitäten in den Dateien gefunden.');
    if (skipped > 0) notes.push(`${skipped} bereits importierte Aktivität(en) übersprungen.`);
    setMessage(notes.length > 0 ? notes.join(' ') : null);
  }

  function applyImport() {
    const importedIds = [...garminState.importedIds];
    const sportHabits = { ...garminState.sportHabits };
    let applied = 0;

    for (const activity of activities) {
      const target = parseTargetKey(targets[activity.id] ?? 'skip');
      if (target.kind === 'run') {
        trainingStore.markRunCompleted(target.runId, activity.date);
      } else if (target.kind === 'habit') {
        const habit = habitStore.activeHabits.find((candidate) => candidate.id === target.habitId);
        if (!habit) continue;
        habitStore.updateEntry(habit, activity.date, (entries) => habitEntryFor(habit, activity, entries));
        sportHabits[activity.sport] = habit.id;
      } else {
        continue;
      }
      importedIds.push(activity.id);
      applied++;
    }

    const next = { importedIds, sportHabits };
    setGarminState(next);
    saveGarminState(next);
    setActivities([]);
    setTargets({});
    setMessage(`${applied} Aktivität(en) übernommen.`);
  }

  return (
    <section className="garmin-import">
      <h2>Garmin-Import</h2>
      <p className="garmin-import__hint">
        In Garmin Connect eine Aktivität öffnen, über das Zahnrad „Original exportieren“ (oder TCX/GPX) wählen und die
        Datei hier auswählen. Läufe werden automatisch dem Trainingsplan des Tages zugeordnet.
      </p>
      <label className="garmin-import__picker">
        Dateien wählen (.fit, .zip, .tcx, .gpx)
        <input type="file" multiple accept=".fit,.zip,.tcx,.gpx" onChange={handleFiles} />
      </label>
      {message && <p className="garmin-import__message">{message}</p>}
      {activities.length > 0 && (
        <>
          <ul className="habit-list">
            {activities.map((activity) => {
              const run = plannedRunFor(activity);
              return (
                <li key={activity.id} className="habit-card">
                  <div className="habit-card__info">
                    <div className="habit-card__name">{SPORT_LABELS[activity.sport]}</div>
                    <div className="habit-card__sub">{describe(activity)}</div>
                    <select
                      className="garmin-import__target"
                      value={targets[activity.id] ?? 'skip'}
                      onChange={(event) => setTargets((prev) => ({ ...prev, [activity.id]: event.target.value }))}
                    >
                      <option value="skip">Nicht übernehmen</option>
                      {run && <option value={`run:${run.id}`}>Training: {run.name}</option>}
                      {habitStore.activeHabits.map((habit) => (
                        <option key={habit.id} value={`habit:${habit.id}`}>
                          Routine: {habit.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              );
            })}
          </ul>
          <button type="button" className="garmin-import__apply" onClick={applyImport}>
            Übernehmen
          </button>
        </>
      )}
    </section>
  );
}
