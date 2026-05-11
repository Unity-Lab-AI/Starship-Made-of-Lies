import { type DeathLedger, recordDeath } from './death'
import {
  type CitizenTier,
  type PlanetPopulation,
  CITIZEN_TIERS,
  promoteCitizens,
  totalPopulation,
} from './population'
import {
  type QualityOfLifeBreakdown,
  birthRateMultiplierFromQoL,
  tierPromotionMultiplierFromQoL,
} from './quality-of-life'

const STARVATION_KILL_RATE_BASE = 0.02
const DEHYDRATION_KILL_RATE_BASE = 0.025
const PROMOTION_RATE_BASE_PER_TICK = 0.002

export interface StarvationTickInputs {
  readonly tick: number
  readonly population: PlanetPopulation
  readonly foodPerCitizen: number
  readonly themeStarvationResistMultiplier: number
  readonly ledger: DeathLedger
}

export function applyStarvationDeaths(inputs: StarvationTickInputs): number {
  const total = totalPopulation(inputs.population)
  if (total === 0 || inputs.foodPerCitizen >= 1) return 0
  const shortfall = Math.max(0, 1 - inputs.foodPerCitizen)
  const adjustedRate = STARVATION_KILL_RATE_BASE * shortfall
  const themeAdjusted = adjustedRate / Math.max(0.1, inputs.themeStarvationResistMultiplier)
  let killed = 0
  for (let tier = 1; tier <= 5; tier++) {
    const t = tier as CitizenTier
    const inTier = inputs.population.tierCounts[t]
    if (inTier === 0) continue
    const tierKillRate = themeAdjusted * (tier === 1 ? 1.5 : tier === 5 ? 0.4 : 1)
    const dies = Math.min(inTier, Math.floor(inTier * tierKillRate))
    if (dies === 0) continue
    inputs.population.tierCounts[t] = inTier - dies
    recordDeath(inputs.ledger, {
      tick: inputs.tick,
      planetId: inputs.population.planetId,
      cause: 'starvation',
      count: dies,
      tier: t,
    })
    killed += dies
  }
  return killed
}

export interface DehydrationTickInputs {
  readonly tick: number
  readonly population: PlanetPopulation
  readonly waterPerCitizen: number
  readonly ledger: DeathLedger
}

export function applyDehydrationDeaths(inputs: DehydrationTickInputs): number {
  const total = totalPopulation(inputs.population)
  if (total === 0 || inputs.waterPerCitizen >= 0.5) return 0
  const shortfall = Math.max(0, 1 - inputs.waterPerCitizen / 0.5)
  const rate = DEHYDRATION_KILL_RATE_BASE * shortfall
  let killed = 0
  for (let tier = 1; tier <= 5; tier++) {
    const t = tier as CitizenTier
    const inTier = inputs.population.tierCounts[t]
    if (inTier === 0) continue
    const dies = Math.min(inTier, Math.floor(inTier * rate))
    if (dies === 0) continue
    inputs.population.tierCounts[t] = inTier - dies
    recordDeath(inputs.ledger, {
      tick: inputs.tick,
      planetId: inputs.population.planetId,
      cause: 'no_water',
      count: dies,
      tier: t,
    })
    killed += dies
  }
  return killed
}

export interface ExplosionDeathsInputs {
  readonly tick: number
  readonly population: PlanetPopulation
  readonly explosiveYield: number
  readonly ledger: DeathLedger
}

export function applyExplosionDeaths(inputs: ExplosionDeathsInputs): number {
  if (inputs.explosiveYield <= 0) return 0
  const total = totalPopulation(inputs.population)
  if (total === 0) return 0
  const killed = Math.min(total, Math.round(inputs.explosiveYield * 1.5))
  if (killed === 0) return 0
  let remaining = killed
  for (let tier = 1; tier <= 5; tier++) {
    if (remaining === 0) break
    const t = tier as CitizenTier
    const inTier = inputs.population.tierCounts[t]
    if (inTier === 0) continue
    const tierShare = Math.min(inTier, Math.ceil((remaining * inTier) / total))
    inputs.population.tierCounts[t] = inTier - tierShare
    recordDeath(inputs.ledger, {
      tick: inputs.tick,
      planetId: inputs.population.planetId,
      cause: 'explosion',
      count: tierShare,
      tier: t,
    })
    remaining -= tierShare
  }
  return killed - remaining
}

