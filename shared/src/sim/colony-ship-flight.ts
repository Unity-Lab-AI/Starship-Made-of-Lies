import { type CivId, type PlanetId, type ResourceId, type Vec3 } from '../types/index'
import { UNIVERSE_HALF_EXTENT } from './balance-constants'
import { type ColonyShipDef, type ColonyShipVariantId, getColonyShipDef } from './colony-ship'
import { type ResolvedShipStats } from './colony-ship-build'
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
  // PHASE 17.L.A.11 — shuttle hold-state. Set by tickShuttleLeg when an OUTBOUND shuttle
  // flight reaches its target — the ship "lands and mines" for extractingTicksRemaining ticks
  // before flipping to INBOUND. tickFlight returns the arc-end position with no progression
  // during EXTRACTING so the ship visually sits at the target.
  | 'EXTRACTING'

export type ColonyShipOutcome = PadOutcome

// PHASE 17.L.A.11 — Q5 PHASE 17 LOCKED ("all three yes"). Three mining-flight modes:
//
//   • 'oneway'         — fire-and-forget. Ship completes its arc, lands at target, mines
//                        whatever cargo it can extract, and stays there (or drifts). Player
//                        recovers later via a separate retrieval flight if they want.
//                        Default for all non-mining colony-ship variants — they fly oneway
//                        by nature (suicide ships / weapon platforms / final colony ships).
//   • 'shuttle-single' — auto-recall loop. Ship reaches target, EXTRACTING countdown loads
//                        cargo, then flips to INBOUND back to home, deposits cargo, then
//                        relaunches OUTBOUND to the same target. Cycles indefinitely until
//                        the player aborts. UMS UnityBeacon shuttle-cycle parity.
//   • 'shuttle-multi'  — multi-planet rotation. Same auto-recall loop but cycles between
//                        `assignedTargets[]` round-robin. UMS multi-planet route parity.
//
// FlightKind is set at launch via the LaunchManifestModal's Mining Mode picker (visible
// only when the loaded variant is SHIP_MINING). Non-mining variants always launch oneway.
export type FlightKind = 'oneway' | 'shuttle-single' | 'shuttle-multi'

// PHASE 17.L.A.11 — shuttle leg discriminator. null for oneway flights (the leg concept
// doesn't apply). For shuttle flights, tracks which half of the cycle the ship is in:
//
//   • OUTBOUND   — flying from home to current target. Normal CLIMB → COAST → TARGET phases.
//   • EXTRACTING — at the target, mining ore. extractingTicksRemaining counts down. When 0,
//                  cargo is loaded and the leg flips to INBOUND.
//   • INBOUND    — flying from target back to home. Normal CLIMB → COAST → TARGET phases
//                  but with the arc reversed. On terminal "hit" at home, cargo deposits to
//                  the home inventory + next cycle starts (OUTBOUND to the same or next
//                  assigned target depending on flightKind).
export type ShuttleLeg = 'OUTBOUND' | 'EXTRACTING' | 'INBOUND' | null

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
// Super-review SR2-7 + SR2-12 — universe-size-dependent timers. SIGNAL_LOST_TRIGGER_TICKS
// stays at 30 (comms-quality threshold, not universe-scale dependent). STARVATION + HULK
// scale together with UNIVERSE_HALF_EXTENT so they stay consistent when the universe size
// changes. Derive from a typical hulk velocity so the "max drift" represents twice the
// universe traversal time at typical speed.
const SIGNAL_LOST_TRIGGER_TICKS = 30
const TYPICAL_HULK_VELOCITY_UNITS_PER_TICK = 80
const STARVATION_TIMER_TICKS = 150
const MAX_HULK_DRIFT_TICKS = Math.ceil(
  ((UNIVERSE_HALF_EXTENT * 2) / TYPICAL_HULK_VELOCITY_UNITS_PER_TICK) * 2,
)
const GALACTIC_WRAP_BOUND = UNIVERSE_HALF_EXTENT

