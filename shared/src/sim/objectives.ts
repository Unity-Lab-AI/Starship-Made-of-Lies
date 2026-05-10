import { type CivId } from '../types/index'

export type MissionObjectiveId =
  | 'highscore_target'
  | 'resource_target'
  | 'last_civ_standing'
  | 'apex_tech'

export interface MissionObjectiveDef {
  readonly id: MissionObjectiveId
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly racePriority: number
}

export const MISSION_OBJECTIVES: ReadonlyArray<MissionObjectiveDef> = [
  {
    id: 'highscore_target',
    name: 'Highscore Target',
    emoji: '🎯',
    description: 'First civ to reach the highscore threshold wins.',
    racePriority: 1,
  },
  {
    id: 'resource_target',
    name: 'Resource Target',
    emoji: '📦',
    description: 'First civ to stockpile target resource quantity wins.',
    racePriority: 2,
  },
  {
    id: 'last_civ_standing',
    name: 'Last Civ Standing',
    emoji: '🏴',
    description: 'Eliminate every other civ. Race-priority lowest — runs in parallel with others.',
    racePriority: 3,
  },
  {
    id: 'apex_tech',
    name: 'Apex Tech',
    emoji: '🌌',
    description: 'First civ to research a winning Apex tech wins. Reality-Editing or Singularity.',
    racePriority: 4,
  },
]

const OBJECTIVE_INDEX: ReadonlyMap<MissionObjectiveId, MissionObjectiveDef> = new Map(
  MISSION_OBJECTIVES.map((o) => [o.id, o]),
)

export function getMissionObjective(id: MissionObjectiveId): MissionObjectiveDef {
  const def = OBJECTIVE_INDEX.get(id)
  if (!def) throw new Error(`Unknown mission objective id: ${id}`)
  return def
}

export interface MissionObjectiveConfig {
  readonly id: MissionObjectiveId
  readonly target: number
}

export interface MissionObjectiveProgress {
  readonly objectiveId: MissionObjectiveId
  readonly leaderCivId: CivId | null
  readonly leaderProgress: number
  readonly target: number
  readonly metBy: ReadonlyArray<CivId>
}

export interface MatchEndResolution {
  readonly ended: boolean
  readonly reason: 'objective_met' | 'tick_cap_hit' | 'admin_end' | null
  readonly winningCivId: CivId | null
  readonly resolvedObjectiveId: MissionObjectiveId | null
}

export interface ObjectiveResolverInputs {
  readonly enabledObjectives: ReadonlyArray<MissionObjectiveConfig>
  readonly civProgress: ReadonlyMap<
    MissionObjectiveId,
    ReadonlyArray<{ civId: CivId; value: number }>
  >
  readonly aliveCivIds: ReadonlyArray<CivId>
  readonly currentTick: number
  readonly tickCap: number | null
}

export function resolveMatchEnd(inputs: ObjectiveResolverInputs): MatchEndResolution {
  if (inputs.aliveCivIds.length === 0) {
    return {
      ended: true,
      reason: 'admin_end',
      winningCivId: null,
      resolvedObjectiveId: null,
    }
  }

  const sortedObjectives = [...inputs.enabledObjectives].sort(
    (a, b) => getMissionObjective(a.id).racePriority - getMissionObjective(b.id).racePriority,
  )

  for (const cfg of sortedObjectives) {
    if (cfg.id === 'last_civ_standing') {
      if (inputs.aliveCivIds.length === 1) {
        return {
          ended: true,
          reason: 'objective_met',
          winningCivId: inputs.aliveCivIds[0] ?? null,
          resolvedObjectiveId: cfg.id,
        }
      }
      continue
    }
    const progressList = inputs.civProgress.get(cfg.id)
    if (!progressList) continue
    let leader: { civId: CivId; value: number } | null = null
    for (const entry of progressList) {
      if (entry.value >= cfg.target) {
        if (!leader || entry.value > leader.value) leader = entry
      }
    }
    if (leader) {
      return {
        ended: true,
        reason: 'objective_met',
        winningCivId: leader.civId,
        resolvedObjectiveId: cfg.id,
      }
    }
  }

  if (inputs.tickCap !== null && inputs.currentTick >= inputs.tickCap) {
    let topCivId: CivId | null = null
    let topValue = -Infinity
    for (const cfg of sortedObjectives) {
      if (cfg.id === 'last_civ_standing') continue
      const progressList = inputs.civProgress.get(cfg.id)
      if (!progressList) continue
      for (const entry of progressList) {
        if (entry.value > topValue) {
          topValue = entry.value
          topCivId = entry.civId
        }
      }
    }
    return {
      ended: true,
      reason: 'tick_cap_hit',
      winningCivId: topCivId,
      resolvedObjectiveId: null,
    }
  }

  return { ended: false, reason: null, winningCivId: null, resolvedObjectiveId: null }
}

export function buildObjectiveProgress(
  cfg: MissionObjectiveConfig,
  values: ReadonlyArray<{ civId: CivId; value: number }>,
): MissionObjectiveProgress {
  let leaderCivId: CivId | null = null
  let leaderProgress = -Infinity
  const metBy: CivId[] = []
  for (const v of values) {
    if (v.value > leaderProgress) {
      leaderProgress = v.value
      leaderCivId = v.civId
    }
    if (v.value >= cfg.target) metBy.push(v.civId)
  }
  return {
    objectiveId: cfg.id,
    leaderCivId,
    leaderProgress: Number.isFinite(leaderProgress) ? leaderProgress : 0,
    target: cfg.target,
    metBy,
  }
}
