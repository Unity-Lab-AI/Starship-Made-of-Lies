declare const __brand: unique symbol
type Brand<T, B> = T & { readonly [__brand]: B }

export type CivId = Brand<string, 'CivId'>
export type PlanetId = Brand<string, 'PlanetId'>
export type TileId = Brand<string, 'TileId'>
export type BuildingId = Brand<string, 'BuildingId'>
export type BuildingDefId = Brand<string, 'BuildingDefId'>
export type ResourceId = Brand<string, 'ResourceId'>
export type StarId = Brand<string, 'StarId'>

export const civId = (s: string): CivId => s as CivId
export const planetId = (s: string): PlanetId => s as PlanetId
export const tileId = (s: string): TileId => s as TileId
export const buildingId = (s: string): BuildingId => s as BuildingId
export const buildingDefId = (s: string): BuildingDefId => s as BuildingDefId
export const resourceId = (s: string): ResourceId => s as ResourceId
export const starId = (s: string): StarId => s as StarId

export interface Vec3 {
  readonly x: number
  readonly y: number
  readonly z: number
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickWeighted<T>(rng: () => number, items: ReadonlyArray<readonly [T, number]>): T {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rng() * total
  for (const [item, weight] of items) {
    roll -= weight
    if (roll <= 0) return item
  }
  const last = items[items.length - 1]
  if (!last) throw new Error('pickWeighted: empty items array')
  return last[0]
}
