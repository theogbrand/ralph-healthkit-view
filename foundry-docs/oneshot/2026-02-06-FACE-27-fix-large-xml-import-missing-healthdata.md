# Oneshot: Fix large XML import "Missing HealthData root element" error

**Issue**: FACE-27
**Date**: 2026-02-06
**Status**: Complete

## What Was Done

Fixed the "Invalid Apple Health export: Missing HealthData root element" error that occurred when uploading large (1GB+) Apple Health XML exports. The root cause was that the import route buffered the entire file in memory via `request.formData()` + `file.arrayBuffer()` + `Buffer.from()`, creating multiple copies of the data that could exceed the V8 heap limit (~4.2GB). For a 1.3GB file, this required ~3.9GB just for file handling, leaving almost no room for parsing. When memory was exhausted, the parser received empty/truncated data and failed to find the `<HealthData>` root element.

### Root Cause

The previous streaming parser fix (from the first pass on FACE-27) correctly replaced DOM-based parsing with SAX streaming, but the upload pipeline still loaded the entire file into memory before parsing:

1. `request.formData()` — buffers entire request body
2. `file.arrayBuffer()` — creates ArrayBuffer copy (~1.3GB)
3. `Buffer.from(arrayBuffer)` — creates Buffer copy (~1.3GB)
4. `Readable.push(entireBuffer)` — pushes entire buffer at once into stream

For a 1.3GB XML file, this creates ~3.9GB of in-memory copies, exceeding the default V8 heap limit.

### Fix

1. **Replaced `request.formData()` with `busboy`** for streaming multipart parsing. The file stream is piped directly from the HTTP request to the SAX parser with no intermediate buffering.
2. **Updated `parseAppleHealthXML()` to accept `Buffer | Readable`** — when a Readable stream is provided, it pipes directly to the SAX parser. When a Buffer is provided (for ZIP extraction), it chunks the buffer in 64KB increments instead of pushing all at once.
3. **Removed misleading "up to 100MB" text** from the upload UI since the app now supports arbitrary file sizes.

## Files Changed

- `src/app/api/import/route.ts` — Rewrote POST handler to use busboy for streaming multipart parsing. XML files are streamed directly to the parser. ZIP files are still buffered (required for random access) with a 500MB limit.
- `src/lib/parsers/xml-parser.ts` — Updated `parseAppleHealthXML()` to accept `Buffer | Readable`. Added chunked buffer reading (64KB chunks) instead of single push.
- `src/components/import/FileUpload.tsx` — Removed "up to 100MB" size limit text.
- `package.json` / `package-lock.json` — Added `busboy` and `@types/busboy` dependencies.

## Verification

- TypeScript: PASS
- Lint: PASS (0 errors, 4 pre-existing warnings)
- Tests: PASS (37/37)
- Build: PASS

## Notes

- ZIP files still require buffering (ZIP format needs random-access decompression), capped at 500MB
- The streaming approach means memory usage for XML imports is now O(batch_size) instead of O(file_size)
- The `sax` parser in strict mode will error on unknown XML entities in the DTD — this could be an issue with some Apple Health exports that have malformed DTDs (known iOS 16 issue). A follow-up ticket may be needed if users report XML parse errors.
