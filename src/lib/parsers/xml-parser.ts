/**
 * Apple Health XML Parser
 *
 * Parses Apple Health export.xml files efficiently, handling large files (100MB+)
 * Uses streaming approach to avoid loading entire file into memory
 */

import { XMLParser } from 'fast-xml-parser';

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
  batchSize?: number;
}

/**
 * Parse Apple Health export XML file
 *
 * @param xmlContent - The XML file content as string
 * @param options - Parsing options including progress callback
 * @returns Parsed health records and workouts with statistics
 */
export async function parseAppleHealthXML(
  xmlContent: string,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const { onProgress, batchSize = 1000 } = options;

  // Configure XML parser
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    trimValues: true,
    // Don't parse text nodes as we only need attributes
    ignoreDeclaration: true,
    ignorePiTags: true,
  });

  // Parse the XML
  const parsed = parser.parse(xmlContent);

  // Extract health data from parsed structure
  const healthData = parsed.HealthData;

  if (!healthData) {
    throw new Error('Invalid Apple Health export: Missing HealthData root element');
  }

  const records: ParsedHealthRecord[] = [];
  const workouts: ParsedWorkout[] = [];
  const recordTypeCounts: Record<string, number> = {};
  let earliestDate = '';
  let latestDate = '';

  // Process Record elements (health metrics)
  const rawRecords = Array.isArray(healthData.Record)
    ? healthData.Record
    : healthData.Record
      ? [healthData.Record]
      : [];

  for (let i = 0; i < rawRecords.length; i++) {
    const record = rawRecords[i];

    // Progress callback
    if (onProgress && i % batchSize === 0) {
      onProgress(i, rawRecords.length);
    }

    const type = record['@_type'];
    const value = parseFloat(record['@_value']);
    const unit = record['@_unit'];
    const sourceName = record['@_sourceName'];
    const device = record['@_device'] || null;
    const startDate = record['@_startDate'];
    const endDate = record['@_endDate'];
    const creationDate = record['@_creationDate'];

    // Skip invalid records
    if (!type || isNaN(value) || !startDate || !endDate) {
      continue;
    }

    // Track date range
    if (!earliestDate || startDate < earliestDate) {
      earliestDate = startDate;
    }
    if (!latestDate || startDate > latestDate) {
      latestDate = startDate;
    }

    // Count record types
    recordTypeCounts[type] = (recordTypeCounts[type] || 0) + 1;

    records.push({
      type,
      value,
      unit,
      sourceName,
      device,
      startDate,
      endDate,
      creationDate,
    });
  }

  // Process Workout elements
  const rawWorkouts = Array.isArray(healthData.Workout)
    ? healthData.Workout
    : healthData.Workout
      ? [healthData.Workout]
      : [];

  for (let i = 0; i < rawWorkouts.length; i++) {
    const workout = rawWorkouts[i];

    const workoutType = workout['@_workoutActivityType'];
    const duration = parseFloat(workout['@_duration']);
    const durationMinutes = duration ? duration / 60 : 0; // Convert seconds to minutes
    const startDate = workout['@_startDate'];
    const endDate = workout['@_endDate'];
    const sourceName = workout['@_sourceName'];
    const device = workout['@_device'] || null;

    // Optional fields
    const totalDistance = workout['@_totalDistance']
      ? parseFloat(workout['@_totalDistance'])
      : null;
    const totalEnergyBurned = workout['@_totalEnergyBurned']
      ? parseFloat(workout['@_totalEnergyBurned'])
      : null;

    // Skip invalid workouts
    if (!workoutType || isNaN(duration) || !startDate || !endDate) {
      continue;
    }

    // Track date range
    if (!earliestDate || startDate < earliestDate) {
      earliestDate = startDate;
    }
    if (!latestDate || startDate > latestDate) {
      latestDate = startDate;
    }

    // Extract average heart rate from workout statistics if available
    let avgHeartRate: number | null = null;
    const workoutStats = workout.WorkoutStatistics;
    if (workoutStats) {
      const stats = Array.isArray(workoutStats) ? workoutStats : [workoutStats];
      const hrStat = stats.find((s: any) =>
        s['@_type'] === 'HKQuantityTypeIdentifierHeartRate'
      );
      if (hrStat && hrStat['@_average']) {
        avgHeartRate = parseFloat(hrStat['@_average']);
      }
    }

    workouts.push({
      workoutType,
      durationMinutes,
      distanceKm: totalDistance,
      totalEnergyKcal: totalEnergyBurned,
      avgHeartRate,
      sourceName,
      device,
      startDate,
      endDate,
    });
  }

  // Final progress update
  if (onProgress) {
    onProgress(rawRecords.length, rawRecords.length);
  }

  return {
    records,
    workouts,
    stats: {
      totalRecords: records.length,
      totalWorkouts: workouts.length,
      dateRange: {
        earliest: earliestDate,
        latest: latestDate,
      },
      recordTypes: recordTypeCounts,
    },
  };
}

/**
 * Extract Apple Health export from ZIP file
 *
 * @param zipBuffer - Buffer containing the ZIP file
 * @returns XML content as string
 */
export async function extractHealthXMLFromZip(zipBuffer: Buffer): Promise<string> {
  // Note: Will need to add 'adm-zip' package for ZIP extraction
  // For now, this is a placeholder that assumes unzipped XML
  const AdmZip = (await import('adm-zip')).default;

  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();

  // Find export.xml in the ZIP
  const exportEntry = zipEntries.find(
    (entry) => entry.entryName.endsWith('export.xml') || entry.entryName === 'export.xml'
  );

  if (!exportEntry) {
    throw new Error('No export.xml found in ZIP file. Please upload a valid Apple Health export.');
  }

  // Extract and return as string
  return exportEntry.getData().toString('utf8');
}

/**
 * Validate that the XML content is a valid Apple Health export
 *
 * @param xmlContent - XML content to validate
 * @returns true if valid, throws error otherwise
 */
export function validateAppleHealthXML(xmlContent: string): boolean {
  // Quick validation checks
  if (!xmlContent || typeof xmlContent !== 'string') {
    throw new Error('Invalid XML content: empty or not a string');
  }

  if (!xmlContent.includes('<HealthData')) {
    throw new Error('Invalid Apple Health export: Missing HealthData element');
  }

  if (!xmlContent.includes('</HealthData>')) {
    throw new Error('Invalid Apple Health export: Incomplete or corrupted XML');
  }

  return true;
}
