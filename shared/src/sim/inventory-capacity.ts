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

// Base per-category caps at TIER_1. Raw materials are cheap and abundant → high cap. Strategic
// late-game resources are precious + dangerous → low cap. Tiered upgrades multiply these
// uniformly so the relative scarcity ordering holds across the entire match.
const BASE_CAP_BY_CATEGORY: Readonly<Record<ResourceCategory, number>> = {
  raw: 5000,
  refined: 3500,
  component: 2000,
  product: 1200,
  strategic: 600,
}

// Per-resource overrides for resources whose category cap is wrong for the gameplay shape we
// want. Food + water carry the population so their caps need to be generous even at tier 1 to
// avoid bottlenecking early-game growth. Antimatter is a strategic resource but a planet only
// ever wants a few hundred units, so the strategic base is already correct.
const PER_RESOURCE_BASE_CAP_OVERRIDE: ReadonlyMap<string, number> = new Map([
  ['food', 8000],
  ['water', 8000],
  // PHASE 17.L.A.2 — battery-bank fuel cap interaction lives separately. The fuel cap here is
  // the planet-wide STORAGE cap (silo size); battery banks add per-tick reserve on top. Both
  // are enforced; production-tick clamps to whichever is reached first.
  ['fuel', 4000],
])

// Capacity tier multiplier. Each upgrade multiplies every per-resource cap by this factor so
// the curve compounds — tier 2 = 1.6×, tier 3 = 2.56×, tier 4 = 4.1×, tier 5 = 6.5×, tier 6 =
// 10.5×, etc. Aggressive enough that the upgrade FEELS worthwhile + cheap-enough to bother
// pursuing mid-game.
const TIER_MULTIPLIER = 1.6

// Hard maximum tier. Beyond 8 the storage caps run into millions per resource which trivializes
// the game's scarcity loop. If late-game empires push past this we can raise it; v1 caps at 8.
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