// Variant guidance baseline. A nominal ship (speedMultiplier=1, evasionMultiplier=1) gets
// BASE_DISPERSION_RADIUS scatter when seedNoise=1. High-tier variants (Scout: 1.6 × 1.4 ≈ 2.24
// guidance factor) tighten this dramatically. Heavy/Saboteur slower-spec variants widen it.
const BASE_DISPERSION_RADIUS = 800
const MIN_GUIDANCE_FACTOR = 0.3
// Noise weight is the seed-driven portion of dispersion (the deterministic-per-flight randomness).
const NOISE_FLOOR = 0.55

// PHASE 17.J.10 — custom build flown from a saved blueprint. When set on a flight, the
// `flightDef()` helper synthesizes a ColonyShipDef-shape from `stats` + base variant metadata
// instead of looking up the catalog. `baseVariantId` is the closest-match catalog variant
// used for visual rendering + downstream code paths that need a stable variant id (e.g.
// suicideShip flag, canIntercept flag). Stats themselves come from the blueprint resolution.
export interface CustomShipBuild {
  readonly displayName: string
  readonly pieces: ReadonlyArray<string>
  readonly stats: ResolvedShipStats
  readonly baseVariantId: ColonyShipVariantId
}

export interface ColonyShipFlight {
  readonly id: ColonyShipFlightId
  readonly variantId: ColonyShipVariantId
  readonly customBuild: CustomShipBuild | null
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
  // PHASE 17.L.A.1 — reactor-fuel-aboard tracking. Reactor variants carry their tier-specific
  // radioactive load (rare metals / fusion fuel / antimatter) consumed at launch (17.J.5) and
  // drained per tick in flight. When reactorFuelRemaining hits 0 the reactor scrams and the
  // flight transitions to STRANDED. Solar / battery variants set reactorFuelAtLaunch = 0 and
  // skip the drain. Per user verbatim "fuel is just a waiting time bomb" — reactor end-of-life
  // is one of the natural ending pathways alongside crew starvation + power-out.
  readonly reactorFuelAtLaunch: number
  reactorFuelRemaining: number
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
  // PHASE 17.L.A.17 — self-destruct armed at launch. Set true ONLY when the launching civ has
  // researched TECH_SELF_DESTRUCT_SYSTEMS AND the variant has def.selfDestructCapable. Per user
  // verbatim "researched and installed on the ship". abortFlight refuses when this is false —
  // the ship must end via natural causes (impact / crash / starvation / power-out / fuel-out /
  // reactor explosion at end-of-life).
  readonly selfDestructInstalled: boolean
  // PHASE 17.L.A.7 — Q3 PHASE 17 LOCKED closure: "what crew and supplies and the loading of
  // ammunition". Cargo manifest loaded into the ship at launch. Mirrors citizensAboard for the
  // crew side. Map<ResourceId, number> — sum-of-values gated by def.payload.cargoCapacity on
  // the pad side (loadCargoFromInventory). On TARGET_HIT outcomes the cargo deposits into the
  // target planet inventory (colonization bootstrap). On other outcomes (signal-loss / abort /
  // intercept / crash) the cargo is lost — same way as the citizens. Also mutated by shuttle
  // mining (PHASE 17.L.A.11) — extraction at target fills, deposit at home empties.
  cargoAboard: Map<ResourceId, number>
  // PHASE 17.L.A.11 — Q5 PHASE 17 LOCKED ("all three yes"). Three mining-flight modes —
  // see FlightKind doc-comment above. Defaults to 'oneway' for legacy launches that don't
  // set this (every non-mining variant + AI/auto-fire paths). Player-driven mining launches
  // pick the mode via the LaunchManifestModal Mining Mode picker.
  readonly flightKind: FlightKind
  // PHASE 17.L.A.11 — home planet id for shuttle modes. Mirrors fromPlanetId at launch but
  // stays stable across OUTBOUND ↔ INBOUND leg flips (the fresh-flight construction swaps
  // fromPlanetId per leg). Cargo deposits land here on INBOUND arrival. Set equal to
  // fromPlanetId for oneway flights (effectively unused).
  readonly homePlanetId: PlanetId
  // PHASE 17.L.A.11 — list of mining targets for shuttle modes. Always non-empty for shuttle
  // flights — single-target shuttles get `[target]` (idx always 0); multi-target shuttles get
  // `[target1, target2, ...]` with idx advancing per cycle. Empty for oneway flights (the
  // single target lives in targetPlanetId / trueTargetPosition).
  readonly assignedTargets: ReadonlyArray<PlanetId>
  // PHASE 17.L.A.11 — current position in the assignedTargets rotation. Always 0 for oneway
  // and shuttle-single. shuttle-multi increments wrapping mod assignedTargets.length when a
  // home-return completes.
  currentAssignedTargetIdx: number
  // PHASE 17.L.A.11 — shuttle leg discriminator — see ShuttleLeg doc-comment above. null
  // for oneway flights. shuttle flights start as 'OUTBOUND' and cycle through the legs.
  shuttleLeg: ShuttleLeg
  // PHASE 17.L.A.11 — counter for completed home-return cycles. Bumps each time the ship
  // makes it back home with cargo deposited. Used by the MiningFleetPanel for the "Cycles:
  // N" readout and by the AI to evaluate "should I recall this shuttle".
  shuttleCyclesCompleted: number
  // PHASE 17.L.A.11 — countdown ticks while shuttleLeg === 'EXTRACTING'. Decrements by 1
  // per tick. When it hits 0, cargo is loaded onto cargoAboard + the leg flips to INBOUND.
  // Constant duration regardless of variant for v1; tuned by EXTRACTING_TICKS.
  extractingTicksRemaining: number
  // PHASE 17.2.4 — telemetry ring buffer on the flight itself (replaces TelemetryGraphPanel's
  // client-side useRef ring). Sim-owned so the data survives panel mount/unmount cycles and
  // becomes serializable for PHASE 18.3 match-replay playback. Capped at TELEMETRY_LOG_RING_SIZE
  // samples — at default DEFAULT_TICK_MS=200ms / 1x speed that's ~60 seconds of history.
  // Push happens at the end of tickFlight for non-terminal phases; terminal phases retain the
  // last in-flight history for post-mortem inspection in FlightDetailPanel.
  telemetryLog: FlightTelemetrySnapshot[]
}

