# DuckDB Snapshot Export/Import Ideas

## Objective
Capture lightweight ideas for sharing local-first state between trusted teammates by moving database state across machines.

## Why
- Current offline `index.html` is self-contained for code/assets, not persisted OPFS data.
- Team collaboration needs a way to move DuckDB state intentionally.

## Proposed Scope (Phase 1)
- Add `Export Snapshot` action to download current DuckDB database as a `.duckdb` file.
- Add `Import Snapshot` action to upload a `.duckdb` file and replace local persisted DB.
- Keep existing localStorage metadata behavior unchanged for first pass.

## UX Notes
- Export flow:
  - Ensure latest state is flushed (`CHECKPOINT`).
  - Download file named like `drigo-snapshot-YYYYMMDD-HHMM.duckdb`.
- Import flow:
  - Confirm destructive replace prompt.
  - Close active connection, replace DB file, reopen connection, show status.
  - Offer optional page reload after successful import.

## Implementation Sketch
- Persistent DB path currently: `opfs://drigo.duckdb`.
- Export:
  - Run `CHECKPOINT`.
  - Use DuckDB wasm file copy/read APIs to get bytes.
  - Create blob + download link.
- Import:
  - Read uploaded file bytes.
  - Write/replace file at `opfs://drigo.duckdb`.
  - Reinitialize DuckDB connection.

## Risks / Edge Cases
- Import overwrite can destroy current local data; require explicit confirmation.
- Browser storage quota or OPFS restrictions can fail write/read operations.
- Need robust reconnect handling to avoid stale worker/connection state.
- Snapshot portability may vary by DuckDB version compatibility.

## Follow-on (Phase 2)
- Export/import full workspace bundle:
  - DuckDB snapshot
  - `drigo.*` localStorage metadata (queries, models, run log)
- Bundle format could be zip with manifest for future compatibility.
