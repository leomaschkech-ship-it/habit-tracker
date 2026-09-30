import type { GarminActivity } from './types';

interface ParsedGarminExport {
  activities: GarminActivity[];
  vo2Max?: { value: number; date: string };
}

const VALID_TYPES = new Set(['running', 'strength', 'other']);

function isValidActivity(value: unknown): value is GarminActivity {
  if (!value || typeof value !== 'object') return false;
  const activity = value as Record<string, unknown>;
  return typeof activity.date === 'string' && typeof activity.type === 'string' && VALID_TYPES.has(activity.type);
}

export function parseGarminExport(raw: unknown): ParsedGarminExport | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const activities = Array.isArray(data.activities) ? data.activities.filter(isValidActivity) : [];

  const vo2MaxRaw = data.vo2Max as Record<string, unknown> | undefined;
  const vo2Max =
    vo2MaxRaw && typeof vo2MaxRaw.value === 'number' && typeof vo2MaxRaw.date === 'string'
      ? { value: vo2MaxRaw.value, date: vo2MaxRaw.date }
      : undefined;

  return { activities, vo2Max };
}

export function mergeGarminActivities(existing: GarminActivity[], incoming: GarminActivity[]): GarminActivity[] {
  const byKey = new Map<string, GarminActivity>();
  for (const activity of existing) byKey.set(`${activity.date}:${activity.type}`, activity);
  for (const activity of incoming) byKey.set(`${activity.date}:${activity.type}`, activity);
  return Array.from(byKey.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}
