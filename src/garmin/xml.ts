import { toISODate } from '../dateUtils';
import type { ActivitySport, GarminActivity } from './types';

// TCX and GPX are parsed with regular expressions instead of DOMParser so the
// same code runs in the browser and in the Node-based tests. Only the handful
// of summary fields the import needs are read.

export function parseTcx(text: string): GarminActivity[] {
  const activities: GarminActivity[] = [];
  for (const match of text.matchAll(/<Activity\b([^>]*)>([\s\S]*?)<\/Activity>/g)) {
    const sportAttr = /Sport="([^"]*)"/.exec(match[1])?.[1] ?? '';
    const body = match[2];
    const startMs = Date.parse(tagText(body, 'Id') ?? '');
    if (Number.isNaN(startMs)) continue;

    let seconds = 0;
    let meters = 0;
    let hrWeighted = 0;
    let hrSeconds = 0;
    for (const lap of body.matchAll(/<Lap\b[^>]*>([\s\S]*?)<\/Lap>/g)) {
      const lapSeconds = Number(tagText(lap[1], 'TotalTimeSeconds') ?? 0);
      seconds += lapSeconds;
      meters += Number(tagText(lap[1], 'DistanceMeters') ?? 0);
      const avgHrBlock = /<AverageHeartRateBpm\b[^>]*>([\s\S]*?)<\/AverageHeartRateBpm>/.exec(lap[1]);
      const lapHr = Number(avgHrBlock ? tagText(avgHrBlock[1], 'Value') : NaN);
      if (Number.isFinite(lapHr) && lapSeconds > 0) {
        hrWeighted += lapHr * lapSeconds;
        hrSeconds += lapSeconds;
      }
    }

    activities.push({
      id: String(startMs),
      sport: normalizeSport(sportAttr),
      startMs,
      date: toISODate(new Date(startMs)),
      durationMin: Math.round(seconds / 60),
      distanceKm: meters > 0 ? Math.round(meters / 10) / 100 : undefined,
      avgHeartRate: hrSeconds > 0 ? Math.round(hrWeighted / hrSeconds) : undefined,
    });
  }
  return activities;
}

export function parseGpx(text: string): GarminActivity[] {
  const activities: GarminActivity[] = [];
  for (const track of text.matchAll(/<trk\b[^>]*>([\s\S]*?)<\/trk>/g)) {
    const body = track[1];
    const points = Array.from(body.matchAll(/<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>/g)).map((point) => ({
      lat: Number(/lat="([^"]*)"/.exec(point[1])?.[1]),
      lon: Number(/lon="([^"]*)"/.exec(point[1])?.[1]),
      time: Date.parse(tagText(point[2], 'time') ?? ''),
    }));
    const timed = points.filter((point) => !Number.isNaN(point.time));
    if (timed.length < 2) continue;

    const startMs = timed[0].time;
    const endMs = timed[timed.length - 1].time;
    let meters = 0;
    for (let i = 1; i < points.length; i++) {
      meters += haversineMeters(points[i - 1], points[i]);
    }

    activities.push({
      id: String(startMs),
      sport: normalizeSport(tagText(body, 'type') ?? ''),
      startMs,
      date: toISODate(new Date(startMs)),
      durationMin: Math.round((endMs - startMs) / 60000),
      distanceKm: meters > 0 ? Math.round(meters / 10) / 100 : undefined,
    });
  }
  return activities;
}

function tagText(xml: string, tag: string): string | undefined {
  const match = new RegExp(`<(?:\\w+:)?${tag}\\b[^>]*>([^<]*)<`).exec(xml);
  return match?.[1].trim();
}

function normalizeSport(raw: string): ActivitySport {
  const value = raw.toLowerCase();
  if (value.includes('run')) return 'running';
  if (value.includes('bik') || value.includes('cycl')) return 'cycling';
  if (value.includes('swim')) return 'swimming';
  if (value.includes('walk')) return 'walking';
  if (value.includes('hik')) return 'hiking';
  if (value.includes('strength') || value.includes('training')) return 'strength';
  return 'other';
}

function haversineMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  if (![a.lat, a.lon, b.lat, b.lon].every(Number.isFinite)) return 0;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}
