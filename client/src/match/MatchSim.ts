import {
  type AIController,
  type AIDifficultyLevel,
  type AITickObservables,
  type Account,
  type ActiveCampaign,
  type BuildingDefId,
  type CampaignArchetype,
  type CampaignContext,
  type CivId,
  type ColonyShipDef,
  type ColonyShipFlight,
  type ColonyShipVariantId,
  type DeathLedger,
  type DeceptionLedger,
  type Empire,
  type FactionSplit,
  type Galaxy,
  type IndigenousCiv,
  type LastHopeEvacState,
  type LaunchPad,
  type LootDrop,
  type LootDropId,
  type MiningShip,
  type MissionObjectiveConfig,
  type MissionObjectiveId,
  type ObservedEnemyPlanet,
  type Planet,
  type PlanetBeacon,
  type PlanetBuildingContext,
  type PlanetId,
  type PlanetInventory,
  type PlanetPopulation,
  type PlanetShipBeaconBuffer,
  type PlanetWorkforce,
  type PlaystyleArchetype,
  type ShipLoadoutContext,
  type Theme,
  type ThemeId,
  type Tile,
  type TileId,
  AIControllerRegistry,
  AIController as AIControllerCtor,
  BLDG_FACTORY,
  BLDG_FARM,
  BLDG_LAB,
  BLDG_LAUNCH_PAD,
  BLDG_LUMBER_CAMP,
  BLDG_MINE,
  BLDG_TV_STATION,
  CAMPAIGNS,
  COLONY_SHIPS,
  LAST_HOPE_BUILD_TICKS,
  LAST_HOPE_LAUNCH_TICKS,
  LAST_HOPE_PACK_TICKS,
  RESOURCE_AMMUNITION,
  RESOURCE_BRICKS,
  RESOURCE_COMPONENTS,
  RESOURCE_ELECTRONICS,
  RESOURCE_FOOD,
  RESOURCE_FUEL,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_PLANKS,
  RESOURCE_PROPAGANDA_MATERIALS,
  RESOURCE_STONE,
  RESOURCE_WOOD,
  SHIP_SCOUT,
  SHIP_STANDARD,
  THEMES,
  aggregateActiveCampaignBonus,
  aggregateEffects,
  aggregateEmpireResearchPoints,
  applyDeceptionFactionTick,
  applyQoLBirthTick,
  applyStarvationDeaths,
  attemptIndigenousParley,
  buildHumanCoopAlliance,
  civId,
  claimLootDrop,
  colonyShipFlightId,
  computeCrashOutcome,
  controlledPlanetCount,
  createLootDrop,
  deathsInWindow,
  defaultHomeDockPosition,
  deceptionPenalties,
  defaultBuildFromShipDef,
  deriveCrashLootFromShipPayload,
  dissidentRatio,
  generateGalaxy,
  generatePlanetResearchPoints,
  getBuildingDef,
  getColonyShipDef,
  getTheme,
  getThemePolish,
  hasWonByTech,
  indigenousLootOnDefeat,
  initiateLastHopeEvac,
  isCampaignActive,
  isLootDropExpired,
  loadCitizens,
  loadFuel,
  lootDropId,
  newActiveCampaign,
  newColonyShipFlight,
  newDeathLedger,
  newDeceptionLedger,
  newEmpire,
  newFactionSplit,
  newLaunchPad,
  newMiningShip,
  newPlanetBeacon,
  newPlanetInventory,
  newPlanetPopulation,
  newPlanetShipBeaconBuffer,
  newPlanetWorkforce,
  performanceMultiplier,
  pushBeaconAlert,
  qualityOfLifeIndex,
  recordColonyShipLaunch,
  recordDeath,
  recordShipBeacon,
  recordPlanetGain,
  recordPlanetLoss,
  resolveMatchEnd,
  shouldAutoTriggerLastHope,
  spawnIndigenousCiv,
  startPrint,
  startResearch,
  stockOf,
  tickActiveCampaign,
  tickFlight,
  tickIndigenousAttacks,
  tickLastHopeEvac,
  tickMiningShip,
  tickPad,
  tickPlanetProduction,
  tickResearch,
  tickTierPromotion,
  totalPopulation,
} from '@smol/shared'

export type MatchPhase = 'STARTING' | 'IN_PROGRESS' | 'ENDED'

export interface MatchPlanetState {
  readonly planet: Planet
  civId: CivId
  inventory: PlanetInventory
  workforce: PlanetWorkforce
  population: PlanetPopulation
  faction: FactionSplit
  beacon: PlanetBeacon
  buildingsByDef: Map<BuildingDefId, number>
  buildingsByTile: Map<TileId, BuildingDefId>
  launchPads: Map<TileId, LaunchPad>
  miningShips: Map<string, MiningShip>
  shipBeacons: PlanetShipBeaconBuffer
  activeCampaigns: ActiveCampaign[]
  indigenousCivId: CivId | null
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
  lastHopeEvac: LastHopeEvacState | null
  lastHopeTriggered: boolean
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
    | 'crash'
    | 'loot'
    | 'indigenous'
    | 'last_hope'
    | 'planet_claimed'
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
  readonly aiRegistry: AIControllerRegistry
  readonly indigenousCivs: Map<CivId, IndigenousCiv>
  readonly lootDrops: Map<string, LootDrop>
  events: MatchEventLog[]
  currentTick: number
  startedAtTick: number
  phase: MatchPhase
  winningCivId: CivId | null
  endReason: 'objective_met' | 'tick_cap_hit' | 'admin_end' | null
  resolvedObjectiveId: MissionObjectiveId | null
  rng: () => number
}

export interface MatchAISlotConfig {
  readonly playstyle: PlaystyleArchetype
  readonly difficulty: AIDifficultyLevel
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
  readonly aiSlots?: ReadonlyArray<MatchAISlotConfig>
}

