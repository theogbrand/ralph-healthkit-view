# Implementation Plan: Streaming XML parser for large Apple Health imports

**Issue**: FACE-27
**Date**: 2026-02-06
**Research**: `foundry-docs/research/2026-02-06-FACE-27-large-xml-import-string-limit.md`
**Specification**: N/A
**Status**: Implementation Complete

## Overview

Replace the DOM-based `fast-xml-parser` with the streaming SAX parser `sax` to eliminate the V8 string length limit error when importing large Apple Health XML exports. The new parser will process XML as a stream, emitting records incrementally and inserting them into the DB in batches — never loading the full XML into a single string. The ZIP extraction will also be refactored to stream the buffer through the SAX parser without converting to a string.

## Success Criteria

- [x] Full Apple Health XML exports (500MB+) import without "Cannot create a string longer than 0x1fffffe8 characters" error
- [x] Small XML files continue to import correctly with identical DB results
- [x] ZIP files continue to import correctly
- [x] Type check passes: `npx tsc --noEmit`
- [x] Lint passes: `npm run lint`
- [x] Build passes: `npm run build`

## Phases

### Phase 1: Add `sax` dependency

**Goal**: Install the streaming XML parser library.

**Changes**:
- `package.json`: Add `sax` (^1.4.4) to dependencies, `@types/sax` (^1.2.7) to devDependencies

**Verification**:
```bash
npm install sax @types/sax
npx tsc --noEmit
```

### Phase 2: Rewrite `xml-parser.ts` with streaming SAX parser

**Goal**: Replace the `fast-xml-parser` DOM parsing with `sax` streaming parser. The new parser accepts a `Buffer` (or `Readable` stream) instead of a `string`, processes `<Record>` and `<Workout>` elements via SAX events, and calls a batch callback to insert records incrementally.

**Changes**:
- `src/lib/parsers/xml-parser.ts`: Full rewrite of the core parsing logic

**New interface design**:

```typescript
// The new parser signature — accepts Buffer, streams internally
export async function parseAppleHealthXML(
  input: Buffer,
  options: ParseOptions = {}
): Promise<ParseResult>
```

The function internally creates a `Readable` stream from the Buffer and pipes it through a `sax` stream parser. As `<Record>` and `<Workout>` open-tags are encountered (Apple Health uses self-closing tags with attributes only), the SAX `onopentag` handler extracts the attributes, maps them to `ParsedHealthRecord` / `ParsedWorkout`, and accumulates them in a batch array. When the batch reaches `batchSize` (default 1000), the `onBatch` callback is invoked to flush to DB.

**Key implementation details**:

1. **SAX event handling**: Apple Health `<Record>` and `<Workout>` elements are self-closing (`<Record type="..." value="..." />`). The `sax` parser fires `onopentag` for these with all attributes available. No need to handle text content or closing tags for these elements.

2. **Attribute access**: `sax` exposes attributes as `tag.attributes` (an object keyed by attribute name without prefix). The current code reads `record['@_type']` etc. — the new code reads `tag.attributes.type` directly.

3. **`extractHealthXMLFromZip`**: Change to return a `Buffer` instead of `string`. Simply remove the `.toString('utf8')` call — `adm-zip`'s `getData()` already returns a Buffer.

4. **`validateAppleHealthXML`**: Remove this function entirely. Streaming validation happens naturally during SAX parsing — if `<HealthData>` is never encountered, we throw. String-based validation is incompatible with the streaming approach.

