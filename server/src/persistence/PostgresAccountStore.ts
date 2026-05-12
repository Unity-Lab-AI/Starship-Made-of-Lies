// PHASE 17.0 + Layer E #3 — Postgres-backed AccountStore. Drop-in replacement for
// FileAccountStore + InMemoryAccountStore. Activate via:
//
//   1. `pnpm add pg @types/pg` in server/
//   2. Set DATABASE_URL=postgres://user:pass@host:5432/smol in .env.local
//   3. Set SMOL_ACCOUNT_STORE_BACKEND=postgres in .env.local
//   4. Run the schema migration in `server/sql/0001_accounts.sql` (file shipped alongside)
//
// Driver dependency is INTENTIONALLY dynamic-imported so the server doesn't require `pg`
// to be installed when running on file-backed mode. The first call to any method lazily
// loads pg + creates the pool. If pg isn't installed, that method throws a clear error.
//
// Why dynamic import + minimal local PgClient interface: keeps the bundle clean for ops
// that don't want Postgres yet (alpha self-hosted devs running FileAccountStore). The type
// shape declared here covers the subset of `pg` we actually use; consumers can swap to a
// fully-typed `pg.Pool` when they bring the dependency in.

import {
  type Account,
  type AccountId,
  type AccountProfile,
  type AccountCredentials,
  type AccountLifetimeStats,
  type MatchResultForAccount,
  type ThemeId,
  accountId as accountIdValue,
  applyMatchResultToStats,
  newAccountLifetimeStats,
} from '@smol/shared'
import { type AccountStore } from './AccountStore'

// Minimal local interface — `pg.Pool` is a superset. Allows the file to compile without the
// `pg` package installed; the dynamic import below loads the real class at runtime.
interface PgClient {
  query<T = unknown>(
    sql: string,
    params?: ReadonlyArray<unknown>,
  ): Promise<{ rows: T[]; rowCount: number | null }>
  end(): Promise<void>
}

// PHASE 17.0 — schema. CREATE TABLE statements live in server/sql/0001_accounts.sql; this
// constant is the same SQL inlined so we can lazily auto-migrate (createSchema=true). For
// production-grade migrations the operator should run the .sql file through a migration
// tool (flyway, sqitch, knex) rather than relying on auto-init.
export const ACCOUNT_SCHEMA_SQL = `
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
CREATE UNIQUE INDEX IF NOT EXISTS accounts_handle_lower_idx ON accounts(handle_lower);
CREATE INDEX IF NOT EXISTS accounts_credentials_method_idx
  ON accounts((credentials->>'method'));
CREATE INDEX IF NOT EXISTS accounts_credentials_external_idx
  ON accounts((credentials->>'method'), (credentials->>'externalId'));
`

interface AccountRow {
  account_id: string
  display_name: string
  handle: string
  handle_lower: string
  created_at_tick: number
  favorite_theme_id: string | null
  cosmetic_unlocks: ReadonlyArray<string>
  badge_ids: ReadonlyArray<string>
  credentials: AccountCredentials
  stats: {
    matchesPlayed: number
    matchesWon: number
    totalPlanetsControlledPeak: number
    totalEnemyCivsEliminated: number
    totalColonyShipsLaunched: number
    totalCitizensConscripted: number
    fastestApexTicks: number | null
    themesPlayed: ReadonlyArray<string>
  }
}

