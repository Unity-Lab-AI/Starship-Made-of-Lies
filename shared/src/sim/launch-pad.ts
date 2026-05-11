import { type CivId, type PlanetId, type TileId } from '../types/index'
import { type ColonyShipVariantId, getColonyShipDef } from './colony-ship'
import { type PlanetInventory, stockOf, tryConsumeAll } from './inventory'
import { RESOURCE_AMMUNITION, RESOURCE_FUEL } from './resources'

export type PadState =
  | 'INIT'
  | 'IDLE'
  | 'PRINT'
  | 'BUILD'
  | 'DOCK'
  | 'FUEL'
  | 'AMMO'
  | 'READY'
  | 'ARM'
  | 'LAUNCH'
  | 'GONE'

export type PadOutcome = 'TARGET_HIT' | 'PROBABLE_HIT' | 'SIGNAL_LOST' | 'INTERCEPTED' | 'ABORTED'

// PHASE 16.18 auto-load rates (units per sim tick). Tunable as economy balance shifts.
const PAD_AUTO_FUEL_PER_TICK = 5
const PAD_AUTO_AMMO_PER_TICK = 10

export interface PadTargetWaypoint {
  readonly targetPlanetId: PlanetId
  readonly targetTileId?: TileId
  readonly label?: string
}

export interface LaunchPad {
  readonly id: TileId
  readonly civId: CivId
  readonly planetId: PlanetId
  state: PadState
  isController: boolean
  loadedShipVariantId: ColonyShipVariantId | null
  buildTicksRemaining: number
  fuelLoaded: number
  ammoLoaded: number
  citizensLoaded: number
  targetQueue: PadTargetWaypoint[]
  activeTargetIdx: number
  lastOutcome: PadOutcome | null
  ticksSinceLastLaunch: number
}

export function newLaunchPad(
  id: TileId,
  civId: CivId,
  planetId: PlanetId,
  isController = false,
): LaunchPad {
  return {
    id,
    civId,
    planetId,
    state: 'INIT',
    isController,
    loadedShipVariantId: null,
    buildTicksRemaining: 0,
    fuelLoaded: 0,
    ammoLoaded: 0,
    citizensLoaded: 0,
    targetQueue: [],
    activeTargetIdx: 0,
    lastOutcome: null,
    ticksSinceLastLaunch: 0,
  }
}

export interface PadTickResult {
  readonly stateChanged: boolean
  readonly newState: PadState
  readonly buildJustCompleted: boolean
}

export function tickPad(
  pad: LaunchPad,
  inventory: PlanetInventory,
  buildTimeMultiplier = 1,
): PadTickResult {
  const prevState = pad.state
  pad.ticksSinceLastLaunch += 1

  switch (pad.state) {
    case 'INIT':
      pad.state = 'IDLE'
      break
    case 'IDLE':
      break
    case 'PRINT':
      pad.state = 'BUILD'
      break
    case 'BUILD': {
      if (pad.buildTicksRemaining > 0) {
        pad.buildTicksRemaining -= 1
      }
      if (pad.buildTicksRemaining <= 0 && pad.loadedShipVariantId) {
        pad.state = 'DOCK'
        return { stateChanged: true, newState: 'DOCK', buildJustCompleted: true }
      }
      break
    }
    case 'DOCK':
      pad.state = 'FUEL'
      break
    case 'FUEL': {
      if (!pad.loadedShipVariantId) {
        pad.state = 'IDLE'
        break
      }
      const def = getColonyShipDef(pad.loadedShipVariantId)
      // PHASE 16.18 game-vision-completion: auto-pull fuel from planet inventory each tick
      // so pads progress FUEL → AMMO without manual intervention. Without this the pad
      // sits in FUEL forever — directly violated the UMS-faithful "build cycles autonomously"
      // expectation. PER_TICK pull is conservative (5 units / tick) so a tank doesn't drain
      // in one frame; tunable later.
      if (pad.fuelLoaded < def.fuelRequirement) {
        const available = stockOf(inventory, RESOURCE_FUEL)
        const need = def.fuelRequirement - pad.fuelLoaded
        const pull = Math.min(PAD_AUTO_FUEL_PER_TICK, need, available)
        if (pull > 0) {
          inventory.stocks.set(RESOURCE_FUEL, available - pull)
          pad.fuelLoaded += pull
        }
      }
      if (pad.fuelLoaded >= def.fuelRequirement) {
        pad.state = 'AMMO'
      }
      break
    }
    case 'AMMO': {
      if (!pad.loadedShipVariantId) {
        pad.state = 'IDLE'
        break
      }
      const def = getColonyShipDef(pad.loadedShipVariantId)
      // Auto-pull ammo from inventory (matches FUEL pattern).
      if (pad.ammoLoaded < def.ammoRequirement) {
        const available = stockOf(inventory, RESOURCE_AMMUNITION)
        const need = def.ammoRequirement - pad.ammoLoaded
        const pull = Math.min(PAD_AUTO_AMMO_PER_TICK, need, available)
        if (pull > 0) {
          inventory.stocks.set(RESOURCE_AMMUNITION, available - pull)
          pad.ammoLoaded += pull
        }
      }
      if (pad.ammoLoaded >= def.ammoRequirement) {
        pad.state = 'READY'
      }
      break
    }
    case 'READY':
      break
    case 'ARM':
      break
    case 'LAUNCH':
      pad.state = 'GONE'
      pad.ticksSinceLastLaunch = 0
      break
    case 'GONE':
      break
  }

  void inventory
  void buildTimeMultiplier

  const stateChanged = pad.state !== prevState
  return { stateChanged, newState: pad.state, buildJustCompleted: false }
}

