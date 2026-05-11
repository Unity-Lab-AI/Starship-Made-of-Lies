import { useMemo } from 'react'
import {
  type BuildingDefId,
  type PlanetId,
  BATTERY_BANK_CAPACITY,
  BLDG_BATTERY_BANK,
  BLDG_POWER_PLANT,
  BLDG_REACTOR_ANTIMATTER,
  BLDG_REACTOR_FISSION,
  BLDG_REACTOR_FUSION,
  BLDG_SOLAR_ARRAY,
  RESOURCE_FUEL,
  getBuildingDef,
  getBuildingProduction,
} from '@smol/shared'
import './planet-energy-panel.css'

interface PlanetEnergyPanelProps {
  readonly planets: ReadonlyArray<{
    readonly planetId: PlanetId
    readonly planetLabel: string
    readonly buildingsByDef: ReadonlyMap<BuildingDefId, number>
    readonly fuelStock: number
  }>
  readonly techProductionMultiplier: number
}

interface PlanetEnergyStats {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly fuelStock: number
  readonly capacityPerTick: number
  readonly drawPerTick: number
  readonly surplusPerTick: number
  readonly batteryCapacity: number
  readonly batteryFillPercent: number
  readonly perSourceBreakdown: ReadonlyArray<{
    readonly defId: BuildingDefId
    readonly emoji: string
    readonly name: string
    readonly count: number
    readonly outputPerTick: number
  }>
  readonly brownout: boolean
}

const PRODUCERS: ReadonlyArray<BuildingDefId> = [
  BLDG_SOLAR_ARRAY,
  BLDG_POWER_PLANT,
  BLDG_REACTOR_FISSION,
  BLDG_REACTOR_FUSION,
  BLDG_REACTOR_ANTIMATTER,
]

function computePlanetEnergyStats(
  planet: PlanetEnergyPanelProps['planets'][number],
  techMultiplier: number,
): PlanetEnergyStats {
  const breakdown: PlanetEnergyStats['perSourceBreakdown'][number][] = []
  let capacityPerTick = 0
  let drawPerTick = 0

  for (const defId of PRODUCERS) {
    const count = planet.buildingsByDef.get(defId) ?? 0
    if (count === 0) continue
    const prod = getBuildingProduction(defId)
    if (!prod) continue
    const fuelOutput = prod.outputs.find((o) => o.resource === RESOURCE_FUEL)?.amount ?? 0
    const totalOutput = fuelOutput * count * techMultiplier
    capacityPerTick += totalOutput
    const def = getBuildingDef(defId)
    breakdown.push({
      defId,
      emoji: def.emoji,
      name: def.name,
      count,
      outputPerTick: totalOutput,
    })
  }

  for (const [defId, count] of planet.buildingsByDef) {
    if (count === 0) continue
    const prod = getBuildingProduction(defId)
    if (!prod) continue
    const fuelInput = prod.inputs.find((i) => i.resource === RESOURCE_FUEL)?.amount ?? 0
    if (fuelInput > 0) drawPerTick += fuelInput * count
  }

  const batteryCount = planet.buildingsByDef.get(BLDG_BATTERY_BANK) ?? 0
  const batteryCapacity = batteryCount * BATTERY_BANK_CAPACITY
  const batteryFillPercent =
    batteryCapacity > 0 ? Math.min(100, (planet.fuelStock / batteryCapacity) * 100) : 0

  const surplusPerTick = capacityPerTick - drawPerTick
  const brownout = surplusPerTick < 0 && planet.fuelStock <= 0

  return {
    planetId: planet.planetId,
    planetLabel: planet.planetLabel,
    fuelStock: planet.fuelStock,
    capacityPerTick,
    drawPerTick,
    surplusPerTick,
    batteryCapacity,
    batteryFillPercent,
    perSourceBreakdown: breakdown,
    brownout,
  }
}

