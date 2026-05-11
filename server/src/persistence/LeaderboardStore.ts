import {
  type LeaderboardCategory,
  type LeaderboardKey,
  type LeaderboardSnapshot,
  type ScoreEntry,
  DEFAULT_LEADERBOARD_TOP_N,
  leaderboardKeyToString,
  sortEntries,
} from '@smol/shared'

export interface LeaderboardStore {
  recordEntry(key: LeaderboardKey, entry: ScoreEntry, capturedAtTick: number): void
  getSnapshot(key: LeaderboardKey, topN?: number): LeaderboardSnapshot | null
  listCategoryKeys(category: LeaderboardCategory): ReadonlyArray<LeaderboardKey>
  reset(key: LeaderboardKey): boolean
}

interface BoardEntries {
  readonly key: LeaderboardKey
  entries: ScoreEntry[]
  capturedAtTick: number
}

export class InMemoryLeaderboardStore implements LeaderboardStore {
  private readonly boards = new Map<string, BoardEntries>()

  recordEntry(key: LeaderboardKey, entry: ScoreEntry, capturedAtTick: number): void {
    const id = leaderboardKeyToString(key)
    let board = this.boards.get(id)
    if (!board) {
      board = { key, entries: [], capturedAtTick }
      this.boards.set(id, board)
    }
    board.entries.push(entry)
    board.capturedAtTick = capturedAtTick
    const sorted = sortEntries(board.entries, key.category)
    board.entries = sorted.slice(0, DEFAULT_LEADERBOARD_TOP_N * 4) as ScoreEntry[]
  }

  getSnapshot(
    key: LeaderboardKey,
    topN: number = DEFAULT_LEADERBOARD_TOP_N,
  ): LeaderboardSnapshot | null {
    const board = this.boards.get(leaderboardKeyToString(key))
    if (!board) return null
    const sorted = sortEntries(board.entries, key.category)
    return {
      key,
      topEntries: sorted.slice(0, topN),
      capturedAtTick: board.capturedAtTick,
    }
  }

  listCategoryKeys(category: LeaderboardCategory): ReadonlyArray<LeaderboardKey> {
    const out: LeaderboardKey[] = []
    for (const board of this.boards.values()) {
      if (board.key.category === category) out.push(board.key)
    }
    return out
  }

  reset(key: LeaderboardKey): boolean {
    return this.boards.delete(leaderboardKeyToString(key))
  }
}
