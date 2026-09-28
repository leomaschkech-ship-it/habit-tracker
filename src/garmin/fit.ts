import { toISODate } from '../dateUtils';
import type { ActivitySport, GarminActivity } from './types';

// Minimal reader for Garmin .fit files: only the "session" message (global
// number 18) is decoded, which holds the per-activity summary. Spec:
// https://developer.garmin.com/fit/protocol/

const SESSION_MESSAGE = 18;
const FIT_EPOCH_OFFSET_SEC = 631065600; // 1989-12-31T00:00:00Z

const FIELD_START_TIME = 2;
const FIELD_SPORT = 5;
const FIELD_TOTAL_ELAPSED_TIME = 7;
const FIELD_TOTAL_TIMER_TIME = 8;
const FIELD_TOTAL_DISTANCE = 9;
const FIELD_AVG_HEART_RATE = 16;

interface FieldDefinition {
  num: number;
  size: number;
}

interface MessageDefinition {
  globalNum: number;
  littleEndian: boolean;
  fields: FieldDefinition[];
  devDataSize: number;
}

export function isFitFile(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === '.FIT';
}

export function parseFit(bytes: Uint8Array): GarminActivity[] {
  if (!isFitFile(bytes)) throw new Error('Keine gültige FIT-Datei');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const headerSize = bytes[0];
  const dataEnd = Math.min(bytes.length, headerSize + view.getUint32(4, true));
  const definitions = new Map<number, MessageDefinition>();
  const activities: GarminActivity[] = [];

  let pos = headerSize;
  while (pos < dataEnd) {
    const recordHeader = bytes[pos++];

    if (recordHeader & 0x80) {
      // Compressed timestamp header: always a data message.
      const localType = (recordHeader >> 5) & 0x03;
      pos = readData(view, pos, definitions.get(localType), activities);
      continue;
    }

    const localType = recordHeader & 0x0f;
    if (recordHeader & 0x40) {
      const hasDevData = (recordHeader & 0x20) !== 0;
      const littleEndian = bytes[pos + 1] === 0;
      const globalNum = view.getUint16(pos + 2, littleEndian);
      const fieldCount = bytes[pos + 4];
      pos += 5;
      const fields: FieldDefinition[] = [];
      for (let i = 0; i < fieldCount; i++) {
        fields.push({ num: bytes[pos], size: bytes[pos + 1] });
        pos += 3;
      }
      let devDataSize = 0;
      if (hasDevData) {
        const devFieldCount = bytes[pos++];
        for (let i = 0; i < devFieldCount; i++) {
          devDataSize += bytes[pos + 1];
          pos += 3;
        }
      }
      definitions.set(localType, { globalNum, littleEndian, fields, devDataSize });
    } else {
      pos = readData(view, pos, definitions.get(localType), activities);
    }
  }

  return activities;
}

function readData(
  view: DataView,
  pos: number,
  definition: MessageDefinition | undefined,
  activities: GarminActivity[],
): number {
  if (!definition) throw new Error('Beschädigte FIT-Datei (Datensatz ohne Definition)');

  const values = new Map<number, number>();
  for (const field of definition.fields) {
    if (definition.globalNum === SESSION_MESSAGE) {
      const value = readUint(view, pos, field.size, definition.littleEndian);
      if (value !== undefined) values.set(field.num, value);
    }
    pos += field.size;
  }
  pos += definition.devDataSize;

  if (definition.globalNum === SESSION_MESSAGE) {
    const activity = sessionToActivity(values);
    if (activity) activities.push(activity);
  }
  return pos;
}

// Returns undefined for FIT's "invalid" marker (all bits set).
function readUint(view: DataView, pos: number, size: number, littleEndian: boolean): number | undefined {
  if (size === 1) {
    const value = view.getUint8(pos);
    return value === 0xff ? undefined : value;
  }
  if (size === 2) {
    const value = view.getUint16(pos, littleEndian);
    return value === 0xffff ? undefined : value;
  }
  if (size === 4) {
    const value = view.getUint32(pos, littleEndian);
    return value === 0xffffffff ? undefined : value;
  }
  return undefined;
}

function sessionToActivity(values: Map<number, number>): GarminActivity | undefined {
  const startTime = values.get(FIELD_START_TIME);
  const timeMs = values.get(FIELD_TOTAL_TIMER_TIME) ?? values.get(FIELD_TOTAL_ELAPSED_TIME);
  if (startTime === undefined || timeMs === undefined) return undefined;

  const startMs = (startTime + FIT_EPOCH_OFFSET_SEC) * 1000;
  const distanceCm = values.get(FIELD_TOTAL_DISTANCE);
  return {
    id: String(startMs),
    sport: fitSport(values.get(FIELD_SPORT)),
    startMs,
    date: toISODate(new Date(startMs)),
    durationMin: Math.round(timeMs / 1000 / 60),
    distanceKm: distanceCm ? Math.round(distanceCm / 1000) / 100 : undefined,
    avgHeartRate: values.get(FIELD_AVG_HEART_RATE),
  };
}

function fitSport(value: number | undefined): ActivitySport {
  switch (value) {
    case 1:
      return 'running';
    case 2:
      return 'cycling';
    case 5:
      return 'swimming';
    case 10:
      return 'strength';
    case 11:
      return 'walking';
    case 17:
      return 'hiking';
    default:
      return 'other';
  }
}