// PHASE 17.2.4 — ring buffer size for flight.telemetryLog. 300 samples = ~60s @ 1x speed.
export const TELEMETRY_LOG_RING_SIZE = 300

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
  // PHASE 17.J.10 — when set, this flight was built from a saved blueprint rather than a
  // catalog ship. variantId still carries the closest-match base variant for downstream code
  // that needs a stable id; customBuild.stats override the per-tick numbers (fuel/power/etc.)
  // via flightDef().
  readonly customBuild?: CustomShipBuild
  // PHASE 17.L.A.17 — caller passes true when launching civ has researched
  // TECH_SELF_DESTRUCT_SYSTEMS AND the variant has def.selfDestructCapable. Defaults false for
  // legacy code paths (AI quickfire, test setup) so the gate stays restrictive by default.
  readonly selfDestructInstalled?: boolean
  // PHASE 17.L.A.7 — cargo manifest copied from pad.cargoLoaded at launch. Defaults to empty
  // for legacy AI / auto-fire paths that don't surface the LaunchManifestModal. Snapshot copy
  // (caller's Map is not retained) so subsequent pad resets don't mutate the in-flight cargo.
  readonly cargoAboard?: ReadonlyMap<ResourceId, number>
  // PHASE 17.L.A.11 — mining flight mode. Defaults to 'oneway' when omitted so existing
  // AI/auto-fire/colony-ship launches stay oneway. Player-driven mining launches via the
  // LaunchManifestModal supply shuttle-single or shuttle-multi.
  readonly flightKind?: FlightKind
  // PHASE 17.L.A.11 — planet rotation for shuttle modes. Defaults to empty array (oneway).
  // For shuttle-single, expect a single-element array. For shuttle-multi, 2+ entries.
  readonly assignedTargets?: ReadonlyArray<PlanetId>
  // PHASE 17.L.A.11 — stable home planet id for shuttle modes. Falls back to fromPlanetId
  // when omitted. tickShuttleLeg uses this to figure out where the INBOUND leg flies back to
  // since fromPlanetId flips per leg as the ship cycles.
  readonly homePlanetId?: PlanetId
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
  // PHASE 17.J.10 — when a customBuild is supplied, derive runtime def from blueprint stats
  // overlaid on the base variant's metadata. Base variant supplies suicideShip / canIntercept /
  // emoji / payload-tier-required / power-source-derived fields; blueprint stats override
  // fuel / power / signal-relevant numbers.
  const def = opts.customBuild
    ? synthesizeCustomDef(opts.customBuild)
    : getColonyShipDef(opts.variantId)
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
    customBuild: opts.customBuild ?? null,
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
    // PHASE 17.L.A.1 — reactor variants get fuel sized to "trip-length + buffer" so normal
    // flights complete with fuel to spare but god-control redirects + long detours can strand.
    // Non-reactor variants set this to 0 — they're solar/battery and don't drain reactor fuel.
    reactorFuelAtLaunch:
      def.powerSource === 'reactor'
        ? Math.max(totalTicks + REACTOR_FUEL_BUFFER_TICKS, def.reactorFuelAmount * 4)
        : 0,
    reactorFuelRemaining:
      def.powerSource === 'reactor'
        ? Math.max(totalTicks + REACTOR_FUEL_BUFFER_TICKS, def.reactorFuelAmount * 4)
        : 0,
    crewAlive: opts.citizensAboard,
    crewStarvationTimer: 0,
    signalLostTicks: 0,
    hulkPosition: null,
    hulkVelocity: null,
    hulkTicksDrifted: 0,
    ticksFlown: 0,
    phase: 'CLIMB',
    outcome: null,
    selfDestructInstalled: opts.selfDestructInstalled ?? false,
    signalLossSeed: seed,
    citizensAboard: opts.citizensAboard,
    targetingMode,
    // PHASE 17.L.A.7 — snapshot the cargo manifest into a fresh Map so the pad can be
    // recycled (cargoLoaded.clear() on next print) without disturbing the in-flight ship's
    // cargo state. The Map is mutable on the flight (shuttle mining mutates it on extraction
    // + deposit cycles per PHASE 17.L.A.11); the launch-time snapshot prevents that.
    cargoAboard: opts.cargoAboard ? new Map(opts.cargoAboard) : new Map(),
    // PHASE 17.L.A.11 — mining-flight 3-mode discriminator. Defaults to 'oneway' so every
    // legacy AI / auto-fire / non-mining variant stays oneway. shuttle modes start with
    // shuttleLeg = 'OUTBOUND' so the post-arrival recycle handler knows to flip to EXTRACTING.
    // homePlanetId defaults to fromPlanetId (the launch planet stays as home across legs).
    flightKind: opts.flightKind ?? 'oneway',
    assignedTargets: opts.assignedTargets ? [...opts.assignedTargets] : [],
    currentAssignedTargetIdx: 0,
    shuttleLeg:
      opts.flightKind === 'shuttle-single' || opts.flightKind === 'shuttle-multi'
        ? 'OUTBOUND'
        : null,
    shuttleCyclesCompleted: 0,
    extractingTicksRemaining: 0,
    homePlanetId: opts.homePlanetId ?? opts.fromPlanetId,
    // PHASE 17.2.4 — telemetry ring starts empty; samples push at end of tickFlight.
    telemetryLog: [],
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

  // PHASE 17.L.A.11 — EXTRACTING hold-state. Shuttle flight has landed at its target and is
  // mining for `extractingTicksRemaining` ticks. tickShuttleLeg owns the countdown + INBOUND
  // transition; tickFlight just freezes the arc position so the visual doesn't drift. Life
  // support / power / crew starvation still drain — a shuttle stranded at a hostile mining
  // target can still lose its crew, but the ship doesn't budge from the target until tickShuttleLeg
  // flips it INBOUND with a fresh return arc.
  if (flight.phase === 'EXTRACTING') {
    const arcEndPos = pointAlongArc(flight.arc, 1)
    tickLifeSupportAndCrew(flight)
    tickPowerSystem(flight)
    return {
      phaseChanged: false,
      newPhase: flight.phase,
      currentPosition: arcEndPos,
      progress: 1,
      outcome: null,
      altitude: vec3Length(arcEndPos),
      distToTarget: vec3Distance(arcEndPos, flight.trueTargetPosition),
      closingSpeed: 0,
      signalLost: false,
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
  // PHASE 17.L.A.1 — reactor scram check. After tickPowerSystem drains, if a reactor variant
  // has hit 0 fuel, the reactor goes cold and the flight goes STRANDED in place. Crew + life
  // support still drain in STRANDED state per existing PHASE 16.32 logic; eventually crew dies
  // and EMPTY_HULK drift takes over (the "waiting time bomb" natural-end chain per user
  // verbatim 2026-05-11).
  if (
    flight.powerSource === 'reactor' &&
    flight.reactorFuelAtLaunch > 0 &&
    flight.reactorFuelRemaining <= 0
  ) {
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
      signalLost: false,
    }
  }
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

  // PHASE 17.2.4 — push a deterministic snapshot into the ring buffer on every non-terminal
  // tick. Terminal phases (DETONATE/INTERCEPTED/ABORTED/CRASH_LANDED) take the early return
  // path above and skip this push, so the ring captures only in-flight history. The push uses
  // flightTelemetrySnapshot() which already mirrors every UMS UNITY_MSL field plus the SMoL
  // additions (fuel/power/life-support/crew/signal), so panels can render against this log
  // without duplicating the derivation logic. PHASE 18.3 match-replay system will read this
  // log directly for cinematic playback.
  flight.telemetryLog.push(flightTelemetrySnapshot(flight))
  if (flight.telemetryLog.length > TELEMETRY_LOG_RING_SIZE) {
    flight.telemetryLog.splice(0, flight.telemetryLog.length - TELEMETRY_LOG_RING_SIZE)
  }

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
  // PHASE 17.L.A.1 — reactor fuel drain per tick. Solar/battery skip (reactorFuelAtLaunch = 0).
  // The STRANDED transition on fuel-out is handled by tickFlight inline so it can return the
  // proper FlightTickResult shape; here we just drain the counter.
  if (flight.powerSource === 'reactor' && flight.reactorFuelRemaining > 0) {
    flight.reactorFuelRemaining = Math.max(0, flight.reactorFuelRemaining - 1)
  }
}

