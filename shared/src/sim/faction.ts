export type Faction = 'loyal' | 'skeptic' | 'dissident'

export interface FactionSplit {
  loyal: number
  skeptic: number
  dissident: number
}

export function newFactionSplit(totalCitizens: number): FactionSplit {
  return {
    loyal: Math.round(totalCitizens * 0.55),
    skeptic: Math.round(totalCitizens * 0.4),
    dissident: Math.round(totalCitizens * 0.05),
  }
}

export function totalCitizens(split: FactionSplit): number {
  return split.loyal + split.skeptic + split.dissident
}

export function dissidentRatio(split: FactionSplit): number {
  const total = totalCitizens(split)
  return total > 0 ? split.dissident / total : 0
}

export function loyalRatio(split: FactionSplit): number {
  const total = totalCitizens(split)
  return total > 0 ? split.loyal / total : 0
}

export function applyPropagandaTick(split: FactionSplit, propagandaPower: number): void {
  const flipFromSkeptic = Math.min(split.skeptic, Math.round(split.skeptic * propagandaPower))
  split.skeptic -= flipFromSkeptic
  split.loyal += flipFromSkeptic
}

export function applyConscriptionPenalty(split: FactionSplit, citizensConscripted: number): void {
  const dissidentSurge = Math.round(citizensConscripted * 0.3)
  const skepticSurge = Math.round(citizensConscripted * 0.5)
  split.skeptic += skepticSurge
  split.dissident += dissidentSurge
  const drainLoyal = Math.min(split.loyal, dissidentSurge + skepticSurge)
  split.loyal -= drainLoyal
}

export function performanceMultiplier(split: FactionSplit): number {
  const dissidents = dissidentRatio(split)
  return Math.max(0.3, 1 - dissidents * 1.4)
}
