import { type CivId, type PlanetId, type ResourceId, type Vec3 } from '../types/index'

// PHASE 17.13.7 — inter-planet caravan trade. Per user verbatim 2026-05-10
// "inter-settlement caravan trade" — v1 scopes to per-planet (since per-settlement inventory
// bifurcation hasn't landed yet); upgrades to per-settlement when 17.13.6's aggregate-vs-
// detail toggle ships. Caravans transport a single resource between two owned planets across
// a configurable tick window, with a per-launch fuel cost and a per-civ active-caravan cap.

export type CaravanStatus = 'OUTBOUND' | 'DELIVERED' | 'CANCELLED'

export interface Caravan {
  readonly id: string
  readonly civId: CivId
  readonly fromPlanetId: PlanetId
  readonly toPlanetId: PlanetId
  readonly resource: ResourceId
  readonly amount: number
  readonly totalTicks: number
  ticksRemaining: number
  status: CaravanStatus
  readonly launchedAtTick: number
}

// Per-civ active-caravan cap. Prevents spam-routing every resource through dozens of
// concurrent caravans. Tech tree upgrades may raise this in a follow-on phase.
export const MAX_ACTIVE_CARAVANS_PER_CIV = 8

// Per-launch fuel cost. Pulled from the source planet's inventory at create-time. Tuned for
// the saga match length (180k ticks at 5Hz) so caravans feel like a real resource investment
// without being prohibitive.
export const CARAVAN_FUEL_COST = 15

// Caravan travel speed (world units per tick). Caravans are slower than colony ships — they
// follow shipping lanes, not direct trajectories. Tuned so an across-galaxy caravan takes
// ~600-1200 ticks (2-4 minutes at 5Hz default speed) so the player feels the route latency.
export const CARAVAN_TRAVEL_SPEED = 80

// Per-caravan amount cap. Prevents the player from instantly evacuating a planet's entire
// stockpile in one shipment. v1 caps at 500 units per caravan; multiple caravans needed for
// larger transfers. Higher tiers via tech can raise this.
export const CARAVAN_MAX_AMOUNT_PER_RUN = 500

export interface CreateCaravanInputs {
  readonly civId: CivId
  readonly fromPlanetId: PlanetId
  readonly toPlanetId: PlanetId
  readonly fromPlanetPos: Vec3
  readonly toPlanetPos: Vec3
  readonly resource: ResourceId
  readonly amount: number
  readonly currentTick: number
  readonly idSeed: number
}

// Compute the travel-tick window between two planets using straight-line world distance
// divided by CARAVAN_TRAVEL_SPEED. Minimum 60 ticks (12s at 5Hz) so even neighbor-system
// caravans feel like a deliberate action, not a teleport.
export function caravanTicksForRoute(from: Vec3, to: Vec3): number {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dz = to.z - from.z
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  return Math.max(60, Math.round(distance / CARAVAN_TRAVEL_SPEED))
}

export function newCaravan(inputs: CreateCaravanInputs): Caravan {
  const ticks = caravanTicksForRoute(inputs.fromPlanetPos, inputs.toPlanetPos)
  const idStr = `caravan-${String(inputs.fromPlanetId)}-${String(inputs.toPlanetId)}-${inputs.idSeed}`
  return {
    id: idStr,
    civId: inputs.civId,
    fromPlanetId: inputs.fromPlanetId,
    toPlanetId: inputs.toPlanetId,
    resource: inputs.resource,
    amount: Math.min(Math.max(0, Math.floor(inputs.amount)), CARAVAN_MAX_AMOUNT_PER_RUN),
    totalTicks: ticks,
    ticksRemaining: ticks,
    status: 'OUTBOUND',
    launchedAtTick: inputs.currentTick,
  }
}

// Per-tick caravan progression. OUTBOUND caravans count down; when ticksRemaining hits 0
// the caravan transitions to DELIVERED. Caller is responsible for moving the cargo to the
// destination planet's inventory + removing the delivered/cancelled caravan from the
// per-civ caravan list.
export function tickCaravan(caravan: Caravan): { readonly arrived: boolean } {
  if (caravan.status !== 'OUTBOUND') return { arrived: false }
  if (caravan.ticksRemaining > 0) {
    caravan.ticksRemaining -= 1
    if (caravan.ticksRemaining <= 0) {
      caravan.status = 'DELIVERED'
      return { arrived: true }
    }
  }
  return { arrived: false }
}

// Cancel an OUTBOUND caravan mid-flight. Cargo is lost (a v1 simplification — future polish
// pass could refund a fraction on cancel-near-source). Status flips to CANCELLED so the UI
// can surface "lost N {resource} en route" feedback.
export function cancelCaravan(caravan: Caravan): boolean {
  if (caravan.status !== 'OUTBOUND') return false
  caravan.status = 'CANCELLED'
  return true
}

// Caravan-cap check exposed for the UI's create-caravan button (disables when the civ is
// at its concurrent cap). Counts only OUTBOUND caravans; DELIVERED/CANCELLED are awaiting
// cleanup and don't consume a slot.
export function countActiveCaravans(caravans: ReadonlyArray<Caravan>): number {
  let count = 0
  for (const c of caravans) if (c.status === 'OUTBOUND') count += 1
  return count
}

export function caravanProgressFraction(caravan: Caravan): number {
  if (caravan.totalTicks <= 0) return 1
  return 1 - Math.max(0, Math.min(1, caravan.ticksRemaining / caravan.totalTicks))
}
