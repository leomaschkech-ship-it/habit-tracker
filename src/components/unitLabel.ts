import type { NumberUnit } from '../types';

export function unitLabel(unit: NumberUnit): string {
  return unit === 'count' ? 'Anzahl' : 'Minuten';
}
