import { useEffect, useState } from 'react';
import { todayISO } from '../dateUtils';
import { findEntry } from '../entries';
import { habitIcon } from './habitIcon';
import type { HabitStore } from '../hooks/useHabitStore';
import { calculateCurrentStreak } from '../streaks';
import { formatElapsed } from '../stopwatch';

export function TodayView({ store }: { store: HabitStore }) {
  const today = todayISO();
  const [, tick] = useState(0);

  const anyStopwatchRunning = store.activeHabits.some(
    (habit) => habit.type === 'number' && habit.unit === 'minutes' && store.stopwatches[habit.id] !== undefined,
  );

  useEffect(() => {
    if (!anyStopwatchRunning) return;
    const interval = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [anyStopwatchRunning]);

  return (
    <div className="today-view">
      <h1>Heute</h1>
      {store.activeHabits.length === 0 && <p>Noch keine Routinen angelegt.</p>}
      <ul className="habit-list">
        {store.activeHabits.map((habit) => {
          const entry = findEntry(store.entries, habit.id, today);
          const streak = calculateCurrentStreak(store.entries, habit.id, today);
          const runningSince = store.stopwatches[habit.id];
          const statusText =
            habit.type === 'boolean'
              ? entry?.done
                ? 'Heute erledigt'
                : 'Noch offen'
              : habit.unit === 'count'
                ? `${entry?.value ?? 0} / ${habit.target ?? 0}`
                : `${entry?.value ?? 0} / ${habit.target ?? 0} Min`;

          return (
            <li key={habit.id} className="habit-card">
              <div className="habit-card__icon">{habitIcon(habit.type)}</div>
              <div className="habit-card__info">
                <div className="habit-card__name">{habit.name}</div>
                <div className="habit-card__sub">{statusText}</div>
              </div>
              <div className="habit-card__actions">
                {habit.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={entry?.done ?? false}
                    onChange={(event) => store.setEntry(habit, today, { done: event.target.checked })}
                  />
                ) : habit.unit === 'count' ? (
                  <button
                    type="button"
                    className="habit-card__stepper"
                    onClick={() => store.incrementCount(habit, today)}
                  >
                    +
                  </button>
                ) : runningSince !== undefined ? (
                  <>
                    <span className="habit-card__timer">{formatElapsed(runningSince, Date.now())}</span>
                    <button type="button" onClick={() => store.stopStopwatch(habit, today)}>
                      Stopp
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => store.startStopwatch(habit.id)}>
                    Start
                  </button>
                )}
                <span className="habit-card__streak">🔥 {streak}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
