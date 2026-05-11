import { type CivId, type PlanetId } from '../types/index'
import { type ColonyShipFlight } from './colony-ship-flight'

export type BeaconAlertKind =
  | 'INCOMING_HOSTILE'
  | 'INCOMING_FRIENDLY'
  | 'OUTGOING_LAUNCH'
  | 'OUTGOING_RECALLED'
  | 'IMPACT_DETECTED'
  | 'INTERCEPT_SUCCESS'
  | 'COLONY_ESTABLISHED'

export interface BeaconAlert {
  readonly id: string
  readonly planetId: PlanetId
  readonly observerCivId: CivId
  readonly kind: BeaconAlertKind
  readonly atTick: number
  readonly summary: string
  readonly relatedFlightId?: string
}

export interface PlanetBeacon {
  readonly planetId: PlanetId
  readonly observerCivId: CivId
  readonly alertCapacity: number
  alerts: BeaconAlert[]
}

export function newPlanetBeacon(
  planetId: PlanetId,
  observerCivId: CivId,
  alertCapacity = 30,
): PlanetBeacon {
  return { planetId, observerCivId, alertCapacity, alerts: [] }
}

export function pushBeaconAlert(beacon: PlanetBeacon, alert: BeaconAlert): void {
  beacon.alerts.push(alert)
  if (beacon.alerts.length > beacon.alertCapacity) {
    beacon.alerts.splice(0, beacon.alerts.length - beacon.alertCapacity)
  }
}

export function alertsForLastTicks(
  beacon: PlanetBeacon,
  currentTick: number,
  windowTicks: number,
): ReadonlyArray<BeaconAlert> {
  const cutoff = currentTick - windowTicks
  return beacon.alerts.filter((a) => a.atTick >= cutoff)
}

export function recordIncomingFlight(
  beacon: PlanetBeacon,
  flight: ColonyShipFlight,
  currentTick: number,
  alertId: string,
): void {
  const hostile = flight.launchingCivId !== beacon.observerCivId
  pushBeaconAlert(beacon, {
    id: alertId,
    planetId: beacon.planetId,
    observerCivId: beacon.observerCivId,
    kind: hostile ? 'INCOMING_HOSTILE' : 'INCOMING_FRIENDLY',
    atTick: currentTick,
    summary: hostile
      ? `Hostile inbound from ${flight.fromPlanetId} — ETA ${flight.totalTicks - flight.ticksFlown} ticks`
      : `Friendly inbound from ${flight.fromPlanetId}`,
    relatedFlightId: flight.id as unknown as string,
  })
}

export function recordOutgoingLaunch(
  beacon: PlanetBeacon,
  flight: ColonyShipFlight,
  currentTick: number,
  alertId: string,
): void {
  pushBeaconAlert(beacon, {
    id: alertId,
    planetId: beacon.planetId,
    observerCivId: beacon.observerCivId,
    kind: 'OUTGOING_LAUNCH',
    atTick: currentTick,
    summary: `Outbound to ${flight.targetPlanetId} — ETA ${flight.totalTicks} ticks`,
    relatedFlightId: flight.id as unknown as string,
  })
}

export function recordImpact(
  beacon: PlanetBeacon,
  flight: ColonyShipFlight,
  currentTick: number,
  alertId: string,
  intercepted: boolean,
): void {
  pushBeaconAlert(beacon, {
    id: alertId,
    planetId: beacon.planetId,
    observerCivId: beacon.observerCivId,
    kind: intercepted ? 'INTERCEPT_SUCCESS' : 'IMPACT_DETECTED',
    atTick: currentTick,
    summary: intercepted
      ? `Intercepted hostile from ${flight.fromPlanetId}`
      : `${flight.outcome ?? 'IMPACT'} from ${flight.fromPlanetId}`,
    relatedFlightId: flight.id as unknown as string,
  })
}

export function recordColonyEstablished(
  beacon: PlanetBeacon,
  newOwnerCivId: CivId,
  currentTick: number,
  alertId: string,
): void {
  pushBeaconAlert(beacon, {
    id: alertId,
    planetId: beacon.planetId,
    observerCivId: beacon.observerCivId,
    kind: 'COLONY_ESTABLISHED',
    atTick: currentTick,
    summary: `Colony established by ${newOwnerCivId}`,
  })
}
