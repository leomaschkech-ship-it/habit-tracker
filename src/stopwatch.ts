export function elapsedMinutes(startedAt: number, now: number): number {
  const diffMs = now - startedAt;
  if (diffMs <= 0) return 0;
  return Math.round(diffMs / 60_000);
}

export function formatElapsed(startedAt: number, now: number): string {
  const diffMs = Math.max(0, now - startedAt);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