// PHASE 17.L.A.1 — buffer ticks added beyond totalTicks so normal-trajectory flights complete
// with fuel margin but god-control redirects + long detours strand. Picked 50 = ~10 seconds of
// gameplay at the default 5 tick/sec rate. Tunable.
export const REACTOR_FUEL_BUFFER_TICKS = 50

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

// PHASE 17.L.A.17 — mid-flight abort (self-destruct) gated on the flight's selfDestructInstalled
// flag per user verbatim 2026-05-11 (LAW #0): "i meant its a tach that needs to be researched
// andd installed on the ship before u can self destruct ships". The flag is set true at launch
// only when launching civ has researched TECH_SELF_DESTRUCT_SYSTEMS AND def.selfDestructCapable.
// Returns true when the abort succeeded, false when it was refused (terminal phase OR no
// self-destruct system). Caller (useMatchSim abortFlightById) surfaces the refusal upstream.
export function abortFlight(flight: ColonyShipFlight): boolean {
  if (TERMINAL_PHASES.has(flight.phase)) return false
  if (!flight.selfDestructInstalled) return false
  flight.phase = 'ABORTED'
  flight.outcome = 'ABORTED'
  return true
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
  // PHASE 17.J.10 — custom-build flights synthesize a def from the blueprint stats overlaid
  // on the base variant. Catalog flights pass straight through.
  if (flight.customBuild) return synthesizeCustomDef(flight.customBuild)
  return getColonyShipDef(flight.variantId)
}

