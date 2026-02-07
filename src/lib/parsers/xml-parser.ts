/**
 * Apple Health XML Parser
 *
 * Parses Apple Health export.xml files using a streaming SAX parser to handle
 * large files (1GB+) without hitting V8's string length limit or heap limits.
 */

import { createStream, SAXStream } from 'sax';
import { Readable } from 'stream';

export interface ParsedHealthRecord {
  type: string;
  value: number;
  unit: string;
  sourceName: string;
  device: string | null;
  startDate: string;
  endDate: string;
  creationDate: string | null;
}

export interface ParsedWorkout {
  workoutType: string;
  durationMinutes: number;
  distanceKm: number | null;
  totalEnergyKcal: number | null;
  avgHeartRate: number | null;
  sourceName: string;
  device: string | null;
  startDate: string;
  endDate: string;
}

export interface ParseResult {
  records: ParsedHealthRecord[];
  workouts: ParsedWorkout[];
  stats: {
    totalRecords: number;
    totalWorkouts: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
    recordTypes: Record<string, number>;
  };
}

export interface ParseOptions {
  onProgress?: (processed: number, total: number) => void;
  onBatch?: (records: ParsedHealthRecord[], workouts: ParsedWorkout[]) => void;
  batchSize?: number;
}

/**
 * Parse Apple Health export XML using streaming SAX parser.
 *
 * Accepts a Buffer or a Readable stream. For large files (1GB+), prefer passing
 * a Readable stream to avoid loading the entire file into memory.
 *
 * When `onBatch` is provided, records/workouts are flushed via the callback
 * in batches and the returned `ParseResult.records`/`workouts` will be empty.
 * Stats are always accumulated and returned.
 */
