import { useState, type ChangeEvent } from 'react';
import type { TrainingStore } from '../../hooks/useTrainingStore';
import { parseGarminExport } from '../garminImport';
import { plannedSummaryFor } from '../plannedComparison';

const TYPE_LABEL: Record<string, string> = { running: 'Lauf', strength: 'Kraft', other: 'Sonstiges' };

function formatPace(secPerKm: number): string {
  const minutes = Math.floor(secPerKm / 60);
  const seconds = Math.round(secPerKm % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')} min/km`;
}

export function GarminImportPanel({ store }: { store: TrainingStore }) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseGarminExport(JSON.parse(text));
      if (!parsed || parsed.activities.length === 0) {
        setMessage('Keine gültigen Aktivitäten in der Datei gefunden.');
        return;
      }
      store.importGarminData(parsed.activities, parsed.vo2Max);
      setMessage(`${parsed.activities.length} Aktivität(en) importiert.`);
    } catch {
      setMessage('Datei konnte nicht gelesen werden - ist es eine gültige Garmin-Export-JSON?');
    }
  }

  const recentActivities = [...store.state.garminActivities].slice(0, 10);

  return (
    <div className="baseline-form">
      <h2>Garmin-Daten importieren</h2>
      <label className="baseline-form__actions">
        <input type="file" accept="application/json" onChange={handleFileChange} />
      </label>
      {message && <p>{message}</p>}
      {store.state.garminVo2Max && (
        <p>
          VO2max (Garmin): {store.state.garminVo2Max.value} ({store.state.garminVo2Max.date})
        </p>
      )}

      {recentActivities.length > 0 && (
        <div className="baseline-form__history">
          <div className="baseline-form__section-title">Zuletzt importiert</div>
          <ul className="baseline-form__history-list">
            {recentActivities.map((activity) => {
              const planned = plannedSummaryFor(activity.date, store.state.currentWeek, store.equipmentAnswerFor(activity.date));
              const actualReps = activity.exerciseSets
                ?.filter((set) => typeof set.reps === 'number')
                .map((set) => set.reps)
                .join(', ');
              return (
                <li key={`${activity.date}-${activity.type}`} className="baseline-form__history-entry">
                  <div className="baseline-form__history-date">
                    {activity.date} ({TYPE_LABEL[activity.type] ?? activity.type})
                  </div>
                  <div className="baseline-form__history-values">
                    {activity.name && <span>{activity.name}</span>}
                    {typeof activity.distanceMeters === 'number' && (
                      <span>{(activity.distanceMeters / 1000).toFixed(1)} km</span>
                    )}
                    {typeof activity.averagePaceSecPerKm === 'number' && <span>{formatPace(activity.averagePaceSecPerKm)}</span>}
                    {typeof activity.averageHrBpm === 'number' && <span>Ø {activity.averageHrBpm} bpm</span>}
                    {activity.exerciseSets && activity.exerciseSets.length > 0 && (
                      <span>
                        {activity.exerciseSets.length} Sätze erfasst
                        {actualReps && ` (${actualReps} Wdh.)`}
                      </span>
                    )}
                  </div>
                  {planned && (
                    <div className="baseline-form__history-values baseline-form__history-values--empty">
                      Geplant: {planned}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
