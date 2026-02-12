# duckdb-persistence Specification

## Purpose
TBD - created by archiving change add-persistent-duckdb-storage. Update Purpose after archive.
## Requirements
### Requirement: Persistent DuckDB Runtime Database
The system SHALL initialize DuckDB with a named browser-persistent database so user-created tables can survive page reloads in supported environments.

#### Scenario: Persistent database opens at startup
- **WHEN** the app initializes DuckDB in a browser context with persistent storage support
- **THEN** DuckDB is opened using a stable, named persistent database identifier
- **AND** the app reports successful readiness

#### Scenario: Tables survive reload
- **WHEN** a user creates or imports tables and then reloads the app under the same origin
- **THEN** previously persisted tables remain queryable without re-import

### Requirement: Graceful Fallback for Restricted Storage
The system SHALL continue to function using in-memory DuckDB if persistent database initialization is unavailable or fails.

#### Scenario: Persistent initialization fails
- **WHEN** the browser blocks or fails persistent storage initialization
- **THEN** the app initializes DuckDB in non-persistent mode
- **AND** the app shows a clear status indicating in-memory fallback mode

### Requirement: Build-Mode Persistence Consistency
The system SHALL apply the same persistent DuckDB initialization behavior for both single-file and multi-file builds.

#### Scenario: Single and multi builds use same persistence configuration
- **WHEN** users run `build:single` or `build:multi` outputs under the same origin
- **THEN** both outputs target the same logical named DuckDB database
- **AND** relational data persistence behavior is consistent between build modes

