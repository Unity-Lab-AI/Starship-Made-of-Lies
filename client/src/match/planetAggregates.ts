// PHASE 17.13.9 — performance scaffolding for late-game empire scale (100+ planets × 30
// settlements per planet, per `feedback_no_caps_on_empire.md`). This module provides two
// pieces:
//
//   1. Cached per-planet aggregates keyed by sim-tick + state-fingerprint. Panels (Top
//      toolbar / PlanetSummaryPanel / PlanetPicker) read aggregates many times per render;
//      without this cache every read iterates building maps + resource stocks. The WeakMap
//      cache stays bounded automatically — when a MatchPlanetState is replaced (rare —
//      planet objects mutate in place) the entry is GC'd along with the dead state.
//
//   2. Off-camera throttling helper (`shouldTickPlanetThisFrame`) — pure function callers
//      can use to skip per-tick simulation for planets the camera isn't watching, while
//      keeping a low-rate heartbeat so background economies still progress. Default policy:
//      every-tick for the focused planet, every 4 ticks for planets at adjacent stars,
//      every 12 ticks for everywhere else. The sim itself does NOT call this yet — wiring
//      lives in 17.13.13's profile-driven optimization pass. Exposing it here lets the host
//      adopt it incrementally.
//
// No tests per LAW. Aggregates compute is straight iteration over already-loaded maps;
// off-camera throttle is integer modulo. Both are pure + side-effect-free at this layer.

import type { ResourceId } from '@smol/shared'
import type { MatchPlanetState } from './MatchSim'

export interface PlanetAggregateSnapshot {
  readonly capturedAtTick: number
  readonly totalPopulation: number
  readonly buildingCount: number
  readonly tileCount: number
  readonly tilesUsed: number
  readonly settlementCount: number
  // Top resources by stocked amount. Length is bounded by `topN` (default 7) so the
  // toolbar / summary panel always has a stable, sortable list to render.
  readonly topResources: ReadonlyArray<{ readonly resourceId: ResourceId; readonly amount: number }>
}

interface CachedEntry {
  readonly cacheKey: string
  readonly snapshot: PlanetAggregateSnapshot
}

const cache: WeakMap<MatchPlanetState, CachedEntry> = new WeakMap()

// Fingerprint inputs that change when the snapshot would change. currentTick changes every
// sim step so the cache invalidates every tick for active planets — adequate for v1; finer
// invalidation (only when stocks / population / buildings actually mutate) is a 17.13.13
// optimization. Settlements + buildings + tiles + capacity tier participate in the key so
// founding / placing / capturing flips the key mid-tick too.
function buildCacheKey(planet: MatchPlanetState, currentTick: number): string {
  return (
    `${currentTick}|` +
    `${planet.buildingsByTile.size}|` +
    `${planet.settlements.size}|` +
    `${planet.inventoryCapacityTier}|` +
    `${planet.population.tierCounts[1] ?? 0}-${planet.population.tierCounts[2] ?? 0}-` +
    `${planet.population.tierCounts[3] ?? 0}-${planet.population.tierCounts[4] ?? 0}-` +
    `${planet.population.tierCounts[5] ?? 0}`
  )
}

export function getPlanetAggregatesCached(
  planet: MatchPlanetState,
  currentTick: number,
  topN = 7,
): PlanetAggregateSnapshot {
  const key = buildCacheKey(planet, currentTick)
  const existing = cache.get(planet)
  if (existing && existing.cacheKey === key) return existing.snapshot
  const snapshot = computeSnapshot(planet, currentTick, topN)
  cache.set(planet, { cacheKey: key, snapshot })
  return snapshot
}

function computeSnapshot(
  planet: MatchPlanetState,
  currentTick: number,
  topN: number,
): PlanetAggregateSnapshot {
  let totalPopulation = 0
  for (const tierCount of Object.values(planet.population.tierCounts)) {
    totalPopulation += tierCount
  }
  const buildingCount = planet.buildingsByTile.size
  const tileCount = planet.planet.tiles.length
  const tilesUsed = buildingCount
  const settlementCount = planet.settlements.size
  // Top resources — single pass, partial-insertion-sort into a fixed-size array.
  const topBuf: Array<{ resourceId: ResourceId; amount: number }> = []
  for (const [resourceId, amount] of planet.inventory.stocks) {
    if (amount <= 0) continue
    if (topBuf.length < topN) {
      topBuf.push({ resourceId, amount })
      topBuf.sort((a, b) => b.amount - a.amount)
    } else if (amount > topBuf[topBuf.length - 1]!.amount) {
      topBuf[topBuf.length - 1] = { resourceId, amount }
      topBuf.sort((a, b) => b.amount - a.amount)
    }
  }
  return {
    capturedAtTick: currentTick,
    totalPopulation,
    buildingCount,
    tileCount,
    tilesUsed,
    settlementCount,
    topResources: topBuf,
  }
}

// PHASE 17.13.9 — off-camera tick-throttle policy. Returns true if the sim should run its
// full per-tick update for this planet this frame, false if the host should skip / merge.
// `priority` reflects how visible the planet is to the local player:
//   focused — currently centered in the camera. Always tick.
//   nearby — in the same star system as the focused planet OR a flight is mid-transit there.
//           Every 4th tick.
//   background — everything else. Every 12th tick.
// Galactic events (incoming hostile, last-hope alarm) should ESCALATE a planet to focused
// via the host so the player never sees stale state during a crisis.
export type PlanetTickPriority = 'focused' | 'nearby' | 'background'

export function shouldTickPlanetThisFrame(
  currentTick: number,
  priority: PlanetTickPriority,
): boolean {
  switch (priority) {
    case 'focused':
      return true
    case 'nearby':
      return currentTick % 4 === 0
    case 'background':
      return currentTick % 12 === 0
  }
}
