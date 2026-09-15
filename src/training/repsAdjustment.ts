export interface RepsAdjustment {
  text: string;
  applied: boolean;
}

export function applyRepsDelta(reps: string, delta: number): RepsAdjustment {
  // Guard: a chain of 3+ dash-separated numbers (e.g. a pyramid scheme like
  // "20-15-10-10-15-20 (...)", see sat-pushup-pyramid in plan.ts) is not a min-max
  // range. Letting the range-match below grab only the first two numbers would
  // produce a self-contradictory string (e.g. "22–22-10-10-15-20 (...)"), so this
  // falls into the same unchanged/not-applied fallback as compound text.
  if (/^\d+[–-]\d+[–-]/.test(reps)) {
    return { text: reps, applied: false };
  }
  const rangeMatch = reps.match(/^(\d+)[–-](\d+)(.*)$/);
  if (rangeMatch) {
    const min = Math.max(1, Number(rangeMatch[1]) + delta);
    const max = Math.max(min, Number(rangeMatch[2]) + delta);
    return { text: `${min}–${max}${rangeMatch[3]}`, applied: true };
  }
  const singleMatch = reps.match(/^(\d+)(.*)$/);
  if (singleMatch) {
    const value = Math.max(1, Number(singleMatch[1]) + delta);
    return { text: `${value}${singleMatch[2]}`, applied: true };
  }
  return { text: reps, applied: false };
}
