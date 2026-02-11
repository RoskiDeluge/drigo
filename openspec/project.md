# Project Context

## Purpose
Drigo is a minimal, local-first DuckDB workbench for fast data exploration in the browser.
The main goal is to keep setup and runtime friction very low:
- Open one HTML file and run SQL locally.
- Import CSV/Parquet/JSON files without a backend.
- Keep useful state (history, saved queries, model definitions, run logs) in browser localStorage.
- Support both online CDN loading and offline-ready distribution builds.

## Tech Stack
- Frontend: vanilla HTML, CSS, and JavaScript (single-page app in `index.html`)
- Database engine: `@duckdb/duckdb-wasm` running fully in-browser
- Build tooling: Node.js ESM scripts + `esbuild`
- Package manager/runtime: npm + Node.js
- Browser APIs: Web Workers, Web Crypto (`crypto.subtle`), File API, localStorage
- Optional CDN runtime dependencies:
  - DuckDB WASM assets from jsDelivr (online fallback)
  - Apache Arrow import map entry from jsDelivr

## Project Conventions

### Code Style
- Keep implementation simple and colocated in `index.html` unless complexity clearly requires extraction.
- Use modern JavaScript with `const`/`let`, `async`/`await`, and small focused functions.
- Prefer descriptive camelCase names for variables/functions and DOM ids.
- Keep UI and logic straightforward: direct DOM access (`getElementById`) and explicit event handlers.
- Use early returns for guard checks (for example, when DuckDB connection is not ready).
- Keep SQL strings readable and explicit; sanitize user-derived identifiers before interpolation (for example, table/model names).
- Use 2-space indentation and semicolons, matching the existing files.

### Architecture Patterns
- Single-file app architecture:
  - `index.html` contains markup, styles, and module script.
  - No framework/state library; state is managed with local variables + localStorage.
- Runtime boot path:
  - Attempt inlined/bundled DuckDB module first (`window.__DRIGO_DUCKDB_MODULE__` or URL globals).
  - Fallback to CDN-hosted DuckDB module for online use.
- Data flow:
  - File import registers buffers in DuckDB and creates/replaces tables by file extension.
  - Query execution renders tabular results directly to DOM.
- Local-first persistence:
  - Query history, saved queries, run log, and models are stored in localStorage keys prefixed with `drigo.`.
- Lightweight model system:
  - Models are stored as SQL snippets.
  - Dependencies are inferred via `model__<name>` references and executed using a topological pass for downstream runs.

### Testing Strategy
- Current state: no automated test suite is configured.
- Validation is primarily manual:
  - Load app in browser
  - Initialize DuckDB
  - Import sample/file data
  - Run queries and verify table rendering
  - Save/run models and run downstream models
  - Verify localStorage persistence/reset behavior
- Build scripts are validated by running:
  - `npm run build:single`
  - `npm run build:multi`

### Git Workflow
- Repository currently uses lightweight, pragmatic commits with short messages (not strict Conventional Commits).
- Default expectation:
  - Use small, focused commits per change.
  - Keep behavior changes and refactors separated when practical.
  - Update README/OpenSpec docs when project behavior or workflow changes.
- Branching strategy is not formally documented in-repo; assume simple feature-branch + merge workflow unless specified otherwise.

## Domain Context
- Drigo is a local analytics/query workbench, not a multi-user platform.
- It is intended for exploration and prototyping, especially for tabular data files.
- "Models" represent saved SQL views with dependency awareness, similar to lightweight transformation nodes.
- Run logs include query metadata (runtime, sample rows, dataset fingerprint) to support iterative analysis in one browser context.

## Important Constraints
- Must run entirely client-side with no required backend service.
- Should remain easy to run as a single HTML file for local experimentation.
- Browser security constraints apply (for example `file://` can block worker behavior; local server is recommended).
- Large datasets are bounded by browser memory/performance limits of DuckDB WASM and the host device.
- Persistence scope is per-browser/per-origin localStorage; no cross-device sync by default.

## External Dependencies
- npm package: `@duckdb/duckdb-wasm`
- npm package: `esbuild`
- CDN (runtime fallback): jsDelivr for DuckDB module and Arrow ESM import
- Browser platform APIs:
  - Web Workers
  - Web Crypto
  - File API
  - localStorage
