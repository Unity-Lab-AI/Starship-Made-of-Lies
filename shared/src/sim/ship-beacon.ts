import type { CivId, PlanetId, ResourceId, Vec3 } from '../types/index'

export type ShipBeaconStatus =
  | 'IDLE'
  | 'DOCKED'
  | 'OUTBOUND_TRAVELING'
  | 'AT_DEPOSIT_DRILLING'
  | 'INBOUND_RETURNING'
  | 'OFFLOADING'
  | 'NO_SIGNAL'

export interface ShipBeaconBroadcast {
  readonly id: string
  readonly shipId: string
  readonly shipName: string
  readonly civId: CivId
  readonly homePlanetId: PlanetId
  readonly targetPlanetId: PlanetId | null
  readonly targetNodeId: string | null
  readonly status: ShipBeaconStatus
  readonly worldPosition: Vec3
  readonly cargoPercent: number
  readonly cargoResourceId: ResourceId | null
  readonly cargoCapacity: number
  readonly cargoAmount: number
  readonly fuelPercent: number
  readonly batteryPercent: number
  readonly etaTicks: number
  readonly atTick: number
  // Super-review fix: ticks-spent in NO_SIGNAL state. 0 when status !== 'NO_SIGNAL'. UI
  // surfaces this as "stranded for N ticks" so player can decide whether to abandon vs.
  // rescue (PHASE 17.B.5 contract — "beacon broadcasts stranded status").
  readonly ticksInNoSignal: number
}

export interface PlanetShipBeaconBuffer {
  readonly homePlanetId: PlanetId
  readonly capacity: number
  broadcasts: ShipBeaconBroadcast[]
}

export function newPlanetShipBeaconBuffer(
  homePlanetId: PlanetId,
  capacity = 50,
): PlanetShipBeaconBuffer {
  return { homePlanetId, capacity, broadcasts: [] }
}

export function recordShipBeacon(
  buffer: PlanetShipBeaconBuffer,
  broadcast: ShipBeaconBroadcast,
): void {
  const existingIdx = buffer.broadcasts.findIndex((b) => b.shipId === broadcast.shipId)
  if (existingIdx >= 0) {
    buffer.broadcasts[existingIdx] = broadcast
    return
  }
  buffer.broadcasts.push(broadcast)
  if (buffer.broadcasts.length > buffer.capacity) {
    buffer.broadcasts.splice(0, buffer.broadcasts.length - buffer.capacity)
  }
}

export function pruneStaleBeacons(
  buffer: PlanetShipBeaconBuffer,
  currentTick: number,
  maxAgeTicks: number,
): void {
  const cutoff = currentTick - maxAgeTicks
  buffer.broadcasts = buffer.broadcasts.filter((b) => b.atTick >= cutoff)
}

export function getActiveShipBeacons(
  buffer: PlanetShipBeaconBuffer,
  currentTick: number,
  freshnessTicks: number,
): ReadonlyArray<ShipBeaconBroadcast> {
  const cutoff = currentTick - freshnessTicks
  return buffer.broadcasts.filter((b) => b.atTick >= cutoff)
}

export function shipBeaconsByCiv(
  buffer: PlanetShipBeaconBuffer,
  civId: CivId,
): ReadonlyArray<ShipBeaconBroadcast> {
  return buffer.broadcasts.filter((b) => b.civId === civId)
}

export function describeShipStatus(status: ShipBeaconStatus): string {
  switch (status) {
    case 'IDLE':
      return 'Idle'
    case 'DOCKED':
      return 'Docked at home pad'
    case 'OUTBOUND_TRAVELING':
      return 'Outbound — traveling'
    case 'AT_DEPOSIT_DRILLING':
      return 'At deposit — drilling'
    case 'INBOUND_RETURNING':
      return 'Inbound — returning'
    case 'OFFLOADING':
      return 'Offloading cargo'
    case 'NO_SIGNAL':
      return 'No signal'
  }
}

export function shipStatusColorClass(status: ShipBeaconStatus): string {
  switch (status) {
    case 'IDLE':
    case 'DOCKED':
      return 'beacon-status-docked'
    case 'OUTBOUND_TRAVELING':
    case 'INBOUND_RETURNING':
      return 'beacon-status-traveling'
    case 'AT_DEPOSIT_DRILLING':
      return 'beacon-status-drilling'
    case 'OFFLOADING':
      return 'beacon-status-offloading'
    case 'NO_SIGNAL':
      return 'beacon-status-nosignal'
  }
}

export function emptyCargoBeacon(
  shipId: string,
  shipName: string,
  civId: CivId,
  homePlanetId: PlanetId,
  position: Vec3,
  atTick: number,
): ShipBeaconBroadcast {
  return {
    id: `${shipId}-${atTick}`,
    shipId,
    shipName,
    civId,
    homePlanetId,
    targetPlanetId: null,
    targetNodeId: null,
    status: 'IDLE',
    worldPosition: position,
    cargoPercent: 0,
    cargoResourceId: null,
    cargoCapacity: 0,
    cargoAmount: 0,
    fuelPercent: 100,
    batteryPercent: 100,
    etaTicks: 0,
    atTick,
    ticksInNoSignal: 0,
  }
}
