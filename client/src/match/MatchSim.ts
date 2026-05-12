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
  type ResolvedShipStats,
  type ResourceId,
  type ShipLoadoutContext,
  type SparklineBuffer,
  type SparklineMetricId,
  type TargetingMode,
  type Theme,
  type ThemeId,
  type Tile,
  type TileId,
  AIControllerRegistry,
  AIController as AIControllerCtor,
  BATTERY_BANK_CAPACITY,
  BLDG_BATTERY_BANK,
  FUEL_RAW_STOCKPILE_BASELINE,
  BLDG_FACTORY,
  BLDG_FARM,
  BLDG_LAB,
  BLDG_LAUNCH_PAD,
  BLDG_GOD_CONTROL,
  BLDG_LUMBER_CAMP,
  BLDG_MINE,
  BLDG_MINE_FIELD,
  BLDG_MINING_OUTPOST,
  BLDG_TV_STATION,
  CAMPAIGNS,
  COLONY_SHIPS,
  LAST_HOPE_BUILD_TICKS,
  LAST_HOPE_LAUNCH_TICKS,
  LAST_HOPE_PACK_TICKS,
  MAX_MINERS_PER_OUTPOST,
  MINING_OUTPOST_SHIP_COST_COMPONENTS,
  MINING_OUTPOST_SHIP_COST_FUEL,
  MINING_OUTPOST_SHIP_COST_INGOTS,
  MINING_OUTPOST_SHIP_INTERVAL_TICKS,
  RESEARCH_POINT_DIVISOR,
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
  TECH_GOD_CONTROL,
  TECH_SELF_DESTRUCT_SYSTEMS,
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
  discoverPlanet,
  deathsInWindow,
  deceptionPenalties,
  defaultBuildFromShipDef,
  deriveCrashLootFromShipPayload,
  dissidentRatio,
  flightCurrentPosition,
  flightDef as resolveFlightDef,
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
  type FlightKind,
  type ShuttleLegTickContext,
  loadCargoFromInventory,
  loadCitizensFromTier,
  loadCitizensFromVolunteerPool,
  loadFuel,
  padCitizenMixSatisfiesShip,
  resetPadCitizenLoad,
  restoreCargoFromPadToInventory,
  restoreCitizensFromPadToPopulation,
  tickShuttleLeg,
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
  recordSparklineSample,
  resolveMatchEnd,
  shouldAutoTriggerLastHope,
  spawnIndigenousCiv,
  startPrint,
  startPrintFromBlueprint,
  startResearch,
  clampResourceToCap,
  consumeResource,
  stockOf,
  tickActiveCampaign,
  tickFlight,
  tickIndigenousAttacks,
  tickLastHopeEvac,
  tickMiningShip,
  tickPad,
  getBuildingProduction,
  tickPlanetProduction,
  tileWorldPosition,
  tickResearch,
  tickTierPromotion,
  totalPopulation,
  availableWorkers,
  newCanonicalSparklineMap,
  SPARKLINE_CAPTURE_INTERVAL,
  SPARKLINE_ACTIVE_FLIGHTS,
  SPARKLINE_COMPONENTS,
  SPARKLINE_DEFEATED_CIVS,
  SPARKLINE_DETONATIONS,
  SPARKLINE_FOOD,
  SPARKLINE_FUEL,
  SPARKLINE_INGOTS,
  SPARKLINE_MINING_CARGO_PCT,
  SPARKLINE_OWNED_PLANETS,
  SPARKLINE_POPULATION,
  SPARKLINE_RESOURCE_TOTAL,
  SPARKLINE_TECH_POINTS,
} from '@smol/shared'

export type MatchPhase = 'STARTING' | 'IN_PROGRESS' | 'ENDED'

// PHASE 16.24 (deferred completion): structured detonation event consumed by the 3D render
// layer. The sim emits one MatchDetonation per AoE strike with the target planet's world
// position + AoE radius + magnitude. GalaxyView's DetonationFlashLayer reads the list every
// render frame and spawns an expanding-sphere flash mesh per id; the flash entry self-times
// in wall-clock ms (~1.5s). Sim-side prune keeps entries within last DETONATION_LIFETIME_TICKS
// so the list stays bounded even in long matches with frequent strikes.
export interface MatchDetonation {
  readonly id: string
  readonly atTick: number
  readonly planetId: PlanetId
  readonly worldPosition: import('@smol/shared').Vec3
  readonly radius: number
  readonly magnitude: number
}

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
  // PHASE 17.B.2 — per-outpost build-progress counter. Each BLDG_MINING_OUTPOST tile accrues
  // build progress every tick; when it crosses MINING_OUTPOST_SHIP_INTERVAL_TICKS the outpost
  // tries to spawn one mining ship (gated on resource cost + per-outpost miner cap).
  outpostBuildTicks: Map<TileId, number>
  // PHASE 17.B.2 — monotonic miner serial per planet so generated ids never collide even when
  // multiple outposts spawn on the same tick.
  nextMinerSerial: number
  // Super-review SR2-9 fix: cached tile lookup, built once at planet-state creation. Avoids
  // per-tick Array.find + per-tick Map rebuild in tickMiningOutpost. Tiles are immutable
  // (built from icosphere), so this Map stays valid for the entire match.
  readonly tilesById: ReadonlyMap<TileId, Tile>
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
  // PHASE 16.24 (deferred completion): structured detonation events for the 3D render layer.
  // Pruned every tick to keep within DETONATION_LIFETIME_TICKS.
  detonations: MatchDetonation[]
  // PHASE 16.35 — UMS-faithful 12-graph sparkline cycle data. Per-metric circular buffer
  // sampled every SPARKLINE_CAPTURE_INTERVAL ticks. Drives LCD slot 6 GRAPHS rendering.
  readonly sparklines: Map<SparklineMetricId, SparklineBuffer>
  // PHASE 17.L.C.9 — O(1) padId → planetId lookup index. Maintained on every launch-pad add
  // (placeBuildingCanonical) so launchShipFromPadAction + buildShipAction +
  // buildShipFromBlueprintAction don't have to linear-scan state.planets to find the planet
  // hosting a given pad. Late-game empire scale (100+ planets × 200+ pads per
  // feedback_no_caps_on_empire.md) requires this to keep auto-fire salvo + player launches
  // off the O(planets) hot path.
  readonly padIdToPlanetIdIndex: Map<TileId, PlanetId>
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
  // PHASE 17.K — per user verbatim 2026-05-11 "lets make a toggle in new game settup to be
  // able to toggle the hosted games fog of war on and off so starting a new game can choose
  // the option". When false, every civ's empire.discoveredPlanetIds is populated with EVERY
  // planet at match start — the galactic map renders without fog, all enemy planets visible
  // + all enemy flag billboards visible. Defender-discovery and launch-target-discovery still
  // fire but become no-ops since the planet is already in the set. Default true (UMS-faithful).
  readonly fogOfWarEnabled?: boolean
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
// PHASE 16.24 (deferred completion): detonation flash lifetime. Sim entries get pruned this
// many ticks after their atTick. Render layer animates each flash on its own ~1.5s wall-clock
// timeline so they fade out long before the sim-side prune drops them.
const DETONATION_LIFETIME_TICKS = 30

