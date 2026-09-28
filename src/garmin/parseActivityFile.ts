import { isFitFile, parseFit } from './fit';
import type { GarminActivity } from './types';
import { parseGpx, parseTcx } from './xml';
import { isZipFile, readZip } from './zip';

export async function parseActivityFile(name: string, bytes: Uint8Array): Promise<GarminActivity[]> {
  if (isZipFile(bytes)) {
    const entries = await readZip(bytes);
    const nested = await Promise.all(entries.map((entry) => parseActivityFile(entry.name, entry.bytes).catch(() => [])));
    return nested.flat();
  }
  if (isFitFile(bytes)) return parseFit(bytes);

  const lowerName = name.toLowerCase();
  const text = new TextDecoder().decode(bytes);
  if (lowerName.endsWith('.tcx') || text.includes('<TrainingCenterDatabase')) return parseTcx(text);
  if (lowerName.endsWith('.gpx') || text.includes('<gpx')) return parseGpx(text);
  throw new Error(`${name}: Dateiformat nicht erkannt (erwartet .fit, .tcx, .gpx oder .zip)`);
}

// Several files (e.g. a .fit and a .gpx of the same run) can describe the same
// activity; keep the first one per start time.
export function dedupeActivities(activities: GarminActivity[]): GarminActivity[] {
  const seen = new Set<string>();
  return activities
    .filter((activity) => {
      if (seen.has(activity.id)) return false;
      seen.add(activity.id);
      return true;
    })
    .sort((a, b) => a.startMs - b.startMs);
}
