import { type CivId, type PlanetId, type ResourceId, type TileId, type Vec3 } from '../types/index'
import { type Planet } from '../gen/planet'
import { type PlanetInventory } from './inventory'
import { drillResourceNode, isDepleted, type ResourceNode } from './resource-node'
import { type ShipBeaconBroadcast, type ShipBeaconStatus } from './ship-beacon'

// MiningShip — UMS UnityBeacon auto-shuttle equivalent. Each ship lives on a home planet and
// autonomously cycles DOCKED → OUTBOUND → DRILLING → INBOUND → OFFLOADING → DOCKED, drilling
// the closest non-depleted ResourceNode and depositing cargo into PlanetInventory.stocks.
// Per `feedback_resource_miners_need_deposits.md` and `feedback_tile_xyz_addressing.md` —
// targeting is by ResourceNode.worldPosition Vec3 (not q,r/faceIndex). Broadcasts a ShipBeacon
// every 2 ticks (UMS MINER_BEACON cadence). Spawned at match start by MatchSim.

const SHIP_SPEED_UNITS_PER_TICK = 80
const MIN_TRAVEL_TICKS = 18
const OFFLOAD_TICKS = 4
const CARGO_CAPACITY = 100
const DRILL_PER_TICK = 6
const FUEL_BURN_TRAVEL = 0.35
const BATTERY_BURN_TRAVEL = 0.15
const BATTERY_BURN_DRILL = 0.4
const FUEL_RECHARGE_DOCKED = 1.5
const BATTERY_RECHARGE_DOCKED = 1.8
const MIN_FUEL_TO_LAUNCH = 25
const MIN_BATTERY_TO_LAUNCH = 25
const BEACON_INTERVAL_TICKS = 2
// PHASE 17.B.5 — NO_SIGNAL handling. Ship crawls home at half speed (battery-only, no comms).
// Mirrors UMS UnityBeacon laser-home fallback when the antenna mesh is offline.
const NO_SIGNAL_CRAWL_SPEED_UNITS_PER_TICK = 40
const NO_SIGNAL_BATTERY_BURN = 0.2

export interface MiningShip {
  readonly id: string
  readonly shipName: string
  readonly civId: CivId
  readonly homePlanetId: PlanetId
  // PHASE 17.B.3 — tile this ship returns to. Set when the ship is spawned by a
  // BLDG_MINING_OUTPOST. null for legacy / non-outpost-spawned ships.
  readonly homeTileId: TileId | null
  status: ShipBeaconStatus
  worldPosition: Vec3
  readonly homePosition: Vec3
  targetNodeId: string | null
  targetPlanetId: PlanetId
  readonly cargoCapacity: number
  cargoAmount: number
  cargoResourceId: ResourceId | null
  fuelPercent: number
  batteryPercent: number
  travelTicksRemaining: number
  travelTotalTicks: number
  travelStartPosition: Vec3
  offloadTicksRemaining: number
  ticksInStatus: number
  // PHASE 17.B.5 — when status flips to NO_SIGNAL the ship aborts whatever it was doing and
  // attempts a LASER_HOME crawl back to homePosition. Tracks how many ticks the ship has
  // been signal-dark so the beacon can broadcast "stranded for N ticks" and the player can
  // decide to abandon vs. rescue.
  ticksInNoSignal: number
}

export function newMiningShip(
  id: string,
  shipName: string,
  civId: CivId,
  homePlanetId: PlanetId,
  homePosition: Vec3,
  homeTileId: TileId | null = null,
): MiningShip {
  return {
    id,
    shipName,
    civId,
    homePlanetId,
    homeTileId,
    status: 'DOCKED',
    worldPosition: { ...homePosition },
    homePosition: { ...homePosition },
    targetNodeId: null,
    targetPlanetId: homePlanetId,
    cargoCapacity: CARGO_CAPACITY,
    cargoAmount: 0,
    cargoResourceId: null,
    fuelPercent: 100,
    batteryPercent: 100,
    travelTicksRemaining: 0,
    travelTotalTicks: 0,
    travelStartPosition: { ...homePosition },
    offloadTicksRemaining: 0,
    ticksInStatus: 0,
    ticksInNoSignal: 0,
  }
}