export function createMatch(config: MatchConfig): MatchState {
  const galaxy = generateGalaxy({ seed: config.seed, planetCount: config.planetCount })
  const rng = mulberry32(config.seed ^ 0xa5a5a5)
  const aiRegistry = new AIControllerRegistry()

  const civs = new Map<CivId, MatchCivState>()
  const planets = new Map<PlanetId, MatchPlanetState>()
  const indigenousCivs = new Map<CivId, IndigenousCiv>()

  const humanCivId = civId(`civ-human-${config.humanAccount.profile.handle}`)
  const humanTheme = getTheme(config.humanThemeId)
  // Super-review SR2-10 fix: spawn assignment must pick HOSPITABLE biomes, not first-N
  // entries in the flat planet list (which is solar-system-clustered after 17.I — first
  // planet may be a tier-3 lava world). Collect tier-0 (and tier-1 as fallback) planets in
  // deterministic order; assign first to the human civ, then to AI civs in order.
  const hospitablePlanets: Planet[] = []
  for (const p of galaxy.planets) {
    if (p.biome.hostilityTier === 0) hospitablePlanets.push(p)
  }
  for (const p of galaxy.planets) {
    if (p.biome.hostilityTier === 1) hospitablePlanets.push(p)
  }
  if (hospitablePlanets.length === 0) {
    throw new Error('No tier-0 or tier-1 planets in galaxy — generation produced unplayable map')
  }
  let spawnCursor = 0
  const humanHomePlanet = hospitablePlanets[spawnCursor++]!
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
    // SR2-10: AI civs spawn from the same hospitable-planets list as the human, in order.
    // Once we exhaust hospitable planets, remaining AI slots can't spawn — bail rather than
    // putting AI on hostile-tier rocks.
    const homePlanet = hospitablePlanets[spawnCursor++]
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

  // PHASE 17.K — fog-of-war host toggle. When disabled at match setup, populate every civ's
  // discoveredPlanetIds with EVERY planet in the galaxy so the map renders without fog and
  // every flag billboard is visible from match start. Defender-discovery and launch-target-
  // discovery still fire downstream but become no-ops since the planet is already discovered.
  if (config.fogOfWarEnabled === false) {
    for (const civState of civs.values()) {
      for (const planet of galaxy.planets) {
        discoverPlanet(civState.empire, planet.id)
      }
    }
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
    detonations: [],
    // PHASE 16.35 — canonical 12-metric sparkline cycle (UMS GRAPHS slot adaptation).
    sparklines: newCanonicalSparklineMap(),
    // PHASE 17.L.C.9 — O(1) padId → planetId index. Populated from existing planet pads
    // after the state object is constructed below (see post-construct backfill).
    padIdToPlanetIdIndex: new Map(),
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
  // PHASE 17.L.C.9 — backfill the padId → planetId index from initial pads (createMatch sets
  // up the human's home pad + AI pads inline). Subsequent placeBuildingCanonical calls add
  // entries via the maintenance hook below.
  for (const [planetId, planet] of state.planets) {
    for (const padId of planet.launchPads.keys()) {
      state.padIdToPlanetIdIndex.set(padId, planetId)
    }
  }
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
    outpostBuildTicks: new Map(),
    nextMinerSerial: 0,
    // SR2-9: cache tile-by-id lookup once. Tiles are immutable; this Map persists for the
    // life of the planet state.
    tilesById: new Map(planet.tiles.map((t) => [t.id, t])),
  }
}

// PHASE 17.B.2 — outpost-driven miner spawning. Auto-spawn at match start violated the
// "build it to use it" gameplay rule (per user verbatim *"miners should be BUILT not given
// for free"*). Mining ships now come exclusively from BLDG_MINING_OUTPOST buildings: each
// outpost accumulates build progress, and when the counter crosses MINING_OUTPOST_SHIP_INTERVAL_TICKS
// it spends INGOTS + COMPONENTS + FUEL to assemble one ship — gated on a per-outpost cap so
// runaway production can't happen. Tunables live in shared/sim/balance-constants per 17.B.4.

// Mining ship dock offset above the outpost tile (along the tile's outward normal). Far enough
// that the ship renders clear of the surface but close enough that visual association is obvious.
// This stays local — it's a rendering-adjacent constant, not a balance lever.
const MINING_OUTPOST_DOCK_OFFSET = 30

