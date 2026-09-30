import { weekdayCode } from '../dateUtils';
import { WEEK_PLAN } from './plan';
import { resolveDayPlan } from './resolveDayPlan';
import type { EquipmentAnswer } from './types';

export function plannedSummaryFor(
  date: string,
  week: number,
  equipmentAnswer: EquipmentAnswer | undefined,
): string | null {
  const dayPlan = WEEK_PLAN.find((day) => day.day === weekdayCode(date));
  if (!dayPlan) return null;

  const parts: string[] = [];
  for (const run of dayPlan.runs ?? []) {
    parts.push(`${run.name}: ${run.detailByWeek(week)}`);
  }

  const resolved = resolveDayPlan(dayPlan, week, equipmentAnswer);
  if (resolved.length > 0) {
    parts.push(resolved.map((exercise) => exercise.name).join(', '));
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}
