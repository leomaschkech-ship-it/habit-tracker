import { useState } from 'react';
import { addMonths, firstWeekdayOffset, getMonthDays, todayISO, type YearMonth } from '../dateUtils';
import { findEntry } from '../entries';
import type { HabitStore } from '../hooks/useHabitStore';
import { unitLabel } from './unitLabel';

export function CalendarView({ store }: { store: HabitStore }) {
  const [habitId, setHabitId] = useState(store.activeHabits[0]?.id ?? '');
  const now = new Date();
  const [cursor, setCursor] = useState<YearMonth>({ year: now.getFullYear(), month: now.getMonth() });

  const habit = store.activeHabits.find((candidate) => candidate.id === habitId) ?? store.activeHabits[0];

  if (!habit) {
    return (
      <div className="calendar-view">
        <h1>Kalender</h1>
        <p>Noch keine Routinen angelegt.</p>
      </div>
    );
  }

  const days = getMonthDays(cursor.year, cursor.month);
  const offset = firstWeekdayOffset(cursor.year, cursor.month);
  const todayIso = todayISO();

  return (
    <div className="calendar-view">
      <h1>Kalender</h1>
      <select value={habit.id} onChange={(event) => setHabitId(event.target.value)}>
        {store.activeHabits.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <div className="calendar-view__header">
        <button type="button" onClick={() => setCursor((current) => addMonths(current, -1))}>
          {'<'}
        </button>
        <span>
          {cursor.year}-{String(cursor.month + 1).padStart(2, '0')}
        </span>
        <button type="button" onClick={() => setCursor((current) => addMonths(current, 1))}>
          {'>'}
        </button>
      </div>
      <div className="calendar-view__grid">
        {Array.from({ length: offset }).map((_, index) => (
          <div key={`pad-${index}`} className="calendar-view__cell calendar-view__cell--empty" />
        ))}
        {days.map((date) => {
          const entry = findEntry(store.entries, habit.id, date);
          const isFuture = date > todayIso;
          const state = isFuture ? 'future' : entry ? (entry.done ? 'done' : 'missed') : 'none';

          return (
            <button
              key={date}
              type="button"
              className={`calendar-view__cell calendar-view__cell--${state}`}
              disabled={isFuture}
              onClick={() => {
                if (habit.type === 'boolean') {
                  store.setEntry(habit, date, { done: !(entry?.done ?? false) });
                  return;
                }
                const input = window.prompt(`${unitLabel(habit.unit ?? 'minutes')} für ${date}:`, String(entry?.value ?? 0));
                if (input === null) return;
                const value = Number(input);
                if (Number.isFinite(value) && value >= 0) {
                  store.setEntry(habit, date, { value });
                }
              }}
            >
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
