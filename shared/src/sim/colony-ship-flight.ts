import { type CivId, type PlanetId, type Vec3 } from '../types/index'
import { type ColonyShipDef, type ColonyShipVariantId, getColonyShipDef } from './colony-ship'
import { type PadOutcome } from './launch-pad'
import {
  arcDuration,
  newSphericalArc,
  pointAlongArc,
  type SphericalArc,
  vec3Add,
  vec3Cross,
  vec3Distance,
  vec3Length,
  vec3Normalize,
  vec3Scale,
  vec3Sub,
} from './trajectory'

// PHASE 16.21 — UMS-faithful colony-ship flight per SMOL_REFERENCE_TRAJECTORY §19 +
// SMOL_REFERENCE_MISSILE UNITY_MSL telemetry spec. Full verbatim user directive lives in
// `.claude/TODO.md` PHASE 16.21 entry per LAW #0 (workflow docs only — code stays clean).
//
// What this module ports from UMS source (`_ums-reference/src/scripts/UnityMissile.cs` +
// `UnityPad.cs`):
//
// 1. **Outcome resolution by fnlDTT (final distance-to-target)** — replaces RNG roll. UMS
//    spec §19: TARGET HIT when fnlDTT < detDist*2 (~100m); PROBABLE HIT when phase=TARGET
//    and fnlDTT < 500m; SIGNAL LOST otherwise. SMoL is server-authoritative so we don't
//    do telemetry-timeout games — distance at terminal tick IS exact, but each variant has
//    a deterministic-per-seed dispersion offset that captures "how good is its guidance".
// 2. **Deterministic dispersion offset** — applied to arc endpoint at flight creation so the
//    3D arc visibly terminates OFFSET from target. Better variants (high speed × high evasion
//    = good guidance package) → tight dispersion → consistent TARGET_HIT. Lower-tier variants
//    spread wider → mix of PROBABLE_HIT / SIGNAL_LOST. Per-flight seed makes individual ships
//    of same variant vary while remaining deterministic across session restarts.
// 3. **UNITY_MSL telemetry fields** — UMS broadcasts mslPos / dist-to-tgt / altitude / phase
//    every tick on UNITY_MSL channel. We expose these on FlightTickResult so LCD slot 8
//    MISSILE STATUS panel can display UMS-style live telemetry per active flight.
// 4. **Closing-speed computation** — UMS uses for predictive intercept; SMoL exposes it as
//    telemetry so the player can see "ship is decelerating into target" / "ship is at peak
//    cruise speed".
// 5. **Signal-loss flag** — UMS converts to satellite when distFromLaunch > antennaRange.
//    SMoL doesn't do orbital conversion (yet) but flags signalLost on the same threshold so
//    LCDs can display "[SIGNAL LOST]" tag on the flight row.

export type FlightPhase =
  | 'CLIMB'
  | 'COAST'
  | 'REENTRY'
  | 'TARGET'
  | 'DETONATE'
  | 'INTERCEPTED'
  | 'ABORTED'
  | 'CRASH_LANDED'

export type ColonyShipOutcome = PadOutcome

declare const __flightBrand: unique symbol
type Brand<T, B> = T & { readonly [__flightBrand]: B }
export type ColonyShipFlightId = Brand<string, 'ColonyShipFlightId'>
export const colonyShipFlightId = (s: string): ColonyShipFlightId => s as ColonyShipFlightId

// UMS terminal-distance thresholds (.claude/SMOL_REFERENCE_TRAJECTORY.md §19 + §20)
// - TERMINAL_HIT_DIST: UMS detDist=50m, hit threshold is detDist*2 → 100m. Inside this →
//   direct detonation in-cone → TARGET_HIT.
// - TERMINAL_PROBABLE_DIST: UMS PROBABLE HIT cutoff — phase=TARGET reached but didn't quite
//   detonate in-cone. ≤500m → PROBABLE_HIT (significant damage, partial success).
// - SIGNAL_RANGE_TICKS: UMS antennaRange = 50000m; on SMoL the arc-length scale varies per
//   travelRadius. We approximate the "out of comms" envelope by arc-progress 0.6+ which is
//   typically the cruise apex on a great-circle arc.
const TERMINAL_HIT_DIST = 100
const TERMINAL_PROBABLE_DIST = 500
const SIGNAL_RANGE_PROGRESS_THRESHOLD = 0.6

