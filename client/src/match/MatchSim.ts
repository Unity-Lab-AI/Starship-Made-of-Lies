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
  type MiningShipMode,
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
  BLDG_AQUEDUCT,
  BLDG_BATTERY_BANK,
  FUEL_RAW_STOCKPILE_BASELINE,
  BLDG_FACTORY,
  BLDG_FARM,
  BLDG_HOME,
  BLDG_LAB,
  BLDG_CIVIC_CENTER,
  BLDG_LAUNCH_PAD,
  BLDG_GOD_CONTROL,
  BLDG_LUMBER_CAMP,
  BLDG_MINE,
  BLDG_MINE_FIELD,
  BLDG_MINING_OUTPOST,
  BLDG_QUARRY,
  BLDG_SOLAR_ARRAY,
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
  RECYCLE_RESEARCH_CONVERSION_RATE,
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
  RESOURCE_WATER,
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
  applyDehydrationDeaths,
  applyStarvationDeaths,
  attemptIndigenousParley,
  buildHumanCoopAlliance,
  canTradeBetweenCivs,
  civId,
  claimLootDrop,
  type CoopAlliance,
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
  isBuildingUnlocked,
  unlocksForBuilding,
  getColonyShipDef,
  getTheme,
  getThemePolish,
  ACHIEVEMENTS,
  type AccountId,
  type Caravan,
  type Settlement,
  type SettlementId,
  type ActiveRandomEvent,
  type RandomEventIntensity,
  ANNEX_PROPAGANDA_COST,
  CARAVAN_FUEL_COST,
  MAX_ACTIVE_CARAVANS_PER_CIV,
  CARAVAN_MAX_AMOUNT_PER_RUN,
  SETTLEMENT_INITIAL_RINGS,
  getRandomEventDef,
  tickRandomEvents,
  cancelCaravan,
  canFoundSettlementAt,
  checkMatchEndAchievements,
  computeMatchScores,
  countActiveCaravans,
  hasWonByTech,
  newCapitalSettlement,
  newCaravan,
  newFoundedSettlement,
  renameSettlement,
  tilesWithinHexRings,
  tickCaravan,
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
  setMiningShipMode,
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
  recordBuildingConstructed,
  recordPlanetGain,
  recordPlanetLoss,
  recordSparklineSample,
  resolveMatchEnd,
  shouldAutoTriggerLastHope,
  spawnIndigenousCiv,
  startPrint,
  startPrintFromBlueprint,
  purchaseResearchFromPool,
  clampResourceToCap,
  consumeResource,
  enforceCapacityCaps,
  getInventoryCapacityUpgradeCost,
  MAX_INVENTORY_CAPACITY_TIER,
  stockOf,
  tryConsumeAll,
  tickActiveCampaign,
  tickFlight,
  tickIndigenousAttacks,
  tickLastHopeEvac,
  tickMiningShip,
  tickPad,
  getBuildingProduction,
  type BuildingProductionMode,
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
  addStartingPlanetEconomy,
} from '@smol/shared'
import { shouldTickPlanetThisFrame, type PlanetTickPriority } from './planetAggregates'

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
  // PHASE 17.L.A.12 — Q11 PHASE 17 LOCKED. Per-resource target stockpiles set via the
  // QuotasPanel sliders. Buildings producing a resource that's at-or-above its quota idle in
  // auto-mode to save workforce. Empty Map = no quotas set (unthrottled production).
  quotas: Map<ResourceId, number>
  // PHASE 17.L.A.12 — Q11 LOCKED. Per-building-def production mode override. Keyed by
  // BuildingDefId so the toggle applies to every instance of that building type on the
  // planet uniformly. Missing entry = 'auto'. Values: 'auto' | 'paused' | 'disassembly'.
  buildingModes: Map<BuildingDefId, BuildingProductionMode>
  // PHASE 17.L.C.4 — per-planet inventory capacity tier. Drives the per-resource storage cap
  // shown in PlanetInventoryPanel + enforced by enforceCapacityCaps every production tick.
  // Player upgrades via the panel button (cost scales with current tier). Defaults to 1.
  inventoryCapacityTier: number
  // PHASE 17.13.1 — multi-settlement-per-planet data model. Every planet ships with a default
  // Capital settlement covering every tile; founding a Civic Center carves out new settlements.
  // Per-settlement inventory / population / workforce bifurcation lands in 17.13.6's aggregate-
  // vs-detail toggle. Until then planet-level aggregates remain the source of truth and the
  // Capital is the implicit container for all of it.
  settlements: Map<SettlementId, Settlement>
  // Monotonic ordinal for naming founded settlements (Region-1, Region-2, etc.). First founded
  // = 1, second = 2, etc. Capital uses ordinal 0 (always 'Capital').
  nextSettlementOrdinal: number
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
    // PHASE 17.12.6 / 17.12.10 — achievement unlock event. PlayPage watches for this kind +
    // surfaces a gold-tinted persistent toast distinct from info/warning/error/success.
    | 'achievement_unlock'
    // PHASE 18.4 — galactic random event (Solar Flare, Plague Outbreak, etc.). PlayPage
    // surfaces these via the top-of-screen banner + EventsLogPanel kind filter.
    | 'random_event'
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
  // PHASE 17.13.7 — inter-planet caravan trade. Per-civ caravan list with active OUTBOUND
  // entries + recently-DELIVERED/CANCELLED entries pending UI dismissal. Tick loop progresses
  // OUTBOUND caravans + drains DELIVERED ones into the destination planet's inventory.
  caravans: Map<CivId, Caravan[]>
  // Monotonic seed for caravan id generation. Guarantees no id collisions even when multiple
  // caravans launch in the same tick from the same planet pair.
  nextCaravanSerial: number
  // PHASE 18.4 — per-civ active random events (Solar Flare, Plague Outbreak, etc.). Map keyed
  // by CivId; value is the active events with countdown timers. tickRandomEvents in shared/
  // ticks these down each match tick, applies per-tick deltas, prunes finished entries, and
  // rolls new spawns against the host-configured intensity (config.randomEventIntensity).
  activeRandomEvents: Map<CivId, ActiveRandomEvent[]>
  // PHASE 18.4 — locked-in intensity (defaulted from config.randomEventIntensity ?? 'medium').
  // Stored on state so a save-loaded match keeps the host's original setting.
  randomEventIntensity: RandomEventIntensity
  // PHASE 18.5 — coop alliances. Empty in single-player; populated when a coop lobby spawns a
  // human-side alliance via `buildHumanCoopAlliance`. Consumed by `canTradeBetweenCivs` /
  // `canShareIntelBetweenCivs` / `isHostileBetweenCivs` resolvers in `shared/sim/diplomacy.ts`
  // so trade caravans + fog-of-war intel sharing + AI hostility checks all consult the same
  // alliance roster. Per user verbatim 2026-05-10 *"diplomacy ONLY in coop, AIs always hostile"*.
  alliances: CoopAlliance[]
  // PHASE 17.13.9 — optional per-planet tick priority resolver. Default behavior (resolver
  // unset) = every planet ticks every frame, matching pre-17.13.9 behavior. Host may attach a
  // resolver that returns 'focused' / 'nearby' / 'background' so background-empire planets tick
  // every 4th or 12th frame, freeing CPU for the camera-focused planet. Wire from PlayPage when
  // empire scale (100+ planets per feedback_no_caps_on_empire.md) starts to bite.
  planetTickPriorityFor?: (planetId: PlanetId) => PlanetTickPriority
  events: MatchEventLog[]
  // PHASE 17.12.6 — achievement IDs newly unlocked by THIS match's end resolver. Populated by
  // tickMatch when phase transitions to 'ENDED'. Empty during play. useMatchSim watches this
  // list + persists to localStorage via applyAchievementUnlocks (which deduplicates against
  // any pre-existing unlocks from prior matches so the toast only fires for true transitions).
  achievementUnlocksThisMatch: string[]
  // PHASE 17.12.7 — match-end leaderboard scores. Populated when phase transitions to ENDED
  // using shared computeMatchScores. useMatchSim watches this list + persists to the
  // localStorage Hall of Champions store via applyMatchScores so the in-game HoC panel +
  // AchievementsPage HoC view both surface real ranking entries.
  matchEndScoresPending: Array<{
    readonly key: import('@smol/shared').LeaderboardKey
    readonly entry: import('@smol/shared').ScoreEntry
  }>
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
  // PHASE 17.L.A.13 — Q12 PHASE 17 LOCKED. Host picks at match start: Off / Manual /
  // Auto-save (every 5 min or 15 min). Auto modes drive the useMatchSim auto-save interval.
  // 'off' disables all autosaves; 'manual' requires the 💾 toolbar button to be clicked.
  // Defaults to 'auto-5min' for any caller that omits it.
  readonly saveMode?: 'off' | 'manual' | 'auto-5min' | 'auto-15min'
  // PHASE 17.L 2026-05-12 user feedback — "in mulitplayer games the speed is only set in the
  // host menu pregame setup canyt have people all changing games peeds on a hosts computer".
  // True when the local PlayPage is running in a multiplayer Colyseus room (the server tick
  // is authoritative). TopToolbar reads this to disable pause + speed buttons. Speed is set
  // by the host in NewGamePage pre-match setup; mid-match changes are forbidden. Defaults
  // false (single-player) for any caller that omits it.
  readonly multiplayer?: boolean
  // PHASE 18.4 — host-configurable random-event intensity. 'off' disables the system entirely
  // (no spawning, no ticking). Low/medium/high scale spawn probability + per-civ active cap.
  // Defaults to 'medium' for any caller that omits it so existing matches get the feature.
  readonly randomEventIntensity?: RandomEventIntensity
}

