export type HabitType = 'boolean' | 'number';
export type NumberUnit = 'count' | 'minutes';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  target?: number;
  unit?: NumberUnit;
  archived: boolean;
}

export interface DailyEntry {
  habitId: string;
  date: string; // "YYYY-MM-DD"
  done: boolean;
  value?: number;
}
