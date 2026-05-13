import { type CivId, type PlanetId } from '../types/index'
import { getBiome } from '../gen/biome'
import { type TechEffects, type TechId, type TechNode, TECH_NODES, getTechNode } from './tech'

export const APEX_PLANET_THRESHOLD = 10

export interface Empire {
  readonly civId: CivId
  researchedTechs: Set<TechId>
  researchProgress: Map<TechId, number>
  activeResearchTechId: TechId | null
  // PHASE 17.L.D (HOTFIX 2026-05-12) — pool-currency research model per user verbatim *"i
  // dont have a pool of them but need one like a resourch that the tech building generates
  // at a slow rate all scaled fopr our game"*. Each tick, tickResearch adds research points
  // to this pool. To research a tech the player (or AI) calls purchaseResearchFromPool
  // which deducts the tech's full costPoints and completes it instantly. Stored as float
  // so slow per-tick accumulation (e.g. 0.15/tick) still adds up visibly over time; the UI
  // floors when displaying / checking affordability. Replaces the old per-tech
  // researchProgress accumulator (kept on the interface for back-compat but unused).
  researchPointsPool: number
  controlledPlanetIds: Set<PlanetId>
  defeatedCivIds: Set<CivId>
  capturedPlanetIds: Set<PlanetId>
  ancientTechCount: number
  // PHASE 16.38 — fog of war discovery state. Planets this civ has discovered by direct
  // observation (home planet + targets of launched flights + sources of incoming flights +
  // newly captured planets). Undiscovered planets render greyed-out + no civ flag in the 3D
  // galaxy view for the human civ. AI civs use this same set when scoring targets.
  discoveredPlanetIds: Set<PlanetId>
}

export function newEmpire(civId: CivId, startingPlanetId: PlanetId): Empire {
  return {
    civId,
    researchedTechs: new Set<TechId>(),
    researchProgress: new Map<TechId, number>(),
    activeResearchTechId: null,
    researchPointsPool: 0,
    controlledPlanetIds: new Set<PlanetId>([startingPlanetId]),
    defeatedCivIds: new Set<CivId>(),
    capturedPlanetIds: new Set<PlanetId>(),
    ancientTechCount: 0,
    discoveredPlanetIds: new Set<PlanetId>([startingPlanetId]),
  }
}

// PHASE 16.38 — discovery hook. Idempotent — calling with an already-discovered planet is a
// no-op. Used by MatchSim on flight launch (launching civ discovers target) + on conquest
// (capturing civ adds the captured planet) + on incoming flight detection (defender discovers
// attacker's source planet).
export function discoverPlanet(empire: Empire, planetId: PlanetId): void {
  empire.discoveredPlanetIds.add(planetId)
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

// PHASE 17.L.D (HOTFIX 2026-05-12) — REFACTORED to pool-currency model. Was: progresses
// the empire's activeResearchTechId by `points` and auto-completes when progress hits cost.
// Now: just adds points to the empire-level researchPointsPool. Completion happens via
// explicit purchaseResearchFromPool calls (player click or AI purchase decision). Result
// shape is preserved for back-compat with existing callers but `progressed` / `completed`
// will always be null since this function no longer drives completion.
export function tickResearch(empire: Empire, points: number): ResearchTickResult {
  if (points <= 0) {
    return { progressed: null, completed: null, pointsApplied: 0, pointsRemaining: 0 }
  }
  empire.researchPointsPool += points
  return {
    progressed: null,
    completed: null,
    pointsApplied: points,
    pointsRemaining: Math.floor(empire.researchPointsPool),
  }
}

// PHASE 17.L.D (HOTFIX 2026-05-12) — atomic purchase. Validates the tech is researchable
// (prereqs met + not already researched) AND the empire has enough points in the pool to
// pay the full costPoints. On success: deducts cost from pool + adds tech to researchedTechs
// via completeResearch. On failure (locked or unaffordable) returns false without mutating.
export function purchaseResearchFromPool(empire: Empire, techId: TechId): boolean {
  if (!isTechResearchable(empire, techId)) return false
  const node = getTechNode(techId)
  if (empire.researchPointsPool < node.costPoints) return false
  empire.researchPointsPool -= node.costPoints
  completeResearch(empire, techId)
  return true
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
