import { type CivId, type PlanetId, type Vec3 } from '../types/index'
import {
  type ColonyShipFlight,
  flightCurrentPosition,
  flightDef,
  flightDistanceToTarget,
  intercept,
  newColonyShipFlight,
  type ColonyShipFlightId,
} from './colony-ship-flight'
import { type ColonyShipVariantId, SHIP_COUNTER_COLONY, getColonyShipDef } from './colony-ship'
import { solveIntercept, vec3Distance } from './trajectory'

export interface MineField {
  readonly planetId: PlanetId
  readonly civId: CivId
  readonly position: Vec3
  readonly detonationRadius: number
  remainingDetonations: number
}

export function newMineField(
  planetId: PlanetId,
  civId: CivId,
  position: Vec3,
  detonationCount = 3,
  detonationRadius = 4,
): MineField {
  return {
    planetId,
    civId,
    position,
    detonationRadius,
    remainingDetonations: detonationCount,
  }
}

export function mineFieldCheckIntercept(field: MineField, flight: ColonyShipFlight): boolean {
  if (field.remainingDetonations <= 0) return false
  if (flight.phase !== 'REENTRY' && flight.phase !== 'TARGET') return false
  if (flight.targetPlanetId !== field.planetId) return false
  if (flight.launchingCivId === field.civId) return false
  const distance = vec3Distance(flightCurrentPosition(flight), field.position)
  if (distance > field.detonationRadius) return false
  field.remainingDetonations -= 1
  intercept(flight, field.civId, 'mine-field')
  return true
}

export interface CounterShipLaunch {
  readonly counterFlightId: ColonyShipFlightId
  readonly attackerFlightId: ColonyShipFlightId
  readonly defenderCivId: CivId
  readonly launchPosition: Vec3
}

export interface CounterMissilePadInputs {
  readonly defenderCivId: CivId
  readonly defenderPlanetId: PlanetId
  readonly launchPosition: Vec3
  readonly travelRadius: number
  readonly counterShipVariantId?: ColonyShipVariantId
  readonly nextFlightId: () => ColonyShipFlightId
}

export interface AttemptInterceptResult {
  readonly counterFlight: ColonyShipFlight | null
  readonly canIntercept: boolean
  readonly defenderTicksToIntercept: number
}

export function attemptCounterMissileLaunch(
  attacker: ColonyShipFlight,
  defender: CounterMissilePadInputs,
): AttemptInterceptResult {
  if (
    attacker.phase === 'DETONATE' ||
    attacker.phase === 'INTERCEPTED' ||
    attacker.phase === 'ABORTED'
  ) {
    return { counterFlight: null, canIntercept: false, defenderTicksToIntercept: Infinity }
  }
  const variantId = defender.counterShipVariantId ?? SHIP_COUNTER_COLONY
  const counterDef = getColonyShipDef(variantId)
  const counterSpeed = 5 * counterDef.speedMultiplier
  const attackerDef = flightDef(attacker)
  const attackerSpeed = 5 * attackerDef.speedMultiplier
  const solution = solveIntercept(
    attacker.arc,
    attackerSpeed,
    attacker.ticksFlown,
    defender.launchPosition,
    counterSpeed,
    defender.travelRadius,
  )
  if (!solution.canIntercept) {
    return { counterFlight: null, canIntercept: false, defenderTicksToIntercept: Infinity }
  }
  const counterFlight = newColonyShipFlight({
    id: defender.nextFlightId(),
    variantId,
    launchingCivId: defender.defenderCivId,
    fromPlanetId: defender.defenderPlanetId,
    targetPlanetId: attacker.targetPlanetId,
    fromPosition: defender.launchPosition,
    targetPosition: solution.interceptPoint,
    travelRadius: defender.travelRadius,
    citizensAboard: 0,
    signalLossSeed: attacker.signalLossSeed ^ 0xdefdef,
  })
  return {
    counterFlight,
    canIntercept: true,
    defenderTicksToIntercept: solution.defenderTicksToIntercept,
  }
}

export interface CounterFlightTickResult {
  readonly intercepted: boolean
  readonly distance: number
}

export function tickCounterFlight(
  counter: ColonyShipFlight,
  attacker: ColonyShipFlight,
  proximityThreshold = 3,
): CounterFlightTickResult {
  const counterPos = flightCurrentPosition(counter)
  const attackerPos = flightCurrentPosition(attacker)
  const distance = vec3Distance(counterPos, attackerPos)
  if (distance <= proximityThreshold) {
    intercept(attacker, counter.launchingCivId, 'counter-ship')
    return { intercepted: true, distance }
  }
  return { intercepted: false, distance: flightDistanceToTarget(counter) }
}