const HOME_PLANET_STARTING_POP = 1000
const STARTING_FOOD = 1500
const STARTING_WOOD = 80
const STARTING_STONE = 80
const STARTING_PLANKS = 200
const STARTING_BRICKS = 50
const STARTING_METALS = 400
const STARTING_INGOTS = 200
const STARTING_COMPONENTS = 60
const STARTING_ELECTRONICS = 25
const STARTING_PROPAGANDA = 80
const STARTING_FUEL = 80
const STARTING_AMMO = 200
const MAX_EVENTS = 200
const LOOT_LIFETIME_TICKS_LOCAL = 600
const LAST_HOPE_AUTO_CHECK_INTERVAL = 50
const LAST_HOPE_GRACE_PERIOD_TICKS = 300
const LAST_HOPE_DEATH_WINDOW_TICKS = 100
const INDIGENOUS_PARLEY_INTERVAL = 60

export function createMatch(config: MatchConfig): MatchState {
  const galaxy = generateGalaxy({ seed: config.seed, planetCount: config.planetCount })
  const rng = mulberry32(config.seed ^ 0xa5a5a5)
  const aiRegistry = new AIControllerRegistry()

  const civs = new Map<CivId, MatchCivState>()
  const planets = new Map<PlanetId, MatchPlanetState>()
  const indigenousCivs = new Map<CivId, IndigenousCiv>()

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
    lastHopeEvac: null,
    lastHopeTriggered: false,
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
    const slotCfg = config.aiSlots?.[i]
    const playstyle = slotCfg?.playstyle ?? playstyles[i % playstyles.length]!
    const difficulty = slotCfg?.difficulty ?? difficulties[i % difficulties.length]!
    const empire = newEmpire(aiId, homePlanet.id)
    civs.set(aiId, {
      civId: aiId,
      themeId: aiTheme.id,
      theme: aiTheme,
      displayName: `${aiTheme.emoji} ${aiTheme.name}`,
      isHuman: false,
      playstyle,
      difficulty,
      empire,
      deceptionLedger: newDeceptionLedger(),
      deathLedger: newDeathLedger(aiId),
      homePlanetId: homePlanet.id,
      alive: true,
      lastHopeEvac: null,
      lastHopeTriggered: false,
    })
    planets.set(homePlanet.id, makePlanetState(homePlanet, aiId))

    aiRegistry.register(
      new AIControllerCtor({
        civId: aiId,
        empire,
        theme: aiTheme,
        playstyleArchetype: playstyle,
        difficulty,
        decisionOffsetTicks: i * 2,
        rngSeed: (config.seed ^ 0x1337) + i * 7919,
      }),
    )
  }

  for (const civState of civs.values()) {
    const polish = getThemePolish(civState.themeId)
    const home = planets.get(civState.homePlanetId)
    if (!home) continue
    const indig = spawnIndigenousCiv({
      hostHumanCivId: civState.civId,
      homePlanet: home.planet,
      hostility: polish.homeIndigenousHostility,
      themeName: civState.theme.name,
      rng,
    })
    if (indig) {
      indigenousCivs.set(indig.civId, indig)
      home.indigenousCivId = indig.civId
    }
  }

  const state: MatchState = {
    matchId: `match-${config.seed}-${Date.now()}`,
    seed: config.seed,
    galaxy,
    civs,
    planets,
    flights: new Map(),
    humanCivId,
    objectives: config.objectives,
    tickCap: config.tickCapOverride,
    aiRegistry,
    indigenousCivs,
    lootDrops: new Map(),
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
  spawnInitialMiningShips(state)
  return state
}

function makePlanetState(planet: Planet, ownerId: CivId): MatchPlanetState {
  const inv = newPlanetInventory(planet.id)
  inv.stocks.set(RESOURCE_FOOD, STARTING_FOOD)
  inv.stocks.set(RESOURCE_WOOD, STARTING_WOOD)
  inv.stocks.set(RESOURCE_STONE, STARTING_STONE)
  inv.stocks.set(RESOURCE_PLANKS, STARTING_PLANKS)
  inv.stocks.set(RESOURCE_BRICKS, STARTING_BRICKS)
  inv.stocks.set(RESOURCE_METALS, STARTING_METALS)
  inv.stocks.set(RESOURCE_INGOTS, STARTING_INGOTS)
  inv.stocks.set(RESOURCE_COMPONENTS, STARTING_COMPONENTS)
  inv.stocks.set(RESOURCE_ELECTRONICS, STARTING_ELECTRONICS)
  inv.stocks.set(RESOURCE_PROPAGANDA_MATERIALS, STARTING_PROPAGANDA)
  inv.stocks.set(RESOURCE_FUEL, STARTING_FUEL)
  inv.stocks.set(RESOURCE_AMMUNITION, STARTING_AMMO)
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
    miningShips: new Map(),
    shipBeacons: newPlanetShipBeaconBuffer(planet.id),
    activeCampaigns: [],
    indigenousCivId: null,
  }
}

// Spawn 2 mining ships per civ at match start on their home planet (UMS-style auto-shuttle
// fleet). Each ship cycles DOCKED → OUTBOUND → DRILLING → INBOUND → OFFLOADING against the
// planet's ResourceNode deposits. Per `feedback_resource_miners_need_deposits.md`.
const STARTING_MINING_SHIPS_PER_CIV = 2

function spawnInitialMiningShips(state: MatchState): void {
  for (const civState of state.civs.values()) {
    const home = state.planets.get(civState.homePlanetId)
    if (!home) continue
    const dockPos = defaultHomeDockPosition(home.planet.position, home.planet.surfaceRadius)
    for (let i = 0; i < STARTING_MINING_SHIPS_PER_CIV; i++) {
      const shipId = `${civState.civId}-miner-${i + 1}`
      const shipName = `${civState.theme.emoji} Drone ${String.fromCharCode(65 + i)}`
      const ship = newMiningShip(shipId, shipName, civState.civId, home.planet.id, dockPos)
      home.miningShips.set(shipId, ship)
    }
  }
}

