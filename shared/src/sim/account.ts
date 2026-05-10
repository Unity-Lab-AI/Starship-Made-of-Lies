import { type CivId } from '../types/index'
import { type ThemeId } from './themes'

declare const __accountBrand: unique symbol
type Brand<T, B> = T & { readonly [__accountBrand]: B }

export type AccountId = Brand<string, 'AccountId'>
export const accountId = (s: string): AccountId => s as AccountId

export type AuthMethod = 'anonymous' | 'email' | 'google' | 'discord' | 'apple'

export interface AccountCredentials {
  readonly method: AuthMethod
  readonly externalId: string | null
  readonly emailVerified: boolean
}

export interface AccountProfile {
  readonly accountId: AccountId
  readonly displayName: string
  readonly handle: string
  readonly createdAtTick: number
  readonly favoriteThemeId: ThemeId | null
  readonly cosmeticUnlocks: ReadonlySet<string>
  readonly badgeIds: ReadonlySet<string>
}

export interface AccountLifetimeStats {
  matchesPlayed: number
  matchesWon: number
  totalPlanetsControlledPeak: number
  totalEnemyCivsEliminated: number
  totalColonyShipsLaunched: number
  totalCitizensConscripted: number
  fastestApexTicks: number | null
  themesPlayed: Set<ThemeId>
}

export function newAccountLifetimeStats(): AccountLifetimeStats {
  return {
    matchesPlayed: 0,
    matchesWon: 0,
    totalPlanetsControlledPeak: 0,
    totalEnemyCivsEliminated: 0,
    totalColonyShipsLaunched: 0,
    totalCitizensConscripted: 0,
    fastestApexTicks: null,
    themesPlayed: new Set<ThemeId>(),
  }
}

export interface Account {
  readonly profile: AccountProfile
  credentials: AccountCredentials
  stats: AccountLifetimeStats
}

export function newAnonymousAccount(
  id: AccountId,
  displayName: string,
  handle: string,
  createdAtTick: number,
): Account {
  return {
    profile: {
      accountId: id,
      displayName,
      handle,
      createdAtTick,
      favoriteThemeId: null,
      cosmeticUnlocks: new Set<string>(),
      badgeIds: new Set<string>(),
    },
    credentials: {
      method: 'anonymous',
      externalId: null,
      emailVerified: false,
    },
    stats: newAccountLifetimeStats(),
  }
}

export interface MatchResultForAccount {
  readonly civId: CivId
  readonly themeId: ThemeId
  readonly won: boolean
  readonly peakControlledPlanets: number
  readonly enemyCivsEliminated: number
  readonly colonyShipsLaunched: number
  readonly citizensConscripted: number
  readonly apexReachedAtTick: number | null
}

export function applyMatchResultToStats(
  stats: AccountLifetimeStats,
  result: MatchResultForAccount,
): void {
  stats.matchesPlayed += 1
  if (result.won) stats.matchesWon += 1
  if (result.peakControlledPlanets > stats.totalPlanetsControlledPeak) {
    stats.totalPlanetsControlledPeak = result.peakControlledPlanets
  }
  stats.totalEnemyCivsEliminated += result.enemyCivsEliminated
  stats.totalColonyShipsLaunched += result.colonyShipsLaunched
  stats.totalCitizensConscripted += result.citizensConscripted
  if (
    result.apexReachedAtTick !== null &&
    (stats.fastestApexTicks === null || result.apexReachedAtTick < stats.fastestApexTicks)
  ) {
    stats.fastestApexTicks = result.apexReachedAtTick
  }
  stats.themesPlayed.add(result.themeId)
}

export function winRate(stats: AccountLifetimeStats): number {
  if (stats.matchesPlayed === 0) return 0
  return stats.matchesWon / stats.matchesPlayed
}

export function describeAccountForLog(account: Account): string {
  const wr = (winRate(account.stats) * 100).toFixed(1)
  return [
    `${account.profile.displayName}@${account.profile.handle}`,
    `[${account.credentials.method}]`,
    `played=${account.stats.matchesPlayed}`,
    `won=${account.stats.matchesWon} (${wr}%)`,
    `themes=${account.stats.themesPlayed.size}`,
  ].join(' | ')
}
