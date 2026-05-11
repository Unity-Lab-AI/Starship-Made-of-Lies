import {
  type AIDifficultyLevel,
  type CivId,
  type PlaystyleArchetype,
  type ThemeId,
  getAIDifficultyConfig,
  getPlaystyleProfile,
  getTheme,
} from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import './LobbyPreviewPanel.css'

export type LobbySlotKind = 'human' | 'ai' | 'empty'
export type LobbyPhaseLabel = 'CONFIGURING' | 'STARTING' | 'IN_MATCH' | 'COMPLETE'

export interface LobbyPreviewSlot {
  readonly slotIndex: number
  readonly kind: LobbySlotKind
  readonly civId: CivId | null
  readonly displayName: string
  readonly themeId: ThemeId | null
  readonly themeLocked: boolean
  readonly ready: boolean
  readonly aiPlaystyle: PlaystyleArchetype | null
  readonly aiDifficulty: AIDifficultyLevel | null
  readonly isHost: boolean
}

export interface LobbyPreviewSummary {
  readonly phase: LobbyPhaseLabel
  readonly planetCount: number
  readonly playerCount: number
  readonly matchLength: 'blitz' | 'standard' | 'epic'
  readonly winConditionsLabel: string
  readonly biomesLabel: string
  readonly coopMode: boolean
  readonly slots: ReadonlyArray<LobbyPreviewSlot>
}

interface LobbyPreviewPanelProps {
  readonly summary: LobbyPreviewSummary
}

const PHASE_VARIANT: Readonly<Record<LobbyPhaseLabel, 'amber' | 'green' | 'blue' | 'red'>> = {
  CONFIGURING: 'amber',
  STARTING: 'blue',
  IN_MATCH: 'green',
  COMPLETE: 'red',
}

const MATCH_LENGTH_LABELS: Readonly<Record<LobbyPreviewSummary['matchLength'], string>> = {
  blitz: 'Blitz · 3000 ticks',
  standard: 'Standard · 9000 ticks',
  epic: 'Epic · 18000 ticks',
}

export function LobbyPreviewPanel({ summary }: LobbyPreviewPanelProps) {
  const variant = PHASE_VARIANT[summary.phase]
  const activeCount = summary.slots.filter((s) => s.kind !== 'empty').length
  return (
    <LCDFrame
      title="🎯 Lobby"
      statusGlyph="◆"
      statusLabel={`${summary.phase} · ${activeCount}/${summary.slots.length}`}
      variant={variant}
    >
      <div className="lobby-panel">
        <div className="lobby-panel__config">
          <span className="lobby-panel__cfg-row">🌌 {summary.planetCount} planets</span>
          <span className="lobby-panel__cfg-row">⏱ {MATCH_LENGTH_LABELS[summary.matchLength]}</span>
          <span className="lobby-panel__cfg-row">🏆 {summary.winConditionsLabel}</span>
          <span className="lobby-panel__cfg-row">🌿 {summary.biomesLabel}</span>
          <span className="lobby-panel__cfg-row">
            {summary.coopMode ? '🤝 Co-op ON' : '⚔ Free-for-all'}
          </span>
        </div>
        <ul className="lobby-panel__slots">
          {summary.slots.map((slot) => (
            <SlotRow key={slot.slotIndex} slot={slot} />
          ))}
        </ul>
      </div>
    </LCDFrame>
  )
}

function SlotRow({ slot }: { readonly slot: LobbyPreviewSlot }) {
  const theme = slot.themeId ? getTheme(slot.themeId) : null
  const playstyle = slot.aiPlaystyle ? getPlaystyleProfile(slot.aiPlaystyle) : null
  const difficulty = slot.aiDifficulty ? getAIDifficultyConfig(slot.aiDifficulty) : null
  return (
    <li
      className={`lobby-panel__slot lobby-panel__slot--${slot.kind} ${
        slot.ready ? 'lobby-panel__slot--ready' : ''
      } ${slot.isHost ? 'lobby-panel__slot--host' : ''}`}
    >
      <span className="lobby-panel__slot-index">#{slot.slotIndex + 1}</span>
      {slot.kind === 'empty' ? (
        <span className="lobby-panel__slot-empty">— empty —</span>
      ) : (
        <>
          <span className="lobby-panel__slot-name">
            {slot.kind === 'ai' ? '🤖 ' : '👤 '}
            {slot.displayName}
            {slot.isHost && <span className="lobby-panel__host-tag"> · HOST</span>}
          </span>
          {theme && (
            <span
              className={`lobby-panel__slot-theme ${slot.themeLocked ? 'lobby-panel__slot-theme--locked' : ''}`}
            >
              {theme.emoji} {theme.name}
              {slot.themeLocked ? ' 🔒' : ''}
            </span>
          )}
          {playstyle && difficulty && (
            <span className="lobby-panel__slot-ai">
              {playstyle.emoji} {playstyle.name} · {difficulty.emoji} {difficulty.name}
            </span>
          )}
          <span
            className={`lobby-panel__slot-ready ${slot.ready ? 'lobby-panel__slot-ready--on' : ''}`}
          >
            {slot.ready ? '✓ ready' : '· waiting'}
          </span>
        </>
      )}
    </li>
  )
}
