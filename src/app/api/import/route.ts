/**
 * Import API Route
 *
 * Handles Apple Health data upload and import into SQLite database
 * Supports both ZIP files and raw XML files
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  parseAppleHealthXML,
  extractHealthXMLFromZip,
} from '@/lib/parsers/xml-parser';
import {
  mapRecordsToDatabase,
  mapWorkoutsToDatabase,
} from '@/lib/parsers/data-mapper';
import { getDb } from '@/lib/db/client';
import { insertRecordsBatch, insertWorkoutsBatch } from '@/lib/db/queries';

export const runtime = 'nodejs';

// Increase max file size to 100MB for large health exports
export const maxDuration = 300; // 5 minutes for processing large files

interface ImportResponse {
  success: boolean;
  message: string;
  stats?: {
    recordsImported: number;
    workoutsImported: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
    processingTimeMs: number;
  };
  error?: string;
}

/**
 * POST /api/import
 *
 * Upload and import Apple Health export data
 * Accepts: multipart/form-data with file field
 * File types: .zip or .xml
 */
export async function POST(request: NextRequest): Promise<NextResponse<ImportResponse>> {
  const startTime = Date.now();

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'No file provided',
          error: 'Please upload an Apple Health export file (.zip or .xml)',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isZip = fileName.endsWith('.zip');
    const isXml = fileName.endsWith('.xml');

    if (!isZip && !isXml) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid file type',
          error: 'Please upload a .zip or .xml file',
        },
        { status: 400 }
      );
    }

    // Read file as Buffer — never convert to string
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let xmlBuffer: Buffer;
    try {
      xmlBuffer = isZip ? await extractHealthXMLFromZip(fileBuffer) : fileBuffer;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to extract XML',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

    // Parse XML with streaming — insert batches directly into DB
    let recordsImported = 0;
    let workoutsImported = 0;

    let parseResult;
    try {
      parseResult = await parseAppleHealthXML(xmlBuffer, {
        batchSize: 1000,
        onBatch: (records, workouts) => {
          if (records.length > 0) {
            const dbRecords = mapRecordsToDatabase(records);
            recordsImported += insertRecordsBatch(dbRecords);
          }
          if (workouts.length > 0) {
            const dbWorkouts = mapWorkoutsToDatabase(workouts);
            workoutsImported += insertWorkoutsBatch(dbWorkouts);
          }
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to parse XML',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${recordsImported.toLocaleString()} records and ${workoutsImported.toLocaleString()} workouts`,
      stats: {
        recordsImported,
        workoutsImported,
        dateRange: parseResult.stats.dateRange,
        processingTimeMs: processingTime,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Import failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/import
 *
 * Get import status and database statistics
 */
export async function GET(): Promise<NextResponse> {
  try {
    const db = getDb();

    const recordCount = db.prepare('SELECT COUNT(*) as count FROM records').get() as {
      count: number;
    };

    const workoutCount = db.prepare('SELECT COUNT(*) as count FROM workouts').get() as {
      count: number;
    };

    const dateRange = db
      .prepare(
        `SELECT
          MIN(start_date) as earliest,
          MAX(start_date) as latest
        FROM records`
      )
      .get() as { earliest: string | null; latest: string | null };

    return NextResponse.json({
      success: true,
      stats: {
        totalRecords: recordCount.count,
        totalWorkouts: workoutCount.count,
        dateRange: dateRange.earliest && dateRange.latest ? dateRange : null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
