import { type LastHopeEvacState } from '@smol/shared'
import './LastHopePanel.css'

interface LastHopePanelProps {
  readonly state: LastHopeEvacState | null
  readonly triggered: boolean
  readonly canTrigger: boolean
  readonly onTrigger: () => void
}

const PHASE_LABEL: Readonly<Record<string, string>> = {
  IDLE: 'Idle',
  PACKING: 'Packing essentials...',
  BUILDING: 'Building emergency ark...',
  LAUNCHING: 'Final boarding...',
  IN_FLIGHT: 'En route — last gambit',
  COMPLETE: 'Departed',
}

export function LastHopePanel({ state, triggered, canTrigger, onTrigger }: LastHopePanelProps) {
  if (!state && !triggered) {
    return (
      <section className="last-hope-panel last-hope-panel--idle" aria-label="Last Hope evacuation">
        <header className="last-hope-panel__header">
          <h2>🚨 LAST HOPE</h2>
        </header>
        <p className="last-hope-panel__hint">
          When your civilization is on the brink — pack who you can, build a desperate ark, flee to
          an unexplored planet. No coming back.
        </p>
        <button
          type="button"
          className="last-hope-panel__trigger"
          onClick={onTrigger}
          disabled={!canTrigger}
        >
          {canTrigger ? 'Trigger Last Hope Evac' : 'Already triggered'}
        </button>
      </section>
    )
  }
  if (!state) return null
  return (
    <section className="last-hope-panel last-hope-panel--active" aria-label="Last Hope evacuation">
      <header className="last-hope-panel__header">
        <h2>🚨 LAST HOPE — IN PROGRESS</h2>
      </header>
      <div className="last-hope-panel__phase">{PHASE_LABEL[state.phase] ?? state.phase}</div>
      <ul className="last-hope-panel__details">
        <li>Citizens packed: {state.citizensAboard}</li>
        <li>Started at tick {state.startedAtTick}</li>
        {state.targetPlanetId && <li>Target: {String(state.targetPlanetId)}</li>}
      </ul>
    </section>
  )
}
