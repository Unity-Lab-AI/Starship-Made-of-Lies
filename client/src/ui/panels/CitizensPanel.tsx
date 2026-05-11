import { useMemo } from 'react'
import {
  type CitizenTier,
  type PlanetPopulation,
  CITIZEN_TIERS,
  shipDutyReservedPool,
  totalPopulation,
} from '@smol/shared'
import './citizens-panel.css'

interface CitizensPanelProps {
  readonly planets: ReadonlyArray<{
    readonly planetLabel: string
    readonly population: PlanetPopulation
  }>
  readonly onSetShipDuty: (planetIdString: string, tier: CitizenTier, percent: number) => void
}

export function CitizensPanel({ planets, onSetShipDuty }: CitizensPanelProps) {
  const totals = useMemo(() => {
    const tierTotals: Record<CitizenTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalAll = 0
    let reservedAll = 0
    for (const p of planets) {
      const reserved = shipDutyReservedPool(p.population)
      reservedAll += reserved.totalReserved
      for (const tier of [1, 2, 3, 4, 5] as CitizenTier[]) {
        tierTotals[tier] += p.population.tierCounts[tier]
        totalAll += p.population.tierCounts[tier]
      }
    }
    return { tierTotals, totalAll, reservedAll }
  }, [planets])

  return (
    <div className="citizens-panel">
      <header className="citizens-panel__empire">
        <h3 className="citizens-panel__empire-title">Empire Citizenry</h3>
        <div className="citizens-panel__empire-stats">
          <span>
            <strong>{totals.totalAll}</strong> total
          </span>
          <span title="Reserved across all tiers for the colony-ship-crew pool. These citizens are not assigned to worker tasks and serve as the volunteer pool for launches.">
            <strong>{totals.reservedAll}</strong> reserved for ship duty
          </span>
        </div>
        <ul className="citizens-panel__empire-tiers">
          {CITIZEN_TIERS.map((def) => (
            <li
              key={def.id}
              className={`citizens-panel__empire-tier citizens-panel__empire-tier--t${def.tier}`}
              title={def.description}
            >
              <span aria-hidden>{def.emoji}</span>
              <span className="citizens-panel__empire-tier-name">{def.name}</span>
              <span className="citizens-panel__empire-tier-count">
                {totals.tierTotals[def.tier]}
              </span>
            </li>
          ))}
        </ul>
      </header>

      {planets.length === 0 && <p className="citizens-panel__empty">No planets owned.</p>}

      {planets.map((p) => (
        <details
          key={String(p.population.planetId)}
          className="citizens-panel__planet"
          open={planets.length === 1}
        >
          <summary className="citizens-panel__summary">
            <span className="citizens-panel__planet-label">{p.planetLabel}</span>
            <span className="citizens-panel__planet-total">
              {totalPopulation(p.population)} citizens
            </span>
            <span
              className="citizens-panel__planet-reserved"
              title="Total citizens reserved for ship-duty across all tiers on this planet."
            >
              {shipDutyReservedPool(p.population).totalReserved} reserved
            </span>
          </summary>
          <div className="citizens-panel__body">
            {CITIZEN_TIERS.map((def) => {
              const count = p.population.tierCounts[def.tier]
              const pct = p.population.shipDutyPercentByTier[def.tier] ?? 0
              const reserved = Math.floor((count * pct) / 100)
              return (
                <div
                  key={def.id}
                  className={`citizens-panel__tier citizens-panel__tier--t${def.tier}`}
                >
                  <div className="citizens-panel__tier-header">
                    <span className="citizens-panel__tier-emoji" aria-hidden>
                      {def.emoji}
                    </span>
                    <span className="citizens-panel__tier-name" title={def.description}>
                      {def.name}
                    </span>
                    <span className="citizens-panel__tier-count">{count}</span>
                  </div>
                  <div className="citizens-panel__tier-slider-row">
                    <label
                      className="citizens-panel__slider-label"
                      htmlFor={`ship-duty-${String(p.population.planetId)}-${def.tier}`}
                    >
                      Ship duty:
                    </label>
                    <input
                      id={`ship-duty-${String(p.population.planetId)}-${def.tier}`}
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={pct}
                      onChange={(e) =>
                        onSetShipDuty(
                          String(p.population.planetId),
                          def.tier,
                          Number(e.target.value),
                        )
                      }
                      className="citizens-panel__slider"
                      aria-label={`${def.name} ship-duty allocation percentage`}
                    />
                    <span className="citizens-panel__slider-value">{pct}%</span>
                    <span className="citizens-panel__slider-reserved" aria-live="polite">
                      → {reserved} reserved
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      ))}

      <p className="citizens-panel__note">
        Reserved citizens are added to the colony-ship volunteer pool — they will board outgoing
        ships before worker-tier citizens are pulled for the same role. Tier 4 (Elite) and Tier 5
        (The Chosen) always volunteer regardless of slider position.
      </p>
    </div>
  )
}
