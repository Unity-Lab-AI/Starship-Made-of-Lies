// PHASE 17.0 — File-backed AccountStore. The InMemoryAccountStore loses every account on
// server restart; this implementation flushes mutations to disk so OAuth identities + lifetime
// stats survive process bounces. Default path is `<project-root>/data/accounts.json` (override
// via SMOL_ACCOUNT_STORE_PATH).
//
// This is the alpha self-hosted path per `project_self_host_local_pc.md` — Postgres is the
// future evolution. The file format is a top-level JSON array of Account records with Set
// + Map fields serialized as tagged objects (matching the client's saveLoad pattern). Reads
// happen lazily on first call + populate the in-memory index; every mutation triggers a
// write-through to disk via the same atomic tmp-rename pattern as FileSnapshotStore.
//
// Forward path to Postgres: implement the same AccountStore interface with `pg` Pool +
// matching SQL (accounts table keyed by account_id, credentials JSONB, stats JSONB). The
// switching surface is the index.ts wiring — no callers change.

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
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

const __dirname = dirname(fileURLToPath(import.meta.url))

function defaultAccountStorePath(): string {
  return (
    process.env.SMOL_ACCOUNT_STORE_PATH ??
    join(__dirname, '..', '..', '..', 'data', 'accounts.json')
  )
}

