import { describe, expect, it } from 'vitest';
import { applyRepsDelta } from './repsAdjustment';

describe('applyRepsDelta', () => {
  it('verschiebt eine Range mit Zusatztext nach oben', () => {
    expect(applyRepsDelta('6–8 pro Seite', 2)).toEqual({ text: '8–10 pro Seite', applied: true });
  });

  it('verschiebt eine Range mit Klammer-Zusatz nach unten', () => {
    expect(applyRepsDelta('8–12 (normal)', -2)).toEqual({ text: '6–10 (normal)', applied: true });
  });

  it('verschiebt eine einzelne Zahl mit Einheit', () => {
    expect(applyRepsDelta('20 sec', 2)).toEqual({ text: '22 sec', applied: true });
  });

  it('klemmt beide Grenzen einer Range bei minimal 1', () => {
    const result = applyRepsDelta('2 pro Seite', -5);
    const match = result.text.match(/^(\d+)(?:–(\d+))?/);
    expect(match).not.toBeNull();
    const min = Number(match![1]);
    const max = match![2] !== undefined ? Number(match![2]) : min;
    expect(min).toBeGreaterThanOrEqual(1);
    expect(max).toBeGreaterThanOrEqual(1);
    expect(result.applied).toBe(true);
  });

  it('laesst zusammengesetzten Text ohne fuehrende Zahl unveraendert (Fallback)', () => {
    const original = 'Satz A: 8–10 Dips, Satz B: 15–20 Plank-Taps';
    expect(applyRepsDelta(original, 2)).toEqual({ text: original, applied: false });
    expect(applyRepsDelta(original, -2)).toEqual({ text: original, applied: false });
  });

  it('laesst eine mit Bindestrichen verkettete Pyramiden-Zahlenfolge unveraendert (Fallback)', () => {
    // Realer Fall aus plan.ts (sat-pushup-pyramid): "20-15-10-10-15-20 (...)" ist keine
    // Range, sondern 6 verkettete Satz-Zahlen. Ein naiver Range-Match wuerde nur die
    // ersten beiden Zahlen erfassen und einen widerspruechlichen String erzeugen
    // (z.B. "22–22-10-10-15-20 (...)"). Das muss stattdessen in den Fallback fallen.
    const original = '20-15-10-10-15-20 (bei Bedarf anfangs proportional reduzieren)';
    expect(applyRepsDelta(original, 2)).toEqual({ text: original, applied: false });
  });
});
