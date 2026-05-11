import { type CivId, type PlanetId } from '../types/index'
import { type FactionSplit, newFactionSplit } from './faction'

export type CitizenTier = 1 | 2 | 3 | 4 | 5

export interface CitizenTierDef {
  readonly tier: CitizenTier
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly defaultRatio: number
  readonly description: string
  readonly willVolunteerForOneWayTrip: boolean
  readonly willVolunteerWithHeavyPropaganda: boolean
}

export const CITIZEN_TIERS: ReadonlyArray<CitizenTierDef> = [
  {
    tier: 1,
    id: 'worker',
    name: 'Worker',
    emoji: '👷',
    defaultRatio: 0.6,
    description:
      'Baseline citizenry — manual + service labor. Defaults to NOT volunteering for one-way trips.',
    willVolunteerForOneWayTrip: false,
    willVolunteerWithHeavyPropaganda: false,
  },
  {
    tier: 2,
    id: 'skilled',
    name: 'Skilled',
    emoji: '👨‍🔧',
    defaultRatio: 0.25,
    description:
      'Trained tradespeople — engineers, technicians, operators. School-promoted from Worker.',
    willVolunteerForOneWayTrip: false,
    willVolunteerWithHeavyPropaganda: false,
  },
  {
    tier: 3,
    id: 'privileged',
    name: 'Privileged',
    emoji: '👨‍💼',
    defaultRatio: 0.1,
    description:
      'White-collar / managerial / academic class. May volunteer under heavy propaganda saturation.',
    willVolunteerForOneWayTrip: false,
    willVolunteerWithHeavyPropaganda: true,
  },
  {
    tier: 4,
    id: 'elite',
    name: 'Elite',
    emoji: '🤵',
    defaultRatio: 0.04,
    description: 'Honored class — propaganda-elevated. Accepts one-way colony-ship trips as duty.',
    willVolunteerForOneWayTrip: true,
    willVolunteerWithHeavyPropaganda: true,
  },
  {
    tier: 5,
    id: 'pinnacle',
    name: 'The Chosen',
    emoji: '👑',
    defaultRatio: 0.01,
    description:
      'Pinnacle citizens — eagerly volunteer for one-way trips. The propaganda elevated them too well.',
    willVolunteerForOneWayTrip: true,
    willVolunteerWithHeavyPropaganda: true,
  },
]

export interface PlanetPopulation {
  readonly planetId: PlanetId
  readonly civId: CivId
  tierCounts: Record<CitizenTier, number>
  faction: FactionSplit
  housingCap: number
  foodAvailability: number
  // PHASE 17.J.9 — per-tier ship-duty allocation. Player-set percentage 0-100 indicating
  // what share of each tier is RESERVED for the colony-ship-crew pool (not assigned to
  // worker tasks). Default 0 for all tiers preserves prior behavior. shipDutyReservedPool()
  // returns the derived head-count; the volunteer pool is augmented by the reserved share
  // from tiers 1-3 (tier 4-5 already always volunteer per the citizen tier system).
  shipDutyPercentByTier: Record<CitizenTier, number>
}

export function getCitizenTierDef(tier: CitizenTier): CitizenTierDef {
  const def = CITIZEN_TIERS.find((t) => t.tier === tier)
  if (!def) throw new Error(`Unknown citizen tier: ${tier}`)
  return def
}

export function newPlanetPopulation(
  planetId: PlanetId,
  civId: CivId,
  initialTotal: number,
): PlanetPopulation {
  const tierCounts: Record<CitizenTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const def of CITIZEN_TIERS) {
    tierCounts[def.tier] = Math.round(initialTotal * def.defaultRatio)
  }
  return {
    planetId,
    civId,
    tierCounts,
    faction: newFactionSplit(initialTotal),
    housingCap: initialTotal,
    foodAvailability: 1,
    shipDutyPercentByTier: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  }
}

