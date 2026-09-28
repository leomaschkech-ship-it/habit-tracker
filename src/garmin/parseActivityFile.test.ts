import { describe, expect, it } from 'vitest';
import { dedupeActivities, parseActivityFile } from './parseActivityFile';

const FIT_EPOCH_OFFSET_SEC = 631065600;
// 2026-09-28T06:30:00Z - a Monday.
const START_MS = Date.UTC(2026, 8, 28, 6, 30, 0);

// Builds a small FIT file with a file_id message and one session message
// (plus a developer field and a compressed-timestamp record) so the reader's
// skipping logic is exercised too.
function buildFit(): Uint8Array {
  const records: number[] = [];
  const u16 = (v: number) => [v & 0xff, (v >> 8) & 0xff];
  const u32 = (v: number) => [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff];

  // Definition local 0: file_id (global 0), field 0 (type, uint8).
  records.push(0x40, 0, 0, ...u16(0), 1, 0, 1, 0x00);
  records.push(0x00, 4);
  // Definition local 1 with dev data: session (global 18).
  records.push(0x61, 0, 0, ...u16(18), 6);
  records.push(2, 4, 0x86, 5, 1, 0x00, 7, 4, 0x86, 8, 4, 0x86, 9, 4, 0x86, 16, 1, 0x02);
  records.push(1, 0, 2, 0); // one developer field, 2 bytes
  records.push(
    0x01,
    ...u32(START_MS / 1000 - FIT_EPOCH_OFFSET_SEC),
    1, // running
    ...u32(3_700_000), // elapsed 3700 s
    ...u32(3_600_000), // timer 3600 s
    ...u32(1_023_456), // 10234.56 m
    142,
    0xaa,
    0xbb, // developer data
  );
  // Compressed-timestamp data record for local 0.
  records.push(0x80 | 5, 4);

  const header = [14, 0x20, ...u16(2194), ...u32(records.length), 0x2e, 0x46, 0x49, 0x54, 0, 0];
  return new Uint8Array([...header, ...records, 0, 0]);
}

async function buildZip(name: string, content: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([content.slice()]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  const nameBytes = new TextEncoder().encode(name);
  const u16 = (v: number) => [v & 0xff, (v >> 8) & 0xff];
  const u32 = (v: number) => [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff];

  const local = [...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(8), ...u16(0), ...u16(0), ...u32(0),
    ...u32(compressed.length), ...u32(content.length), ...u16(nameBytes.length), ...u16(0), ...nameBytes, ...compressed];
  const central = [...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(8), ...u16(0), ...u16(0), ...u32(0),
    ...u32(compressed.length), ...u32(content.length), ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0),
    ...u16(0), ...u32(0), ...u32(0), ...nameBytes];
  const eocd = [...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(1), ...u16(1), ...u32(central.length),
    ...u32(local.length), ...u16(0)];
  return new Uint8Array([...local, ...central, ...eocd]);
}

const TCX = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Running">
      <Id>2026-09-28T06:30:00.000Z</Id>
      <Lap StartTime="2026-09-28T06:30:00.000Z">
        <TotalTimeSeconds>1800.0</TotalTimeSeconds>
        <DistanceMeters>5000.0</DistanceMeters>
        <AverageHeartRateBpm><Value>140</Value></AverageHeartRateBpm>
      </Lap>
      <Lap StartTime="2026-09-28T07:00:00.000Z">
        <TotalTimeSeconds>1800.0</TotalTimeSeconds>
        <DistanceMeters>5200.0</DistanceMeters>
        <AverageHeartRateBpm><Value>150</Value></AverageHeartRateBpm>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Garmin Connect" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Radfahrt</name>
    <type>cycling</type>
    <trkseg>
      <trkpt lat="47.3769" lon="8.5417"><ele>408</ele><time>2026-09-27T10:00:00.000Z</time></trkpt>
      <trkpt lat="47.3859" lon="8.5417"><ele>410</ele><time>2026-09-27T10:05:00.000Z</time></trkpt>
      <trkpt lat="47.3949" lon="8.5417"><ele>412</ele><time>2026-09-27T10:45:00.000Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`;

describe('parseActivityFile', () => {
  it('reads the session summary from a FIT file', async () => {
    const [activity, ...rest] = await parseActivityFile('run.fit', buildFit());
    expect(rest).toHaveLength(0);
    expect(activity).toMatchObject({
      id: String(START_MS),
      sport: 'running',
      startMs: START_MS,
      durationMin: 60,
      distanceKm: 10.23,
      avgHeartRate: 142,
    });
  });

  it('reads a FIT file inside a Garmin Connect zip export', async () => {
    const zip = await buildZip('123456_ACTIVITY.fit', buildFit());
    const activities = await parseActivityFile('123456.zip', zip);
    expect(activities).toHaveLength(1);
    expect(activities[0].durationMin).toBe(60);
  });

  it('sums laps from a TCX file', async () => {
    const [activity] = await parseActivityFile('run.tcx', new TextEncoder().encode(TCX));
    expect(activity).toMatchObject({
      id: String(START_MS),
      sport: 'running',
      durationMin: 60,
      distanceKm: 10.2,
      avgHeartRate: 145,
    });
  });

  it('derives duration and distance from GPX track points', async () => {
    const [activity] = await parseActivityFile('ride.gpx', new TextEncoder().encode(GPX));
    expect(activity.sport).toBe('cycling');
    expect(activity.durationMin).toBe(45);
    expect(activity.distanceKm).toBeCloseTo(2, 1);
  });

  it('rejects unknown formats', async () => {
    await expect(parseActivityFile('notes.txt', new TextEncoder().encode('hallo'))).rejects.toThrow(
      'Dateiformat nicht erkannt',
    );
  });

  it('keeps one activity per start time', async () => {
    const fit = await parseActivityFile('run.fit', buildFit());
    const tcx = await parseActivityFile('run.tcx', new TextEncoder().encode(TCX));
    expect(dedupeActivities([...fit, ...tcx])).toHaveLength(1);
  });
});
