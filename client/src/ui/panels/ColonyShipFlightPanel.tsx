import { abortFlight, type ColonyShipFlight, flightDef, type FlightPhase } from '@smol/shared'
import './ColonyShipFlightPanel.css'

interface ColonyShipFlightPanelProps {
  readonly flights: ReadonlyArray<ColonyShipFlight>
  readonly onAfterAction?: () => void
}

const PHASE_LABEL: Readonly<Record<FlightPhase, string>> = {
  CLIMB: 'Climbing',
  COAST: 'Coasting',
  REENTRY: 'Re-entry',
  TARGET: 'Targeting',
  DETONATE: 'Impacted',
  INTERCEPTED: 'Intercepted',
  ABORTED: 'Aborted',
  CRASH_LANDED: 'Crash-Landed',
}

const PHASE_GLYPH: Readonly<Record<FlightPhase, string>> = {
  CLIMB: '↗',
  COAST: '→',
  REENTRY: '↘',
  TARGET: '◎',
  DETONATE: '✦',
  INTERCEPTED: '✕',
  ABORTED: '⊘',
  CRASH_LANDED: '💥',
}

export function ColonyShipFlightPanel({ flights, onAfterAction }: ColonyShipFlightPanelProps) {
  return (
    <section className="flight-panel" aria-label="Colony ships in flight">
      <header className="flight-panel__header">
        <h2>🛰️ Flights</h2>
        <span className="flight-panel__count">{flights.length} active</span>
      </header>
      {flights.length === 0 ? (
        <p className="flight-panel__empty">No colony ships in flight.</p>
      ) : (
        <ul className="flight-panel__list">
          {flights.map((flight) => {
            const def = flightDef(flight)
            const progress = Math.min(1, flight.ticksFlown / Math.max(1, flight.totalTicks))
            return (
              <li
                key={flight.id}
                className={`flight-panel__row flight-panel__row--${flight.phase.toLowerCase()}`}
              >
                <div className="flight-panel__row-header">
                  <span className="flight-panel__ship-emoji" aria-hidden="true">
                    {def.emoji}
                  </span>
                  <span className="flight-panel__ship-name">{def.name}</span>
                  <span className="flight-panel__phase">
                    {PHASE_GLYPH[flight.phase]} {PHASE_LABEL[flight.phase]}
                  </span>
                </div>
                <div className="flight-panel__route">
                  <span>{flight.fromPlanetId}</span>
                  <span className="flight-panel__route-arrow">→</span>
                  <span>{flight.targetPlanetId}</span>
                </div>
                <div className="flight-panel__progress">
                  <div
                    className="flight-panel__progress-fill"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                  <span className="flight-panel__progress-label">
                    {flight.ticksFlown}/{flight.totalTicks} ticks
                  </span>
                </div>
                {flight.citizensAboard > 0 ? (
                  <div className="flight-panel__citizens">
                    👤 {flight.citizensAboard.toLocaleString()} citizens aboard
                  </div>
                ) : null}
                {flight.outcome ? (
                  <div
                    className={`flight-panel__outcome flight-panel__outcome--${flight.outcome.toLowerCase()}`}
                  >
                    {flight.outcome.replace('_', ' ')}
                  </div>
                ) : null}
                {flight.phase !== 'DETONATE' &&
                flight.phase !== 'INTERCEPTED' &&
                flight.phase !== 'ABORTED' ? (
                  <button
                    type="button"
                    className="flight-panel__abort"
                    onClick={() => {
                      abortFlight(flight)
                      onAfterAction?.()
                    }}
                  >
                    Abort
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
