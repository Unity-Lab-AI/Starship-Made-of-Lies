import {
  type LeaderboardCategory,
  type LeaderboardCategoryDef,
  type ScoreEntry,
  LEADERBOARD_CATEGORIES,
} from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import './HallOfChampionsPanel.css'

export interface CategoryBoardSnapshot {
  readonly categoryId: LeaderboardCategory
  readonly themeLabel: string | null
  readonly topEntries: ReadonlyArray<ScoreEntry>
}

interface HallOfChampionsPanelProps {
  readonly boards: ReadonlyArray<CategoryBoardSnapshot>
  readonly highlightCategoryId?: LeaderboardCategory
}

export function HallOfChampionsPanel({ boards, highlightCategoryId }: HallOfChampionsPanelProps) {
  return (
    <LCDFrame
      title="🏛️ Hall of Champions"
      statusGlyph="◈"
      statusLabel={`${boards.length} boards`}
      variant="amber"
    >
      <div className="hoc-panel">
        {boards.length === 0 ? (
          <p className="hoc-panel__empty">No leaderboards recorded yet.</p>
        ) : (
          <ul className="hoc-panel__list">
            {boards.map((board, idx) => (
              <CategoryBoard
                key={`${board.categoryId}-${board.themeLabel ?? 'global'}-${idx}`}
                board={board}
                highlight={highlightCategoryId === board.categoryId}
              />
            ))}
          </ul>
        )}
      </div>
    </LCDFrame>
  )
}

interface CategoryBoardProps {
  readonly board: CategoryBoardSnapshot
  readonly highlight: boolean
}

function CategoryBoard({ board, highlight }: CategoryBoardProps) {
  const def: LeaderboardCategoryDef | undefined = LEADERBOARD_CATEGORIES.find(
    (c) => c.id === board.categoryId,
  )
  if (!def) return null
  return (
    <li className={`hoc-panel__board ${highlight ? 'hoc-panel__board--highlight' : ''}`}>
      <header className="hoc-panel__board-head">
        <span className="hoc-panel__board-title">
          {def.emoji} {def.name}
          {board.themeLabel && <span className="hoc-panel__theme-tag"> · {board.themeLabel}</span>}
        </span>
        <span className="hoc-panel__board-desc">{def.description}</span>
      </header>
      {board.topEntries.length === 0 ? (
        <p className="hoc-panel__board-empty">No scores yet.</p>
      ) : (
        <ol className="hoc-panel__entries">
          {board.topEntries.slice(0, 5).map((entry, i) => (
            <EntryRow key={`${entry.matchId}-${entry.accountId}-${i}`} entry={entry} rank={i + 1} />
          ))}
        </ol>
      )}
    </li>
  )
}

interface EntryRowProps {
  readonly entry: ScoreEntry
  readonly rank: number
}

function EntryRow({ entry, rank }: EntryRowProps) {
  return (
    <li className={`hoc-panel__entry hoc-panel__entry--rank-${rank}`}>
      <span className="hoc-panel__rank">#{rank}</span>
      <span className="hoc-panel__name">{entry.displayName}</span>
      <span className="hoc-panel__handle">@{entry.handle}</span>
      <span className="hoc-panel__score">{entry.score.toLocaleString()}</span>
    </li>
  )
}
