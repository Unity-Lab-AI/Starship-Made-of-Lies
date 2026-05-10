import {
  type AIDifficultyLevel,
  type Account,
  type ActiveCampaign,
  type BuildingDefId,
  type CampaignArchetype,
  type CivId,
  type ColonyShipFlight,
  type ColonyShipVariantId,
  type DeathLedger,
  type DeceptionLedger,
  type Empire,
  type FactionSplit,
  type Galaxy,
  type LaunchPad,
  type MissionObjectiveConfig,
  type MissionObjectiveId,
  type Planet,
  type PlanetBeacon,
  type PlanetId,
  type PlanetInventory,
  type PlanetPopulation,
  type PlanetWorkforce,
  type PlaystyleArchetype,
  type Theme,
  type ThemeId,
  type TileId,
  aggregateActiveCampaignBonus,
  aggregateEffects,
  aggregateEmpireResearchPoints,
  applyDeceptionFactionTick,
  applyQoLBirthTick,
  applyStarvationDeaths,
  buildHumanCoopAlliance,
  civId,
  colonyShipFlightId,
  computeCrashOutcome,
  controlledPlanetCount,
  deceptionPenalties,
  deriveCrashLootFromShipPayload,
  generateGalaxy,
  getBuildingDef,
  getColonyShipDef,
  getTheme,
  getThemePolish,
  hasWonByTech,
  isCampaignActive,
  isTechResearchable,
  loadCitizens,
  loadFuel,
  newActiveCampaign,
  newColonyShipFlight,
  newDeathLedger,
  newDeceptionLedger,
  newEmpire,
  newFactionSplit,
  newLaunchPad,
  newPlanetBeacon,
  newPlanetInventory,
  newPlanetPopulation,
  newPlanetWorkforce,
  performanceMultiplier,
  pushBeaconAlert,
  qualityOfLifeIndex,
  recordColonyShipLaunch,
  recordPlanetGain,
  resolveMatchEnd,
  startPrint,
  startResearch,
  stockOf,
  tickActiveCampaign,
  tickFlight,
  tickPad,
  tickPlanetProduction,
  tickResearch,
  tickTierPromotion,
  totalPopulation,
  RESOURCE_FOOD,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_PLANKS,
  RESOURCE_PROPAGANDA_MATERIALS,
  RESOURCE_FUEL,
  SHIP_SCOUT,
  THEMES,
  generatePlanetResearchPoints,
} from '@smol/shared'

export type MatchPhase = 'STARTING' | 'IN_PROGRESS' | 'ENDED'

export interface MatchPlanetState {
  readonly planet: Planet
  readonly civId: CivId
  inventory: PlanetInventory
  workforce: PlanetWorkforce
  population: PlanetPopulation
  faction: FactionSplit
  beacon: PlanetBeacon
  buildingsByDef: Map<BuildingDefId, number>
  buildingsByTile: Map<TileId, BuildingDefId>
  launchPads: Map<TileId, LaunchPad>
  activeCampaigns: ActiveCampaign[]
}

export interface MatchCivState {
  readonly civId: CivId
  readonly themeId: ThemeId
  readonly theme: Theme
  readonly displayName: string
  readonly isHuman: boolean
  readonly playstyle: PlaystyleArchetype | null
  readonly difficulty: AIDifficultyLevel | null
  readonly empire: Empire
  readonly deceptionLedger: DeceptionLedger
  readonly deathLedger: DeathLedger
  homePlanetId: PlanetId
  alive: boolean
}

export interface MatchEventLog {
  readonly atTick: number
  readonly civId: CivId | null
  readonly kind:
    | 'launch'
    | 'research'
    | 'build'
    | 'campaign'
    | 'intercept'
    | 'civ_defeated'
    | 'system'
  readonly message: string
}

