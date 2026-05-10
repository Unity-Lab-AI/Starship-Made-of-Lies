import { type BeaconAlert, type BeaconAlertKind, type PlanetBeacon } from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import './BeaconPanel.css'

interface BeaconPanelProps {
  readonly beacon: PlanetBeacon
  readonly currentTick: number
}

const KIND_GLYPH: Readonly<Record<BeaconAlertKind, string>> = {
  INCOMING_HOSTILE: '⚠',
  INCOMING_FRIENDLY: '◎',
  OUTGOING_LAUNCH: '↗',
  OUTGOING_RECALLED: '↩',
  IMPACT_DETECTED: '✦',
  INTERCEPT_SUCCESS: '✓',
  COLONY_ESTABLISHED: '🌱',
}

const KIND_VARIANT: Readonly<Record<BeaconAlertKind, 'amber' | 'green' | 'blue' | 'red'>> = {
  INCOMING_HOSTILE: 'red',
  INCOMING_FRIENDLY: 'green',
  OUTGOING_LAUNCH: 'amber',
  OUTGOING_RECALLED: 'amber',
  IMPACT_DETECTED: 'red',
  INTERCEPT_SUCCESS: 'green',
  COLONY_ESTABLISHED: 'green',
}

export function BeaconPanel({ beacon, currentTick }: BeaconPanelProps) {
  const recent = [...beacon.alerts].sort((a, b) => b.atTick - a.atTick).slice(0, 12)
  const hostileCount = recent.filter((a) => a.kind === 'INCOMING_HOSTILE').length
  const variant = hostileCount > 0 ? 'red' : 'amber'
  return (
    <LCDFrame
      title="🛰️ Planet Beacon"
      statusGlyph={hostileCount > 0 ? '!' : 'ok'}
      statusLabel={hostileCount > 0 ? `${hostileCount} hostile inbound` : 'clear'}
      variant={variant}
    >
      <div className="beacon-panel">
        {recent.length === 0 ? (
          <p className="beacon-panel__empty">No alerts on log.</p>
        ) : (
          <ul className="beacon-panel__list">
            {recent.map((alert) => (
              <BeaconAlertRow key={alert.id} alert={alert} currentTick={currentTick} />
            ))}
          </ul>
        )}
      </div>
    </LCDFrame>
  )
}

interface BeaconAlertRowProps {
  readonly alert: BeaconAlert
  readonly currentTick: number
}

function BeaconAlertRow({ alert, currentTick }: BeaconAlertRowProps) {
  const ticksAgo = currentTick - alert.atTick
  const variant = KIND_VARIANT[alert.kind]
  return (
    <li className={`beacon-panel__row beacon-panel__row--${variant}`}>
      <span className="beacon-panel__glyph">{KIND_GLYPH[alert.kind]}</span>
      <span className="beacon-panel__summary">{alert.summary}</span>
      <span className="beacon-panel__ago">T-{ticksAgo}</span>
    </li>
  )
}
