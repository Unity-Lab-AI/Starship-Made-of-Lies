import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type CitizenTier,
  type CivId,
  type PlanetId,
  type ResourceId,
  CITIZEN_TIERS,
  RESOURCES,
} from '@smol/shared'
import './top-toolbar.css'

interface PlanetInventoryLike {
  readonly planetId: PlanetId
  readonly stocks: ReadonlyMap<ResourceId, number>
}

interface PlanetPopulationLike {
  readonly planetId: PlanetId
  readonly tierCounts: Record<CitizenTier, number>
}

interface OwnedPlanetSnapshot {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly inventory: PlanetInventoryLike
  readonly population: PlanetPopulationLike
}

interface TopToolbarProps {
  readonly humanCivId: CivId
  readonly humanCivLabel: string
  readonly ownedPlanets: ReadonlyArray<OwnedPlanetSnapshot>
  readonly currentTick: number
}

const DISPLAYED_RESOURCES: ReadonlyArray<ResourceId> = RESOURCES.map((r) => r.id)
const NONZERO_THRESHOLD = 0.5

export function TopToolbar({ humanCivLabel, ownedPlanets, currentTick }: TopToolbarProps) {
  const aggregateStocks = useMemo(() => {
    const total = new Map<ResourceId, number>()
    for (const planet of ownedPlanets) {
      for (const [resourceId, amount] of planet.inventory.stocks) {
        total.set(resourceId, (total.get(resourceId) ?? 0) + amount)
      }
    }
    return total
  }, [ownedPlanets])

  const aggregateTiers = useMemo(() => {
    const total: Record<CitizenTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const planet of ownedPlanets) {
      for (const tier of [1, 2, 3, 4, 5] as CitizenTier[]) {
        total[tier] += planet.population.tierCounts[tier] ?? 0
      }
    }
    return total
  }, [ownedPlanets])

  const prevStocksRef = useRef<Map<ResourceId, number>>(new Map())
  const prevTickRef = useRef<number>(currentTick)
  const [deltas, setDeltas] = useState<Map<ResourceId, number>>(new Map())

  useEffect(() => {
    if (currentTick === prevTickRef.current) return
    const tickGap = currentTick - prevTickRef.current
    if (tickGap <= 0) {
      prevTickRef.current = currentTick
      return
    }
    const nextDeltas = new Map<ResourceId, number>()
    for (const resourceId of DISPLAYED_RESOURCES) {
      const prev = prevStocksRef.current.get(resourceId) ?? 0
      const now = aggregateStocks.get(resourceId) ?? 0
      const delta = (now - prev) / tickGap
      if (Math.abs(delta) > NONZERO_THRESHOLD) nextDeltas.set(resourceId, delta)
    }
    setDeltas(nextDeltas)
    prevStocksRef.current = new Map(aggregateStocks)
    prevTickRef.current = currentTick
  }, [aggregateStocks, currentTick])

  const totalPopulation =
    aggregateTiers[1] +
    aggregateTiers[2] +
    aggregateTiers[3] +
    aggregateTiers[4] +
    aggregateTiers[5]

  const visibleResources = useMemo(() => {
    return RESOURCES.filter((def) => (aggregateStocks.get(def.id) ?? 0) > 0)
  }, [aggregateStocks])

  return (
    <header className="top-toolbar" aria-label="Empire Toolbar">
      <div className="top-toolbar__civ" title={`Tick ${currentTick}`}>
        <span className="top-toolbar__civ-label">{humanCivLabel}</span>
        <span className="top-toolbar__civ-tick">t {currentTick}</span>
      </div>

      <div className="top-toolbar__resources" role="list">
        {visibleResources.map((def) => {
          const count = aggregateStocks.get(def.id) ?? 0
          const delta = deltas.get(def.id) ?? 0
          const deltaClass =
            delta > 0 ? 'top-toolbar__delta--up' : delta < 0 ? 'top-toolbar__delta--down' : ''
          const perPlanet = ownedPlanets
            .map((p) => ({ id: p.planetLabel, qty: p.inventory.stocks.get(def.id) ?? 0 }))
            .filter((row) => row.qty > 0)
            .sort((a, b) => b.qty - a.qty)
          const tooltip =
            `${def.emoji} ${def.name} — total ${formatNumber(count)}` +
            (perPlanet.length > 0
              ? '\n' + perPlanet.map((row) => `  ${row.id}: ${formatNumber(row.qty)}`).join('\n')
              : '')
          return (
            <div
              key={String(def.id)}
              className="top-toolbar__resource"
              role="listitem"
              title={tooltip}
            >
              <span className="top-toolbar__resource-emoji" aria-hidden>
                {def.emoji}
              </span>
              <span className="top-toolbar__resource-count">{formatNumber(count)}</span>
              {delta !== 0 && (
                <span className={`top-toolbar__delta ${deltaClass}`}>
                  {delta > 0 ? '+' : ''}
                  {delta.toFixed(1)}/t
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="top-toolbar__citizens" role="list" aria-label="Citizen Tiers">
        <div
          className="top-toolbar__citizen-total"
          title={`Total population across ${ownedPlanets.length} planet${ownedPlanets.length === 1 ? '' : 's'}`}
        >
          <span aria-hidden>👥</span>
          <span>{formatNumber(totalPopulation)}</span>
        </div>
        {CITIZEN_TIERS.map((def) => {
          const count = aggregateTiers[def.tier]
          const tooltip = `${def.emoji} ${def.name} (Tier ${def.tier}) — ${formatNumber(count)}\n${def.description}`
          return (
            <div
              key={def.id}
              className={`top-toolbar__citizen-tier top-toolbar__citizen-tier--t${def.tier}`}
              role="listitem"
              title={tooltip}
            >
              <span className="top-toolbar__citizen-emoji" aria-hidden>
                {def.emoji}
              </span>
              <span className="top-toolbar__citizen-count">{formatNumber(count)}</span>
            </div>
          )
        })}
      </div>
    </header>
  )
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`
  return `${Math.round(n)}`
}
