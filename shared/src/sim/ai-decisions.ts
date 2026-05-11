import { type CivId, type PlanetId } from '../types/index'
import { type PlaystyleProfile, type TargetSelectionMode } from './ai-archetype'
import { type AIDifficultyConfig, rollSuboptimalChoice } from './ai-difficulty'
import { type BuildingDef, BLDG_MINING_OUTPOST, BUILDINGS } from './building'
import { CAMPAIGNS, type CampaignDef } from './deception'
import {
  type ColonyShipDef,
  type ColonyShipCategory,
  COLONY_SHIPS,
  colonyShipsByPayloadTier,
} from './colony-ship'
import { type Empire, getResearchableTechs } from './empire'
import { type AIPersonalityBias } from './theme-distribution'
import { type TechNode } from './tech'

export interface AIDecisionInputs {
  readonly empire: Empire
  readonly playstyle: PlaystyleProfile
  readonly themeBias: AIPersonalityBias
  readonly difficulty: AIDifficultyConfig
  readonly rng: () => number
}

export interface ScoredCandidate<T> {
  readonly value: T
  readonly score: number
}

function pickHighestOrSuboptimal<T>(
  candidates: ReadonlyArray<ScoredCandidate<T>>,
  difficulty: AIDifficultyConfig,
  rng: () => number,
): T | null {
  if (candidates.length === 0) return null
  const sorted = [...candidates].sort((a, b) => b.score - a.score)
  if (sorted.length === 1 || !rollSuboptimalChoice(difficulty, rng)) {
    const top = sorted[0]
    return top ? top.value : null
  }
  const fallbackIdx = Math.min(
    sorted.length - 1,
    1 + Math.floor(rng() * Math.min(2, sorted.length - 1)),
  )
  const fallback = sorted[fallbackIdx]
  return fallback ? fallback.value : null
}

export function pickResearchPriority(inputs: AIDecisionInputs): TechNode | null {
  const candidates = getResearchableTechs(inputs.empire)
  if (candidates.length === 0) return null
  const scored: ScoredCandidate<TechNode>[] = candidates.map((node) => {
    const categoryWeight = inputs.playstyle.techCategoryPriority[node.category]
    const tierBonus = node.tier * 0.05
    const visibilityBias =
      node.visibility === 'forbidden'
        ? inputs.themeBias.forbiddenTechAffinity
        : node.visibility === 'suppressed'
          ? 0.5
          : 0.7
    const winsGameBonus = node.effects.winsGame ? 1.0 : 0
    const score = categoryWeight * 0.6 + visibilityBias * 0.2 + tierBonus + winsGameBonus
    return { value: node, score }
  })
  return pickHighestOrSuboptimal(scored, inputs.difficulty, inputs.rng)
}

export interface PlanetBuildingContext {
  readonly planetId: PlanetId
  readonly currentBuildingCounts: ReadonlyMap<string, number>
  readonly availableTiles: number
  readonly populationPressure: number
  // Super-review fix: AI needs to know its mining situation so it can prioritize building
  // outposts when miners are missing. minerCount = ships currently on this planet; resource
  // NodesAvailable = drillable deposits remaining.
  readonly minerCount: number
  readonly resourceNodesAvailable: number
}

export function pickConstructionTarget(
  inputs: AIDecisionInputs,
  ctx: PlanetBuildingContext,
  unlockedBuildings: ReadonlySet<string>,
): BuildingDef | null {
  if (ctx.availableTiles <= 0) return null
  const candidates: ScoredCandidate<BuildingDef>[] = BUILDINGS.filter(
    (b) => unlockedBuildings.has(b.id as unknown as string) || unlockedBuildings.has(b.name),
  ).map((building) => {
    const categoryWeight = inputs.playstyle.buildingCategoryPriority[building.category]
    const populationBonus =
      building.category === 'housing' ? Math.min(0.5, ctx.populationPressure * 0.3) : 0
    const slotBonus = building.citizenSlots > 0 ? 0.05 : 0
    const economyBoost =
      building.category === 'industry' || building.category === 'extraction'
        ? inputs.playstyle.economyFocus * 0.2
        : 0
    // Super-review SR-5 + SR2-11: rush an outpost when mining is needed AND not running.
    // Boost is critical (+1.5) when there are drillable nodes but fewer than 2 miners on
    // the planet. Tapers as outposts accumulate so AI doesn't spam them all over.
    // Brand-safe compare via BLDG_MINING_OUTPOST constant — survives renames of the literal.
    const isOutpost = building.id === BLDG_MINING_OUTPOST
    const existingOutposts =
      ctx.currentBuildingCounts.get(BLDG_MINING_OUTPOST as unknown as string) ?? 0
    const outpostBoost =
      isOutpost && ctx.resourceNodesAvailable > 0 && ctx.minerCount < 2 && existingOutposts < 3
        ? 1.5
        : 0
    const score = categoryWeight * 0.7 + populationBonus + slotBonus + economyBoost + outpostBoost
    return { value: building, score }
  })
  return pickHighestOrSuboptimal(candidates, inputs.difficulty, inputs.rng)
}

