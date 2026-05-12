import {
  type LeaderboardCategory,
  type LeaderboardKey,
  type ScoreEntry,
  LEADERBOARD_CATEGORIES,
  leaderboardKeyToString,
  sortEntries,
} from '@smol/shared'

// PHASE 17.12.7 — localStorage-backed Hall of Champions store. Persists ScoreEntry per
// LeaderboardKey across matches on this device. NEVER mock per the no-mock-player-data
// LAW — empty state on first launch, populated by actual match-end resolution. When PHASE
// 17.0 sign-in lands, this gets paired with a cloud store keyed by AccountId.

const STORAGE_KEY = 'smol.hallOfChampions.v1'
const MAX_ENTRIES_PER_BOARD = 25 // keep top-25; UI typically renders top-5 or top-10

interface PersistShape {
  // Keyed by leaderboardKeyToString(key). Value: list of entries (already sorted, but we
  // re-sort on read to handle migration / category-rule changes).
  readonly boards: Readonly<Record<string, ReadonlyArray<ScoreEntry>>>
}

export function loadLeaderboards(): Record<string, ReadonlyArray<ScoreEntry>> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<PersistShape>
    return parsed.boards ? { ...parsed.boards } : {}
  } catch {
    return {}
  }
}

export function saveLeaderboards(boards: Record<string, ReadonlyArray<ScoreEntry>>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: PersistShape = { boards }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota / sandbox / private-mode — best-effort, swallow.
  }
}

// Apply a batch of match-end score entries to the persisted store. For each (key, entry)
// pair: insert the entry, re-sort by the category's higherIsBetter rule, truncate to MAX.
// Returns the boards that actually changed (so the UI can surface "new high score" toasts
// in a future polish pass; v1 just persists silently).
export function applyMatchScores(
  scoresWithKeys: ReadonlyArray<{ key: LeaderboardKey; entry: ScoreEntry }>,
): void {
  if (scoresWithKeys.length === 0) return
  const boards = loadLeaderboards()
  for (const { key, entry } of scoresWithKeys) {
    const keyStr = leaderboardKeyToString(key)
    const existing = boards[keyStr] ?? []
    const next = [...existing, entry]
    const sorted = sortEntries(next, key.category).slice(0, MAX_ENTRIES_PER_BOARD)
    boards[keyStr] = sorted
  }
  saveLeaderboards(boards)
}

// Convenience used by the in-game HallOfChampionsPanel: returns the top-N entries per
// global (non-perTheme) category. perTheme boards skip; the standalone AchievementsPage
// already handles per-theme selection via its theme dropdown.
export interface CategorySnapshot {
  readonly categoryId: LeaderboardCategory
  readonly themeLabel: string | null
  readonly topEntries: ReadonlyArray<ScoreEntry>
}

export function loadGlobalCategorySnapshots(topN = 10): ReadonlyArray<CategorySnapshot> {
  const boards = loadLeaderboards()
  const out: CategorySnapshot[] = []
  for (const def of LEADERBOARD_CATEGORIES) {
    if (def.perTheme) continue
    const key: LeaderboardKey = { category: def.id, themeId: null }
    const entries = boards[leaderboardKeyToString(key)] ?? []
    out.push({
      categoryId: def.id,
      themeLabel: null,
      topEntries: entries.slice(0, topN),
    })
  }
  return out
}

export function clearLeaderboards(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
