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
  }
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

export function volunteerPool(pop: PlanetPopulation, includeWithPropaganda: boolean): number {
  const base = pop.tierCounts[4] + pop.tierCounts[5]
  if (!includeWithPropaganda) return base
  return base + pop.tierCounts[3]
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
