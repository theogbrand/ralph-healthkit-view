/**
 * Import API Route
 *
 * Handles Apple Health data upload and import into SQLite database.
 * Uses busboy for streaming multipart parsing to handle large files (1GB+)
 * without buffering the entire file in memory.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import busboy from 'busboy';
import {
  parseAppleHealthXML,
  extractHealthXMLFromZip,
} from '@/lib/parsers/xml-parser';
import {
  mapRecordsToDatabase,
  mapWorkoutsToDatabase,
} from '@/lib/parsers/data-mapper';
import { insertRecordsBatch, insertWorkoutsBatch } from '@/lib/db/queries';

export const runtime = 'nodejs';

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

function errorResponse(message: string, error: string, status: number): NextResponse<ImportResponse> {
  return NextResponse.json({ success: false, message, error }, { status });
}

/**
 * Parse a streaming XML upload by piping the file stream directly to the SAX parser.
 */
async function parseStreamingXML(
  fileStream: Readable,
  onBatch: (records: Parameters<NonNullable<import('@/lib/parsers/xml-parser').ParseOptions['onBatch']>>[0], workouts: Parameters<NonNullable<import('@/lib/parsers/xml-parser').ParseOptions['onBatch']>>[1]) => void
) {
  return parseAppleHealthXML(fileStream, { batchSize: 1000, onBatch });
}

/**
 * Collect a readable stream into a Buffer (for ZIP files which need random access).
 */
function collectStream(stream: Readable, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    stream.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        stream.destroy();
        reject(new Error(`ZIP file exceeds maximum size of ${Math.round(maxBytes / (1024 * 1024))}MB`));
        return;
      }
      chunks.push(chunk);
    });
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * POST /api/import
 *
 * Upload and import Apple Health export data.
 * Accepts: multipart/form-data with file field.
 * File types: .zip or .xml
 *
 * XML files are streamed directly to the parser without buffering.
 * ZIP files are buffered (needed for random access decompression).
 */
export async function POST(request: NextRequest): Promise<NextResponse<ImportResponse>> {
  const startTime = Date.now();

  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return errorResponse('Invalid request', 'Expected multipart/form-data', 400);
    }

    // Convert Web ReadableStream to Node.js Readable
    if (!request.body) {
      return errorResponse('No body', 'Request body is empty', 400);
    }
    const nodeStream = Readable.fromWeb(request.body as import('stream/web').ReadableStream);

    // Use busboy to parse multipart form data as a stream
    const result = await new Promise<{ parseResult: Awaited<ReturnType<typeof parseAppleHealthXML>>; recordsImported: number; workoutsImported: number }>((resolve, reject) => {
      let fileFound = false;

      const bb = busboy({
        headers: { 'content-type': contentType },
      });

      bb.on('file', (fieldname, fileStream, info) => {
        if (fileFound) {
          fileStream.resume(); // Drain extra files
          return;
        }
        fileFound = true;

        const fileName = (info.filename || '').toLowerCase();
        const isZip = fileName.endsWith('.zip');
        const isXml = fileName.endsWith('.xml');

        if (!isZip && !isXml) {
          fileStream.resume();
          reject(new Error('Please upload a .zip or .xml file'));
          return;
        }

        let recordsImported = 0;
        let workoutsImported = 0;

        const onBatch = (records: Parameters<NonNullable<import('@/lib/parsers/xml-parser').ParseOptions['onBatch']>>[0], workouts: Parameters<NonNullable<import('@/lib/parsers/xml-parser').ParseOptions['onBatch']>>[1]) => {
          if (records.length > 0) {
            const dbRecords = mapRecordsToDatabase(records);
            recordsImported += insertRecordsBatch(dbRecords);
          }
          if (workouts.length > 0) {
            const dbWorkouts = mapWorkoutsToDatabase(workouts);
            workoutsImported += insertWorkoutsBatch(dbWorkouts);
          }
        };

        if (isXml) {
          // Stream XML directly to parser — no buffering
          parseStreamingXML(fileStream, onBatch)
            .then((parseResult) => resolve({ parseResult, recordsImported, workoutsImported }))
            .catch(reject);
        } else {
          // ZIP requires buffering for random-access decompression (limit 500MB)
          const MAX_ZIP_SIZE = 500 * 1024 * 1024;
          collectStream(fileStream, MAX_ZIP_SIZE)
            .then((zipBuffer) => extractHealthXMLFromZip(zipBuffer))
            .then((xmlBuffer) => parseAppleHealthXML(xmlBuffer, { batchSize: 1000, onBatch }))
            .then((parseResult) => resolve({ parseResult, recordsImported, workoutsImported }))
            .catch(reject);
        }
      });

      bb.on('error', reject);

      bb.on('close', () => {
        if (!fileFound) {
          reject(new Error('No file provided. Please upload an Apple Health export file (.zip or .xml)'));
        }
      });

      nodeStream.pipe(bb);
    });

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.recordsImported.toLocaleString()} records and ${result.workoutsImported.toLocaleString()} workouts`,
      stats: {
        recordsImported: result.recordsImported,
        workoutsImported: result.workoutsImported,
        dateRange: result.parseResult.stats.dateRange,
        processingTimeMs: processingTime,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('Please upload') || message.includes('No file') ? 400 : 500;
    return errorResponse(
      status === 400 ? 'Invalid upload' : 'Import failed',
      message,
      status
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
    const { getDb } = await import('@/lib/db/client');
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
