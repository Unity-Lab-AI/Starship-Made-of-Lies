import { type CivId, type PlanetId, type Vec3 } from '../types/index'
import { UNIVERSE_HALF_EXTENT } from './balance-constants'
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
  // PHASE 16.32 — ship out of comms range from launching civ. UMS BLACKOUT_SAT analog
  // (SMOL_REFERENCE_TRAJECTORY §11) — ship halts, activates LASER_HOME beacon, calls for help
  // that never comes (per user verbatim "send help but help never comes"). Can transition to
  // EMPTY_HULK when crew dies of starvation while stranded.
  | 'STRANDED'
  // PHASE 16.32 — crew all dead + no auto-guidance installed. Ship becomes a "bomb waiting"
  // (per user verbatim) — drifts on last-known velocity through toroidal space until it
  // collides with a planet (applyDetonationAoE at impact) or burns out after MAX_HULK_TICKS.
  | 'EMPTY_HULK'

export type ColonyShipOutcome = PadOutcome

// PHASE 16.33 — UMS 6 targeting modes per SMOL_REFERENCE_MISSILE.md UnityMissile.cs spec.
// Each mode reflects a different guidance package that biases the per-flight dispersion radius:
// - GPS:       baseline 1.0× dispersion. Always available — orbital position update from civ pad.
// - ANTENNA:   1.2× — radio direction-finding, jammable, looser lock.
// - SENSOR:    0.9× — passive thermal/RF sensor lock-on, slightly tighter.
// - LIDAR:     0.6× — active range-imaging, tight terminal guidance.
// - MANUAL:    1.1× — pilot-aimed pre-launch waypoint, deterministic but coarser than GPS.
// - SATELLITE: 0.3× — orbital laser-relay handoff, near-perfect guidance. UMS sat-laser tech.
// Modes are wired through the launch flow + persisted on each flight so LCD slot 8 + the flight
// detail panel can render the mode badge per ship. Tech-gating happens in TargetingModePanel.
export type TargetingMode = 'GPS' | 'ANTENNA' | 'SENSOR' | 'LIDAR' | 'MANUAL' | 'SATELLITE'

export const TARGETING_MODE_DISPERSION_MULTIPLIER: Readonly<Record<TargetingMode, number>> = {
  GPS: 1.0,
  ANTENNA: 1.2,
  SENSOR: 0.9,
  LIDAR: 0.6,
  MANUAL: 1.1,
  SATELLITE: 0.3,
}

export const TARGETING_MODE_EMOJI: Readonly<Record<TargetingMode, string>> = {
  GPS: '🛰️',
  ANTENNA: '📡',
  SENSOR: '📍',
  LIDAR: '🔬',
  MANUAL: '✋',
  SATELLITE: '🛸',
}

export const TARGETING_MODE_LABEL: Readonly<Record<TargetingMode, string>> = {
  GPS: 'GPS',
  ANTENNA: 'Antenna',
  SENSOR: 'Sensor',
  LIDAR: 'LIDAR',
  MANUAL: 'Manual',
  SATELLITE: 'Satellite',
}

export const TARGETING_MODE_DESCRIPTION: Readonly<Record<TargetingMode, string>> = {
  GPS: 'Orbital position update from pad — always-available baseline guidance.',
  ANTENNA: 'Radio direction-finding lock — jammable, looser terminal scatter.',
  SENSOR: 'Passive thermal/RF lock-on — slightly tighter than GPS.',
  LIDAR: 'Active range-imaging — tight terminal guidance, requires LIDAR array.',
  MANUAL: 'Pilot-aimed pre-launch waypoint — deterministic but coarser than GPS.',
  SATELLITE: 'Orbital laser-relay handoff — near-perfect guidance via UMS sat-laser tech.',
}

const DEFAULT_TARGETING_MODE: TargetingMode = 'GPS'

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