// PHASE 17.J.10 — build a ColonyShipDef-shaped object from a blueprint. Base variant supplies
// suicideShip / canIntercept / category / darknessTier / payloadTierRequired / power-source-
// derived fields; blueprint stats override the per-tick numbers. Used by `newColonyShipFlight`
// + `flightDef` so downstream code paths don't have to branch on custom-vs-catalog.
function synthesizeCustomDef(build: CustomShipBuild): ColonyShipDef {
  const base = getColonyShipDef(build.baseVariantId)
  const stats = build.stats
  // buildCost: aggregate from blueprint pieces — kept as derived field at the build-action
  // layer; at the flight layer we only need per-tick economy fields. Use base.buildCost as a
  // sensible default for any consumer that reads it post-launch (which is rare — buildCost
  // is consumed at print/build phase, not flight phase).
  return {
    ...base,
    name: build.displayName,
    fuelRequirement: stats.fuelRequirement || base.fuelRequirement,
    ammoRequirement: stats.ammoRequirement || base.ammoRequirement,
    payload: {
      citizenCapacity: stats.citizenCapacity || base.payload.citizenCapacity,
      cargoCapacity: stats.cargoCapacity || base.payload.cargoCapacity,
      weaponPayload: stats.weaponPayload || base.payload.weaponPayload,
      explosiveYield: stats.explosiveYield || base.payload.explosiveYield,
    },
    speedMultiplier: base.speedMultiplier + (stats.speedDelta || 0),
    evasionMultiplier: base.evasionMultiplier + (stats.evasionDelta || 0),
    // Note: powerCapacity / powerDrainPerTick / solarRegenPerTick / signalRange /
    // autoGuidanceInstalled / crewSupportTicks all carry over from base. The blueprint
    // refines payload + propulsion + fuel; deeper system overrides land in v2.
  }
}

