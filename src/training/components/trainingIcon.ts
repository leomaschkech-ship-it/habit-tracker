export function trainingIcon(kind: 'exercise' | 'run' | 'bike'): string {
  if (kind === 'run') return '🏃';
  if (kind === 'bike') return '🚴';
  return '🏋️';
}
