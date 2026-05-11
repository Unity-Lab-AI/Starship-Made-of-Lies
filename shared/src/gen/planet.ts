import { type CivId, type PlanetId, tileId, type Vec3 } from '../types/index'
import { type Tile } from '../sim/tile'
import { type BiomeDef } from './biome'

export type PlanetSizeTier = 'moon' | 'small' | 'standard' | 'large' | 'super'

export interface Planet {
  readonly id: PlanetId
  readonly position: Vec3
  readonly biome: BiomeDef
  readonly radius: number
  readonly sizeTier: PlanetSizeTier
  readonly tiles: Tile[]
  ownerCivId: CivId | null
}

export interface PlanetGenContext {
  readonly id: PlanetId
  readonly position: Vec3
  readonly biome: BiomeDef
  readonly radius: number
  readonly sizeTier: PlanetSizeTier
}

export function generatePlanet(ctx: PlanetGenContext): Planet {
  const { id, position, biome, radius, sizeTier } = ctx
  const tileRadius = tileGridRadiusForSize(sizeTier)
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
    sizeTier,
    tiles,
    ownerCivId: null,
  }
}

/** Hex grid radius per planet size tier. Total tiles = 3 * R * (R+1) + 1. */
export function tileGridRadiusForSize(tier: PlanetSizeTier): number {
  switch (tier) {
    case 'moon':
      return 2 // 19 tiles
    case 'small':
      return 3 // 37 tiles
    case 'standard':
      return 4 // 61 tiles
    case 'large':
      return 5 // 91 tiles
    case 'super':
      return 6 // 127 tiles
  }
}

/** Render radius for the galaxy 3D view per size tier (world units). */
export function planetRenderRadius(tier: PlanetSizeTier): number {
  switch (tier) {
    case 'moon':
      return 70
    case 'small':
      return 100
    case 'standard':
      return 140
    case 'large':
      return 200
    case 'super':
      return 280
  }
}

/** Hex tile-radius spawn weights for size tiers. */
export const PLANET_SIZE_WEIGHTS: ReadonlyArray<{
  readonly tier: PlanetSizeTier
  readonly weight: number
  readonly worldRadius: number
}> = [
  { tier: 'moon', weight: 0.1, worldRadius: 3000 },
  { tier: 'small', weight: 0.3, worldRadius: 4500 },
  { tier: 'standard', weight: 0.35, worldRadius: 6000 },
  { tier: 'large', weight: 0.2, worldRadius: 7500 },
  { tier: 'super', weight: 0.05, worldRadius: 9000 },
]

/** Roll a size tier from weighted RNG. */
export function rollPlanetSizeTier(rng: () => number): {
  readonly tier: PlanetSizeTier
  readonly worldRadius: number
} {
  const t = rng()
  let cumulative = 0
  for (const entry of PLANET_SIZE_WEIGHTS) {
    cumulative += entry.weight
    if (t < cumulative) return { tier: entry.tier, worldRadius: entry.worldRadius }
  }
  const last = PLANET_SIZE_WEIGHTS[PLANET_SIZE_WEIGHTS.length - 1]!
  return { tier: last.tier, worldRadius: last.worldRadius }
}

export function planetTileCount(planet: Planet): number {
  return planet.tiles.length
}

export function planetEmptyTiles(planet: Planet): Tile[] {
  return planet.tiles.filter((t) => t.occupancy === 'empty')
}
