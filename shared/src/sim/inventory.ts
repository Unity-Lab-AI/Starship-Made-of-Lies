import { type PlanetId, type ResourceId } from '../types/index'
import { type ResourceDef, getResourceDef } from './resources'

export interface PlanetInventory {
  readonly planetId: PlanetId
  readonly stocks: Map<ResourceId, number>
}

export interface ProductionRate {
  readonly resource: ResourceId
  readonly perTick: number
}

export function newPlanetInventory(planetId: PlanetId): PlanetInventory {
  return { planetId, stocks: new Map() }
}

export function addResource(inv: PlanetInventory, resource: ResourceId, amount: number): void {
  if (amount < 0) {
    throw new Error(`addResource: cannot add negative amount (${amount}) — use consumeResource`)
  }
  inv.stocks.set(resource, (inv.stocks.get(resource) ?? 0) + amount)
}

export function consumeResource(
  inv: PlanetInventory,
  resource: ResourceId,
  amount: number,
): boolean {
  const current = inv.stocks.get(resource) ?? 0
  if (current < amount) return false
  inv.stocks.set(resource, current - amount)
  return true
}

export function tryConsumeAll(
  inv: PlanetInventory,
  costs: ReadonlyArray<{ resource: ResourceId; amount: number }>,
): boolean {
  for (const { resource, amount } of costs) {
    if ((inv.stocks.get(resource) ?? 0) < amount) return false
  }
  for (const { resource, amount } of costs) {
    consumeResource(inv, resource, amount)
  }
  return true
}

export function stockOf(inv: PlanetInventory, resource: ResourceId): number {
  return inv.stocks.get(resource) ?? 0
}

export function applyProductionTick(
  inv: PlanetInventory,
  rates: ReadonlyArray<ProductionRate>,
): void {
  for (const { resource, perTick } of rates) {
    if (perTick > 0) addResource(inv, resource, perTick)
    else if (perTick < 0) consumeResource(inv, resource, -perTick)
  }
}

// PHASE 17.L.A.2 — clamp a resource stockpile at a storage cap. Surplus is lost (the "extra
// power went somewhere — vented, dumped, or never produced because the tanks are full"
// fiction). Used by the per-planet fuel cap which scales with battery-bank count. Returns the
// amount that was clipped so callers can surface it (e.g. "wasted N fuel per tick — build more
// Battery Banks").
export function clampResourceToCap(
  inv: PlanetInventory,
  resource: ResourceId,
  cap: number,
): number {
  const current = inv.stocks.get(resource) ?? 0
  if (current <= cap) return 0
  inv.stocks.set(resource, cap)
  return current - cap
}

export function listStocks(
  inv: PlanetInventory,
): ReadonlyArray<{ def: ResourceDef; amount: number }> {
  const out: { def: ResourceDef; amount: number }[] = []
  for (const [resource, amount] of inv.stocks) {
    out.push({ def: getResourceDef(resource), amount })
  }
  return out
}
