import {
  type ColonyShipFlight,
  type PlanetId,
  TARGETING_MODE_EMOJI,
  TARGETING_MODE_LABEL,
  flightTelemetrySnapshot,
  getColonyShipDef,
} from '@smol/shared'
import './FlightDetailPanel.css'

// PHASE 16.23 — selectable in-flight ship make-up popup per user verbatim LAW #0 2026-05-10:
// "when tracking and following a ship fly through space they should be selectable oand show
// their make up creww supply fule water all of that spped current task ect ect".
//
// Matches UMS UnityMissile.cs UNITY_MSL broadcast spec — every field the missile reports on
// its telemetry channel is surfaced here. Per-flight live telemetry (altitude / distance /
// closing speed / signal-lost) comes from flightTelemetrySnapshot helper (PHASE 16.21).
// Static per-variant load-out (fuel / ammo / cargo / citizens / payload type) comes from
// getColonyShipDef. Per-flight dynamic load-out (fuelRemaining, cargoBurned) is roadmapped
// to PHASE 16.24 (self-destruct + AoE damage scaling per the SMoL premise — "dark theme"
// in user shorthand was the dystopian fiction framing, NOT a code feature).

export interface FlightDetailPanelProps {
  readonly flight: ColonyShipFlight
  readonly currentTick: number
  readonly fromPlanetLabel?: string
  readonly toPlanetLabel?: string
  // PHASE 16.24-ready: when supplied, ABORT button calls this with the flight id. Wires
  // through to MatchSim abortFlight(flight) which sets phase=ABORTED + outcome=ABORTED.
  readonly onAbort?: (flightId: string) => void
  readonly onClose: () => void
  // PHASE 16.31 — god control. When godControlReady is true AND the flight is non-terminal,
  // the "Select for Redirect" button is shown. Clicking it fires onSelectForRedirect + closes
  // the panel; PlayPage enters redirect mode where the next right-click on a planet redirects
  // this flight via sim.redirectFlight.
  readonly godControlReady?: boolean
  readonly onSelectForRedirect?: (flightId: string) => void
}

function ticksToEtaLabel(ticks: number): string {
  if (ticks <= 0) return 'terminal'
  if (ticks < 60) return `${ticks}t`
  const min = Math.floor(ticks / 60)
  const rem = ticks % 60
  return `${min}m ${rem}t`
}

function phaseDescription(phase: ColonyShipFlight['phase']): string {
  switch (phase) {
    case 'CLIMB':
      return 'climbing out of source gravity well'
    case 'COAST':
      return 'coasting at cruise altitude'
    case 'REENTRY':
      return 'reentry burn — descending to target'
    case 'TARGET':
      return 'terminal approach — final guidance'
    case 'DETONATE':
      return 'detonated at target'
    case 'INTERCEPTED':
      return 'intercepted in flight'
    case 'ABORTED':
      return 'aborted by operator'
    case 'CRASH_LANDED':
      return 'crash-landed'
    case 'STRANDED':
      return 'out of signal range — LASER_HOME beacon active, help never coming'
    case 'EMPTY_HULK':
      return 'crew dead, no auto-guidance — drifting on last velocity through wrapped space'
  }
}

