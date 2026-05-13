import { type ResourceId } from '../types/index'
import { type PlanetInventory, clampResourceToCap } from './inventory'
import { RESOURCES, type ResourceCategory, type ResourceDef, getResourceDef } from './resources'
import {
  RESOURCE_INGOTS,
  RESOURCE_COMPONENTS,
  RESOURCE_ELECTRONICS,
  RESOURCE_FUEL,
} from './resources'

// PHASE 17.L.C.4 — per user verbatim 2026-05-10 *"and make sure the population and type counter
// and resoures that are the main ones are listed at the top and there is a button for planet
// invenrtoy that shows the planet inventory(upgradeable, just like all things and nuture)"*.
// Every planet has a per-resource storage cap that scales with the planet's inventoryCapacityTier.
// Upgrading the tier consumes resources and multiplies every per-resource cap. Production tick
// clamps each stock to its tier-derived cap so the upgrade has real bite — surplus production
// past cap is lost. UMS UnityInventory's [QUOTAS] section is the direct ancestor of this model.

// PHASE 17.L.D.21 (2026-05-13) — caps lifted to 1 billion per user verbatim *"i never said
// to put limits on the resources they sould generate till they hit 1 billion"* +
// *"resources are maxing out i never said to put limits on the resources"*. Previous
// per-category 600-8000 base caps + 1.6× tier multiplier were the wrong design — they made
// the resource display "go dead" once a stock hit cap (production tick clamped surplus to
// 0, so the +N/-N delta showed 0 instead of the actual generation rate). With a 1B baseline
// the cap is effectively never reached at realistic per-tick production rates, so deltas
// always render live and resources accumulate freely. The tier-upgrade UI stays alive but
// is now a no-op (every resource sits at 1B regardless of tier) — proper future cleanup
// can rip the tier-upgrade panel entirely, but for now we keep the structure so other call
// sites don't break. Battery-bank fuel cap (FUEL_RAW_STOCKPILE_BASELINE + per-bank capacity)
// stays separate — that's a meaningful gameplay-choice mechanic, not a generic cap.
const UNIVERSAL_RESOURCE_CAP = 1_000_000_000

// Kept for back-compat with any caller that still references the by-category map. Every
// category resolves to the universal cap so behavior is uniform.
const BASE_CAP_BY_CATEGORY: Readonly<Record<ResourceCategory, number>> = {
  raw: UNIVERSAL_RESOURCE_CAP,
  refined: UNIVERSAL_RESOURCE_CAP,
  component: UNIVERSAL_RESOURCE_CAP,
  product: UNIVERSAL_RESOURCE_CAP,
  strategic: UNIVERSAL_RESOURCE_CAP,
}

// Kept for back-compat. No overrides applied — universal cap wins.
const PER_RESOURCE_BASE_CAP_OVERRIDE: ReadonlyMap<string, number> = new Map()

// Kept for back-compat with tier-upgrade UI; multiplier is 1.0 so tiers no longer scale.
const TIER_MULTIPLIER = 1.0

// Kept exported for any UI that still references it. Tier itself is meaningless now but
// the constant stays so panels that branch on tier still compile.
export const MAX_INVENTORY_CAPACITY_TIER = 8

// Per-tier upgrade cost. Doubles per tier so each successive upgrade is genuinely a strategic
// commitment, not a click-to-win button. Costs target the mid-industry resource cluster so the
// upgrade is reachable but never trivial.
export interface CapacityUpgradeCost {
  readonly resource: ResourceId
  readonly amount: number
}

export function getInventoryCapacityUpgradeCost(
  currentTier: number,
): ReadonlyArray<CapacityUpgradeCost> {
  // Base cost at tier 1 → 2 transition. Each subsequent upgrade doubles via 2^(currentTier-1).
  const scale = Math.pow(2, Math.max(0, currentTier - 1))
  return [
    { resource: RESOURCE_INGOTS, amount: Math.floor(80 * scale) },
    { resource: RESOURCE_COMPONENTS, amount: Math.floor(40 * scale) },
    { resource: RESOURCE_ELECTRONICS, amount: Math.floor(20 * scale) },
    { resource: RESOURCE_FUEL, amount: Math.floor(30 * scale) },
  ]
}

// Compute the storage cap for one resource at a given capacity tier. Pure function — same
// inputs always yield same output, so callers can memoize or recompute freely.
export function getResourceCapacityAt(tier: number, resource: ResourceId): number {
  const def = getResourceDef(resource)
  const baseOverride = PER_RESOURCE_BASE_CAP_OVERRIDE.get(String(resource))
  const base = baseOverride ?? BASE_CAP_BY_CATEGORY[def.category]
  const clampedTier = Math.max(1, Math.min(MAX_INVENTORY_CAPACITY_TIER, tier))
  return Math.floor(base * Math.pow(TIER_MULTIPLIER, clampedTier - 1))
}

// Convenience for UI: produce one row per resource def with current stock + cap so the panel
// can render a full upgradeable list. Sorted by category for predictable ordering.
export interface ResourceCapacityRow {
  readonly def: ResourceDef
  readonly stock: number
  readonly cap: number
  readonly fill: number // 0..1 progress, clamped
}

export function listResourceCapacities(
  inv: PlanetInventory,
  tier: number,
): ReadonlyArray<ResourceCapacityRow> {
  const out: ResourceCapacityRow[] = []
  for (const def of RESOURCES) {
    const stock = inv.stocks.get(def.id) ?? 0
    const cap = getResourceCapacityAt(tier, def.id)
    out.push({
      def,
      stock,
      cap,
      fill: cap > 0 ? Math.min(1, stock / cap) : 0,
    })
  }
  return out
}

// Enforcement hook called from the production tick after additions. Clamps every resource's
// stock to its tier-derived cap and returns the total overflow that was dropped so callers can
// surface "you wasted N units of resource X — upgrade storage". UMS UnityInventory clamped per
// item; SMoL clamps per resource since the inventory is resource-based not item-based.
export interface ClampOverflowEntry {
  readonly resource: ResourceId
  readonly droppedAmount: number
}

export function enforceCapacityCaps(
  inv: PlanetInventory,
  tier: number,
): ReadonlyArray<ClampOverflowEntry> {
  const overflows: ClampOverflowEntry[] = []
  for (const def of RESOURCES) {
    const cap = getResourceCapacityAt(tier, def.id)
    const dropped = clampResourceToCap(inv, def.id, cap)
    if (dropped > 0) {
      overflows.push({ resource: def.id, droppedAmount: dropped })
    }
  }
  return overflows
}
