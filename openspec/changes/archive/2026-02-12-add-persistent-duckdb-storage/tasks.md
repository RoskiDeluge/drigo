## 1. Implementation
- [x] 1.1 Update DuckDB initialization in `index.html` to open a named persistent database.
- [x] 1.2 Keep existing `localStorage` metadata stores unchanged and compatible.
- [x] 1.3 Add clear status messaging indicating persistent mode vs in-memory fallback.
- [x] 1.4 Ensure both build outputs (`build:single`, `build:multi`) continue to initialize with the same persistence configuration.

## 2. Validation
- [x] 2.1 Build and sanity check `npm run build:single`.
- [x] 2.2 Build and sanity check `npm run build:multi`.
- [x] 2.3 Manual browser check: import/create table, reload, confirm table remains queryable.
- [x] 2.4 Manual browser check: verify metadata keys (`drigo.*`) still function.
