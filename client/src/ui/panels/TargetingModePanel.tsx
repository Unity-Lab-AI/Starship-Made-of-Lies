import {
  TARGETING_MODE_DESCRIPTION,
  TARGETING_MODE_DISPERSION_MULTIPLIER,
  TARGETING_MODE_EMOJI,
  TARGETING_MODE_LABEL,
  type TargetingMode,
} from '@smol/shared'
import './TargetingModePanel.css'

// PHASE 16.33 — UMS 6-mode targeting picker per SMOL_REFERENCE_MISSILE.md UnityMissile.cs spec.
// Renders one card per mode (GPS / ANTENNA / SENSOR / LIDAR / MANUAL / SATELLITE) with the mode
// emoji + label + description + dispersion multiplier + tech-gate badge. The selected mode is
// owned by the parent (PlayPage local state) and passed in via `currentMode` + `onModeChange`.
// Tech-gating is enforced inside the component — modes whose required tech is not researched
// render disabled (visible but unselectable), so the player can see what unlocks at each tier.
//
// The dispersion-multiplier values are sourced from TARGETING_MODE_DISPERSION_MULTIPLIER (the
// shared canonical map) so any future rebalance lands in one place and propagates here.

const ALL_MODES: ReadonlyArray<TargetingMode> = [
  'GPS',
  'ANTENNA',
  'SENSOR',
  'LIDAR',
  'MANUAL',
  'SATELLITE',
]

// Tech-id strings match `.claude/SMOL_REFERENCE_MISSILE.md` + tech.ts identifiers. GPS + MANUAL
// require no tech (always available). The others gate on canonical mid-tier techs already
// shipping in tech.ts. PHASE 16.33 keeps gating loose — modes ALWAYS appear in the picker but
// render greyed-out + disabled when tech missing, so the player can plan ahead.
const TECH_GATE: Readonly<Record<TargetingMode, string | null>> = {
  GPS: null,
  ANTENNA: 'antenna-network',
  SENSOR: 'sensor-suite',
  LIDAR: 'lidar-array',
  MANUAL: null,
  SATELLITE: 'sat-laser-relay',
}

export interface TargetingModePanelProps {
  readonly currentMode: TargetingMode
  readonly onModeChange: (mode: TargetingMode) => void
  // Predicate that returns true when the player has researched the given tech id. Receives
  // a plain string so callers don't have to brand the lookup — the panel only knows the
  // canonical tech-id strings from TECH_GATE. Passing `() => false` effectively leaves only
  // GPS + MANUAL playable, which matches the early-game baseline.
  readonly isTechResearched: (techId: string) => boolean
  readonly onClose?: () => void
}

function dispersionLabel(mode: TargetingMode): string {
  const mult = TARGETING_MODE_DISPERSION_MULTIPLIER[mode]
  if (mult < 1) return `−${Math.round((1 - mult) * 100)}% scatter (tighter)`
  if (mult > 1) return `+${Math.round((mult - 1) * 100)}% scatter (looser)`
  return 'baseline scatter'
}

export function TargetingModePanel({
  currentMode,
  onModeChange,
  isTechResearched,
  onClose,
}: TargetingModePanelProps) {
  return (
    <div className="targeting-mode-panel">
      <header className="targeting-mode-panel__header">
        <span className="targeting-mode-panel__title">Targeting Mode</span>
        <span className="targeting-mode-panel__current">
          Active: {TARGETING_MODE_EMOJI[currentMode]} {TARGETING_MODE_LABEL[currentMode]}
        </span>
        {onClose ? (
          <button
            type="button"
            className="targeting-mode-panel__close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        ) : null}
      </header>
      <div className="targeting-mode-panel__grid">
        {ALL_MODES.map((mode) => {
          const techGate = TECH_GATE[mode]
          const locked = techGate !== null && !isTechResearched(techGate)
          const active = currentMode === mode
          const cls = [
            'targeting-mode-panel__card',
            active ? 'targeting-mode-panel__card--active' : '',
            locked ? 'targeting-mode-panel__card--locked' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={mode}
              type="button"
              className={cls}
              onClick={() => {
                if (locked) return
                onModeChange(mode)
              }}
              disabled={locked}
              title={
                locked
                  ? `Requires research: ${techGate}`
                  : `Pick ${TARGETING_MODE_LABEL[mode]} mode for the next launch`
              }
            >
              <div className="targeting-mode-panel__card-head">
                <span className="targeting-mode-panel__card-emoji">
                  {TARGETING_MODE_EMOJI[mode]}
                </span>
                <span className="targeting-mode-panel__card-name">
                  {TARGETING_MODE_LABEL[mode]}
                </span>
              </div>
              <div className="targeting-mode-panel__card-desc">
                {TARGETING_MODE_DESCRIPTION[mode]}
              </div>
              <div className="targeting-mode-panel__card-stats">
                <span className="targeting-mode-panel__card-stat">{dispersionLabel(mode)}</span>
                {techGate ? (
                  <span
                    className={
                      locked
                        ? 'targeting-mode-panel__card-tech targeting-mode-panel__card-tech--locked'
                        : 'targeting-mode-panel__card-tech targeting-mode-panel__card-tech--unlocked'
                    }
                  >
                    {locked ? '🔒' : '✓'} {techGate}
                  </span>
                ) : (
                  <span className="targeting-mode-panel__card-tech targeting-mode-panel__card-tech--unlocked">
                    ✓ always available
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
