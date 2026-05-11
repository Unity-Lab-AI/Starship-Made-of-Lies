import { type CivId } from '../types/index'
import { type ThemeId } from './themes'
import { type AccountId } from './account'

export type LeaderboardCategory =
  | 'mostPlanetsControlled'
  | 'fastestTechApex'
  | 'mostDeceptive'
  | 'themeSpecialist'
  | 'mostRuthless'

export interface LeaderboardCategoryDef {
  readonly id: LeaderboardCategory
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly higherIsBetter: boolean
  readonly perTheme: boolean
}

export const LEADERBOARD_CATEGORIES: ReadonlyArray<LeaderboardCategoryDef> = [
  {
    id: 'mostPlanetsControlled',
    name: 'Most Planets Controlled',
    emoji: '🌍',
    description: 'Peak controlled-planet count in a single match',
    higherIsBetter: true,
    perTheme: false,
  },
  {
    id: 'fastestTechApex',
    name: 'Fastest Tech Apex',
    emoji: '⚡',
    description: 'Lowest tick count to research a winsGame tech',
    higherIsBetter: false,
    perTheme: false,
  },
  {
    id: 'mostDeceptive',
    name: 'Most Deceptive',
    emoji: '🎭',
    description: 'Highest sustained dissident-ratio average across the match',
    higherIsBetter: true,
    perTheme: false,
  },
  {
    id: 'themeSpecialist',
    name: 'Theme Specialist',
    emoji: '👑',
    description: 'Top score per theme. One leaderboard per theme.',
    higherIsBetter: true,
    perTheme: true,
  },
  {
    id: 'mostRuthless',
    name: 'Most Ruthless',
    emoji: '⚔️',
    description: 'Most enemy civs eliminated in a single match',
    higherIsBetter: true,
    perTheme: false,
  },
]

export function getLeaderboardCategoryDef(id: LeaderboardCategory): LeaderboardCategoryDef {
  const def = LEADERBOARD_CATEGORIES.find((c) => c.id === id)
  if (!def) throw new Error(`Unknown leaderboard category: ${id}`)
  return def
}

export interface ScoreEntry {
  readonly accountId: AccountId
  readonly displayName: string
  readonly handle: string
  readonly civId: CivId
  readonly themeId: ThemeId
  readonly score: number
  readonly recordedAtTick: number
  readonly matchId: string
}

export interface LeaderboardKey {
  readonly category: LeaderboardCategory
  readonly themeId: ThemeId | null
}

export function leaderboardKeyToString(key: LeaderboardKey): string {
  return key.themeId ? `${key.category}:${String(key.themeId)}` : key.category
}

export interface MatchScoringInputs {
  readonly civId: CivId
  readonly themeId: ThemeId
  readonly accountId: AccountId
  readonly displayName: string
  readonly handle: string
  readonly matchId: string
  readonly recordedAtTick: number
  readonly peakControlledPlanets: number
  readonly apexReachedAtTick: number | null
  readonly averageDissidentRatio: number
  readonly enemyCivsEliminated: number
  readonly themeSpecialistScore: number
}

export function computeMatchScores(inputs: MatchScoringInputs): ReadonlyArray<{
  key: LeaderboardKey
  entry: ScoreEntry
}> {
  const out: { key: LeaderboardKey; entry: ScoreEntry }[] = []
  const baseEntry = (score: number): ScoreEntry => ({
    accountId: inputs.accountId,
    displayName: inputs.displayName,
    handle: inputs.handle,
    civId: inputs.civId,
    themeId: inputs.themeId,
    score,
    recordedAtTick: inputs.recordedAtTick,
    matchId: inputs.matchId,
  })

  out.push({
    key: { category: 'mostPlanetsControlled', themeId: null },
    entry: baseEntry(inputs.peakControlledPlanets),
  })
  if (inputs.apexReachedAtTick !== null) {
    out.push({
      key: { category: 'fastestTechApex', themeId: null },
      entry: baseEntry(inputs.apexReachedAtTick),
    })
  }
  out.push({
    key: { category: 'mostDeceptive', themeId: null },
    entry: baseEntry(Math.round(inputs.averageDissidentRatio * 10000) / 100),
  })
  out.push({
    key: { category: 'mostRuthless', themeId: null },
    entry: baseEntry(inputs.enemyCivsEliminated),
  })
  out.push({
    key: { category: 'themeSpecialist', themeId: inputs.themeId },
    entry: baseEntry(inputs.themeSpecialistScore),
  })
  return out
}

export interface LeaderboardSnapshot {
  readonly key: LeaderboardKey
  readonly topEntries: ReadonlyArray<ScoreEntry>
  readonly capturedAtTick: number
}

export function sortEntries(
  entries: ReadonlyArray<ScoreEntry>,
  category: LeaderboardCategory,
): ReadonlyArray<ScoreEntry> {
  const def = getLeaderboardCategoryDef(category)
  const sorted = [...entries].sort((a, b) =>
    def.higherIsBetter ? b.score - a.score : a.score - b.score,
  )
  return sorted
}

export const DEFAULT_LEADERBOARD_TOP_N = 10
