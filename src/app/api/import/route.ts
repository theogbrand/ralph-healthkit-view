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
  validateAppleHealthXML,
} from '@/lib/parsers/xml-parser';
import {
  mapRecordsToDatabase,
  mapWorkoutsToDatabase,
  deduplicateRecords,
  deduplicateWorkouts,
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
    recordsSkipped: number;
    workoutsSkipped: number;
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

    // Read file contents
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Extract XML content
    let xmlContent: string;
    try {
      if (isZip) {
        xmlContent = await extractHealthXMLFromZip(fileBuffer);
      } else {
        xmlContent = fileBuffer.toString('utf8');
      }
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

    // Validate XML
    try {
      validateAppleHealthXML(xmlContent);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Apple Health export',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

    // Parse XML
    let parseResult;
    try {
      parseResult = await parseAppleHealthXML(xmlContent);
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

    // Map to database schema
    const dbRecords = mapRecordsToDatabase(parseResult.records);
    const dbWorkouts = mapWorkoutsToDatabase(parseResult.workouts);

    // Deduplicate before insertion
    const uniqueRecords = deduplicateRecords(dbRecords);
    const uniqueWorkouts = deduplicateWorkouts(dbWorkouts);

    const recordsSkipped = dbRecords.length - uniqueRecords.length;
    const workoutsSkipped = dbWorkouts.length - uniqueWorkouts.length;

    // Insert into database
    const db = getDb();
    let recordsImported = 0;
    let workoutsImported = 0;

    try {
      // Use batch inserts for performance
      const batchSize = 1000;

      // Insert records in batches
      for (let i = 0; i < uniqueRecords.length; i += batchSize) {
        const batch = uniqueRecords.slice(i, i + batchSize);
        recordsImported += insertRecordsBatch(batch);
      }

      // Insert workouts in batches
      for (let i = 0; i < uniqueWorkouts.length; i += batchSize) {
        const batch = uniqueWorkouts.slice(i, i + batchSize);
        workoutsImported += insertWorkoutsBatch(batch);
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to insert data into database',
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
        recordsSkipped,
        workoutsSkipped,
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