// PHASE 17.J.10 — re-export so consumers (MatchSim buildShipFromBlueprintAction) can synthesize
// the same shape when staging a pad for a blueprint build.
export { synthesizeCustomDef }

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
  const def = flightDef(flight)
  const fuelEnergy = flight.fuelRemaining / 50
  const payloadEnergy = def.payload.explosiveYield + def.payload.weaponPayload * 0.5
  const citizenEnergy = def.suicideShip ? flight.citizensAboard * 2 : 0
  const totalEnergy = fuelEnergy + payloadEnergy + citizenEnergy + 1
  const radius = 80 + Math.sqrt(totalEnergy) * 14
  const magnitude = totalEnergy * (def.suicideShip ? 1.4 : 1.0)
  return { radius, magnitude, fuelEnergy, payloadEnergy, citizenEnergy }
}

// ============================================================================
// PHASE 17.L.A.11 — Three-mode mining (Q5 PHASE 17 LOCKED: "all three yes")
// ============================================================================
//
// Three flight modes governed by ColonyShipFlight.flightKind:
//   - 'oneway'         : default, no shuttle behavior; existing tickFlight handles normally
//   - 'shuttle-single' : auto-recall to ONE target indefinitely
//   - 'shuttle-multi'  : auto-recall rotating through assignedTargets[] round-robin
//
// State machine (only runs for non-oneway flights):
//   OUTBOUND ──[ phase reaches DETONATE at target ]──► EXTRACTING
//   EXTRACTING ──[ extractingTicksRemaining hits 0 ]──► INBOUND (fresh flight, arc reversed)
//   INBOUND ──[ phase reaches DETONATE at home ]──► OUTBOUND (fresh flight, advance target)
//
// Cargo flow:
//   - At EXTRACTING completion: cargoAboard fills with `def.payload.cargoCapacity` of the
//     ctx-supplied extractedCargoResource (the target planet's primary mineable).
//   - At INBOUND home-arrival: cargoToDeposit returns the full cargoAboard Map for caller
//     to merge into the home planet's inventory.

