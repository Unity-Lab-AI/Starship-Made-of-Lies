-- PHASE 17.L super-review 2026-05-12 — persistent session tokens.
--
-- Survives server restart so 10-24h saga matches don't kick every player when the auth
-- server bounces. Mirrors the in-memory `sessionTokens` Map in server/src/auth/httpServer.ts.
--
-- Idempotent — `CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS` so safe to re-run.
-- The same SQL is inlined as `SESSION_SCHEMA_SQL` in PostgresSessionStore.ts and auto-runs on
-- first connect; this file is for operators who prefer a manual migration workflow.
--
-- Apply manually with:
--   psql "$DATABASE_URL" -f server/sql/0002_sessions.sql

CREATE TABLE IF NOT EXISTS sessions (
  token            VARCHAR(64) PRIMARY KEY,
  account_id       TEXT NOT NULL,
  kind             VARCHAR(16) NOT NULL,
  issued_at_ms     BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_account_idx ON sessions(account_id);
CREATE INDEX IF NOT EXISTS sessions_kind_issued_idx ON sessions(kind, issued_at_ms);