// PHASE 17.B.2 + 17.B.3 — per-outpost mining-ship spawn tick. Walks every BLDG_MINING_OUTPOST
// tile, increments its build counter, and when ready attempts a paid spawn. Spawned ship's
// homeTileId + homePosition track the outpost tile so 17.B.3's "ship returns to its outpost,
// not to the planet's north pole" contract holds. Owner check is implicit — buildingsByTile is
// keyed on owned tiles only because placeBuildingCanonical refuses non-owned tiles.
//
// Super-review fix (SR-7 + SR2-9): tile lookup is O(1) via the planet-state's CACHED Map
// (built once in makePlanetState, persists for match lifetime). No per-tick allocation.
function tickMiningOutpost(state: MatchState, planetState: MatchPlanetState): void {
  for (const [tileId, defId] of planetState.buildingsByTile) {
    if (defId !== BLDG_MINING_OUTPOST) continue
    const tile = planetState.tilesById.get(tileId)
    if (!tile) continue
    const progress = (planetState.outpostBuildTicks.get(tileId) ?? 0) + 1
    if (progress < MINING_OUTPOST_SHIP_INTERVAL_TICKS) {
      planetState.outpostBuildTicks.set(tileId, progress)
      continue
    }
    // Check per-outpost cap.
    let minersAtThisOutpost = 0
    for (const ship of planetState.miningShips.values()) {
      if (ship.homeTileId === tileId) minersAtThisOutpost += 1
    }
    if (minersAtThisOutpost >= MAX_MINERS_PER_OUTPOST) {
      // Cap reached — leave progress pegged at the spawn threshold so the moment a miner is
      // lost / scrapped the next one is ready to go. Avoids wasted ticks.
      planetState.outpostBuildTicks.set(tileId, MINING_OUTPOST_SHIP_INTERVAL_TICKS)
      continue
    }
    // Resource check.
    const ingots = stockOf(planetState.inventory, RESOURCE_INGOTS)
    const components = stockOf(planetState.inventory, RESOURCE_COMPONENTS)
    const fuel = stockOf(planetState.inventory, RESOURCE_FUEL)
    if (
      ingots < MINING_OUTPOST_SHIP_COST_INGOTS ||
      components < MINING_OUTPOST_SHIP_COST_COMPONENTS ||
      fuel < MINING_OUTPOST_SHIP_COST_FUEL
    ) {
      // Materials short — pin progress, retry next tick.
      planetState.outpostBuildTicks.set(tileId, MINING_OUTPOST_SHIP_INTERVAL_TICKS)
      continue
    }
    // Deduct + spawn.
    planetState.inventory.stocks.set(RESOURCE_INGOTS, ingots - MINING_OUTPOST_SHIP_COST_INGOTS)
    planetState.inventory.stocks.set(
      RESOURCE_COMPONENTS,
      components - MINING_OUTPOST_SHIP_COST_COMPONENTS,
    )
    planetState.inventory.stocks.set(RESOURCE_FUEL, fuel - MINING_OUTPOST_SHIP_COST_FUEL)
    planetState.outpostBuildTicks.set(tileId, 0)

    const civState = state.civs.get(planetState.civId)
    const themeEmoji = civState?.theme.emoji ?? '⛏️'
    const serial = planetState.nextMinerSerial + 1
    planetState.nextMinerSerial = serial
    const shipId = `${planetState.civId}-miner-${String(tileId)}-${serial}`
    const shipName = `${themeEmoji} Drone ${serial}`
    // 17.B.3: dock position = tile centroid extended along the outward normal by
    // MINING_OUTPOST_DOCK_OFFSET. The centroid is at distance surfaceRadius from planet
    // center, so scaling by (R + offset)/R lifts the dock that much above the surface.
    const planetPos = planetState.planet.position
    const surfR = planetState.planet.surfaceRadius
    const scale = surfR > 0 ? (surfR + MINING_OUTPOST_DOCK_OFFSET) / surfR : 1
    const tileWorld = tileWorldPosition(tile, planetState.planet)
    const dockPos = {
      x: planetPos.x + (tileWorld.x - planetPos.x) * scale,
      y: planetPos.y + (tileWorld.y - planetPos.y) * scale,
      z: planetPos.z + (tileWorld.z - planetPos.z) * scale,
    }
    const ship = newMiningShip(
      shipId,
      shipName,
      planetState.civId,
      planetState.planet.id,
      dockPos,
      tileId,
    )
    planetState.miningShips.set(shipId, ship)
    pushEvent(state, {
      atTick: state.currentTick,
      civId: planetState.civId,
      kind: 'build',
      message: `⛏️ Mining outpost rolled out ${shipName}.`,
    })
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
    // PHASE 17.L.A.6 — pad autoload runs for HUMAN civ too now. Previously the human civ was
    // excluded, meaning human-launched pads never auto-pulled citizens and shipped with 0
    // aboard. The autoload step is tier-aware (suicide ships only pull tier 4-5), so the
    // citizen-tier gate is enforced at LOAD time, not just at LAUNCH time.
    tickPadAutomation(state, civState)
  }

  for (const civState of state.civs.values()) {
    if (!civState.alive) continue
    tickLastHopeForCiv(state, civState)
  }

  for (const flight of [...state.flights.values()]) {
    tickFlight(flight)
    // PHASE 17.L.A.11 — Q5 LOCKED. shuttle-mode mining post-process. No-op for oneway flights.
    // For shuttle modes, drives the OUTBOUND → EXTRACTING → INBOUND → OUTBOUND cycle. When
    // tickShuttleLeg returns a fresh flight we swap state.flights[id]; when it returns cargo
    // we deposit into the home planet's inventory.
    if (flight.flightKind !== 'oneway') {
      const homePlanet = state.planets.get(flight.homePlanetId)
      const homePos = homePlanet?.planet.position ?? flight.arc.start
      const nextIdx =
        flight.flightKind === 'shuttle-multi' && flight.assignedTargets.length > 0
          ? (flight.currentAssignedTargetIdx + 1) % flight.assignedTargets.length
          : flight.currentAssignedTargetIdx
      const nextTargetPlanetId = flight.assignedTargets[nextIdx] ?? null
      const nextTargetPlanet = nextTargetPlanetId ? state.planets.get(nextTargetPlanetId) : null
      const nextTargetPos = nextTargetPlanet?.planet.position ?? null
      // Pick the extracted resource from the current target planet's first non-depleted
      // resourceNode. Fallback chain: first node → first stocked inventory resource → null.
      const currentTarget = state.planets.get(flight.targetPlanetId)
      let extractedResource: ResourceId | null = null
      if (currentTarget) {
        for (const node of currentTarget.planet.resourceNodes) {
          if (node.amountRemaining > 0) {
            extractedResource = node.resourceId
            break
          }
        }
        if (!extractedResource) {
          for (const [resource, amount] of currentTarget.inventory.stocks) {
            if (amount > 0) {
              extractedResource = resource
              break
            }
          }
        }
      }
      const ctx: ShuttleLegTickContext = {
        homePlanetPosition: homePos,
        nextOutboundTargetPosition: nextTargetPos,
        nextOutboundTargetPlanetId: nextTargetPlanetId,
        nextLegSignalLossSeed: Math.floor(state.rng() * 0xffffff),
        extractedCargoResource: extractedResource,
      }
      const shuttleResult = tickShuttleLeg(flight, ctx)
      if (shuttleResult.cargoToDeposit && homePlanet) {
        for (const [resource, amount] of shuttleResult.cargoToDeposit) {
          if (amount <= 0) continue
          const current = homePlanet.inventory.stocks.get(resource) ?? 0
          homePlanet.inventory.stocks.set(resource, current + amount)
        }
        pushEvent(state, {
          atTick: state.currentTick,
          civId: flight.launchingCivId,
          kind: 'launch',
          message: `🚛 Shuttle cycle ${flight.shuttleCyclesCompleted + 1} delivered cargo to ${String(flight.homePlanetId)}`,
        })
      }
      if (shuttleResult.freshFlight) {
        state.flights.set(String(flight.id), shuttleResult.freshFlight)
      }
      if (shuttleResult.terminated) {
        pushEvent(state, {
          atTick: state.currentTick,
          civId: flight.launchingCivId,
          kind: 'launch',
          message: `🛑 Shuttle ${String(flight.id)} terminated — no reachable next target.`,
        })
      }
    }
    const flightDef = resolveFlightDef(flight)
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
    // PHASE 16.32: EMPTY_HULK drift collision check. A "bomb waiting" hulk drifts on its
    // frozen velocity through wrapped space; if it passes within (planet.surfaceRadius × 1.2)
    // of any planet it impacts. AoE fires when the variant has payload AND the impacted planet
    // isn't the launching civ's own (friendly-fire prevention). Per user verbatim "just was
    // a bomb waiting or is auto guidance attasck installed?". Hulks without auto-guidance
    // are the bombs; hulks with auto-guidance never enter EMPTY_HULK to begin with.
    if (flight.phase === 'EMPTY_HULK' && flight.hulkPosition) {
      const hulkPos = flight.hulkPosition
      for (const candidatePlanet of state.planets.values()) {
        const dx = hulkPos.x - candidatePlanet.planet.position.x
        const dy = hulkPos.y - candidatePlanet.planet.position.y
        const dz = hulkPos.z - candidatePlanet.planet.position.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < candidatePlanet.planet.surfaceRadius * 1.2) {
          const launchingCiv = state.civs.get(flight.launchingCivId)
          const def = resolveFlightDef(flight)
          if (
            launchingCiv &&
            candidatePlanet.civId !== launchingCiv.civId &&
            (def.suicideShip || def.payload.explosiveYield > 0 || def.payload.weaponPayload > 0)
          ) {
            applyDetonationAoE(state, flight, launchingCiv, candidatePlanet)
          } else {
            pushEvent(state, {
              atTick: state.currentTick,
              civId: flight.launchingCivId,
              kind: 'crash',
              message: `🪦 Empty hulk ${String(flight.id)} crashed on ${String(candidatePlanet.planet.id)} (no payload, no AoE).`,
            })
          }
          flight.phase = 'CRASH_LANDED'
          flight.outcome = 'SIGNAL_LOST'
          break
        }
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
  // PHASE 16.24 (deferred completion): prune detonation entries older than the lifetime
  // window. Keeps the array bounded across long matches without affecting render-side
  // animations (they self-time in wall-clock and fade much faster than the tick window).
  state.detonations = state.detonations.filter(
    (d) => state.currentTick - d.atTick < DETONATION_LIFETIME_TICKS,
  )

  // PHASE 16.35 — UMS-faithful sparkline capture every SPARKLINE_CAPTURE_INTERVAL ticks.
  // Samples the human civ's empire-level metrics into the canonical 12-graph rotation buffer.
  // Cheap: 12 metric reads + 12 buffer writes per capture tick (~once per 5 sim ticks).
  if (state.currentTick % SPARKLINE_CAPTURE_INTERVAL === 0) {
    captureSparklineSamples(state)
  }

  resolveMatch(state)
}

// PHASE 16.35 — empire-level metric capture. Reads the human civ's aggregate state + appends
// one sample to each canonical sparkline buffer. Buffers are circular (SPARKLINE_BUFFER_SIZE
// samples = rolling window), so unbounded match length stays memory-bounded.
function captureSparklineSamples(state: MatchState): void {
  const humanCiv = state.civs.get(state.humanCivId)
  if (!humanCiv) return

  let resourceTotal = 0
  let popTotal = 0
  let foodStock = 0
  let fuelStock = 0
  let ingotsStock = 0
  let componentsStock = 0
  let cargoTotal = 0
  let cargoCapacity = 0
  for (const planet of state.planets.values()) {
    if (planet.civId !== state.humanCivId) continue
    for (const amt of planet.inventory.stocks.values()) resourceTotal += amt
    popTotal += totalPopulation(planet.population)
    foodStock += stockOf(planet.inventory, RESOURCE_FOOD)
    fuelStock += stockOf(planet.inventory, RESOURCE_FUEL)
    ingotsStock += stockOf(planet.inventory, RESOURCE_INGOTS)
    componentsStock += stockOf(planet.inventory, RESOURCE_COMPONENTS)
    for (const ship of planet.miningShips.values()) {
      cargoTotal += ship.cargoAmount
      cargoCapacity += ship.cargoCapacity
    }
  }
  const cargoPct = cargoCapacity > 0 ? (cargoTotal / cargoCapacity) * 100 : 0
  const techPoints = humanCiv.empire.researchedTechs.size
  const activeFlights = [...state.flights.values()].filter(
    (f) =>
      f.launchingCivId === state.humanCivId &&
      f.phase !== 'DETONATE' &&
      f.phase !== 'INTERCEPTED' &&
      f.phase !== 'ABORTED' &&
      f.phase !== 'CRASH_LANDED',
  ).length
  const ownedPlanets = humanCiv.empire.controlledPlanetIds.size
  // Defeated-civ count = civs no longer alive (excluding the human's own state).
  let defeatedCivs = 0
  for (const c of state.civs.values()) {
    if (c.civId === state.humanCivId) continue
    if (!c.alive) defeatedCivs += 1
  }
  // Detonations-in-rolling-window = how many detonation events still active (within the
  // DETONATION_LIFETIME_TICKS prune window). Spikes when carpet-bomb runs are landing.
  const detonationsWindow = state.detonations.length

  const samples: ReadonlyArray<readonly [SparklineMetricId, number]> = [
    [SPARKLINE_RESOURCE_TOTAL, resourceTotal],
    [SPARKLINE_POPULATION, popTotal],
    [SPARKLINE_TECH_POINTS, techPoints],
    [SPARKLINE_ACTIVE_FLIGHTS, activeFlights],
    [SPARKLINE_MINING_CARGO_PCT, cargoPct],
    [SPARKLINE_FOOD, foodStock],
    [SPARKLINE_FUEL, fuelStock],
    [SPARKLINE_INGOTS, ingotsStock],
    [SPARKLINE_COMPONENTS, componentsStock],
    [SPARKLINE_OWNED_PLANETS, ownedPlanets],
    [SPARKLINE_DEFEATED_CIVS, defeatedCivs],
    [SPARKLINE_DETONATIONS, detonationsWindow],
  ]
  for (const [metricId, value] of samples) {
    const buf = state.sparklines.get(metricId)
    if (buf) recordSparklineSample(buf, value)
  }
}

// PHASE 17.L.A.3 — pre-production surplus calc for brownout detection. Mirrors
// PlanetEnergyPanel's computePlanetEnergyStats logic (capacity vs draw per tick). Returns
// positive when fuel production exceeds consumption; negative when planet is net-burning fuel.
function computeFuelSurplusPerTick(planetState: MatchPlanetState, techMultiplier: number): number {
  let capacity = 0
  let draw = 0
  for (const [defId, count] of planetState.buildingsByDef) {
    if (count === 0) continue
    const prod = getBuildingProduction(defId)
    if (!prod) continue
    const fuelOut = prod.outputs.find((o) => o.resource === RESOURCE_FUEL)?.amount ?? 0
    if (fuelOut > 0) capacity += fuelOut * count * techMultiplier
    const fuelIn = prod.inputs.find((i) => i.resource === RESOURCE_FUEL)?.amount ?? 0
    if (fuelIn > 0) draw += fuelIn * count
  }
  return capacity - draw
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

  // PHASE 17.L.A.3 — brownout state computed BEFORE production runs. Empty-fuel + planet
  // already showing negative capacity-surplus → fuel-consuming buildings get the gating skip
  // this tick. PlanetEnergyPanel surfaces the warning; production tick enforces it.
  const preProdFuelStock = stockOf(planetState.inventory, RESOURCE_FUEL)
  const brownoutActive =
    preProdFuelStock <= 0 &&
    computeFuelSurplusPerTick(planetState, techEffects.buildingProductionMultiplier) < 0

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
      brownoutActive,
    })
  }

  // PHASE 17.L.A.2 — fuel-stockpile cap from Battery Banks. Cap = batteryCount ×
  // BATTERY_BANK_CAPACITY + FUEL_RAW_STOCKPILE_BASELINE. Without batteries every planet still
  // has a small raw stockpile baseline so they're not totally crippled; each Battery Bank adds
  // BATTERY_BANK_CAPACITY (500) to the cap. Surplus fuel beyond cap is silently lost (the
  // "extra production went somewhere — vented, dumped" fiction). Battery banks become a real
  // gameplay choice. Per TODO 17.L.A.2.
  const batteryCount = planetState.buildingsByDef.get(BLDG_BATTERY_BANK) ?? 0
  const fuelCap = batteryCount * BATTERY_BANK_CAPACITY + FUEL_RAW_STOCKPILE_BASELINE
  clampResourceToCap(planetState.inventory, RESOURCE_FUEL, fuelCap)

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
    // PHASE 17.L.C.2 — pass the same brownoutActive flag we computed for production gating
    // (A.3). Pads in PRINT/BUILD stall during brownout until fuel returns.
    tickPad(pad, planetState.inventory, 1, brownoutActive)
  }

  // PHASE 17.B.2 — outposts drive miner production. Each tick, every mining outpost on this
  // planet accumulates build progress and pays out a new miner when it hits the threshold +
  // resource cost + per-outpost cap.
  tickMiningOutpost(state, planetState)

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
    // PHASE 17.L.A.4 — research-side workforce uses availableWorkers (citizens minus ship-duty
    // reserved pool). Closes the 17.J.9 double-count loop where ship-duty-reserved citizens
    // still counted as research labor while also being available as colony-ship volunteers.
    const total = availableWorkers(ps.population)
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
  const rawAggregate = aggregateEmpireResearchPoints(civState.empire, points)
  // PHASE 17.B.4 — research throttle for the locked 10-24h saga. Same costPoints, fewer
  // points/tick = each tech takes RESEARCH_POINT_DIVISOR× longer to research. Keeps the
  // tech.ts cost numbers intact while making "rush to galactic apex" a real long climb.
  const aggregate = Math.max(0, Math.floor(rawAggregate / RESEARCH_POINT_DIVISOR))
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

  // Super-review fix: feed mining-economy context so AI can rush outposts when needed.
  const minerCount = homePlanet.miningShips.size
  let resourceNodesAvailable = 0
  for (const node of homePlanet.planet.resourceNodes) {
    if (node.amountRemaining > 0) resourceNodesAvailable += 1
  }

  const buildingCtx: PlanetBuildingContext = {
    planetId: homePlanet.planet.id,
    currentBuildingCounts: homePlanet.buildingsByDef as ReadonlyMap<string, number>,
    availableTiles,
    populationPressure,
    minerCount,
    resourceNodesAvailable,
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
  // Super-review fix: Mining Outpost now foundational (placement.ts TECH_GATED_BUILDINGS no
  // longer gates it). AI can build outposts from match start so the outpost-driven miner
  // economy (17.B.2) actually works without tech rush.
  unlockedBuildings.add('Mining Outpost')
  unlockedBuildings.add('miningOutpost')
  unlockedBuildings.add(BLDG_MINING_OUTPOST as unknown as string)
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

// PHASE 17.L.A.6 — renamed from tickAIPadAutomation: now runs for ALL civs including the human
// player. Citizen autoload is tier-aware so suicide ships only pull from tier 4-5 regardless of
// which civ owns the pad.
function tickPadAutomation(state: MatchState, civState: MatchCivState): void {
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
          // PHASE 17.L.A.6 — tier-aware autoload via the shared helper. Suicide ships pull from
          // tier 5 then tier 4 ONLY (refuse to dip lower per SMOL_DESIGN_COLONY_SHIPS §9-NEW).
          // Non-suicide ships fill from tier 1 upward. The helper drains tierCounts and updates
          // pad.citizensLoadedByTier in a single pass — no manual tier subtraction here.
          const want = def.payload.citizenCapacity - pad.citizensLoaded
          loadCitizensFromVolunteerPool(pad, planet.population, want, def.suicideShip)
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
  // PHASE 17.L.A.17 — AI launch path also computes selfDestructInstalled so AI flights are
  // abortable per-civ when the AI has researched TECH_SELF_DESTRUCT_SYSTEMS. Keeps human + AI
  // sides symmetric (no surprise where AI flights can self-destruct but human civ's can't).
  const civHasSelfDestructTech = civState.empire.researchedTechs.has(TECH_SELF_DESTRUCT_SYSTEMS)
  const selfDestructInstalled = civHasSelfDestructTech && def.selfDestructCapable
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
    selfDestructInstalled,
  })
  state.flights.set(flightIdStr, flight)
  pad.state = 'GONE'
  recordColonyShipLaunch(civState.deceptionLedger, pad.citizensLoaded)
  // PHASE 16.38 — fog-of-war discovery: AI launching civ discovers target on launch +
  // defender discovers attacker source.
  discoverPlanet(civState.empire, targetPlanet.planet.id)
  const defenderCivState = state.civs.get(targetPlanet.civId)
  if (defenderCivState && targetPlanet.civId !== civState.civId) {
    discoverPlanet(defenderCivState.empire, fromPlanet.planet.id)
  }
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
    // PHASE 17.L.A.17 — pass through defender's tech state so the counter flight arms with
    // self-destruct when researched.
    defenderHasSelfDestructTech: defenderCiv.empire.researchedTechs.has(TECH_SELF_DESTRUCT_SYSTEMS),
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
    const def = resolveFlightDef(flight)
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
  const def = resolveFlightDef(flight)
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
  // PHASE 16.24 (deferred completion): emit structured detonation event for the 3D render
  // layer. World position = target planet center (sufficient flash precision at galactic
  // scale — the AoE radius is what reads visually, not a tile-precise impact point).
  state.detonations.push({
    id: `det-${state.currentTick}-${String(flight.id)}`,
    atTick: state.currentTick,
    planetId: targetPlanet.planet.id,
    worldPosition: {
      x: targetPlanet.planet.position.x,
      y: targetPlanet.planet.position.y,
      z: targetPlanet.planet.position.z,
    },
    radius: aoe.radius,
    magnitude: aoe.magnitude,
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

// PHASE 17.A.1 + 17.A.4 — canonical placeBuilding. Validates in strict order so player error
// messages are accurate and AI + player paths share the same logic. Validation order:
// (1) building def exists, (2) tile lookup, (3) tile owned by this civ, (4) tile empty,
// (5) resources available. Failures push a specific event when `suppressEvents` is false.
// AI callers pass `suppressEvents: true` to avoid spamming the human's event log with AI builds.
function placeBuildingCanonical(
  state: MatchState,
  planet: MatchPlanetState,
  defId: BuildingDefId,
  tileId: TileId | undefined,
  suppressEvents: boolean,
): boolean {
  const def = getBuildingDef(defId)
  if (!def) {
    if (!suppressEvents) {
      pushEvent(state, {
        atTick: state.currentTick,
        civId: planet.civId,
        kind: 'system',
        message: `❌ Build failed — unknown building "${String(defId)}"`,
      })
    }
    return false
  }
  let tile = tileId ? planet.planet.tiles.find((t) => t.id === tileId) : null
  if (!tile) {
    tile = planet.planet.tiles.find((t) => t.ownerCivId === planet.civId && t.occupancy === 'empty')
  }
  if (!tile) {
    if (!suppressEvents) {
      pushEvent(state, {
        atTick: state.currentTick,
        civId: planet.civId,
        kind: 'system',
        message: `❌ Build failed — no available tile on ${String(planet.planet.id)}`,
      })
    }
    return false
  }
  if (tile.ownerCivId !== planet.civId) {
    if (!suppressEvents) {
      pushEvent(state, {
        atTick: state.currentTick,
        civId: planet.civId,
        kind: 'system',
        message: `❌ Can't build ${def.emoji} ${def.name} — that's not your tile`,
      })
    }
    return false
  }
  if (tile.occupancy !== 'empty') {
    if (!suppressEvents) {
      pushEvent(state, {
        atTick: state.currentTick,
        civId: planet.civId,
        kind: 'system',
        message: `❌ Can't build ${def.emoji} ${def.name} — tile already has ${tile.occupancy}`,
      })
    }
    return false
  }
  for (const cost of def.buildCost) {
    const have = stockOf(planet.inventory, cost.resource)
    if (have < cost.amount) {
      if (!suppressEvents) {
        pushEvent(state, {
          atTick: state.currentTick,
          civId: planet.civId,
          kind: 'system',
          message: `❌ Can't build ${def.emoji} ${def.name} — need ${cost.amount} ${String(cost.resource)} (have ${have})`,
        })
      }
      return false
    }
  }
  // All gates passed — deduct + place.
  for (const cost of def.buildCost) {
    const cur = stockOf(planet.inventory, cost.resource)
    planet.inventory.stocks.set(cost.resource, cur - cost.amount)
  }
  tile.occupancy = 'building'
  planet.buildingsByDef.set(defId, (planet.buildingsByDef.get(defId) ?? 0) + 1)
  planet.buildingsByTile.set(tile.id, defId)
  if (defId === BLDG_LAUNCH_PAD) {
    const pad = newLaunchPad(tile.id, planet.civId, planet.planet.id, false)
    planet.launchPads.set(tile.id, pad)
    // PHASE 17.L.C.9 — maintain the O(1) padId → planetId index on every pad add.
    state.padIdToPlanetIdIndex.set(tile.id, planet.planet.id)
  }
  if (defId === BLDG_MINE_FIELD) {
    tile.occupancy = 'mineField'
    const worldPos = {
      x: planet.planet.position.x + tile.centroid.x,
      y: planet.planet.position.y + tile.centroid.y,
      z: planet.planet.position.z + tile.centroid.z,
    }
    const detRadius = Math.max(50, planet.planet.radius * 0.12)
    planet.mineFields.push(newMineField(planet.planet.id, planet.civId, worldPos, 3, detRadius))
  }
  if (!suppressEvents) {
    pushEvent(state, {
      atTick: state.currentTick,
      civId: planet.civId,
      kind: 'build',
      message: `Built ${def.name} on ${String(planet.planet.id)}`,
    })
  }
  return true
}

// AI-path wrapper — silent on failure, picks any empty owned tile.
function placeBuildingInternal(
  state: MatchState,
  planet: MatchPlanetState,
  defId: BuildingDefId,
): boolean {
  return placeBuildingCanonical(state, planet, defId, undefined, true)
}

export interface PlaceBuildingInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
  readonly tileId?: TileId
  readonly defId: BuildingDefId
}

export function placeBuildingAction(inputs: PlaceBuildingInputs): boolean {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: inputs.state.humanCivId,
      kind: 'system',
      message: `❌ Build failed — planet "${String(inputs.planetId)}" not found`,
    })
    return false
  }
  if (planet.civId !== inputs.state.humanCivId) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: inputs.state.humanCivId,
      kind: 'system',
      message: `❌ Can't build there — you don't own ${String(inputs.planetId)}`,
    })
    return false
  }
  return placeBuildingCanonical(inputs.state, planet, inputs.defId, inputs.tileId, false)
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
  // PHASE 17.L.C.9 — O(1) lookup via padId → planetId index. Fallback to linear scan kept for
  // defense in case the index misses (legacy saves or in-flight migration).
  const indexedPlanetId = inputs.state.padIdToPlanetIdIndex.get(inputs.padId)
  if (indexedPlanetId) {
    const planet = inputs.state.planets.get(indexedPlanetId)
    if (!planet || planet.civId !== inputs.state.humanCivId) return false
    const pad = planet.launchPads.get(inputs.padId)
    if (!pad) return false
    return startPrint(pad, inputs.variantId, planet.inventory)
  }
  for (const planet of inputs.state.planets.values()) {
    if (planet.civId !== inputs.state.humanCivId) continue
    const pad = planet.launchPads.get(inputs.padId)
    if (!pad) continue
    return startPrint(pad, inputs.variantId, planet.inventory)
  }
  return false
}

