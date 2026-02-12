# Change: Add Persistent DuckDB Storage

## Why
Drigo is positioned as a local-first browser runtime, but DuckDB table data is currently session-scoped. Users lose imported and created tables after reload, which breaks expected local-first behavior.

## What Changes
- Add persistent DuckDB database initialization in the browser runtime.
- Keep existing `localStorage` metadata persistence behavior unchanged.
- Apply the same persistence behavior to both `build:single` and `build:multi`.
- Add graceful fallback to in-memory DuckDB when persistent storage is unavailable.

## Impact
- Affected specs: `duckdb-persistence` (new capability)
- Affected code: `index.html` DuckDB initialization path, status messaging around persistence mode
- Build scripts: no behavioral change required in `scripts/build-single.mjs` and `scripts/build-multi.mjs`

## Reffy References
- `persistent-duckdb-storage.md` - option evaluation, constraints, expected behavior, and fallback criteria for persistent DuckDB runtime state.
- `mvp-architecture-summary.md` - confirms local-first/offline intent and browser-runtime constraints.
