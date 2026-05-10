import { type ResourceId } from '../types/index'
import { stockOf, type PlanetInventory } from './inventory'
import { dissidentRatio, loyalRatio } from './faction'
import { type PlanetPopulation, totalPopulation } from './population'
import { RESOURCE_EXOTIC_FLORA, RESOURCE_FISH, RESOURCE_FOOD, RESOURCE_WATER } from './resources'

const FOOD_VARIETY_RESOURCES: ReadonlyArray<ResourceId> = [
  RESOURCE_FOOD,
  RESOURCE_FISH,
  RESOURCE_EXOTIC_FLORA,
]
const FOOD_VARIETY_THRESHOLD = 25
const FOOD_QUALITY_BASELINE_PER_CITIZEN = 1
const WATER_BASELINE_PER_CITIZEN = 0.5
const HOUSING_HEADROOM_TARGET = 0.2

export interface QualityOfLifeBreakdown {
  readonly foodVariety: number
  readonly foodQuality: number
  readonly excessHousing: number
  readonly waterAccess: number
  readonly happinessFloor: number
  readonly index: number
}

export interface QualityOfLifeInputs {
  readonly population: PlanetPopulation
  readonly inventory: PlanetInventory
  readonly hasPowerInfrastructure: boolean
}

export function qualityOfLifeIndex(inputs: QualityOfLifeInputs): QualityOfLifeBreakdown {
  const total = totalPopulation(inputs.population)
  const totalSafe = Math.max(1, total)

  let varietyCount = 0
  for (const resourceId of FOOD_VARIETY_RESOURCES) {
    if (stockOf(inputs.inventory, resourceId) >= FOOD_VARIETY_THRESHOLD) varietyCount += 1
  }
  const foodVariety = Math.min(1, varietyCount / FOOD_VARIETY_RESOURCES.length)

  const foodStock =
    stockOf(inputs.inventory, RESOURCE_FOOD) +
    Math.round(stockOf(inputs.inventory, RESOURCE_FISH) * 0.8) +
    Math.round(stockOf(inputs.inventory, RESOURCE_EXOTIC_FLORA) * 0.6)
  const foodPerCitizen = foodStock / totalSafe
  const foodQuality = Math.min(
    1,
    Math.max(
      0,
      (foodPerCitizen / FOOD_QUALITY_BASELINE_PER_CITIZEN) * inputs.population.foodAvailability,
    ),
  )

  const housingHeadroom = Math.max(0, inputs.population.housingCap - total)
  const housingHeadroomRatio = housingHeadroom / Math.max(1, inputs.population.housingCap)
  const excessHousing = Math.min(1, housingHeadroomRatio / HOUSING_HEADROOM_TARGET)

  const waterStock = stockOf(inputs.inventory, RESOURCE_WATER)
  const waterPerCitizen = waterStock / totalSafe
  const waterAccess = Math.min(1, Math.max(0, waterPerCitizen / WATER_BASELINE_PER_CITIZEN))

  const happinessFloor = Math.max(
    0,
    loyalRatio(inputs.population.faction) - dissidentRatio(inputs.population.faction),
  )

  let index =
    foodVariety * 0.18 +
    foodQuality * 0.3 +
    excessHousing * 0.18 +
    waterAccess * 0.18 +
    happinessFloor * 0.16
  if (!inputs.hasPowerInfrastructure) index *= 0.7
  index = Math.max(0, Math.min(1, index))

  return {
    foodVariety,
    foodQuality,
    excessHousing,
    waterAccess,
    happinessFloor,
    index,
  }
}

export function tierPromotionMultiplierFromQoL(qol: QualityOfLifeBreakdown): number {
  if (qol.index <= 0.2) return 0.5
  if (qol.index <= 0.4) return 0.85
  if (qol.index <= 0.6) return 1.0
  if (qol.index <= 0.8) return 1.4
  return 2.2
}

export function birthRateMultiplierFromQoL(qol: QualityOfLifeBreakdown): number {
  if (qol.index <= 0.15) return 0.3
  if (qol.index <= 0.4) return 0.7
  if (qol.index <= 0.7) return 1.0
  return 1.3
}