// PHASE 17.J.9 — derived total of citizens reserved for the colony-ship-crew pool. Computed
// from shipDutyPercentByTier × tierCounts. Returned as a Record<CitizenTier, number> for
// per-tier display + a totalReserved aggregate for the planet header.
export function shipDutyReservedPool(pop: PlanetPopulation): {
  byTier: Record<CitizenTier, number>
  totalReserved: number
} {
  const byTier: Record<CitizenTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let totalReserved = 0
  for (const tier of [1, 2, 3, 4, 5] as CitizenTier[]) {
    const pct = Math.max(0, Math.min(100, pop.shipDutyPercentByTier[tier] ?? 0))
    const reserved = Math.floor((pop.tierCounts[tier] * pct) / 100)
    byTier[tier] = reserved
    totalReserved += reserved
  }
  return { byTier, totalReserved }
}

export function setShipDutyPercent(
  pop: PlanetPopulation,
  tier: CitizenTier,
  percent: number,
): void {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  pop.shipDutyPercentByTier[tier] = clamped
}

export function totalPopulation(pop: PlanetPopulation): number {
  return (
    pop.tierCounts[1] +
    pop.tierCounts[2] +
    pop.tierCounts[3] +
    pop.tierCounts[4] +
    pop.tierCounts[5]
  )
}

// PHASE 17.L.A.4 — citizens available for worker assignment, after subtracting the ship-duty
// reserved pool. Per the 17.J.9 implementation note: the ship-duty slider per tier was reserving
// citizens for the colony-ship volunteer pool BUT they were STILL being counted in the worker
// pool — double-counting. This helper is the canonical "how many citizens can actually be
// assigned to worker categories on this planet" — workforce-assignment call sites (research,
// future production-by-count, etc.) should use this instead of totalPopulation.
//
// The volunteer pool draws from the same tier counts; reserved citizens stay in tierCounts so
// `loadCitizensFromVolunteerPool` (17.L.A.6) can draw them. The accounting is enforced by
// having WORKFORCE-side callers use availableWorkers and SHIP-LOADING-side callers use the
// volunteer pool — both routes draw from the same per-tier counts but never overlap.
export function availableWorkers(pop: PlanetPopulation): number {
  return Math.max(0, totalPopulation(pop) - shipDutyReservedPool(pop).totalReserved)
}

export function volunteerPool(pop: PlanetPopulation, includeWithPropaganda: boolean): number {
  // Tier 4-5 always volunteer per CITIZEN_TIERS.willVolunteerForOneWayTrip flag.
  const base = pop.tierCounts[4] + pop.tierCounts[5]
  // PHASE 17.J.9 — citizens reserved for ship-duty via the player slider are added to the
  // volunteer pool regardless of tier. The reservation is the player's explicit assignment
  // ("these are my colony-ship-crew pool, not workers"), so they count even from tier 1-2.
  // Tier 4-5 reservation is already counted in base — subtract to avoid double-counting.
  const reserved = shipDutyReservedPool(pop)
  const reservedFromBelow = reserved.byTier[1] + reserved.byTier[2] + reserved.byTier[3]
  if (!includeWithPropaganda) return base + reservedFromBelow
  return base + pop.tierCounts[3] + reserved.byTier[1] + reserved.byTier[2]
}

export function promoteCitizens(
  pop: PlanetPopulation,
  fromTier: CitizenTier,
  toTier: CitizenTier,
  count: number,
): number {
  if (fromTier >= toTier) {
    throw new Error(`promoteCitizens: fromTier (${fromTier}) must be less than toTier (${toTier})`)
  }
  const available = pop.tierCounts[fromTier]
  const promoted = Math.min(available, count)
  pop.tierCounts[fromTier] -= promoted
  pop.tierCounts[toTier] += promoted
  return promoted
}

export function applyGrowthTick(pop: PlanetPopulation, growthRatePerTick: number): void {
  const total = totalPopulation(pop)
  const cap = Math.min(pop.housingCap, Math.floor(total * pop.foodAvailability))
  if (total >= cap) return
  const newCitizens = Math.min(cap - total, Math.round(total * growthRatePerTick))
  pop.tierCounts[1] += newCitizens
  pop.faction.loyal += Math.round(newCitizens * 0.5)
  pop.faction.skeptic += Math.round(newCitizens * 0.45)
  pop.faction.dissident += Math.round(newCitizens * 0.05)
}