// PHASE 16.32 — ship systems thresholds.
// SIGNAL_LOST_TRIGGER_TICKS: ship needs to be outside signalRange for this many consecutive
//   ticks before transitioning to STRANDED. Matches UMS BLACKOUT_SAT 30-tick threshold.
// STARVATION_TIMER_TICKS: when life support exhausted, crew enters starvation countdown.
//   Crew dies 1-by-1 over this many ticks. Per user verbatim "crew lasts till food and water
//   funs out then a timer until death".
// MAX_HULK_DRIFT_TICKS: empty-hulk drift cap. If a hulk doesn't impact within this window,
//   it burns out (CRASH_LANDED outcome=SIGNAL_LOST — "lost in the void"). Prevents infinite
//   debris in long matches.
// GALACTIC_WRAP_BOUND: toroidal space half-width. Positions wrap modulo 2 × this on each axis.
//   Per user verbatim "space needs a universal wrap to it so ship going off right edge pops
//   back in on left edge". PHASE 17.I — source-of-truth is now UNIVERSE_HALF_EXTENT in
//   balance-constants; this module re-binds the const so existing call sites stay readable.
const SIGNAL_LOST_TRIGGER_TICKS = 30
const STARVATION_TIMER_TICKS = 30
// Super-review fix: hulk drift cap rescaled for the 7.5× larger universe. Old 200 ticks
// (~40 sec at 5 ticks/sec) was tuned for the 8000 wrap, hulks evaporated too fast for the
// player to see them at galactic zoom. 1500 ticks ≈ 5 min — hulk has time to traverse new
// 60000-bound space + give the player time to either ignore it or counter-launch.
const MAX_HULK_DRIFT_TICKS = 1500
const GALACTIC_WRAP_BOUND = UNIVERSE_HALF_EXTENT

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
  // PHASE 16.32 — ship systems state. powerRemaining/lifeSupportRemaining drain per tick;
  // crewAlive starts at citizensAboard + decrements during starvation; crewStarvationTimer
  // counts down once life support hits 0. signalLostTicks accumulates while ship is outside
  // launching civ's signalRange — at 30 consecutive ticks the ship goes STRANDED. hulkPosition
  // + hulkVelocity captured at EMPTY_HULK transition, drives drift simulation thereafter.
  readonly powerAtLaunch: number
  readonly lifeSupportAtLaunch: number
  readonly signalRangeUnits: number
  readonly autoGuidanceInstalled: boolean
  readonly powerSource: 'battery' | 'reactor' | 'solar'
  powerRemaining: number
  lifeSupportRemaining: number
  crewAlive: number
  crewStarvationTimer: number
  signalLostTicks: number
  hulkPosition: Vec3 | null
  hulkVelocity: Vec3 | null
  hulkTicksDrifted: number
  ticksFlown: number
  phase: FlightPhase
  outcome: ColonyShipOutcome | null
  signalLossSeed: number
  citizensAboard: number
  // PHASE 16.33 — UMS 6-mode targeting selection at launch. Default GPS for backwards compat
  // when older flight records lack the field (older saves and AI auto-launches that don't pick
  // a mode). Mode is preserved across redirect (god-control) so the same guidance package
  // applies post-redirect. Mode biases dispersion radius via TARGETING_MODE_DISPERSION_MULTIPLIER.
  readonly targetingMode: TargetingMode
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
  // PHASE 16.33 — optional. Defaults to GPS when omitted (AI / auto-fire / legacy code paths).
  // Player-facing launch flows thread the selected mode through from TargetingModePanel state.
  readonly targetingMode?: TargetingMode
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

function computeDispersionRadius(def: ColonyShipDef, seed: number, mode: TargetingMode): number {
  // UMS-faithful: better guidance package (speedMultiplier × evasionMultiplier) tightens
  // the terminal dispersion. The seed contribution is bounded — even worst-roll on a high-
  // spec ship stays within reasonable terminal radius. PHASE 16.33 layers the targeting-mode
  // multiplier on top — LIDAR/SATELLITE tighten further, ANTENNA/MANUAL widen.
  const guidanceFactor = Math.max(MIN_GUIDANCE_FACTOR, def.speedMultiplier * def.evasionMultiplier)
  const seedNoise = pseudoRandom(seed + 19)
  const noiseScalar = NOISE_FLOOR + (1 - NOISE_FLOOR) * seedNoise
  const modeMultiplier = TARGETING_MODE_DISPERSION_MULTIPLIER[mode]
  return (BASE_DISPERSION_RADIUS / guidanceFactor) * noiseScalar * modeMultiplier
}

