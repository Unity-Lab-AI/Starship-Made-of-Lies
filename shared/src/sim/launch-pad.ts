import { type CivId, type PlanetId, type TileId } from '../types/index'
import { type ColonyShipVariantId, getColonyShipDef } from './colony-ship'
import { type PlanetInventory, stockOf, tryConsumeAll } from './inventory'
import { type CitizenTier, type PlanetPopulation } from './population'
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
  // PHASE 17.J.10 — when the pad is staged from a saved blueprint instead of the catalog,
  // loadedShipVariantId carries the closest-match BASE variant (for downstream code paths
  // that need a stable id — render layer, suicide-ship flag, can-intercept flag), and this
  // field carries the resolved stats + display name. Cleared when the pad transitions to GONE
  // or is reset. launchShipFromPadAction reads this and threads `customBuild` into the
  // ColonyShipFlight via FlightCreateOptions.
  loadedCustomBuild: {
    displayName: string
    pieces: ReadonlyArray<string>
    stats: import('./colony-ship-build').ResolvedShipStats
  } | null
  buildTicksRemaining: number
  fuelLoaded: number
  ammoLoaded: number
  citizensLoaded: number
  // PHASE 17.L.A.6 — tier-aware citizen loading per SMOL_DESIGN_COLONY_SHIPS.md §9-NEW. The
  // scalar citizensLoaded is the SUM of this breakdown. Suicide ships only load from tier 4-5
  // (per user verbatim "above all citizens dont want to kill them selves but for the most
  // high tiered/happy/statas we have"); non-suicide ships fill from tier 1 upward. The
  // breakdown lets launchShipFromPadAction enforce the tier gate AND lets the deception ledger
  // record WHICH tiers were sent to their deaths for downstream propaganda-fallout math.
  citizensLoadedByTier: Record<CitizenTier, number>
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
    loadedCustomBuild: null,
    buildTicksRemaining: 0,
    fuelLoaded: 0,
    ammoLoaded: 0,
    citizensLoaded: 0,
    citizensLoadedByTier: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
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
  // PHASE 17.L.C.2 — hard energy gating on blueprint print. When the planet is in brownout
  // (capacity < draw AND fuel stockpile ≤ 0 per A.3), pads in PRINT/BUILD phases pause their
  // progression. The build resumes when the brownout clears. FUEL/AMMO phases self-pause
  // already (autopull is bounded by available inventory). Default false preserves legacy
  // callers that don't thread the planet's brownout state.
  brownoutActive = false,
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
      // PHASE 17.L.C.2 — brownout stalls the PRINT → BUILD transition. Player who started a
      // print during brownout sees the pad stay in PRINT until fuel returns.
      if (!brownoutActive) pad.state = 'BUILD'
      break
    case 'BUILD': {
      // PHASE 17.L.C.2 — brownout pauses build progression. buildTicksRemaining doesn't
      // decrement this tick. Pad stays in BUILD until brownout clears.
      if (brownoutActive) break
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
  pad.loadedCustomBuild = null
  pad.buildTicksRemaining = Math.max(1, Math.round(def.buildTimeTicks * buildTimeMultiplier))
  pad.fuelLoaded = 0
  pad.ammoLoaded = 0
  zeroCitizenLoad(pad)
  pad.state = 'PRINT'
  pad.lastOutcome = null
  return true
}

// PHASE 17.L.A.6 — zero both the scalar citizensLoaded AND the per-tier breakdown together so
// they never drift. Every reset path (startPrint / startPrintFromBlueprint / abort / GONE
// transition / external resets) routes through this helper.
function zeroCitizenLoad(pad: LaunchPad): void {
  pad.citizensLoaded = 0
  pad.citizensLoadedByTier = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
}

export function resetPadCitizenLoad(pad: LaunchPad): void {
  zeroCitizenLoad(pad)
}

