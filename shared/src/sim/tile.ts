import type { CivId, TileId, Vec3 } from '../types/index'

export type TileOccupancy =
  | 'empty'
  | 'building'
  | 'launchPad'
  | 'mine'
  | 'mineField'
  | 'counterMissilePad'

export interface Tile {
  readonly id: TileId
  readonly q: number
  readonly r: number
  readonly faceIndex: number
  readonly normal: Vec3
  readonly centroid: Vec3
  readonly neighbors: ReadonlyArray<number>
  readonly biomeId: string
  occupancy: TileOccupancy
  ownerCivId: CivId | null
}

const HEX_NEIGHBOR_DELTAS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

export function tileNeighbors(tile: Tile, allTiles: ReadonlyArray<Tile>): Tile[] {
  const out: Tile[] = []
  for (const [dq, dr] of HEX_NEIGHBOR_DELTAS) {
    const found = allTiles.find((t) => t.q === tile.q + dq && t.r === tile.r + dr)
    if (found) out.push(found)
  }
  return out
}

export function hexDistance(a: Tile, b: Tile): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2
}

export function geodesicNeighbors(tile: Tile, allTiles: ReadonlyArray<Tile>): Tile[] {
  const out: Tile[] = []
  for (const faceIdx of tile.neighbors) {
    const found = allTiles[faceIdx]
    if (found) out.push(found)
  }
  return out
}

export function geodesicDistance(
  a: Tile,
  b: Tile,
  allTiles: ReadonlyArray<Tile>,
  maxSteps = 64,
): number {
  if (a.faceIndex === b.faceIndex) return 0
  const visited = new Set<number>([a.faceIndex])
  let frontier: number[] = [a.faceIndex]
  for (let step = 1; step <= maxSteps; step++) {
    const next: number[] = []
    for (const fi of frontier) {
      const tile = allTiles[fi]
      if (!tile) continue
      for (const n of tile.neighbors) {
        if (visited.has(n)) continue
        if (n === b.faceIndex) return step
        visited.add(n)
        next.push(n)
      }
    }
    if (next.length === 0) return -1
    frontier = next
  }
  return -1
}

export function tilesByOwner(tiles: ReadonlyArray<Tile>, civId: CivId | null): Tile[] {
  return tiles.filter((t) => t.ownerCivId === civId)
}

export interface PlanetPositionContext {
  readonly position: Vec3
}

export function tileWorldPosition(tile: Tile, planet: PlanetPositionContext): Vec3 {
  return {
    x: planet.position.x + tile.centroid.x,
    y: planet.position.y + tile.centroid.y,
    z: planet.position.z + tile.centroid.z,
  }
}

export function findTileNearestToPosition(
  tiles: ReadonlyArray<Tile>,
  planet: PlanetPositionContext,
  worldPos: Vec3,
): Tile | null {
  if (tiles.length === 0) return null
  let bestTile: Tile | null = null
  let bestDistSq = Number.POSITIVE_INFINITY
  for (const tile of tiles) {
    const wx = planet.position.x + tile.centroid.x
    const wy = planet.position.y + tile.centroid.y
    const wz = planet.position.z + tile.centroid.z
    const dx = wx - worldPos.x
    const dy = wy - worldPos.y
    const dz = wz - worldPos.z
    const distSq = dx * dx + dy * dy + dz * dz
    if (distSq < bestDistSq) {
      bestDistSq = distSq
      bestTile = tile
    }
  }
  return bestTile
}

export function tileLocalPositionFromWorld(worldPos: Vec3, planet: PlanetPositionContext): Vec3 {
  return {
    x: worldPos.x - planet.position.x,
    y: worldPos.y - planet.position.y,
    z: worldPos.z - planet.position.z,
  }
}