const HOME_PLANET_STARTING_POP = 1000
// PHASE 17.L.D (HOTFIX 2026-05-12, REV 2) — starting food + water bumped to 8000 each per
// user playtest *"and also the stockpile shows 0 food again and i has a citizxen crash again
// lost 2/3 of my citizens before i could even build a farm"*. Combined with the new
// per-citizen consumption rates below (FOOD_PER_CITIZEN_PER_TICK = 0.05,
// WATER_PER_CITIZEN_PER_TICK = 0.02), 1000 pop drains 50 food + 20 water per tick = 160 ticks
// of food runway + 400 ticks of water runway from initial seed alone. That's ~32 sec / 80 sec
// wall-clock — comfortable buffer for the player to research / build farms / build aqueducts.
const STARTING_FOOD = 8000
const STARTING_WATER = 8000
// PHASE 17.L.D (HOTFIX 2026-05-12, REV 2) — per-citizen consumption tunables. Was 1.0/tick
// (food) baked into the foodConsumed math at the tick site; that meant 1000 citizens drained
// 1000 food/tick — STARTING_FOOD evaporated in 1.5 ticks (300ms wall-clock). New rates put
// the food/water economy at a saner cadence so a player with a handful of farms + aqueducts
// can sustain their starting population.
const FOOD_PER_CITIZEN_PER_TICK = 0.05
const WATER_PER_CITIZEN_PER_TICK = 0.02
// PHASE 17.L.D.10 (HOTFIX 2026-05-12) — starter material amounts bumped per user verbatim
// *"make sure players have enough starting resources to build what they need with out starving
// them"*. Mental simulation of first-30-tick build loop after the pre-built starter buildings:
//   * 200 PLANKS used to be tight — barely enough for 2-3 more Farms + 2-3 more Homes before
//     refinery production kicked in. Bump to 300 lets the player establish ~10 outbuildings.
//   * 50 BRICKS was the breaking point — Aqueducts cost 25 each (1 max from starter), Homes
//     eat 10 each (5 max). Bump to 120 gives room for ~3 more Aqueducts + Homes + a School
//     before Refinery starts producing bricks from stone.
//   * 60 COMPONENTS only bought 1 Solar Array (40); Foundry/Factory/Battery Bank all gated.
//     Bump to 120 lets player build Solar + start saving for a Factory.
//   * 25 ELECTRONICS only afforded 2 Labs (10 each). Bump to 60 enables Lab + early
//     University planning (20).
//   * 80 WOOD + 80 STONE were enough for ~2 Refineries (40+30 each) but tight before the
//     freebie Lumber Camp / Quarry caught up. Bump to 200 each gives ~4 Refineries worth
//     of buffer.
//   * Other amounts unchanged — they were already sized fine for first-30-tick play.
const STARTING_WOOD = 200
const STARTING_STONE = 200
const STARTING_PLANKS = 300
const STARTING_BRICKS = 120
const STARTING_METALS = 400
const STARTING_INGOTS = 200
const STARTING_COMPONENTS = 120
const STARTING_ELECTRONICS = 60
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
  // PHASE 17.L 2026-05-12 — every starting planet must have the resources needed to get to
  // space. Idempotent enrichment: if the random gen didn't roll stone+rareMetals+gas onto the
  // home world, plant a 'common'-tier node for each missing resource on an empty tile.
  addStartingPlanetEconomy(humanHomePlanet, rng)
  // PHASE 17.L.D (HOTFIX 2026-05-12, REV 2) — pool-currency model: research points
  // accumulate into empire.researchPointsPool every tick regardless of any "active tech".
  // The player (or AI) calls purchaseResearchFromPool to atomically spend the cost on a
  // researchable tech. Previous auto-pick of TECH_INDUSTRIAL_LOGISTICS no longer needed —
  // pool fills from tick 1, and once it's >= a tech's costPoints the Tech Detail panel
  // surfaces a "Research <name>" button.
  const humanEmpire = newEmpire(humanCivId, humanHomePlanet.id)
  // PHASE 17.L.D (HOTFIX 2026-05-12) — starter research pool. Pre-seed enough points to
  // afford one tier-0 tech immediately (TECH_INDUSTRIAL_LOGISTICS costs 30 pts). Removes the
  // "no research happening" perception while the slow accrual rate fills the pool toward the
  // next tech. Combined with pre-built Labs (seeded below in makePlanetState wiring), the
  // player has a real research economy from tick 1 instead of staring at a 0/30 bar for 80s.
  humanEmpire.researchPointsPool = 30
  civs.set(humanCivId, {
    civId: humanCivId,
    themeId: config.humanThemeId,
    theme: humanTheme,
    displayName: config.humanDisplayName,
    isHuman: true,
    playstyle: null,
    difficulty: null,
    empire: humanEmpire,
    deceptionLedger: newDeceptionLedger(),
    deathLedger: newDeathLedger(humanCivId),
    homePlanetId: humanHomePlanet.id,
    alive: true,
    lastHopeEvac: null,
    lastHopeTriggered: false,
  })
  const humanHomePlanetState = makePlanetState(humanHomePlanet, humanCivId, String(humanTheme.id))
  // PHASE 17.L.D (HOTFIX 2026-05-12) — pre-build starter economy. See seedStarterBuildings
  // jsdoc for the exact roster + balance rationale.
  seedStarterBuildings(humanHomePlanetState, humanEmpire)
  planets.set(humanHomePlanet.id, humanHomePlanetState)

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
    // PHASE 17.L 2026-05-12 — AI civs also need the basic-space-tech resource set on their
    // home world so they're real threats (not harmless if rolled onto a resource-poor planet).
    addStartingPlanetEconomy(homePlanet, rng)
    const slotCfg = config.aiSlots?.[i]
    const playstyle = slotCfg?.playstyle ?? playstyles[i % playstyles.length]!
    const difficulty = slotCfg?.difficulty ?? difficulties[i % difficulties.length]!
    const empire = newEmpire(aiId, homePlanet.id)
    // PHASE 17.L.D (HOTFIX 2026-05-12, REV 2) — pool model: AI also accumulates points into
    // its researchPointsPool from tick 1. AIController.applyDecisions calls
    // purchaseResearchFromPool with the chosenResearchTech each decision tick; once the
    // pool clears the tech's cost the purchase succeeds. Same starter pool seed as the human
    // civ so AI civs aren't paralyzed at match start either.
    empire.researchPointsPool = 30
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
    const aiHomePlanetState = makePlanetState(homePlanet, aiId, String(aiTheme.id))
    // PHASE 17.L.D (HOTFIX 2026-05-12) — same starter-economy seed as the human civ.
    seedStarterBuildings(aiHomePlanetState, empire)
    planets.set(homePlanet.id, aiHomePlanetState)

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
    caravans: new Map<CivId, Caravan[]>(),
    nextCaravanSerial: 0,
    // PHASE 18.4 — random events bookkeeping.
    activeRandomEvents: new Map<CivId, ActiveRandomEvent[]>(),
    randomEventIntensity: config.randomEventIntensity ?? 'medium',
    // PHASE 18.5 — coop alliances default empty in single-player. Coop lobby spawns populate
    // this via buildHumanCoopAlliance when humans team up; AI civs never enter alliances.
    alliances: [],
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
    achievementUnlocksThisMatch: [],
    matchEndScoresPending: [],
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

function makePlanetState(planet: Planet, ownerId: CivId, ownerThemeId?: string): MatchPlanetState {
  const inv = newPlanetInventory(planet.id)
  inv.stocks.set(RESOURCE_FOOD, STARTING_FOOD)
  inv.stocks.set(RESOURCE_WATER, STARTING_WATER)
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
    // PHASE 17.L.A.12 — Q11 LOCKED. Default empty quotas + auto-mode for every building. Player
    // sets these via the QuotasPanel; sim starts unthrottled so legacy behavior is unchanged
    // for any planet whose player hasn't configured anything.
    quotas: new Map(),
    buildingModes: new Map(),
    // PHASE 17.L.C.4 — every planet starts at capacity tier 1. Upgrade button in
    // PlanetInventoryPanel consumes resources + bumps the tier; production tick clamps each
    // stock to the per-resource tier-derived cap.
    inventoryCapacityTier: 1,
    // PHASE 17.13.1 — every planet boots with a single Capital settlement covering every tile.
    // Founding additional civic centers carves out new settlements from the Capital's
    // controlledTileIds set.
    settlements: (() => {
      const m = new Map<SettlementId, Settlement>()
      const capital = newCapitalSettlement(
        planet.id,
        planet.tiles.map((t) => t.id),
        String(planet.id),
        ownerThemeId,
      )
      m.set(capital.id, capital)
      return m
    })(),
    nextSettlementOrdinal: 1,
    // SR2-9: cache tile-by-id lookup once. Tiles are immutable; this Map persists for the
    // life of the planet state.
    tilesById: new Map(planet.tiles.map((t) => [t.id, t])),
  }
}