// PHASE 17.J.10 — staging a pad for a print run driven by a saved blueprint instead of the
// COLONY_SHIPS catalog. baseVariantId is the closest-match catalog variant supplying the
// suicideShip / canIntercept / payload-tier / power-source-derived fields; the resolved
// blueprint stats override the per-tick numbers via flightDef(). totalCost is the aggregated
// resource sum from the blueprint pieces (NOT the base variant's catalog buildCost), so a
// custom build pays exactly what its pieces add up to.
export interface BuildShipFromBlueprintInputs {
  readonly state: MatchState
  readonly padId: TileId
  readonly baseVariantId: ColonyShipVariantId
  readonly displayName: string
  readonly pieces: ReadonlyArray<string>
  readonly stats: ResolvedShipStats
  readonly totalCost: ReadonlyArray<{ resource: ResourceId; amount: number }>
  // PHASE 17.L.A.7+A.8 — optional saved-blueprint id so the launch-manifest modal can look up
  // the player's saved crew/cargo preset for THIS blueprint and pre-fill the sliders. Omitted
  // when buildShipFromBlueprint is called from non-blueprint flows (e.g. AI or catalog).
  readonly sourceBlueprintId?: string
}

export function buildShipFromBlueprintAction(inputs: BuildShipFromBlueprintInputs): boolean {
  // PHASE 17.L.C.9 — O(1) padId → planetId lookup. Linear-scan fallback retained.
  const indexedPlanetId = inputs.state.padIdToPlanetIdIndex.get(inputs.padId)
  if (indexedPlanetId) {
    const planet = inputs.state.planets.get(indexedPlanetId)
    if (!planet || planet.civId !== inputs.state.humanCivId) return false
    const pad = planet.launchPads.get(inputs.padId)
    if (!pad) return false
    return startPrintFromBlueprint(
      pad,
      inputs.baseVariantId,
      inputs.displayName,
      inputs.pieces,
      inputs.stats,
      inputs.totalCost,
      planet.inventory,
      1,
      inputs.sourceBlueprintId,
    )
  }
  for (const planet of inputs.state.planets.values()) {
    if (planet.civId !== inputs.state.humanCivId) continue
    const pad = planet.launchPads.get(inputs.padId)
    if (!pad) continue
    return startPrintFromBlueprint(
      pad,
      inputs.baseVariantId,
      inputs.displayName,
      inputs.pieces,
      inputs.stats,
      inputs.totalCost,
      planet.inventory,
      1,
      inputs.sourceBlueprintId,
    )
  }
  return false
}

