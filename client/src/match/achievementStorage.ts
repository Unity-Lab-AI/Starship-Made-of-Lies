import {
  type AchievementId,
  type AchievementProgress,
  ACHIEVEMENTS,
  newAchievementProgress,
  unlockAchievement,
} from '@smol/shared'

// PHASE 17.12.6 — localStorage-backed achievement progress store. Persists unlocks per-device
// across matches. When PHASE 17.0 sign-in ships, this gets paired with a cloud store keyed by
// AccountId — until then, anonymous-local progress lives here. Per the
// no-mock-player-data-anywhere LAW, we ship REAL progress only — empty state on first launch,
// populated by actual match-end unlocks.

const STORAGE_KEY = 'smol.achievements.v1'

interface PersistShape {
  readonly entries: ReadonlyArray<AchievementProgress>
}

export function loadAchievementProgress(): AchievementProgress[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<PersistShape>
    if (!Array.isArray(parsed.entries)) return []
    return parsed.entries.map((entry) => ({
      achievementId: entry.achievementId,
      unlockedAtTick: entry.unlockedAtTick,
      unlockedInMatchId: entry.unlockedInMatchId,
      progress: entry.progress,
      progressTarget: entry.progressTarget,
    }))
  } catch {
    return []
  }
}

export function saveAchievementProgress(entries: ReadonlyArray<AchievementProgress>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: PersistShape = { entries }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota exceeded / sandbox / private-mode — silently drop. Achievement progress is
    // best-effort cosmetic state; failing to persist isn't game-breaking.
  }
}

// Apply a batch of newly-earned unlocks to the persisted progress list. Returns the subset
// that ACTUALLY transitioned from locked → unlocked (skipping ones already unlocked from a
// prior match). Caller surfaces only the actual transitions via toast so re-playing doesn't
// spam the player with already-known unlocks.
export function applyAchievementUnlocks(
  unlockedIds: ReadonlyArray<AchievementId>,
  atTick: number,
  matchId: string,
): ReadonlyArray<AchievementId> {
  if (unlockedIds.length === 0) return []
  const list = loadAchievementProgress()
  const index = new Map(list.map((p) => [p.achievementId, p]))
  const newlyUnlocked: AchievementId[] = []
  for (const id of unlockedIds) {
    let progress = index.get(id)
    if (!progress) {
      progress = newAchievementProgress(id, 1)
      list.push(progress)
      index.set(id, progress)
    }
    const transitioned = unlockAchievement(progress, atTick, matchId)
    if (transitioned) newlyUnlocked.push(id)
  }
  saveAchievementProgress(list)
  return newlyUnlocked
}

// Convenience: returns the current progress list with a fresh empty-progress entry filled in
// for every achievement def so the panel can show locked rows alongside unlocked ones.
export function loadAchievementProgressFull(): AchievementProgress[] {
  const stored = loadAchievementProgress()
  const index = new Map(stored.map((p) => [p.achievementId, p]))
  const out: AchievementProgress[] = []
  for (const def of ACHIEVEMENTS) {
    const existing = index.get(def.id)
    if (existing) out.push(existing)
    else out.push(newAchievementProgress(def.id, 1))
  }
  return out
}

export function clearAchievementProgress(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
