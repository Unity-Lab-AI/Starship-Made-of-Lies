import { CITIZEN_TIERS, type CitizenTier, type ResourceId } from '@smol/shared'
import type { MatchState } from './MatchSim'

// PHASE 17.L.C.8 — single source of truth for empire-wide aggregate stats. Before this
// refactor, TopToolbar walked one set of per-planet snapshots while PlayPage's empireTotals +
// empirePersonalEquip walked sim.state.planets.values() separately. Two independent loops with
// slightly different filter shapes meant the TopToolbar resource count could disagree with the
// TelemetryRack POWER slot + the new PlanetSummary panel's totals. Unifying every aggregate
// into `selectEmpireAggregate(state)` so every panel + the toolbar reads from one selector.
// The function returns a *bundle* of every aggregate any panel currently needs so callers
// either get everything they need with one call, or they cheap-extract one field — no need for
// multiple specialized selectors fighting for cache invalidation.

export interface EmpireAggregate {
  // Per-resource total across every planet the human civ owns. Iteration order matches the
  // canonical RESOURCES list because we walk state.planets.values() in insertion order — UI
  // shouldn't depend on this ordering, but it's stable across consecutive ticks.
  readonly stocksByResource: ReadonlyMap<ResourceId, number>
  // Sum of every per-resource amount. Mirrors the previous PlayPage empireTotals.resources.
  readonly resourcesTotal: number
  // Per-citizen-tier breakdown. Mirrors the previous TopToolbar aggregateTiers Record.
  readonly tierCounts: Readonly<Record<CitizenTier, number>>
  // Sum across all five tiers. Mirrors the previous PlayPage empireTotals.pop.
  readonly populationTotal: number
  // Personal-equipment subset (TOOLS_WEAPONS + PERSONAL_AMMO + BOTTLES from UMS UnityInventory).
  // Mirrors the previous PlayPage empirePersonalEquip object so the TelemetryRack slot 11
  // wiring is unchanged at the consumer.
  readonly personalEquip: {
    readonly tools: number
    readonly weapons: number
    readonly ammo: number
    readonly gas: number
  }
  // Count of owned planets — convenience for tooltips / labels.
  readonly ownedPlanetCount: number
}

const PERSONAL_EQUIP_KEYS = new Set(['tools', 'weapons', 'ammunition', 'gas'])

export function selectEmpireAggregate(state: MatchState): EmpireAggregate {
  const stocksByResource = new Map<ResourceId, number>()
  const tierCounts: Record<CitizenTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let resourcesTotal = 0
  let populationTotal = 0
  let tools = 0
  let weapons = 0
  let ammo = 0
  let gas = 0
  let ownedPlanetCount = 0

  for (const planetState of state.planets.values()) {
    if (planetState.civId !== state.humanCivId) continue
    ownedPlanetCount += 1

    for (const [resourceId, amount] of planetState.inventory.stocks) {
      stocksByResource.set(resourceId, (stocksByResource.get(resourceId) ?? 0) + amount)
      resourcesTotal += amount
      if (PERSONAL_EQUIP_KEYS.has(String(resourceId))) {
        const id = String(resourceId)
        if (id === 'tools') tools += amount
        else if (id === 'weapons') weapons += amount
        else if (id === 'ammunition') ammo += amount
        else if (id === 'gas') gas += amount
      }
    }

    for (const tierDef of CITIZEN_TIERS) {
      const c = planetState.population.tierCounts[tierDef.tier as CitizenTier] ?? 0
      tierCounts[tierDef.tier as CitizenTier] += c
      populationTotal += c
    }
  }

  return {
    stocksByResource,
    resourcesTotal,
    tierCounts,
    populationTotal,
    personalEquip: { tools, weapons, ammo, gas },
    ownedPlanetCount,
  }
}
