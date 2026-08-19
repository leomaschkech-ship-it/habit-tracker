import { type FormEvent, useState } from 'react';
import type { CreateHabitInput } from '../habits';
import type { Habit, HabitType, NumberUnit } from '../types';

interface HabitFormProps {
  onSubmit: (input: CreateHabitInput) => void;
  onCancel: () => void;
  initialHabit?: Habit;
}

export function HabitForm({ onSubmit, onCancel, initialHabit }: HabitFormProps) {
  const [name, setName] = useState(initialHabit?.name ?? '');
  const [type, setType] = useState<HabitType>(initialHabit?.type ?? 'boolean');
  const [target, setTarget] = useState(initialHabit?.target ?? 10);
  const [unit, setUnit] = useState<NumberUnit>(initialHabit?.unit ?? 'minutes');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      type,
      target: type === 'number' ? target : undefined,
      unit: type === 'number' ? unit : undefined,
    });
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label>
        Typ
        <select
          value={type}
          onChange={(event) => setType(event.target.value as HabitType)}
          disabled={Boolean(initialHabit)}
        >
          <option value="boolean">Ja/Nein</option>
          <option value="number">Zahl</option>
        </select>
      </label>
      {type === 'number' && (
        <>
          <label>
            Ziel
            <input
              type="number"
              min={0}
              value={target}
              onChange={(event) => setTarget(Math.max(0, Number(event.target.value)))}
            />
          </label>
          <label>
            Einheit
            <select value={unit} onChange={(event) => setUnit(event.target.value as NumberUnit)}>
              <option value="count">Anzahl</option>
              <option value="minutes">Minuten</option>
            </select>
          </label>
        </>
      )}
      <div className="habit-form__actions">
        <button type="submit">Speichern</button>
        <button type="button" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}