export function tickMatch(state: MatchState): void {
  if (state.phase !== 'IN_PROGRESS') return
  state.currentTick += 1

  for (const planet of state.planets.values()) {
    if (!isCivAlive(state, planet.civId)) continue
    tickPlanet(state, planet)
  }

  tickIndigenous(state)

  for (const civState of state.civs.values()) {
    if (!civState.alive) continue
    tickCivResearch(state, civState)
  }

  tickAIDecisionsViaRegistry(state)

  for (const civState of state.civs.values()) {
    if (!civState.alive) continue
    if (civState.isHuman) continue
    tickAIPadAutomation(state, civState)
  }

  for (const civState of state.civs.values()) {
    if (!civState.alive) continue
    tickLastHopeForCiv(state, civState)
  }

  for (const flight of [...state.flights.values()]) {
    tickFlight(flight)
    if (
      flight.phase === 'DETONATE' ||
      flight.phase === 'INTERCEPTED' ||
      flight.phase === 'ABORTED' ||
      flight.phase === 'CRASH_LANDED'
    ) {
      handleFlightOutcome(state, flight)
    }
  }

  pruneExpiredLoot(state)

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

  // Mining ship auto-shuttle tick — each ship picks the closest non-depleted ResourceNode,
  // travels to it, drills, returns, offloads into PlanetInventory.stocks. Beacons broadcast
  // every 2 ticks (UMS MINER_BEACON cadence) so MiningFleetPanel + telemetry rack stay live.
  for (const ship of planetState.miningShips.values()) {
    const result = tickMiningShip({
      ship,
      planet: planetState.planet,
      inventory: planetState.inventory,
      currentTick: state.currentTick,
    })
    if (result.beacon) {
      recordShipBeacon(planetState.shipBeacons, result.beacon)
    }
  }
}