export interface MatchState {
  readonly matchId: string
  readonly seed: number
  readonly galaxy: Galaxy
  readonly civs: Map<CivId, MatchCivState>
  readonly planets: Map<PlanetId, MatchPlanetState>
  readonly flights: Map<string, ColonyShipFlight>
  readonly humanCivId: CivId
  readonly objectives: ReadonlyArray<MissionObjectiveConfig>
  readonly tickCap: number | null
  events: MatchEventLog[]
  currentTick: number
  startedAtTick: number
  phase: MatchPhase
  winningCivId: CivId | null
  endReason: 'objective_met' | 'tick_cap_hit' | 'admin_end' | null
  resolvedObjectiveId: MissionObjectiveId | null
  rng: () => number
}

export interface MatchConfig {
  readonly seed: number
  readonly planetCount: number
  readonly aiCount: number
  readonly humanThemeId: ThemeId
  readonly humanDisplayName: string
  readonly humanAccount: Account
  readonly objectives: ReadonlyArray<MissionObjectiveConfig>
  readonly tickCapOverride: number | null
}

const HOME_PLANET_STARTING_POP = 1000
const STARTING_FOOD = 1500
const STARTING_PLANKS = 320
const STARTING_METALS = 880
const STARTING_INGOTS = 240
const STARTING_PROPAGANDA = 80
const STARTING_FUEL = 60
const MAX_EVENTS = 200

export function createMatch(config: MatchConfig): MatchState {
  const galaxy = generateGalaxy({ seed: config.seed, planetCount: config.planetCount })
  const rng = mulberry32(config.seed ^ 0xa5a5a5)

  const civs = new Map<CivId, MatchCivState>()
  const planets = new Map<PlanetId, MatchPlanetState>()

  const humanCivId = civId(`civ-human-${config.humanAccount.profile.handle}`)
  const humanTheme = getTheme(config.humanThemeId)
  const humanHomePlanet = galaxy.planets[0]!
  civs.set(humanCivId, {
    civId: humanCivId,
    themeId: config.humanThemeId,
    theme: humanTheme,
    displayName: config.humanDisplayName,
    isHuman: true,
    playstyle: null,
    difficulty: null,
    empire: newEmpire(humanCivId, humanHomePlanet.id),
    deceptionLedger: newDeceptionLedger(),
    deathLedger: newDeathLedger(humanCivId),
    homePlanetId: humanHomePlanet.id,
    alive: true,
  })
  planets.set(humanHomePlanet.id, makePlanetState(humanHomePlanet, humanCivId))

  const playstyles: ReadonlyArray<PlaystyleArchetype> = [
    'builder',
    'warmonger',
    'researcher',
    'trickster',
  ]
  const difficulties: ReadonlyArray<AIDifficultyLevel> = ['easy', 'medium', 'hard', 'brutal']
  const usedThemes = new Set<ThemeId>([config.humanThemeId])

  for (let i = 0; i < config.aiCount; i++) {
    const aiId = civId(`civ-ai-${i}`)
    const themePool = THEMES.filter((t) => !usedThemes.has(t.id))
    const themeIdx = Math.floor(rng() * themePool.length)
    const aiTheme = themePool[themeIdx] ?? THEMES[(i + 1) % THEMES.length]!
    usedThemes.add(aiTheme.id)
    const homePlanet = galaxy.planets[i + 1]
    if (!homePlanet) break
    const playstyle = playstyles[i % playstyles.length]!
    const difficulty = difficulties[i % difficulties.length]!
    civs.set(aiId, {
      civId: aiId,
      themeId: aiTheme.id,
      theme: aiTheme,
      displayName: `${aiTheme.emoji} ${aiTheme.name}`,
      isHuman: false,
      playstyle,
      difficulty,
      empire: newEmpire(aiId, homePlanet.id),
      deceptionLedger: newDeceptionLedger(),
      deathLedger: newDeathLedger(aiId),
      homePlanetId: homePlanet.id,
      alive: true,
    })
    planets.set(homePlanet.id, makePlanetState(homePlanet, aiId))
  }

  return {
    matchId: `match-${config.seed}-${Date.now()}`,
    seed: config.seed,
    galaxy,
    civs,
    planets,
    flights: new Map(),
    humanCivId,
    objectives: config.objectives,
    tickCap: config.tickCapOverride,
    events: [
      {
        atTick: 0,
        civId: null,
        kind: 'system',
        message: `Match started. ${civs.size} civs · ${galaxy.planets.length} planets · seed ${config.seed}`,
      },
    ],
    currentTick: 0,
    startedAtTick: 0,
    phase: 'IN_PROGRESS',
    winningCivId: null,
    endReason: null,
    resolvedObjectiveId: null,
    rng,
  }
}

