// PHASE 17.L super-review 2026-05-12 — persistent session storage.
//
// Problem: the in-memory `sessionTokens` Map in `httpServer.ts` evaporates on every server
// restart. For 10-24h saga matches, a 5-minute reboot kicks every player and forces all
// guests to mint fresh tokens — the client's localStorage token becomes invalid.
//
// Solution: a thin SessionStore interface with two impls — InMemorySessionStore (no-op,
// preserves current behavior) and PostgresSessionStore (mirrors writes to a `sessions`
// table + rehydrates on boot).
//
// Lifecycle integration in httpServer.ts:
//   - issueSessionToken / issueGuestSessionToken: fire-and-forget upsert after Map.set
//   - sweepExpiredEntries: fire-and-forget purgeExpired (matches the in-memory sweep)
//   - lookupSessionToken (expired-delete path): fire-and-forget revoke
//   - startAuthHttpServer (before listen): await loadActive + populate in-memory Map

export type SessionKind = 'guest' | 'oauth'

export interface PersistedSession {
  readonly token: string
  readonly accountId: string
  readonly kind: SessionKind
  readonly issuedAtMs: number
}

export interface SessionStore {
  // Persist a new session OR overwrite an existing one (token is the primary key). Idempotent.
  upsert(session: PersistedSession): Promise<void>
  // Remove a session by token. No-op if not found.
  revoke(token: string): Promise<void>
  // Load all sessions whose `issuedAtMs` is within the TTL window for their `kind`. Caller
  // rehydrates the in-memory map from these. Sessions outside the window are returned only
  // if they haven't been purged yet — defense-in-depth, the in-memory TTL check catches them.
  loadActive(
    nowMs: number,
    maxAgeMsByKind: Readonly<Record<SessionKind, number>>,
  ): Promise<ReadonlyArray<PersistedSession>>
  // Purge expired entries. Returns the number of rows removed.
  purgeExpired(
    nowMs: number,
    maxAgeMsByKind: Readonly<Record<SessionKind, number>>,
  ): Promise<number>
}

// No-op default. Sessions live in process memory only; server restart wipes them. Used when
// SMOL_ACCOUNT_STORE_BACKEND ≠ 'postgres' (file / memory backends).
export class InMemorySessionStore implements SessionStore {
  async upsert(): Promise<void> {
    /* no-op */
  }
  async revoke(): Promise<void> {
    /* no-op */
  }
  async loadActive(): Promise<ReadonlyArray<PersistedSession>> {
    return []
  }
  async purgeExpired(): Promise<number> {
    return 0
  }
}