export interface LaunchShipInputs {
  readonly state: MatchState
  readonly padId: TileId
  readonly targetPlanetId: PlanetId
  // PHASE 16.33 — UMS 6-mode targeting selection from TargetingModePanel state. Defaults to
  // GPS when omitted (legacy callers / auto-fire mass-action paths). Mode biases the per-
  // flight dispersion radius via TARGETING_MODE_DISPERSION_MULTIPLIER.
  readonly targetingMode?: TargetingMode
  // PHASE 17.L.A.11 — Q5 PHASE 17 LOCKED. Player-driven mining launches via the Launch Manifest
  // Modal supply the mining mode + (for multi-target) the list of planets to rotate through.
  // Defaults to 'oneway' when omitted so every legacy path stays oneway. assignedTargets is
  // ignored for oneway/shuttle-single; required for shuttle-multi.
  readonly flightKind?: FlightKind
  readonly assignedTargets?: ReadonlyArray<PlanetId>
}

// PHASE 17.L.A.7+A.8 — manifest-driven crew + cargo loading. The LaunchManifestModal commits
// the player's per-tier crew allocation + per-resource cargo allocation through this action
// just before firing launchShipFromPadAction. Restore-then-load semantics: whatever was on
// the pad (auto-loaded by tickPadAutomation, or left over from a previous manifest commit) is
// returned to population.tierCounts / planet.inventory first, then the new manifest applies
// fresh. That way each manifest commit fully rewrites the pad load — the sliders represent
// the WHOLE allocation, not deltas.
//
// Q3 PHASE 17 LOCKED closure: "what crew and supplies and the loading of ammunition" — the
// crew side already had tier-aware auto-load (PHASE 17.L.A.6); this is the player-controlled
// override path PLUS the missing cargo side.
export interface LoadPadManifestInputs {
  readonly state: MatchState
  readonly padId: TileId
  readonly citizensByTier: Partial<Record<1 | 2 | 3 | 4 | 5, number>>
  readonly cargoByResource: ReadonlyMap<ResourceId, number>
}

