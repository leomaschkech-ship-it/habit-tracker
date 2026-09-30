import { describe, expect, it } from 'vitest';
import { plannedSummaryFor } from './plannedComparison';

describe('plannedSummaryFor', () => {
  it('includes both the run and the exercise for Montag week 1', () => {
    const summary = plannedSummaryFor('2026-09-07', 1, undefined);
    expect(summary).toBe('Aerobe Basis (Zone 2): 10 km · Liegestütze leicht');
  });

  it('joins all planned exercise names for a pure strength day (Dienstag week 1)', () => {
    const summary = plannedSummaryFor('2026-09-08', 1, undefined);
    expect(summary).toBe(
      'Dips an Stuhl/Bank, Liegestütze-Varianten, Kettlebell-Push (Schulterdruck), einarmig alternierend, Klimmzüge (enge Varianten für Schulter), Kettlebell Pullover (stehend), Deadhangs (Klimmzugstange), Kettlebell Russian Twists',
    );
  });

  it('returns null for a rest day with nothing planned (Sonntag)', () => {
    expect(plannedSummaryFor('2026-09-13', 1, undefined)).toBeNull();
  });

  it('substitutes an exercise name when equipment is missing', () => {
    const summary = plannedSummaryFor('2026-09-08', 1, { date: '2026-09-08', pullupBar: false, kettlebell: true });
    expect(summary).toContain('Handtuch-/Band-Rudern am Türrahmen (oder Inverted Rows)');
  });
});
