import { type CivId, type PlanetId, type ResourceId, tileId, type Vec3 } from '../types/index'
import { type Tile } from '../sim/tile'
import { type BiomeDef, BIOMES, getBiome } from './biome'
import { buildIcosphere, subdivisionForSizeTier } from './icosphere'
import {
  defaultProfileForHostilityTier,
  type ResourceNode,
  type ResourceNodeTier,
  tierBaseAmount,
} from '../sim/resource-node'
import {
  RESOURCE_ANCIENT_TECH,
  RESOURCE_COMPONENTS,
  RESOURCE_EXOTIC_ALLOYS,
  RESOURCE_GAS,
  RESOURCE_RARE_METALS,
  RESOURCE_SCRAP,
  RESOURCE_STONE,
} from '../sim/resources'

export type PlanetSizeTier = 'moon' | 'small' | 'standard' | 'large' | 'super'

export interface Planet {
  readonly id: PlanetId
  readonly position: Vec3
  readonly biome: BiomeDef
  readonly radius: number
  readonly sizeTier: PlanetSizeTier
  readonly surfaceRadius: number
  readonly tiles: Tile[]
  readonly resourceNodes: ResourceNode[]
  ownerCivId: CivId | null
}

export interface PlanetGenContext {
  readonly id: PlanetId
  readonly position: Vec3
  readonly biome: BiomeDef
  readonly radius: number
  readonly sizeTier: PlanetSizeTier
  readonly rng: () => number
}

const DEPOSIT_RESOURCE_CATALOG = {
  stone: RESOURCE_STONE,
  rareMetals: RESOURCE_RARE_METALS,
  exoticAlloys: RESOURCE_EXOTIC_ALLOYS,
  ancientTech: RESOURCE_ANCIENT_TECH,
  gas: RESOURCE_GAS,
  scrap: RESOURCE_SCRAP,
  components: RESOURCE_COMPONENTS,
} as const

export function planetRenderRadius(tier: PlanetSizeTier): number {
  // Per user verbatim 2026-05-10 LAW #0: planets must be BIG with visible surface area
  // for multi-civ multi-settlement on a single planet. Sizes bumped ~5-6× from PHASE 16.4
  // values (70-280) → 400-1600. MIN_DISTANCE in cameraController must stay > super radius
  // (1600) so camera doesn't end up inside the planet sphere.
  switch (tier) {
    case 'moon':
      return 400
    case 'small':
      return 600
    case 'standard':
      return 900
    case 'large':
      return 1200
    case 'super':
      return 1600
  }
}

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

function biomeIdToCandidate(rng: () => number, primary: BiomeDef): string {
  if (rng() < 0.55) return primary.id
  const primaryTier = primary.hostilityTier
  const drift = Math.floor(rng() * 3) - 1
  const targetTier = Math.max(0, Math.min(3, primaryTier + drift))
  const pool = BIOMES.filter((b) => b.hostilityTier === targetTier)
  if (pool.length === 0) return primary.id
  const pick = pool[Math.floor(rng() * pool.length)]
  return pick?.id ?? primary.id
}

interface BiomePatch {
  readonly center: Vec3
  readonly biomeId: string
}

function rollBiomePatches(rng: () => number, primary: BiomeDef, count: number): BiomePatch[] {
  const patches: BiomePatch[] = []
  for (let i = 0; i < count; i++) {
    const theta = rng() * Math.PI * 2
    const phi = Math.acos(2 * rng() - 1)
    const center: Vec3 = {
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.sin(phi) * Math.sin(theta),
      z: Math.cos(phi),
    }
    const biomeId = i === 0 ? primary.id : biomeIdToCandidate(rng, primary)
    patches.push({ center, biomeId })
  }
  return patches
}

function assignBiomeToFaceNormal(normal: Vec3, patches: ReadonlyArray<BiomePatch>): string {
  let bestDot = -Infinity
  let bestId = patches[0]?.biomeId ?? 'terran'
  for (const patch of patches) {
    const d = normal.x * patch.center.x + normal.y * patch.center.y + normal.z * patch.center.z
    if (d > bestDot) {
      bestDot = d
      bestId = patch.biomeId
    }
  }
  return bestId
}

