import { useEffect, useMemo, useRef, useState } from 'react'
import { type CivId, type PlanetId, type ResourceId, CITIZEN_TIERS, RESOURCES } from '@smol/shared'
import { type EmpireAggregate } from '../../match/empireSelectors'
import './top-toolbar.css'

interface PlanetInventoryLike {
  readonly planetId: PlanetId
  readonly stocks: ReadonlyMap<ResourceId, number>
}

interface OwnedPlanetTooltipRow {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly inventory: PlanetInventoryLike
}

interface TopToolbarProps {
  readonly humanCivId: CivId
  readonly humanCivLabel: string
  // PHASE 17.L.C.8 — single-source aggregate computed in PlayPage via selectEmpireAggregate.
  // TopToolbar used to walk per-planet snapshots itself and compute totals; that duplicated
  // the loop that PlayPage's empireTotals + empirePersonalEquip were also running. Now every
  // consumer reads the same precomputed bundle so the toolbar resource count + the Telemetry
  // POWER slot + the new PlanetSummary panel never disagree.
  readonly empire: EmpireAggregate
  // Per-planet rows kept around solely for the tooltip on each resource chip (so the player can
  // see which planet holds how much of a resource without opening a panel). PlayPage passes a
  // light prop with just inventory.stocks + label, no population needed here anymore.
  readonly ownedPlanetTooltips: ReadonlyArray<OwnedPlanetTooltipRow>
  readonly currentTick: number
}

const DISPLAYED_RESOURCES: ReadonlyArray<ResourceId> = RESOURCES.map((r) => r.id)
const NONZERO_THRESHOLD = 0.5

export function TopToolbar({
  humanCivLabel,
  empire,
  ownedPlanetTooltips,
  currentTick,
}: TopToolbarProps) {
  const aggregateStocks = empire.stocksByResource
  const aggregateTiers = empire.tierCounts

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

  const totalPopulation = empire.populationTotal

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
          const perPlanet = ownedPlanetTooltips
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
          title={`Total population across ${empire.ownedPlanetCount} planet${empire.ownedPlanetCount === 1 ? '' : 's'}`}
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