function makePlanetState(planet: Planet, ownerId: CivId): MatchPlanetState {
  const inv = newPlanetInventory(planet.id)
  inv.stocks.set(RESOURCE_FOOD, STARTING_FOOD)
  inv.stocks.set(RESOURCE_PLANKS, STARTING_PLANKS)
  inv.stocks.set(RESOURCE_METALS, STARTING_METALS)
  inv.stocks.set(RESOURCE_INGOTS, STARTING_INGOTS)
  inv.stocks.set(RESOURCE_PROPAGANDA_MATERIALS, STARTING_PROPAGANDA)
  inv.stocks.set(RESOURCE_FUEL, STARTING_FUEL)
  for (const tile of planet.tiles) {
    if (tile.ownerCivId === null) tile.ownerCivId = ownerId
  }
  return {
    planet,
    civId: ownerId,
    inventory: inv,
    workforce: newPlanetWorkforce(planet.id),
    population: newPlanetPopulation(planet.id, ownerId, HOME_PLANET_STARTING_POP),
    faction: newFactionSplit(HOME_PLANET_STARTING_POP),
    beacon: newPlanetBeacon(planet.id, ownerId),
    buildingsByDef: new Map(),
    buildingsByTile: new Map(),
    launchPads: new Map(),
    activeCampaigns: [],
  }
}

export function tickMatch(state: MatchState): void {
  if (state.phase !== 'IN_PROGRESS') return
  state.currentTick += 1

  for (const planet of state.planets.values()) {
    if (!isCivAlive(state, planet.civId)) continue
    tickPlanet(state, planet)
  }

  for (const civState of state.civs.values()) {
    if (!civState.alive) continue
    tickCivResearch(state, civState)
    if (!civState.isHuman) tickAIDecisions(state, civState)
  }

  for (const flight of [...state.flights.values()]) {
    const result = tickFlight(flight)
    if (
      flight.phase === 'DETONATE' ||
      flight.phase === 'INTERCEPTED' ||
      flight.phase === 'ABORTED' ||
      flight.phase === 'CRASH_LANDED'
    ) {
      handleFlightOutcome(state, flight)
    }
    void result
  }

  resolveMatch(state)
}

