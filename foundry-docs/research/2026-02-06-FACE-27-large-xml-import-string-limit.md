# Research: Large Apple Health XML import fails with V8 string limit error

**Issue**: FACE-27
**Date**: 2026-02-06
**Status**: Complete

## Summary

Uploading full Apple Health XML exports fails with "Cannot create a string longer than 0x1fffffe8 characters". The current parser loads the entire XML file into a single string before parsing with `fast-xml-parser` (DOM-based), hitting V8's ~512MB string length limit. The fix requires switching to a streaming/SAX XML parser that processes data in chunks.

## Requirements Analysis

- Small XML files import successfully — the parsing and DB insertion pipeline works correctly
- Full Apple Health exports (often 100MB–2GB uncompressed) fail with V8 string limit error
- The UI advertises support for files "up to 100MB", but a 100MB ZIP can decompress to 1GB+ of XML
- The error surfaces as: `Error: Cannot create a string longer than 0x1fffffe8 characters`

**Success criteria**: A user can upload their full Apple Health export (ZIP or XML, up to realistic sizes) and have it import successfully without memory errors.

## Codebase Analysis

### Relevant Files

- `src/lib/parsers/xml-parser.ts` — Core parser; receives entire XML as a `string` parameter, uses `fast-xml-parser` (DOM-based). Also handles ZIP extraction via `adm-zip`. This file claims to use "streaming" in its doc comment but does not.
- `src/app/api/import/route.ts` — API route; reads file into Buffer, converts to string, calls parser. Three string-heavy operations: `file.arrayBuffer()` → `Buffer` → `string` → `fast-xml-parser` DOM tree.
- `src/components/import/FileUpload.tsx` — Client-side upload component; sends FormData via fetch. No issues here.
- `src/lib/parsers/data-mapper.ts` — Maps parsed records/workouts to DB schema. Receives arrays of objects, no string-size issue. Will need minor interface changes if streaming parser emits records incrementally.
- `src/lib/db/queries.ts` — Batch insert helpers. Already supports batched writes.
- `next.config.ts` — Empty config; no body size limit configured.

### Root Cause Chain

1. **ZIP extraction** (`extractHealthXMLFromZip`): `adm-zip` loads the full entry into a Buffer, then `.toString('utf8')` creates the massive string. For a 1GB XML inside a ZIP, this alone hits the V8 limit.
2. **Raw XML upload**: `fileBuffer.toString('utf8')` on route.ts:96 creates the string.
3. **XML parsing** (`parseAppleHealthXML`): `fast-xml-parser` receives the entire string and builds a full DOM tree in memory, doubling memory usage.
4. **Post-parse arrays**: The parsed records/workouts are accumulated into large arrays before DB insertion.

### Existing Patterns

- Batch processing is already used for DB inserts (1000 records at a time)
- Progress callback pattern exists (`onProgress`) but only works post-parse
- The parser interface (`parseAppleHealthXML(xmlContent: string)`) is consumed only by the API route

### Dependencies

- `fast-xml-parser` v5.3.4 — DOM-only parser, **cannot** do streaming
- `adm-zip` v0.5.16 — Loads full ZIP entries into memory
- No existing streaming XML dependency in the project

## Implementation Considerations

### Approach: Streaming SAX Parser

Replace `fast-xml-parser` with a SAX/streaming XML parser. The recommended approach:

1. **Streaming XML parser**: Use `sax` (mature, well-tested) or `saxophone` (modern, lightweight). These emit events per-element without building a DOM tree, keeping memory usage constant regardless of file size.

2. **Stream the input**: Instead of converting Buffer→string, pipe a Readable stream directly into the SAX parser. For ZIP files, use a streaming unzip library (e.g., `yauzl` which supports streaming) instead of `adm-zip` which loads everything into memory.

3. **Process records incrementally**: As the SAX parser emits `<Record>` and `<Workout>` elements, map them to DB schema and insert in batches immediately, rather than accumulating all records first.

4. **API route changes**: Read the uploaded file as a stream (or chunked buffer) rather than converting to a single string. Pass the stream to the new parser.

### Architecture Decision: Which streaming parser?

| Library | Pros | Cons |
|---------|------|------|
| `sax` | Mature, well-tested, widely used | Older API style, callback-based |
| `saxophone` | Modern, event-driven, lightweight | Smaller community |
| `sax-wasm` | Very fast (Rust/WASM) | WASM binary dependency |

**Recommendation**: `sax` — it's the most battle-tested for large files and has excellent Node.js stream integration.

### ZIP Handling

`adm-zip` loads everything into memory. Options:
- **`yauzl`**: Streaming ZIP extraction, well-maintained
- **`unzipper`**: Stream-based, simpler API
- Alternative: Keep `adm-zip` but stream the extracted buffer through the SAX parser without converting to string (partial fix — still loads full buffer in memory but avoids the string limit)

### Risks

- **Interface changes**: The `parseAppleHealthXML(xmlContent: string)` signature needs to change to accept a stream. This affects the API route.
- **Error handling**: Streaming parsers emit errors asynchronously; need robust error handling for malformed XML mid-stream.
- **Progress tracking**: Harder to calculate progress with streaming (don't know total record count upfront). Can track bytes processed vs total file size instead.
- **Memory for ZIP**: Even with a streaming XML parser, `adm-zip` still loads the full ZIP into memory. For very large ZIPs, may need `yauzl`.
- **Testing**: No existing test suite to verify regression. Manual testing with large files needed.

### Testing Strategy

1. Test with small XML file (existing functionality, should still work)
2. Test with medium XML file (~50MB) to verify streaming works
3. Test with large XML file (500MB+) to verify no memory errors
4. Test with ZIP containing large XML
5. Test with malformed XML to verify error handling
6. Verify DB records are identical to current parser output for the same input

## Specification Assessment

This is a **backend infrastructure change** with no user-facing UX modifications. The import page UI, upload flow, and success/error feedback remain identical. The fix is entirely in the server-side parsing pipeline.

**Needs Specification**: No

## Questions for Human Review

1. **File size limit**: Should the 100MB upload limit be increased, or should we document that users should upload the ZIP (which is much smaller than raw XML)?
2. **ZIP handling priority**: Should we also replace `adm-zip` with a streaming alternative (`yauzl`), or is fixing the XML parsing enough for now? (The ZIP itself is usually <100MB; the issue is the decompressed XML string.)
3. **Progress reporting**: Current progress callback won't work the same way with streaming. Is approximate progress (bytes-based) acceptable?

## Next Steps

Ready for planning phase. Key decisions needed:
- Which streaming XML library to use
- Whether to also replace `adm-zip` with streaming ZIP extraction
- Batch size and memory budget for streaming inserts
