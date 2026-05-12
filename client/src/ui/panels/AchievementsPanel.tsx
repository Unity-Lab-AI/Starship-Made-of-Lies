import { useMemo, useState } from 'react'
import {
  type AchievementDef,
  type AchievementProgress,
  type AchievementRarity,
  ACHIEVEMENTS,
  getAchievementDef,
  isAchievementUnlocked,
} from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import './AchievementsPanel.css'

type AchievementFilterMode = 'all' | 'unlocked' | 'locked'

interface AchievementsPanelProps {
  readonly progressList: ReadonlyArray<AchievementProgress>
  readonly currentTick: number
  readonly showHidden?: boolean
}

const RARITY_GLYPH: Readonly<Record<AchievementRarity, string>> = {
  common: '◇',
  uncommon: '◈',
  rare: '◆',
  epic: '✦',
  apex: '✶',
}

const FILTER_LABELS: Readonly<Record<AchievementFilterMode, string>> = {
  all: 'All',
  unlocked: 'Unlocked',
  locked: 'Locked',
}

export function AchievementsPanel({
  progressList,
  currentTick,
  showHidden = false,
}: AchievementsPanelProps) {
  const [filterMode, setFilterMode] = useState<AchievementFilterMode>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const progressIndex = useMemo(
    () => new Map(progressList.map((p) => [p.achievementId, p])),
    [progressList],
  )
  const baseVisible = useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => {
        if (!a.hidden) return true
        if (showHidden) return true
        const progress = progressIndex.get(a.id)
        return progress ? isAchievementUnlocked(progress) : false
      }),
    [progressIndex, showHidden],
  )
  const filtered = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase()
    return baseVisible.filter((def) => {
      if (filterMode !== 'all') {
        const progress = progressIndex.get(def.id)
        const unlocked = progress ? isAchievementUnlocked(progress) : false
        if (filterMode === 'unlocked' && !unlocked) return false
        if (filterMode === 'locked' && unlocked) return false
      }
      if (needle) {
        const hay = `${def.name} ${def.description}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [baseVisible, filterMode, searchTerm, progressIndex])

  const unlockedCount = useMemo(
    () => progressList.filter(isAchievementUnlocked).length,
    [progressList],
  )
  const progressPct =
    ACHIEVEMENTS.length > 0 ? Math.round((unlockedCount / ACHIEVEMENTS.length) * 100) : 0
  return (
    <LCDFrame
      title="🏅 Achievements"
      statusGlyph="◆"
      statusLabel={`${unlockedCount}/${ACHIEVEMENTS.length} (${progressPct}%)`}
      variant="green"
    >
      <div className="achievements-panel">
        <div
          className="achievements-panel__progress"
          role="img"
          aria-label="Total achievement progress"
        >
          <div className="achievements-panel__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="achievements-panel__filters">
          <div className="achievements-panel__filter-modes" role="tablist">
            {(['all', 'unlocked', 'locked'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={filterMode === m}
                className={`achievements-panel__filter-mode${filterMode === m ? ' achievements-panel__filter-mode--active' : ''}`}
                onClick={() => setFilterMode(m)}
              >
                {FILTER_LABELS[m]}
              </button>
            ))}
          </div>
          <input
            type="search"
            className="achievements-panel__search"
            placeholder="Search achievements…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search achievements by name or description"
          />
          <span className="achievements-panel__filter-count">
            {filtered.length}/{baseVisible.length}
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className="achievements-panel__empty">No achievements match the current filter.</p>
        ) : (
          <ul className="achievements-panel__list">
            {filtered.map((def) => (
              <AchievementRow
                key={def.id}
                def={def}
                progress={progressIndex.get(def.id) ?? null}
                currentTick={currentTick}
              />
            ))}
          </ul>
        )}
      </div>
    </LCDFrame>
  )
}

interface AchievementRowProps {
  readonly def: AchievementDef
  readonly progress: AchievementProgress | null
  readonly currentTick: number
}

function AchievementRow({ def, progress, currentTick }: AchievementRowProps) {
  const unlocked = progress !== null && isAchievementUnlocked(progress)
  const ticksAgo =
    unlocked && progress?.unlockedAtTick !== null && progress?.unlockedAtTick !== undefined
      ? Math.max(0, currentTick - progress.unlockedAtTick)
      : null
  return (
    <li
      className={`achievements-panel__row achievements-panel__row--${def.rarity} ${
        unlocked ? 'achievements-panel__row--unlocked' : 'achievements-panel__row--locked'
      }`}
    >
      <span className="achievements-panel__icon">
        <span className="achievements-panel__rarity">{RARITY_GLYPH[def.rarity]}</span>
        <span className="achievements-panel__emoji">{def.emoji}</span>
      </span>
      <div className="achievements-panel__body">
        <div className="achievements-panel__name">
          {def.name}
          <span
            className={`achievements-panel__rarity-tag achievements-panel__rarity-tag--${def.rarity}`}
          >
            {def.rarity}
          </span>
        </div>
        <div className="achievements-panel__desc">{def.description}</div>
      </div>
      <span className="achievements-panel__status">{unlocked ? `T-${ticksAgo}` : 'locked'}</span>
    </li>
  )
}

export function buildMockProgressList(): ReadonlyArray<AchievementProgress> {
  const ids = [
    'first-colony',
    'first-ship-launched',
    'first-victory',
    'ten-planet-empire',
    'first-civ-eliminated',
    'mass-deception',
  ]
  const out: AchievementProgress[] = []
  for (const id of ids) {
    const def = getAchievementDef(id)
    if (!def) continue
    out.push({
      achievementId: id,
      unlockedAtTick: 100 + Math.floor(Math.random() * 1000),
      unlockedInMatchId: 'mock-match-1',
      progress: 1,
      progressTarget: 1,
    })
  }
  return out
}
