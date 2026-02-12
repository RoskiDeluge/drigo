## Context
Drigo currently persists workflow metadata in `localStorage` but does not persist DuckDB relational data across reloads. This proposal introduces persistent DuckDB runtime storage while keeping the app browser-only and preserving both single-file offline and multi-file online build modes.

## Goals / Non-Goals
- Goals:
- Persist DuckDB tables across reloads in supported browser contexts.
- Use one stable database identifier so both build modes share the same logical database when running under the same origin.
- Preserve current `localStorage` metadata behavior.
- Non-Goals:
- Cross-origin or cross-device synchronization.
- Backend or cloud persistence services.
- Data migration tooling beyond opening an existing named local database.

## Decisions
- Decision: Use a named persistent DuckDB database during initialization.
- Rationale: Delivers local-first persistence without changing deployment architecture.

- Decision: Keep metadata stores in `localStorage` as-is.
- Rationale: Existing UX features already rely on these keys and they are orthogonal to relational table persistence.

- Decision: Use graceful fallback to in-memory mode if persistent storage initialization fails.
- Rationale: Keeps app usable in private/incognito or restricted environments.

## Risks / Trade-offs
- Origin-scoped storage means users only share state between builds if protocol+host+port match.
- Persistent storage can fail due to browser quotas or privacy mode.
- Some users may assume persistence across all browser contexts; status messaging must clarify active mode.

## Migration Plan
1. Update DuckDB startup path to attempt persistent initialization first.
2. If persistent init fails, continue with in-memory initialization and set an error/warning status.
3. Verify both build outputs still run with identical persistence logic.

## Open Questions
- Should the UI expose a "storage mode" badge (persistent vs memory) beyond the status line?
