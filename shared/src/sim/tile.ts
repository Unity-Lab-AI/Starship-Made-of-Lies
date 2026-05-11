import type { CivId, TileId } from '../types/index'

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

export function tilesByOwner(tiles: ReadonlyArray<Tile>, civId: CivId | null): Tile[] {
  return tiles.filter((t) => t.ownerCivId === civId)
}
