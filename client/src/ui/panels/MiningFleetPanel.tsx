import type { ReactElement } from 'react'
import {
  type CivId,
  type Planet,
  type ShipBeaconBroadcast,
  type Theme,
  describeShipStatus,
  shipStatusColorClass,
  planetActiveResourceNodes,
} from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import { PerPlanetDropdownGroup, type PerPlanetDropdownEntry } from './PerPlanetDropdownGroup'
import './mining-fleet-panel.css'

interface MiningFleetPanelProps {
  readonly planets: ReadonlyArray<Planet>
  readonly themeByCiv: ReadonlyMap<CivId, Theme>
  readonly beaconsByPlanet: ReadonlyMap<string, ReadonlyArray<ShipBeaconBroadcast>>
  readonly humanCivId: CivId
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function renderShipRow(
  beacon: ShipBeaconBroadcast,
  themeByCiv: ReadonlyMap<CivId, Theme>,
): ReactElement {
  const theme = themeByCiv.get(beacon.civId)
  const civEmoji = theme?.emoji ?? '🏳️'
  // Super-review SR2-5 fix: surface ticksInNoSignal when the ship is stranded so the
  // player can decide abandon vs. rescue. PHASE 17.B.5 contract said "beacon broadcasts
  // stranded status" — the broadcast field exists; this is the UI consumer that was missing.
  const statusLabel =
    beacon.status === 'NO_SIGNAL' && beacon.ticksInNoSignal > 0
      ? `${describeShipStatus(beacon.status)} · stranded ${beacon.ticksInNoSignal}t`
      : describeShipStatus(beacon.status)
  const statusClass = shipStatusColorClass(beacon.status)
  const cargoPct = clampPercent(beacon.cargoPercent)
  const fuelPct = clampPercent(beacon.fuelPercent)
  const batteryPct = clampPercent(beacon.batteryPercent)
  return (
    <article key={beacon.id} className="mining-row">
      <header className="mining-row__head">
        <span className="mining-row__civ" title={String(beacon.civId)}>
          {civEmoji}
        </span>
        <span className="mining-row__name">{beacon.shipName}</span>
        <span className={`mining-row__status ${statusClass}`}>{statusLabel}</span>
      </header>
      <div className="mining-row__bars">
        <div className="mining-row__bar mining-row__bar-cargo">
          <span className="mining-row__bar-label">
            Cargo {beacon.cargoAmount}/{beacon.cargoCapacity}
          </span>
          <div className="mining-row__bar-track">
            <div
              className="mining-row__bar-fill mining-row__bar-fill-cargo"
              style={{ width: `${cargoPct}%` }}
            />
          </div>
        </div>
        <div className="mining-row__bar mining-row__bar-fuel">
          <span className="mining-row__bar-label">Fuel</span>
          <div className="mining-row__bar-track">
            <div
              className="mining-row__bar-fill mining-row__bar-fill-fuel"
              style={{ width: `${fuelPct}%` }}
            />
          </div>
        </div>
        <div className="mining-row__bar mining-row__bar-battery">
          <span className="mining-row__bar-label">Battery</span>
          <div className="mining-row__bar-track">
            <div
              className="mining-row__bar-fill mining-row__bar-fill-battery"
              style={{ width: `${batteryPct}%` }}
            />
          </div>
        </div>
      </div>
      <footer className="mining-row__foot">
        <span className="mining-row__target">Target deposit: {beacon.targetNodeId ?? '—'}</span>
        <span className="mining-row__eta">
          Estimated arrival: {beacon.etaTicks > 0 ? `${beacon.etaTicks} ticks` : '—'}
        </span>
      </footer>
    </article>
  )
}

function renderEmptyMiningBody(planet: Planet): ReactElement {
  const activeDeposits = planetActiveResourceNodes(planet)
  return (
    <div className="mining-empty">
      <div className="mining-empty__primary">No active mining fleet on this planet.</div>
      <div className="mining-empty__secondary">
        Active deposits on this planet: <strong>{activeDeposits.length}</strong>
      </div>
    </div>
  )
}

export function MiningFleetPanel({
  planets,
  themeByCiv,
  beaconsByPlanet,
  humanCivId,
}: MiningFleetPanelProps) {
  const entries: PerPlanetDropdownEntry[] = planets.map((planet) => {
    const planetIdStr = String(planet.id)
    const beacons = beaconsByPlanet.get(planetIdStr) ?? []
    const civTheme = planet.ownerCivId ? (themeByCiv.get(planet.ownerCivId) ?? null) : null
    const isHumanOwned = planet.ownerCivId === humanCivId
    const body =
      beacons.length === 0 ? (
        renderEmptyMiningBody(planet)
      ) : (
        <div className="mining-list">{beacons.map((b) => renderShipRow(b, themeByCiv))}</div>
      )
    return {
      planet,
      theme: civTheme,
      rowCount: beacons.length,
      defaultExpanded: isHumanOwned || beacons.length > 0,
      body,
    }
  })

  return (
    <LCDFrame
      title="Mining Fleet"
      statusLabel="UMS UnityBeacon broadcasts — per planet"
      variant="green"
    >
      <PerPlanetDropdownGroup entries={entries} emptyMessage="No planets being mined yet." />
    </LCDFrame>
  )
}