export interface ShipAirlossInputs {
  readonly tick: number
  readonly population: PlanetPopulation
  readonly aboardCount: number
  readonly ledger: DeathLedger
}

export function applyShipAirloss(inputs: ShipAirlossInputs): number {
  if (inputs.aboardCount <= 0) return 0
  recordDeath(inputs.ledger, {
    tick: inputs.tick,
    planetId: null,
    cause: 'no_air',
    count: inputs.aboardCount,
    tier: null,
    note: 'colony-ship hull breach',
  })
  return inputs.aboardCount
}

export interface CrashLandingDeathsInputs {
  readonly tick: number
  readonly civId: import('../types/index').CivId
  readonly aboardCount: number
  readonly ledger: DeathLedger
  readonly survivalRate: number
}

export function applyCrashLandingDeaths(inputs: CrashLandingDeathsInputs): number {
  if (inputs.aboardCount <= 0) return 0
  const survived = Math.min(
    inputs.aboardCount,
    Math.round(inputs.aboardCount * inputs.survivalRate),
  )
  const dead = inputs.aboardCount - survived
  if (dead > 0) {
    recordDeath(inputs.ledger, {
      tick: inputs.tick,
      planetId: null,
      cause: 'crash_landing',
      count: dead,
      tier: null,
      note: 'no landing-gear at piece tier — crash impact',
    })
  }
  return survived
}

export interface TierPromotionTickInputs {
  readonly tick: number
  readonly population: PlanetPopulation
  readonly qol: QualityOfLifeBreakdown
  readonly techPromotionMultiplier: number
  readonly propagandaPromotionMultiplier: number
}

export interface TierPromotionTickResult {
  readonly promotionsByPair: ReadonlyArray<{ from: CitizenTier; to: CitizenTier; count: number }>
  readonly totalPromoted: number
}

export function tickTierPromotion(inputs: TierPromotionTickInputs): TierPromotionTickResult {
  const total = totalPopulation(inputs.population)
  if (total === 0) {
    return { promotionsByPair: [], totalPromoted: 0 }
  }
  const qolMultiplier = tierPromotionMultiplierFromQoL(inputs.qol)
  const effectiveRate =
    PROMOTION_RATE_BASE_PER_TICK *
    qolMultiplier *
    Math.max(0.1, inputs.techPromotionMultiplier) *
    Math.max(0.1, inputs.propagandaPromotionMultiplier)
  const promotions: { from: CitizenTier; to: CitizenTier; count: number }[] = []
  let totalPromoted = 0
  for (let i = 0; i < CITIZEN_TIERS.length - 1; i++) {
    const from = CITIZEN_TIERS[i]!.tier
    const to = CITIZEN_TIERS[i + 1]!.tier
    const inTier = inputs.population.tierCounts[from]
    if (inTier === 0) continue
    const candidates = Math.floor(inTier * effectiveRate)
    if (candidates <= 0) continue
    const promoted = promoteCitizens(inputs.population, from, to, candidates)
    if (promoted > 0) {
      promotions.push({ from, to, count: promoted })
      totalPromoted += promoted
    }
  }
  return { promotionsByPair: promotions, totalPromoted }
}

export interface BirthTickInputs {
  readonly population: PlanetPopulation
  readonly qol: QualityOfLifeBreakdown
  readonly baseGrowthRatePerTick: number
}

export function applyQoLBirthTick(inputs: BirthTickInputs): number {
  const total = totalPopulation(inputs.population)
  const cap = Math.min(
    inputs.population.housingCap,
    Math.floor(total * inputs.population.foodAvailability),
  )
  if (total >= cap) return 0
  const adjustedRate = inputs.baseGrowthRatePerTick * birthRateMultiplierFromQoL(inputs.qol)
  const newCitizens = Math.min(cap - total, Math.round(total * adjustedRate))
  if (newCitizens <= 0) return 0
  inputs.population.tierCounts[1] += newCitizens
  inputs.population.faction.loyal += Math.round(newCitizens * 0.5)
  inputs.population.faction.skeptic += Math.round(newCitizens * 0.45)
  inputs.population.faction.dissident += Math.round(newCitizens * 0.05)
  return newCitizens
}