// PHASE 17.L.D (HOTFIX 2026-05-12) — pre-built starter buildings per user verbatim *"i
// think we should maybe already have the basic building for the player pre built so that
// food water and houseing are stable so they will need multiple of each building prebuilt
// on their planet spawn start"*. At match start every civ (human + AI) gets a stable
// economic foundation on their home planet so they aren't in a death spiral from tick 1.
// Bypasses the cost-deduction path because these are spawn freebies, not player-driven
// builds. Counts tuned to comfortably feed + hydrate the 1000-pop starting population:
//   - 6 Farms (food: 6 × ~10.8/t = 64.8/t supply vs 50/t demand → +15/t surplus)
//   - 3 Aqueducts (water: 3 × ~18/t = 54/t supply vs 20/t demand → +34/t surplus)
//   - 4 Homes (extra housing for population growth past the 1000 starting cap)
//   - 1 Lumber Camp (wood inflow so building chains can scale)
//   - 1 Quarry (stone inflow same reason)
//   - 1 Solar Array (energy presence)
//   - 2 Labs (research building multiplier 2 × LAB_MULTIPLIER = 2× the no-building rate)
//
// PHASE 17.L.D.13.J (2026-05-13) — stale-comment fix. Pre-17.L.D.10.F Lab was tech-gated
// behind TECH_COMPUTING and the freebie 2 Labs grandfathered in past the gate. Post-fix:
// Lab is baseline-buildable from match start (no tech prereq, planks+bricks cost), so the
// 2 freebies are just a HEAD-START on research throughput, not a tech-bypass. Player can
// build additional Labs from tick 1 without researching anything.
function seedStarterBuildings(planetState: MatchPlanetState, empire?: Empire): void {
  const STARTER_PLAN: ReadonlyArray<{ defId: BuildingDefId; count: number }> = [
    { defId: BLDG_FARM, count: 6 },
    { defId: BLDG_AQUEDUCT, count: 3 },
    { defId: BLDG_HOME, count: 4 },
    { defId: BLDG_LUMBER_CAMP, count: 1 },
    { defId: BLDG_QUARRY, count: 1 },
    { defId: BLDG_SOLAR_ARRAY, count: 1 },
    { defId: BLDG_LAB, count: 2 },
  ]
  // PHASE 17.L.D.17 (2026-05-13) — farthest-point spread placement. Per user verbatim
  // *"the starting buildings(the ones the player starts with) being built and located on
  // the individual hex locations.. its fucked they are all bunched together not even
  // placed individually on each hex ! buildings can only be placed on hexs of the planet
  // not just crammed into the planet with now order"*. Previous loop used `.find()` which
  // always returned the lowest face-index empty owned tile. Icosphere subdivision emits
  // faces clustered by parent icosahedron face, so face indices 0-17 form a single tight
  // patch on the planet surface — 18 starter buildings landed on the same corner. New
  // strategy: track placed tiles, then for each next pick choose the empty-owned tile
  // whose squared-distance to its NEAREST already-placed tile is MAXIMIZED. This is
  // greedy farthest-point sampling, gives even spread across the sphere, O(N*M) cheap
  // for N≈80 candidates × M≤18 placements.
  const placed: Tile[] = []
  for (const entry of STARTER_PLAN) {
    for (let i = 0; i < entry.count; i++) {
      const tile = pickNextSpreadTile(planetState, placed)
      if (!tile) return // ran out of empty owned tiles — bail gracefully (tiny planets)
      tile.occupancy = 'building'
      placed.push(tile)
      planetState.buildingsByDef.set(
        entry.defId,
        (planetState.buildingsByDef.get(entry.defId) ?? 0) + 1,
      )
      planetState.buildingsByTile.set(tile.id, entry.defId)
      // PHASE 17.L.D.19 — starter freebies count toward "ever built" for tech-prereq gating.
      // Doesn't matter for the current set (Farm/Aqueduct/Home/etc. don't gate any tech) but
      // keeps the contract consistent in case a future starter roster includes a gating def.
      if (empire) recordBuildingConstructed(empire, entry.defId)
    }
  }
}

