-- PHASE 17.0 + Layer E #3 — accounts schema migration. Run once against your Postgres DB:
--
--   psql $DATABASE_URL -f server/sql/0001_accounts.sql
--
-- The PostgresAccountStore auto-runs this same SQL on first connect (idempotent), so manual
-- execution is only required for production migration tooling (flyway, sqitch, knex) that
-- prefers explicit schema files over auto-init.

CREATE TABLE IF NOT EXISTS accounts (
  account_id            TEXT PRIMARY KEY,
  display_name          TEXT NOT NULL,
  handle                TEXT NOT NULL,
  handle_lower          TEXT NOT NULL,
  created_at_tick       INTEGER NOT NULL,
  favorite_theme_id     TEXT,
  cosmetic_unlocks      TEXT[] NOT NULL DEFAULT '{}',
  badge_ids             TEXT[] NOT NULL DEFAULT '{}',
  credentials           JSONB NOT NULL,
  stats                 JSONB NOT NULL
);

-- Unique index on the lowercased handle so loadByHandle() can do case-insensitive lookup
-- in a single index scan.
CREATE UNIQUE INDEX IF NOT EXISTS accounts_handle_lower_idx ON accounts(handle_lower);

-- Index on credentials.method for "list all google-authed users" admin queries.
CREATE INDEX IF NOT EXISTS accounts_credentials_method_idx
  ON accounts((credentials->>'method'));

-- Composite index on (method, externalId) for the OAuth resolve-or-create lookup path —
-- e.g. resolveOrCreateGoogleAccount() needs to find an existing account by Google's `sub`.
CREATE INDEX IF NOT EXISTS accounts_credentials_external_idx
  ON accounts((credentials->>'method'), (credentials->>'externalId'));
