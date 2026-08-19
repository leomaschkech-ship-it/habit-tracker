import type { Habit, HabitType, NumberUnit } from './types';

export interface CreateHabitInput {
  name: string;
  type: HabitType;
  target?: number;
  unit?: NumberUnit;
}

function generateId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createHabit(input: CreateHabitInput): Habit {
  return {
    id: generateId(),
    name: input.name,
    type: input.type,
    target: input.type === 'number' ? input.target : undefined,
    unit: input.type === 'number' ? input.unit : undefined,
    archived: false,
  };
}

export function archiveHabit(habits: Habit[], habitId: string): Habit[] {
  return habits.map((habit) => (habit.id === habitId ? { ...habit, archived: true } : habit));
}

export function updateHabit(
  habits: Habit[],
  habitId: string,
  patch: Partial<Pick<Habit, 'name' | 'target' | 'unit'>>,
): Habit[] {
  return habits.map((habit) => (habit.id === habitId ? { ...habit, ...patch } : habit));
}