function pickNextSpreadTile(
  planetState: MatchPlanetState,
  alreadyPlaced: ReadonlyArray<Tile>,
): Tile | null {
  let bestTile: Tile | null = null
  let bestScore = -Infinity
  for (const candidate of planetState.planet.tiles) {
    if (candidate.ownerCivId !== planetState.civId) continue
    if (candidate.occupancy !== 'empty') continue
    if (alreadyPlaced.length === 0) {
      // No anchors yet — first placement just grabs this candidate.
      return candidate
    }
    let minSqDist = Infinity
    for (const used of alreadyPlaced) {
      const dx = candidate.centroid.x - used.centroid.x
      const dy = candidate.centroid.y - used.centroid.y
      const dz = candidate.centroid.z - used.centroid.z
      const sq = dx * dx + dy * dy + dz * dz
      if (sq < minSqDist) minSqDist = sq
    }
    if (minSqDist > bestScore) {
      bestScore = minSqDist
      bestTile = candidate
    }
  }
  return bestTile
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

  // PHASE 17.13.9 — off-camera tick throttle gate. Default priority = 'focused' = always tick;
  // hosts that want to throttle background empires for late-game scale (per
  // feedback_no_caps_on_empire.md target of 100+ planets) can override the resolver per-planet
  // by attaching `state.planetTickPriorityFor` ahead of the tick call. The default keeps every
  // planet at every-tick parity so existing balance + AI behavior don't drift; opt-in throttle
  // is a host knob, not a default.
  for (const planet of state.planets.values()) {
    if (!isCivAlive(state, planet.civId)) continue
    const priority: PlanetTickPriority = state.planetTickPriorityFor
      ? state.planetTickPriorityFor(planet.planet.id)
      : 'focused'
    if (!shouldTickPlanetThisFrame(state.currentTick, priority)) continue
    tickPlanet(state, planet)
  }

  tickIndigenous(state)

  // PHASE 17.13.7 — per-civ caravan tick. Progresses every OUTBOUND caravan one tick;
  // arrivals deposit cargo into the destination planet's inventory + fire delivery events;
  // GC drains DELIVERED/CANCELLED entries past the retention window so the UI gets one final
  // render of the terminal state before they disappear from the list.
  tickCaravansForAllCivs(state)

  // PHASE 18.4 — galactic random events. Dispatcher rolls per-civ spawns + ticks down active
  // events. Per-tick resource deltas / population deltas / research-build multipliers applied
  // separately via applyActiveRandomEventEffects below. Banner + log surface lives in PlayPage.
  tickRandomEventsForAllCivs(state)
  applyActiveRandomEventEffects(state)

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
    const prodResult = tickPlanetProduction({
      buildings,
      biome: planetState.planet.biome,
      workforce: planetState.workforce.sliders,
      faction: planetState.faction,
      inventory: planetState.inventory,
      techProductionMultiplier: techEffects.buildingProductionMultiplier,
      themeProductionMultiplier: themeMult,
      deceptionProductionMultiplier: decep.production,
      brownoutActive,
      // PHASE 17.L.A.12 — Q11 LOCKED. Thread per-planet quotas + buildingModes so the
      // production tick respects the player's QuotasPanel settings. Both default-empty so
      // any planet without configuration runs unthrottled (legacy behavior).
      quotas: planetState.quotas,
      buildingModes: planetState.buildingModes,
      // PHASE 17.L.7.4 — per-output tech walls. Civ's researched set is the gate; outputs
      // with requiredTechs not in the set are skipped while baseline outputs still emit.
      researchedTechs: civState.empire.researchedTechs,
    })
    // PHASE 17.L.D.19 (2026-05-13) — recycle-to-research conversion. Per user verbatim
    // *"recycle amount to transper into .00001 reserach points"*. Every unit recovered
    // by disassembly-mode buildings this tick adds RECYCLE_RESEARCH_CONVERSION_RATE
    // (0.00001) points into the civ's research pool. tickResearch is the canonical
    // pool deposit; passing a float is safe (pool is typed `number`).
    let totalRecycled = 0
    for (const amount of prodResult.recycledByResource.values()) totalRecycled += amount
    if (totalRecycled > 0) {
      tickResearch(civState.empire, totalRecycled * RECYCLE_RESEARCH_CONVERSION_RATE)
    }
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

  // PHASE 17.L.C.4 — enforce per-resource storage caps from the planet's inventoryCapacityTier.
  // Runs AFTER production tick + AFTER fuel-specific battery cap so production overflow gets
  // dropped + battery cap can override the generic fuel cap when stricter. UI surfaces the
  // cap visually in PlanetInventoryPanel so the player sees what they're losing.
  enforceCapacityCaps(planetState.inventory, planetState.inventoryCapacityTier)

  applyDeceptionFactionTick(planetState.faction, {
    buildingCounts: planetState.buildingsByDef,
    activeCampaigns: planetState.activeCampaigns,
    techPropagandaMultiplier: techEffects.propagandaPowerMultiplier,
    themePropagandaMultiplier: themeMult,
  })

  for (const c of planetState.activeCampaigns) tickActiveCampaign(c)
  planetState.activeCampaigns = planetState.activeCampaigns.filter(isCampaignActive)

  const totalPop = totalPopulation(planetState.population)
  // PHASE 17.L.D (HOTFIX 2026-05-12, REV 2) — per-citizen food consumption used to be 1.0/
  // citizen/tick (baked in via `Math.min(foodStock, totalPop)`), draining 1000-pop planets
  // to zero food in 1.5 ticks. Now scaled by FOOD_PER_CITIZEN_PER_TICK (0.05), so 1000 pop
  // drains 50 food/tick — matches farm output (~10/tick × 5 farms) and gives the player a
  // real food economy to manage instead of an instant-death-spiral.
  const foodStock = stockOf(planetState.inventory, RESOURCE_FOOD)
  const foodDemand = Math.ceil(totalPop * FOOD_PER_CITIZEN_PER_TICK)
  const foodPerCitizen = totalPop === 0 ? 1 : foodStock / Math.max(1, foodDemand)
  const foodConsumed = Math.min(foodStock, foodDemand)
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

  // PHASE 17.L.D (HOTFIX 2026-05-12, REV 2) — water consumption tick. Previously water never
  // depleted per tick (only via farm input cost), so once a player had 500 water for 1000
  // citizens (waterPerCitizen=0.5 threshold) they were hydrated forever even if every
  // aqueduct burned down. Now each citizen drinks WATER_PER_CITIZEN_PER_TICK (0.02), so 1000
  // pop drains 20 water/tick — matches aqueduct output (~18/tick × 1-2 aqueducts) and forces
  // ongoing water management. applyDehydrationDeaths fires per existing threshold semantics.
  const waterStock = stockOf(planetState.inventory, RESOURCE_WATER)
  const waterDemand = Math.ceil(totalPop * WATER_PER_CITIZEN_PER_TICK)
  const waterPerCitizen = totalPop === 0 ? 1 : waterStock / Math.max(1, waterDemand)
  const waterConsumed = Math.min(waterStock, waterDemand)
  if (waterConsumed > 0)
    planetState.inventory.stocks.set(RESOURCE_WATER, waterStock - waterConsumed)

  if (waterPerCitizen < 0.5) {
    applyDehydrationDeaths({
      tick: state.currentTick,
      population: planetState.population,
      waterPerCitizen,
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
  //
  // PHASE 17.L.D.12 (HOTFIX 2026-05-13) — was `Math.floor(rawAggregate / RESEARCH_POINT_DIVISOR)`
  // pre-floored to integer BEFORE deposit. With 2 starter Labs the rate is
  // 30 raw / 200 = 0.15 per tick → floor = 0 → early-return → pool NEVER GREW. Even 10
  // labs only generated 158/200 = 0.79 → floor 0. Per user verbatim *"major problem the
  // research building isnt generating reasearch points for me at the slow rate it should
  // shows 0 even though i have a bunch of labcoat emoji buildings"*. The `researchPointsPool`
  // field is already typed `number` (float) — it always supported sub-1 deposits, the bug
  // was the gatekeeper before tickResearch. Now we pass the float rate through; the pool
  // accumulates fractional points each tick, hits tier-0's 30pt threshold around tick ~200
  // at 2 starter Labs (~40 sec @ 5Hz tick rate) matching the balance-constants comment's
  // "Tier-0 (30 pts): ~400 ticks = 80 sec wall-clock" intent (the comment math used a
  // pre-bump rate; current rate is roughly 2× that, putting tier-0 at ~40 sec).
  const aggregate = rawAggregate / RESEARCH_POINT_DIVISOR
  if (aggregate <= 0) return
  // PHASE 17.L.D (HOTFIX 2026-05-12, REV 2) — pool-model rewrite. tickResearch now just adds
  // points to empire.researchPointsPool; it never auto-completes a tech (completion happens
  // via purchaseResearchFromPool on player click or AI decision). The completed-event
  // surfacing moved into the AI decision branch (applyDecisions logs purchaseResearch:...)
  // and into the human-side button handler at the call site.
  tickResearch(civState.empire, aggregate)
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

    // PHASE 17.12.6 / 17.12.10 — achievement check at match end. Build inputs from available
    // state + run the shared checkMatchEndAchievements resolver. Newly-unlocked IDs land in
    // achievementUnlocksThisMatch for useMatchSim to persist + the PlayPage toast watcher to
    // surface as gold-tinted notifications. Cross-match cumulative aggregates (themes-played,
    // archetypes-won) deferred to the PHASE 17.0 sign-in shipping — local-only for now.
    const humanCivAtEnd = state.civs.get(state.humanCivId)
    if (humanCivAtEnd) {
      const humanWon = resolution.winningCivId === state.humanCivId
      const wonByLastCiv = humanWon && resolution.resolvedObjectiveId === 'last_civ_standing'
      let enemiesEliminated = 0
      let playedAgainstBrutal = false
      for (const civ of state.civs.values()) {
        if (civ.civId === state.humanCivId) continue
        if (!civ.alive) enemiesEliminated += 1
        if (civ.difficulty === 'brutal') playedAgainstBrutal = true
      }
      let hadFinal = false
      let hadPilgrim1k = false
      let suicideLaunched = 0
      const totalLaunched = humanCivAtEnd.deceptionLedger.colonyShipsLaunched
      for (const flight of state.flights.values()) {
        if (flight.launchingCivId !== state.humanCivId) continue
        const variantStr = String(flight.variantId)
        if (variantStr === 'finalColonyShip') hadFinal = true
        if (variantStr === 'pilgrimVolunteer' && flight.citizensAboard >= 1000) {
          hadPilgrim1k = true
        }
        const suicideVariants = new Set([
          'pilgrimVolunteer',
          'massEvacuation',
          'saboteur',
          'explosive',
          'finalColonyShip',
        ])
        if (suicideVariants.has(variantStr)) suicideLaunched += 1
      }
      const techIdStrings = new Set<string>()
      for (const techId of humanCivAtEnd.empire.researchedTechs) {
        techIdStrings.add(String(techId))
      }
      const unlocked = checkMatchEndAchievements({
        accountId: state.humanCivId as unknown as AccountId,
        civId: state.humanCivId,
        themeId: humanCivAtEnd.themeId,
        matchId: state.matchId,
        atTick: state.currentTick,
        won: humanWon,
        wonByLastCivStanding: wonByLastCiv,
        peakControlledPlanets: humanCivAtEnd.empire.controlledPlanetIds.size,
        apexReachedAtTick: hasWonByTech(humanCivAtEnd.empire)
          ? state.currentTick - state.startedAtTick
          : null,
        enemyCivsEliminated: enemiesEliminated,
        maxDissidentRatioSustained: 0,
        conscriptionCount: humanCivAtEnd.deceptionLedger.citizensConscripted,
        colonyShipsLaunchedTotal: totalLaunched,
        suicideShipsLaunched: suicideLaunched,
        hadFinalColonyShip: hadFinal,
        hadPilgrimWith1000Plus: hadPilgrim1k,
        playedAgainstBrutalAI: playedAgainstBrutal,
        didCoop: false,
        themesPlayedCumulative: 1,
        archetypesWonCumulative: humanWon ? 1 : 0,
        researchedTechs: techIdStrings,
      })
      for (const achId of unlocked) {
        state.achievementUnlocksThisMatch.push(achId)
        const def = ACHIEVEMENTS.find((a) => a.id === achId)
        pushEvent(state, {
          atTick: state.currentTick,
          civId: state.humanCivId,
          kind: 'achievement_unlock',
          message: def ? `🏆 ${def.emoji} ${def.name} — ${def.description}` : `🏆 ${achId}`,
        })
      }
      // PHASE 17.12.7 — Hall of Champions match-end scoring. Reuses the same inputs as the
      // achievement check (peakControlledPlanets / apexReachedAtTick / enemiesEliminated)
      // plus a v1 themeSpecialistScore = peakControlledPlanets × 100 + 1000-on-win bonus.
      // useMatchSim persists matchEndScoresPending into the localStorage HoC store.
      const matchScores = computeMatchScores({
        civId: state.humanCivId,
        themeId: humanCivAtEnd.themeId,
        accountId: state.humanCivId as unknown as AccountId,
        displayName: humanCivAtEnd.displayName,
        handle: humanCivAtEnd.displayName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'player',
        matchId: state.matchId,
        recordedAtTick: state.currentTick,
        peakControlledPlanets: humanCivAtEnd.empire.controlledPlanetIds.size,
        apexReachedAtTick: hasWonByTech(humanCivAtEnd.empire)
          ? state.currentTick - state.startedAtTick
          : null,
        averageDissidentRatio: 0,
        enemyCivsEliminated: enemiesEliminated,
        themeSpecialistScore:
          humanCivAtEnd.empire.controlledPlanetIds.size * 100 + (humanWon ? 1000 : 0),
      })
      for (const scored of matchScores) {
        state.matchEndScoresPending.push(scored)
      }
    }
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
  // PHASE 17.L.D.10 (HOTFIX 2026-05-12) — tech-prereq gate. Per user verbatim *"the tech needs
  // to be figured out ie industiral tech has lumber camp in it and isnt researched but i can
  // fucking buikld a lumber camp without it reserached so wtf?? may figure aout the gating
  // and progression lines"*. placeBuildingCanonical previously validated owner / occupancy /
  // resources but never consulted the tech tree — Lumber Camp / Quarry / Mine / Refinery /
  // Foundry / Factory / Lab / University / etc. all landed without their gating tech researched.
  // Now we look up the building's civ-side empire and consult isBuildingUnlocked (which
  // delegates to TECH_GATED_BUILDINGS + aggregateEffects); buildings the player hasn't
  // researched fail with a "requires X" message naming the gating tech. seedStarterBuildings
  // bypasses this path entirely (direct map mutation) so spawn freebies still grandfather in.
  const civState = state.civs.get(planet.civId)
  if (civState && !isBuildingUnlocked(defId, civState.empire.researchedTechs)) {
    if (!suppressEvents) {
      const gatingTech = unlocksForBuilding(defId)[0]
      const techHint = gatingTech ? ` — research ${gatingTech.emoji} ${gatingTech.name} first` : ''
      pushEvent(state, {
        atTick: state.currentTick,
        civId: planet.civId,
        kind: 'system',
        message: `🔒 Can't build ${def.emoji} ${def.name} — tech locked${techHint}`,
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
  // PHASE 17.L.D.19 (2026-05-13) — record "ever built" for tech-prereq gating.
  // Demolishing the last instance does NOT clear the flag — once you've flown the prototype,
  // the engineering knowledge sticks. Advanced ship-design techs (Orbital Mechanics, Fusion
  // Propulsion, Antimatter) check this set via isTechResearchable.
  if (civState) recordBuildingConstructed(civState.empire, defId)
  if (defId === BLDG_LAUNCH_PAD) {
    // PHASE 17.12.4 — auto-assign per-planet pad ordinal (UMS SETUPMOD wizard equivalent).
    // First pad on the planet gets #1, second #2, etc. UI renders pads as "Pad #N" via the
    // padOrdinal field so the player has a stable human-readable identifier instead of the
    // raw TileId.
    const padOrdinal = planet.launchPads.size + 1
    const pad = newLaunchPad(tile.id, planet.civId, planet.planet.id, false, padOrdinal)
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
  // PHASE 17.13.2 + 17.13.3 + 17.13.11 — Civic Center founds a new settlement. Eligibility
  // gate already enforced above (tile owned + tile empty); the founding-physics gate fires
  // here AFTER the building lands. We carve out the 3-ring radius around the civic center
  // tile, claiming up to a few adjacent owned tiles. Tiles already claimed by another founded
  // settlement stay where they are; the new settlement takes only the unclaimed ones (which
  // implicitly means the Capital relinquishes them). Empty adjacency falls through cleanly —
  // founding still succeeds even when the radius hits the planet edge.
  if (defId === BLDG_CIVIC_CENTER) {
    const claimedByOtherFounded = new Set<TileId>()
    for (const other of planet.settlements.values()) {
      if (other.status === 'capital') continue
      for (const tid of other.controlledTileIds) claimedByOtherFounded.add(tid)
    }
    const eligibility = canFoundSettlementAt({
      civicCenterTileEmpty: false, // tile is now BUILT not empty
      civicCenterTileOwnedByCiv: tile.ownerCivId === planet.civId,
      civicCenterTileAlreadyClaimed: claimedByOtherFounded.has(tile.id),
      nearbyEmptyTileCount: planet.planet.tiles.filter(
        (t) =>
          t.ownerCivId === planet.civId &&
          t.occupancy === 'empty' &&
          !claimedByOtherFounded.has(t.id),
      ).length,
    })
    // The eligibility check above asserts civicCenterTileEmpty:false because we just BUILT
    // on it; we still call the helper for the ownership + claimed-by-other gates. If the
    // gate fails on those, surface the reason and roll back the building placement is too
    // expensive — for v1 we just push a warning event noting the founded settlement is being
    // skipped while the building itself remains as a structural-only marker.
    if (eligibility.ok || eligibility.reason === 'civicCenterTileNotEmpty') {
      const ordinal = planet.nextSettlementOrdinal
      planet.nextSettlementOrdinal += 1
      // PHASE 17.13.3 — 3-ring hex-radius BFS replaces the prior 6-nearest-by-euclidean
      // approximation. Walks tile.neighbors[] (precomputed face-index adjacency) up to 3
      // edges out from the seed; filters to tiles owned by this civ and not already in
      // another founded settlement. The seed (civic-center tile) is included by tilesWithinHexRings
      // so we just gate-filter the rest. Empty adjacency falls through cleanly when the planet
      // edge is hit before ring 3 — fewer than 19 tiles claimed but founding still succeeds.
      const ringTiles = tilesWithinHexRings(tile, planet.planet.tiles, SETTLEMENT_INITIAL_RINGS)
      const claimedIds: TileId[] = []
      for (const t of ringTiles) {
        if (t.id !== tile.id) {
          if (t.ownerCivId !== planet.civId) continue
          if (claimedByOtherFounded.has(t.id)) continue
        }
        claimedIds.push(t.id)
      }
      const owningCiv = state.civs.get(planet.civId)
      const founded = newFoundedSettlement(
        planet.planet.id,
        String(planet.planet.id),
        ordinal,
        tile.id,
        claimedIds,
        state.currentTick,
        owningCiv ? String(owningCiv.themeId) : undefined,
      )
      planet.settlements.set(founded.id, founded)
      // Capital cedes the claimed tiles so the founded settlement owns them exclusively.
      for (const settlement of planet.settlements.values()) {
        if (settlement.status === 'capital') {
          for (const tid of claimedIds) settlement.controlledTileIds.delete(tid)
        }
      }
      pushEvent(state, {
        atTick: state.currentTick,
        civId: planet.civId,
        kind: 'planet_claimed',
        message: `🏛️ ${founded.name} founded on ${String(planet.planet.id)} — ${claimedIds.length} tiles claimed.`,
      })
    } else {
      pushEvent(state, {
        atTick: state.currentTick,
        civId: planet.civId,
        kind: 'system',
        message: `🏛️ Civic Center built but settlement founding skipped (${eligibility.reason ?? 'unknown'}).`,
      })
    }
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

// PHASE 17.13.10 — player rename mutator. SettlementPickerPanel surfaces a rename button per
// settlement; this action looks up the settlement on the named planet and applies the rename
// using the owning civ's themeId so a blank rename restores the themed default. Returns false
// if the planet / settlement is missing or the planet isn't human-owned.
export interface RenameSettlementInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
  readonly settlementId: SettlementId
  readonly newName: string
}

export function renameSettlementAction(inputs: RenameSettlementInputs): boolean {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet || planet.civId !== inputs.state.humanCivId) return false
  const settlement = planet.settlements.get(inputs.settlementId)
  if (!settlement) return false
  const owningCiv = inputs.state.civs.get(planet.civId)
  renameSettlement(settlement, inputs.newName, owningCiv ? String(owningCiv.themeId) : undefined)
  return true
}

// PHASE 17.13.3 — annex action. Player picks an unclaimed-by-this-settlement tile adjacent
// to one of the settlement's existing controlled tiles + spends ANNEX_PROPAGANDA_COST propaganda
// materials to claim it. The tile must be owned by the same civ (already on the planet) and
// adjacent (1 hex-edge) to the active settlement's territory. If another founded settlement
// owned the tile, ownership transfers (the prior settlement loses it). Returns a structured
// result so the UI can render specific failure modes.
export interface AnnexTileInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
  readonly settlementId: SettlementId
  readonly tileId: TileId
}

export interface AnnexTileResult {
  readonly ok: boolean
  readonly reason?:
    | 'planetNotOwned'
    | 'settlementNotFound'
    | 'tileNotFound'
    | 'tileNotOwnedByCiv'
    | 'tileAlreadyInSettlement'
    | 'tileNotAdjacent'
    | 'insufficientPropaganda'
}

export function annexTileAction(inputs: AnnexTileInputs): AnnexTileResult {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet || planet.civId !== inputs.state.humanCivId)
    return { ok: false, reason: 'planetNotOwned' }
  const settlement = planet.settlements.get(inputs.settlementId)
  if (!settlement) return { ok: false, reason: 'settlementNotFound' }
  const tile = planet.planet.tiles.find((t) => t.id === inputs.tileId)
  if (!tile) return { ok: false, reason: 'tileNotFound' }
  if (tile.ownerCivId !== planet.civId) return { ok: false, reason: 'tileNotOwnedByCiv' }
  if (settlement.controlledTileIds.has(tile.id))
    return { ok: false, reason: 'tileAlreadyInSettlement' }
  // Adjacent = at least one of the tile's geodesic neighbors lives in this settlement.
  let adjacent = false
  for (const nIdx of tile.neighbors) {
    const neighbor = planet.planet.tiles[nIdx]
    if (neighbor && settlement.controlledTileIds.has(neighbor.id)) {
      adjacent = true
      break
    }
  }
  if (!adjacent) return { ok: false, reason: 'tileNotAdjacent' }
  if (stockOf(planet.inventory, RESOURCE_PROPAGANDA_MATERIALS) < ANNEX_PROPAGANDA_COST) {
    return { ok: false, reason: 'insufficientPropaganda' }
  }
  // Spend the propaganda + transfer ownership: remove from any prior settlement that held it,
  // add to this settlement. Capital is implicit holder of unclaimed tiles, so removing from
  // capital is the normal path.
  consumeResource(planet.inventory, RESOURCE_PROPAGANDA_MATERIALS, ANNEX_PROPAGANDA_COST)
  for (const other of planet.settlements.values()) {
    if (other.id === settlement.id) continue
    other.controlledTileIds.delete(tile.id)
  }
  settlement.controlledTileIds.add(tile.id)
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: planet.civId,
    kind: 'planet_claimed',
    message: `🏘 ${settlement.name} annexed tile ${String(tile.id)} (${ANNEX_PROPAGANDA_COST} propaganda spent).`,
  })
  return { ok: true }
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

// PHASE 17.L.D.16 (2026-05-13) — demolish action with 100% buildCost refund. Per user
// verbatim *"they need to be able to be recycled even the starting buildings with a easy
// way of deleteing... and demolition/recycle where u get the goods 100% back to your
// stockpile"*. Walks the tile's buildCost from the building's def, returns every unit to
// the planet inventory, clears the tile back to 'empty', decrements buildingsByDef +
// removes the buildingsByTile entry. Special-cases:
//   - LaunchPad: delete the LaunchPad state entry + padId index
//   - MineField: clear the MineField world-position entry
//   - CivicCenter: cannot demolish if the planet only has 1 settlement (would orphan tiles)
// Starter freebies refund their NORMAL buildCost (the freebie path bypassed the deduction,
// so refunding the standard cost is a one-time bonus the player can "cash out" the freebies
// for — acceptable trade since the player chose to demolish their head-start).
export interface DemolishBuildingInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
  readonly tileId: TileId
}

export function demolishBuildingAction(inputs: DemolishBuildingInputs): boolean {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: inputs.state.humanCivId,
      kind: 'system',
      message: `❌ Demolish failed — planet "${String(inputs.planetId)}" not found`,
    })
    return false
  }
  if (planet.civId !== inputs.state.humanCivId) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: inputs.state.humanCivId,
      kind: 'system',
      message: `❌ Can't demolish there — you don't own ${String(inputs.planetId)}`,
    })
    return false
  }
  const tile = planet.planet.tiles.find((t) => t.id === inputs.tileId)
  if (!tile) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: inputs.state.humanCivId,
      kind: 'system',
      message: `❌ Demolish failed — tile not found`,
    })
    return false
  }
  const defId = planet.buildingsByTile.get(tile.id)
  if (!defId) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: inputs.state.humanCivId,
      kind: 'system',
      message: `❌ Nothing to demolish on this tile`,
    })
    return false
  }
  // Refuse to demolish the capital Civic Center if it's the only settlement on the planet
  // (would orphan every other tile + break settlement bookkeeping). Player must found a new
  // settlement first.
  if (defId === BLDG_CIVIC_CENTER) {
    const civicCenters = planet.buildingsByDef.get(BLDG_CIVIC_CENTER) ?? 0
    if (civicCenters <= 1) {
      pushEvent(inputs.state, {
        atTick: inputs.state.currentTick,
        civId: inputs.state.humanCivId,
        kind: 'system',
        message: `❌ Can't demolish the only Civic Center — found another settlement first`,
      })
      return false
    }
  }
  const def = getBuildingDef(defId)
  // Refund 100% of buildCost to the planet inventory.
  for (const cost of def.buildCost) {
    const cur = stockOf(planet.inventory, cost.resource)
    planet.inventory.stocks.set(cost.resource, cur + cost.amount)
  }
  // Clean up per-building-type side state.
  if (defId === BLDG_LAUNCH_PAD) {
    planet.launchPads.delete(tile.id)
    inputs.state.padIdToPlanetIdIndex.delete(tile.id)
  }
  if (defId === BLDG_MINE_FIELD) {
    planet.mineFields = planet.mineFields.filter((mf) => {
      // Remove the mine field whose world position matches this tile's centroid.
      const tileWorldX = planet.planet.position.x + tile.centroid.x
      const tileWorldY = planet.planet.position.y + tile.centroid.y
      const tileWorldZ = planet.planet.position.z + tile.centroid.z
      const dx = mf.position.x - tileWorldX
      const dy = mf.position.y - tileWorldY
      const dz = mf.position.z - tileWorldZ
      return Math.hypot(dx, dy, dz) > 1
    })
  }
  // Decrement counts + clear tile.
  planet.buildingsByDef.set(defId, Math.max(0, (planet.buildingsByDef.get(defId) ?? 0) - 1))
  planet.buildingsByTile.delete(tile.id)
  tile.occupancy = 'empty'
  // Also clear the outpost build-progress counter if this was a mining outpost so a future
  // outpost on the same tile doesn't inherit the timer.
  planet.outpostBuildTicks.delete(tile.id)
  const refundSummary = def.buildCost.map((c) => `+${c.amount} ${String(c.resource)}`).join(', ')
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: planet.civId,
    kind: 'system',
    message: `🔨 Demolished ${def.emoji} ${def.name} — refunded ${refundSummary || 'nothing'}`,
  })
  return true
}

