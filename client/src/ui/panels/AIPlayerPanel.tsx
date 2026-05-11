import {
  type AIPersonalityBias,
  type AIDifficultyConfig,
  type AIDifficultyLevel,
  type PlaystyleArchetype,
  type PlaystyleProfile,
  type Theme,
  aiBiasForTheme,
  getAIDifficultyConfig,
  getPlaystyleProfile,
} from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import './AIPlayerPanel.css'

export interface AIPlayerSnapshot {
  readonly civLabel: string
  readonly theme: Theme
  readonly playstyle: PlaystyleArchetype
  readonly difficulty: AIDifficultyLevel
  readonly lastDecisionLine: string | null
  readonly lastTick: number
}

interface AIPlayerPanelProps {
  readonly snapshots: ReadonlyArray<AIPlayerSnapshot>
}

export function AIPlayerPanel({ snapshots }: AIPlayerPanelProps) {
  const variant = snapshots.some((s) => s.difficulty === 'brutal') ? 'red' : 'blue'
  return (
    <LCDFrame
      title="🤖 AI Players"
      statusGlyph="◈"
      statusLabel={`${snapshots.length} hostile`}
      variant={variant}
    >
      <div className="ai-panel">
        {snapshots.length === 0 ? (
          <p className="ai-panel__empty">No AI civs in this match.</p>
        ) : (
          <ul className="ai-panel__list">
            {snapshots.map((snap, idx) => (
              <AIPlayerRow key={`${snap.civLabel}-${idx}`} snap={snap} />
            ))}
          </ul>
        )}
      </div>
    </LCDFrame>
  )
}

interface AIPlayerRowProps {
  readonly snap: AIPlayerSnapshot
}

function AIPlayerRow({ snap }: AIPlayerRowProps) {
  const profile: PlaystyleProfile = getPlaystyleProfile(snap.playstyle)
  const difficulty: AIDifficultyConfig = getAIDifficultyConfig(snap.difficulty)
  const themeBias: AIPersonalityBias = aiBiasForTheme(snap.theme)
  return (
    <li className="ai-panel__row">
      <header className="ai-panel__row-head">
        <span className="ai-panel__theme">
          {snap.theme.emoji} {snap.theme.name}
        </span>
        <span className="ai-panel__civ">{snap.civLabel}</span>
      </header>
      <div className="ai-panel__chips">
        <span className="ai-panel__chip ai-panel__chip--playstyle">
          {profile.emoji} {profile.name}
        </span>
        <span
          className={`ai-panel__chip ai-panel__chip--difficulty ai-panel__chip--diff-${difficulty.level}`}
        >
          {difficulty.emoji} {difficulty.name}
        </span>
      </div>
      <p className="ai-panel__desc">{profile.description}</p>
      <div className="ai-panel__bias">
        <BiasBar label="aggression" value={themeBias.aggression} />
        <BiasBar label="expansion" value={themeBias.expansion} />
        <BiasBar label="propaganda" value={themeBias.propagandaSpend} />
        <BiasBar label="forbidden" value={themeBias.forbiddenTechAffinity} />
        <BiasBar label="suicide-ship" value={themeBias.suicideShipPreference} />
        <BiasBar label="betrayal" value={profile.betrayalProbability} />
      </div>
      <footer className="ai-panel__row-foot">
        <span className="ai-panel__last-tick">T+{snap.lastTick}</span>
        <span className="ai-panel__last-decision">
          {snap.lastDecisionLine ?? 'awaiting first decision tick…'}
        </span>
      </footer>
    </li>
  )
}

interface BiasBarProps {
  readonly label: string
  readonly value: number
}

function BiasBar({ label, value }: BiasBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div className="ai-panel__bias-row">
      <span className="ai-panel__bias-label">{label}</span>
      <span className="ai-panel__bias-track">
        <span className="ai-panel__bias-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="ai-panel__bias-value">{pct}</span>
    </div>
  )
}
