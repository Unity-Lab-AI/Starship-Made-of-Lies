import {
  type AccountId,
  type Account,
  type LeaderboardCategory,
  type LeaderboardKey,
  type LeaderboardSnapshot,
  type ScoreEntry,
  type AchievementId,
  type AchievementProgress,
  type MatchAchievementInputs,
  type MatchResultForAccount,
  type MatchScoringInputs,
  ACHIEVEMENTS,
  checkMatchEndAchievements,
  computeMatchScores,
} from '@smol/shared'
import { type AccountStore, InMemoryAccountStore } from './AccountStore'
import { type LeaderboardStore, InMemoryLeaderboardStore } from './LeaderboardStore'
import { type AchievementStore, InMemoryAchievementStore } from './AchievementStore'
import { type SnapshotStore, InMemorySnapshotStore } from '../match/snapshot'

export interface PersistenceLayer {
  readonly accounts: AccountStore
  readonly leaderboards: LeaderboardStore
  readonly achievements: AchievementStore
  readonly snapshots: SnapshotStore
}

export interface PersistenceLayerInputs {
  readonly accounts?: AccountStore
  readonly leaderboards?: LeaderboardStore
  readonly achievements?: AchievementStore
  readonly snapshots?: SnapshotStore
}

export function newPersistenceLayer(inputs: PersistenceLayerInputs = {}): PersistenceLayer {
  return {
    accounts: inputs.accounts ?? new InMemoryAccountStore(),
    leaderboards: inputs.leaderboards ?? new InMemoryLeaderboardStore(),
    achievements: inputs.achievements ?? new InMemoryAchievementStore(),
    snapshots: inputs.snapshots ?? new InMemorySnapshotStore(),
  }
}

export interface MatchEndPersistenceInputs {
  readonly account: Account
  readonly matchResult: MatchResultForAccount
  readonly scoring: MatchScoringInputs
  readonly achievementInputs: MatchAchievementInputs
}

export interface MatchEndPersistenceOutcome {
  readonly statsUpdated: boolean
  readonly recordedScores: ReadonlyArray<{ key: LeaderboardKey; entry: ScoreEntry }>
  readonly newlyUnlocked: ReadonlyArray<AchievementId>
}

export function applyMatchEndToPersistence(
  layer: PersistenceLayer,
  inputs: MatchEndPersistenceInputs,
): MatchEndPersistenceOutcome {
  const statsUpdated = layer.accounts.applyMatchResult(
    inputs.account.profile.accountId,
    inputs.matchResult,
  )
  const scores = computeMatchScores(inputs.scoring)
  for (const { key, entry } of scores) {
    layer.leaderboards.recordEntry(key, entry, inputs.scoring.recordedAtTick)
  }
  const allCandidates = checkMatchEndAchievements(inputs.achievementInputs)
  const newlyUnlocked: AchievementId[] = []
  for (const achievementId of allCandidates) {
    if (
      layer.achievements.recordUnlock(
        inputs.account.profile.accountId,
        achievementId,
        inputs.achievementInputs.atTick,
        inputs.achievementInputs.matchId,
      )
    ) {
      newlyUnlocked.push(achievementId)
    }
  }
  return {
    statsUpdated,
    recordedScores: scores,
    newlyUnlocked,
  }
}

export function getCategorySnapshots(
  layer: PersistenceLayer,
  category: LeaderboardCategory,
): ReadonlyArray<LeaderboardSnapshot> {
  const out: LeaderboardSnapshot[] = []
  for (const key of layer.leaderboards.listCategoryKeys(category)) {
    const snap = layer.leaderboards.getSnapshot(key)
    if (snap) out.push(snap)
  }
  return out
}

export function totalAchievementsAvailable(): number {
  return ACHIEVEMENTS.length
}

export function accountAchievementCompletionRatio(
  layer: PersistenceLayer,
  accountId: AccountId,
): number {
  const total = totalAchievementsAvailable()
  if (total === 0) return 0
  const unlocked = layer.achievements.countUnlockedForAccount(accountId)
  return unlocked / total
}

export function listProgressedAchievements(
  layer: PersistenceLayer,
  accountId: AccountId,
): ReadonlyArray<AchievementProgress> {
  return layer.achievements.listForAccount(accountId)
}
