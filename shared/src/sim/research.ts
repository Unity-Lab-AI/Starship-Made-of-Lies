import { type BuildingDefId } from '../types/index'
import { type FactionSplit, performanceMultiplier } from './faction'
import { type PlanetWorkforce, citizensAssignedTo } from './workforce'
import {
  BLDG_LAB,
  BLDG_UNIVERSITY,
  BLDG_CORP_PROMOTIONS,
  BLDG_REEDUCATION,
  BLDG_TV_STATION,
  BLDG_CATHEDRAL,
} from './building'
import { addResource, type PlanetInventory } from './inventory'
import {
  APEX_PLANET_THRESHOLD,
  type Empire,
  completeResearch,
  controlledPlanetCount,
  recordCivDefeat,
} from './empire'
import { aggregateEffects, type TechId } from './tech'

export const POINTS_PER_SCIENTIST = 0.1
export const LAB_MULTIPLIER = 1.0
export const UNIVERSITY_MULTIPLIER = 1.5

export interface PlanetResearchInputs {
  readonly workforce: PlanetWorkforce
  readonly totalCitizens: number
  readonly faction: FactionSplit
  readonly buildingCounts: ReadonlyMap<BuildingDefId, number>
}

export function countBuilding(
  counts: ReadonlyMap<BuildingDefId, number>,
  id: BuildingDefId,
): number {
  return counts.get(id) ?? 0
}

export function generatePlanetResearchPoints(inputs: PlanetResearchInputs): number {
  const scientists = citizensAssignedTo(inputs.workforce, 'research', inputs.totalCitizens)
  if (scientists <= 0) return 0
  const labs = countBuilding(inputs.buildingCounts, BLDG_LAB)
  const universities = countBuilding(inputs.buildingCounts, BLDG_UNIVERSITY)
  const buildingMultiplier = labs * LAB_MULTIPLIER + universities * UNIVERSITY_MULTIPLIER || 1
  const perfMult = performanceMultiplier(inputs.faction)
  return Math.round(scientists * POINTS_PER_SCIENTIST * buildingMultiplier * perfMult)
}

export function planetaryCoverageMultiplier(controlled: number): number {
  return 1 + controlled * 0.05
}

export function aggregateEmpireResearchPoints(
  empire: Empire,
  perPlanetPoints: ReadonlyArray<number>,
): number {
  const sum = perPlanetPoints.reduce((acc, p) => acc + p, 0)
  if (sum <= 0) return 0
  const coverage = planetaryCoverageMultiplier(controlledPlanetCount(empire))
  const techMultiplier = aggregateEffects(empire.researchedTechs).researchSpeedMultiplier
  return Math.round(sum * coverage * techMultiplier)
}

export function isApexResearchUnlocked(empire: Empire): boolean {
  return controlledPlanetCount(empire) >= APEX_PLANET_THRESHOLD
}

export function countPropagandaBuildings(counts: ReadonlyMap<BuildingDefId, number>): number {
  return (
    countBuilding(counts, BLDG_TV_STATION) +
    countBuilding(counts, BLDG_REEDUCATION) +
    countBuilding(counts, BLDG_CORP_PROMOTIONS) +
    countBuilding(counts, BLDG_CATHEDRAL)
  )
}

export interface ConquestTechLootResult {
  readonly lootedTech: TechId | null
  readonly availableCandidateCount: number
}

export function applyConquestTechLoot(
  attacker: Empire,
  defeated: Empire,
  rng: () => number,
): ConquestTechLootResult {
  const candidates: TechId[] = []
  for (const techId of defeated.researchedTechs) {
    if (!attacker.researchedTechs.has(techId)) candidates.push(techId)
  }
  recordCivDefeat(attacker, defeated.civId)
  if (candidates.length === 0) {
    return { lootedTech: null, availableCandidateCount: 0 }
  }
  const idx = Math.floor(rng() * candidates.length)
  const lootedTech = candidates[idx]
  if (!lootedTech) return { lootedTech: null, availableCandidateCount: candidates.length }
  completeResearch(attacker, lootedTech)
  return { lootedTech, availableCandidateCount: candidates.length }
}

export interface ConquestResourceLootResult {
  readonly totalUnitsTransferred: number
  readonly resourcesTransferred: number
}

export function applyConquestResourceLoot(
  attackerInventory: PlanetInventory,
  defeatedInventory: PlanetInventory,
  transferRatio = 1.0,
): ConquestResourceLootResult {
  if (transferRatio < 0 || transferRatio > 1) {
    throw new Error(`applyConquestResourceLoot: transferRatio must be 0-1, got ${transferRatio}`)
  }
  let totalUnitsTransferred = 0
  let resourcesTransferred = 0
  for (const [resource, amount] of defeatedInventory.stocks) {
    const transfer = Math.floor(amount * transferRatio)
    if (transfer > 0) {
      addResource(attackerInventory, resource, transfer)
      defeatedInventory.stocks.set(resource, amount - transfer)
      totalUnitsTransferred += transfer
      resourcesTransferred += 1
    }
  }
  return { totalUnitsTransferred, resourcesTransferred }
}