export interface ShipLoadoutContext {
  readonly maxPayloadTier: 1 | 2 | 3 | 4
  readonly availableCitizensTier4Plus: number
  readonly intentCategory: ColonyShipCategory | null
}

export function pickShipLoadout(
  inputs: AIDecisionInputs,
  ctx: ShipLoadoutContext,
): ColonyShipDef | null {
  const eligible = colonyShipsByPayloadTier(ctx.maxPayloadTier)
  if (eligible.length === 0) return null
  const candidates: ScoredCandidate<ColonyShipDef>[] = eligible.map((ship) => {
    const categoryWeight = inputs.playstyle.shipCategoryPriority[ship.category]
    const intentBonus = ctx.intentCategory && ship.category === ctx.intentCategory ? 0.4 : 0
    const suicideMatch = ship.suicideShip ? inputs.playstyle.suicideShipAffinity : 0
    const themeSuicide = ship.suicideShip ? inputs.themeBias.suicideShipPreference * 0.3 : 0
    const tierProgress = ship.darknessTier * 0.05
    const citizenFeasibility =
      ship.suicideShip && ship.payload.citizenCapacity > 0
        ? ctx.availableCitizensTier4Plus >= ship.payload.citizenCapacity
          ? 0
          : -0.6
        : 0
    const score =
      categoryWeight * 0.5 +
      intentBonus +
      suicideMatch * 0.2 +
      themeSuicide +
      tierProgress +
      citizenFeasibility
    return { value: ship, score }
  })
  return pickHighestOrSuboptimal(candidates, inputs.difficulty, inputs.rng)
}

export interface ObservedEnemyPlanet {
  readonly planetId: PlanetId
  readonly ownerCivId: CivId
  readonly distance: number
  readonly estimatedDefenseStrength: number
  readonly estimatedResourceValue: number
  readonly observerCanSee: boolean
}

export function filterFogOfWarEnemies(
  observed: ReadonlyArray<ObservedEnemyPlanet>,
  difficulty: AIDifficultyConfig,
  hostileCivCheck: (civId: CivId) => boolean,
): ReadonlyArray<ObservedEnemyPlanet> {
  const filtered = observed.filter(
    (p) =>
      hostileCivCheck(p.ownerCivId) && (p.observerCanSee || difficulty.fogOfWarPenetration > 0),
  )
  return filtered
}

export function pickAttackTarget(
  inputs: AIDecisionInputs,
  visibleHostileTargets: ReadonlyArray<ObservedEnemyPlanet>,
): ObservedEnemyPlanet | null {
  if (visibleHostileTargets.length === 0) return null
  const mode: TargetSelectionMode = inputs.playstyle.targetSelectionMode
  const candidates: ScoredCandidate<ObservedEnemyPlanet>[] = visibleHostileTargets.map((target) => {
    const accuracy = 1 + inputs.difficulty.targetingAccuracyBonus
    const defenseScore = -target.estimatedDefenseStrength * 0.4 * accuracy
    const valueScore = target.estimatedResourceValue * 0.3 * accuracy
    const proximityScore = -target.distance * 0.001
    const aggressionScore = inputs.themeBias.aggression * 0.2
    let modeBoost = 0
    switch (mode) {
      case 'weakest':
        modeBoost = -target.estimatedDefenseStrength * 0.6
        break
      case 'closest':
        modeBoost = -target.distance * 0.003
        break
      case 'richest':
        modeBoost = target.estimatedResourceValue * 0.5
        break
      case 'random':
        modeBoost = inputs.rng() * 0.8
        break
      case 'opportunistic':
        modeBoost = (target.estimatedResourceValue - target.estimatedDefenseStrength) * 0.25
        break
    }
    const score = defenseScore + valueScore + proximityScore + aggressionScore + modeBoost
    return { value: target, score }
  })
  return pickHighestOrSuboptimal(candidates, inputs.difficulty, inputs.rng)
}

export interface CampaignContext {
  readonly availablePropagandaMaterials: number
  readonly currentDissidentRatio: number
  readonly underAttack: boolean
}

