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

export function AchievementsPanel({
  progressList,
  currentTick,
  showHidden = false,
}: AchievementsPanelProps) {
  const progressIndex = new Map(progressList.map((p) => [p.achievementId, p]))
  const visible = ACHIEVEMENTS.filter((a) => {
    if (!a.hidden) return true
    if (showHidden) return true
    const progress = progressIndex.get(a.id)
    return progress ? isAchievementUnlocked(progress) : false
  })
  const unlockedCount = progressList.filter(isAchievementUnlocked).length
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
        <ul className="achievements-panel__list">
          {visible.map((def) => (
            <AchievementRow
              key={def.id}
              def={def}
              progress={progressIndex.get(def.id) ?? null}
              currentTick={currentTick}
            />
          ))}
        </ul>
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
