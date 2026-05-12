import { useMemo } from 'react'
import {
  type ColonyShipFlight,
  type SignalCapability,
  deriveOwnFlightLink,
  detectIncomingFlight,
} from '@smol/shared'
import './SignalHubPanel.css'

// 17.2.1 — Signal hub control panel. Surfaces the civ's `SignalCapability` snapshot + the
// detectable-flights roster (enemy inbound + own outbound link status). Data comes from the
// already-shipped `shared/src/sim/signal.ts` module — this panel just renders it.

interface SignalHubPanelProps {
  readonly capability: SignalCapability
  readonly ownFlights: ReadonlyArray<ColonyShipFlight>
  readonly enemyFlights: ReadonlyArray<ColonyShipFlight>
  readonly currentTick: number
  // Comms tier of the player's own ship template. Reads from the active blueprint /
  // ship-build at the call site; v1 defaults to 1 (radio) when caller can't resolve a tier.
  readonly ownShipCommsTier: 0 | 1 | 2 | 3
}

interface DetectableFlightRow {
  readonly flightId: string
  readonly launchingCivId: string
  readonly ticksToImpact: number
  readonly window: 'early-warning' | 'detection-range' | 'too-far'
}

export function SignalHubPanel({
  capability,
  ownFlights,
  enemyFlights,
  currentTick,
  ownShipCommsTier,
}: SignalHubPanelProps) {
  const detectableEnemy = useMemo<DetectableFlightRow[]>(() => {
    return enemyFlights
      .map((f) => {
        const det = detectIncomingFlight(capability, f)
        return det.detected
          ? {
              flightId: String(f.id),
              launchingCivId: String(f.launchingCivId),
              ticksToImpact: det.ticksToImpact,
              window: det.within,
            }
          : null
      })
      .filter((r): r is DetectableFlightRow => r !== null)
      .sort((a, b) => a.ticksToImpact - b.ticksToImpact)
  }, [enemyFlights, capability])

  const ownLinkStatus = useMemo(() => {
    return ownFlights.map((f) => ({
      flight: f,
      link: deriveOwnFlightLink(capability, f, ownShipCommsTier),
    }))
  }, [ownFlights, capability, ownShipCommsTier])

  return (
    <section className="signal-hub-panel" aria-label="Signal hub — detection + links">
      <header className="signal-hub-panel__header">
        <h2>📡 Signal Hub</h2>
        <span className="signal-hub-panel__tick">tick {currentTick}</span>
      </header>

      <section className="signal-hub-panel__section">
        <h3 className="signal-hub-panel__section-title">Capability</h3>
        <ul className="signal-hub-panel__capability">
          <li>
            <span className="signal-hub-panel__cap-key">Detection range</span>
            <span className="signal-hub-panel__cap-val">
              {capability.detectionRangeTicks} ticks
            </span>
          </li>
          <li>
            <span className="signal-hub-panel__cap-key">Early warning</span>
            <span className="signal-hub-panel__cap-val">{capability.earlyWarningTicks} ticks</span>
          </li>
          <li>
            <span className="signal-hub-panel__cap-key">Radio range</span>
            <span className="signal-hub-panel__cap-val">
              {capability.radioRangeTicks > 0
                ? `${capability.radioRangeTicks} ticks`
                : 'locked (research Telecommunications)'}
            </span>
          </li>
          <li>
            <span className="signal-hub-panel__cap-key">Laser-align range</span>
            <span className="signal-hub-panel__cap-val">
              {capability.laserAlignRangeTicks > 0
                ? `${capability.laserAlignRangeTicks} ticks`
                : 'locked (research Laser Optics)'}
            </span>
          </li>
          <li>
            <span className="signal-hub-panel__cap-key">Cloak penetration</span>
            <span className="signal-hub-panel__cap-val">
              {capability.canSeeFromCloak ? 'YES (quantum or surveillance)' : 'no'}
            </span>
          </li>
          <li>
            <span className="signal-hub-panel__cap-key">Warning System</span>
            <span className="signal-hub-panel__cap-val">
              {capability.hasWarningSystem ? '✓ active' : 'not researched'}
            </span>
          </li>
        </ul>
      </section>

      <section className="signal-hub-panel__section">
        <h3 className="signal-hub-panel__section-title">
          Incoming flights · {detectableEnemy.length}
        </h3>
        {detectableEnemy.length === 0 ? (
          <p className="signal-hub-panel__empty">No hostile flights inside detection range.</p>
        ) : (
          <ul className="signal-hub-panel__incoming">
            {detectableEnemy.map((row) => (
              <li
                key={row.flightId}
                className={`signal-hub-panel__incoming-row signal-hub-panel__incoming-row--${row.window}`}
              >
                <span className="signal-hub-panel__incoming-civ">{row.launchingCivId}</span>
                <span className="signal-hub-panel__incoming-eta">ETA {row.ticksToImpact}t</span>
                <span className="signal-hub-panel__incoming-window">
                  {row.window === 'early-warning'
                    ? 'EARLY WARNING'
                    : row.window === 'detection-range'
                      ? 'DETECTED'
                      : 'TOO FAR'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="signal-hub-panel__section">
        <h3 className="signal-hub-panel__section-title">
          Own-flight link status · {ownLinkStatus.length}
        </h3>
        {ownLinkStatus.length === 0 ? (
          <p className="signal-hub-panel__empty">No own flights in the air.</p>
        ) : (
          <ul className="signal-hub-panel__own-links">
            {ownLinkStatus.map(({ flight, link }) => (
              <li
                key={link.flightId}
                className={`signal-hub-panel__own-link signal-hub-panel__own-link--${link.kind}`}
              >
                <span className="signal-hub-panel__own-flight">Flight {String(flight.id)}</span>
                <span className="signal-hub-panel__own-link-kind">
                  {link.kind === 'laser_align'
                    ? '🔆 Laser-align'
                    : link.kind === 'radio'
                      ? '📻 Radio'
                      : '🚫 Signal lost'}
                </span>
                {link.kind !== 'lost' && (
                  <span className="signal-hub-panel__own-link-remaining">
                    {link.remainingTicksTillFog}t to fog
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