// Variant guidance baseline. A nominal ship (speedMultiplier=1, evasionMultiplier=1) gets
// BASE_DISPERSION_RADIUS scatter when seedNoise=1. High-tier variants (Scout: 1.6 × 1.4 ≈ 2.24
// guidance factor) tighten this dramatically. Heavy/Saboteur slower-spec variants widen it.
const BASE_DISPERSION_RADIUS = 800
const MIN_GUIDANCE_FACTOR = 0.3
// Noise weight is the seed-driven portion of dispersion (the deterministic-per-flight randomness).
const NOISE_FLOOR = 0.55

export interface ColonyShipFlight {
  readonly id: ColonyShipFlightId
  readonly variantId: ColonyShipVariantId
  readonly launchingCivId: CivId
  readonly fromPlanetId: PlanetId
  readonly targetPlanetId: PlanetId
  readonly arc: SphericalArc
  readonly totalTicks: number
  // PHASE 16.21: world-space true target (what the player picked) preserved separately from
  // arc.end (which is target + deterministic dispersion offset). Outcome math compares the
  // final ship position against trueTargetPosition.
  readonly trueTargetPosition: Vec3
  readonly dispersionOffsetMagnitude: number
  // PHASE 16.24: per-flight fuel state per user verbatim "depending fuel and payload ect ect
  // whats loaded make them go bigg booms". fuelAtLaunch = def.fuelRequirement at creation.
  // fuelRemaining decays each tick at a variant-tuned rate; at detonation, AoE damage scales
  // with fuel-remaining + payload (more fuel = bigger boom, less fuel = smaller).
  readonly fuelAtLaunch: number
  fuelRemaining: number
  ticksFlown: number
  phase: FlightPhase
  outcome: ColonyShipOutcome | null
  signalLossSeed: number
  citizensAboard: number
}

export interface FlightCreateOptions {
  readonly id: ColonyShipFlightId
  readonly variantId: ColonyShipVariantId
  readonly launchingCivId: CivId
  readonly fromPlanetId: PlanetId
  readonly targetPlanetId: PlanetId
  readonly fromPosition: Vec3
  readonly targetPosition: Vec3
  readonly travelRadius: number
  readonly tickSpeedMultiplier?: number
  readonly citizensAboard: number
  readonly signalLossSeed?: number
}

export const BASE_TRAVEL_SPEED_PER_TICK = 5

// Deterministic seeded PRNG — used for dispersion offset direction + magnitude noise. Same
// flight seed always lands the same place across session restarts (no RNG-roll surprises).
function pseudoRandom(seed: number): number {
  let s = seed | 0
  s = (s * 1103515245 + 12345) & 0x7fffffff
  return s / 0x7fffffff
}

// Generate a deterministic 3D unit vector perpendicular to a reference axis. Used to scatter
// the dispersion offset in the plane perpendicular to the line-of-arrival, so the offset is
// always a "miss to the side / above / below" rather than "long" or "short".
function pseudoRandomPerpendicularUnit(axis: Vec3, seed: number): Vec3 {
  const axisUnit = vec3Normalize(axis)
  // Pick an arbitrary vector not parallel to axisUnit, then cross to get a perpendicular.
  const ref: Vec3 = Math.abs(axisUnit.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 }
  const tangent1 = vec3Normalize(vec3Cross(axisUnit, ref))
  const tangent2 = vec3Normalize(vec3Cross(axisUnit, tangent1))
  // Pick a 2D angle from the seed in tangent1/tangent2 plane.
  const theta = pseudoRandom(seed + 41) * Math.PI * 2
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  return vec3Normalize(vec3Add(vec3Scale(tangent1, cos), vec3Scale(tangent2, sin)))
}

function computeDispersionRadius(def: ColonyShipDef, seed: number): number {
  // UMS-faithful: better guidance package (speedMultiplier × evasionMultiplier) tightens
  // the terminal dispersion. The seed contribution is bounded — even worst-roll on a high-
  // spec ship stays within reasonable terminal radius.
  const guidanceFactor = Math.max(MIN_GUIDANCE_FACTOR, def.speedMultiplier * def.evasionMultiplier)
  const seedNoise = pseudoRandom(seed + 19)
  const noiseScalar = NOISE_FLOOR + (1 - NOISE_FLOOR) * seedNoise
  return (BASE_DISPERSION_RADIUS / guidanceFactor) * noiseScalar
}

