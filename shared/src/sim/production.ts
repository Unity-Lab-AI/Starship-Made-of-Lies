import { type BuildingDefId, type ResourceId } from '../types/index'
import { type BiomeDef } from '../gen/biome'
import {
  BLDG_AQUEDUCT,
  BLDG_FACTORY,
  BLDG_FARM,
  BLDG_FOUNDRY,
  BLDG_LUMBER_CAMP,
  BLDG_MINE,
  BLDG_MINING_OUTPOST,
  BLDG_POWER_PLANT,
  BLDG_QUARRY,
  BLDG_REFINERY,
  BLDG_SOLAR_ARRAY,
  type BuildingDef,
} from './building'
import { type FactionSplit, performanceMultiplier } from './faction'
import { type PlanetInventory, addResource, consumeResource, stockOf } from './inventory'
import {
  RESOURCE_BRICKS,
  RESOURCE_FOOD,
  RESOURCE_FUEL,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_OIL,
  RESOURCE_PLANKS,
  RESOURCE_RARE_METALS,
  RESOURCE_STONE,
  RESOURCE_WATER,
  RESOURCE_WOOD,
} from './resources'
import { type WorkforceSliders } from './workforce'

export interface BuildingProduction {
  readonly inputs: ReadonlyArray<{ resource: ResourceId; amount: number }>
  readonly outputs: ReadonlyArray<{ resource: ResourceId; amount: number }>
  readonly biomeHintKey?: string
}

const BUILDING_PRODUCTION: ReadonlyMap<BuildingDefId, BuildingProduction> = new Map([
  [
    BLDG_FARM,
    {
      inputs: [{ resource: RESOURCE_WATER, amount: 1 }],
      outputs: [{ resource: RESOURCE_FOOD, amount: 4 }],
      biomeHintKey: 'food',
    },
  ],
  [
    BLDG_AQUEDUCT,
    {
      inputs: [],
      outputs: [{ resource: RESOURCE_WATER, amount: 5 }],
      biomeHintKey: 'water',
    },
  ],
  [
    BLDG_LUMBER_CAMP,
    {
      inputs: [],
      outputs: [{ resource: RESOURCE_WOOD, amount: 3 }],
      biomeHintKey: 'wood',
    },
  ],
  [
    BLDG_QUARRY,
    {
      inputs: [],
      outputs: [{ resource: RESOURCE_STONE, amount: 4 }],
      biomeHintKey: 'stone',
    },
  ],
  [
    BLDG_MINE,
    {
      inputs: [],
      outputs: [
        { resource: RESOURCE_METALS, amount: 3 },
        { resource: RESOURCE_RARE_METALS, amount: 1 },
      ],
      biomeHintKey: 'rareMetals',
    },
  ],
  [
    BLDG_REFINERY,
    {
      inputs: [
        { resource: RESOURCE_WOOD, amount: 2 },
        { resource: RESOURCE_STONE, amount: 2 },
        { resource: RESOURCE_METALS, amount: 1 },
      ],
      outputs: [
        { resource: RESOURCE_PLANKS, amount: 2 },
        { resource: RESOURCE_BRICKS, amount: 2 },
      ],
    },
  ],
  [
    BLDG_FOUNDRY,
    {
      inputs: [{ resource: RESOURCE_METALS, amount: 3 }],
      outputs: [{ resource: RESOURCE_INGOTS, amount: 2 }],
    },
  ],
  [
    BLDG_FACTORY,
    {
      inputs: [
        { resource: RESOURCE_INGOTS, amount: 2 },
        { resource: RESOURCE_PLANKS, amount: 1 },
      ],
      outputs: [],
    },
  ],
  [
    BLDG_POWER_PLANT,
    {
      inputs: [{ resource: RESOURCE_OIL, amount: 1 }],
      outputs: [{ resource: RESOURCE_FUEL, amount: 2 }],
    },
  ],
  [
    BLDG_SOLAR_ARRAY,
    {
      inputs: [],
      outputs: [{ resource: RESOURCE_FUEL, amount: 1 }],
      biomeHintKey: 'energy',
    },
  ],
  [
    BLDG_MINING_OUTPOST,
    {
      inputs: [{ resource: RESOURCE_FUEL, amount: 1 }],
      outputs: [
        { resource: RESOURCE_METALS, amount: 4 },
        { resource: RESOURCE_RARE_METALS, amount: 2 },
      ],
    },
  ],
])

export function getBuildingProduction(id: BuildingDefId): BuildingProduction | null {
  return BUILDING_PRODUCTION.get(id) ?? null
}

export interface ProductionTickInputs {
  readonly buildings: ReadonlyArray<{ defId: BuildingDefId; def: BuildingDef }>
  readonly biome: BiomeDef
  readonly workforce: WorkforceSliders
  readonly faction: FactionSplit
  readonly inventory: PlanetInventory
  readonly techProductionMultiplier: number
  readonly themeProductionMultiplier: number
  readonly deceptionProductionMultiplier: number
}

export interface ProductionTickResult {
  readonly producedByResource: ReadonlyMap<ResourceId, number>
  readonly consumedByResource: ReadonlyMap<ResourceId, number>
  readonly idledBuildingCount: number
}

export function tickPlanetProduction(inputs: ProductionTickInputs): ProductionTickResult {
  const produced = new Map<ResourceId, number>()
  const consumed = new Map<ResourceId, number>()
  let idledBuildingCount = 0

  const factionMult = performanceMultiplier(inputs.faction)
  const baseMult =
    factionMult *
    inputs.techProductionMultiplier *
    inputs.themeProductionMultiplier *
    inputs.deceptionProductionMultiplier
  const industryWeight = clamp01(inputs.workforce.industry + inputs.workforce.food * 0.5)

  for (const { defId, def } of inputs.buildings) {
    const production = BUILDING_PRODUCTION.get(defId)
    if (!production) continue

    const biomeMultiplier = production.biomeHintKey
      ? (inputs.biome.resourceHints[production.biomeHintKey] ?? 1)
      : 1
    const categoryWeight = categoryWorkforceWeight(def.category, inputs.workforce)
    const effectiveMult = baseMult * biomeMultiplier * categoryWeight * (0.5 + 0.5 * industryWeight)

    const allConsumed = production.inputs.every(
      (input) => stockOf(inputs.inventory, input.resource) >= input.amount,
    )
    if (!allConsumed) {
      idledBuildingCount += 1
      continue
    }

    for (const input of production.inputs) {
      consumeResource(inputs.inventory, input.resource, input.amount)
      consumed.set(input.resource, (consumed.get(input.resource) ?? 0) + input.amount)
    }

    for (const output of production.outputs) {
      const amount = Math.max(0, Math.round(output.amount * effectiveMult))
      if (amount <= 0) continue
      addResource(inputs.inventory, output.resource, amount)
      produced.set(output.resource, (produced.get(output.resource) ?? 0) + amount)
    }
  }

  return { producedByResource: produced, consumedByResource: consumed, idledBuildingCount }
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function categoryWorkforceWeight(
  category: BuildingDef['category'],
  sliders: WorkforceSliders,
): number {
  switch (category) {
    case 'food':
      return 0.5 + sliders.food
    case 'extraction':
    case 'industry':
      return 0.5 + sliders.industry
    case 'research':
      return 0.5 + sliders.research
    case 'propaganda':
      return 0.5 + sliders.propaganda
    case 'launch':
    case 'defense':
      return 0.5 + sliders.military
    case 'housing':
    case 'utility':
    default:
      return 1
  }
}