export interface LoadPadManifestResult {
  readonly ok: boolean
  readonly citizensLoaded: number
  readonly cargoLoaded: number
  readonly reason?: string
}

export function loadPadManifestAction(inputs: LoadPadManifestInputs): LoadPadManifestResult {
  let planet: MatchPlanetState | null = null
  const indexedPlanetId = inputs.state.padIdToPlanetIdIndex.get(inputs.padId)
  if (indexedPlanetId) {
    const found = inputs.state.planets.get(indexedPlanetId)
    if (found && found.civId === inputs.state.humanCivId) planet = found
  }
  if (!planet) {
    for (const p of inputs.state.planets.values()) {
      if (p.civId !== inputs.state.humanCivId) continue
      if (p.launchPads.has(inputs.padId)) {
        planet = p
        break
      }
    }
  }
  if (!planet) return { ok: false, citizensLoaded: 0, cargoLoaded: 0, reason: 'planet-not-found' }
  const pad = planet.launchPads.get(inputs.padId)
  if (!pad || !pad.loadedShipVariantId) {
    return { ok: false, citizensLoaded: 0, cargoLoaded: 0, reason: 'pad-empty' }
  }
  // Only let the manifest mutate during the loading window. tickPad's state machine moves the
  // pad through DOCK → FUEL → AMMO → READY → ARM; modal opens in any of those.
  if (
    pad.state !== 'DOCK' &&
    pad.state !== 'FUEL' &&
    pad.state !== 'AMMO' &&
    pad.state !== 'READY' &&
    pad.state !== 'ARM'
  ) {
    return { ok: false, citizensLoaded: 0, cargoLoaded: 0, reason: 'wrong-pad-state' }
  }
  // 1) Restore current pad load back to its source so the new manifest is a clean rewrite.
  restoreCitizensFromPadToPopulation(pad, planet.population)
  restoreCargoFromPadToInventory(pad, planet.inventory)
  // 2) Apply new crew manifest per tier.
  let citizensLoaded = 0
  for (const tier of [1, 2, 3, 4, 5] as const) {
    const want = inputs.citizensByTier[tier] ?? 0
    if (want > 0) citizensLoaded += loadCitizensFromTier(pad, planet.population, tier, want)
  }
  // 3) Apply new cargo manifest per resource.
  let cargoLoaded = 0
  for (const [resource, amount] of inputs.cargoByResource) {
    if (amount > 0) cargoLoaded += loadCargoFromInventory(pad, planet.inventory, resource, amount)
  }
  return { ok: true, citizensLoaded, cargoLoaded }
}

export function launchShipFromPadAction(inputs: LaunchShipInputs): boolean {
  // PHASE 17.L.C.9 — O(1) lookup via padId → planetId index. Falls back to linear scan if the
  // index doesn't have the entry (legacy saves before the index, or pad belonging to a
  // non-human civ — index is empire-wide so this scan only hits the non-human path).
  const indexedPlanetId = inputs.state.padIdToPlanetIdIndex.get(inputs.padId)
  if (indexedPlanetId) {
    const planet = inputs.state.planets.get(indexedPlanetId)
    if (!planet || planet.civId !== inputs.state.humanCivId) return false
    return launchShipFromPadInPlanet(inputs, planet)
  }
  // Defensive fallback (index miss — should not happen in normal flow).
  for (const planet of inputs.state.planets.values()) {
    if (planet.civId !== inputs.state.humanCivId) continue
    if (!planet.launchPads.has(inputs.padId)) continue
    return launchShipFromPadInPlanet(inputs, planet)
  }
  return false
}

