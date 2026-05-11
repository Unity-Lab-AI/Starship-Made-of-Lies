import { type CivId, type PlanetId } from '../types/index'
import { getBiome } from '../gen/biome'
import { type TechEffects, type TechId, type TechNode, TECH_NODES, getTechNode } from './tech'

export const APEX_PLANET_THRESHOLD = 10

export interface Empire {
  readonly civId: CivId
  researchedTechs: Set<TechId>
  researchProgress: Map<TechId, number>
  activeResearchTechId: TechId | null
  controlledPlanetIds: Set<PlanetId>
  defeatedCivIds: Set<CivId>
  capturedPlanetIds: Set<PlanetId>
  ancientTechCount: number
}

export function newEmpire(civId: CivId, startingPlanetId: PlanetId): Empire {
  return {
    civId,
    researchedTechs: new Set<TechId>(),
    researchProgress: new Map<TechId, number>(),
    activeResearchTechId: null,
    controlledPlanetIds: new Set<PlanetId>([startingPlanetId]),
    defeatedCivIds: new Set<CivId>(),
    capturedPlanetIds: new Set<PlanetId>(),
    ancientTechCount: 0,
  }
}

export function controlledPlanetCount(empire: Empire): number {
  return empire.controlledPlanetIds.size
}

export function recordPlanetGain(empire: Empire, planetId: PlanetId): void {
  empire.controlledPlanetIds.add(planetId)
}

export function recordPlanetCapture(empire: Empire, planetId: PlanetId): void {
  empire.capturedPlanetIds.add(planetId)
  empire.controlledPlanetIds.add(planetId)
}

export function recordPlanetLoss(empire: Empire, planetId: PlanetId): void {
  empire.controlledPlanetIds.delete(planetId)
}

export function recordCivDefeat(empire: Empire, defeatedCivId: CivId): void {
  empire.defeatedCivIds.add(defeatedCivId)
}

export function addAncientTech(empire: Empire, amount: number): void {
  if (amount < 0) throw new Error(`addAncientTech: amount must be non-negative, got ${amount}`)
  empire.ancientTechCount += amount
}

export function meetsConquestGate(empire: Empire, node: TechNode): boolean {
  const gate = node.conquestGate
  if (!gate) return true
  if ((gate.minDefeatedCivs ?? 0) > empire.defeatedCivIds.size) return false
  if ((gate.minCapturedPlanets ?? 0) > empire.capturedPlanetIds.size) return false
  if ((gate.requiredAncientTech ?? 0) > empire.ancientTechCount) return false
  return true
}

export function meetsApexCheck(empire: Empire, node: TechNode): boolean {
  if (!node.requiresApexCheck) return true
  return controlledPlanetCount(empire) >= APEX_PLANET_THRESHOLD
}

export function isTechResearchable(empire: Empire, techId: TechId): boolean {
  if (empire.researchedTechs.has(techId)) return false
  const node = getTechNode(techId)
  for (const prereq of node.prerequisites) {
    if (!empire.researchedTechs.has(prereq)) return false
  }
  if (!meetsConquestGate(empire, node)) return false
  if (!meetsApexCheck(empire, node)) return false
  return true
}

export function getResearchableTechs(empire: Empire): ReadonlyArray<TechNode> {
  return TECH_NODES.filter((n) => isTechResearchable(empire, n.id))
}

export interface TechVisibilityState {
  readonly knownNodes: ReadonlyArray<TechNode>
  readonly hintedNodes: ReadonlyArray<TechNode>
  readonly hiddenForbiddenCount: number
}

export function describeVisibleTree(empire: Empire): TechVisibilityState {
  const known: TechNode[] = []
  const hinted: TechNode[] = []
  let hiddenForbiddenCount = 0
  for (const node of TECH_NODES) {
    if (node.visibility === 'mainstream') {
      known.push(node)
      continue
    }
    if (node.visibility === 'suppressed') {
      const prereqsResearched = node.prerequisites.every((p) => empire.researchedTechs.has(p))
      if (prereqsResearched) known.push(node)
      else hinted.push(node)
      continue
    }
    const gateMet = meetsConquestGate(empire, node)
    if (gateMet) known.push(node)
    else hiddenForbiddenCount += 1
  }
  return { knownNodes: known, hintedNodes: hinted, hiddenForbiddenCount }
}

export function startResearch(empire: Empire, techId: TechId): boolean {
  if (!isTechResearchable(empire, techId)) return false
  empire.activeResearchTechId = techId
  if (!empire.researchProgress.has(techId)) empire.researchProgress.set(techId, 0)
  return true
}

export function completeResearch(empire: Empire, techId: TechId): void {
  empire.researchedTechs.add(techId)
  const node = getTechNode(techId)
  empire.researchProgress.set(techId, node.costPoints)
  if (empire.activeResearchTechId === techId) empire.activeResearchTechId = null
}

export interface ResearchTickResult {
  readonly progressed: TechId | null
  readonly completed: TechId | null
  readonly pointsApplied: number
  readonly pointsRemaining: number
}

export function tickResearch(empire: Empire, points: number): ResearchTickResult {
  if (!empire.activeResearchTechId || points <= 0) {
    return { progressed: null, completed: null, pointsApplied: 0, pointsRemaining: 0 }
  }
  const techId = empire.activeResearchTechId
  const node = getTechNode(techId)
  const current = empire.researchProgress.get(techId) ?? 0
  const next = Math.min(node.costPoints, current + points)
  empire.researchProgress.set(techId, next)
  const remaining = Math.max(0, node.costPoints - next)
  if (next >= node.costPoints) {
    completeResearch(empire, techId)
    return {
      progressed: techId,
      completed: techId,
      pointsApplied: next - current,
      pointsRemaining: remaining,
    }
  }
  return {
    progressed: techId,
    completed: null,
    pointsApplied: next - current,
    pointsRemaining: remaining,
  }
}

export function isBiomeColonizable(biomeId: string, empire: Empire): boolean {
  const biome = getBiome(biomeId)
  if (biome.hostilityTier === 0) return true
  for (const techId of empire.researchedTechs) {
    const effects: TechEffects = getTechNode(techId).effects
    if (effects.unlockBiomes?.includes(biomeId)) return true
  }
  return false
}

export function hasWonByTech(empire: Empire): boolean {
  for (const techId of empire.researchedTechs) {
    if (getTechNode(techId).effects.winsGame) return true
  }
  return false
}