function tickIndigenous(state: MatchState): void {
  for (const indig of state.indigenousCivs.values()) {
    if (!indig.alive) continue
    const hostPlanet = state.planets.get(indig.homePlanetId)
    if (!hostPlanet) continue
    const result = tickIndigenousAttacks({
      indig,
      hostPlanetTiles: hostPlanet.planet.tiles,
      hostHumanCivId: indig.hostHumanCivId,
      currentTick: state.currentTick,
      rng: state.rng,
    })
    if (result.tileLostByHost) {
      pushEvent(state, {
        atTick: state.currentTick,
        civId: indig.hostHumanCivId,
        kind: 'indigenous',
        message: `${indig.emoji} ${indig.displayName} captured a tile on ${String(hostPlanet.planet.id)}.`,
      })
    }
    if (state.currentTick % INDIGENOUS_PARLEY_INTERVAL === 0) {
      const propagandaPower = aggregateActiveCampaignBonus(
        hostPlanet.activeCampaigns,
      ).propagandaPower
      const parley = attemptIndigenousParley({
        indig,
        currentTick: state.currentTick,
        propagandaPower,
      })
      if (parley.accepted && parley.defectingTiles.length > 0) {
        for (const tid of parley.defectingTiles) {
          const tile = hostPlanet.planet.tiles.find((t) => t.id === tid)
          if (tile) tile.ownerCivId = indig.hostHumanCivId
        }
        if (!indig.alive) {
          const loot = indigenousLootOnDefeat(indig)
          const cur = stockOf(hostPlanet.inventory, RESOURCE_INGOTS)
          hostPlanet.inventory.stocks.set(RESOURCE_INGOTS, cur + loot.resourceBonus)
          pushEvent(state, {
            atTick: state.currentTick,
            civId: indig.hostHumanCivId,
            kind: 'indigenous',
            message: `${indig.emoji} ${indig.displayName} fully assimilated. +${loot.resourceBonus} ingots looted.`,
          })
        } else {
          pushEvent(state, {
            atTick: state.currentTick,
            civId: indig.hostHumanCivId,
            kind: 'indigenous',
            message: `${indig.emoji} ${indig.displayName} accepted parley. ${parley.defectingTiles.length} tile(s) returned.`,
          })
        }
      }
    }
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

function buildAIObservables(state: MatchState, controller: AIController): AITickObservables {
  const civState = state.civs.get(controller.civId)
  if (!civState) {
    return {
      buildingCtx: null,
      unlockedBuildings: null,
      shipCtx: null,
      observedEnemies: [],
      campaignCtx: null,
      resourceSurplusRatio: 0,
    }
  }
  const homePlanet = state.planets.get(civState.homePlanetId)
  if (!homePlanet) {
    return {
      buildingCtx: null,
      unlockedBuildings: null,
      shipCtx: null,
      observedEnemies: [],
      campaignCtx: null,
      resourceSurplusRatio: 0,
    }
  }
  const techEffects = aggregateEffects(civState.empire.researchedTechs)

  const occupiedTiles = homePlanet.planet.tiles.filter(
    (t) => t.ownerCivId === civState.civId && t.occupancy === 'building',
  ).length
  const ownedTiles = homePlanet.planet.tiles.filter((t) => t.ownerCivId === civState.civId).length
  const availableTiles = Math.max(0, ownedTiles - occupiedTiles)
  const totalPop = totalPopulation(homePlanet.population)
  const populationPressure =
    homePlanet.population.housingCap === 0 ? 1 : totalPop / homePlanet.population.housingCap

  const buildingCtx: PlanetBuildingContext = {
    planetId: homePlanet.planet.id,
    currentBuildingCounts: homePlanet.buildingsByDef as ReadonlyMap<string, number>,
    availableTiles,
    populationPressure,
  }

  const unlockedBuildings = new Set<string>()
  unlockedBuildings.add('Farm')
  unlockedBuildings.add(BLDG_FARM as unknown as string)
  unlockedBuildings.add('Aqueduct')
  unlockedBuildings.add('aqueduct')
  unlockedBuildings.add('Home')
  unlockedBuildings.add('home')
  unlockedBuildings.add('Solar Array')
  unlockedBuildings.add('solarArray')
  unlockedBuildings.add('School')
  unlockedBuildings.add('school')
  unlockedBuildings.add('Mine Field')
  unlockedBuildings.add('mineField')
  unlockedBuildings.add('Quarry')
  unlockedBuildings.add('quarry')
  for (const id of techEffects.unlockedBuildings) {
    unlockedBuildings.add(id as unknown as string)
    const def = getBuildingDef(id)
    unlockedBuildings.add(def.name)
  }

  const elite =
    (homePlanet.population.tierCounts[4] ?? 0) + (homePlanet.population.tierCounts[5] ?? 0)
  const shipCtx: ShipLoadoutContext = {
    maxPayloadTier: (techEffects.maxPayloadTier > 0 ? techEffects.maxPayloadTier : 1) as
      | 1
      | 2
      | 3
      | 4,
    availableCitizensTier4Plus: elite,
    intentCategory: null,
  }

  const observedEnemies: ObservedEnemyPlanet[] = []
  for (const enemyPlanet of state.planets.values()) {
    if (enemyPlanet.civId === civState.civId) continue
    if (!isCivAlive(state, enemyPlanet.civId)) continue
    const dx = enemyPlanet.planet.position.x - homePlanet.planet.position.x
    const dy = enemyPlanet.planet.position.y - homePlanet.planet.position.y
    const dz = enemyPlanet.planet.position.z - homePlanet.planet.position.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const defenseStrength =
      enemyPlanet.buildingsByDef.size * 50 + totalPopulation(enemyPlanet.population) * 0.05
    const resourceValue = Array.from(enemyPlanet.inventory.stocks.values()).reduce(
      (s, v) => s + v,
      0,
    )
    observedEnemies.push({
      planetId: enemyPlanet.planet.id,
      ownerCivId: enemyPlanet.civId,
      distance,
      estimatedDefenseStrength: defenseStrength,
      estimatedResourceValue: resourceValue,
      observerCanSee: distance < 2000,
    })
  }

  const campaignCtx: CampaignContext = {
    availablePropagandaMaterials: stockOf(homePlanet.inventory, RESOURCE_PROPAGANDA_MATERIALS),
    currentDissidentRatio: dissidentRatio(homePlanet.faction),
    underAttack: hasIncomingHostileFlights(state, civState.civId),
  }

  const food = stockOf(homePlanet.inventory, RESOURCE_FOOD)
  const ingots = stockOf(homePlanet.inventory, RESOURCE_INGOTS)
  const fuel = stockOf(homePlanet.inventory, RESOURCE_FUEL)
  const surplusRatio = (food + ingots * 2 + fuel) / Math.max(1, totalPop * 10)

  return {
    buildingCtx,
    unlockedBuildings,
    shipCtx,
    observedEnemies,
    campaignCtx,
    resourceSurplusRatio: surplusRatio,
  }
}

function hasIncomingHostileFlights(state: MatchState, defenderCivId: CivId): boolean {
  for (const flight of state.flights.values()) {
    if (flight.launchingCivId === defenderCivId) continue
    const targetPlanet = state.planets.get(flight.targetPlanetId)
    if (targetPlanet?.civId === defenderCivId) return true
  }
  return false
}

function tickAIDecisionsViaRegistry(state: MatchState): void {
  state.aiRegistry.tickAll(
    state.currentTick,
    (controller) => buildAIObservables(state, controller),
    (sourceCivId, targetCivId) => sourceCivId !== targetCivId,
  )
  for (const controller of state.aiRegistry.all()) {
    const snapshot = controller.lastSnapshot
    if (!snapshot) continue
    if (snapshot.tick !== state.currentTick) continue
    applyAISideEffects(state, controller, snapshot)
  }
}

function applyAISideEffects(
  state: MatchState,
  controller: AIController,
  snapshot: NonNullable<AIController['lastSnapshot']>,
): void {
  const civState = state.civs.get(controller.civId)
  if (!civState || !civState.alive) return
  const planet = state.planets.get(civState.homePlanetId)
  if (!planet) return

  if (snapshot.chosenBuilding) {
    const def = snapshot.chosenBuilding
    const defId = def.id
    const currentCount = planet.buildingsByDef.get(defId) ?? 0
    if (currentCount < 6) {
      placeBuildingInternal(state, planet, defId)
    }
  }

  if (snapshot.chosenShipVariant) {
    const shipDef: ColonyShipDef = snapshot.chosenShipVariant
    const idlePad = findIdlePadForCiv(state, civState.civId)
    if (idlePad) {
      const ownerPlanet = findPlanetForPad(state, idlePad)
      if (ownerPlanet) {
        const ok = startPrint(idlePad, shipDef.id, ownerPlanet.inventory)
        if (ok) {
          pushEvent(state, {
            atTick: state.currentTick,
            civId: civState.civId,
            kind: 'build',
            message: `${civState.theme.emoji} ${civState.displayName} began printing ${shipDef.name}.`,
          })
        }
      }
    } else {
      const padDef = getBuildingDef(BLDG_LAUNCH_PAD)
      const haveResources = padDef.buildCost.every(
        (c) => stockOf(planet.inventory, c.resource) >= c.amount,
      )
      if (haveResources) {
        placeBuildingInternal(state, planet, BLDG_LAUNCH_PAD)
      }
    }
  }

  if (snapshot.attackingThisTick && snapshot.chosenAttackTarget && snapshot.chosenShipVariant) {
    const readyPad = findReadyPadForCiv(state, civState.civId, snapshot.chosenShipVariant.id)
    if (readyPad) {
      const ownerPlanet = findPlanetForPad(state, readyPad)
      const targetPlanet = state.planets.get(snapshot.chosenAttackTarget.planetId)
      if (ownerPlanet && targetPlanet) {
        launchAIShipFromPad(state, civState, ownerPlanet, readyPad, targetPlanet)
      }
    }
  }

  if (snapshot.chosenCampaign) {
    const propagandaCost = snapshot.chosenCampaign.costs.reduce((s, c) => s + c.amount, 0)
    if (stockOf(planet.inventory, RESOURCE_PROPAGANDA_MATERIALS) >= propagandaCost) {
      const cur = stockOf(planet.inventory, RESOURCE_PROPAGANDA_MATERIALS)
      planet.inventory.stocks.set(RESOURCE_PROPAGANDA_MATERIALS, cur - propagandaCost)
      planet.activeCampaigns.push(
        newActiveCampaign(snapshot.chosenCampaign.archetype, state.currentTick),
      )
      pushEvent(state, {
        atTick: state.currentTick,
        civId: civState.civId,
        kind: 'campaign',
        message: `${civState.theme.emoji} ${civState.displayName} launched ${snapshot.chosenCampaign.name}.`,
      })
    }
  }
}

function findIdlePadForCiv(state: MatchState, civId: CivId): LaunchPad | null {
  for (const planet of state.planets.values()) {
    if (planet.civId !== civId) continue
    for (const pad of planet.launchPads.values()) {
      if (pad.state === 'IDLE') return pad
    }
  }
  return null
}

function findReadyPadForCiv(
  state: MatchState,
  civId: CivId,
  variantId: ColonyShipVariantId,
): LaunchPad | null {
  for (const planet of state.planets.values()) {
    if (planet.civId !== civId) continue
    for (const pad of planet.launchPads.values()) {
      if (pad.state === 'READY' && pad.loadedShipVariantId === variantId) return pad
      if (pad.state === 'ARM' && pad.loadedShipVariantId === variantId) return pad
    }
  }
  return null
}

function findPlanetForPad(state: MatchState, pad: LaunchPad): MatchPlanetState | null {
  for (const planet of state.planets.values()) {
    if (planet.launchPads.has(pad.id)) return planet
  }
  return null
}

function tickAIPadAutomation(state: MatchState, civState: MatchCivState): void {
  for (const planet of state.planets.values()) {
    if (planet.civId !== civState.civId) continue
    for (const pad of planet.launchPads.values()) {
      if (!pad.loadedShipVariantId) continue
      if (pad.state === 'FUEL') {
        const fuelStock = stockOf(planet.inventory, RESOURCE_FUEL)
        const taken = loadFuel(pad, Math.min(20, fuelStock))
        if (taken > 0) planet.inventory.stocks.set(RESOURCE_FUEL, fuelStock - taken)
      } else if (pad.state === 'AMMO') {
        const ammoStock = stockOf(planet.inventory, RESOURCE_AMMUNITION)
        const def = getColonyShipDef(pad.loadedShipVariantId)
        const need = Math.max(0, def.ammoRequirement - pad.ammoLoaded)
        const taken = Math.min(need, ammoStock, 30)
        if (taken > 0) {
          pad.ammoLoaded += taken
          planet.inventory.stocks.set(RESOURCE_AMMUNITION, ammoStock - taken)
        }
      } else if (pad.state === 'READY' && pad.loadedShipVariantId) {
        const def = getColonyShipDef(pad.loadedShipVariantId)
        if (def.payload.citizenCapacity > 0 && pad.citizensLoaded < def.payload.citizenCapacity) {
          const eliteAvail =
            (planet.population.tierCounts[4] ?? 0) + (planet.population.tierCounts[5] ?? 0)
          const want = Math.min(def.payload.citizenCapacity - pad.citizensLoaded, eliteAvail)
          if (want > 0) {
            const drawn = loadCitizens(pad, want)
            const fromTier5 = Math.min(planet.population.tierCounts[5] ?? 0, drawn)
            planet.population.tierCounts[5] = (planet.population.tierCounts[5] ?? 0) - fromTier5
            const remaining = drawn - fromTier5
            planet.population.tierCounts[4] = Math.max(
              0,
              (planet.population.tierCounts[4] ?? 0) - remaining,
            )
          }
        }
      }
    }
  }
}

function launchAIShipFromPad(
  state: MatchState,
  civState: MatchCivState,
  fromPlanet: MatchPlanetState,
  pad: LaunchPad,
  targetPlanet: MatchPlanetState,
): void {
  if (!pad.loadedShipVariantId) return
  const def = getColonyShipDef(pad.loadedShipVariantId)
  const flightIdStr = `flight-${state.currentTick}-${civState.civId}-${pad.id}`
  const flight = newColonyShipFlight({
    id: colonyShipFlightId(flightIdStr),
    variantId: pad.loadedShipVariantId,
    launchingCivId: civState.civId,
    fromPlanetId: fromPlanet.planet.id,
    targetPlanetId: targetPlanet.planet.id,
    fromPosition: fromPlanet.planet.position,
    targetPosition: targetPlanet.planet.position,
    travelRadius: 1000,
    citizensAboard: pad.citizensLoaded,
    signalLossSeed: Math.floor(state.rng() * 0xffffff),
  })
  state.flights.set(flightIdStr, flight)
  pad.state = 'GONE'
  recordColonyShipLaunch(civState.deceptionLedger, pad.citizensLoaded)
  pushBeaconAlert(targetPlanet.beacon, {
    id: `alert-${flightIdStr}`,
    planetId: targetPlanet.planet.id,
    observerCivId: targetPlanet.civId,
    kind: 'INCOMING_HOSTILE',
    atTick: state.currentTick,
    summary: `Inbound from ${civState.theme.emoji} ${civState.theme.name}`,
    relatedFlightId: flightIdStr,
  })
  pushEvent(state, {
    atTick: state.currentTick,
    civId: civState.civId,
    kind: 'launch',
    message: `${civState.theme.emoji} ${civState.displayName} launched ${def.name} → ${String(targetPlanet.planet.id)}.`,
  })
}

function tickLastHopeForCiv(state: MatchState, civState: MatchCivState): void {
  if (civState.lastHopeEvac) {
    const unexplored: PlanetId[] = []
    for (const p of state.planets.values()) {
      if (p.civId !== civState.civId) unexplored.push(p.planet.id)
    }
    const result = tickLastHopeEvac({
      state: civState.lastHopeEvac,
      currentTick: state.currentTick,
      unexploredPlanetIds: unexplored,
    })
    if (result.phaseChanged) {
      pushEvent(state, {
        atTick: state.currentTick,
        civId: civState.civId,
        kind: 'last_hope',
        message: `${civState.theme.emoji} LAST HOPE phase: ${civState.lastHopeEvac.phase}`,
      })
    }
    if (result.readyToLaunch && result.chosenTargetPlanetId) {
      spawnLastHopeFlight(state, civState, result.chosenTargetPlanetId)
      civState.lastHopeEvac.phase = 'COMPLETE'
    }
    return
  }

  if (state.currentTick % LAST_HOPE_AUTO_CHECK_INTERVAL !== 0) return
  if (civState.lastHopeTriggered) return
  if (state.currentTick < LAST_HOPE_GRACE_PERIOD_TICKS) return

  const incomingHostile = countIncomingHostileFor(state, civState.civId)
  let totalCitizens = 0
  for (const planetId of civState.empire.controlledPlanetIds) {
    const ps = state.planets.get(planetId)
    if (ps) totalCitizens += totalPopulation(ps.population)
  }
  const windowStart = Math.max(0, state.currentTick - LAST_HOPE_DEATH_WINDOW_TICKS)
  const recentEvents = deathsInWindow(civState.deathLedger, windowStart, state.currentTick)
  const recentDeaths = recentEvents.reduce((sum, e) => sum + e.count, 0)
  const check = shouldAutoTriggerLastHope({
    controlledPlanetCount: civState.empire.controlledPlanetIds.size,
    totalCitizens,
    recentDeathsLastHundredTicks: recentDeaths,
    incomingHostileFlights: incomingHostile,
    hasAlreadyTriggered: civState.lastHopeTriggered,
  })
  if (check.shouldTrigger) {
    triggerLastHopeManually(state, civState.civId)
  }
}

function countIncomingHostileFor(state: MatchState, defenderCivId: CivId): number {
  let count = 0
  for (const flight of state.flights.values()) {
    if (flight.launchingCivId === defenderCivId) continue
    const targetPlanet = state.planets.get(flight.targetPlanetId)
    if (targetPlanet?.civId === defenderCivId) count += 1
  }
  return count
}

export function triggerLastHopeManually(state: MatchState, civIdParam: CivId): boolean {
  const civState = state.civs.get(civIdParam)
  if (!civState || !civState.alive || civState.lastHopeTriggered) return false
  const homePlanet = state.planets.get(civState.homePlanetId)
  if (!homePlanet) return false
  const totalPop = totalPopulation(homePlanet.population)
  const citizensToPack = Math.min(500, Math.floor(totalPop * 0.4))
  civState.lastHopeEvac = initiateLastHopeEvac({
    civId: civState.civId,
    fromPlanetId: homePlanet.planet.id,
    currentTick: state.currentTick,
    citizenCountToPack: citizensToPack,
  })
  civState.lastHopeTriggered = true
  pushEvent(state, {
    atTick: state.currentTick,
    civId: civState.civId,
    kind: 'last_hope',
    message: `🚨 ${civState.theme.emoji} ${civState.displayName} initiated LAST HOPE evacuation.`,
  })
  return true
}

function spawnLastHopeFlight(
  state: MatchState,
  civState: MatchCivState,
  targetPlanetId: PlanetId,
): void {
  const fromPlanet = state.planets.get(civState.homePlanetId)
  const targetPlanet = state.planets.get(targetPlanetId)
  if (!fromPlanet || !targetPlanet || !civState.lastHopeEvac) return
  const flightIdStr = `lasthope-${state.currentTick}-${civState.civId}`
  const flight = newColonyShipFlight({
    id: colonyShipFlightId(flightIdStr),
    variantId: SHIP_STANDARD,
    launchingCivId: civState.civId,
    fromPlanetId: fromPlanet.planet.id,
    targetPlanetId: targetPlanet.planet.id,
    fromPosition: fromPlanet.planet.position,
    targetPosition: targetPlanet.planet.position,
    travelRadius: 1000,
    citizensAboard: civState.lastHopeEvac.citizensAboard,
    signalLossSeed: Math.floor(state.rng() * 0xffffff),
  })
  state.flights.set(flightIdStr, flight)
  recordColonyShipLaunch(civState.deceptionLedger, civState.lastHopeEvac.citizensAboard)
  pushEvent(state, {
    atTick: state.currentTick,
    civId: civState.civId,
    kind: 'last_hope',
    message: `🚀 LAST HOPE evac launched → ${String(targetPlanet.planet.id)} (${civState.lastHopeEvac.citizensAboard} citizens aboard).`,
  })
}

function handleFlightOutcome(state: MatchState, flight: ColonyShipFlight): void {
  if (!state.flights.has(String(flight.id))) return
  const launchingCiv = state.civs.get(flight.launchingCivId)
  const targetPlanet = state.planets.get(flight.targetPlanetId)

  if (flight.phase === 'DETONATE' && launchingCiv && targetPlanet) {
    const def = getColonyShipDef(flight.variantId)
    const build = defaultBuildFromShipDef(def)
    const lastPiece = build.pieces.find((p) => p.startsWith('gear-')) ?? 'gear-none'
    const gearTier =
      lastPiece === 'gear-none'
        ? 0
        : lastPiece === 'gear-basic'
          ? 1
          : lastPiece === 'gear-advanced'
            ? 2
            : 3
    const crash = computeCrashOutcome(gearTier as 0 | 1 | 2 | 3)

    if (crash.crashed) {
      handleCrashLanding(state, flight, def, launchingCiv, targetPlanet, crash.cargoLootRate)
    } else {
      handleSafeLanding(state, flight, def, launchingCiv, targetPlanet, crash.survivalRate)
    }
  }
  if (flight.phase === 'INTERCEPTED') {
    pushEvent(state, {
      atTick: state.currentTick,
      civId: flight.launchingCivId,
      kind: 'intercept',
      message: `Flight ${String(flight.id)} INTERCEPTED.`,
    })
  }
  state.flights.delete(String(flight.id))
}

function handleCrashLanding(
  state: MatchState,
  flight: ColonyShipFlight,
  def: ColonyShipDef,
  launchingCiv: MatchCivState,
  targetPlanet: MatchPlanetState,
  cargoLootRate: number,
): void {
  const crashedDeaths = Math.floor(flight.citizensAboard * 0.85)
  if (crashedDeaths > 0) {
    recordDeath(launchingCiv.deathLedger, {
      tick: state.currentTick,
      planetId: targetPlanet.planet.id,
      cause: 'crash_landing',
      count: crashedDeaths,
      tier: null,
      note: `Crashed ${def.name}`,
    })
  }
  const lootResources = deriveCrashLootFromShipPayload(
    def.payload.cargoCapacity,
    def.payload.explosiveYield,
    cargoLootRate,
  )
  if (lootResources.length > 0) {
    const targetTile = pickRandomTileOnPlanet(targetPlanet, state.rng)
    if (targetTile) {
      const dropIdStr = `loot-${state.currentTick}-${String(flight.id)}`
      const drop = createLootDrop({
        id: lootDropId(dropIdStr),
        tileId: targetTile.id,
        planetId: targetPlanet.planet.id,
        originCivId: launchingCiv.civId,
        resources: lootResources,
        debrisKind: 'colony_ship_crash',
        droppedAtTick: state.currentTick,
        lifetimeTicks: LOOT_LIFETIME_TICKS_LOCAL,
      })
      state.lootDrops.set(String(drop.id), drop)
      pushEvent(state, {
        atTick: state.currentTick,
        civId: targetPlanet.civId,
        kind: 'crash',
        message: `💥 ${launchingCiv.theme.emoji} ${def.name} crashed on ${String(targetPlanet.planet.id)}. ${crashedDeaths} dead. Salvage available.`,
      })
    }
  }
}

function handleSafeLanding(
  state: MatchState,
  flight: ColonyShipFlight,
  def: ColonyShipDef,
  launchingCiv: MatchCivState,
  targetPlanet: MatchPlanetState,
  survivalRate: number,
): void {
  const arrivedCitizens = Math.floor(flight.citizensAboard * survivalRate)
  if (def.payload.explosiveYield > 0) {
    const dmg = Math.min(targetPlanet.buildingsByDef.size, 2)
    if (dmg > 0) {
      let removed = 0
      for (const [defId, count] of targetPlanet.buildingsByDef) {
        if (removed >= dmg) break
        const newCount = Math.max(0, count - 1)
        if (newCount === 0) targetPlanet.buildingsByDef.delete(defId)
        else targetPlanet.buildingsByDef.set(defId, newCount)
        removed += 1
      }
      pushEvent(state, {
        atTick: state.currentTick,
        civId: targetPlanet.civId,
        kind: 'launch',
        message: `💥 ${launchingCiv.theme.emoji} ${def.name} detonated on ${String(targetPlanet.planet.id)}. ${dmg} buildings destroyed.`,
      })
    }
  } else if (arrivedCitizens > 0 && targetPlanet.civId !== launchingCiv.civId) {
    claimPlanetForCiv(state, launchingCiv, targetPlanet, arrivedCitizens)
  } else {
    pushEvent(state, {
      atTick: state.currentTick,
      civId: launchingCiv.civId,
      kind: 'launch',
      message: `${launchingCiv.theme.emoji} ${launchingCiv.displayName} ${def.name} arrived at ${String(targetPlanet.planet.id)}.`,
    })
  }
}

function claimPlanetForCiv(
  state: MatchState,
  conqueringCiv: MatchCivState,
  targetPlanet: MatchPlanetState,
  arrivedCitizens: number,
): void {
  const previousOwner = state.civs.get(targetPlanet.civId)
  if (previousOwner && previousOwner.civId !== conqueringCiv.civId) {
    recordPlanetLoss(previousOwner.empire, targetPlanet.planet.id)
    if (previousOwner.empire.controlledPlanetIds.size === 0) {
      previousOwner.alive = false
      pushEvent(state, {
        atTick: state.currentTick,
        civId: previousOwner.civId,
        kind: 'civ_defeated',
        message: `☠️ ${previousOwner.theme.emoji} ${previousOwner.displayName} has been wiped out.`,
      })
    }
  }
  recordPlanetGain(conqueringCiv.empire, targetPlanet.planet.id)
  targetPlanet.civId = conqueringCiv.civId
  for (const tile of targetPlanet.planet.tiles) {
    if (tile.ownerCivId === previousOwner?.civId) tile.ownerCivId = conqueringCiv.civId
  }
  targetPlanet.population.tierCounts[1] =
    (targetPlanet.population.tierCounts[1] ?? 0) + arrivedCitizens
  pushEvent(state, {
    atTick: state.currentTick,
    civId: conqueringCiv.civId,
    kind: 'planet_claimed',
    message: `🏴 ${conqueringCiv.theme.emoji} ${conqueringCiv.displayName} claimed ${String(targetPlanet.planet.id)} (+${arrivedCitizens} citizens).`,
  })
}

function pickRandomTileOnPlanet(planet: MatchPlanetState, rng: () => number): Tile | null {
  if (planet.planet.tiles.length === 0) return null
  const idx = Math.floor(rng() * planet.planet.tiles.length)
  return planet.planet.tiles[idx] ?? null
}

function pruneExpiredLoot(state: MatchState): void {
  for (const [id, drop] of state.lootDrops) {
    if (isLootDropExpired(drop, state.currentTick)) {
      state.lootDrops.delete(id)
    }
  }
}

export interface ClaimLootInputs {
  readonly state: MatchState
  readonly dropId: LootDropId
}

export function claimLootDropAction(inputs: ClaimLootInputs): boolean {
  const drop = inputs.state.lootDrops.get(String(inputs.dropId))
  if (!drop) return false
  const targetPlanet = inputs.state.planets.get(drop.planetId)
  if (!targetPlanet) return false
  if (targetPlanet.civId !== inputs.state.humanCivId) return false
  const result = claimLootDrop(drop, inputs.state.humanCivId, inputs.state.currentTick)
  if (!result.success) return false
  for (const r of result.resources) {
    const cur = stockOf(targetPlanet.inventory, r.resource)
    targetPlanet.inventory.stocks.set(r.resource, cur + r.amount)
  }
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: inputs.state.humanCivId,
    kind: 'loot',
    message: `🎁 Looted crash debris (${result.resources.map((r) => `+${r.amount} ${String(r.resource)}`).join(', ')}).`,
  })
  inputs.state.lootDrops.delete(String(inputs.dropId))
  return true
}

