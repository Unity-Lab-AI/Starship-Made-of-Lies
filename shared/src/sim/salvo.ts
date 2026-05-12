import { type PlanetId } from '../types/index'
import { arm, type LaunchPad, launch, type PadTargetWaypoint, setTargetQueue } from './launch-pad'

export const DEFAULT_SALVO_INTERVAL_TICKS = 15

export type SalvoPhase = 'TARGETING' | 'BUILDING' | 'STAGGERED_LAUNCH' | 'COOLDOWN' | 'IDLE'

export interface SalvoCoordinator {
  readonly controllerPadId: string
  phase: SalvoPhase
  intervalTicks: number
  cooldownTicks: number
  lastLaunchAtTick: number
  currentRoundIdx: number
  waypointCursor: number
  totalLaunchedThisRound: number
}

export function newSalvoCoordinator(
  controllerPadId: string,
  intervalTicks: number = DEFAULT_SALVO_INTERVAL_TICKS,
  cooldownTicks: number = 60,
): SalvoCoordinator {
  return {
    controllerPadId,
    phase: 'IDLE',
    intervalTicks,
    cooldownTicks,
    lastLaunchAtTick: -intervalTicks,
    currentRoundIdx: 0,
    waypointCursor: 0,
    totalLaunchedThisRound: 0,
  }
}

export function distributeTargetsAcrossPads(
  pads: ReadonlyArray<LaunchPad>,
  waypoints: ReadonlyArray<PadTargetWaypoint>,
  startCursor: number,
): { assignedCount: number; nextCursor: number } {
  if (pads.length === 0 || waypoints.length === 0) {
    return { assignedCount: 0, nextCursor: startCursor }
  }
  let cursor = startCursor % waypoints.length
  let assigned = 0
  for (const pad of pads) {
    const wp = waypoints[cursor]
    if (!wp) break
    setTargetQueue(pad, [wp])
    cursor = (cursor + 1) % waypoints.length
    assigned += 1
  }
  return { assignedCount: assigned, nextCursor: cursor }
}

export interface SalvoTickInputs {
  readonly currentTick: number
  readonly pads: ReadonlyArray<LaunchPad>
  readonly waypoints: ReadonlyArray<PadTargetWaypoint>
  // PHASE 17.1.6 — optional client-side launch override. Pure-sim consumers can omit this;
  // tickSalvo falls back to launch(pad) which only flips state. Client wires the real
  // launchShipFromPadAction so the flight is actually created on STAGGERED_LAUNCH.
  readonly launchFn?: (pad: LaunchPad) => boolean
}

export interface SalvoTickResult {
  readonly launchedPadIds: ReadonlyArray<string>
  readonly armedPadIds: ReadonlyArray<string>
  readonly phase: SalvoPhase
}

export function tickSalvo(coord: SalvoCoordinator, inputs: SalvoTickInputs): SalvoTickResult {
  const launched: string[] = []
  const armed: string[] = []

  switch (coord.phase) {
    case 'IDLE':
      if (inputs.waypoints.length > 0 && inputs.pads.length > 0) {
        const { nextCursor } = distributeTargetsAcrossPads(
          inputs.pads,
          inputs.waypoints,
          coord.waypointCursor,
        )
        coord.waypointCursor = nextCursor
        coord.phase = 'BUILDING'
      }
      break

    case 'TARGETING': {
      const { nextCursor } = distributeTargetsAcrossPads(
        inputs.pads,
        inputs.waypoints,
        coord.waypointCursor,
      )
      coord.waypointCursor = nextCursor
      coord.phase = 'BUILDING'
      break
    }

    case 'BUILDING': {
      const allReady = inputs.pads.every((p) => p.state === 'READY' || p.state === 'ARM')
      if (allReady) {
        for (const pad of inputs.pads) {
          if (pad.state === 'READY' && arm(pad)) armed.push(pad.id as unknown as string)
        }
        coord.phase = 'STAGGERED_LAUNCH'
        coord.totalLaunchedThisRound = 0
      }
      break
    }

    case 'STAGGERED_LAUNCH': {
      if (inputs.currentTick - coord.lastLaunchAtTick >= coord.intervalTicks) {
        const armedPad = inputs.pads.find((p) => p.state === 'ARM')
        if (armedPad) {
          const launcher = inputs.launchFn ?? launch
          if (launcher(armedPad)) {
            launched.push(armedPad.id as unknown as string)
            coord.lastLaunchAtTick = inputs.currentTick
            coord.totalLaunchedThisRound += 1
          }
        } else {
          coord.phase = 'COOLDOWN'
          coord.lastLaunchAtTick = inputs.currentTick
        }
      }
      break
    }

    case 'COOLDOWN':
      if (inputs.currentTick - coord.lastLaunchAtTick >= coord.cooldownTicks) {
        coord.currentRoundIdx += 1
        coord.phase = 'TARGETING'
      }
      break
  }

  return { launchedPadIds: launched, armedPadIds: armed, phase: coord.phase }
}

export function planSalvoForPlanetGroup(
  pads: ReadonlyArray<LaunchPad>,
  targetPlanetIds: ReadonlyArray<PlanetId>,
): ReadonlyArray<PadTargetWaypoint> {
  const out: PadTargetWaypoint[] = []
  for (let i = 0; i < pads.length && i < targetPlanetIds.length; i++) {
    const planetId = targetPlanetIds[i]
    if (planetId) out.push({ targetPlanetId: planetId, label: `Pad ${i + 1}` })
  }
  return out
}