export interface StartResearchInputs {
  readonly state: MatchState
  readonly techId: string
}

// PHASE 17.L.D (HOTFIX 2026-05-12, REV 2) — startResearchAction renamed in spirit: this
// is now the BUY action under the pool-currency model. Checks researchable + pool >= cost,
// deducts cost from pool, completes tech instantly. Returns false if locked or unaffordable.
// Pushes a 'research' event into the state log on success so the player gets a toast.
export function startResearchAction(inputs: StartResearchInputs): boolean {
  const civState = inputs.state.civs.get(inputs.state.humanCivId)
  if (!civState) return false
  const ok = purchaseResearchFromPool(civState.empire, inputs.techId as never)
  if (ok) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: civState.civId,
      kind: 'research',
      message: `${civState.theme.emoji} ${civState.displayName} researched a new tech.`,
    })
  }
  return ok
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

// PHASE 17.L.A.12 — Q11 LOCKED. Player-facing actions for quotas + buildingModes. UI surface
// is the QuotasPanel sliders + per-building dropdown. Both mutate the named planet's state
// in-place; setTickCount in useMatchSim picks up the change via the standard tickCount bump.
export interface SetPlanetQuotaInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
  readonly resource: ResourceId
  // Pass 0 (or any non-positive) to clear the quota for this resource. Otherwise stores the
  // target stockpile. The production tick reads this map directly.
  readonly target: number
}

