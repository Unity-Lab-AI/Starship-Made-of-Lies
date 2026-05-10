import { type CivId, type PlanetId, type Vec3 } from '../types/index'
import { type ColonyShipDef, type ColonyShipVariantId, getColonyShipDef } from './colony-ship'
import { type PadOutcome } from './launch-pad'
import {
  arcDuration,
  newSphericalArc,
  pointAlongArc,
  type SphericalArc,
  vec3Distance,
} from './trajectory'

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

export interface ColonyShipFlight {
  readonly id: ColonyShipFlightId
  readonly variantId: ColonyShipVariantId
  readonly launchingCivId: CivId
  readonly fromPlanetId: PlanetId
  readonly targetPlanetId: PlanetId
  readonly arc: SphericalArc
  readonly totalTicks: number
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

export function newColonyShipFlight(opts: FlightCreateOptions): ColonyShipFlight {
  const def = getColonyShipDef(opts.variantId)
  const arc = newSphericalArc(opts.fromPosition, opts.targetPosition, opts.travelRadius)
  const speed = BASE_TRAVEL_SPEED_PER_TICK * def.speedMultiplier * (opts.tickSpeedMultiplier ?? 1)
  const totalTicks = arcDuration(arc, speed)
  return {
    id: opts.id,
    variantId: opts.variantId,
    launchingCivId: opts.launchingCivId,
    fromPlanetId: opts.fromPlanetId,
    targetPlanetId: opts.targetPlanetId,
    arc,
    totalTicks,
    ticksFlown: 0,
    phase: 'CLIMB',
    outcome: null,
    signalLossSeed: opts.signalLossSeed ?? 0,
    citizensAboard: opts.citizensAboard,
  }
}

export interface FlightTickResult {
  readonly phaseChanged: boolean
  readonly newPhase: FlightPhase
  readonly currentPosition: Vec3
  readonly progress: number
  readonly outcome: ColonyShipOutcome | null
}

export function tickFlight(flight: ColonyShipFlight): FlightTickResult {
  const prevPhase = flight.phase
  if (
    flight.phase === 'DETONATE' ||
    flight.phase === 'INTERCEPTED' ||
    flight.phase === 'ABORTED' ||
    flight.phase === 'CRASH_LANDED'
  ) {
    return {
      phaseChanged: false,
      newPhase: flight.phase,
      currentPosition: pointAlongArc(flight.arc, 1),
      progress: 1,
      outcome: flight.outcome,
    }
  }

  flight.ticksFlown += 1
  const progress = Math.min(1, flight.ticksFlown / Math.max(1, flight.totalTicks))

  if (progress < 0.15) flight.phase = 'CLIMB'
  else if (progress < 0.7) flight.phase = 'COAST'
  else if (progress < 0.95) flight.phase = 'REENTRY'
  else if (progress < 1) flight.phase = 'TARGET'
  else {
    flight.phase = 'DETONATE'
    flight.outcome = resolveOutcome(flight)
  }

  return {
    phaseChanged: flight.phase !== prevPhase,
    newPhase: flight.phase,
    currentPosition: pointAlongArc(flight.arc, progress),
    progress,
    outcome: flight.outcome,
  }
}

function resolveOutcome(flight: ColonyShipFlight): ColonyShipOutcome {
  const def = getColonyShipDef(flight.variantId)
  const accuracyBase = 0.85
  const evasionPenalty = (1 - def.evasionMultiplier) * 0.1
  const accuracy = accuracyBase + evasionPenalty
  const seedRandom = pseudoRandom(flight.signalLossSeed + flight.ticksFlown)
  if (seedRandom < accuracy * 0.92) return 'TARGET_HIT'
  if (seedRandom < accuracy) return 'PROBABLE_HIT'
  return 'SIGNAL_LOST'
}

function pseudoRandom(seed: number): number {
  let s = seed | 0
  s = (s * 1103515245 + 12345) & 0x7fffffff
  return s / 0x7fffffff
}

export function intercept(
  flight: ColonyShipFlight,
  defenderCivId: CivId,
  reason: 'mine-field' | 'counter-ship',
): void {
  if (
    flight.phase === 'DETONATE' ||
    flight.phase === 'INTERCEPTED' ||
    flight.phase === 'ABORTED' ||
    flight.phase === 'CRASH_LANDED'
  ) {
    return
  }
  flight.phase = 'INTERCEPTED'
  flight.outcome = 'INTERCEPTED'
  void defenderCivId
  void reason
}

export function abortFlight(flight: ColonyShipFlight): void {
  if (
    flight.phase === 'DETONATE' ||
    flight.phase === 'INTERCEPTED' ||
    flight.phase === 'ABORTED' ||
    flight.phase === 'CRASH_LANDED'
  ) {
    return
  }
  flight.phase = 'ABORTED'
  flight.outcome = 'ABORTED'
}

export function markCrashLanded(flight: ColonyShipFlight): void {
  if (
    flight.phase === 'DETONATE' ||
    flight.phase === 'INTERCEPTED' ||
    flight.phase === 'ABORTED' ||
    flight.phase === 'CRASH_LANDED'
  ) {
    return
  }
  flight.phase = 'CRASH_LANDED'
  flight.outcome = 'SIGNAL_LOST'
}

export function flightCurrentPosition(flight: ColonyShipFlight): Vec3 {
  const t = Math.min(1, flight.ticksFlown / Math.max(1, flight.totalTicks))
  return pointAlongArc(flight.arc, t)
}

export function flightDistanceToTarget(flight: ColonyShipFlight): number {
  return vec3Distance(flightCurrentPosition(flight), flight.arc.end)
}

export function flightDef(flight: ColonyShipFlight): ColonyShipDef {
  return getColonyShipDef(flight.variantId)
}
