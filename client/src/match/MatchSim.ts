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
  type MineField,
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
  BLDG_MINE_FIELD,
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
  SHIP_COUNTER_COLONY,
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
  abortFlight,
  attemptCounterMissileLaunch,
  computeDetonationAoE,
  intercept,
  mineFieldCheckIntercept,
  newMineField,
  tickCounterFlight,
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
  // PHASE 16.22: server-authoritative mine fields per UMS spec. Player places BLDG_MINE_FIELD
  // tile → a MineField is created at the tile's world position. Per-tick intercept check
  // compares each in-flight ship arc position vs every mine field on the target planet.
  mineFields: MineField[]
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
  // PHASE 16.29: counter-colony-ship intercept tracking. counterFlightTargets maps each
  // active counter-flight id → the attacker flight id it is chasing. counterLaunchesByAttacker
  // tracks which defender civs have already launched a counter against each attacker (one
  // counter per defender per attacker — no spam).
  readonly counterFlightTargets: Map<string, string>
  readonly counterLaunchesByAttacker: Map<string, Set<CivId>>
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
// PHASE 16.29: counter-colony-ship tunables. Resource cost mirrors SHIP_COUNTER_COLONY def
// (fuel=50, ammo=100) — defender consumes these instantly per counter-launch, NO pad build
// cycle (UMS-faithful counter-missile silo semantics). Travel radius tighter than attacker
// (800 vs 1000) because counters intercept mid-arc, not cross interplanetary.
const COUNTER_FUEL_COST = 50
const COUNTER_AMMO_COST = 100
const COUNTER_PAYLOAD_TIER_REQUIRED = 3
const COUNTER_TRAVEL_RADIUS = 800

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
    counterFlightTargets: new Map(),
    counterLaunchesByAttacker: new Map(),
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
    mineFields: [],
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
    const flightDef = getColonyShipDef(flight.variantId)
    const flightIdStr = String(flight.id)
    // PHASE 16.29: counter-colony-ship intercept tick. If this flight is a counter chasing
    // a registered attacker, run tickCounterFlight proximity check. On intercept both ships
    // die (attacker via intercept() inside tickCounterFlight; counter via intercept() here).
    // If the attacker is gone or already terminal, the counter self-destructs in space —
    // no AoE on the defender's own planet.
    if (flightDef.canIntercept && state.counterFlightTargets.has(flightIdStr)) {
      const attackerId = state.counterFlightTargets.get(flightIdStr)!
      const attackerFlight = state.flights.get(attackerId)
      const attackerStillAlive =
        attackerFlight !== undefined &&
        attackerFlight.phase !== 'DETONATE' &&
        attackerFlight.phase !== 'INTERCEPTED' &&
        attackerFlight.phase !== 'ABORTED' &&
        attackerFlight.phase !== 'CRASH_LANDED'
      if (!attackerStillAlive) {
        abortFlight(flight)
      } else {
        const result = tickCounterFlight(flight, attackerFlight!)
        if (result.intercepted) {
          pushEvent(state, {
            atTick: state.currentTick,
            civId: flight.launchingCivId,
            kind: 'intercept',
            message: `🛡️ Counter-ship intercepted ${String(attackerFlight!.id)} mid-flight.`,
          })
          intercept(flight, flight.launchingCivId, 'counter-ship')
        }
      }
    }
    // PHASE 16.29: defender counter-launch evaluation for incoming attackers. Each defender
    // owning the attacker's target planet gets one counter-launch attempt per attacker, gated
    // on tier-3+ ship tech + sufficient fuel/ammo. Mirrors UMS counter-missile silo behavior
    // (instant fire-from-pad). See SMOL_REFERENCE_TRAJECTORY §18 for the intercept geometry.
    if (!flightDef.canIntercept) {
      const isInTerminalPhase =
        flight.phase === 'DETONATE' ||
        flight.phase === 'INTERCEPTED' ||
        flight.phase === 'ABORTED' ||
        flight.phase === 'CRASH_LANDED'
      if (!isInTerminalPhase) {
        attemptDefenderCounterLaunch(state, flight, flightIdStr)
      }
    }
    // PHASE 16.22: per-tick mine-field intercept check per UMS UnityPad.cs mine logic +
    // SMOL_REFERENCE_TRAJECTORY §17. For each in-flight ship, walk the target planet's
    // mineFields[] and call mineFieldCheckIntercept — flips flight.phase to INTERCEPTED
    // when current arc position falls within field.detonationRadius. The check itself
    // gates on phase=REENTRY|TARGET so cruise-phase ships pass safely overhead.
    if (flight.phase === 'REENTRY' || flight.phase === 'TARGET') {
      const targetPlanet = state.planets.get(flight.targetPlanetId)
      if (targetPlanet) {
        for (const field of targetPlanet.mineFields) {
          const hit = mineFieldCheckIntercept(field, flight)
          if (hit) {
            pushEvent(state, {
              atTick: state.currentTick,
              civId: field.civId,
              kind: 'intercept',
              message: `💥 Mine intercept — ${String(flight.id)} downed over ${String(targetPlanet.planet.id)}`,
            })
            break
          }
        }
      }
    }
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