5. **Deduplication in streaming**: Records are deduplicated in-memory using a `Set` of composite keys (same logic as `data-mapper.ts`'s `deduplicateRecords`), flushing batches to DB with `INSERT OR IGNORE` (which handles cross-batch duplicates at the DB level).

6. **Stats accumulation**: `dateRange`, `recordTypeCounts`, and totals are accumulated incrementally as records stream through — no change to the `ParseResult.stats` shape.

7. **`ParseOptions` extension**: Add an optional `onBatch` callback:
```typescript
export interface ParseOptions {
  onProgress?: (processed: number, total: number) => void;
  onBatch?: (records: ParsedHealthRecord[], workouts: ParsedWorkout[]) => void;
  batchSize?: number;
}
```

**Verification**:
```bash
npx tsc --noEmit
npm run lint
```

### Phase 3: Update API route to use Buffer-based pipeline

**Goal**: Remove all string conversions from the import route. Pass Buffers directly to the parser and use the `onBatch` callback for incremental DB insertion.

**Changes**:
- `src/app/api/import/route.ts`: Refactor the POST handler

**Key changes**:

1. **Remove string conversion**: Instead of `fileBuffer.toString('utf8')`, pass `fileBuffer` directly to parser.
2. **Remove `validateAppleHealthXML` call**: Validation happens during streaming parse.
3. **Move DB insertion into `onBatch` callback**: Instead of parsing all → mapping all → deduplicating all → inserting all, the route passes an `onBatch` callback that maps + inserts each batch immediately:

```typescript
let recordsImported = 0;
let workoutsImported = 0;
const db = getDb();

const parseResult = await parseAppleHealthXML(xmlBuffer, {
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
```

4. **Remove in-memory deduplication calls**: `deduplicateRecords` and `deduplicateWorkouts` are no longer needed — `INSERT OR IGNORE` in the DB handles duplicates. This also eliminates the large in-memory arrays.

5. **Update `extractHealthXMLFromZip` call**: Now returns `Buffer`, no type change needed at call site since we pass Buffer to parser.

6. **Response**: Stats come from `parseResult.stats` (accumulated during streaming) plus the `recordsImported`/`workoutsImported` counters from batch callbacks.

**Verification**:
```bash
npx tsc --noEmit
npm run lint
npm run build
```

### Phase 4: Clean up unused dependencies

**Goal**: Remove `fast-xml-parser` since it's no longer used.

**Changes**:
- `package.json`: Remove `fast-xml-parser` from dependencies

**Verification**:
```bash
npm install
npx tsc --noEmit
npm run build
```

## Testing Strategy

No automated test suite exists for the parser. Manual testing:

1. **Small XML file**: Create a small test XML (~10 records) and verify import produces correct DB records
2. **ZIP file**: Verify ZIP extraction + streaming parse works end-to-end
3. **Build verification**: `npm run build` confirms no compilation errors
4. **Type check**: `npx tsc --noEmit` confirms type safety

The `INSERT OR IGNORE` strategy for deduplication is already proven by the existing `queries.ts` implementation — the DB schema has UNIQUE constraints that handle duplicates.

## Rollback Plan

All changes are on the `foundry/FACE-27` branch. To rollback:
```bash
git checkout main
```
The branch can be deleted if the approach is abandoned. `fast-xml-parser` remains in `main`'s `package.json`.

## Notes

- **Why not replace `adm-zip`?**: The ZIP file itself is typically <100MB (the compressed size). The problem is the *decompressed* XML string. By returning a `Buffer` from `extractHealthXMLFromZip` instead of a `string`, we avoid the V8 string limit. The Buffer is then streamed through SAX without ever becoming a string. If ZIP files themselves exceed memory limits in the future, `yauzl` (streaming ZIP) can be swapped in as a follow-up.
- **`ParseResult` contract**: The `ParseResult` type and its `records`/`workouts` arrays will still be populated (for stats), but when `onBatch` is provided, the arrays in the return value will be empty (records are flushed to DB via callback, not accumulated). The `stats` field remains fully populated.
- **Progress callback**: With streaming, we don't know total record count upfront. The `onProgress` callback will report `(processedCount, 0)` where total is 0 (unknown). The frontend already uses a simulated progress bar, so this is fine.
- **Memory profile**: Peak memory drops from O(file_size * 3) (buffer + string + DOM tree) to O(file_size + batch_size) (buffer + current batch). For a 1GB XML, this means ~1GB + ~1MB instead of ~3GB.
