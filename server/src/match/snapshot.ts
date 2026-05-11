import { type CivId, type PlanetId } from '@smol/shared'
import { type MatchState, type PerCivState, type PerPlanetState } from './MatchState'

export interface MatchSnapshot {
  readonly matchId: string
  readonly seed: number
  readonly currentTick: number
  readonly startedAtTick: number | null
  readonly endedAtTick: number | null
  readonly winningCivId: CivId | null
  readonly civs: ReadonlyArray<SnapshotCiv>
  readonly planets: ReadonlyArray<SnapshotPlanet>
  readonly flightIds: ReadonlyArray<string>
}

export interface SnapshotCiv {
  readonly civId: CivId
  readonly themeId: string
  readonly displayName: string
  readonly isHuman: boolean
  readonly alive: boolean
  readonly disconnected: boolean
  readonly takenOverByAI: boolean
  readonly researchedTechs: ReadonlyArray<string>
  readonly activeResearchTechId: string | null
  readonly controlledPlanetIds: ReadonlyArray<PlanetId>
  readonly defeatedCivIds: ReadonlyArray<CivId>
  readonly capturedPlanetIds: ReadonlyArray<PlanetId>
  readonly ancientTechCount: number
}

export interface SnapshotPlanet {
  readonly planetId: PlanetId
  readonly ownerCivId: CivId | null
  readonly totalPopulation: number
  readonly factionLoyal: number
  readonly factionSkeptic: number
  readonly factionDissident: number
  readonly stocks: ReadonlyArray<{ resourceId: string; amount: number }>
}

export function captureSnapshot(state: MatchState): MatchSnapshot {
  const civs: SnapshotCiv[] = []
  for (const civ of state.civs.values()) {
    civs.push(snapshotCiv(civ))
  }
  const planets: SnapshotPlanet[] = []
  for (const ps of state.planetStates.values()) {
    planets.push(snapshotPlanet(ps))
  }
  return {
    matchId: state.matchId,
    seed: state.seed,
    currentTick: state.currentTick,
    startedAtTick: state.startedAtTick,
    endedAtTick: state.endedAtTick,
    winningCivId: state.winningCivId,
    civs,
    planets,
    flightIds: Array.from(state.flights.keys()),
  }
}

function snapshotCiv(civ: PerCivState): SnapshotCiv {
  return {
    civId: civ.assignment.civId,
    themeId: civ.assignment.themeId as unknown as string,
    displayName: civ.assignment.displayName,
    isHuman: civ.assignment.isHuman,
    alive: civ.alive,
    disconnected: civ.disconnected,
    takenOverByAI: civ.takenOverByAI,
    researchedTechs: Array.from(civ.empire.researchedTechs).map((t) => t as unknown as string),
    activeResearchTechId: civ.empire.activeResearchTechId
      ? (civ.empire.activeResearchTechId as unknown as string)
      : null,
    controlledPlanetIds: Array.from(civ.empire.controlledPlanetIds),
    defeatedCivIds: Array.from(civ.empire.defeatedCivIds),
    capturedPlanetIds: Array.from(civ.empire.capturedPlanetIds),
    ancientTechCount: civ.empire.ancientTechCount,
  }
}

function snapshotPlanet(ps: PerPlanetState): SnapshotPlanet {
  const stocks: { resourceId: string; amount: number }[] = []
  for (const [resourceId, amount] of ps.inventory.stocks) {
    stocks.push({ resourceId: resourceId as unknown as string, amount })
  }
  return {
    planetId: ps.planet.id,
    ownerCivId: ps.ownerCivId,
    totalPopulation: ps.totalPopulation,
    factionLoyal: ps.faction.loyal,
    factionSkeptic: ps.faction.skeptic,
    factionDissident: ps.faction.dissident,
    stocks,
  }
}

export interface SnapshotStore {
  save(snapshot: MatchSnapshot): void
  load(matchId: string): MatchSnapshot | null
  list(): ReadonlyArray<{ matchId: string; tick: number }>
  clear(matchId: string): void
}

export class InMemorySnapshotStore implements SnapshotStore {
  private readonly snapshots = new Map<string, MatchSnapshot>()

  save(snapshot: MatchSnapshot): void {
    this.snapshots.set(snapshot.matchId, snapshot)
  }

  load(matchId: string): MatchSnapshot | null {
    return this.snapshots.get(matchId) ?? null
  }

  list(): ReadonlyArray<{ matchId: string; tick: number }> {
    return Array.from(this.snapshots.values()).map((s) => ({
      matchId: s.matchId,
      tick: s.currentTick,
    }))
  }

  clear(matchId: string): void {
    this.snapshots.delete(matchId)
  }
}
