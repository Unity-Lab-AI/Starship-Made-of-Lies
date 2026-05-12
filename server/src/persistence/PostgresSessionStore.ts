// PHASE 17.L super-review 2026-05-12 — Postgres-backed SessionStore. Mirrors writes to the
// in-memory `sessionTokens` Map in `httpServer.ts` so server restart doesn't wipe every
// authenticated session mid-saga.
//
// Activation: set `SMOL_ACCOUNT_STORE_BACKEND=postgres` + `DATABASE_URL=postgres://...` in
// `.env.local`. Schema auto-runs on first connect via the inlined SESSION_SCHEMA_SQL constant
// below; a sidecar file `server/sql/0002_sessions.sql` ships the same SQL for operators who
// prefer manual migrations.
//
// Failure modes: a transient Postgres outage during a write fires the catch in
// `fireAndForgetWrite` (called from httpServer); the in-memory map keeps the token alive so
// the user's session keeps working. The persistence promise was the durability guarantee
// against server restart — it's degraded, not lost.

import { Pool } from 'pg'
import { type PersistedSession, type SessionKind, type SessionStore } from './SessionStore'

interface PgClient {
  query<T = unknown>(
    sql: string,
    params?: ReadonlyArray<unknown>,
  ): Promise<{ rows: T[]; rowCount: number | null }>
  end(): Promise<void>
}

export const SESSION_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sessions (
  token            VARCHAR(64) PRIMARY KEY,
  account_id       TEXT NOT NULL,
  kind             VARCHAR(16) NOT NULL,
  issued_at_ms     BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_account_idx ON sessions(account_id);
CREATE INDEX IF NOT EXISTS sessions_kind_issued_idx ON sessions(kind, issued_at_ms);
`

interface SessionRow {
  token: string
  account_id: string
  kind: string
  issued_at_ms: string | number // pg returns BIGINT as string by default
}

function rowToSession(row: SessionRow): PersistedSession {
  return {
    token: row.token,
    accountId: row.account_id,
    kind: row.kind as SessionKind,
    issuedAtMs: typeof row.issued_at_ms === 'string' ? Number(row.issued_at_ms) : row.issued_at_ms,
  }
}

export class PostgresSessionStore implements SessionStore {
  private pool: PgClient | null = null

  constructor(private readonly connectionString: string = process.env.DATABASE_URL ?? '') {
    if (!this.connectionString) {
      throw new Error(
        '[smol/auth] PostgresSessionStore: DATABASE_URL env var not set. Set it to ' +
          'postgres://user:pass@host:5432/dbname in .env.local before instantiating.',
      )
    }
  }

  // Pool init + idempotent schema migration. Resolves once on first call.
  private async ensurePool(): Promise<PgClient> {
    if (this.pool) return this.pool
    this.pool = new Pool({ connectionString: this.connectionString }) as unknown as PgClient
    await this.pool.query(SESSION_SCHEMA_SQL)
    return this.pool
  }

  async upsert(session: PersistedSession): Promise<void> {
    const pool = await this.ensurePool()
    await pool.query(
      `INSERT INTO sessions (token, account_id, kind, issued_at_ms)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (token) DO UPDATE SET
         account_id   = EXCLUDED.account_id,
         kind         = EXCLUDED.kind,
         issued_at_ms = EXCLUDED.issued_at_ms`,
      [session.token, session.accountId, session.kind, session.issuedAtMs],
    )
  }

  async revoke(token: string): Promise<void> {
    const pool = await this.ensurePool()
    await pool.query('DELETE FROM sessions WHERE token = $1', [token])
  }

  async loadActive(
    nowMs: number,
    maxAgeMsByKind: Readonly<Record<SessionKind, number>>,
  ): Promise<ReadonlyArray<PersistedSession>> {
    const pool = await this.ensurePool()
    const guestCutoff = nowMs - maxAgeMsByKind.guest
    const oauthCutoff = nowMs - maxAgeMsByKind.oauth
    const result = await pool.query<SessionRow>(
      `SELECT token, account_id, kind, issued_at_ms FROM sessions
       WHERE (kind = 'guest' AND issued_at_ms > $1)
          OR (kind = 'oauth' AND issued_at_ms > $2)`,
      [guestCutoff, oauthCutoff],
    )
    return result.rows.map(rowToSession)
  }

  async purgeExpired(
    nowMs: number,
    maxAgeMsByKind: Readonly<Record<SessionKind, number>>,
  ): Promise<number> {
    const pool = await this.ensurePool()
    const guestCutoff = nowMs - maxAgeMsByKind.guest
    const oauthCutoff = nowMs - maxAgeMsByKind.oauth
    const result = await pool.query(
      `DELETE FROM sessions
       WHERE (kind = 'guest' AND issued_at_ms <= $1)
          OR (kind = 'oauth' AND issued_at_ms <= $2)`,
      [guestCutoff, oauthCutoff],
    )
    return result.rowCount ?? 0
  }
}
