import { type CivId, type PlanetId, tileId, type Vec3 } from '../types/index'
import { type Tile } from '../sim/tile'
import { type BiomeDef } from './biome'

export interface Planet {
  readonly id: PlanetId
  readonly position: Vec3
  readonly biome: BiomeDef
  readonly radius: number
  readonly tiles: Tile[]
  ownerCivId: CivId | null
}

export interface PlanetGenContext {
  readonly id: PlanetId
  readonly position: Vec3
  readonly biome: BiomeDef
  readonly radius: number
}

export function generatePlanet(ctx: PlanetGenContext): Planet {
  const { id, position, biome, radius } = ctx
  const tileRadius = Math.max(2, Math.round(radius / 1500))
  const tiles: Tile[] = []
  for (let q = -tileRadius; q <= tileRadius; q++) {
    const r1 = Math.max(-tileRadius, -q - tileRadius)
    const r2 = Math.min(tileRadius, -q + tileRadius)
    for (let r = r1; r <= r2; r++) {
      tiles.push({
        id: tileId(`${id}-${q}-${r}`),
        q,
        r,
        occupancy: 'empty',
        ownerCivId: null,
      })
    }
  }
  return {
    id,
    position,
    biome,
    radius,
    tiles,
    ownerCivId: null,
  }
}

export function planetTileCount(planet: Planet): number {
  return planet.tiles.length
}

export function planetEmptyTiles(planet: Planet): Tile[] {
  return planet.tiles.filter((t) => t.occupancy === 'empty')
}
