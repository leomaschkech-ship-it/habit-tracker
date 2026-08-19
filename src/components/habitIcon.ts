import type { HabitType } from '../types';

export function habitIcon(type: HabitType): string {
  return type === 'boolean' ? '✓' : '#';
}
