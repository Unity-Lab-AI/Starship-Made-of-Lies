import {
  type AIPersonalityBias,
  type CampaignContext,
  type CivId,
  type DecisionSnapshot,
  type AIDifficultyConfig,
  type Empire,
  type ObservedEnemyPlanet,
  type PlanetBuildingContext,
  type PlaystyleArchetype,
  type PlaystyleProfile,
  type ShipLoadoutContext,
  type Theme,
  aiBiasForTheme,
  buildDecisionSnapshot,
  filterFogOfWarEnemies,
  getAIDifficultyConfig,
  getPlaystyleProfile,
  shouldDecideThisTick,
  startResearch,
  summarizeDecisionForLogs,
  type AIDifficultyLevel,
} from '@smol/shared'

export interface AIControllerSpec {
  readonly civId: CivId
  readonly empire: Empire
  readonly theme: Theme
  readonly playstyleArchetype: PlaystyleArchetype
  readonly difficulty: AIDifficultyLevel
  readonly decisionOffsetTicks: number
  readonly rngSeed: number
}

function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

export interface AITickObservables {
  readonly buildingCtx: PlanetBuildingContext | null
  readonly unlockedBuildings: ReadonlySet<string> | null
  readonly shipCtx: ShipLoadoutContext | null
  readonly observedEnemies: ReadonlyArray<ObservedEnemyPlanet>
  readonly campaignCtx: CampaignContext | null
  readonly resourceSurplusRatio: number
}

export interface AITickResult {
  readonly decided: boolean
  readonly snapshot: DecisionSnapshot | null
  readonly logLine: string | null
  readonly appliedActions: ReadonlyArray<string>
}

export class AIController {
  readonly civId: CivId
  readonly empire: Empire
  readonly theme: Theme
  readonly playstyle: PlaystyleProfile
  readonly themeBias: AIPersonalityBias
  readonly difficultyConfig: AIDifficultyConfig
  readonly decisionOffsetTicks: number
  private readonly rng: () => number
  lastDecidedTick: number = -1
  lastSnapshot: DecisionSnapshot | null = null

  constructor(spec: AIControllerSpec) {
    this.civId = spec.civId
    this.empire = spec.empire
    this.theme = spec.theme
    this.playstyle = getPlaystyleProfile(spec.playstyleArchetype)
    this.themeBias = aiBiasForTheme(spec.theme)
    this.difficultyConfig = getAIDifficultyConfig(spec.difficulty)
    this.decisionOffsetTicks = spec.decisionOffsetTicks
    this.rng = makeRng(spec.rngSeed)
  }

  tick(
    currentTick: number,
    observables: AITickObservables,
    hostileCivCheck: (civId: CivId) => boolean,
  ): AITickResult {
    if (!shouldDecideThisTick(this.difficultyConfig, currentTick, this.decisionOffsetTicks)) {
      return { decided: false, snapshot: null, logLine: null, appliedActions: [] }
    }
    const visibleHostile = filterFogOfWarEnemies(
      observables.observedEnemies,
      this.difficultyConfig,
      hostileCivCheck,
    )
    const snapshot = buildDecisionSnapshot(
      {
        empire: this.empire,
        playstyle: this.playstyle,
        themeBias: this.themeBias,
        difficulty: this.difficultyConfig,
        rng: this.rng,
      },
      currentTick,
      this.civId,
      observables.buildingCtx,
      observables.unlockedBuildings,
      observables.shipCtx,
      visibleHostile,
      observables.campaignCtx,
      observables.resourceSurplusRatio,
    )
    const applied = this.applyDecisions(snapshot)
    this.lastDecidedTick = currentTick
    this.lastSnapshot = snapshot
    return {
      decided: true,
      snapshot,
      logLine: summarizeDecisionForLogs(snapshot),
      appliedActions: applied,
    }
  }

  private applyDecisions(snapshot: DecisionSnapshot): ReadonlyArray<string> {
    const applied: string[] = []
    if (snapshot.chosenResearchTech && this.empire.activeResearchTechId === null) {
      const ok = startResearch(this.empire, snapshot.chosenResearchTech.id)
      if (ok) applied.push(`startResearch:${snapshot.chosenResearchTech.id}`)
    }
    if (snapshot.chosenBuilding) {
      applied.push(`queueBuild:${snapshot.chosenBuilding.id}`)
    }
    if (snapshot.chosenShipVariant) {
      applied.push(`queueShip:${snapshot.chosenShipVariant.id}`)
    }
    if (snapshot.attackingThisTick && snapshot.chosenAttackTarget && snapshot.chosenShipVariant) {
      applied.push(
        `launchAttack:${String(snapshot.chosenAttackTarget.planetId)}:${snapshot.chosenShipVariant.id}`,
      )
    }
    if (snapshot.chosenCampaign) {
      applied.push(`launchCampaign:${snapshot.chosenCampaign.archetype}`)
    }
    return applied
  }

  describeBriefly(): string {
    return `${this.theme.emoji} ${this.theme.name} ${this.playstyle.emoji} ${this.playstyle.name} (${this.difficultyConfig.name})`
  }
}

export class AIControllerRegistry {
  private readonly controllers = new Map<CivId, AIController>()

  register(controller: AIController): void {
    this.controllers.set(controller.civId, controller)
  }

  unregister(civId: CivId): void {
    this.controllers.delete(civId)
  }

  get(civId: CivId): AIController | undefined {
    return this.controllers.get(civId)
  }

  all(): ReadonlyArray<AIController> {
    return Array.from(this.controllers.values())
  }

  size(): number {
    return this.controllers.size
  }

  tickAll(
    currentTick: number,
    observablesBuilder: (controller: AIController) => AITickObservables,
    hostileCivCheck: (sourceCivId: CivId, targetCivId: CivId) => boolean,
  ): ReadonlyArray<AITickResult> {
    const results: AITickResult[] = []
    for (const controller of this.controllers.values()) {
      const observables = observablesBuilder(controller)
      const result = controller.tick(currentTick, observables, (cid) =>
        hostileCivCheck(controller.civId, cid),
      )
      results.push(result)
    }
    return results
  }
}