function tickPlanet(state: MatchState, planetState: MatchPlanetState): void {
  const civState = state.civs.get(planetState.civId)
  if (!civState) return
  const techEffects = aggregateEffects(civState.empire.researchedTechs)
  const polish = getThemePolish(civState.themeId)
  const themeMult = 1.0
  const decep = deceptionPenalties(planetState.faction)

  const buildings: Array<{ defId: BuildingDefId; def: ReturnType<typeof getBuildingDef> }> = []
  for (const [defId, count] of planetState.buildingsByDef) {
    const def = getBuildingDef(defId)
    for (let i = 0; i < count; i++) buildings.push({ defId, def })
  }

  if (buildings.length > 0) {
    tickPlanetProduction({
      buildings,
      biome: planetState.planet.biome,
      workforce: planetState.workforce.sliders,
      faction: planetState.faction,
      inventory: planetState.inventory,
      techProductionMultiplier: techEffects.buildingProductionMultiplier,
      themeProductionMultiplier: themeMult,
      deceptionProductionMultiplier: decep.production,
    })
  }

  applyDeceptionFactionTick(planetState.faction, {
    buildingCounts: planetState.buildingsByDef,
    activeCampaigns: planetState.activeCampaigns,
    techPropagandaMultiplier: techEffects.propagandaPowerMultiplier,
    themePropagandaMultiplier: themeMult,
  })

  for (const c of planetState.activeCampaigns) tickActiveCampaign(c)
  planetState.activeCampaigns = planetState.activeCampaigns.filter(isCampaignActive)

  const totalPop = totalPopulation(planetState.population)
  const foodStock = stockOf(planetState.inventory, RESOURCE_FOOD)
  const foodPerCitizen = totalPop === 0 ? 1 : foodStock / Math.max(1, totalPop)
  const foodConsumed = Math.min(foodStock, totalPop)
  if (foodConsumed > 0) planetState.inventory.stocks.set(RESOURCE_FOOD, foodStock - foodConsumed)

  if (foodPerCitizen < 1) {
    applyStarvationDeaths({
      tick: state.currentTick,
      population: planetState.population,
      foodPerCitizen,
      themeStarvationResistMultiplier: polish.starvationResistMultiplier,
      ledger: civState.deathLedger,
    })
  }

  const qol = qualityOfLifeIndex({
    population: planetState.population,
    inventory: planetState.inventory,
    hasPowerInfrastructure: planetState.buildingsByDef.size > 2,
  })

  applyQoLBirthTick({
    population: planetState.population,
    qol,
    baseGrowthRatePerTick: 0.002,
  })

  if (state.currentTick % 20 === 0) {
    tickTierPromotion({
      tick: state.currentTick,
      population: planetState.population,
      qol,
      techPromotionMultiplier: techEffects.citizenPromotionRateMultiplier,
      propagandaPromotionMultiplier: 1 + performanceMultiplier(planetState.faction) * 0.2,
    })
  }

  for (const pad of planetState.launchPads.values()) {
    tickPad(pad, planetState.inventory)
  }
}

function tickCivResearch(state: MatchState, civState: MatchCivState): void {
  const points: number[] = []
  for (const planetId of civState.empire.controlledPlanetIds) {
    const ps = state.planets.get(planetId)
    if (!ps) continue
    const total = totalPopulation(ps.population)
    const counts = ps.buildingsByDef
    points.push(
      generatePlanetResearchPoints({
        workforce: ps.workforce,
        totalCitizens: total,
        faction: ps.faction,
        buildingCounts: counts,
      }),
    )
  }
  const aggregate = aggregateEmpireResearchPoints(civState.empire, points)
  if (aggregate <= 0) return
  if (!civState.empire.activeResearchTechId) return
  const result = tickResearch(civState.empire, aggregate)
  if (result.completed) {
    pushEvent(state, {
      atTick: state.currentTick,
      civId: civState.civId,
      kind: 'research',
      message: `${civState.theme.emoji} ${civState.displayName} researched a new tech.`,
    })
  }
}

