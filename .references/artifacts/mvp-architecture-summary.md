1. Single-file HTML app: UI, logic, and assets bundled into one offline artifact.
2. UI layer: SQL editor, results grid, schema explorer, query history.
3. DuckDB in browser via `duckdb-wasm` for local analytics.
4. WASM + worker embedded (base64 or inline blob) to avoid network fetches.
5. Fireproof embedded for local-first persistence (saved queries, views, small artifacts).
6. Local ingestion: drag/drop Parquet/CSV/NDJSON/Arrow; file picker for extracts.
7. Optional remote reads: HTTP range reads for Parquet when pointing at remote files.
8. Optional Cloudflare sync: snapshot push/pull, not per-query compute.
9. Offline readiness: bundle extensions or avoid features that autoload assets.
10. Data-size strategy: use samples/pre-aggregates, avoid full warehouse extracts in-browser.