export interface MiningShipTickArgs {
  readonly ship: MiningShip
  readonly planet: Planet
  readonly inventory: PlanetInventory
  readonly currentTick: number
}

export interface MiningShipTickResult {
  readonly statusChanged: boolean
  readonly beacon: ShipBeaconBroadcast | null
  readonly drilled: number
  readonly offloaded: number
}

function distance3(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.hypot(dx, dy, dz)
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  const u = Math.max(0, Math.min(1, t))
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    z: a.z + (b.z - a.z) * u,
  }
}

function computeTravelTicks(from: Vec3, to: Vec3): number {
  const dist = distance3(from, to)
  return Math.max(MIN_TRAVEL_TICKS, Math.ceil(dist / SHIP_SPEED_UNITS_PER_TICK))
}

function pickClosestNode(ship: MiningShip, planet: Planet): ResourceNode | null {
  let best: ResourceNode | null = null
  let bestDist = Infinity
  for (const node of planet.resourceNodes) {
    if (isDepleted(node)) continue
    const d = distance3(ship.homePosition, node.worldPosition)
    if (d < bestDist) {
      best = node
      bestDist = d
    }
  }
  return best
}

function buildBeacon(ship: MiningShip, currentTick: number, etaTicks: number): ShipBeaconBroadcast {
  return {
    id: `${ship.id}-${currentTick}`,
    shipId: ship.id,
    shipName: ship.shipName,
    civId: ship.civId,
    homePlanetId: ship.homePlanetId,
    targetPlanetId: ship.targetPlanetId,
    targetNodeId: ship.targetNodeId,
    status: ship.status,
    worldPosition: { ...ship.worldPosition },
    cargoPercent: ship.cargoCapacity > 0 ? (ship.cargoAmount / ship.cargoCapacity) * 100 : 0,
    cargoResourceId: ship.cargoResourceId,
    cargoCapacity: ship.cargoCapacity,
    cargoAmount: ship.cargoAmount,
    fuelPercent: ship.fuelPercent,
    batteryPercent: ship.batteryPercent,
    etaTicks,
    atTick: currentTick,
    ticksInNoSignal: ship.ticksInNoSignal,
  }
}

// Super-review SR2-4 fix: NO_SIGNAL internal trigger. Threshold bumped 0 → 8 so the ship
// has battery left to actually CRAWL home when it goes dark — previously the trigger fired
// AT empty battery and the crawl-home logic couldn't move (it gates on battery > 0),
// stranding ships forever with no recovery path.
const NO_SIGNAL_BATTERY_THRESHOLD = 8
// Solar trickle recharge in NO_SIGNAL state. Even ships that hit 0 battery before triggering
// (e.g., spawning into NO_SIGNAL from an external event) get a slow recharge so they
// eventually limp home. 0.05%/tick = full recharge in ~2000 ticks (~6 min); ship would
// usually crawl home and re-dock well before that.
const NO_SIGNAL_SOLAR_TRICKLE = 0.05
function maybeEnterNoSignal(ship: MiningShip): void {
  if (ship.status === 'NO_SIGNAL') return
  if (ship.status === 'DOCKED' || ship.status === 'IDLE' || ship.status === 'OFFLOADING') return
  if (ship.batteryPercent <= NO_SIGNAL_BATTERY_THRESHOLD) {
    ship.status = 'NO_SIGNAL'
    ship.ticksInStatus = 0
    ship.ticksInNoSignal = 0
  }
}