export function setPlanetQuotaAction(inputs: SetPlanetQuotaInputs): boolean {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet || planet.civId !== inputs.state.humanCivId) return false
  if (inputs.target <= 0) {
    planet.quotas.delete(inputs.resource)
  } else {
    planet.quotas.set(inputs.resource, Math.floor(inputs.target))
  }
  return true
}

export interface SetBuildingModeInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
  readonly buildingDefId: BuildingDefId
  // 'auto' clears the entry (effective default); 'paused' / 'disassembly' stores it.
  readonly mode: BuildingProductionMode
}

export function setBuildingModeAction(inputs: SetBuildingModeInputs): boolean {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet || planet.civId !== inputs.state.humanCivId) return false
  if (inputs.mode === 'auto') {
    planet.buildingModes.delete(inputs.buildingDefId)
  } else {
    planet.buildingModes.set(inputs.buildingDefId, inputs.mode)
  }
  return true
}

// PHASE 17.L.A.11 — Q5 PHASE 17 LOCKED "all three yes" — switch a mining ship's mode at
// runtime. Active flights snap to the new mode on the next DOCKED→OUTBOUND boundary so the
// current cycle doesn't get interrupted. Returns true if the mode actually changed; false
// when the ship is foreign-owned or already in that mode.
export interface SetMiningShipModeInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
  readonly shipId: string
  readonly mode: MiningShipMode
}

