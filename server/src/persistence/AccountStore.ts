import {
  type Account,
  type AccountId,
  type AccountProfile,
  type AccountCredentials,
  type AccountLifetimeStats,
  type MatchResultForAccount,
  applyMatchResultToStats,
  newAccountLifetimeStats,
  newAnonymousAccount,
} from '@smol/shared'

export interface AccountStore {
  create(account: Account): void
  load(accountId: AccountId): Account | null
  loadByHandle(handle: string): Account | null
  updateProfile(accountId: AccountId, profile: Partial<AccountProfile>): boolean
  updateCredentials(accountId: AccountId, credentials: AccountCredentials): boolean
  updateStats(accountId: AccountId, mutator: (stats: AccountLifetimeStats) => void): boolean
  applyMatchResult(accountId: AccountId, result: MatchResultForAccount): boolean
  list(): ReadonlyArray<Account>
  delete(accountId: AccountId): boolean
}

export class InMemoryAccountStore implements AccountStore {
  private readonly accounts = new Map<AccountId, Account>()
  private readonly handleIndex = new Map<string, AccountId>()

  create(account: Account): void {
    this.accounts.set(account.profile.accountId, account)
    this.handleIndex.set(account.profile.handle.toLowerCase(), account.profile.accountId)
  }

  load(accountId: AccountId): Account | null {
    return this.accounts.get(accountId) ?? null
  }

  loadByHandle(handle: string): Account | null {
    const id = this.handleIndex.get(handle.toLowerCase())
    if (!id) return null
    return this.accounts.get(id) ?? null
  }

  updateProfile(accountId: AccountId, profile: Partial<AccountProfile>): boolean {
    const account = this.accounts.get(accountId)
    if (!account) return false
    const merged: AccountProfile = { ...account.profile, ...profile }
    this.accounts.set(accountId, { ...account, profile: merged })
    if (profile.handle && profile.handle !== account.profile.handle) {
      this.handleIndex.delete(account.profile.handle.toLowerCase())
      this.handleIndex.set(profile.handle.toLowerCase(), accountId)
    }
    return true
  }

  updateCredentials(accountId: AccountId, credentials: AccountCredentials): boolean {
    const account = this.accounts.get(accountId)
    if (!account) return false
    account.credentials = credentials
    return true
  }

  updateStats(accountId: AccountId, mutator: (stats: AccountLifetimeStats) => void): boolean {
    const account = this.accounts.get(accountId)
    if (!account) return false
    mutator(account.stats)
    return true
  }

  applyMatchResult(accountId: AccountId, result: MatchResultForAccount): boolean {
    const account = this.accounts.get(accountId)
    if (!account) return false
    applyMatchResultToStats(account.stats, result)
    return true
  }

  list(): ReadonlyArray<Account> {
    return Array.from(this.accounts.values())
  }

  delete(accountId: AccountId): boolean {
    const account = this.accounts.get(accountId)
    if (!account) return false
    this.handleIndex.delete(account.profile.handle.toLowerCase())
    this.accounts.delete(accountId)
    return true
  }
}

export function provisionAnonymousAccount(
  store: AccountStore,
  accountIdGenerator: () => string,
  displayName: string,
  handle: string,
  createdAtTick: number,
): Account {
  const id = accountIdGenerator() as unknown as Parameters<AccountStore['load']>[0]
  const account: Account = newAnonymousAccount(id, displayName, handle, createdAtTick)
  if (account.stats.matchesPlayed > 0) {
    account.stats = newAccountLifetimeStats()
  }
  store.create(account)
  return account
}