export function tickMiningShip(args: MiningShipTickArgs): MiningShipTickResult {
  const { ship, planet, inventory, currentTick } = args
  const prevStatus = ship.status
  ship.ticksInStatus += 1
  let drilled = 0
  let offloaded = 0

  switch (ship.status) {
    case 'IDLE':
    case 'DOCKED': {
      ship.fuelPercent = Math.min(100, ship.fuelPercent + FUEL_RECHARGE_DOCKED)
      ship.batteryPercent = Math.min(100, ship.batteryPercent + BATTERY_RECHARGE_DOCKED)
      if (
        ship.fuelPercent >= MIN_FUEL_TO_LAUNCH &&
        ship.batteryPercent >= MIN_BATTERY_TO_LAUNCH &&
        ship.cargoAmount === 0
      ) {
        const node = pickClosestNode(ship, planet)
        if (node) {
          ship.targetNodeId = node.id
          ship.travelTotalTicks = computeTravelTicks(ship.homePosition, node.worldPosition)
          ship.travelTicksRemaining = ship.travelTotalTicks
          ship.travelStartPosition = { ...ship.homePosition }
          ship.status = 'OUTBOUND_TRAVELING'
          ship.ticksInStatus = 0
        }
      }
      break
    }

    case 'OUTBOUND_TRAVELING': {
      ship.travelTicksRemaining -= 1
      ship.fuelPercent = Math.max(0, ship.fuelPercent - FUEL_BURN_TRAVEL)
      ship.batteryPercent = Math.max(0, ship.batteryPercent - BATTERY_BURN_TRAVEL)
      const node = ship.targetNodeId
        ? (planet.resourceNodes.find((n) => n.id === ship.targetNodeId) ?? null)
        : null
      if (node) {
        const traveled = 1 - ship.travelTicksRemaining / Math.max(1, ship.travelTotalTicks)
        ship.worldPosition = lerp3(ship.travelStartPosition, node.worldPosition, traveled)
      }
      if (ship.travelTicksRemaining <= 0) {
        if (node && !isDepleted(node)) {
          ship.worldPosition = { ...node.worldPosition }
          ship.status = 'AT_DEPOSIT_DRILLING'
          ship.ticksInStatus = 0
        } else {
          ship.travelStartPosition = { ...ship.worldPosition }
          ship.travelTotalTicks = computeTravelTicks(ship.worldPosition, ship.homePosition)
          ship.travelTicksRemaining = ship.travelTotalTicks
          ship.targetNodeId = null
          ship.status = 'INBOUND_RETURNING'
          ship.ticksInStatus = 0
        }
      }
      break
    }

    case 'AT_DEPOSIT_DRILLING': {
      const node = ship.targetNodeId
        ? (planet.resourceNodes.find((n) => n.id === ship.targetNodeId) ?? null)
        : null
      ship.batteryPercent = Math.max(0, ship.batteryPercent - BATTERY_BURN_DRILL)
      if (node) {
        const amount = drillResourceNode(node, DRILL_PER_TICK)
        ship.cargoAmount += amount
        drilled = amount
        if (amount > 0) ship.cargoResourceId = node.resourceId
      }
      if (
        !node ||
        isDepleted(node) ||
        ship.cargoAmount >= ship.cargoCapacity ||
        ship.batteryPercent <= 5
      ) {
        ship.travelStartPosition = { ...ship.worldPosition }
        ship.travelTotalTicks = computeTravelTicks(ship.worldPosition, ship.homePosition)
        ship.travelTicksRemaining = ship.travelTotalTicks
        ship.status = 'INBOUND_RETURNING'
        ship.ticksInStatus = 0
      }
      break
    }

    case 'INBOUND_RETURNING': {
      ship.travelTicksRemaining -= 1
      ship.fuelPercent = Math.max(0, ship.fuelPercent - FUEL_BURN_TRAVEL)
      ship.batteryPercent = Math.max(0, ship.batteryPercent - BATTERY_BURN_TRAVEL)
      const traveled = 1 - ship.travelTicksRemaining / Math.max(1, ship.travelTotalTicks)
      ship.worldPosition = lerp3(ship.travelStartPosition, ship.homePosition, traveled)
      if (ship.travelTicksRemaining <= 0) {
        ship.worldPosition = { ...ship.homePosition }
        if (ship.cargoAmount > 0) {
          ship.status = 'OFFLOADING'
          ship.offloadTicksRemaining = OFFLOAD_TICKS
        } else {
          ship.status = 'DOCKED'
          ship.targetNodeId = null
        }
        ship.ticksInStatus = 0
      }
      break
    }

    case 'OFFLOADING': {
      ship.offloadTicksRemaining -= 1
      if (ship.cargoResourceId && ship.cargoAmount > 0) {
        const perTick = Math.ceil(ship.cargoAmount / Math.max(1, ship.offloadTicksRemaining + 1))
        const drop = Math.min(perTick, ship.cargoAmount)
        const current = inventory.stocks.get(ship.cargoResourceId) ?? 0
        inventory.stocks.set(ship.cargoResourceId, current + drop)
        ship.cargoAmount -= drop
        offloaded = drop
      }
      if (ship.offloadTicksRemaining <= 0 || ship.cargoAmount <= 0) {
        ship.cargoAmount = 0
        ship.cargoResourceId = null
        ship.status = 'DOCKED'
        ship.targetNodeId = null
        ship.ticksInStatus = 0
      }
      break
    }

    case 'NO_SIGNAL': {
      // PHASE 17.B.5 + SR2-4 — signal-lost crawl-home behavior. The ship drops drilling,
      // broadcasts a "stranded" beacon, and crawls toward homePosition at half normal speed
      // on battery alone (no fuel use — engines throttled by the offline autopilot). If
      // battery hits 0 mid-crawl, the solar trickle (NO_SIGNAL_SOLAR_TRICKLE) keeps building
      // charge so the ship eventually limps home rather than pinning forever.
      ship.ticksInNoSignal += 1
      ship.targetNodeId = null
      // Solar trickle ALWAYS runs in NO_SIGNAL — even at 0 battery, ship slowly recharges.
      ship.batteryPercent = Math.min(100, ship.batteryPercent + NO_SIGNAL_SOLAR_TRICKLE)
      const dx = ship.homePosition.x - ship.worldPosition.x
      const dy = ship.homePosition.y - ship.worldPosition.y
      const dz = ship.homePosition.z - ship.worldPosition.z
      const dist = Math.hypot(dx, dy, dz)
      if (dist <= NO_SIGNAL_CRAWL_SPEED_UNITS_PER_TICK) {
        ship.worldPosition = { ...ship.homePosition }
        ship.status = 'DOCKED'
        ship.ticksInStatus = 0
        ship.ticksInNoSignal = 0
      } else if (ship.batteryPercent > NO_SIGNAL_BATTERY_BURN) {
        // Crawl only if there's enough battery to pay the per-tick burn cost. Otherwise the
        // ship sits and recharges via solar trickle until it has enough to move again.
        const t = NO_SIGNAL_CRAWL_SPEED_UNITS_PER_TICK / dist
        ship.worldPosition = {
          x: ship.worldPosition.x + dx * t,
          y: ship.worldPosition.y + dy * t,
          z: ship.worldPosition.z + dz * t,
        }
        ship.batteryPercent = Math.max(0, ship.batteryPercent - NO_SIGNAL_BATTERY_BURN)
      }
      break
    }
  }

  // Super-review fix: signal-loss check after the case body. Battery hitting 0 mid-mission
  // flips to NO_SIGNAL → next tick the crawl-home logic takes over.
  maybeEnterNoSignal(ship)

  const statusChanged = ship.status !== prevStatus
  let beacon: ShipBeaconBroadcast | null = null
  if (currentTick % BEACON_INTERVAL_TICKS === 0 || statusChanged) {
    beacon = buildBeacon(ship, currentTick, ship.travelTicksRemaining)
  }
  return { statusChanged, beacon, drilled, offloaded }
}