export function PlanetEnergyPanel({ planets, techProductionMultiplier }: PlanetEnergyPanelProps) {
  const stats = useMemo(
    () => planets.map((p) => computePlanetEnergyStats(p, techProductionMultiplier)),
    [planets, techProductionMultiplier],
  )

  return (
    <div className="planet-energy-panel">
      {stats.length === 0 && (
        <p className="planet-energy-panel__empty">No planets owned. Energy stats unavailable.</p>
      )}
      {stats.map((s) => (
        <details key={String(s.planetId)} className="planet-energy-panel__planet" open>
          <summary className="planet-energy-panel__summary">
            <span className="planet-energy-panel__planet-label">{s.planetLabel}</span>
            <span
              className={`planet-energy-panel__surplus ${s.surplusPerTick >= 0 ? 'planet-energy-panel__surplus--up' : 'planet-energy-panel__surplus--down'}`}
            >
              {s.surplusPerTick >= 0 ? '+' : ''}
              {s.surplusPerTick.toFixed(1)}/t
            </span>
            {s.brownout && <span className="planet-energy-panel__brownout">⚠ Brownout</span>}
          </summary>
          <div className="planet-energy-panel__body">
            <div className="planet-energy-panel__row">
              <span className="planet-energy-panel__label">Capacity</span>
              <span className="planet-energy-panel__value planet-energy-panel__value--cap">
                {s.capacityPerTick.toFixed(1)} ⛽/t
              </span>
            </div>
            <div className="planet-energy-panel__row">
              <span className="planet-energy-panel__label">Draw</span>
              <span className="planet-energy-panel__value planet-energy-panel__value--draw">
                {s.drawPerTick.toFixed(1)} ⛽/t
              </span>
            </div>
            <div className="planet-energy-panel__row">
              <span className="planet-energy-panel__label">Surplus</span>
              <span
                className={`planet-energy-panel__value ${s.surplusPerTick >= 0 ? 'planet-energy-panel__value--surplus-up' : 'planet-energy-panel__value--surplus-down'}`}
              >
                {s.surplusPerTick >= 0 ? '+' : ''}
                {s.surplusPerTick.toFixed(1)} ⛽/t
              </span>
            </div>
            <div className="planet-energy-panel__row">
              <span className="planet-energy-panel__label">Stockpile</span>
              <span className="planet-energy-panel__value">{Math.round(s.fuelStock)} ⛽</span>
            </div>
            <div className="planet-energy-panel__row">
              <span className="planet-energy-panel__label">Battery Capacity</span>
              <span className="planet-energy-panel__value">
                {s.batteryCapacity > 0 ? `${s.batteryCapacity} ⛽` : '— (no 🔋 banks)'}
              </span>
            </div>
            {s.batteryCapacity > 0 && (
              <div className="planet-energy-panel__battery-bar">
                <div
                  className="planet-energy-panel__battery-fill"
                  style={{ width: `${s.batteryFillPercent}%` }}
                  title={`${s.batteryFillPercent.toFixed(0)}% of battery capacity`}
                />
              </div>
            )}
            <div className="planet-energy-panel__breakdown">
              <h4 className="planet-energy-panel__breakdown-title">Producers</h4>
              {s.perSourceBreakdown.length === 0 ? (
                <p className="planet-energy-panel__breakdown-empty">No energy producers built.</p>
              ) : (
                <ul className="planet-energy-panel__breakdown-list">
                  {s.perSourceBreakdown.map((row) => (
                    <li
                      key={String(row.defId)}
                      className="planet-energy-panel__breakdown-row"
                      title={`${row.count} × ${row.name}`}
                    >
                      <span aria-hidden>{row.emoji}</span>
                      <span className="planet-energy-panel__breakdown-name">{row.name}</span>
                      <span className="planet-energy-panel__breakdown-count">×{row.count}</span>
                      <span className="planet-energy-panel__breakdown-output">
                        +{row.outputPerTick.toFixed(1)}/t
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </details>
      ))}
      <p className="planet-energy-panel__note">
        Tracks fuel-flow per planet. Capacity = solar + power plant + reactor outputs. Draw = sum of
        fuel-consuming buildings. Battery capacity is informational in v1; hard storage cap +
        brownout building-disable gating lands in a later sub-phase.
      </p>
    </div>
  )
}