function launchShipFromPadInPlanet(inputs: LaunchShipInputs, planet: MatchPlanetState): boolean {
  const pad = planet.launchPads.get(inputs.padId)
  if (!pad) return false
  return launchShipFromPadBody(inputs, planet, pad)
}

function launchShipFromPadBody(
  inputs: LaunchShipInputs,
  planet: MatchPlanetState,
  pad: LaunchPad,
): boolean {
  // PHASE 17.L.C.9 — body extracted from the original for-loop so both index-hit + fallback
  // can share it. Logic preserved verbatim from the pre-17.L.C.9 launchShipFromPadAction body.
  if (pad.state !== 'READY' && pad.state !== 'ARM') return false
  if (!pad.loadedShipVariantId) return false
  const targetPlanet = inputs.state.planets.get(inputs.targetPlanetId)
  if (!targetPlanet) return false
  const def = getColonyShipDef(pad.loadedShipVariantId)
  // PHASE 17.L.A.6 — citizen tier-gate per SMOL_DESIGN_COLONY_SHIPS §9-NEW + user verbatim
  // "remember above all citizens dont want to kill them selves but for the most high
  // tiered/happy/statas we have". Suicide ships REFUSE to launch unless all citizens aboard
  // are tier 4-5. If lower-tier citizens are aboard (which can happen if the player manually
  // loaded them before the autoload caught up, or if a future conscription override mode
  // adds them), the launch is refused with an "Insufficient Volunteers" event so the player
  // knows to invest in propaganda buildings (Cathedral / University / Re-education /
  // Corporate Promotions) to elevate more tier 4-5 citizens before retrying.
  if (def.suicideShip && !padCitizenMixSatisfiesShip(pad)) {
    const lowerAboard =
      pad.citizensLoadedByTier[1] + pad.citizensLoadedByTier[2] + pad.citizensLoadedByTier[3]
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: planet.civId,
      kind: 'launch',
      message: `Insufficient Volunteers — ${def.name} demands tier 4-5 citizens only (${lowerAboard} lower-tier aboard). Invest in propaganda buildings to elevate more citizens.`,
    })
    return false
  }
  // PHASE 17.J.5 — reactor fuel loading. Reactor variants require their tier-specific
  // radioactive resource consumed from the launching planet's inventory at liftoff. Solar /
  // battery variants have reactorFuelType === null and skip this gate. Launch aborts if the
  // planet doesn't have enough — pad stays in READY so the player can refuel and retry.
  if (def.reactorFuelType && def.reactorFuelAmount > 0) {
    const available = stockOf(planet.inventory, def.reactorFuelType)
    if (available < def.reactorFuelAmount) {
      pushEvent(inputs.state, {
        atTick: inputs.state.currentTick,
        civId: planet.civId,
        kind: 'launch',
        message: `Launch aborted: ${def.name} needs ${def.reactorFuelAmount} ${String(def.reactorFuelType)} for reactor (have ${available})`,
      })
      return false
    }
    consumeResource(planet.inventory, def.reactorFuelType, def.reactorFuelAmount)
  }
  const flightIdStr = `flight-${inputs.state.currentTick}-${planet.civId}-${pad.id}`
  // PHASE 17.L.A.17 — self-destruct arms only when the launching civ has researched
  // TECH_SELF_DESTRUCT_SYSTEMS AND the variant has detonation intent baked in (suicide /
  // counter / explosive payload). Without it the ship can only end via natural causes.
  const launchingCivState = inputs.state.civs.get(planet.civId)
  const civHasSelfDestructTech =
    launchingCivState?.empire.researchedTechs.has(TECH_SELF_DESTRUCT_SYSTEMS) ?? false
  const selfDestructInstalled = civHasSelfDestructTech && def.selfDestructCapable
  // PHASE 17.J.10 — thread loadedCustomBuild into the flight so flightDef() resolves to the
  // blueprint-derived stats instead of the base variant. baseVariantId is set so downstream
  // code paths (suicide-ship flag, can-intercept flag, render-layer color) still resolve.
  //
  // PHASE 17.L.A.7 — thread pad.cargoLoaded into the flight as cargoAboard. Cargo manifest is
  // snapshotted into a fresh Map by newColonyShipFlight so subsequent pad recycling doesn't
  // touch the in-flight ship's cargo state.
  // PHASE 17.L.A.11 — Q5 LOCKED. flightKind threads through from LaunchManifestModal's mining
  // mode picker. For shuttle modes, assignedTargets carries the planet rotation; for
  // shuttle-single the array gets a single entry (the chosen target); for oneway it stays empty.
  // homePlanetId is set to the launching pad's planet so cargo deposits land back here on
  // every INBOUND home-return cycle.
  const flightKind: FlightKind = inputs.flightKind ?? 'oneway'
  const shuttleAssignedTargets: ReadonlyArray<PlanetId> =
    flightKind === 'shuttle-multi'
      ? (inputs.assignedTargets ?? [targetPlanet.planet.id])
      : flightKind === 'shuttle-single'
        ? [targetPlanet.planet.id]
        : []
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
    selfDestructInstalled,
    cargoAboard: pad.cargoLoaded,
    flightKind,
    assignedTargets: shuttleAssignedTargets,
    homePlanetId: planet.planet.id,
    ...(inputs.targetingMode ? { targetingMode: inputs.targetingMode } : {}),
    ...(pad.loadedCustomBuild
      ? {
          customBuild: {
            displayName: pad.loadedCustomBuild.displayName,
            pieces: pad.loadedCustomBuild.pieces,
            stats: pad.loadedCustomBuild.stats,
            baseVariantId: pad.loadedShipVariantId,
          },
        }
      : {}),
  })
  inputs.state.flights.set(flightIdStr, flight)
  pad.state = 'GONE'
  const civState = inputs.state.civs.get(planet.civId)
  if (civState) {
    recordColonyShipLaunch(civState.deceptionLedger, pad.citizensLoaded)
    // PHASE 16.38 — launching civ discovers the target planet on launch (they're aiming at
    // it, so the destination is no longer fogged for them). Defender discovers attacker's
    // source on incoming-flight detection — handled in tickIncomingFlight (below).
    discoverPlanet(civState.empire, targetPlanet.planet.id)
  }
  // PHASE 16.38 — defender discovers attacker's source planet the moment an incoming flight
  // is registered (UMS-faithful — UnitySignal antenna acquisition fires at launch).
  const defenderCivState = inputs.state.civs.get(targetPlanet.civId)
  if (defenderCivState && targetPlanet.civId !== planet.civId) {
    discoverPlanet(defenderCivState.empire, planet.planet.id)
  }
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: planet.civId,
    kind: 'launch',
    message: `Launched ${def.name} → ${String(targetPlanet.planet.id)}`,
  })
  return true
}

// PHASE 16.31 — God Control redirect action. Player selects an in-flight colony ship and
// right-clicks any planet to redirect it mid-arc. Validates: launching civ has TECH_GOD_CONTROL
// researched + at least one BLDG_GOD_CONTROL installed on any of their controlled planets.
// Effective on any non-terminal phase — works on STRANDED ships (un-strands them) AND on
// EMPTY_HULK ships (the god re-pilots dead-crew ships from above per project framing).
//
// Implementation: replaces the flight in state.flights with a fresh ColonyShipFlight built
// from currentPosition → newTarget. Preserves the flight id + mutable carryover state
// (powerRemaining / crewAlive / fuelRemaining / lifeSupportRemaining) so the player doesn't
// get full re-stock on each redirect. Counter-flights tracking the old arc will miss and
// self-destruct naturally — no special cleanup needed (PHASE 16.29 abortFlight-on-attacker-
// gone handles them; here the attacker is still in flights, just on a new arc).
export interface RedirectFlightInputs {
  readonly state: MatchState
  readonly flightId: string
  readonly newTargetPlanetId: PlanetId
}

