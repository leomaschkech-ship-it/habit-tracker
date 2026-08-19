import { useState } from 'react';
import type { HabitStore } from '../hooks/useHabitStore';
import type { Habit } from '../types';
import { habitIcon } from './habitIcon';
import { HabitForm } from './HabitForm';

export function ManageView({ store }: { store: HabitStore }) {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  function closeForm() {
    setShowForm(false);
    setEditingHabit(null);
  }

  return (
    <div className="manage-view">
      <h1>Routinen verwalten</h1>
      <ul className="habit-list">
        {store.habits.map((habit) => (
          <li
            key={habit.id}
            className={habit.archived ? 'habit-card habit-card--archived' : 'habit-card'}
          >
            <div className="habit-card__icon">{habitIcon(habit.type)}</div>
            <div className="habit-card__info">
              <div className="habit-card__name">{habit.name}</div>
            </div>
            {!habit.archived && (
              <div className="habit-card__actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingHabit(habit);
                    setShowForm(true);
                  }}
                >
                  Bearbeiten
                </button>
                <button type="button" onClick={() => store.removeHabit(habit.id)}>
                  Archivieren
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {showForm ? (
        <HabitForm
          key={editingHabit?.id ?? 'new'}
          initialHabit={editingHabit ?? undefined}
          onSubmit={(input) => {
            if (editingHabit) {
              store.editHabit(editingHabit.id, {
                name: input.name,
                target: input.target,
                unit: input.unit,
              });
            } else {
              store.addHabit(input);
            }
            closeForm();
          }}
          onCancel={closeForm}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditingHabit(null);
            setShowForm(true);
          }}
        >
          + Neue Routine
        </button>
      )}
    </div>
  );
}
