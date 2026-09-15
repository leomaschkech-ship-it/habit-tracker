import { useState } from 'react';
import { addDays, todayISO, weekdayCode } from '../../dateUtils';
import type { TrainingStore } from '../../hooks/useTrainingStore';
import { resolveDayPlan } from '../resolveDayPlan';
import { WEEK_PLAN, isDeloadWeek } from '../plan';
import type { Weekday } from '../types';
import { BaselineForm } from './BaselineForm';
import { DaySummary } from './DaySummary';
import { ExerciseCard } from './ExerciseCard';
import { RunCard } from './RunCard';
import { WeekOverview } from './WeekOverview';

const WEEKDAY_ORDER = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

const DAY_NAMES: Record<Weekday, string> = {
  Mo: 'Montag',
  Di: 'Dienstag',
  Mi: 'Mittwoch',
  Do: 'Donnerstag',
  Fr: 'Freitag',
  Sa: 'Samstag',
  So: 'Sonntag',
};

function mondayOf(isoDate: string): string {
  const offset = WEEKDAY_ORDER.indexOf(weekdayCode(isoDate));
  return addDays(isoDate, -offset);
}

export function TrainingView({ store }: { store: TrainingStore }) {
  const [showBaseline, setShowBaseline] = useState(false);
  const [view, setView] = useState<'today' | 'week'>('today');
  const today = todayISO();
  const todayCode = weekdayCode(today);
  const [selectedDayCode, setSelectedDayCode] = useState<Weekday>(todayCode);
  const isViewingToday = selectedDayCode === todayCode;
  const dayPlan = WEEK_PLAN.find((day) => day.day === todayCode)!;
  const selectedDayPlan = WEEK_PLAN.find((day) => day.day === selectedDayCode)!;
  const needsEquipmentAnswer = (dayPlan.exercises ?? []).some((exercise) => exercise.equipment !== undefined);
  const equipmentAnswer = store.equipmentAnswerFor(today);
  const resolvedExercises = resolveDayPlan(dayPlan, store.state.currentWeek, equipmentAnswer, store.state.overrides);
  const hasContent = (dayPlan.runs?.length ?? 0) > 0 || (dayPlan.exercises?.length ?? 0) > 0;
  const monday = mondayOf(today);

  function hasActivityOn(date: string): boolean {
    const hasRating = store.state.ratings.some((rating) => rating.date === date);
    const hasRun = store.state.completedRuns.some((run) => run.date === date);
    return hasRating || hasRun;
  }

  return (
    <div className="training-view">
      <h1>Training</h1>
      <div className="training-view__header">
        <span>Woche {store.state.currentWeek} von 12</span>
        <button type="button" onClick={store.retreatWeek} disabled={store.state.currentWeek <= 1}>
          Vorherige Woche
        </button>
        <button type="button" onClick={store.advanceWeek} disabled={store.state.currentWeek >= 12}>
          Nächste Woche
        </button>
      </div>
      {isDeloadWeek(store.state.currentWeek) && (
        <p className="training-view__deload">Deload-Woche — 50% Volumen bei Kraftübungen</p>
      )}

      <div className="training-view__view-toggle">
        <button
          type="button"
          className={view === 'today' ? 'training-view__view-toggle-btn training-view__view-toggle-btn--active' : 'training-view__view-toggle-btn'}
          onClick={() => setView('today')}
        >
          Heute
        </button>
        <button
          type="button"
          className={view === 'week' ? 'training-view__view-toggle-btn training-view__view-toggle-btn--active' : 'training-view__view-toggle-btn'}
          onClick={() => setView('week')}
        >
          Wochenübersicht
        </button>
      </div>

      {view === 'week' ? (
        <WeekOverview week={store.state.currentWeek} />
      ) : (
        <>
          <div className="training-view__strip">
            {WEEKDAY_ORDER.map((code, index) => {
              const date = addDays(monday, index);
              const classes = ['training-view__strip-day'];
              if (hasActivityOn(date)) classes.push('training-view__strip-day--done');
              if (code === todayCode) classes.push('training-view__strip-day--today');
              if (code === selectedDayCode) classes.push('training-view__strip-day--selected');
              return (
                <button
                  key={code}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => setSelectedDayCode(code)}
                >
                  {code}
                </button>
              );
            })}
          </div>

          {isViewingToday ? (
            <>
              {needsEquipmentAnswer && (
                <div className="training-view__equipment">
                  <label>
                    Klimmzugstange vorhanden?
                    <input
                      type="checkbox"
                      checked={equipmentAnswer?.pullupBar ?? true}
                      onChange={(event) =>
                        store.setEquipmentAnswer(today, event.target.checked, equipmentAnswer?.kettlebell ?? true)
                      }
                    />
                  </label>
                  <label>
                    Kettlebell vorhanden?
                    <input
                      type="checkbox"
                      checked={equipmentAnswer?.kettlebell ?? true}
                      onChange={(event) =>
                        store.setEquipmentAnswer(today, equipmentAnswer?.pullupBar ?? true, event.target.checked)
                      }
                    />
                  </label>
                </div>
              )}

              {dayPlan.strengthWarmup && <p className="training-view__warmup">Warm-up: {dayPlan.strengthWarmup}</p>}

              {hasContent ? (
                <ul className="habit-list">
                  {dayPlan.runs?.map((run) => (
                    <RunCard
                      key={run.id}
                      run={run}
                      week={store.state.currentWeek}
                      done={store.state.completedRuns.some((entry) => entry.runId === run.id && entry.date === today)}
                      onToggleDone={(nextDone) =>
                        nextDone ? store.markRunCompleted(run.id, today) : store.unmarkRunCompleted(run.id, today)
                      }
                    />
                  ))}
                  {resolvedExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      ratings={store.state.ratings}
                      override={store.state.overrides.find((override) => override.exerciseId === exercise.id)}
                      onRate={(difficulty) => store.rateExercise(exercise.id, difficulty)}
                      onAcceptSuggestion={(suggestion) =>
                        store.acceptSuggestion(
                          exercise.id,
                          suggestion.repsDelta,
                          suggestion.direction === 'harder' ? '2 Wiederholungen mehr' : '2 Wiederholungen weniger oder mehr Pause',
                        )
                      }
                    />
                  ))}
                </ul>
              ) : (
                <p>☀️ Ruhetag</p>
              )}
            </>
          ) : (
            <div className="training-view__day-preview">
              <div className="training-view__day-preview-name">{DAY_NAMES[selectedDayCode]} (Vorschau)</div>
              <DaySummary dayPlan={selectedDayPlan} week={store.state.currentWeek} />
            </div>
          )}
        </>
      )}

      <button type="button" onClick={() => setShowBaseline(true)}>
        Baseline-Test eintragen
      </button>
      {showBaseline && (
        <BaselineForm
          history={store.state.baselineTests}
          onSubmit={store.addBaselineTest}
          onClose={() => setShowBaseline(false)}
        />
      )}
    </div>
  );
}