export function setMiningShipModeAction(inputs: SetMiningShipModeInputs): boolean {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet || planet.civId !== inputs.state.humanCivId) return false
  const ship = planet.miningShips.get(inputs.shipId)
  if (!ship) return false
  return setMiningShipMode(ship, inputs.mode)
}

// PHASE 17.L.C.4 — per-planet inventory capacity upgrade. Validates planet ownership + the
// player's current tier headroom + can-afford on cost. Costs scale exponentially per tier so
// each successive upgrade is a real strategic commitment. Returns { ok, reason } so the UI can
// surface why an upgrade failed (already maxed / insufficient resources).
export interface UpgradePlanetCapacityInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
}

export interface UpgradePlanetCapacityResult {
  readonly ok: boolean
  readonly newTier?: number
  readonly reason?: string
}

export function upgradePlanetCapacityAction(
  inputs: UpgradePlanetCapacityInputs,
): UpgradePlanetCapacityResult {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet || planet.civId !== inputs.state.humanCivId) {
    return { ok: false, reason: 'planet not owned' }
  }
  if (planet.inventoryCapacityTier >= MAX_INVENTORY_CAPACITY_TIER) {
    return { ok: false, reason: 'already at max capacity tier' }
  }
  const cost = getInventoryCapacityUpgradeCost(planet.inventoryCapacityTier)
  const paid = tryConsumeAll(planet.inventory, cost)
  if (!paid) {
    return { ok: false, reason: 'insufficient resources' }
  }
  planet.inventoryCapacityTier += 1
  return { ok: true, newTier: planet.inventoryCapacityTier }
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

// PHASE 17.12.3 — manual indigenous parley. Player burns 50 propaganda materials from the
// host planet's inventory to bypass the 60-tick auto-trigger and force an immediate parley
// attempt. Same `attemptIndigenousParley` resolver as the auto path, but the player gets a
// boosted propaganda-power input (representing the concentrated diplomatic effort) so manual
// parleys land more reliably than the trickle-feed auto-trigger.
export interface ManualParleyInputs {
  readonly state: MatchState
  readonly planetId: PlanetId
}

export interface ManualParleyResult {
  readonly ok: boolean
  readonly accepted: boolean
  readonly defectingTileCount: number
  readonly reason?: string
}

const MANUAL_PARLEY_PROPAGANDA_COST = 50
const MANUAL_PARLEY_BOOSTED_POWER = 0.7

export function manualIndigenousParleyAction(inputs: ManualParleyInputs): ManualParleyResult {
  const planet = inputs.state.planets.get(inputs.planetId)
  if (!planet) return { ok: false, accepted: false, defectingTileCount: 0, reason: 'no planet' }
  if (planet.civId !== inputs.state.humanCivId) {
    return { ok: false, accepted: false, defectingTileCount: 0, reason: 'planet not owned' }
  }
  if (!planet.indigenousCivId) {
    return {
      ok: false,
      accepted: false,
      defectingTileCount: 0,
      reason: 'no indigenous presence',
    }
  }
  const indig = inputs.state.indigenousCivs.get(planet.indigenousCivId)
  if (!indig || !indig.alive) {
    return {
      ok: false,
      accepted: false,
      defectingTileCount: 0,
      reason: 'indigenous already cleared',
    }
  }
  const have = stockOf(planet.inventory, RESOURCE_PROPAGANDA_MATERIALS)
  if (have < MANUAL_PARLEY_PROPAGANDA_COST) {
    return {
      ok: false,
      accepted: false,
      defectingTileCount: 0,
      reason: `need ${MANUAL_PARLEY_PROPAGANDA_COST} propaganda materials (have ${have})`,
    }
  }
  consumeResource(planet.inventory, RESOURCE_PROPAGANDA_MATERIALS, MANUAL_PARLEY_PROPAGANDA_COST)
  const result = attemptIndigenousParley({
    indig,
    currentTick: inputs.state.currentTick,
    propagandaPower: MANUAL_PARLEY_BOOSTED_POWER,
  })
  if (result.accepted && result.defectingTiles.length > 0) {
    for (const tid of result.defectingTiles) {
      const tile = planet.planet.tiles.find((t) => t.id === tid)
      if (tile) tile.ownerCivId = indig.hostHumanCivId
    }
    if (!indig.alive) {
      const loot = indigenousLootOnDefeat(indig)
      const cur = stockOf(planet.inventory, RESOURCE_INGOTS)
      planet.inventory.stocks.set(RESOURCE_INGOTS, cur + loot.resourceBonus)
      pushEvent(inputs.state, {
        atTick: inputs.state.currentTick,
        civId: indig.hostHumanCivId,
        kind: 'indigenous',
        message: `${indig.emoji} ${indig.displayName} fully assimilated via manual parley. +${loot.resourceBonus} ingots looted.`,
      })
    } else {
      pushEvent(inputs.state, {
        atTick: inputs.state.currentTick,
        civId: indig.hostHumanCivId,
        kind: 'indigenous',
        message: `${indig.emoji} ${indig.displayName} ceded ${result.defectingTiles.length} tile(s) via manual parley.`,
      })
    }
  } else {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: indig.hostHumanCivId,
      kind: 'indigenous',
      message: `${indig.emoji} ${indig.displayName} refused the manual parley (50 propaganda spent).`,
    })
  }
  return {
    ok: true,
    accepted: result.accepted,
    defectingTileCount: result.defectingTiles.length,
  }
}

// PHASE 17.13.7 — inter-planet caravan trade. Validates ownership of both planets, available
// resource amount on source, fuel cost (CARAVAN_FUEL_COST from source), and the per-civ
// active-caravan cap. On success creates a new Caravan + appends to the civ's caravan list.
// Caller (useMatchSim) bumps tickCount so panels re-render.
export interface CreateCaravanActionInputs {
  readonly state: MatchState
  readonly fromPlanetId: PlanetId
  readonly toPlanetId: PlanetId
  readonly resource: ResourceId
  readonly amount: number
}

export interface CreateCaravanActionResult {
  readonly ok: boolean
  readonly caravanId?: string
  readonly reason?: string
}

export function createCaravanAction(inputs: CreateCaravanActionInputs): CreateCaravanActionResult {
  const fromPlanet = inputs.state.planets.get(inputs.fromPlanetId)
  const toPlanet = inputs.state.planets.get(inputs.toPlanetId)
  if (!fromPlanet || !toPlanet) {
    return { ok: false, reason: 'unknown planet' }
  }
  if (fromPlanet.civId !== inputs.state.humanCivId) {
    return { ok: false, reason: 'source planet not owned' }
  }
  // PHASE 18.5 — destination civ gate via diplomacy resolver. Allows the same intra-empire
  // trade as before (humanCiv → humanCiv tested via canTradeBetweenCivs returning 'self') AND
  // newly allows trade to ANY coop ally's planet. Hostile / neutral destinations rejected.
  const indigenousCivIdSet = new Set(inputs.state.indigenousCivs.keys())
  if (
    !canTradeBetweenCivs(
      inputs.state.humanCivId,
      toPlanet.civId,
      inputs.state.alliances,
      indigenousCivIdSet,
    )
  ) {
    return { ok: false, reason: 'destination civ is not an ally — trade gate denies' }
  }
  if (inputs.fromPlanetId === inputs.toPlanetId) {
    return { ok: false, reason: 'source and destination must differ' }
  }
  const requestAmount = Math.min(Math.max(1, Math.floor(inputs.amount)), CARAVAN_MAX_AMOUNT_PER_RUN)
  // Per-civ active-caravan cap check uses the existing civ caravan list.
  const civCaravans = inputs.state.caravans.get(inputs.state.humanCivId) ?? []
  if (countActiveCaravans(civCaravans) >= MAX_ACTIVE_CARAVANS_PER_CIV) {
    return {
      ok: false,
      reason: `civ at max active caravan cap (${MAX_ACTIVE_CARAVANS_PER_CIV})`,
    }
  }
  // Resource availability — source planet must have the requested amount AND the fuel cost.
  const haveResource = stockOf(fromPlanet.inventory, inputs.resource)
  if (haveResource < requestAmount) {
    return {
      ok: false,
      reason: `source planet has ${haveResource} ${String(inputs.resource)} (need ${requestAmount})`,
    }
  }
  const haveFuel = stockOf(fromPlanet.inventory, RESOURCE_FUEL)
  if (haveFuel < CARAVAN_FUEL_COST) {
    return {
      ok: false,
      reason: `source planet has ${haveFuel} fuel (need ${CARAVAN_FUEL_COST})`,
    }
  }
  // Pay costs.
  consumeResource(fromPlanet.inventory, inputs.resource, requestAmount)
  consumeResource(fromPlanet.inventory, RESOURCE_FUEL, CARAVAN_FUEL_COST)
  // Build caravan + register.
  const caravan = newCaravan({
    civId: inputs.state.humanCivId,
    fromPlanetId: inputs.fromPlanetId,
    toPlanetId: inputs.toPlanetId,
    fromPlanetPos: fromPlanet.planet.position,
    toPlanetPos: toPlanet.planet.position,
    resource: inputs.resource,
    amount: requestAmount,
    currentTick: inputs.state.currentTick,
    idSeed: inputs.state.nextCaravanSerial,
  })
  inputs.state.nextCaravanSerial += 1
  if (!inputs.state.caravans.has(inputs.state.humanCivId)) {
    inputs.state.caravans.set(inputs.state.humanCivId, [])
  }
  inputs.state.caravans.get(inputs.state.humanCivId)!.push(caravan)
  pushEvent(inputs.state, {
    atTick: inputs.state.currentTick,
    civId: inputs.state.humanCivId,
    kind: 'launch',
    message: `🛒 Caravan dispatched ${String(inputs.fromPlanetId)} → ${String(inputs.toPlanetId)} carrying ${requestAmount} ${String(inputs.resource)} (ETA ${caravan.totalTicks}t).`,
  })
  return { ok: true, caravanId: caravan.id }
}

