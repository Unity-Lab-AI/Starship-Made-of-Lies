import { type CivId, type PlanetId, type ResourceId, type TileId } from '../types/index'
import { type Planet } from '../gen/planet'
import { type ColonyShipFlight, flightDef } from './colony-ship-flight'
import { type Tile } from './tile'
import { addResource, newPlanetInventory, type PlanetInventory } from './inventory'
import { newPlanetPopulation, type PlanetPopulation } from './population'
import { RESOURCE_FOOD, RESOURCE_FUEL, RESOURCE_INGOTS, RESOURCE_PLANKS } from './resources'

export const VULNERABILITY_WINDOW_TICKS = 30

export interface LandingSite {
  readonly tileId: TileId
  readonly planetId: PlanetId
  readonly intra: boolean
}

export type LandingSelectionMode = 'player-pick' | 'random-empty' | 'random-target-zone'

export interface LandingSelectionInputs {
  readonly planet: Planet
  readonly mode: LandingSelectionMode
  readonly preferredTileId?: TileId
  readonly rng?: () => number
}

export function selectLandingSite(inputs: LandingSelectionInputs): LandingSite | null {
  if (inputs.mode === 'player-pick' && inputs.preferredTileId) {
    const tile = inputs.planet.tiles.find((t) => t.id === inputs.preferredTileId)
    if (tile && tile.occupancy === 'empty') {
      return { tileId: tile.id, planetId: inputs.planet.id, intra: false }
    }
    return null
  }
  const empty = inputs.planet.tiles.filter((t) => t.occupancy === 'empty')
  if (empty.length === 0) return null
  const rng = inputs.rng ?? Math.random
  const idx = Math.floor(rng() * empty.length)
  const tile = empty[idx]
  if (!tile) return null
  return { tileId: tile.id, planetId: inputs.planet.id, intra: false }
}

export interface ColonyBootstrap {
  readonly newOwnerCivId: CivId
  readonly planetId: PlanetId
  readonly population: PlanetPopulation
  readonly inventory: PlanetInventory
  readonly vulnerableUntilTick: number
  readonly seedTile: Tile
}

export interface BootstrapInputs {
  readonly flight: ColonyShipFlight
  readonly site: LandingSite
  readonly seedTile: Tile
  readonly currentTick: number
  readonly extraStartingResources?: ReadonlyArray<{ resource: ResourceId; amount: number }>
}

export function bootstrapColonyOnLanding(inputs: BootstrapInputs): ColonyBootstrap {
  const def = flightDef(inputs.flight)
  const civId = inputs.flight.launchingCivId
  const planetId = inputs.site.planetId
  const initialPopulation = Math.max(0, inputs.flight.citizensAboard)
  const population = newPlanetPopulation(planetId, civId, initialPopulation)
  const inventory = newPlanetInventory(planetId)

  const cargoUnits = def.payload.cargoCapacity
  if (cargoUnits > 0) {
    addResource(inventory, RESOURCE_INGOTS, Math.round(cargoUnits * 0.4))
    addResource(inventory, RESOURCE_PLANKS, Math.round(cargoUnits * 0.3))
    addResource(inventory, RESOURCE_FOOD, Math.round(cargoUnits * 0.2))
    addResource(inventory, RESOURCE_FUEL, Math.round(cargoUnits * 0.1))
  }
  if (inputs.extraStartingResources) {
    for (const { resource, amount } of inputs.extraStartingResources) {
      if (amount > 0) addResource(inventory, resource, amount)
    }
  }

  inputs.seedTile.ownerCivId = civId

  return {
    newOwnerCivId: civId,
    planetId,
    population,
    inventory,
    vulnerableUntilTick: inputs.currentTick + VULNERABILITY_WINDOW_TICKS,
    seedTile: inputs.seedTile,
  }
}

export function isVulnerable(bootstrap: ColonyBootstrap, currentTick: number): boolean {
  return currentTick < bootstrap.vulnerableUntilTick
}

export interface IntraPlanetLandingInputs {
  readonly planet: Planet
  readonly fromTileId: TileId
  readonly toTileId: TileId
  readonly civId: CivId
}

export interface IntraPlanetLandingResult {
  readonly success: boolean
  readonly seedTile: Tile | null
  readonly reason?: 'invalid-tile' | 'tile-occupied' | 'wrong-civ'
}

export function attemptIntraPlanetForwardBase(
  inputs: IntraPlanetLandingInputs,
): IntraPlanetLandingResult {
  const fromTile = inputs.planet.tiles.find((t) => t.id === inputs.fromTileId)
  const toTile = inputs.planet.tiles.find((t) => t.id === inputs.toTileId)
  if (!fromTile || !toTile) return { success: false, seedTile: null, reason: 'invalid-tile' }
  if (toTile.occupancy !== 'empty')
    return { success: false, seedTile: null, reason: 'tile-occupied' }
  if (fromTile.ownerCivId !== inputs.civId)
    return { success: false, seedTile: null, reason: 'wrong-civ' }
  toTile.ownerCivId = inputs.civId
  return { success: true, seedTile: toTile }
}

export function inheritEmpireTechToColony(): void {
  // Tech is empire-level (per Empire.researchedTechs in empire.ts) — colonies automatically
  // inherit empire-wide tech access on landing. No per-colony tech state to copy.
}