function pickWeighted<T>(rng: () => number, items: ReadonlyArray<readonly [T, number]>): T | null {
  const total = items.reduce((sum, [, w]) => sum + w, 0)
  if (total <= 0) return null
  let roll = rng() * total
  for (const [item, weight] of items) {
    roll -= weight
    if (roll <= 0) return item
  }
  const last = items[items.length - 1]
  return last ? last[0] : null
}

function scatterResourceNodes(
  planetId: PlanetId,
  planetPosition: Vec3,
  tiles: ReadonlyArray<Tile>,
  primary: BiomeDef,
  rng: () => number,
): ResourceNode[] {
  const profile = defaultProfileForHostilityTier(primary.hostilityTier, DEPOSIT_RESOURCE_CATALOG)
  const count = profile.minNodes + Math.floor(rng() * (profile.maxNodes - profile.minNodes + 1))
  if (count <= 0 || tiles.length === 0) return []
  const usedTileIndices = new Set<number>()
  const nodes: ResourceNode[] = []
  let safety = 0
  while (nodes.length < count && safety < count * 6) {
    safety++
    const tileIdx = Math.floor(rng() * tiles.length)
    if (usedTileIndices.has(tileIdx)) continue
    const tile = tiles[tileIdx]
    if (!tile) continue
    const biomeForTile = getBiome(tile.biomeId)
    const tileProfile = defaultProfileForHostilityTier(
      biomeForTile.hostilityTier,
      DEPOSIT_RESOURCE_CATALOG,
    )
    const resourceId = pickWeighted<ResourceId>(rng, tileProfile.resourceWeights)
    const tier = pickWeighted<ResourceNodeTier>(rng, tileProfile.tierWeights)
    if (!resourceId || !tier) continue
    usedTileIndices.add(tileIdx)
    const baseAmount = tierBaseAmount(tier)
    const initialAmount = Math.round(baseAmount * (0.7 + rng() * 0.6))
    const worldPosition: Vec3 = {
      x: planetPosition.x + tile.centroid.x,
      y: planetPosition.y + tile.centroid.y,
      z: planetPosition.z + tile.centroid.z,
    }
    nodes.push({
      id: `${planetId}-node-${nodes.length}`,
      resourceId,
      initialAmount,
      amountRemaining: initialAmount,
      tier,
      worldPosition,
      tileFaceIndex: tile.faceIndex,
    })
  }
  return nodes
}

export function generatePlanet(ctx: PlanetGenContext): Planet {
  const { id, position, biome, radius, sizeTier, rng } = ctx
  const surfaceRadius = planetRenderRadius(sizeTier)
  const subdivision = subdivisionForSizeTier(sizeTier)
  const icosphere = buildIcosphere(subdivision, surfaceRadius)
  const tileCount = icosphere.faces.length
  const cols = Math.max(1, Math.ceil(Math.sqrt(tileCount)))
  const patchCount = 3 + Math.floor(rng() * 4)
  const patches = rollBiomePatches(rng, biome, patchCount)
  const tiles: Tile[] = icosphere.faces.map((face) => {
    const biomeId = assignBiomeToFaceNormal(face.normal, patches)
    const q = Math.floor(face.index / cols)
    const r = face.index % cols
    return {
      id: tileId(`${id}-${face.index}`),
      q,
      r,
      faceIndex: face.index,
      normal: face.normal,
      centroid: face.centroid,
      neighbors: face.neighbors,
      biomeId,
      occupancy: 'empty',
      ownerCivId: null,
    }
  })
  const resourceNodes = scatterResourceNodes(id, position, tiles, biome, rng)
  return {
    id,
    position,
    biome,
    radius,
    sizeTier,
    surfaceRadius,
    tiles,
    resourceNodes,
    ownerCivId: null,
  }
}

export function planetTileCount(planet: Planet): number {
  return planet.tiles.length
}

export function planetEmptyTiles(planet: Planet): Tile[] {
  return planet.tiles.filter((t) => t.occupancy === 'empty')
}

export function planetActiveResourceNodes(planet: Planet): ResourceNode[] {
  return planet.resourceNodes.filter((n) => n.amountRemaining > 0)
}
