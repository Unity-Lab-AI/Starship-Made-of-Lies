import {
  type CivId,
  type ColonyShipFlight,
  type DeathLedger,
  type Empire,
  type FactionSplit,
  type Galaxy,
  type IndigenousCiv,
  type LaunchPad,
  type LootDrop,
  type LootDropId,
  type PlanetBeacon,
  type PlanetId,
  type PlanetInventory,
  type Planet,
  type Theme,
  type ThemeId,
  type TileId,
  generateGalaxy,
  getTheme,
  getThemePolish,
  newDeathLedger,
  newDeceptionLedger,
  newEmpire,
  newFactionSplit,
  newPlanetBeacon,
  newPlanetInventory,
  spawnIndigenousCiv,
  type DeceptionLedger,
  RESOURCE_FOOD,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_PLANKS,
  RESOURCE_PROPAGANDA_MATERIALS,
} from '@smol/shared'

export interface CivAssignment {
  readonly civId: CivId
  readonly themeId: ThemeId
  readonly startingPlanetId: PlanetId
  readonly displayName: string
  readonly isHuman: boolean
}

export interface PerPlanetState {
  readonly planet: Planet
  inventory: PlanetInventory
  faction: FactionSplit
  beacon: PlanetBeacon
  totalPopulation: number
  ownerCivId: CivId | null
}

export interface PerCivState {
  readonly assignment: CivAssignment
  readonly empire: Empire
  readonly theme: Theme
  ledger: DeceptionLedger
  deaths: DeathLedger
  launchPads: Map<TileId, LaunchPad>
  alive: boolean
  disconnected: boolean
  takenOverByAI: boolean
  lastHopeEvacTriggered: boolean
}

export interface MatchState {
  readonly matchId: string
  readonly seed: number
  readonly galaxy: Galaxy
  readonly civs: Map<CivId, PerCivState>
  readonly planetStates: Map<PlanetId, PerPlanetState>
  readonly flights: Map<string, ColonyShipFlight>
  readonly lootDrops: Map<LootDropId, LootDrop>
  readonly indigenousCivs: Map<CivId, IndigenousCiv>
  currentTick: number
  startedAtTick: number | null
  endedAtTick: number | null
  winningCivId: CivId | null
}

export interface NewMatchStateInputs {
  readonly matchId: string
  readonly seed: number
  readonly planetCount: number
  readonly civAssignments: ReadonlyArray<CivAssignment>
}

export function newMatchState(inputs: NewMatchStateInputs): MatchState {
  const galaxy = generateGalaxy({ seed: inputs.seed, planetCount: inputs.planetCount })
  const planetStates = new Map<PlanetId, PerPlanetState>()
  for (const planet of galaxy.planets) {
    planetStates.set(planet.id, {
      planet,
      inventory: newPlanetInventory(planet.id),
      faction: newFactionSplit(0),
      beacon: newPlanetBeacon(planet.id, inputs.civAssignments[0]?.civId ?? ('' as CivId)),
      totalPopulation: 0,
      ownerCivId: null,
    })
  }

  const civs = new Map<CivId, PerCivState>()
  const indigenousCivs = new Map<CivId, IndigenousCiv>()
  const indigRng = mulberryFromSeed(inputs.seed + 0x9e37)
  for (const assignment of inputs.civAssignments) {
    const empire = newEmpire(assignment.civId, assignment.startingPlanetId)
    const theme = getTheme(assignment.themeId)
    const ledger = newDeceptionLedger()
    civs.set(assignment.civId, {
      assignment,
      empire,
      theme,
      ledger,
      deaths: newDeathLedger(assignment.civId),
      launchPads: new Map<TileId, LaunchPad>(),
      alive: true,
      disconnected: false,
      takenOverByAI: false,
      lastHopeEvacTriggered: false,
    })
    seedStartingPlanet(planetStates, assignment)

    const polish = getThemePolish(assignment.themeId)
    const homePlanetState = planetStates.get(assignment.startingPlanetId)
    if (homePlanetState) {
      const indig = spawnIndigenousCiv({
        hostHumanCivId: assignment.civId,
        homePlanet: homePlanetState.planet,
        hostility: polish.homeIndigenousHostility,
        themeName: theme.name,
        rng: indigRng,
      })
      if (indig) indigenousCivs.set(indig.civId, indig)
    }
  }

  return {
    matchId: inputs.matchId,
    seed: inputs.seed,
    galaxy,
    civs,
    planetStates,
    flights: new Map(),
    lootDrops: new Map(),
    indigenousCivs,
    currentTick: 0,
    startedAtTick: null,
    endedAtTick: null,
    winningCivId: null,
  }
}

function mulberryFromSeed(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedStartingPlanet(
  planetStates: Map<PlanetId, PerPlanetState>,
  assignment: CivAssignment,
): void {
  const state = planetStates.get(assignment.startingPlanetId)
  if (!state) return
  state.ownerCivId = assignment.civId
  state.beacon = newPlanetBeacon(state.planet.id, assignment.civId)
  state.totalPopulation = 1000
  state.faction = newFactionSplit(1000)
  const inv = state.inventory
  inv.stocks.set(RESOURCE_FOOD, 1200)
  inv.stocks.set(RESOURCE_PLANKS, 300)
  inv.stocks.set(RESOURCE_METALS, 500)
  inv.stocks.set(RESOURCE_INGOTS, 200)
  inv.stocks.set(RESOURCE_PROPAGANDA_MATERIALS, 60)
}

export function aliveCivs(state: MatchState): ReadonlyArray<PerCivState> {
  const out: PerCivState[] = []
  for (const civ of state.civs.values()) {
    if (civ.alive) out.push(civ)
  }
  return out
}

export function controlledPlanetsByCiv(state: MatchState): Map<CivId, PlanetId[]> {
  const out = new Map<CivId, PlanetId[]>()
  for (const civ of state.civs.values()) {
    out.set(civ.assignment.civId, [])
  }
  for (const ps of state.planetStates.values()) {
    if (ps.ownerCivId) {
      const arr = out.get(ps.ownerCivId)
      if (arr) arr.push(ps.planet.id)
    }
  }
  return out
}

export function recordCivEliminated(state: MatchState, defeatedCivId: CivId): void {
  const civ = state.civs.get(defeatedCivId)
  if (!civ) return
  civ.alive = false
  for (const ps of state.planetStates.values()) {
    if (ps.ownerCivId === defeatedCivId) ps.ownerCivId = null
  }
}

export function transferPlanetOwnership(
  state: MatchState,
  planetId: PlanetId,
  newOwnerCivId: CivId,
): CivId | null {
  const ps = state.planetStates.get(planetId)
  if (!ps) return null
  const prior = ps.ownerCivId
  ps.ownerCivId = newOwnerCivId
  return prior
}

export function getPerCiv(state: MatchState, civId: CivId): PerCivState | null {
  return state.civs.get(civId) ?? null
}

export function getPlanetState(state: MatchState, planetId: PlanetId): PerPlanetState | null {
  return state.planetStates.get(planetId) ?? null
}
