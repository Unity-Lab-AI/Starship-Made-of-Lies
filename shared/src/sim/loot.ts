import { type CivId, type PlanetId, type ResourceId, type TileId } from '../types/index'

declare const __lootBrand: unique symbol
type Brand<T, B> = T & { readonly [__lootBrand]: B }

export type LootDropId = Brand<string, 'LootDropId'>
export const lootDropId = (s: string): LootDropId => s as LootDropId

export type LootDebrisKind =
  | 'colony_ship_crash'
  | 'mine_field_residue'
  | 'enemy_ship_intercept'
  | 'orbital_strike_debris'

export interface LootResourceEntry {
  readonly resource: ResourceId
  readonly amount: number
}

export interface LootDrop {
  readonly id: LootDropId
  readonly tileId: TileId
  readonly planetId: PlanetId
  readonly originCivId: CivId | null
  readonly resources: ReadonlyArray<LootResourceEntry>
  readonly debrisKind: LootDebrisKind
  readonly droppedAtTick: number
  readonly expiresAtTick: number | null
  claimedByCivId: CivId | null
  claimedAtTick: number | null
}

export const LOOT_LIFETIME_TICKS = 600

export interface CreateLootDropInputs {
  readonly id: LootDropId
  readonly tileId: TileId
  readonly planetId: PlanetId
  readonly originCivId: CivId | null
  readonly resources: ReadonlyArray<LootResourceEntry>
  readonly debrisKind: LootDebrisKind
  readonly droppedAtTick: number
  readonly lifetimeTicks?: number
}

export function createLootDrop(inputs: CreateLootDropInputs): LootDrop {
  const filtered = inputs.resources.filter((r) => r.amount > 0)
  return {
    id: inputs.id,
    tileId: inputs.tileId,
    planetId: inputs.planetId,
    originCivId: inputs.originCivId,
    resources: filtered,
    debrisKind: inputs.debrisKind,
    droppedAtTick: inputs.droppedAtTick,
    expiresAtTick:
      inputs.lifetimeTicks === undefined
        ? inputs.droppedAtTick + LOOT_LIFETIME_TICKS
        : inputs.lifetimeTicks > 0
          ? inputs.droppedAtTick + inputs.lifetimeTicks
          : null,
    claimedByCivId: null,
    claimedAtTick: null,
  }
}

export interface ClaimResult {
  readonly success: boolean
  readonly resources: ReadonlyArray<LootResourceEntry>
  readonly reason?: 'already_claimed' | 'expired' | 'wrong_civ'
}

export function claimLootDrop(
  drop: LootDrop,
  claimingCivId: CivId,
  currentTick: number,
): ClaimResult {
  if (drop.claimedByCivId !== null) {
    return { success: false, resources: [], reason: 'already_claimed' }
  }
  if (drop.expiresAtTick !== null && currentTick > drop.expiresAtTick) {
    return { success: false, resources: [], reason: 'expired' }
  }
  drop.claimedByCivId = claimingCivId
  drop.claimedAtTick = currentTick
  return { success: true, resources: drop.resources }
}

export function isLootDropExpired(drop: LootDrop, currentTick: number): boolean {
  if (drop.expiresAtTick === null) return false
  return currentTick > drop.expiresAtTick
}

export function deriveCrashLootFromShipPayload(
  payloadCargoCapacity: number,
  payloadExplosiveYield: number,
  cargoLootRate: number,
): ReadonlyArray<LootResourceEntry> {
  const out: LootResourceEntry[] = []
  if (payloadCargoCapacity > 0 && cargoLootRate > 0) {
    const ingotsScrap = Math.floor(payloadCargoCapacity * 0.3 * cargoLootRate)
    const componentsScrap = Math.floor(payloadCargoCapacity * 0.2 * cargoLootRate)
    const fuelLeak = Math.floor(payloadCargoCapacity * 0.1 * cargoLootRate)
    if (ingotsScrap > 0) {
      const RESOURCE_INGOTS = 'ingots' as ResourceId
      out.push({ resource: RESOURCE_INGOTS, amount: ingotsScrap })
    }
    if (componentsScrap > 0) {
      const RESOURCE_COMPONENTS = 'components' as ResourceId
      out.push({ resource: RESOURCE_COMPONENTS, amount: componentsScrap })
    }
    if (fuelLeak > 0) {
      const RESOURCE_FUEL = 'fuel' as ResourceId
      out.push({ resource: RESOURCE_FUEL, amount: fuelLeak })
    }
  }
  if (payloadExplosiveYield > 0) {
    const RESOURCE_EXPLOSIVES = 'explosives' as ResourceId
    out.push({ resource: RESOURCE_EXPLOSIVES, amount: Math.floor(payloadExplosiveYield * 0.05) })
  }
  return out
}