const EXTRACTING_DURATION_TICKS = 60

export interface ShuttleLegTickContext {
  // Galactic-space position of the home planet (cargo deposits here on INBOUND arrival).
  readonly homePlanetPosition: Vec3
  // Galactic-space position of the NEXT target for the upcoming leg. For shuttle-single this
  // is always the same as flight.trueTargetPosition (when going OUTBOUND) or the home (when
  // INBOUND). For shuttle-multi, the caller looks up the next planet in the rotation. Null
  // when the next target is unavailable (planet destroyed / conquered / unreachable).
  readonly nextOutboundTargetPosition: Vec3 | null
  // Planet id matching nextOutboundTargetPosition. Threaded through so the fresh flight's
  // targetPlanetId is correct for downstream display + fog-of-war. Null when target gone.
  readonly nextOutboundTargetPlanetId: PlanetId | null
  // PRNG bound to the next leg's signal-loss seed so dispersion stays deterministic per cycle.
  readonly nextLegSignalLossSeed: number
  // Primary cargo resource extracted at the current target. Caller picks via biome / resource
  // node availability. Null = no mineable resource available → cycle returns empty.
  readonly extractedCargoResource: ResourceId | null
}

export interface ShuttleLegTickResult {
  // When non-null, caller MUST swap state.flights[flight.id] = freshFlight. Carries the same
  // flight id so existing flight-tracking subscribers keep working. Returned on every leg
  // transition that requires a new arc (OUTBOUND→EXTRACTING is in-place; EXTRACTING→INBOUND
  // and INBOUND→OUTBOUND return a fresh flight).
  readonly freshFlight: ColonyShipFlight | null
  // When non-null, caller deposits these resources into the home planet inventory. Fires
  // on the INBOUND→OUTBOUND transition (deposit happens at home-arrival, before relaunch).
  readonly cargoToDeposit: ReadonlyMap<ResourceId, number> | null
  // True when the shuttle cycle terminated (target unreachable / shuttle-multi targets empty).
  // Caller leaves the flight in its terminal DETONATE state.
  readonly terminated: boolean
}

const SHUTTLE_NULL_RESULT: ShuttleLegTickResult = {
  freshFlight: null,
  cargoToDeposit: null,
  terminated: false,
}