export function redirectFlightAction(inputs: RedirectFlightInputs): boolean {
  const flight = inputs.state.flights.get(inputs.flightId)
  if (!flight) return false
  // Only redirect flights launched by the human civ. AI doesn't use god control (yet).
  if (flight.launchingCivId !== inputs.state.humanCivId) return false
  // Reject terminal phases — already-detonated/aborted/intercepted/crashed flights can't be
  // redirected. STRANDED + EMPTY_HULK are NOT terminal so they CAN be redirected.
  if (
    flight.phase === 'DETONATE' ||
    flight.phase === 'INTERCEPTED' ||
    flight.phase === 'ABORTED' ||
    flight.phase === 'CRASH_LANDED'
  ) {
    return false
  }
  const civState = inputs.state.civs.get(flight.launchingCivId)
  if (!civState) return false
  if (!civState.empire.researchedTechs.has(TECH_GOD_CONTROL)) return false
  // Validate at least one BLDG_GOD_CONTROL on any controlled planet.
  let hasGodControlBuilding = false
  for (const planetId of civState.empire.controlledPlanetIds) {
    const planet = inputs.state.planets.get(planetId)
    if (planet && (planet.buildingsByDef.get(BLDG_GOD_CONTROL) ?? 0) > 0) {
      hasGodControlBuilding = true
      break
    }
  }
  if (!hasGodControlBuilding) return false
  const newTarget = inputs.state.planets.get(inputs.newTargetPlanetId)
  if (!newTarget) return false

  // Sample current position BEFORE replacing the flight (function uses flight phase + arc).
  const currentPos = flightCurrentPosition(flight)
  // Build a fresh flight from currentPos → newTarget. newColonyShipFlight handles arc +
  // dispersion + initial state computation. Then we override the mutable carryover state to
  // preserve power/crew/fuel/life-support — god control doesn't refuel the ship, just redirects.
  // PHASE 16.33 — targetingMode preserved across redirect so the same guidance package applies
  // to the new arc (god control doesn't re-pick the mode, it just retargets).
  const redirected = newColonyShipFlight({
    id: flight.id,
    variantId: flight.variantId,
    launchingCivId: flight.launchingCivId,
    fromPlanetId: flight.fromPlanetId,
    targetPlanetId: newTarget.planet.id,
    fromPosition: currentPos,
    targetPosition: newTarget.planet.position,
    travelRadius: 1000,
    citizensAboard: flight.citizensAboard,
    signalLossSeed: flight.signalLossSeed,
    targetingMode: flight.targetingMode,
  })
  // PHASE 16.38 — god-control redirect also discovers the new target planet for the player.
  discoverPlanet(civState.empire, newTarget.planet.id)
  redirected.powerRemaining = flight.powerRemaining
  redirected.lifeSupportRemaining = flight.lifeSupportRemaining
  redirected.crewAlive = flight.crewAlive
  redirected.fuelRemaining = flight.fuelRemaining
  // crewStarvationTimer is carried over so starving crew doesn't restart the countdown.
  redirected.crewStarvationTimer = flight.crewStarvationTimer
  inputs.state.flights.set(inputs.flightId, redirected)

  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: civState.civId,
    kind: 'launch',
    message: `🕹️ God-control redirected ${String(flight.id)} → ${String(newTarget.planet.id)}.`,
  })
  return true
}

// PHASE 17.L.C.1 — mid-flight reactor refuel via god-control. Endgame-tier per user verbatim
// 2026-05-11 "god control refuel sound like endgaem tech" — gated on the same
// TECH_GOD_CONTROL (forbidden tier-4) + BLDG_GOD_CONTROL combo that powers redirect. Player
// picks any owned planet as the radioactive source; the planet pays def.reactorFuelAmount of
// def.reactorFuelType from its inventory; the in-flight ship's reactorFuelRemaining refills
// back to reactorFuelAtLaunch. Reactor variants only — solar/battery flights return false.
// Closes the loop with PHASE 17.L.A.1 reactor-fuel drain → STRANDED: now the player has an
// (expensive, endgame) way to rescue a stranded reactor ship instead of watching it die.
export interface RefuelReactorInputs {
  readonly state: MatchState
  readonly flightId: string
  readonly sourcePlanetId: PlanetId
}

export function refuelReactorFromGodControlAction(inputs: RefuelReactorInputs): boolean {
  const flight = inputs.state.flights.get(inputs.flightId)
  if (!flight) return false
  // Only human-launched flights; AI doesn't use god control (yet).
  if (flight.launchingCivId !== inputs.state.humanCivId) return false
  // Reactor variants only — solar/battery flights have reactorFuelAtLaunch = 0 per A.1.
  if (flight.reactorFuelAtLaunch <= 0) return false
  // Reject terminal phases. STRANDED + EMPTY_HULK are NOT terminal — refueling a stranded
  // reactor ship is exactly the rescue use case this action exists for.
  if (
    flight.phase === 'DETONATE' ||
    flight.phase === 'INTERCEPTED' ||
    flight.phase === 'ABORTED' ||
    flight.phase === 'CRASH_LANDED' ||
    flight.phase === 'EMPTY_HULK'
  ) {
    return false
  }
  // God-control endgame gate: TECH_GOD_CONTROL researched + BLDG_GOD_CONTROL installed.
  const civState = inputs.state.civs.get(flight.launchingCivId)
  if (!civState) return false
  if (!civState.empire.researchedTechs.has(TECH_GOD_CONTROL)) return false
  let hasGodControlBuilding = false
  for (const planetId of civState.empire.controlledPlanetIds) {
    const planet = inputs.state.planets.get(planetId)
    if (planet && (planet.buildingsByDef.get(BLDG_GOD_CONTROL) ?? 0) > 0) {
      hasGodControlBuilding = true
      break
    }
  }
  if (!hasGodControlBuilding) return false
  // Source planet must be owned by the human civ + have enough of the radioactive.
  const sourcePlanet = inputs.state.planets.get(inputs.sourcePlanetId)
  if (!sourcePlanet || sourcePlanet.civId !== inputs.state.humanCivId) return false
  const def = getColonyShipDef(flight.variantId)
  if (!def.reactorFuelType || def.reactorFuelAmount <= 0) return false
  const available = stockOf(sourcePlanet.inventory, def.reactorFuelType)
  if (available < def.reactorFuelAmount) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: civState.civId,
      kind: 'launch',
      message: `🕹️ God-control refuel aborted: ${String(sourcePlanet.planet.id)} needs ${def.reactorFuelAmount} ${String(def.reactorFuelType)} (have ${available})`,
    })
    return false
  }
  consumeResource(sourcePlanet.inventory, def.reactorFuelType, def.reactorFuelAmount)
  flight.reactorFuelRemaining = flight.reactorFuelAtLaunch
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: civState.civId,
    kind: 'launch',
    message: `🕹️ God-control refueled reactor on ${String(flight.id)} (consumed ${def.reactorFuelAmount} ${String(def.reactorFuelType)} from ${String(sourcePlanet.planet.id)})`,
  })
  return true
}

// PHASE 16.31 — convenience check exposed to UI so the FlightDetailPanel "Select for Redirect"
// button + GalaxyView right-click handler can gate visibility without re-computing the check
// each frame. Returns true when the human civ has god control researched AND installed.
export function isHumanGodControlReady(state: MatchState): boolean {
  const human = state.civs.get(state.humanCivId)
  if (!human) return false
  if (!human.empire.researchedTechs.has(TECH_GOD_CONTROL)) return false
  for (const planetId of human.empire.controlledPlanetIds) {
    const planet = state.planets.get(planetId)
    if (planet && (planet.buildingsByDef.get(BLDG_GOD_CONTROL) ?? 0) > 0) return true
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
void resetPadCitizenLoad
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