export function newColonyShipFlight(opts: FlightCreateOptions): ColonyShipFlight {
  const def = getColonyShipDef(opts.variantId)
  const seed = opts.signalLossSeed ?? 0

  // PHASE 16.21 dispersion offset — UMS-faithful per SMOL_REFERENCE_TRAJECTORY.md §19.
  // Direction of the offset is in the plane perpendicular to the line-of-arrival
  // (target - from), so the offset is a lateral / above-or-below miss, not a long/short.
  const lineOfArrival = vec3Sub(opts.targetPosition, opts.fromPosition)
  const offsetDir = pseudoRandomPerpendicularUnit(lineOfArrival, seed)
  const dispersionRadius = computeDispersionRadius(def, seed)
  const adjustedTarget: Vec3 = vec3Add(opts.targetPosition, vec3Scale(offsetDir, dispersionRadius))

  const arc = newSphericalArc(opts.fromPosition, adjustedTarget, opts.travelRadius)
  const speed = BASE_TRAVEL_SPEED_PER_TICK * def.speedMultiplier * (opts.tickSpeedMultiplier ?? 1)
  const totalTicks = arcDuration(arc, speed)

  // True dispersion measured against the actual arc endpoint vs the original target — covers
  // the case where arc-endpoint projection onto the sphere slightly shifts the magnitude.
  const dispersionOffsetMagnitude = vec3Distance(arc.end, opts.targetPosition)

  return {
    id: opts.id,
    variantId: opts.variantId,
    launchingCivId: opts.launchingCivId,
    fromPlanetId: opts.fromPlanetId,
    targetPlanetId: opts.targetPlanetId,
    arc,
    totalTicks,
    trueTargetPosition: { ...opts.targetPosition },
    dispersionOffsetMagnitude,
    fuelAtLaunch: def.fuelRequirement,
    fuelRemaining: def.fuelRequirement,
    ticksFlown: 0,
    phase: 'CLIMB',
    outcome: null,
    signalLossSeed: seed,
    citizensAboard: opts.citizensAboard,
  }
}

export interface FlightTickResult {
  readonly phaseChanged: boolean
  readonly newPhase: FlightPhase
  readonly currentPosition: Vec3
  readonly progress: number
  readonly outcome: ColonyShipOutcome | null
  // PHASE 16.21 UNITY_MSL telemetry — UMS broadcasts these every tick on UNITY_MSL channel.
  // SMoL exposes them on FlightTickResult so panels/LCDs can display per-flight live data
  // (LCD slot 8 MISSILE STATUS shows altitude / dist-to-tgt / closing speed per active flight).
  readonly altitude: number
  readonly distToTarget: number
  readonly closingSpeed: number
  readonly signalLost: boolean
}

const TERMINAL_PHASES: ReadonlySet<FlightPhase> = new Set<FlightPhase>([
  'DETONATE',
  'INTERCEPTED',
  'ABORTED',
  'CRASH_LANDED',
])

// Track previous-tick distance per flight id to compute closing speed. Reset on tick=0.
// Module-level Map keyed by flight id so we don't bloat ColonyShipFlight with sim state.
const lastDistByFlightId = new Map<ColonyShipFlightId, number>()