function resolveMatch(state: MatchState): void {
  const aliveCivIds: CivId[] = []
  for (const civ of state.civs.values()) {
    if (civ.alive) aliveCivIds.push(civ.civId)
  }
  const resourceObjective = state.objectives.find((o) => o.id === 'resource_target')
  const targetResource = resourceObjective?.resource ?? null

  const civProgress = new Map<MissionObjectiveId, ReadonlyArray<{ civId: CivId; value: number }>>()
  const highscore: { civId: CivId; value: number }[] = []
  const resource: { civId: CivId; value: number }[] = []
  const apex: { civId: CivId; value: number }[] = []
  for (const id of aliveCivIds) {
    const civ = state.civs.get(id)
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
      if (targetResource) {
        civRes += stockOf(ps.inventory, targetResource)
      } else {
        for (const amount of ps.inventory.stocks.values()) civRes += amount
      }
    }
    highscore.push({ civId: id, value: civHigh })
    resource.push({ civId: id, value: civRes })
    apex.push({ civId: id, value: hasWonByTech(civ.empire) ? 1 : 0 })
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
  const def = getBuildingDef(defId)
  for (const cost of def.buildCost) {
    if (stockOf(planet.inventory, cost.resource) < cost.amount) return false
  }
  const empty = planet.planet.tiles.find(
    (t) => t.ownerCivId === planet.civId && t.occupancy === 'empty',
  )
  if (!empty) return false
  for (const cost of def.buildCost) {
    const cur = stockOf(planet.inventory, cost.resource)
    planet.inventory.stocks.set(cost.resource, cur - cost.amount)
  }
  empty.occupancy = 'building'
  planet.buildingsByDef.set(defId, (planet.buildingsByDef.get(defId) ?? 0) + 1)
  planet.buildingsByTile.set(empty.id, defId)
  if (defId === BLDG_LAUNCH_PAD) {
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
    const have = stockOf(planet.inventory, cost.resource)
    if (have < cost.amount) {
      pushEvent(inputs.state, {
        atTick: inputs.state.currentTick,
        civId: planet.civId,
        kind: 'system',
        message: `❌ Can't build ${def.emoji} ${def.name} — need ${cost.amount} ${String(cost.resource)} (have ${have})`,
      })
      return false
    }
  }
  let tile = inputs.tileId ? planet.planet.tiles.find((t) => t.id === inputs.tileId) : null
  if (!tile) {
    tile = planet.planet.tiles.find((t) => t.ownerCivId === planet.civId && t.occupancy === 'empty')
  }
  if (!tile || tile.occupancy !== 'empty') {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: planet.civId,
      kind: 'system',
      message: `❌ Can't build ${def.emoji} ${def.name} — no empty owned tile available`,
    })
    return false
  }
  for (const cost of def.buildCost) {
    const cur = stockOf(planet.inventory, cost.resource)
    planet.inventory.stocks.set(cost.resource, cur - cost.amount)
  }
  tile.occupancy = 'building'
  planet.buildingsByDef.set(inputs.defId, (planet.buildingsByDef.get(inputs.defId) ?? 0) + 1)
  planet.buildingsByTile.set(tile.id, inputs.defId)
  if (inputs.defId === BLDG_LAUNCH_PAD) {
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
  const campaign = CAMPAIGNS.find((c) => c.archetype === inputs.archetype)
  if (!campaign) return false
  const cost = campaign.costs.reduce((s, c) => s + c.amount, 0)
  if (stockOf(planet.inventory, RESOURCE_PROPAGANDA_MATERIALS) < cost) return false
  const cur = stockOf(planet.inventory, RESOURCE_PROPAGANDA_MATERIALS)
  planet.inventory.stocks.set(RESOURCE_PROPAGANDA_MATERIALS, cur - cost)
  planet.activeCampaigns.push(newActiveCampaign(inputs.archetype, inputs.state.currentTick))
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: planet.civId,
    kind: 'campaign',
    message: `Launched ${campaign.name} on ${String(planet.planet.id)}`,
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
void recordPlanetGain
void aggregateActiveCampaignBonus
void loadFuel
void loadCitizens
void BLDG_FACTORY
void BLDG_LAB
void BLDG_LUMBER_CAMP
void BLDG_MINE
void BLDG_TV_STATION
void SHIP_SCOUT
void COLONY_SHIPS
void LAST_HOPE_BUILD_TICKS
void LAST_HOPE_LAUNCH_TICKS
void LAST_HOPE_PACK_TICKS
