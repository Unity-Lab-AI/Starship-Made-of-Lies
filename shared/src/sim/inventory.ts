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

export function listStocks(
  inv: PlanetInventory,
): ReadonlyArray<{ def: ResourceDef; amount: number }> {
  const out: { def: ResourceDef; amount: number }[] = []
  for (const [resource, amount] of inv.stocks) {
    out.push({ def: getResourceDef(resource), amount })
  }
  return out
}