export function pickCampaign(inputs: AIDecisionInputs, ctx: CampaignContext): CampaignDef | null {
  const affordableScale = 1 - inputs.difficulty.campaignDiscount
  const candidates: ScoredCandidate<CampaignDef>[] = CAMPAIGNS.filter((campaign) => {
    const totalCost = campaign.costs.reduce((sum, c) => sum + c.amount * affordableScale, 0)
    return totalCost <= ctx.availablePropagandaMaterials
  }).map((campaign) => {
    const archetypeWeight = inputs.playstyle.campaignPriority[campaign.archetype]
    const dissidentPressure = ctx.currentDissidentRatio > 0.3 ? 0.3 : 0
    const underAttackBoost = ctx.underAttack && campaign.archetype === 'enemyAtTheGates' ? 0.5 : 0
    const propagandaThemeBoost = inputs.themeBias.propagandaSpend * 0.2
    const score =
      archetypeWeight * 0.6 + dissidentPressure + underAttackBoost + propagandaThemeBoost
    return { value: campaign, score }
  })
  return pickHighestOrSuboptimal(candidates, inputs.difficulty, inputs.rng)
}

export function decideConscriptionThreshold(inputs: AIDecisionInputs): number {
  const playstyleTolerance = inputs.playstyle.conscriptionTolerance
  const themePressure = inputs.themeBias.aggression
  const difficultyEscalation = inputs.difficulty.themeBiasLethalMultiplier
  const raw = playstyleTolerance * 0.6 + themePressure * 0.25 + difficultyEscalation * 0.15
  return Math.min(1, Math.max(0, raw))
}

export function decideShouldAttackThisTick(
  inputs: AIDecisionInputs,
  resourceSurplusRatio: number,
): boolean {
  const surplusOk = resourceSurplusRatio >= 1 - inputs.difficulty.resourceCushionMultiplier * 0.4
  if (!surplusOk) return false
  const aggressionThreshold = inputs.playstyle.attackThresholdAggression
  const themeAggression = inputs.themeBias.aggression
  const difficultyAggression = inputs.difficulty.themeBiasLethalMultiplier - 1
  const combined = aggressionThreshold * 0.6 + themeAggression * 0.3 + difficultyAggression * 0.1
  return inputs.rng() < combined
}

export interface DecisionSnapshot {
  readonly tick: number
  readonly civId: CivId
  readonly chosenResearchTech: TechNode | null
  readonly chosenBuilding: BuildingDef | null
  readonly chosenShipVariant: ColonyShipDef | null
  readonly chosenAttackTarget: ObservedEnemyPlanet | null
  readonly chosenCampaign: CampaignDef | null
  readonly conscriptionThreshold: number
  readonly attackingThisTick: boolean
}

export function summarizeDecisionForLogs(snapshot: DecisionSnapshot): string {
  const parts: string[] = [`tick=${snapshot.tick}`, `civ=${String(snapshot.civId)}`]
  if (snapshot.chosenResearchTech) parts.push(`research=${snapshot.chosenResearchTech.name}`)
  if (snapshot.chosenBuilding) parts.push(`build=${snapshot.chosenBuilding.name}`)
  if (snapshot.chosenShipVariant) parts.push(`ship=${snapshot.chosenShipVariant.name}`)
  if (snapshot.chosenAttackTarget)
    parts.push(`attack=${String(snapshot.chosenAttackTarget.planetId)}`)
  if (snapshot.chosenCampaign) parts.push(`campaign=${snapshot.chosenCampaign.name}`)
  parts.push(`consc=${snapshot.conscriptionThreshold.toFixed(2)}`)
  parts.push(`attacking=${snapshot.attackingThisTick}`)
  return parts.join(' | ')
}

export function buildDecisionSnapshot(
  inputs: AIDecisionInputs,
  tick: number,
  civId: CivId,
  buildingCtx: PlanetBuildingContext | null,
  unlockedBuildings: ReadonlySet<string> | null,
  shipCtx: ShipLoadoutContext | null,
  visibleTargets: ReadonlyArray<ObservedEnemyPlanet>,
  campaignCtx: CampaignContext | null,
  resourceSurplusRatio: number,
): DecisionSnapshot {
  const chosenResearchTech = pickResearchPriority(inputs)
  const chosenBuilding =
    buildingCtx && unlockedBuildings
      ? pickConstructionTarget(inputs, buildingCtx, unlockedBuildings)
      : null
  const chosenShipVariant = shipCtx ? pickShipLoadout(inputs, shipCtx) : null
  const chosenAttackTarget = pickAttackTarget(inputs, visibleTargets)
  const chosenCampaign = campaignCtx ? pickCampaign(inputs, campaignCtx) : null
  const conscriptionThreshold = decideConscriptionThreshold(inputs)
  const attackingThisTick = decideShouldAttackThisTick(inputs, resourceSurplusRatio)
  return {
    tick,
    civId,
    chosenResearchTech,
    chosenBuilding,
    chosenShipVariant,
    chosenAttackTarget,
    chosenCampaign,
    conscriptionThreshold,
    attackingThisTick,
  }
}

export const COLONY_SHIP_DEFS_INDEXED: ReadonlyMap<string, ColonyShipDef> = new Map(
  COLONY_SHIPS.map((s) => [s.id as unknown as string, s]),
)