function tickAIDecisions(state: MatchState, civState: MatchCivState): void {
  const planet = state.planets.get(civState.homePlanetId)
  if (!planet) return

  if (state.currentTick % 60 === 0 && !civState.empire.activeResearchTechId) {
    const candidates = []
    for (const node of [
      'industrialLogistics',
      'massProduction',
      'electricPower',
      'computing',
      'aerospace',
      'orbitalMechanics',
      'fusionPower',
    ] as const) {
      if (isTechResearchable(civState.empire, node as never)) candidates.push(node)
    }
    if (candidates.length > 0) {
      const pick = candidates[Math.floor(state.rng() * candidates.length)]!
      startResearch(civState.empire, pick as never)
    }
  }

  if (state.currentTick % 80 === 0 && planet.buildingsByDef.size < 8) {
    const buildOptions: BuildingDefId[] = [
      'farm' as BuildingDefId,
      'aqueduct' as BuildingDefId,
      'lumberCamp' as BuildingDefId,
      'mine' as BuildingDefId,
      'factory' as BuildingDefId,
      'lab' as BuildingDefId,
      'school' as BuildingDefId,
    ]
    const pick = buildOptions[Math.floor(state.rng() * buildOptions.length)]!
    placeBuildingInternal(state, planet, pick)
  }

  const aggressive = civState.playstyle === 'warmonger' || civState.playstyle === 'trickster'
  if (
    aggressive &&
    state.currentTick > 600 &&
    state.currentTick % 240 === 0 &&
    civState.empire.researchedTechs.has('aerospace' as never)
  ) {
    launchAIShip(state, civState, planet)
  }
}

function launchAIShip(state: MatchState, civState: MatchCivState, planet: MatchPlanetState): void {
  const targetCiv = state.civs.get(state.humanCivId)
  if (!targetCiv?.alive) return
  const targetPlanet = state.planets.get(targetCiv.homePlanetId)
  if (!targetPlanet) return
  const flightId = colonyShipFlightId(`flight-${state.currentTick}-${civState.civId}`)
  const flight = newColonyShipFlight({
    id: flightId,
    variantId: SHIP_SCOUT,
    launchingCivId: civState.civId,
    fromPlanetId: planet.planet.id,
    targetPlanetId: targetPlanet.planet.id,
    fromPosition: planet.planet.position,
    targetPosition: targetPlanet.planet.position,
    travelRadius: 1000,
    citizensAboard: 0,
    signalLossSeed: Math.floor(state.rng() * 0xffffff),
  })
  state.flights.set(String(flightId), flight)
  recordColonyShipLaunch(civState.deceptionLedger, 0)
  pushBeaconAlert(targetPlanet.beacon, {
    id: `alert-${flightId}`,
    planetId: targetPlanet.planet.id,
    observerCivId: targetPlanet.civId,
    kind: 'INCOMING_HOSTILE',
    atTick: state.currentTick,
    summary: `Inbound from ${civState.theme.emoji} ${civState.theme.name}`,
    relatedFlightId: String(flightId),
  })
  pushEvent(state, {
    atTick: state.currentTick,
    civId: civState.civId,
    kind: 'launch',
    message: `${civState.theme.emoji} ${civState.displayName} launched a colony ship.`,
  })
}

function handleFlightOutcome(state: MatchState, flight: ColonyShipFlight): void {
  if (!state.flights.has(String(flight.id))) return
  const launchingCiv = state.civs.get(flight.launchingCivId)
  const targetPlanet = state.planets.get(flight.targetPlanetId)
  if (flight.phase === 'DETONATE' && launchingCiv && targetPlanet) {
    pushEvent(state, {
      atTick: state.currentTick,
      civId: flight.launchingCivId,
      kind: 'launch',
      message: `${launchingCiv.theme.emoji} ${launchingCiv.displayName} ship arrived at ${String(targetPlanet.planet.id)}.`,
    })
  }
  state.flights.delete(String(flight.id))
}

