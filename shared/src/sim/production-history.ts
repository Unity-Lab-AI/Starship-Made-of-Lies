import { type ResourceId } from '../types/index'

export interface ProductionTickSample {
  readonly tick: number
  readonly produced: ReadonlyArray<{ resourceId: ResourceId; amount: number }>
  readonly consumed: ReadonlyArray<{ resourceId: ResourceId; amount: number }>
  readonly idledBuildingCount: number
}

export interface ProductionHistory {
  readonly capacity: number
  samples: ProductionTickSample[]
  oldestIdx: number
}

export const DEFAULT_HISTORY_CAPACITY = 60

export function newProductionHistory(
  capacity: number = DEFAULT_HISTORY_CAPACITY,
): ProductionHistory {
  if (capacity <= 0)
    throw new Error(`newProductionHistory: capacity must be positive, got ${capacity}`)
  return { capacity, samples: [], oldestIdx: 0 }
}

export function pushProductionSample(
  history: ProductionHistory,
  sample: ProductionTickSample,
): void {
  if (history.samples.length < history.capacity) {
    history.samples.push(sample)
    return
  }
  history.samples[history.oldestIdx] = sample
  history.oldestIdx = (history.oldestIdx + 1) % history.capacity
}

export function readChronological(history: ProductionHistory): ReadonlyArray<ProductionTickSample> {
  if (history.samples.length < history.capacity) {
    return [...history.samples]
  }
  const out: ProductionTickSample[] = []
  for (let i = 0; i < history.capacity; i++) {
    const sample = history.samples[(history.oldestIdx + i) % history.capacity]
    if (sample) out.push(sample)
  }
  return out
}

export interface ResourceSeries {
  readonly resourceId: ResourceId
  readonly netPerTick: ReadonlyArray<number>
  readonly producedPerTick: ReadonlyArray<number>
  readonly consumedPerTick: ReadonlyArray<number>
}

export function buildResourceSeries(
  history: ProductionHistory,
  resourceId: ResourceId,
): ResourceSeries {
  const chrono = readChronological(history)
  const produced: number[] = []
  const consumed: number[] = []
  const net: number[] = []
  for (const sample of chrono) {
    const p = sample.produced.find((e) => e.resourceId === resourceId)?.amount ?? 0
    const c = sample.consumed.find((e) => e.resourceId === resourceId)?.amount ?? 0
    produced.push(p)
    consumed.push(c)
    net.push(p - c)
  }
  return {
    resourceId,
    netPerTick: net,
    producedPerTick: produced,
    consumedPerTick: consumed,
  }
}

export function listObservedResources(history: ProductionHistory): ReadonlyArray<ResourceId> {
  const seen = new Set<ResourceId>()
  for (const sample of history.samples) {
    for (const e of sample.produced) seen.add(e.resourceId)
    for (const e of sample.consumed) seen.add(e.resourceId)
  }
  return Array.from(seen)
}

export function maxAbsValueInSeries(series: ResourceSeries): number {
  let max = 0
  for (const v of series.netPerTick) {
    const abs = Math.abs(v)
    if (abs > max) max = abs
  }
  return max
}