// PHASE 17.13.7 — cancel an OUTBOUND caravan mid-flight. Cargo is lost on cancel (v1
// simplification). Returns success when the caravan was actually OUTBOUND + transitioned.
export interface CancelCaravanActionInputs {
  readonly state: MatchState
  readonly caravanId: string
}

export function cancelCaravanAction(inputs: CancelCaravanActionInputs): boolean {
  const civCaravans = inputs.state.caravans.get(inputs.state.humanCivId)
  if (!civCaravans) return false
  const caravan = civCaravans.find((c) => c.id === inputs.caravanId)
  if (!caravan) return false
  const ok = cancelCaravan(caravan)
  if (ok) {
    pushEvent(inputs.state, {
      atTick: inputs.state.currentTick,
      civId: inputs.state.humanCivId,
      kind: 'launch',
      message: `🛒 Caravan ${caravan.id} cancelled mid-route — cargo lost (${caravan.amount} ${String(caravan.resource)}).`,
    })
  }
  return ok
}

// PHASE 17.13.7 — per-civ caravan tick. Called every match tick from tickMatch's planet loop.
// Progresses every OUTBOUND caravan one tick; on arrival deposits cargo to the destination
// planet's inventory + emits a delivery event. Drains DELIVERED + CANCELLED caravans from the
// active list after a short retention window so the UI can flash their final state once before
// they disappear.
const CARAVAN_TERMINAL_RETENTION_TICKS = 30

export function tickCaravansForAllCivs(state: MatchState): void {
  for (const [civId, civCaravans] of state.caravans) {
    if (civCaravans.length === 0) continue
    // Mutate in place — we tick every entry then GC terminal ones via filter.
    for (const caravan of civCaravans) {
      const result = tickCaravan(caravan)
      if (result.arrived) {
        const destPlanet = state.planets.get(caravan.toPlanetId)
        if (destPlanet && destPlanet.civId === civId) {
          // Deposit cargo. Capacity caps apply on the next production tick via
          // enforceCapacityCaps; v1 doesn't pre-clamp deliveries to spare the UI from
          // "your shipment overflowed" toasts mid-flight.
          const before = stockOf(destPlanet.inventory, caravan.resource)
          destPlanet.inventory.stocks.set(caravan.resource, before + caravan.amount)
          pushEvent(state, {
            atTick: state.currentTick,
            civId,
            kind: 'launch',
            message: `🛒 Caravan delivered ${caravan.amount} ${String(caravan.resource)} to ${String(caravan.toPlanetId)}.`,
          })
        } else {
          // Destination lost to another civ mid-route — cargo confiscated. Future polish:
          // hand cargo to the new owner as a "trade-route ambush" loot drop.
          pushEvent(state, {
            atTick: state.currentTick,
            civId,
            kind: 'crash',
            message: `🛒 Caravan to ${String(caravan.toPlanetId)} arrived but the planet changed hands — cargo lost.`,
          })
          caravan.status = 'CANCELLED'
        }
      }
    }
    // GC terminal caravans past the retention window.
    const filtered = civCaravans.filter((c) => {
      if (c.status === 'OUTBOUND') return true
      const ageSinceLaunch = state.currentTick - c.launchedAtTick
      return ageSinceLaunch < c.totalTicks + CARAVAN_TERMINAL_RETENTION_TICKS
    })
    state.caravans.set(civId, filtered)
  }
}

// PHASE 18.4 — galactic random events dispatcher + effect applicator. tickRandomEvents lives
// in shared/ and handles the spawn rolls + countdown bookkeeping. This wrapper feeds it the
// live civ list + state.activeRandomEvents map + applies the resulting newlySpawned / justFinished
// events to the match log. Per-tick effects (resource deltas, population deltas, research /
// build multipliers) are applied separately in applyActiveRandomEventEffects.
export function tickRandomEventsForAllCivs(state: MatchState): void {
  if (state.randomEventIntensity === 'off' && state.activeRandomEvents.size === 0) return
  const aliveCivIds: CivId[] = []
  for (const civState of state.civs.values()) {
    if (civState.alive) aliveCivIds.push(civState.civId)
  }
  if (aliveCivIds.length === 0) return
  const result = tickRandomEvents({
    currentTick: state.currentTick,
    intensity: state.randomEventIntensity,
    rng: state.rng,
    civIds: aliveCivIds,
    currentByCiv: state.activeRandomEvents,
  })
  for (const fresh of result.newlySpawned) {
    const def = getRandomEventDef(fresh.defId)
    if (!def) continue
    // One-shot effects fire at spawn time.
    const civState = state.civs.get(fresh.civId)
    if (!civState) continue
    const homePlanet = state.planets.get(civState.homePlanetId)
    if (homePlanet) {
      if (def.oneShotGrant) {
        for (const grant of def.oneShotGrant) {
          const before = stockOf(homePlanet.inventory, grant.resource)
          homePlanet.inventory.stocks.set(grant.resource, before + grant.amount)
        }
      }
      if (def.oneShotLoss) {
        for (const loss of def.oneShotLoss) {
          const before = stockOf(homePlanet.inventory, loss.resource)
          homePlanet.inventory.stocks.set(loss.resource, Math.max(0, before - loss.amount))
        }
      }
      if (def.populationDelta && def.populationDelta !== 0) {
        // PHASE 18.4 — population deltas land on tier 1 (workers — bulk of population + the
        // base of every other tier). Negative clamps at 0; positive grows the worker base.
        const t1 = homePlanet.population.tierCounts[1]
        homePlanet.population.tierCounts[1] = Math.max(0, Math.floor(t1 + def.populationDelta))
      }
    }
    pushEvent(state, {
      atTick: state.currentTick,
      civId: fresh.civId,
      kind: 'random_event',
      message: `${def.emoji} ${def.title} — ${def.description}`,
    })
  }
  for (const finished of result.justFinished) {
    const def = getRandomEventDef(finished.defId)
    if (!def) continue
    if (def.durationTicks === 0) continue // instant events don't get a "concluded" follow-up
    pushEvent(state, {
      atTick: state.currentTick,
      civId: finished.civId,
      kind: 'random_event',
      message: `${def.emoji} ${def.title} concluded after ${def.durationTicks} ticks.`,
    })
  }
}

// PHASE 18.4 — apply per-tick effects of every active event. Walks state.activeRandomEvents
// and applies resourceDeltaPerTick + populationDeltaPerTick to each affected civ's home planet.
// Research / build multipliers are surfaced via getRandomEventMultipliers helpers below — those
// are read by tickCivResearch / build paths.
export function applyActiveRandomEventEffects(state: MatchState): void {
  for (const [civId, events] of state.activeRandomEvents) {
    if (events.length === 0) continue
    const civState = state.civs.get(civId)
    if (!civState) continue
    const homePlanet = state.planets.get(civState.homePlanetId)
    if (!homePlanet) continue
    for (const evt of events) {
      const def = getRandomEventDef(evt.defId)
      if (!def) continue
      if (def.resourceDeltaPerTick) {
        for (const d of def.resourceDeltaPerTick) {
          const before = stockOf(homePlanet.inventory, d.resource)
          homePlanet.inventory.stocks.set(d.resource, Math.max(0, before + d.delta))
        }
      }
      if (def.populationDeltaPerTick && def.populationDeltaPerTick !== 0) {
        const t1 = homePlanet.population.tierCounts[1]
        homePlanet.population.tierCounts[1] = Math.max(
          0,
          Math.floor(t1 + def.populationDeltaPerTick),
        )
      }
    }
  }
}

// PHASE 18.4 — convenience getter for civ-wide research-speed multiplier from active events.
// Multiplicative across multiple events (e.g. supernova + breakthrough laboratory stack).
// Defaults to 1.0 (no change) when no active events on the civ.
export function getCivResearchSpeedMultiplier(state: MatchState, civId: CivId): number {
  const events = state.activeRandomEvents.get(civId)
  if (!events || events.length === 0) return 1
  let mult = 1
  for (const evt of events) {
    const def = getRandomEventDef(evt.defId)
    if (def?.researchSpeedMultiplier) mult *= def.researchSpeedMultiplier
  }
  return mult
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