function resolveMatch(state: MatchState): void {
  const aliveCivIds: CivId[] = []
  for (const civ of state.civs.values()) {
    if (civ.alive) aliveCivIds.push(civ.civId)
  }
  const civProgress = new Map<MissionObjectiveId, ReadonlyArray<{ civId: CivId; value: number }>>()
  const highscore: { civId: CivId; value: number }[] = []
  const resource: { civId: CivId; value: number }[] = []
  const apex: { civId: CivId; value: number }[] = []
  for (const civId of aliveCivIds) {
    const civ = state.civs.get(civId)
    if (!civ) continue
    let civHigh = 0
    let civRes = 0
    civHigh += controlledPlanetCount(civ.empire) * 1000
    civHigh += civ.empire.defeatedCivIds.size * 5000
    civHigh += civ.empire.researchedTechs.size * 200
    civHigh += civ.deceptionLedger.colonyShipsLaunched * 50
    for (const planetId of civ.empire.controlledPlanetIds) {
      const ps = state.planets.get(planetId)
      if (!ps) continue
      for (const amount of ps.inventory.stocks.values()) civRes += amount
    }
    highscore.push({ civId, value: civHigh })
    resource.push({ civId, value: civRes })
    apex.push({ civId, value: hasWonByTech(civ.empire) ? 1 : 0 })
  }
  civProgress.set('highscore_target', highscore)
  civProgress.set('resource_target', resource)
  civProgress.set('apex_tech', apex)

  const elapsed = state.currentTick - state.startedAtTick
  const resolution = resolveMatchEnd({
    enabledObjectives: state.objectives,
    civProgress,
    aliveCivIds,
    currentTick: elapsed,
    tickCap: state.tickCap,
  })
  if (resolution.ended) {
    state.phase = 'ENDED'
    state.winningCivId = resolution.winningCivId
    state.endReason = resolution.reason
    state.resolvedObjectiveId = resolution.resolvedObjectiveId
    const winner = resolution.winningCivId === null ? null : state.civs.get(resolution.winningCivId)
    pushEvent(state, {
      atTick: state.currentTick,
      civId: resolution.winningCivId,
      kind: 'system',
      message: winner
        ? `Match ended — ${winner.theme.emoji} ${winner.displayName} prevailed (${resolution.resolvedObjectiveId ?? resolution.reason}).`
        : `Match ended — no winner (${resolution.reason ?? 'unknown'}).`,
    })
  }
}

function isCivAlive(state: MatchState, id: CivId): boolean {
  return state.civs.get(id)?.alive ?? false
}

function pushEvent(state: MatchState, ev: MatchEventLog): void {
  state.events.push(ev)
  while (state.events.length > MAX_EVENTS) state.events.shift()
}

function placeBuildingInternal(
  state: MatchState,
  planet: MatchPlanetState,
  defId: BuildingDefId,
): boolean {
  const empty = planet.planet.tiles.find(
    (t) => t.ownerCivId === planet.civId && t.occupancy === 'empty',
  )
  if (!empty) return false
  empty.occupancy = 'building'
  planet.buildingsByDef.set(defId, (planet.buildingsByDef.get(defId) ?? 0) + 1)
  planet.buildingsByTile.set(empty.id, defId)
  if (defId === ('launchPad' as BuildingDefId)) {
    const pad = newLaunchPad(empty.id, planet.civId, planet.planet.id, false)
    planet.launchPads.set(empty.id, pad)
  }
  void state
  return true
}

export interface PlaceBuildingInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
  readonly tileId?: TileId
  readonly defId: BuildingDefId
}

export function placeBuildingAction(inputs: PlaceBuildingInputs): boolean {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet) return false
  if (planet.civId !== inputs.state.humanCivId) return false
  const def = getBuildingDef(inputs.defId)
  if (!def) return false
  for (const cost of def.buildCost) {
    if (stockOf(planet.inventory, cost.resource) < cost.amount) return false
  }
  for (const cost of def.buildCost) {
    const cur = stockOf(planet.inventory, cost.resource)
    planet.inventory.stocks.set(cost.resource, cur - cost.amount)
  }
  let tile = inputs.tileId ? planet.planet.tiles.find((t) => t.id === inputs.tileId) : null
  if (!tile) {
    tile = planet.planet.tiles.find((t) => t.ownerCivId === planet.civId && t.occupancy === 'empty')
  }
  if (!tile || tile.occupancy !== 'empty') return false
  tile.occupancy = 'building'
  planet.buildingsByDef.set(inputs.defId, (planet.buildingsByDef.get(inputs.defId) ?? 0) + 1)
  planet.buildingsByTile.set(tile.id, inputs.defId)
  if (inputs.defId === ('launchPad' as BuildingDefId)) {
    const pad = newLaunchPad(tile.id, planet.civId, planet.planet.id, false)
    planet.launchPads.set(tile.id, pad)
  }
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: planet.civId,
    kind: 'build',
    message: `Built ${def.name} on ${String(planet.planet.id)}`,
  })
  return true
}