// PHASE 17.L.A.11 — shuttle leg post-process. Call AFTER tickFlight per-tick. No-op for
// oneway flights. Drives the OUTBOUND → EXTRACTING → INBOUND → OUTBOUND cycle for shuttle
// modes. Returns either { freshFlight, cargoToDeposit, terminated } so the caller can
// swap flight + deposit cargo.
export function tickShuttleLeg(
  flight: ColonyShipFlight,
  ctx: ShuttleLegTickContext,
): ShuttleLegTickResult {
  if (flight.flightKind === 'oneway') return SHUTTLE_NULL_RESULT

  const m = flight as { -readonly [K in keyof ColonyShipFlight]: ColonyShipFlight[K] }

  // EXTRACTING countdown — once the ship "lands" at target, it spends N ticks mining.
  if (flight.shuttleLeg === 'EXTRACTING') {
    if (flight.extractingTicksRemaining > 0) {
      m.extractingTicksRemaining = flight.extractingTicksRemaining - 1
      return SHUTTLE_NULL_RESULT
    }
    // Extraction done. Fill cargo + spawn INBOUND fresh flight.
    const def = flightDef(flight)
    const cap = def.payload.cargoCapacity
    if (ctx.extractedCargoResource && cap > 0) {
      const existing = flight.cargoAboard.get(ctx.extractedCargoResource) ?? 0
      flight.cargoAboard.set(ctx.extractedCargoResource, existing + cap)
    }
    const targetPos = flight.trueTargetPosition
    const fresh = newColonyShipFlight({
      id: flight.id,
      variantId: flight.variantId,
      launchingCivId: flight.launchingCivId,
      fromPlanetId: flight.targetPlanetId,
      targetPlanetId: flight.homePlanetId,
      fromPosition: targetPos,
      targetPosition: ctx.homePlanetPosition,
      travelRadius: 1000,
      citizensAboard: flight.crewAlive,
      signalLossSeed: ctx.nextLegSignalLossSeed,
      flightKind: flight.flightKind,
      assignedTargets: flight.assignedTargets,
      homePlanetId: flight.homePlanetId,
      cargoAboard: flight.cargoAboard,
      ...(flight.customBuild ? { customBuild: flight.customBuild } : {}),
      ...(flight.selfDestructInstalled ? { selfDestructInstalled: true } : {}),
      targetingMode: flight.targetingMode,
    })
    const fm = fresh as { -readonly [K in keyof ColonyShipFlight]: ColonyShipFlight[K] }
    fm.shuttleLeg = 'INBOUND'
    fm.shuttleCyclesCompleted = flight.shuttleCyclesCompleted
    fm.currentAssignedTargetIdx = flight.currentAssignedTargetIdx
    return { freshFlight: fresh, cargoToDeposit: null, terminated: false }
  }

  // OUTBOUND arrival at target → in-place flip to EXTRACTING (clears terminal phase).
  if (flight.shuttleLeg === 'OUTBOUND' && flight.phase === 'DETONATE') {
    m.shuttleLeg = 'EXTRACTING'
    m.extractingTicksRemaining = EXTRACTING_DURATION_TICKS
    m.phase = 'TARGET'
    m.outcome = null
    return SHUTTLE_NULL_RESULT
  }

  // INBOUND arrival at home → deposit cargo + spawn next OUTBOUND fresh flight (or terminate).
  if (flight.shuttleLeg === 'INBOUND' && flight.phase === 'DETONATE') {
    const cargoToDeposit = new Map(flight.cargoAboard)
    flight.cargoAboard.clear()
    m.shuttleCyclesCompleted = flight.shuttleCyclesCompleted + 1

    // Advance multi-target idx — pick next planet in rotation. For shuttle-single, idx stays 0.
    let nextIdx = flight.currentAssignedTargetIdx
    if (flight.flightKind === 'shuttle-multi' && flight.assignedTargets.length > 0) {
      nextIdx = (flight.currentAssignedTargetIdx + 1) % flight.assignedTargets.length
    }
    m.currentAssignedTargetIdx = nextIdx

    if (!ctx.nextOutboundTargetPosition || !ctx.nextOutboundTargetPlanetId) {
      // Next target gone — terminate the shuttle cycle. Caller leaves the flight in DETONATE.
      m.shuttleLeg = null
      return { freshFlight: null, cargoToDeposit, terminated: true }
    }

    const fresh = newColonyShipFlight({
      id: flight.id,
      variantId: flight.variantId,
      launchingCivId: flight.launchingCivId,
      fromPlanetId: flight.homePlanetId,
      targetPlanetId: ctx.nextOutboundTargetPlanetId,
      fromPosition: ctx.homePlanetPosition,
      targetPosition: ctx.nextOutboundTargetPosition,
      travelRadius: 1000,
      citizensAboard: flight.crewAlive,
      signalLossSeed: ctx.nextLegSignalLossSeed,
      flightKind: flight.flightKind,
      assignedTargets: flight.assignedTargets,
      homePlanetId: flight.homePlanetId,
      cargoAboard: new Map(),
      ...(flight.customBuild ? { customBuild: flight.customBuild } : {}),
      ...(flight.selfDestructInstalled ? { selfDestructInstalled: true } : {}),
      targetingMode: flight.targetingMode,
    })
    const fm = fresh as { -readonly [K in keyof ColonyShipFlight]: ColonyShipFlight[K] }
    fm.shuttleLeg = 'OUTBOUND'
    fm.shuttleCyclesCompleted = flight.shuttleCyclesCompleted + 1
    fm.currentAssignedTargetIdx = nextIdx
    return { freshFlight: fresh, cargoToDeposit, terminated: false }
  }

  return SHUTTLE_NULL_RESULT
}