interface SerializedAccount {
  readonly profile: {
    readonly accountId: string
    readonly displayName: string
    readonly handle: string
    readonly createdAtTick: number
    readonly favoriteThemeId: string | null
    readonly cosmeticUnlocks: ReadonlyArray<string>
    readonly badgeIds: ReadonlyArray<string>
  }
  readonly credentials: AccountCredentials
  readonly stats: {
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

function serializeAccount(account: Account): SerializedAccount {
  return {
    profile: {
      accountId: String(account.profile.accountId),
      displayName: account.profile.displayName,
      handle: account.profile.handle,
      createdAtTick: account.profile.createdAtTick,
      favoriteThemeId: account.profile.favoriteThemeId
        ? String(account.profile.favoriteThemeId)
        : null,
      cosmeticUnlocks: [...account.profile.cosmeticUnlocks],
      badgeIds: [...account.profile.badgeIds],
    },
    credentials: account.credentials,
    stats: {
      matchesPlayed: account.stats.matchesPlayed,
      matchesWon: account.stats.matchesWon,
      totalPlanetsControlledPeak: account.stats.totalPlanetsControlledPeak,
      totalEnemyCivsEliminated: account.stats.totalEnemyCivsEliminated,
      totalColonyShipsLaunched: account.stats.totalColonyShipsLaunched,
      totalCitizensConscripted: account.stats.totalCitizensConscripted,
      fastestApexTicks: account.stats.fastestApexTicks,
      themesPlayed: [...account.stats.themesPlayed].map((t) => String(t)),
    },
  }
}

function deserializeAccount(s: SerializedAccount): Account {
  const stats: AccountLifetimeStats = newAccountLifetimeStats()
  stats.matchesPlayed = s.stats.matchesPlayed
  stats.matchesWon = s.stats.matchesWon
  stats.totalPlanetsControlledPeak = s.stats.totalPlanetsControlledPeak
  stats.totalEnemyCivsEliminated = s.stats.totalEnemyCivsEliminated
  stats.totalColonyShipsLaunched = s.stats.totalColonyShipsLaunched
  stats.totalCitizensConscripted = s.stats.totalCitizensConscripted
  stats.fastestApexTicks = s.stats.fastestApexTicks
  stats.themesPlayed = new Set(s.stats.themesPlayed.map((t) => t as ThemeId))
  const profile: AccountProfile = {
    accountId: accountIdValue(s.profile.accountId),
    displayName: s.profile.displayName,
    handle: s.profile.handle,
    createdAtTick: s.profile.createdAtTick,
    favoriteThemeId: s.profile.favoriteThemeId ? (s.profile.favoriteThemeId as ThemeId) : null,
    cosmeticUnlocks: new Set(s.profile.cosmeticUnlocks),
    badgeIds: new Set(s.profile.badgeIds),
  }
  return { profile, credentials: s.credentials, stats }
}

export class FileAccountStore implements AccountStore {
  private readonly path: string
  private readonly accounts = new Map<AccountId, Account>()
  private readonly handleIndex = new Map<string, AccountId>()
  private loaded = false

  constructor(path?: string) {
    this.path = path ?? defaultAccountStorePath()
    const dir = dirname(this.path)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  private ensureLoaded(): void {
    if (this.loaded) return
    this.loaded = true
    if (!existsSync(this.path)) {
      this.flush()
      return
    }
    try {
      const raw = readFileSync(this.path, 'utf8')
      const entries = JSON.parse(raw) as ReadonlyArray<SerializedAccount>
      for (const s of entries) {
        const account = deserializeAccount(s)
        this.accounts.set(account.profile.accountId, account)
        this.handleIndex.set(account.profile.handle.toLowerCase(), account.profile.accountId)
      }
    } catch (err) {
      console.error(`[smol/auth] FileAccountStore load failed (${this.path}):`, err)
    }
  }

  private flush(): void {
    try {
      const tmp = `${this.path}.tmp`
      const serialized = [...this.accounts.values()].map(serializeAccount)
      writeFileSync(tmp, JSON.stringify(serialized, null, 2), 'utf8')
      writeFileSync(this.path, JSON.stringify(serialized, null, 2), 'utf8')
      try {
        unlinkSync(tmp)
      } catch {
        // tmp cleanup non-fatal
      }
    } catch (err) {
      console.error(`[smol/auth] FileAccountStore flush failed (${this.path}):`, err)
    }
  }

  create(account: Account): void {
    this.ensureLoaded()
    this.accounts.set(account.profile.accountId, account)
    this.handleIndex.set(account.profile.handle.toLowerCase(), account.profile.accountId)
    this.flush()
  }

  load(id: AccountId): Account | null {
    this.ensureLoaded()
    return this.accounts.get(id) ?? null
  }

  loadByHandle(handle: string): Account | null {
    this.ensureLoaded()
    const id = this.handleIndex.get(handle.toLowerCase())
    if (!id) return null
    return this.accounts.get(id) ?? null
  }

  updateProfile(id: AccountId, profile: Partial<AccountProfile>): boolean {
    this.ensureLoaded()
    const account = this.accounts.get(id)
    if (!account) return false
    const merged: AccountProfile = { ...account.profile, ...profile }
    this.accounts.set(id, { ...account, profile: merged })
    if (profile.handle && profile.handle !== account.profile.handle) {
      this.handleIndex.delete(account.profile.handle.toLowerCase())
      this.handleIndex.set(profile.handle.toLowerCase(), id)
    }
    this.flush()
    return true
  }

  updateCredentials(id: AccountId, credentials: AccountCredentials): boolean {
    this.ensureLoaded()
    const account = this.accounts.get(id)
    if (!account) return false
    account.credentials = credentials
    this.flush()
    return true
  }

  updateStats(id: AccountId, mutator: (stats: AccountLifetimeStats) => void): boolean {
    this.ensureLoaded()
    const account = this.accounts.get(id)
    if (!account) return false
    mutator(account.stats)
    this.flush()
    return true
  }

  applyMatchResult(id: AccountId, result: MatchResultForAccount): boolean {
    this.ensureLoaded()
    const account = this.accounts.get(id)
    if (!account) return false
    applyMatchResultToStats(account.stats, result)
    this.flush()
    return true
  }

  list(): ReadonlyArray<Account> {
    this.ensureLoaded()
    return Array.from(this.accounts.values())
  }

  delete(id: AccountId): boolean {
    this.ensureLoaded()
    const account = this.accounts.get(id)
    if (!account) return false
    this.handleIndex.delete(account.profile.handle.toLowerCase())
    this.accounts.delete(id)
    this.flush()
    return true
  }
}