function rowToAccount(row: AccountRow): Account {
  const stats: AccountLifetimeStats = newAccountLifetimeStats()
  stats.matchesPlayed = row.stats.matchesPlayed
  stats.matchesWon = row.stats.matchesWon
  stats.totalPlanetsControlledPeak = row.stats.totalPlanetsControlledPeak
  stats.totalEnemyCivsEliminated = row.stats.totalEnemyCivsEliminated
  stats.totalColonyShipsLaunched = row.stats.totalColonyShipsLaunched
  stats.totalCitizensConscripted = row.stats.totalCitizensConscripted
  stats.fastestApexTicks = row.stats.fastestApexTicks
  stats.themesPlayed = new Set(row.stats.themesPlayed.map((t) => t as ThemeId))
  const profile: AccountProfile = {
    accountId: accountIdValue(row.account_id),
    displayName: row.display_name,
    handle: row.handle,
    createdAtTick: row.created_at_tick,
    favoriteThemeId: row.favorite_theme_id ? (row.favorite_theme_id as ThemeId) : null,
    cosmeticUnlocks: new Set(row.cosmetic_unlocks),
    badgeIds: new Set(row.badge_ids),
  }
  return { profile, credentials: row.credentials, stats }
}

export class PostgresAccountStore implements AccountStore {
  private pool: PgClient | null = null
  // Local cache keyed by accountId for sync reads. Postgres queries are async; AccountStore
  // interface is sync. Cache is hydrated by warmCache() on construction (caller must await).
  private readonly cache = new Map<AccountId, Account>()
  private readonly handleIndex = new Map<string, AccountId>()

  constructor(private readonly connectionString: string = process.env.DATABASE_URL ?? '') {
    if (!this.connectionString) {
      throw new Error(
        '[smol/auth] PostgresAccountStore: DATABASE_URL env var not set. Set it to ' +
          'postgres://user:pass@host:5432/dbname in .env.local before instantiating.',
      )
    }
  }

  // Lazy pg import + pool init. Resolves once on first call.
  private async ensurePool(): Promise<PgClient> {
    if (this.pool) return this.pool
    // Dynamic import so the file compiles + the server runs without `pg` installed when on
    // file-backed mode. Operators activating Postgres must `pnpm add pg @types/pg` first.
    let pgModule: { Pool: new (config: { connectionString: string }) => PgClient }
    try {
      // `pg` is an optional runtime dependency. Operators install it when activating
      // Postgres mode; the file compiles without it because the import specifier is hidden
      // behind a Function-constructed dynamic importer (TS can't see the literal string
      // 'pg' so it doesn't try to resolve it during compile). At runtime Node resolves it
      // normally; if the package isn't installed the catch below fires with a helpful error.
      const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<unknown>
      pgModule = (await dynamicImport('pg')) as {
        Pool: new (config: { connectionString: string }) => PgClient
      }
    } catch (err) {
      throw new Error(
        '[smol/auth] PostgresAccountStore requires the `pg` package. Run `pnpm add pg @types/pg` in server/ ' +
          `before enabling SMOL_ACCOUNT_STORE_BACKEND=postgres. Underlying: ${
            err instanceof Error ? err.message : String(err)
          }`,
      )
    }
    this.pool = new pgModule.Pool({ connectionString: this.connectionString })
    // Auto-migrate the schema on first connect. Idempotent (CREATE TABLE IF NOT EXISTS).
    await this.pool.query(ACCOUNT_SCHEMA_SQL)
    return this.pool
  }

  // Caller must await this after constructing — populates the in-memory cache so the sync
  // AccountStore methods can serve reads. Subsequent writes flush back to Postgres lazily.
  async warmCache(): Promise<void> {
    const pool = await this.ensurePool()
    const result = await pool.query<AccountRow>('SELECT * FROM accounts')
    for (const row of result.rows) {
      const account = rowToAccount(row)
      this.cache.set(account.profile.accountId, account)
      this.handleIndex.set(row.handle_lower, account.profile.accountId)
    }
  }

  private fireAndForgetWrite(promise: Promise<unknown>): void {
    promise.catch((err) => {
      console.error('[smol/auth] PostgresAccountStore write failed:', err)
    })
  }

