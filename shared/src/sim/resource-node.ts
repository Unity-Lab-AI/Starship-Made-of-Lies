import type { ResourceId, Vec3 } from '../types/index'

export type ResourceNodeTier = 'common' | 'rich' | 'motherlode'

export interface ResourceNode {
  readonly id: string
  readonly resourceId: ResourceId
  readonly initialAmount: number
  amountRemaining: number
  readonly tier: ResourceNodeTier
  readonly worldPosition: Vec3
  readonly tileFaceIndex: number
}

// PHASE 17.L 2026-05-12 user design correction: resource nodes are ENDLESS. The
// `amountRemaining` field stays in the data model (saves / serialized state keep working
// without a schema migration) but extraction no longer drains it. `isDepleted` always returns
// false so consumers (mining-ship.ts, planetActiveResourceNodes, AI scoring) treat every
// node as perpetually mineable.
//
// Why the field stays: legacy saves carry `amountRemaining` and we don't want to break
// deserialization. The displayed "remaining" can become a "max yield per tick" or similar
// gameplay-relevant number later; for now it's vestigial.
export function isDepleted(_node: ResourceNode): boolean {
  return false
}

export function tierYieldMultiplier(tier: ResourceNodeTier): number {
  switch (tier) {
    case 'common':
      return 1
    case 'rich':
      return 2.5
    case 'motherlode':
      return 6
  }
}

// PHASE 17.L 2026-05-12 — endless extraction. Always grants the full requested amount;
// `amountRemaining` is not decremented. Mining ships, AI scoring, and player tooling all
// see every node as an infinite tap so the early-game "I can't mine enough" tedium goes
// away. The yield multiplier per tier (common / rich / motherlode) still matters at the
// caller level (mining-ship uses DRILL_PER_TICK directly; richer nodes can be tuned via
// per-tier modifiers later).
export function drillResourceNode(_node: ResourceNode, requestedAmount: number): number {
  return Math.max(0, requestedAmount)
}

export interface BiomeDepositProfile {
  readonly minNodes: number
  readonly maxNodes: number
  readonly resourceWeights: ReadonlyArray<readonly [ResourceId, number]>
  readonly tierWeights: ReadonlyArray<readonly [ResourceNodeTier, number]>
}

export function defaultProfileForHostilityTier(
  hostilityTier: 0 | 1 | 2 | 3,
  catalog: {
    readonly stone: ResourceId
    readonly rareMetals: ResourceId
    readonly exoticAlloys: ResourceId
    readonly ancientTech: ResourceId
    readonly gas: ResourceId
    readonly scrap: ResourceId
    readonly components: ResourceId
  },
): BiomeDepositProfile {
  switch (hostilityTier) {
    case 0:
      // Per user 2026-05-12 — every starting planet must have the resources needed to get to
      // space. Tier 0 is the primary spawn pool; previous minNodes:0 / maxNodes:2 distribution
      // sometimes rolled a node-less starting planet. Bumped to 3-6 nodes with stone +
      // rareMetals + gas weighting so most tier-0 worlds organically meet the basic-space-tech
      // contract. The `enrichStartingPlanetEconomy()` helper below adds any missing required
      // resources deterministically as a safety net. Tier 0 still NEVER spawns the high-tier
      // resources (exoticAlloys / ancientTech) — those stay locked to tier-3 worlds so the
      // player is forced into multi-planet colonization to unlock late-game tech.
      return {
        minNodes: 3,
        maxNodes: 6,
        resourceWeights: [
          [catalog.stone, 1],
          [catalog.rareMetals, 0.4],
          [catalog.gas, 0.35],
        ],
        tierWeights: [
          ['common', 1],
          ['rich', 0.1],
          ['motherlode', 0],
        ],
      }
    case 1:
      return {
        minNodes: 3,
        maxNodes: 5,
        resourceWeights: [
          [catalog.stone, 1.5],
          [catalog.rareMetals, 0.6],
          [catalog.gas, 0.4],
          [catalog.scrap, 0.3],
        ],
        tierWeights: [
          ['common', 1],
          ['rich', 0.3],
          ['motherlode', 0.05],
        ],
      }
    case 2:
      return {
        minNodes: 8,
        maxNodes: 15,
        resourceWeights: [
          [catalog.stone, 1],
          [catalog.rareMetals, 1.5],
          [catalog.exoticAlloys, 0.8],
          [catalog.gas, 1.2],
          [catalog.components, 0.6],
          [catalog.scrap, 0.5],
        ],
        tierWeights: [
          ['common', 1],
          ['rich', 0.6],
          ['motherlode', 0.15],
        ],
      }
    case 3:
      return {
        minNodes: 4,
        maxNodes: 8,
        resourceWeights: [
          [catalog.rareMetals, 1],
          [catalog.exoticAlloys, 1.8],
          [catalog.ancientTech, 1.5],
        ],
        tierWeights: [
          ['common', 0.3],
          ['rich', 1],
          ['motherlode', 0.5],
        ],
      }
  }
}

export function tierBaseAmount(tier: ResourceNodeTier): number {
  switch (tier) {
    case 'common':
      return 800
    case 'rich':
      return 2200
    case 'motherlode':
      return 6500
  }
}

// PHASE 17.L 2026-05-12 — design contract: every starting planet has the resources needed
// to get to space (stone for buildings, rareMetals for industry, gas for fuel). The base
// generator's random distribution USUALLY produces these on tier-0 worlds but isn't
// guaranteed; this helper is the deterministic safety net the caller invokes on each civ's
// home planet so the basic-space-tech recipe is always mineable. Idempotent — only inserts
// nodes for resources NOT already present. The high-tier resources (exoticAlloys / ancient
// tech) are intentionally NOT in the guarantee set — they live on tier-3 hostility planets,
// forcing multi-planet colonization to unlock late-game tech (per user mandate).
//
// `addNodeFn` callback abstracts the actual tile-picking + position math (which lives in
// the planet module so it has access to icosphere geometry); this helper just decides WHAT
// resources need to be added.
export function enrichStartingPlanetEconomy(
  existingResourceIds: ReadonlySet<ResourceId>,
  catalog: {
    readonly stone: ResourceId
    readonly rareMetals: ResourceId
    readonly gas: ResourceId
  },
): ReadonlyArray<ResourceId> {
  const required: ResourceId[] = [catalog.stone, catalog.rareMetals, catalog.gas]
  return required.filter((id) => !existingResourceIds.has(id))
}