export function tickFlight(flight: ColonyShipFlight): FlightTickResult {
  const prevPhase = flight.phase

  if (TERMINAL_PHASES.has(flight.phase)) {
    const pos = pointAlongArc(flight.arc, 1)
    lastDistByFlightId.delete(flight.id)
    return {
      phaseChanged: false,
      newPhase: flight.phase,
      currentPosition: pos,
      progress: 1,
      outcome: flight.outcome,
      altitude: vec3Length(pos),
      distToTarget: vec3Distance(pos, flight.trueTargetPosition),
      closingSpeed: 0,
      signalLost: false,
    }
  }

  flight.ticksFlown += 1
  const progress = Math.min(1, flight.ticksFlown / Math.max(1, flight.totalTicks))
  const currentPosition = pointAlongArc(flight.arc, progress)

  // PHASE 16.24: fuel decay per tick. UMS UnityMissile.cs burns thrusters in CLIMB+REENTRY,
  // coasts free in COAST. SMoL model: fuel rate is variant-driven (faster ships burn faster)
  // + phase-driven (CLIMB/REENTRY = 1.5×, COAST = 0.5×, TARGET = 1.0×). Total burn over
  // the full flight should land in 60-90% of fuelAtLaunch so ABORTED self-destructs in mid-
  // cruise still have meaningful fuel-fed AoE, while terminal detonations burn most fuel.
  const baseFuelPerTick = (flight.fuelAtLaunch / Math.max(1, flight.totalTicks)) * 0.75
  let phaseFuelMult = 1.0
  if (flight.phase === 'CLIMB' || flight.phase === 'REENTRY') phaseFuelMult = 1.5
  else if (flight.phase === 'COAST') phaseFuelMult = 0.5
  flight.fuelRemaining = Math.max(0, flight.fuelRemaining - baseFuelPerTick * phaseFuelMult)

  // UMS-faithful phase transitions — progress thresholds are tunable. UMS uses altitude/
  // distance-to-target on flat-Earth math; on SMoL's great-circle arc the analogous
  // breakpoints are progress fractions. SMOL_REFERENCE_TRAJECTORY.md §1 maps UMS phase
  // boundaries (CLIMB until dist>=climbDist; COAST until course corrected; REENTRY until
  // distToTgt<reentryDist/2; TARGET until detDist*2) onto deterministic arc fractions.
  if (progress < 0.15) flight.phase = 'CLIMB'
  else if (progress < 0.7) flight.phase = 'COAST'
  else if (progress < 0.95) flight.phase = 'REENTRY'
  else if (progress < 1) flight.phase = 'TARGET'
  else {
    flight.phase = 'DETONATE'
    flight.outcome = resolveOutcome(flight)
  }

  const distToTarget = vec3Distance(currentPosition, flight.trueTargetPosition)
  const altitude = vec3Length(currentPosition)
  const lastDist = lastDistByFlightId.get(flight.id)
  const closingSpeed = lastDist != null ? Math.max(0, lastDist - distToTarget) : 0
  lastDistByFlightId.set(flight.id, distToTarget)

  // UMS antennaRange=50000m bounded blackout — SMoL approximation: once past mid-cruise
  // (progress > 0.6), the ship is "beyond pad antenna range" and telemetry goes intermittent.
  // We flag signalLost so panels can render the "[SIG LOST]" indicator, but the server still
  // knows the deterministic position. Comes back to true at REENTRY when pad acquires via
  // signal layer (laser handoff in UMS UnitySignal — SMoL roadmap).
  const signalLost =
    progress >= SIGNAL_RANGE_PROGRESS_THRESHOLD && progress < 0.9 && flight.phase !== 'TARGET'

  return {
    phaseChanged: flight.phase !== prevPhase,
    newPhase: flight.phase,
    currentPosition,
    progress,
    outcome: flight.outcome,
    altitude,
    distToTarget,
    closingSpeed,
    signalLost,
  }
}

// PHASE 16.21 UMS-faithful outcome — replaces RNG roll. SMOL_REFERENCE_TRAJECTORY.md §19:
// fnlDTT < detDist*2 (~100m) → TARGET_HIT. phase reached TARGET and fnlDTT < 500m →
// PROBABLE_HIT. Otherwise → SIGNAL_LOST. Same flight seed always resolves to same outcome.
function resolveOutcome(flight: ColonyShipFlight): ColonyShipOutcome {
  const fnlDTT = flight.dispersionOffsetMagnitude
  if (fnlDTT < TERMINAL_HIT_DIST) return 'TARGET_HIT'
  if (fnlDTT < TERMINAL_PROBABLE_DIST) return 'PROBABLE_HIT'
  return 'SIGNAL_LOST'
}

export function intercept(
  flight: ColonyShipFlight,
  defenderCivId: CivId,
  reason: 'mine-field' | 'counter-ship',
): void {
  if (TERMINAL_PHASES.has(flight.phase)) return
  flight.phase = 'INTERCEPTED'
  flight.outcome = 'INTERCEPTED'
  void defenderCivId
  void reason
}

export function abortFlight(flight: ColonyShipFlight): void {
  if (TERMINAL_PHASES.has(flight.phase)) return
  flight.phase = 'ABORTED'
  flight.outcome = 'ABORTED'
}

export function markCrashLanded(flight: ColonyShipFlight): void {
  if (TERMINAL_PHASES.has(flight.phase)) return
  flight.phase = 'CRASH_LANDED'
  flight.outcome = 'SIGNAL_LOST'
}

export function flightCurrentPosition(flight: ColonyShipFlight): Vec3 {
  const t = Math.min(1, flight.ticksFlown / Math.max(1, flight.totalTicks))
  return pointAlongArc(flight.arc, t)
}

export function flightDistanceToTarget(flight: ColonyShipFlight): number {
  return vec3Distance(flightCurrentPosition(flight), flight.trueTargetPosition)
}

export function flightDef(flight: ColonyShipFlight): ColonyShipDef {
  return getColonyShipDef(flight.variantId)
}