  private async upsertAccount(account: Account): Promise<void> {
    const pool = await this.ensurePool()
    const stats = {
      matchesPlayed: account.stats.matchesPlayed,
      matchesWon: account.stats.matchesWon,
      totalPlanetsControlledPeak: account.stats.totalPlanetsControlledPeak,
      totalEnemyCivsEliminated: account.stats.totalEnemyCivsEliminated,
      totalColonyShipsLaunched: account.stats.totalColonyShipsLaunched,
      totalCitizensConscripted: account.stats.totalCitizensConscripted,
      fastestApexTicks: account.stats.fastestApexTicks,
      themesPlayed: [...account.stats.themesPlayed].map((t) => String(t)),
    }
    await pool.query(
      `INSERT INTO accounts (
         account_id, display_name, handle, handle_lower, created_at_tick,
         favorite_theme_id, cosmetic_unlocks, badge_ids, credentials, stats
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (account_id) DO UPDATE SET
         display_name      = EXCLUDED.display_name,
         handle            = EXCLUDED.handle,
         handle_lower      = EXCLUDED.handle_lower,
         favorite_theme_id = EXCLUDED.favorite_theme_id,
         cosmetic_unlocks  = EXCLUDED.cosmetic_unlocks,
         badge_ids         = EXCLUDED.badge_ids,
         credentials       = EXCLUDED.credentials,
         stats             = EXCLUDED.stats`,
      [
        String(account.profile.accountId),
        account.profile.displayName,
        account.profile.handle,
        account.profile.handle.toLowerCase(),
        account.profile.createdAtTick,
        account.profile.favoriteThemeId ? String(account.profile.favoriteThemeId) : null,
        [...account.profile.cosmeticUnlocks],
        [...account.profile.badgeIds],
        JSON.stringify(account.credentials),
        JSON.stringify(stats),
      ],
    )
  }

  create(account: Account): void {
    this.cache.set(account.profile.accountId, account)
    this.handleIndex.set(account.profile.handle.toLowerCase(), account.profile.accountId)
    this.fireAndForgetWrite(this.upsertAccount(account))
  }

  load(id: AccountId): Account | null {
    return this.cache.get(id) ?? null
  }

  loadByHandle(handle: string): Account | null {
    const id = this.handleIndex.get(handle.toLowerCase())
    return id ? (this.cache.get(id) ?? null) : null
  }

  updateProfile(id: AccountId, profile: Partial<AccountProfile>): boolean {
    const account = this.cache.get(id)
    if (!account) return false
    const merged: AccountProfile = { ...account.profile, ...profile }
    const updated: Account = { ...account, profile: merged }
    this.cache.set(id, updated)
    if (profile.handle && profile.handle !== account.profile.handle) {
      this.handleIndex.delete(account.profile.handle.toLowerCase())
      this.handleIndex.set(profile.handle.toLowerCase(), id)
    }
    this.fireAndForgetWrite(this.upsertAccount(updated))
    return true
  }

  updateCredentials(id: AccountId, credentials: AccountCredentials): boolean {
    const account = this.cache.get(id)
    if (!account) return false
    account.credentials = credentials
    this.fireAndForgetWrite(this.upsertAccount(account))
    return true
  }

  updateStats(id: AccountId, mutator: (stats: AccountLifetimeStats) => void): boolean {
    const account = this.cache.get(id)
    if (!account) return false
    mutator(account.stats)
    this.fireAndForgetWrite(this.upsertAccount(account))
    return true
  }

  applyMatchResult(id: AccountId, result: MatchResultForAccount): boolean {
    const account = this.cache.get(id)
    if (!account) return false
    applyMatchResultToStats(account.stats, result)
    this.fireAndForgetWrite(this.upsertAccount(account))
    return true
  }

  list(): ReadonlyArray<Account> {
    return Array.from(this.cache.values())
  }

  delete(id: AccountId): boolean {
    const account = this.cache.get(id)
    if (!account) return false
    this.handleIndex.delete(account.profile.handle.toLowerCase())
    this.cache.delete(id)
    this.fireAndForgetWrite(
      this.ensurePool().then((pool) =>
        pool.query('DELETE FROM accounts WHERE account_id = $1', [String(id)]),
      ),
    )
    return true
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }
}
