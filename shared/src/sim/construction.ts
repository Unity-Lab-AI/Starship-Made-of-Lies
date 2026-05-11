import { type BuildingDefId, type BuildingId, type CivId, type TileId } from '../types/index'
import { getBuildingDef } from './building'

export type ConstructionStatus = 'queued' | 'building' | 'complete' | 'cancelled'

export interface ConstructionJob {
  readonly id: BuildingId
  readonly buildingDefId: BuildingDefId
  readonly tileId: TileId
  readonly civId: CivId
  status: ConstructionStatus
  ticksRemaining: number
}

export interface ConstructionQueue {
  readonly jobs: ConstructionJob[]
}

export function newConstructionQueue(): ConstructionQueue {
  return { jobs: [] }
}

export function enqueueConstruction(
  queue: ConstructionQueue,
  job: Omit<ConstructionJob, 'status' | 'ticksRemaining'>,
): void {
  const def = getBuildingDef(job.buildingDefId)
  queue.jobs.push({
    ...job,
    status: 'queued',
    ticksRemaining: def.buildTimeTicks,
  })
}

export function tickConstruction(queue: ConstructionQueue): ConstructionJob[] {
  const completed: ConstructionJob[] = []
  for (const job of queue.jobs) {
    if (job.status === 'queued') {
      job.status = 'building'
    }
    if (job.status === 'building') {
      job.ticksRemaining -= 1
      if (job.ticksRemaining <= 0) {
        job.status = 'complete'
        job.ticksRemaining = 0
        completed.push(job)
      }
    }
  }
  return completed
}

export function cancelConstruction(queue: ConstructionQueue, buildingId: BuildingId): boolean {
  const job = queue.jobs.find((j) => j.id === buildingId)
  if (!job) return false
  if (job.status === 'complete') return false
  job.status = 'cancelled'
  return true
}

export function activeConstructionJobs(queue: ConstructionQueue): ConstructionJob[] {
  return queue.jobs.filter((j) => j.status === 'queued' || j.status === 'building')
}