export interface StartResearchInputs {
  readonly state: MatchState
  readonly techId: string
}

export function startResearchAction(inputs: StartResearchInputs): boolean {
  const civState = inputs.state.civs.get(inputs.state.humanCivId)
  if (!civState) return false
  return startResearch(civState.empire, inputs.techId as never)
}

export interface LaunchCampaignInputs {
  readonly state: MatchState
  readonly archetype: CampaignArchetype
  readonly planetId: PlanetId
}

export function launchCampaignAction(inputs: LaunchCampaignInputs): boolean {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet) return false
  if (planet.civId !== inputs.state.humanCivId) return false
  planet.activeCampaigns.push(newActiveCampaign(inputs.archetype, inputs.state.currentTick))
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: planet.civId,
    kind: 'campaign',
    message: `Launched ${inputs.archetype} campaign on ${String(planet.planet.id)}`,
  })
  return true
}

export interface BuildShipInputs {
  readonly state: MatchState
  readonly padId: TileId
  readonly variantId: ColonyShipVariantId
}

export function buildShipAction(inputs: BuildShipInputs): boolean {
  for (const planet of inputs.state.planets.values()) {
    if (planet.civId !== inputs.state.humanCivId) continue
    const pad = planet.launchPads.get(inputs.padId)
    if (!pad) continue
    return startPrint(pad, inputs.variantId, planet.inventory)
  }
  return false
}

export interface LaunchShipInputs {
  readonly state: MatchState
  readonly padId: TileId
  readonly targetPlanetId: PlanetId
}

export function launchShipFromPadAction(inputs: LaunchShipInputs): boolean {
  for (const planet of inputs.state.planets.values()) {
    if (planet.civId !== inputs.state.humanCivId) continue
    const pad = planet.launchPads.get(inputs.padId)
    if (!pad) continue
    if (pad.state !== 'READY' && pad.state !== 'ARM') return false
    if (!pad.loadedShipVariantId) return false
    const targetPlanet = inputs.state.planets.get(inputs.targetPlanetId)
    if (!targetPlanet) return false
    const def = getColonyShipDef(pad.loadedShipVariantId)
    const flightIdStr = `flight-${inputs.state.currentTick}-${planet.civId}-${pad.id}`
    const flight = newColonyShipFlight({
      id: colonyShipFlightId(flightIdStr),
      variantId: pad.loadedShipVariantId,
      launchingCivId: planet.civId,
      fromPlanetId: planet.planet.id,
      targetPlanetId: targetPlanet.planet.id,
      fromPosition: planet.planet.position,
      targetPosition: targetPlanet.planet.position,
      travelRadius: 1000,
      citizensAboard: pad.citizensLoaded,
      signalLossSeed: Math.floor(inputs.state.rng() * 0xffffff),
    })
    inputs.state.flights.set(flightIdStr, flight)
    pad.state = 'GONE'
    const civState = inputs.state.civs.get(planet.civId)
    if (civState) {
      recordColonyShipLaunch(civState.deceptionLedger, pad.citizensLoaded)
    }
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: planet.civId,
      kind: 'launch',
      message: `Launched ${def.name} → ${String(targetPlanet.planet.id)}`,
    })
    return true
  }
  return false
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

void buildHumanCoopAlliance
void deriveCrashLootFromShipPayload
void computeCrashOutcome
void recordPlanetGain
void aggregateActiveCampaignBonus
void loadFuel
void loadCitizens
