This is a strong MVP shape. Given what you’ve built, the highest-leverage next steps are mostly making it feel “instant” and “trustworthy” for dev loops, and hardening the offline/online split so you never get surprise fetches or “works on my machine” drift.

1) Put everything behind a single “capabilities” layer

Make one module that owns:

db (duckdb instance + attach/ingest)

store (fireproof)

net (optional sync + optional remote parquet)

Then the UI never calls DuckDB/Fireproof/fetch directly—only that layer. It pays off immediately because you can:

swap offline vs online implementations cleanly

enforce “no network” mode centrally

log every operation uniformly (for debugging + reproducibility)

A simple pattern: capabilities = { db, store, net, mode } where mode is offline|online|offline+net.

2) Make “no network” provable, not aspirational

Even with bundled WASM + worker, the two common places accidental network happens are:

duckdb-wasm extension autoloads

“remote parquet” code paths being invoked implicitly (e.g., a user types a URL and it tries to read it)

Two practical hardening moves:

Explicit network gate: wrap fetch once at startup when in offline mode:

allow only blob: / data: / file: (if needed)

block http(s): with a clear error message

DuckDB asset resolver locked down: if you provide any “locateFile / resolve” hooks (or equivalent in your init), ensure they only resolve to embedded bytes.

That gives you confidence that “offline means offline.”

3) Turn query history into a reproducible “run log”

Right now query history is likely “nice UX.” For dev/data teams, the killer feature is when it becomes:

timestamp

SQL text

parameters (if any)

dataset fingerprint (see below)

runtime + rows returned

error stack (if failed)

optional “saved result sample” (first N rows) for quick diffs

Store that as Fireproof docs. Then you can:

export a bug report bundle (“here’s the exact run that failed”)

diff runs across datasets/snapshots

implement “re-run last N” reliably

4) Add dataset fingerprinting (small change, huge clarity)

For every ingestion/attach, compute a lightweight identity and show it in the UI (and store it with every run):

for local files: filename + size + modified time + a fast hash of the first/last ~1–4MB

for remote parquet: URL + ETag/Last-Modified (if available) + optional sampled hash

This solves a constant pain point: “Which extract am I actually looking at?”

5) Make hot reload real with a tiny “model layer”

Without recreating dbt, you can get 80% of the “DuckDB local modeling” feel by adding just:

named models: model(name) = SQL

a CREATE OR REPLACE VIEW model__name AS (...) convention

invalidation: when a model changes, mark downstream models “dirty”

a “Run model” button + “Run downstream” button

Persist models in Fireproof so the workspace is portable. This gives your tool its own “project” concept instead of being just a SQL scratchpad.

6) Separate “ingest” from “attach” (performance + UX)

For Parquet/Arrow, you often don’t want to copy data into DuckDB immediately. A clean split:

Attach: register files / create views over them

Ingest: materialize into DuckDB tables (optional, explicit)

Default to attach + sample queries. Let users “Promote to table” only when they need repeated fast scans.

7) Remote Parquet reads: make it deliberately opt-in

Since remote reads reintroduce CORS + origin issues, keep it behind:

a toggle (“Enable remote reads”)

and a visible base URL allowlist (even if it’s just “only these domains”)

This prevents surprising behavior in the offline build and makes security reviewers happier.

8) Cloudflare sync: keep it as “artifact transport,” not “database”

You already have the right instinct (snapshot push/pull only). I’d push it further:

sync workspace artifacts (models, saved queries, run logs, small result samples)

treat “data snapshots” as immutable blobs with a manifest

never let the tool become dependent on sync for core functionality

That keeps the inner loop fast and avoids backend creep.

If you implement only two things next, I’d do:

Reproducible run log (with dataset fingerprint)

Tiny model layer with CREATE OR REPLACE VIEW + downstream invalidation

Those two make it feel like a real internal dev tool, not a neat demo.