export function newColonyShipFlight(opts: FlightCreateOptions): ColonyShipFlight {
  const def = getColonyShipDef(opts.variantId)
  const seed = opts.signalLossSeed ?? 0
  const targetingMode = opts.targetingMode ?? DEFAULT_TARGETING_MODE

  // PHASE 16.21 dispersion offset — UMS-faithful per SMOL_REFERENCE_TRAJECTORY.md §19.
  // Direction of the offset is in the plane perpendicular to the line-of-arrival
  // (target - from), so the offset is a lateral / above-or-below miss, not a long/short.
  // PHASE 16.33 — targeting mode biases the dispersion radius via computeDispersionRadius.
  const lineOfArrival = vec3Sub(opts.targetPosition, opts.fromPosition)
  const offsetDir = pseudoRandomPerpendicularUnit(lineOfArrival, seed)
  const dispersionRadius = computeDispersionRadius(def, seed, targetingMode)
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
    // PHASE 16.32 — ship-systems state initialized from variant def. crewAlive starts at
    // citizensAboard (the citizens being shipped — they need to survive the trip too); for
    // unmanned variants citizensAboard=0 so crewAlive=0 and starvation never fires.
    powerAtLaunch: def.powerCapacity,
    lifeSupportAtLaunch: def.crewSupportTicks,
    signalRangeUnits: def.signalRange,
    autoGuidanceInstalled: def.autoGuidanceInstalled,
    powerSource: def.powerSource,
    powerRemaining: def.powerCapacity,
    lifeSupportRemaining: def.crewSupportTicks,
    crewAlive: opts.citizensAboard,
    crewStarvationTimer: 0,
    signalLostTicks: 0,
    hulkPosition: null,
    hulkVelocity: null,
    hulkTicksDrifted: 0,
    ticksFlown: 0,
    phase: 'CLIMB',
    outcome: null,
    signalLossSeed: seed,
    citizensAboard: opts.citizensAboard,
    targetingMode,
  }
}

