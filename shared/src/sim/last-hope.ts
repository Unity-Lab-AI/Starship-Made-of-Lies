import { type CivId, type PlanetId } from '../types/index'

export type LastHopePhase = 'IDLE' | 'PACKING' | 'BUILDING' | 'LAUNCHING' | 'IN_FLIGHT' | 'COMPLETE'

export const LAST_HOPE_PACK_TICKS = 30
export const LAST_HOPE_BUILD_TICKS = 80
export const LAST_HOPE_LAUNCH_TICKS = 5

export interface LastHopeEvacState {
  readonly civId: CivId
  readonly fromPlanetId: PlanetId
  targetPlanetId: PlanetId | null
  phase: LastHopePhase
  startedAtTick: number
  packCompletedAtTick: number | null
  buildCompletedAtTick: number | null
  launchedAtTick: number | null
  citizensAboard: number
  totalTicksElapsed: number
}

export function initiateLastHopeEvac(inputs: {
  civId: CivId
  fromPlanetId: PlanetId
  currentTick: number
  citizenCountToPack: number
}): LastHopeEvacState {
  return {
    civId: inputs.civId,
    fromPlanetId: inputs.fromPlanetId,
    targetPlanetId: null,
    phase: 'PACKING',
    startedAtTick: inputs.currentTick,
    packCompletedAtTick: null,
    buildCompletedAtTick: null,
    launchedAtTick: null,
    citizensAboard: inputs.citizenCountToPack,
    totalTicksElapsed: 0,
  }
}

export interface LastHopeTickInputs {
  readonly state: LastHopeEvacState
  readonly currentTick: number
  readonly unexploredPlanetIds: ReadonlyArray<PlanetId>
}

export interface LastHopeTickResult {
  readonly phaseChanged: boolean
  readonly readyToLaunch: boolean
  readonly chosenTargetPlanetId: PlanetId | null
}

export function tickLastHopeEvac(inputs: LastHopeTickInputs): LastHopeTickResult {
  const s = inputs.state
  const prevPhase = s.phase
  s.totalTicksElapsed = inputs.currentTick - s.startedAtTick

  if (s.phase === 'PACKING') {
    if (s.totalTicksElapsed >= LAST_HOPE_PACK_TICKS) {
      s.phase = 'BUILDING'
      s.packCompletedAtTick = inputs.currentTick
    }
  } else if (s.phase === 'BUILDING') {
    if (s.packCompletedAtTick === null) {
      s.packCompletedAtTick = inputs.currentTick
    }
    const buildElapsed = inputs.currentTick - s.packCompletedAtTick
    if (buildElapsed >= LAST_HOPE_BUILD_TICKS) {
      s.phase = 'LAUNCHING'
      s.buildCompletedAtTick = inputs.currentTick
      s.targetPlanetId = pickUnexploredTarget(inputs.unexploredPlanetIds)
    }
  } else if (s.phase === 'LAUNCHING') {
    if (s.buildCompletedAtTick === null) s.buildCompletedAtTick = inputs.currentTick
    const launchElapsed = inputs.currentTick - s.buildCompletedAtTick
    if (launchElapsed >= LAST_HOPE_LAUNCH_TICKS) {
      s.phase = 'IN_FLIGHT'
      s.launchedAtTick = inputs.currentTick
    }
  }

  return {
    phaseChanged: s.phase !== prevPhase,
    readyToLaunch: s.phase === 'IN_FLIGHT' && s.launchedAtTick === inputs.currentTick,
    chosenTargetPlanetId: s.targetPlanetId,
  }
}

function pickUnexploredTarget(unexplored: ReadonlyArray<PlanetId>): PlanetId | null {
  if (unexplored.length === 0) return null
  const idx = Math.floor(Math.random() * unexplored.length)
  return unexplored[idx] ?? null
}

export function isLastHopeRecoverable(s: LastHopeEvacState): boolean {
  return s.phase !== 'COMPLETE' && s.phase !== 'IN_FLIGHT'
}

export function totalLastHopeDuration(): number {
  return LAST_HOPE_PACK_TICKS + LAST_HOPE_BUILD_TICKS + LAST_HOPE_LAUNCH_TICKS
}

export interface LastHopeTriggerCheck {
  readonly shouldTrigger: boolean
  readonly reason: string | null
}

export interface CivCollapseSnapshot {
  readonly controlledPlanetCount: number
  readonly totalCitizens: number
  readonly recentDeathsLastHundredTicks: number
  readonly incomingHostileFlights: number
  readonly hasAlreadyTriggered: boolean
}

export function shouldAutoTriggerLastHope(snap: CivCollapseSnapshot): LastHopeTriggerCheck {
  if (snap.hasAlreadyTriggered) {
    return { shouldTrigger: false, reason: 'already_triggered' }
  }
  if (snap.controlledPlanetCount === 1 && snap.totalCitizens < 200) {
    return { shouldTrigger: true, reason: 'last_planet_low_population' }
  }
  if (snap.incomingHostileFlights >= 2 && snap.controlledPlanetCount <= 1) {
    return { shouldTrigger: true, reason: 'last_planet_under_siege' }
  }
  if (snap.recentDeathsLastHundredTicks > 1000 && snap.controlledPlanetCount === 1) {
    return { shouldTrigger: true, reason: 'mass_casualty_event' }
  }
  return { shouldTrigger: false, reason: null }
}