export function startPrint(
  pad: LaunchPad,
  shipVariantId: ColonyShipVariantId,
  inventory: PlanetInventory,
  buildTimeMultiplier = 1,
): boolean {
  if (pad.state !== 'IDLE' && pad.state !== 'GONE') return false
  const def = getColonyShipDef(shipVariantId)
  if (!tryConsumeAll(inventory, def.buildCost)) return false
  pad.loadedShipVariantId = shipVariantId
  pad.buildTicksRemaining = Math.max(1, Math.round(def.buildTimeTicks * buildTimeMultiplier))
  pad.fuelLoaded = 0
  pad.ammoLoaded = 0
  pad.citizensLoaded = 0
  pad.state = 'PRINT'
  pad.lastOutcome = null
  return true
}

export function loadFuel(pad: LaunchPad, amount: number): number {
  if (pad.state !== 'FUEL' || !pad.loadedShipVariantId) return 0
  const def = getColonyShipDef(pad.loadedShipVariantId)
  const need = Math.max(0, def.fuelRequirement - pad.fuelLoaded)
  const taken = Math.min(amount, need)
  pad.fuelLoaded += taken
  return taken
}

export function loadAmmo(pad: LaunchPad, amount: number): number {
  if (pad.state !== 'AMMO' || !pad.loadedShipVariantId) return 0
  const def = getColonyShipDef(pad.loadedShipVariantId)
  const need = Math.max(0, def.ammoRequirement - pad.ammoLoaded)
  const taken = Math.min(amount, need)
  pad.ammoLoaded += taken
  return taken
}

export function loadCitizens(pad: LaunchPad, count: number): number {
  if (pad.state !== 'AMMO' && pad.state !== 'READY') return 0
  if (!pad.loadedShipVariantId) return 0
  const def = getColonyShipDef(pad.loadedShipVariantId)
  const remaining = Math.max(0, def.payload.citizenCapacity - pad.citizensLoaded)
  const taken = Math.min(count, remaining)
  pad.citizensLoaded += taken
  return taken
}

export function arm(pad: LaunchPad): boolean {
  if (pad.state !== 'READY') return false
  pad.state = 'ARM'
  return true
}

export function disarm(pad: LaunchPad): boolean {
  if (pad.state !== 'ARM') return false
  pad.state = 'READY'
  return true
}

export function launch(pad: LaunchPad): boolean {
  if (pad.state !== 'ARM') return false
  if (pad.targetQueue.length === 0) return false
  if (pad.activeTargetIdx >= pad.targetQueue.length) return false
  pad.state = 'LAUNCH'
  return true
}

export function abort(pad: LaunchPad): boolean {
  if (
    pad.state === 'LAUNCH' ||
    pad.state === 'ARM' ||
    pad.state === 'READY' ||
    pad.state === 'AMMO' ||
    pad.state === 'FUEL'
  ) {
    pad.state = 'IDLE'
    pad.loadedShipVariantId = null
    pad.buildTicksRemaining = 0
    pad.fuelLoaded = 0
    pad.ammoLoaded = 0
    pad.citizensLoaded = 0
    pad.lastOutcome = 'ABORTED'
    return true
  }
  return false
}

export function recordOutcome(pad: LaunchPad, outcome: PadOutcome): void {
  pad.lastOutcome = outcome
}

export function setTargetQueue(pad: LaunchPad, waypoints: ReadonlyArray<PadTargetWaypoint>): void {
  pad.targetQueue = [...waypoints]
  pad.activeTargetIdx = 0
}

export function activeTarget(pad: LaunchPad): PadTargetWaypoint | null {
  if (pad.activeTargetIdx >= pad.targetQueue.length) return null
  return pad.targetQueue[pad.activeTargetIdx] ?? null
}

export function advanceTarget(pad: LaunchPad): PadTargetWaypoint | null {
  pad.activeTargetIdx += 1
  if (pad.activeTargetIdx >= pad.targetQueue.length) {
    pad.activeTargetIdx = 0
  }
  return activeTarget(pad)
}

export function readinessPercent(pad: LaunchPad): number {
  if (!pad.loadedShipVariantId) return 0
  const def = getColonyShipDef(pad.loadedShipVariantId)
  const buildTotal = Math.max(1, def.buildTimeTicks)
  switch (pad.state) {
    case 'INIT':
    case 'IDLE':
      return 0
    case 'PRINT':
    case 'BUILD':
      return Math.max(0, 1 - pad.buildTicksRemaining / buildTotal) * 0.5
    case 'DOCK':
      return 0.55
    case 'FUEL':
      return 0.55 + 0.2 * (def.fuelRequirement === 0 ? 1 : pad.fuelLoaded / def.fuelRequirement)
    case 'AMMO':
      return 0.75 + 0.15 * (def.ammoRequirement === 0 ? 1 : pad.ammoLoaded / def.ammoRequirement)
    case 'READY':
      return 0.9
    case 'ARM':
      return 0.97
    case 'LAUNCH':
    case 'GONE':
      return 1
  }
}