// PHASE 16.32 — toroidal universal-space wrap. Per user verbatim 2026-05-11 "space needs a
// universal wrap to it so ship going off right edge pops back in on left edge". Wraps a Vec3
// modulo 2 × GALACTIC_WRAP_BOUND on each axis (positions stay in [-bound, +bound]). Pure
// function — no mutation. Used by tickFlight + the EMPTY_HULK drift step.
export function galacticWrap(pos: Vec3): Vec3 {
  const bound = GALACTIC_WRAP_BOUND
  const span = bound * 2
  const wrap = (v: number): number => {
    let w = ((((v + bound) % span) + span) % span) - bound
    if (w === bound) w = -bound
    return w
  }
  return { x: wrap(pos.x), y: wrap(pos.y), z: wrap(pos.z) }
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

// PHASE 16.32 note: STRANDED + EMPTY_HULK are intentionally NOT in TERMINAL_PHASES — STRANDED
// can transition to EMPTY_HULK when stranded crew finally dies; EMPTY_HULK drifts and can
// transition to CRASH_LANDED via burn-out timeout OR planet impact (handled in MatchSim).
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

  // PHASE 16.32 — STRANDED: ship has halted (out of signal range, calling for help that never
  // comes). No arc progression, no position update. Life support + power still drain — crew
  // starves in place. Once crew dies, transition to EMPTY_HULK + drift begins. Position stays
  // at where the ship halted (arc-frozen at strandedProgress, computed from ticksFlown).
  if (flight.phase === 'STRANDED') {
    const frozenProgress = Math.min(1, flight.ticksFlown / Math.max(1, flight.totalTicks))
    const frozenPos = pointAlongArc(flight.arc, frozenProgress)
    tickLifeSupportAndCrew(flight)
    // If crew dies while stranded + no auto-guidance → EMPTY_HULK at current frozen position
    // with zero initial velocity (no momentum from arc since halted).
    if (
      flight.crewAlive <= 0 &&
      flight.lifeSupportRemaining <= 0 &&
      !flight.autoGuidanceInstalled
    ) {
      flight.phase = 'EMPTY_HULK'
      flight.hulkPosition = { ...frozenPos }
      flight.hulkVelocity = { x: 0, y: 0, z: 0 }
    }
    return {
      phaseChanged: flight.phase !== prevPhase,
      newPhase: flight.phase,
      currentPosition: frozenPos,
      progress: frozenProgress,
      outcome: null,
      altitude: vec3Length(frozenPos),
      distToTarget: vec3Distance(frozenPos, flight.trueTargetPosition),
      closingSpeed: 0,
      signalLost: true,
    }
  }

  // PHASE 16.32 — EMPTY_HULK: linear drift through wrapped space. No arc, no phase machine.
  // MatchSim handles collision-with-planet detection per tick (needs state.planets access).
  if (flight.phase === 'EMPTY_HULK' && flight.hulkPosition && flight.hulkVelocity) {
    const next: Vec3 = vec3Add(flight.hulkPosition, flight.hulkVelocity)
    flight.hulkPosition = galacticWrap(next)
    flight.hulkTicksDrifted += 1
    // Burn-out after MAX_HULK_DRIFT_TICKS — "lost in the void" CRASH_LANDED outcome=SIGNAL_LOST.
    if (flight.hulkTicksDrifted >= MAX_HULK_DRIFT_TICKS) {
      flight.phase = 'CRASH_LANDED'
      flight.outcome = 'SIGNAL_LOST'
    }
    return {
      phaseChanged: flight.phase !== prevPhase,
      newPhase: flight.phase,
      currentPosition: flight.hulkPosition,
      progress: 1,
      outcome: flight.outcome,
      altitude: vec3Length(flight.hulkPosition),
      distToTarget: vec3Distance(flight.hulkPosition, flight.trueTargetPosition),
      closingSpeed: 0,
      signalLost: true,
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

  // PHASE 16.32 — life-support + power drain + signal-range check + starvation timer. Has
  // to run BEFORE arc-progress phase transitions so STRANDED / EMPTY_HULK transitions can
  // pre-empt them.
  tickLifeSupportAndCrew(flight)
  tickPowerSystem(flight)
  const distFromLaunch = vec3Distance(currentPosition, flight.arc.start)
  if (distFromLaunch > flight.signalRangeUnits) {
    flight.signalLostTicks += 1
    if (flight.signalLostTicks >= SIGNAL_LOST_TRIGGER_TICKS) {
      flight.phase = 'STRANDED'
      const distToTarget = vec3Distance(currentPosition, flight.trueTargetPosition)
      return {
        phaseChanged: true,
        newPhase: 'STRANDED',
        currentPosition,
        progress,
        outcome: null,
        altitude: vec3Length(currentPosition),
        distToTarget,
        closingSpeed: 0,
        signalLost: true,
      }
    }
  } else if (flight.signalLostTicks > 0) {
    flight.signalLostTicks = Math.max(0, flight.signalLostTicks - 1)
  }
  // Empty-hulk transition from active flight: crew dead + no auto-guidance → freeze velocity
  // at current arc tangent and drift from current position.
  if (flight.crewAlive <= 0 && flight.lifeSupportRemaining <= 0 && !flight.autoGuidanceInstalled) {
    const prevProgress = Math.max(0, (flight.ticksFlown - 1) / Math.max(1, flight.totalTicks))
    const prevPos = pointAlongArc(flight.arc, prevProgress)
    const velocity: Vec3 = vec3Sub(currentPosition, prevPos)
    flight.phase = 'EMPTY_HULK'
    flight.hulkPosition = { ...currentPosition }
    flight.hulkVelocity = velocity
    return {
      phaseChanged: true,
      newPhase: 'EMPTY_HULK',
      currentPosition,
      progress,
      outcome: null,
      altitude: vec3Length(currentPosition),
      distToTarget: vec3Distance(currentPosition, flight.trueTargetPosition),
      closingSpeed: 0,
      signalLost: true,
    }
  }

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

// PHASE 16.32 — life-support + crew tick. Drains lifeSupportRemaining per tick. When out of
// life support: starvation timer counts down (STARVATION_TIMER_TICKS) and crewAlive
// decrements as starvation progresses (1 citizen dies per starvation-tick proportionally).
// Per user verbatim "the crew lasts till food and water funs out then a timer until death".
function tickLifeSupportAndCrew(flight: ColonyShipFlight): void {
  if (flight.crewAlive <= 0) return
  if (flight.lifeSupportRemaining > 0) {
    flight.lifeSupportRemaining = Math.max(0, flight.lifeSupportRemaining - 1)
    flight.crewStarvationTimer = 0
    return
  }
  // Out of food/water — starvation countdown begins.
  if (flight.crewStarvationTimer === 0) {
    flight.crewStarvationTimer = STARVATION_TIMER_TICKS
  }
  // Each starvation tick: kill ceil(crewAlive / starvationTimer) citizens. Gradual death.
  const willDie = Math.max(1, Math.ceil(flight.crewAlive / Math.max(1, flight.crewStarvationTimer)))
  flight.crewAlive = Math.max(0, flight.crewAlive - willDie)
  flight.crewStarvationTimer = Math.max(0, flight.crewStarvationTimer - 1)
}

// PHASE 16.32 — power tick. Reactor/battery drain at variant-tuned rate. Solar variants
// regenerate at solarRegenPerTick (capped at powerAtLaunch). When powerRemaining hits 0,
// life support drain rate doubles (no heat, no water reclamation) — implicit penalty handled
// by simply not regenerating life support (already mono-directional decrement).
function tickPowerSystem(flight: ColonyShipFlight): void {
  const drain = flight.powerSource === 'battery' ? 1.5 : flight.powerSource === 'solar' ? 0.5 : 1
  const regen = flight.powerSource === 'solar' ? 0.6 : 0
  flight.powerRemaining = Math.max(
    0,
    Math.min(flight.powerAtLaunch, flight.powerRemaining - drain + regen),
  )
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
  // PHASE 16.32 — EMPTY_HULK uses stored drift position (linear extrapolation from death tick).
  // STRANDED freezes at the position where the ship halted (ticksFlown didn't advance after
  // transition). All other phases use arc interpolation.
  if (flight.phase === 'EMPTY_HULK' && flight.hulkPosition) return flight.hulkPosition
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
  // PHASE 16.32: ship-systems telemetry. Power source + capacities + starvation status are
  // surfaced so FlightDetailPanel can render the per-ship systems block ("BATTERY 42%", "CREW
  // STARVING 18t left", "STRANDED — LASER HOME", etc.).
  readonly powerSource: 'battery' | 'reactor' | 'solar'
  readonly powerRemaining: number
  readonly powerAtLaunch: number
  readonly powerPct: number
  readonly lifeSupportRemaining: number
  readonly lifeSupportAtLaunch: number
  readonly lifeSupportPct: number
  readonly crewAlive: number
  readonly crewStarvationTimer: number
  readonly signalLostTicks: number
  readonly signalRangeUnits: number
  readonly autoGuidanceInstalled: boolean
  readonly distFromLaunch: number
  readonly hulkTicksDrifted: number
  // PHASE 16.33 — UMS 6-mode targeting selection per flight. Surfaced so LCD slot 8 +
  // FlightDetailPanel header can render the mode badge.
  readonly targetingMode: TargetingMode
}

export function flightTelemetrySnapshot(flight: ColonyShipFlight): FlightTelemetrySnapshot {
  const totalTicks = Math.max(1, flight.totalTicks)
  const progress = Math.min(1, flight.ticksFlown / totalTicks)
  // PHASE 16.32 — position source depends on phase. EMPTY_HULK uses stored hulkPosition;
  // STRANDED uses arc position frozen at ticksFlown (ticksFlown stopped advancing on entry);
  // active flights use arc interpolation.
  const currentPos =
    flight.phase === 'EMPTY_HULK' && flight.hulkPosition
      ? flight.hulkPosition
      : pointAlongArc(flight.arc, progress)
  const altitude = vec3Length(currentPos)
  const distToTarget = vec3Distance(currentPos, flight.trueTargetPosition)
  let closingSpeed = 0
  if (flight.ticksFlown > 0 && flight.phase !== 'STRANDED' && flight.phase !== 'EMPTY_HULK') {
    const prevProgress = Math.max(0, (flight.ticksFlown - 1) / totalTicks)
    const prevPos = pointAlongArc(flight.arc, prevProgress)
    const prevDist = vec3Distance(prevPos, flight.trueTargetPosition)
    closingSpeed = Math.max(0, prevDist - distToTarget)
  }
  // PHASE 16.32 — signal-lost flag now reflects either the cruise-blackout window OR the
  // new STRANDED / EMPTY_HULK states (both are out-of-comms by definition).
  const cruiseBlackout =
    progress >= SIGNAL_RANGE_PROGRESS_THRESHOLD && progress < 0.9 && flight.phase !== 'TARGET'
  const signalLost = cruiseBlackout || flight.phase === 'STRANDED' || flight.phase === 'EMPTY_HULK'
  const fuelPct =
    flight.fuelAtLaunch > 0 ? Math.max(0, flight.fuelRemaining / flight.fuelAtLaunch) : 0
  const powerPct =
    flight.powerAtLaunch > 0 ? Math.max(0, flight.powerRemaining / flight.powerAtLaunch) : 0
  const lifeSupportPct =
    flight.lifeSupportAtLaunch > 0
      ? Math.max(0, flight.lifeSupportRemaining / flight.lifeSupportAtLaunch)
      : 0
  const distFromLaunch = vec3Distance(currentPos, flight.arc.start)
  return {
    altitude,
    distToTarget,
    closingSpeed,
    signalLost,
    progress,
    fuelRemaining: flight.fuelRemaining,
    fuelAtLaunch: flight.fuelAtLaunch,
    fuelPct,
    powerSource: flight.powerSource,
    powerRemaining: flight.powerRemaining,
    powerAtLaunch: flight.powerAtLaunch,
    powerPct,
    lifeSupportRemaining: flight.lifeSupportRemaining,
    lifeSupportAtLaunch: flight.lifeSupportAtLaunch,
    lifeSupportPct,
    crewAlive: flight.crewAlive,
    crewStarvationTimer: flight.crewStarvationTimer,
    signalLostTicks: flight.signalLostTicks,
    signalRangeUnits: flight.signalRangeUnits,
    autoGuidanceInstalled: flight.autoGuidanceInstalled,
    distFromLaunch,
    hulkTicksDrifted: flight.hulkTicksDrifted,
    targetingMode: flight.targetingMode,
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
