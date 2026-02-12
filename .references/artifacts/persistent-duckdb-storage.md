# Persistent DuckDB Storage Exploration

## Objective
Enable true local-first persistence for DuckDB tables so data survives browser reloads in both build modes:
- `build:single` (offline, self-contained HTML)
- `build:multi` (online, multi-file assets)

## Current Behavior
- App metadata (query history, saved queries, run log, models) persists in `localStorage`.
- DuckDB runtime data is session-scoped and rebuilt after reload.
- Both build modes run the same app logic, but runtime assets are delivered differently.

## Constraints
- Browser-only runtime; no backend required.
- Preserve existing single-file and multi-file build workflows.
- Keep implementation compact and understandable inside current `index.html` architecture.
- Avoid introducing network dependency for persistence.

## Storage Candidate
- Use DuckDB wasm local browser-backed storage via a named persistent database path.
- Keep metadata in existing `localStorage` keys.
- Use one stable DB identifier (for example `drigo.duckdb`) so both modes intentionally target the same logical DB namespace when same-origin.

## Behavior Expectations
- User-created/imported tables persist across page reloads.
- Existing metadata persistence remains unchanged.
- App startup should open or create the persistent database automatically.
- If persistent storage is unavailable in a browser context, app should degrade gracefully and continue with in-memory DuckDB while showing status.

## Risks / Edge Cases
- Browser origin scoping still applies: storage is shared only within same protocol+host+port.
- Storage quotas and private/incognito mode may reduce persistence reliability.
- Existing in-memory-only assumptions in UX/status messaging may need updates.

## Validation Notes
- Manual checks:
  1. Import data, reload page, verify table still queryable.
  2. Confirm behavior in both `build:single` and `build:multi`.
  3. Confirm graceful fallback when persistent storage is blocked.
