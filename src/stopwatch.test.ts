import { describe, expect, it } from 'vitest';
import { elapsedMinutes, formatElapsed } from './stopwatch';

describe('elapsedMinutes', () => {
  it('rundet auf die nächste ganze Minute', () => {
    expect(elapsedMinutes(0, 90_000)).toBe(2); // 1.5 min -> rundet auf 2
    expect(elapsedMinutes(0, 89_000)).toBe(1); // 1.48 min -> rundet auf 1
  });

  it('gibt 0 zurück bei 0 verstrichener Zeit', () => {
    expect(elapsedMinutes(1000, 1000)).toBe(0);
  });

  it('gibt nie einen negativen Wert zurück', () => {
    expect(elapsedMinutes(5000, 1000)).toBe(0);
  });

  it('rundet exakt 30 Sekunden auf 1 Minute auf', () => {
    expect(elapsedMinutes(0, 30_000)).toBe(1);
  });
});

describe('formatElapsed', () => {
  it('formatiert unter einer Minute als 0:SS', () => {
    expect(formatElapsed(0, 5000)).toBe('0:05');
  });

  it('formatiert mehrere Minuten mit Nullstellen-Padding bei Sekunden', () => {
    expect(formatElapsed(0, 125_000)).toBe('2:05');
  });

  it('gibt 0:00 zurück bei 0 verstrichener Zeit', () => {
    expect(formatElapsed(1000, 1000)).toBe('0:00');
  });

  it('gibt nie eine negative Anzeige zurück', () => {
    expect(formatElapsed(5000, 1000)).toBe('0:00');
  });
});
