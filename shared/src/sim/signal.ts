import { type CivId } from '../types/index'
import { type ColonyShipFlight } from './colony-ship-flight'
import {
  TECH_AEROSPACE,
  TECH_LASER_OPTICS,
  TECH_MASS_SURVEILLANCE_NETWORKS,
  TECH_ORBITAL_MECHANICS,
  TECH_QUANTUM_COMPUTING,
  TECH_TELECOMMUNICATIONS,
  type TechId,
} from './tech'

export const SIGNAL_BASELINE_RANGE = 60
export const SIGNAL_BASELINE_REVEAL_TICKS = 10

export interface SignalCapability {
  readonly civId: CivId
  readonly detectionRangeTicks: number
  readonly earlyWarningTicks: number
  readonly canSeeFromCloak: boolean
}

export function deriveSignalCapability(
  civId: CivId,
  researchedTechs: ReadonlySet<TechId>,
): SignalCapability {
  let detectionRangeTicks = SIGNAL_BASELINE_RANGE
  let earlyWarningTicks = SIGNAL_BASELINE_REVEAL_TICKS
  let canSeeFromCloak = false

  if (researchedTechs.has(TECH_TELECOMMUNICATIONS)) {
    detectionRangeTicks += 30
    earlyWarningTicks += 5
  }
  if (researchedTechs.has(TECH_AEROSPACE)) {
    detectionRangeTicks += 20
  }
  if (researchedTechs.has(TECH_ORBITAL_MECHANICS)) {
    detectionRangeTicks += 40
    earlyWarningTicks += 10
  }
  if (researchedTechs.has(TECH_LASER_OPTICS)) {
    detectionRangeTicks += 30
    earlyWarningTicks += 8
  }
  if (researchedTechs.has(TECH_QUANTUM_COMPUTING)) {
    detectionRangeTicks += 50
    earlyWarningTicks += 15
    canSeeFromCloak = true
  }
  if (researchedTechs.has(TECH_MASS_SURVEILLANCE_NETWORKS)) {
    detectionRangeTicks += 40
    earlyWarningTicks += 10
    canSeeFromCloak = true
  }

  return { civId, detectionRangeTicks, earlyWarningTicks, canSeeFromCloak }
}

export interface DetectionResult {
  readonly detected: boolean
  readonly ticksToImpact: number
  readonly within: 'early-warning' | 'detection-range' | 'too-far'
}

export function detectIncomingFlight(
  capability: SignalCapability,
  flight: ColonyShipFlight,
): DetectionResult {
  if (flight.launchingCivId === capability.civId) {
    return {
      detected: true,
      ticksToImpact: flight.totalTicks - flight.ticksFlown,
      within: 'detection-range',
    }
  }
  const ticksToImpact = Math.max(0, flight.totalTicks - flight.ticksFlown)
  if (ticksToImpact <= capability.earlyWarningTicks) {
    return { detected: true, ticksToImpact, within: 'early-warning' }
  }
  if (ticksToImpact <= capability.detectionRangeTicks) {
    return { detected: true, ticksToImpact, within: 'detection-range' }
  }
  return { detected: false, ticksToImpact, within: 'too-far' }
}

export function filterDetectableFlights(
  capability: SignalCapability,
  allFlights: ReadonlyArray<ColonyShipFlight>,
): ReadonlyArray<ColonyShipFlight> {
  return allFlights.filter((f) => detectIncomingFlight(capability, f).detected)
}