// PHASE 17.J.10 — start a print run from a saved blueprint. The pad's loadedShipVariantId is
// the closest-match base variant (for downstream code paths that need a stable id —
// suicide-ship flag / can-intercept flag / payload tier / render layer). loadedCustomBuild
// carries the resolved blueprint stats which override the per-flight numbers via
// flightDef(). Total build cost = aggregated piece costs (NOT the base variant's buildCost).
export function startPrintFromBlueprint(
  pad: LaunchPad,
  baseVariantId: ColonyShipVariantId,
  displayName: string,
  pieces: ReadonlyArray<string>,
  stats: import('./colony-ship-build').ResolvedShipStats,
  totalCost: ReadonlyArray<{ resource: import('../types/index').ResourceId; amount: number }>,
  inventory: PlanetInventory,
  buildTimeMultiplier = 1,
): boolean {
  if (pad.state !== 'IDLE' && pad.state !== 'GONE') return false
  if (!tryConsumeAll(inventory, totalCost)) return false
  const baseDef = getColonyShipDef(baseVariantId)
  // Blueprint build time = base variant's build time scaled by piece-driven delta. Falls back
  // to baseDef.buildTimeTicks when the blueprint produces no delta (typical for v1 pieces).
  const buildTime = Math.max(
    1,
    Math.round((baseDef.buildTimeTicks + (stats.buildTimeDelta || 0)) * buildTimeMultiplier),
  )
  pad.loadedShipVariantId = baseVariantId
  pad.loadedCustomBuild = { displayName, pieces, stats }
  pad.buildTicksRemaining = buildTime
  pad.fuelLoaded = 0
  pad.ammoLoaded = 0
  zeroCitizenLoad(pad)
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

// PHASE 17.L.A.6 — tier-aware citizen loading per SMOL_DESIGN_COLONY_SHIPS.md §9-NEW.
// User verbatim (LAW #0): "remember above all citizens dont want to kill them selves but for
// the most high tiered/happy/statas we have". Suicide ships pull tier 5 first, then tier 4,
// and REFUSE to dip below tier 4 — that's the hard gate that makes the darkness arc work.
// Non-suicide ships fill from tier 1 upward (workers volunteer for normal colonies).
// Drains the planet population's tier counts as a side-effect — caller does NOT need to
// manually subtract. Returns the count actually loaded (may be less than requested).
export function loadCitizensFromVolunteerPool(
  pad: LaunchPad,
  population: PlanetPopulation,
  count: number,
  isSuicideShip: boolean,
): number {
  if (
    pad.state !== 'AMMO' &&
    pad.state !== 'READY' &&
    pad.state !== 'DOCK' &&
    pad.state !== 'FUEL'
  ) {
    return 0
  }
  if (!pad.loadedShipVariantId) return 0
  const def = getColonyShipDef(pad.loadedShipVariantId)
  const remaining = Math.max(0, def.payload.citizenCapacity - pad.citizensLoaded)
  if (remaining <= 0 || count <= 0) return 0
  const want = Math.min(count, remaining)
  // Suicide ships: tier 5 → tier 4 only. Non-suicide: tier 1 → 2 → 3 → 4 → 5 (lowest first).
  // The volunteer-pool reservation slider (PHASE 17.J.9) is honored implicitly — reserved
  // citizens stay in tierCounts so they're available to draw from here; the workforce side
  // (17.L.A.4) is what subtracts them from worker assignment.
  const tierOrder: ReadonlyArray<CitizenTier> = isSuicideShip ? [5, 4] : [1, 2, 3, 4, 5]
  let drawn = 0
  for (const tier of tierOrder) {
    if (drawn >= want) break
    const avail = population.tierCounts[tier]
    const pull = Math.min(want - drawn, avail)
    if (pull <= 0) continue
    population.tierCounts[tier] -= pull
    pad.citizensLoadedByTier[tier] += pull
    drawn += pull
  }
  pad.citizensLoaded += drawn
  return drawn
}

// PHASE 17.L.A.6 — citizen-tier gate enforcement for the launch action. Returns true when the
// pad's loaded citizen mix satisfies the ship's payloadTierRequired. Suicide ships demand
// 100% tier 4-5 aboard; non-suicide ships have no gate. Caller (launchShipFromPadAction) uses
// the false return to push an "Insufficient Volunteers" event and refuse the launch.
export function padCitizenMixSatisfiesShip(pad: LaunchPad): boolean {
  if (!pad.loadedShipVariantId) return false
  const def = getColonyShipDef(pad.loadedShipVariantId)
  if (!def.suicideShip) return true
  // All aboard must be tier 4 or 5. Lower-tier citizens aboard a suicide ship = refusal.
  const lowerTierAboard =
    pad.citizensLoadedByTier[1] + pad.citizensLoadedByTier[2] + pad.citizensLoadedByTier[3]
  return lowerTierAboard === 0
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

// PHASE 17.L.A.16 — pad-side abort per user verbatim 2026-05-11 (LAW #0): "hold up now all
// ships have abort that can be triggered by the player at any time". Previously refused to
// abort during PRINT / BUILD / DOCK — meaning a player who started a print couldn't cancel
// it even if they realized they picked the wrong variant or wanted to redirect resources.
// Now aborts during EVERY in-progress state (PRINT through LAUNCH). Only IDLE / INIT / GONE
// stay non-abortable — those are either "nothing happening" or "ship already gone" states
// where there's nothing to abort.
export function abort(pad: LaunchPad): boolean {
  if (
    pad.state === 'PRINT' ||
    pad.state === 'BUILD' ||
    pad.state === 'DOCK' ||
    pad.state === 'FUEL' ||
    pad.state === 'AMMO' ||
    pad.state === 'READY' ||
    pad.state === 'ARM' ||
    pad.state === 'LAUNCH'
  ) {
    pad.state = 'IDLE'
    pad.loadedShipVariantId = null
    pad.loadedCustomBuild = null
    pad.buildTicksRemaining = 0
    pad.fuelLoaded = 0
    pad.ammoLoaded = 0
    zeroCitizenLoad(pad)
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