// PHASE 16.29 — defender counter-launch evaluation. Called per-tick for every in-flight
// attacker (non-counter, non-terminal). The civ that owns the attacker's target planet gets
// ONE counter-launch attempt per attacker, gated on tier-3+ ship tech + fuel/ammo. Once
// `solveIntercept` confirms a viable intercept, the counter-flight is spawned with the
// computed intercept point as its arc endpoint and registered in counterFlightTargets so
// the flight loop's counter-tick block runs proximity checks every tick.
function attemptDefenderCounterLaunch(
  state: MatchState,
  attacker: ColonyShipFlight,
  attackerIdStr: string,
): void {
  const targetPlanet = state.planets.get(attacker.targetPlanetId)
  if (!targetPlanet) return
  const defenderCiv = state.civs.get(targetPlanet.civId)
  if (!defenderCiv || !defenderCiv.alive) return
  if (defenderCiv.civId === attacker.launchingCivId) return

  let launched = state.counterLaunchesByAttacker.get(attackerIdStr)
  if (!launched) {
    launched = new Set<CivId>()
    state.counterLaunchesByAttacker.set(attackerIdStr, launched)
  }
  if (launched.has(defenderCiv.civId)) return

  const techEffects = aggregateEffects(defenderCiv.empire.researchedTechs)
  if (techEffects.maxPayloadTier < COUNTER_PAYLOAD_TIER_REQUIRED) return

  const fuel = stockOf(targetPlanet.inventory, RESOURCE_FUEL)
  const ammo = stockOf(targetPlanet.inventory, RESOURCE_AMMUNITION)
  if (fuel < COUNTER_FUEL_COST || ammo < COUNTER_AMMO_COST) return

  const counterFlightIdStr = `counter-${state.currentTick}-${defenderCiv.civId}-${attackerIdStr}`
  const result = attemptCounterMissileLaunch(attacker, {
    defenderCivId: defenderCiv.civId,
    defenderPlanetId: targetPlanet.planet.id,
    launchPosition: targetPlanet.planet.position,
    travelRadius: COUNTER_TRAVEL_RADIUS,
    counterShipVariantId: SHIP_COUNTER_COLONY,
    nextFlightId: () => colonyShipFlightId(counterFlightIdStr),
  })
  if (!result.canIntercept || !result.counterFlight) return

  targetPlanet.inventory.stocks.set(RESOURCE_FUEL, fuel - COUNTER_FUEL_COST)
  targetPlanet.inventory.stocks.set(RESOURCE_AMMUNITION, ammo - COUNTER_AMMO_COST)

  const counterIdStr = String(result.counterFlight.id)
  state.flights.set(counterIdStr, result.counterFlight)
  state.counterFlightTargets.set(counterIdStr, attackerIdStr)
  launched.add(defenderCiv.civId)

  const attackerCiv = state.civs.get(attacker.launchingCivId)
  const attackerThemeEmoji = attackerCiv?.theme.emoji ?? '🚀'
  pushEvent(state, {
    atTick: state.currentTick,
    civId: defenderCiv.civId,
    kind: 'launch',
    message: `🛡️ ${defenderCiv.theme.emoji} ${defenderCiv.displayName} counter-launched against incoming ${attackerThemeEmoji} (intercept ETA ~${result.defenderTicksToIntercept}t).`,
  })
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
    // PHASE 16.24: self-destruct AoE per the SMoL premise — every colony ship is also a
    // self-destruct weapon. AoE damage at detonation scales with fuelRemaining + payload
    // load-out + (suicide ship × citizens) per computeDetonationAoE. Balance target: 30-50
    // missiles to wipe a multi-planet civilization. When the ship is a suicide ship OR
    // carries explosive / weapon payload, the detonation is an offensive strike — apply AoE
    // damage to target population + infrastructure. Peaceful variants (Scout / Standard
    // colony / Pilgrim when not suicide) continue the colonization-or-crash path so
    // colonization still works. Full verbatim user directive lives in `.claude/TODO.md`
    // PHASE 16.24 entry per LAW #0.
    if (def.suicideShip || def.payload.explosiveYield > 0 || def.payload.weaponPayload > 0) {
      // PHASE 16.29: defensive counters launched FROM the defender's planet have that same
      // planet as their target (intercept happens mid-arc above defender territory). If a
      // counter reaches terminal phase without intercepting (its attacker was already gone),
      // skip friendly-fire AoE — the counter returns or burns up safely.
      if (targetPlanet.civId === launchingCiv.civId) {
        pushEvent(state, {
          atTick: state.currentTick,
          civId: launchingCiv.civId,
          kind: 'intercept',
          message: `🛡️ ${def.emoji} ${def.name} returned to ${String(targetPlanet.planet.id)} (no intercept target).`,
        })
      } else {
        applyDetonationAoE(state, flight, launchingCiv, targetPlanet)
      }
    } else {
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
  }
  if (flight.phase === 'ABORTED' && launchingCiv) {
    // PHASE 16.24: ABORTED = player hit the 💀 ABORT (self-destruct) button. UMS-faithful
    // self-destruct = warhead detonates where the ship currently is. If arc has progressed
    // far enough (≥ 0.3) AND target planet exists, apply AoE damage at the target (the
    // explosion was close enough to the target to matter). Otherwise the boom happens in
    // empty space — log event but no damage.
    const aborted = state.flights.get(String(flight.id))
    const progress = aborted ? aborted.ticksFlown / Math.max(1, aborted.totalTicks) : 0
    if (targetPlanet && progress >= 0.3 && targetPlanet.civId !== launchingCiv.civId) {
      applyDetonationAoE(state, flight, launchingCiv, targetPlanet)
    } else {
      pushEvent(state, {
        atTick: state.currentTick,
        civId: flight.launchingCivId,
        kind: 'intercept',
        message: `💀 Self-destruct in deep space — ${String(flight.id)} (no AoE)`,
      })
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
  const flightIdStr = String(flight.id)
  state.flights.delete(flightIdStr)
  // PHASE 16.29: clean up counter-flight tracking when a flight ends. If this was an
  // attacker, drop its counter-launches set; if it was a counter, drop its target mapping.
  state.counterFlightTargets.delete(flightIdStr)
  state.counterLaunchesByAttacker.delete(flightIdStr)
}

// PHASE 16.24 — apply AoE damage to target planet population per computeDetonationAoE
// magnitude. Damage prefers lower tiers first (workers die before pinnacle elites). Caps
// out at total planet population. Pushes an event log with the boom magnitude + kill count
// so the player sees the strike outcome. Per user balance target: 30-50 missiles to wipe a
// multi-planet civ.
function applyDetonationAoE(
  state: MatchState,
  flight: ColonyShipFlight,
  launchingCiv: MatchCivState,
  targetPlanet: MatchPlanetState,
): void {
  const def = getColonyShipDef(flight.variantId)
  const aoe = computeDetonationAoE(flight)
  // Magnitude → kill count: damage scalar 0.5 lands the Heavy variant (magnitude ~800) at
  // ~400 kills, and a Pilgrim Volunteer (magnitude ~1400 with suicide multiplier) at ~700.
  // Matches user's "30-50 missiles to wipe a multi-planet civ" balance target when planets
  // host ~8000 citizens each and a civ holds 4-6 planets.
  const rawKills = Math.floor(aoe.magnitude * 0.5)
  const totalPop = totalPopulation(targetPlanet.population)
  const kills = Math.min(rawKills, totalPop)
  if (kills > 0) {
    let remaining = kills
    // Damage from tier 1 (workers) upward — pinnacle elites are last to die.
    for (const tier of [1, 2, 3, 4, 5] as const) {
      if (remaining <= 0) break
      const have = targetPlanet.population.tierCounts[tier] ?? 0
      const take = Math.min(have, remaining)
      targetPlanet.population.tierCounts[tier] = have - take
      remaining -= take
    }
    recordDeath(state.civs.get(targetPlanet.civId)?.deathLedger ?? launchingCiv.deathLedger, {
      tick: state.currentTick,
      planetId: targetPlanet.planet.id,
      cause: 'explosion',
      count: kills,
      tier: null,
      note: `${def.name} AoE strike (r=${aoe.radius.toFixed(0)}u, mag=${aoe.magnitude.toFixed(0)})`,
    })
  }
  // Infrastructure damage: per magnitude/1500 buildings destroyed (high-magnitude strikes
  // chip away at the target's industrial base).
  const buildingsHit = Math.floor(aoe.magnitude / 1500)
  if (buildingsHit > 0 && targetPlanet.buildingsByDef.size > 0) {
    let toDamage = buildingsHit
    for (const [defId, count] of [...targetPlanet.buildingsByDef]) {
      if (toDamage <= 0) break
      const take = Math.min(count, toDamage)
      targetPlanet.buildingsByDef.set(defId, count - take)
      if (count - take === 0) targetPlanet.buildingsByDef.delete(defId)
      toDamage -= take
    }
  }
  pushEvent(state, {
    atTick: state.currentTick,
    civId: launchingCiv.civId,
    kind: 'intercept',
    message: `💥 ${def.emoji} ${def.name} detonated on ${String(targetPlanet.planet.id)} — ${kills.toLocaleString()} dead, ${buildingsHit} buildings lost (r=${aoe.radius.toFixed(0)}u, mag=${aoe.magnitude.toFixed(0)})`,
  })
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
  if (defId === BLDG_MINE_FIELD) {
    // PHASE 16.22: per UMS spec + SMOL_REFERENCE_TRAJECTORY §17 — placing a mine-field
    // tile creates a server-authoritative MineField at the tile's world position. The
    // detonation radius scales with planet radius (UMS detDist=50m on flat-Earth → SMoL
    // great-circle arc scale uses planet.radius * 0.12 ≈ 50-200 units depending on
    // planet size — catches arc-passes within roughly one tile's width).
    empty.occupancy = 'mineField'
    const worldPos = {
      x: planet.planet.position.x + empty.centroid.x,
      y: planet.planet.position.y + empty.centroid.y,
      z: planet.planet.position.z + empty.centroid.z,
    }
    const detRadius = Math.max(50, planet.planet.radius * 0.12)
    planet.mineFields.push(newMineField(planet.planet.id, planet.civId, worldPos, 3, detRadius))
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
  if (inputs.defId === BLDG_MINE_FIELD) {
    // PHASE 16.22: see placeBuildingInternal for full UMS-spec rationale. Player-placement
    // path mirrors AI placement path so mines work identically regardless of who places them.
    tile.occupancy = 'mineField'
    const worldPos = {
      x: planet.planet.position.x + tile.centroid.x,
      y: planet.planet.position.y + tile.centroid.y,
      z: planet.planet.position.z + tile.centroid.z,
    }
    const detRadius = Math.max(50, planet.planet.radius * 0.12)
    planet.mineFields.push(newMineField(planet.planet.id, planet.civId, worldPos, 3, detRadius))
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