export async function parseAppleHealthXML(
  input: Buffer | Readable,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const { onProgress, onBatch, batchSize = 1000 } = options;

  return new Promise((resolve, reject) => {
    const saxStream: SAXStream = createStream(true, { trim: true });

    // Accumulation state
    let foundHealthData = false;
    const records: ParsedHealthRecord[] = [];
    const workouts: ParsedWorkout[] = [];
    const recordTypeCounts: Record<string, number> = {};
    let earliestDate = '';
    let latestDate = '';
    let totalRecords = 0;
    let totalWorkouts = 0;

    // Batch buffers (used when onBatch is provided)
    let recordBatch: ParsedHealthRecord[] = [];
    let workoutBatch: ParsedWorkout[] = [];

    // Workout parsing state — Workout elements can have WorkoutStatistics children
    let currentWorkout: ParsedWorkout | null = null;

    function updateDateRange(startDate: string) {
      if (!earliestDate || startDate < earliestDate) earliestDate = startDate;
      if (!latestDate || startDate > latestDate) latestDate = startDate;
    }

    function flushBatch() {
      if (onBatch && (recordBatch.length > 0 || workoutBatch.length > 0)) {
        onBatch(recordBatch, workoutBatch);
        recordBatch = [];
        workoutBatch = [];
      }
    }

    function addRecord(record: ParsedHealthRecord) {
      totalRecords++;
      recordTypeCounts[record.type] = (recordTypeCounts[record.type] || 0) + 1;
      updateDateRange(record.startDate);

      if (onBatch) {
        recordBatch.push(record);
        if (recordBatch.length >= batchSize) flushBatch();
      } else {
        records.push(record);
      }

      if (onProgress && totalRecords % batchSize === 0) {
        onProgress(totalRecords, 0);
      }
    }

    function addWorkout(workout: ParsedWorkout) {
      totalWorkouts++;
      updateDateRange(workout.startDate);

      if (onBatch) {
        workoutBatch.push(workout);
        if (workoutBatch.length >= batchSize) flushBatch();
      } else {
        workouts.push(workout);
      }
    }

    saxStream.on('opentag', (tag) => {
      const attrs = tag.attributes as Record<string, string>;

      switch (tag.name) {
        case 'HealthData':
          foundHealthData = true;
          break;

        case 'Record': {
          const type = attrs.type;
          const sourceName = attrs.sourceName;
          const startDate = attrs.startDate;
          const endDate = attrs.endDate;

          if (!type || !startDate || !endDate) break;

          // Category-type records (e.g. SleepAnalysis) have non-numeric values.
          // For sleep, compute duration in hours from start/end dates.
          let value: number;
          let unit: string;
          if (type.startsWith('HKCategoryTypeIdentifier')) {
            const durationMs = new Date(endDate).getTime() - new Date(startDate).getTime();
            value = durationMs / (1000 * 60 * 60); // hours
            unit = 'hr';
            if (isNaN(value) || value <= 0) break;
          } else {
            value = parseFloat(attrs.value);
            unit = attrs.unit;
            if (isNaN(value)) break;
          }

          addRecord({
            type,
            value,
            unit,
            sourceName,
            device: attrs.device || null,
            startDate,
            endDate,
            creationDate: attrs.creationDate || null,
          });
          break;
        }

        case 'Workout': {
          const workoutType = attrs.workoutActivityType;
          const duration = parseFloat(attrs.duration);
          const startDate = attrs.startDate;
          const endDate = attrs.endDate;
          const sourceName = attrs.sourceName;

          if (!workoutType || isNaN(duration) || !startDate || !endDate) break;

          currentWorkout = {
            workoutType,
            durationMinutes: duration / 60,
            distanceKm: attrs.totalDistance ? parseFloat(attrs.totalDistance) : null,
            totalEnergyKcal: attrs.totalEnergyBurned ? parseFloat(attrs.totalEnergyBurned) : null,
            avgHeartRate: null,
            sourceName,
            device: attrs.device || null,
            startDate,
            endDate,
          };
          break;
        }

        case 'WorkoutStatistics': {
          if (!currentWorkout) break;

          if (attrs.type === 'HKQuantityTypeIdentifierHeartRate' && attrs.average) {
            currentWorkout.avgHeartRate = parseFloat(attrs.average);
          }
          if (attrs.type === 'HKQuantityTypeIdentifierActiveEnergyBurned' && attrs.sum) {
            currentWorkout.totalEnergyKcal = parseFloat(attrs.sum);
          }
          if (attrs.type === 'HKQuantityTypeIdentifierDistanceWalkingRunning' && attrs.sum) {
            currentWorkout.distanceKm = parseFloat(attrs.sum);
          }
          break;
        }
      }
    });

    saxStream.on('closetag', (tagName) => {
      if (tagName === 'Workout' && currentWorkout) {
        addWorkout(currentWorkout);
        currentWorkout = null;
      }
    });

    saxStream.on('error', (err) => {
      reject(new Error(`XML parse error: ${err.message}`));
    });

    saxStream.on('end', () => {
      if (!foundHealthData) {
        reject(new Error('Invalid Apple Health export: Missing HealthData root element'));
        return;
      }

      // Flush remaining batch
      flushBatch();

      if (onProgress) {
        onProgress(totalRecords, totalRecords);
      }

      resolve({
        records,
        workouts,
        stats: {
          totalRecords,
          totalWorkouts,
          dateRange: { earliest: earliestDate, latest: latestDate },
          recordTypes: recordTypeCounts,
        },
      });
    });

    // Stream input through the SAX parser
    if (Buffer.isBuffer(input)) {
      // Chunk large buffers to avoid backpressure issues
      const CHUNK_SIZE = 64 * 1024; // 64KB chunks
      const readable = new Readable({
        read() {
          if (offset >= input.length) {
            this.push(null);
            return;
          }
          const end = Math.min(offset + CHUNK_SIZE, input.length);
          this.push(input.subarray(offset, end));
          offset = end;
        },
      });
      let offset = 0;
      readable.pipe(saxStream);
    } else {
      // Pipe Readable stream directly to SAX parser
      input.pipe(saxStream);
    }
  });
}

/**
 * Extract Apple Health export.xml from ZIP file as a Buffer.
 */
export async function extractHealthXMLFromZip(zipBuffer: Buffer): Promise<Buffer> {
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();

  const exportEntry = zipEntries.find(
    (entry) => entry.entryName.endsWith('export.xml') || entry.entryName === 'export.xml'
  );

  if (!exportEntry) {
    throw new Error('No export.xml found in ZIP file. Please upload a valid Apple Health export.');
  }

  return exportEntry.getData();
}
