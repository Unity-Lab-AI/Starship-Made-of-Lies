import {
  type AccountId,
  type AchievementId,
  type AchievementProgress,
  newAchievementProgress,
  unlockAchievement,
} from '@smol/shared'

export interface AchievementStore {
  getProgress(accountId: AccountId, achievementId: AchievementId): AchievementProgress | null
  ensureProgress(
    accountId: AccountId,
    achievementId: AchievementId,
    progressTarget: number,
  ): AchievementProgress
  recordUnlock(
    accountId: AccountId,
    achievementId: AchievementId,
    atTick: number,
    matchId: string,
  ): boolean
  listForAccount(accountId: AccountId): ReadonlyArray<AchievementProgress>
  countUnlockedForAccount(accountId: AccountId): number
}

export class InMemoryAchievementStore implements AchievementStore {
  private readonly perAccount = new Map<AccountId, Map<AchievementId, AchievementProgress>>()

  private getOrCreateMap(accountId: AccountId): Map<AchievementId, AchievementProgress> {
    let m = this.perAccount.get(accountId)
    if (!m) {
      m = new Map()
      this.perAccount.set(accountId, m)
    }
    return m
  }

  getProgress(accountId: AccountId, achievementId: AchievementId): AchievementProgress | null {
    return this.perAccount.get(accountId)?.get(achievementId) ?? null
  }

  ensureProgress(
    accountId: AccountId,
    achievementId: AchievementId,
    progressTarget: number,
  ): AchievementProgress {
    const m = this.getOrCreateMap(accountId)
    let progress = m.get(achievementId)
    if (!progress) {
      progress = newAchievementProgress(achievementId, progressTarget)
      m.set(achievementId, progress)
    }
    return progress
  }

  recordUnlock(
    accountId: AccountId,
    achievementId: AchievementId,
    atTick: number,
    matchId: string,
  ): boolean {
    const progress = this.ensureProgress(accountId, achievementId, 1)
    return unlockAchievement(progress, atTick, matchId)
  }

  listForAccount(accountId: AccountId): ReadonlyArray<AchievementProgress> {
    const m = this.perAccount.get(accountId)
    if (!m) return []
    return Array.from(m.values())
  }

  countUnlockedForAccount(accountId: AccountId): number {
    const m = this.perAccount.get(accountId)
    if (!m) return 0
    let count = 0
    for (const progress of m.values()) {
      if (progress.unlockedAtTick !== null) count += 1
    }
    return count
  }
}