// PHASE 16.21 — deterministic telemetry snapshot computable from flight state alone (no
// dependence on cross-tick caches). Used by LCD slot 8 MISSILE STATUS to render UMS-style
// per-flight live data (UNITY_MSL channel fields: altitude / distToTarget / closingSpeed).
// closingSpeed is computed by sampling the arc one tick back and taking the dist-delta —
// fully deterministic given (flight.arc, flight.ticksFlown, flight.totalTicks).
export interface FlightTelemetrySnapshot {
  readonly altitude: number
  readonly distToTarget: number
  readonly closingSpeed: number
  readonly signalLost: boolean
  readonly progress: number
  // PHASE 16.24: per-flight fuel state for live FlightDetailPanel display.
  readonly fuelRemaining: number
  readonly fuelAtLaunch: number
  readonly fuelPct: number
}

export function flightTelemetrySnapshot(flight: ColonyShipFlight): FlightTelemetrySnapshot {
  const totalTicks = Math.max(1, flight.totalTicks)
  const progress = Math.min(1, flight.ticksFlown / totalTicks)
  const currentPos = pointAlongArc(flight.arc, progress)
  const altitude = vec3Length(currentPos)
  const distToTarget = vec3Distance(currentPos, flight.trueTargetPosition)
  let closingSpeed = 0
  if (flight.ticksFlown > 0) {
    const prevProgress = Math.max(0, (flight.ticksFlown - 1) / totalTicks)
    const prevPos = pointAlongArc(flight.arc, prevProgress)
    const prevDist = vec3Distance(prevPos, flight.trueTargetPosition)
    closingSpeed = Math.max(0, prevDist - distToTarget)
  }
  const signalLost =
    progress >= SIGNAL_RANGE_PROGRESS_THRESHOLD && progress < 0.9 && flight.phase !== 'TARGET'
  const fuelPct =
    flight.fuelAtLaunch > 0 ? Math.max(0, flight.fuelRemaining / flight.fuelAtLaunch) : 0
  return {
    altitude,
    distToTarget,
    closingSpeed,
    signalLost,
    progress,
    fuelRemaining: flight.fuelRemaining,
    fuelAtLaunch: flight.fuelAtLaunch,
    fuelPct,
  }
}

// PHASE 16.24 — AoE damage computation per user verbatim "it damages area of effect fo like
// sending them to attack all ships depending fuel and payload ect ect whats loaded make them
// go bigg booms but it takes like 30-50 missile to wipe out a vmiulti plaet civ".
//
// Damage formula:
//   fuelEnergy      = fuelRemaining / 50            // normalized "burn boom" scalar
//   payloadEnergy   = explosiveYield + weaponPayload * 0.5
//   citizenEnergy   = suicideShip ? citizens * 2 : 0   // dark-comedy multiplier
//   totalEnergy     = fuelEnergy + payloadEnergy + citizenEnergy + 1
//   radius          = 80 + sqrt(totalEnergy) * 14     // visible AoE in world units
//   magnitude       = totalEnergy * (suicide ? 1.4 : 1.0)
//
// Balance check at default values:
// - Heavy variant (suicide, payload 800, citizens 0, fuel 150):
//     fuelEnergy = 3, payloadEnergy = 800, citizenEnergy = 0 → totalEnergy = 804
//     radius = 80 + 28.4*14 ≈ 478, magnitude = 804 → ~1 missile = significant city damage
// - Pilgrim Volunteer (suicide, payload 0, citizens 500, fuel 80):
//     fuelEnergy = 1.6, payloadEnergy = 0, citizenEnergy = 1000 → 1002 totalEnergy
//     radius = 80 + 31.6*14 ≈ 522, magnitude × 1.4 = 1403 → fewer needed for a full wipe
// - 30-50 missile balance target for multi-planet civ ≈ population ÷ avg-magnitude

export interface FlightDetonationAoE {
  readonly radius: number
  readonly magnitude: number
  readonly fuelEnergy: number
  readonly payloadEnergy: number
  readonly citizenEnergy: number
}

export function computeDetonationAoE(flight: ColonyShipFlight): FlightDetonationAoE {
  const def = getColonyShipDef(flight.variantId)
  const fuelEnergy = flight.fuelRemaining / 50
  const payloadEnergy = def.payload.explosiveYield + def.payload.weaponPayload * 0.5
  const citizenEnergy = def.suicideShip ? flight.citizensAboard * 2 : 0
  const totalEnergy = fuelEnergy + payloadEnergy + citizenEnergy + 1
  const radius = 80 + Math.sqrt(totalEnergy) * 14
  const magnitude = totalEnergy * (def.suicideShip ? 1.4 : 1.0)
  return { radius, magnitude, fuelEnergy, payloadEnergy, citizenEnergy }
}
