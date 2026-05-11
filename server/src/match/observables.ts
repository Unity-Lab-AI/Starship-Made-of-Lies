import {
  type CampaignContext,
  type CivId,
  type ObservedEnemyPlanet,
  type PlanetBuildingContext,
  type ShipLoadoutContext,
  BUILDINGS,
  RESOURCE_FOOD,
  RESOURCE_INGOTS,
  RESOURCE_PROPAGANDA_MATERIALS,
  dissidentRatio,
  stockOf,
} from '@smol/shared'
import { type MatchState, type PerCivState } from './MatchState'
import { type AIController, type AITickObservables } from '../ai/AIController'

export function unlockedBuildingIds(_perCiv: PerCivState): ReadonlySet<string> {
  const out = new Set<string>()
  for (const def of BUILDINGS) {
    out.add(def.id as unknown as string)
  }
  return out
}

export function maxPayloadTierFor(perCiv: PerCivState): 1 | 2 | 3 | 4 {
  let tier: 1 | 2 | 3 | 4 = 1
  if (perCiv.empire.researchedTechs.size >= 8) tier = 2
  if (perCiv.empire.researchedTechs.size >= 14) tier = 3
  if (perCiv.empire.researchedTechs.size >= 20) tier = 4
  return tier
}

export function buildPlanetBuildingContext(
  state: MatchState,
  perCiv: PerCivState,
): PlanetBuildingContext | null {
  for (const ps of state.planetStates.values()) {
    if (ps.ownerCivId !== perCiv.assignment.civId) continue
    const populationPressure = ps.totalPopulation > 0 ? Math.min(1, ps.totalPopulation / 5000) : 0
    return {
      planetId: ps.planet.id,
      currentBuildingCounts: new Map<string, number>(),
      availableTiles: Math.max(0, ps.planet.tiles.length),
      populationPressure,
    }
  }
  return null
}

export function buildShipLoadoutContext(
  state: MatchState,
  perCiv: PerCivState,
): ShipLoadoutContext {
  let availableCitizensTier4Plus = 0
  for (const ps of state.planetStates.values()) {
    if (ps.ownerCivId !== perCiv.assignment.civId) continue
    availableCitizensTier4Plus += Math.round(ps.totalPopulation * 0.05)
  }
  return {
    maxPayloadTier: maxPayloadTierFor(perCiv),
    availableCitizensTier4Plus,
    intentCategory: null,
  }
}

export function buildCampaignContext(state: MatchState, perCiv: PerCivState): CampaignContext {
  let propagandaMats = 0
  let weightedDissident = 0
  let weightedTotal = 0
  for (const ps of state.planetStates.values()) {
    if (ps.ownerCivId !== perCiv.assignment.civId) continue
    propagandaMats += stockOf(ps.inventory, RESOURCE_PROPAGANDA_MATERIALS)
    const total = ps.faction.loyal + ps.faction.skeptic + ps.faction.dissident
    if (total > 0) {
      weightedDissident += dissidentRatio(ps.faction) * total
      weightedTotal += total
    }
  }
  const overallDissidentRatio = weightedTotal > 0 ? weightedDissident / weightedTotal : 0
  const underAttack = isCivUnderAttack(state, perCiv.assignment.civId)
  return {
    availablePropagandaMaterials: propagandaMats,
    currentDissidentRatio: overallDissidentRatio,
    underAttack,
  }
}

export function isCivUnderAttack(state: MatchState, civId: CivId): boolean {
  for (const flight of state.flights.values()) {
    if (flight.launchingCivId === civId) continue
    const target = state.planetStates.get(flight.targetPlanetId)
    if (target && target.ownerCivId === civId) return true
  }
  return false
}

export function buildObservedEnemyPlanets(
  state: MatchState,
  perCiv: PerCivState,
): ReadonlyArray<ObservedEnemyPlanet> {
  const out: ObservedEnemyPlanet[] = []
  const myStartingPlanet = state.planetStates.get(perCiv.assignment.startingPlanetId)
  const myPos = myStartingPlanet ? myStartingPlanet.planet.position : { x: 0, y: 0, z: 0 }
  for (const ps of state.planetStates.values()) {
    if (!ps.ownerCivId || ps.ownerCivId === perCiv.assignment.civId) continue
    const dx = ps.planet.position.x - myPos.x
    const dy = ps.planet.position.y - myPos.y
    const dz = ps.planet.position.z - myPos.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const observerCanSee = distance < 50_000
    out.push({
      planetId: ps.planet.id,
      ownerCivId: ps.ownerCivId,
      distance,
      estimatedDefenseStrength: Math.round(ps.totalPopulation / 100),
      estimatedResourceValue:
        stockOf(ps.inventory, RESOURCE_INGOTS) + stockOf(ps.inventory, RESOURCE_FOOD),
      observerCanSee,
    })
  }
  return out
}

export function calculateResourceSurplusRatio(state: MatchState, perCiv: PerCivState): number {
  let totalFood = 0
  let totalPop = 0
  for (const ps of state.planetStates.values()) {
    if (ps.ownerCivId !== perCiv.assignment.civId) continue
    totalFood += stockOf(ps.inventory, RESOURCE_FOOD)
    totalPop += ps.totalPopulation
  }
  if (totalPop === 0) return 1
  return totalFood / Math.max(1, totalPop)
}

export function buildObservablesForCiv(
  state: MatchState,
  controller: AIController,
): AITickObservables {
  const perCiv = state.civs.get(controller.civId)
  if (!perCiv) {
    return {
      buildingCtx: null,
      unlockedBuildings: null,
      shipCtx: null,
      observedEnemies: [],
      campaignCtx: null,
      resourceSurplusRatio: 0,
    }
  }
  return {
    buildingCtx: buildPlanetBuildingContext(state, perCiv),
    unlockedBuildings: unlockedBuildingIds(perCiv),
    shipCtx: buildShipLoadoutContext(state, perCiv),
    observedEnemies: buildObservedEnemyPlanets(state, perCiv),
    campaignCtx: buildCampaignContext(state, perCiv),
    resourceSurplusRatio: calculateResourceSurplusRatio(state, perCiv),
  }
}