export function FlightDetailPanel({
  flight,
  currentTick,
  fromPlanetLabel,
  toPlanetLabel,
  onAbort,
  onClose,
  godControlReady,
  onSelectForRedirect,
}: FlightDetailPanelProps) {
  const def = getColonyShipDef(flight.variantId)
  const tel = flightTelemetrySnapshot(flight)
  const ticksRemaining = Math.max(0, flight.totalTicks - flight.ticksFlown)
  const inFlight =
    flight.phase !== 'DETONATE' &&
    flight.phase !== 'INTERCEPTED' &&
    flight.phase !== 'ABORTED' &&
    flight.phase !== 'CRASH_LANDED'
  // PHASE 16.29: counter-colony-ships are defensive interceptors launched by the planet
  // owner to intercept incoming attackers. Show an INTERCEPTOR badge in the header — but the
  // abort button is NO LONGER hidden for counters per user verbatim 2026-05-11 (LAW #0):
  // "hold up now all ships have abort that can be triggered by the player at any time".
  // Defenders may want to manually abort their own counter (e.g. wrong target chosen,
  // counter no longer needed, want to recover the AoE damage close to home, etc.).
  const isCounter = def.canIntercept
  // PHASE 16.32: ship-systems state. STRANDED → 🛰️ HELP ME beacon banner (help never comes
  // per user verbatim). EMPTY_HULK → 🪦 drifting-bomb banner. Starving crew → ⚠️ warning.
  const isStranded = flight.phase === 'STRANDED'
  const isEmptyHulk = flight.phase === 'EMPTY_HULK'
  const isStarving = tel.crewStarvationTimer > 0 && flight.crewAlive > 0

  const fromLabel = fromPlanetLabel ?? String(flight.fromPlanetId)
  const toLabel = toPlanetLabel ?? String(flight.targetPlanetId)
  void currentTick

  return (
    <div className="flight-detail-overlay" onClick={onClose}>
      <div
        className={`flight-detail-panel flight-detail-panel--tier${def.darknessTier}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flight-detail-panel__header">
          <span className="flight-detail-panel__variant">
            {def.emoji} {def.name}
          </span>
          {isCounter ? (
            <span className="flight-detail-panel__interceptor-badge">🛡️ INTERCEPTOR</span>
          ) : null}
          {isStranded ? (
            <span className="flight-detail-panel__stranded-badge">🛰️ STRANDED — HELP ME</span>
          ) : null}
          {isEmptyHulk ? (
            <span className="flight-detail-panel__hulk-badge">🪦 EMPTY HULK — DRIFTING</span>
          ) : null}
          <span
            className="flight-detail-panel__mode-badge"
            title={`Targeting mode: ${TARGETING_MODE_LABEL[flight.targetingMode]}`}
          >
            {TARGETING_MODE_EMOJI[flight.targetingMode]}{' '}
            {TARGETING_MODE_LABEL[flight.targetingMode]}
          </span>
          <span className="flight-detail-panel__tier">Darkness Tier {def.darknessTier}</span>
          <button
            type="button"
            className="flight-detail-panel__close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </header>

        <section className="flight-detail-panel__route">
          <span className="flight-detail-panel__route-from">{fromLabel}</span>
          <span className="flight-detail-panel__route-arrow">→</span>
          <span className="flight-detail-panel__route-to">{toLabel}</span>
        </section>

        <section className="flight-detail-panel__status">
          <div className="flight-detail-panel__status-line">
            <span className="flight-detail-panel__status-label">Current task:</span>
            <strong>{flight.phase}</strong>
            {tel.signalLost ? <span className="flight-detail-panel__signal-lost">📡✕</span> : null}
          </div>
          <div className="flight-detail-panel__status-desc">{phaseDescription(flight.phase)}</div>
        </section>

        <section className="flight-detail-panel__telemetry">
          <h4 className="flight-detail-panel__section-title">Live telemetry (UNITY_MSL)</h4>
          <div className="flight-detail-panel__grid">
            <FlightCell label="Distance to target" value={`${tel.distToTarget.toFixed(0)} units`} />
            <FlightCell label="Closing speed" value={`${tel.closingSpeed.toFixed(1)} u/t`} />
            <FlightCell label="Altitude (radial)" value={`${tel.altitude.toFixed(0)} units`} />
            <FlightCell label="Progress" value={`${Math.round(tel.progress * 100)}%`} />
            <FlightCell label="ETA" value={inFlight ? ticksToEtaLabel(ticksRemaining) : '—'} />
            <FlightCell label="Total flight" value={`${flight.totalTicks}t`} />
            <FlightCell
              label="Fuel remaining"
              value={`${tel.fuelRemaining.toFixed(0)}/${tel.fuelAtLaunch} u (${Math.round(tel.fuelPct * 100)}%)`}
            />
            <FlightCell
              label="Self-destruct AoE"
              value={
                def.suicideShip || def.payload.explosiveYield > 0 || def.payload.weaponPayload > 0
                  ? 'armed — explosive payload'
                  : 'no payload — small boom'
              }
            />
          </div>
        </section>

        <section className="flight-detail-panel__systems">
          <h4 className="flight-detail-panel__section-title">Ship systems (PHASE 16.32)</h4>
          <div className="flight-detail-panel__grid">
            <FlightCell
              label="Power source"
              value={`${tel.powerSource.toUpperCase()}${tel.powerSource === 'solar' ? ' (regen)' : ''}`}
            />
            <FlightCell
              label="Power remaining"
              value={`${tel.powerRemaining.toFixed(0)}/${tel.powerAtLaunch} (${Math.round(tel.powerPct * 100)}%)`}
            />
            <FlightCell
              label="Life support"
              value={
                tel.lifeSupportAtLaunch === 0
                  ? 'unmanned — N/A'
                  : `${tel.lifeSupportRemaining.toFixed(0)}/${tel.lifeSupportAtLaunch}t (${Math.round(tel.lifeSupportPct * 100)}%)`
              }
            />
            <FlightCell
              label="Crew alive"
              value={
                flight.citizensAboard === 0
                  ? 'unmanned'
                  : `${tel.crewAlive.toLocaleString()}/${flight.citizensAboard.toLocaleString()}${
                      isStarving ? ` ⚠️ STARVING (${tel.crewStarvationTimer}t left)` : ''
                    }`
              }
            />
            <FlightCell
              label="Auto-guidance"
              value={tel.autoGuidanceInstalled ? '✓ installed' : '✕ not installed (crew flies)'}
            />
            <FlightCell
              label="Signal range"
              value={`${tel.distFromLaunch.toFixed(0)}/${tel.signalRangeUnits}u${
                tel.signalLostTicks > 0 ? ` ⚠️ LOST ${tel.signalLostTicks}t` : ''
              }`}
            />
            {isEmptyHulk ? (
              <FlightCell
                label="Hulk drifted"
                value={`${tel.hulkTicksDrifted}t through wrapped space`}
              />
            ) : null}
          </div>
        </section>

        <section className="flight-detail-panel__makeup">
          <h4 className="flight-detail-panel__section-title">Make-up + load-out</h4>
          <div className="flight-detail-panel__grid">
            <FlightCell label="Crew / citizens" value={flight.citizensAboard.toLocaleString()} />
            <FlightCell
              label="Citizen capacity"
              value={def.payload.citizenCapacity.toLocaleString()}
            />
            <FlightCell label="Cargo capacity" value={def.payload.cargoCapacity.toLocaleString()} />
            <FlightCell label="Weapon payload" value={def.payload.weaponPayload.toLocaleString()} />
            <FlightCell
              label="Explosive yield"
              value={def.payload.explosiveYield.toLocaleString()}
            />
            <FlightCell
              label="Suicide ship"
              value={def.suicideShip ? 'yes — self-destructs on arrival' : 'no'}
            />
            <FlightCell label="Fuel at launch" value={`${def.fuelRequirement} u`} />
            <FlightCell label="Ammo at launch" value={`${def.ammoRequirement} u`} />
            <FlightCell label="Speed multiplier" value={def.speedMultiplier.toFixed(2) + '×'} />
            <FlightCell label="Evasion multiplier" value={def.evasionMultiplier.toFixed(2) + '×'} />
            <FlightCell label="Can intercept" value={def.canIntercept ? 'yes' : 'no'} />
            <FlightCell label="Category" value={def.category} />
          </div>
        </section>

        <section className="flight-detail-panel__description">
          <p>{def.description}</p>
        </section>

        {inFlight && (onAbort || (godControlReady && onSelectForRedirect)) ? (
          <section className="flight-detail-panel__actions">
            {godControlReady && onSelectForRedirect && !isCounter ? (
              <button
                type="button"
                className="flight-detail-panel__btn flight-detail-panel__btn--redirect"
                onClick={() => {
                  onSelectForRedirect(String(flight.id))
                  onClose()
                }}
                title="God Control redirect: right-click any planet after selecting to redirect this ship mid-arc. Works on STRANDED + EMPTY_HULK ships too — the god intervenes from above."
              >
                🕹️ Select for Redirect
              </button>
            ) : null}
            {onAbort ? (
              <button
                type="button"
                className="flight-detail-panel__btn flight-detail-panel__btn--abort"
                disabled={!flight.selfDestructInstalled}
                onClick={() => {
                  if (!flight.selfDestructInstalled) return
                  onAbort(String(flight.id))
                  onClose()
                }}
                title={
                  !flight.selfDestructInstalled
                    ? `🚫 Cannot self-destruct: ${
                        def.selfDestructCapable
                          ? 'research "Self-Destruct Systems" (tier 1 industrial). Ship has detonation hardware but the trigger network is not researched.'
                          : 'this variant has no detonation hardware (no warhead / no explosive payload / no interceptor charge). Ship can only end via planet impact, crash, crew starvation, power-out, fuel-out, or reactor end-of-life.'
                      } — per user verbatim 2026-05-11 "research and installed on the ship before u can self destruct ships".`
                    : isCounter
                      ? 'Self-destruct this counter-interceptor (player override — per user verbatim 2026-05-11 "all ships have abort that can be triggered by the player at any time"). AoE damage scales with fuel + payload at detonation.'
                      : 'Self-destruct the ship in-flight (UMS-faithful abort). AoE damage scales with fuel + payload at detonation.'
                }
              >
                💀 ABORT (self-destruct)
              </button>
            ) : null}
          </section>
        ) : null}

        {flight.outcome ? (
          <section className="flight-detail-panel__outcome">
            <span className="flight-detail-panel__outcome-label">Outcome:</span>
            <strong>{flight.outcome}</strong>
          </section>
        ) : null}
      </div>
    </div>
  )
}

interface FlightCellProps {
  readonly label: string
  readonly value: string
}

function FlightCell({ label, value }: FlightCellProps) {
  return (
    <div className="flight-detail-panel__cell">
      <span className="flight-detail-panel__cell-label">{label}</span>
      <span className="flight-detail-panel__cell-value">{value}</span>
    </div>
  )
}

// PHASE 16.23: minimal helper for parents wanting to translate a PlanetId into a display
// label (theme emoji + name) without re-importing theme system. Kept here so the panel
// stays self-contained.
export function planetIdLabel(id: PlanetId): string {
  return String(id)
}
