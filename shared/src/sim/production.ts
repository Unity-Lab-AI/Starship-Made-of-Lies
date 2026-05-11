import { type BuildingDefId, type ResourceId } from '../types/index'
import { type BiomeDef } from '../gen/biome'
import {
  BLDG_APARTMENT,
  BLDG_AQUEDUCT,
  BLDG_BATTERY_BANK,
  BLDG_CATHEDRAL,
  BLDG_CORP_PROMOTIONS,
  BLDG_COUNTER_MISSILE,
  BLDG_FACTORY,
  BLDG_FARM,
  BLDG_FOUNDRY,
  BLDG_GOD_CONTROL,
  BLDG_HOME,
  BLDG_LAB,
  BLDG_LAUNCH_PAD,
  BLDG_LUMBER_CAMP,
  BLDG_MINE,
  BLDG_MINE_FIELD,
  BLDG_MINING_OUTPOST,
  BLDG_POWER_PLANT,
  BLDG_QUARRY,
  BLDG_REACTOR_ANTIMATTER,
  BLDG_REACTOR_FISSION,
  BLDG_REACTOR_FUSION,
  BLDG_REEDUCATION,
  BLDG_REFINERY,
  BLDG_SCHOOL,
  BLDG_SOLAR_ARRAY,
  BLDG_TV_STATION,
  BLDG_UNIVERSITY,
  BUILDINGS,
  type BuildingDef,
} from './building'
import { type FactionSplit, performanceMultiplier } from './faction'
import { type PlanetInventory, addResource, consumeResource, stockOf } from './inventory'
import {
  RESOURCE_AMMUNITION,
  RESOURCE_ANTIMATTER,
  RESOURCE_BRICKS,
  RESOURCE_COMPONENTS,
  RESOURCE_ELECTRONICS,
  RESOURCE_FOOD,
  RESOURCE_FUEL,
  RESOURCE_FUSION_FUEL,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_OIL,
  RESOURCE_PLANKS,
  RESOURCE_PROPAGANDA_MATERIALS,
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
      // PHASE 17.B.1 — Factory was shipped with empty outputs (description promised
      // "components / electronics / vehicles" but produced nothing). Tier-3 industry now
      // actually emits the components + electronics it's supposed to. Vehicles stay gated
      // behind a tier-4 building.
      inputs: [
        { resource: RESOURCE_INGOTS, amount: 2 },
        { resource: RESOURCE_PLANKS, amount: 1 },
      ],
      outputs: [
        { resource: RESOURCE_COMPONENTS, amount: 2 },
        { resource: RESOURCE_ELECTRONICS, amount: 1 },
        { resource: RESOURCE_AMMUNITION, amount: 1 },
      ],
    },
  ],
  [
    BLDG_LAB,
    {
      // PHASE 17.B.1 — Research is tallied by tickCivResearch (separate system), so the lab
      // has no resource output here. The operating cost (1 electronics / tick) keeps it from
      // being a free research producer and gives the player a real upstream-industry pressure.
      inputs: [{ resource: RESOURCE_ELECTRONICS, amount: 1 }],
      outputs: [],
    },
  ],
  [
    BLDG_SCHOOL,
    {
      // PHASE 17.B.1 — propaganda chain. Tier-1 producer.
      inputs: [{ resource: RESOURCE_PLANKS, amount: 1 }],
      outputs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 1 }],
    },
  ],
  [
    BLDG_UNIVERSITY,
    {
      // PHASE 17.B.1 — propaganda chain. Tier-2 producer.
      inputs: [{ resource: RESOURCE_BRICKS, amount: 1 }],
      outputs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 2 }],
    },
  ],
  [
    BLDG_CATHEDRAL,
    {
      // PHASE 17.B.1 — propaganda chain (theocracy flavor). Heaviest output.
      inputs: [{ resource: RESOURCE_BRICKS, amount: 1 }],
      outputs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 3 }],
    },
  ],
  [
    BLDG_REEDUCATION,
    {
      // PHASE 17.B.1 — propaganda chain (surveillance flavor).
      inputs: [{ resource: RESOURCE_BRICKS, amount: 1 }],
      outputs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 2 }],
    },
  ],
  [
    BLDG_CORP_PROMOTIONS,
    {
      // PHASE 17.B.1 — propaganda chain (corporate flavor). Runs on electronics.
      inputs: [{ resource: RESOURCE_ELECTRONICS, amount: 1 }],
      outputs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 2 }],
    },
  ],
  [
    BLDG_TV_STATION,
    {
      // PHASE 17.B.1 — broadcast propaganda. Higher output but pricier inputs.
      inputs: [
        { resource: RESOURCE_ELECTRONICS, amount: 1 },
        { resource: RESOURCE_COMPONENTS, amount: 1 },
      ],
      outputs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 3 }],
    },
  ],
  [
    BLDG_HOME,
    {
      // PHASE 17.B.1 — housing upkeep. Population food/water demand is modeled separately by
      // the population system; this is structural maintenance (wood for repairs). Outputs
      // empty by design — housing supplies citizen slots, not resources.
      inputs: [{ resource: RESOURCE_WOOD, amount: 1 }],
      outputs: [],
    },
  ],
  [
    BLDG_APARTMENT,
    {
      // PHASE 17.B.1 — denser housing → richer upkeep (bricks + electronics for lifts/lights).
      inputs: [
        { resource: RESOURCE_BRICKS, amount: 1 },
        { resource: RESOURCE_ELECTRONICS, amount: 1 },
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
  [
    BLDG_REACTOR_FISSION,
    {
      // PHASE 17.J.8 — fission reactor: rare metals stand in for uranium ore. 4× a power plant.
      inputs: [{ resource: RESOURCE_RARE_METALS, amount: 1 }],
      outputs: [{ resource: RESOURCE_FUEL, amount: 8 }],
    },
  ],
  [
    BLDG_REACTOR_FUSION,
    {
      // PHASE 17.J.8 — fusion reactor: consumes fusion fuel. 8× a power plant.
      inputs: [{ resource: RESOURCE_FUSION_FUEL, amount: 1 }],
      outputs: [{ resource: RESOURCE_FUEL, amount: 16 }],
    },
  ],
  [
    BLDG_REACTOR_ANTIMATTER,
    {
      // PHASE 17.J.8 — antimatter reactor: consumes antimatter. 16× a power plant.
      inputs: [{ resource: RESOURCE_ANTIMATTER, amount: 1 }],
      outputs: [{ resource: RESOURCE_FUEL, amount: 32 }],
    },
  ],
])

// PHASE 17.B.1 — utility buildings explicitly have no production-system entry by design.
// Their gameplay effect lives in other systems: LAUNCH_PAD spawns colony ships via tickPad,
// MINE_FIELD + COUNTER_MISSILE intercept incoming flights via tickFlight, GOD_CONTROL gates
// the right-click redirect UX in PlayPage. Listed here so the audit gate below can confirm
// every BLDG_* either ships a production entry OR is intentionally utility-only.
export const UTILITY_BUILDINGS_NO_PRODUCTION: ReadonlySet<BuildingDefId> = new Set<BuildingDefId>([
  BLDG_LAUNCH_PAD,
  BLDG_MINE_FIELD,
  BLDG_COUNTER_MISSILE,
  BLDG_GOD_CONTROL,
  // PHASE 17.J.7 — battery is pure stockpile capacity, no per-tick production. The energy
  // panel reads battery count × per-bank capacity stat to compute total storage cap; the
  // sim doesn't apply a hard storage cap yet (FUEL accumulates uncapped). v1 surfaces the
  // metric visually, hard cap lands in a later sub-phase if/when energy gating ships.
  BLDG_BATTERY_BANK,
])

// PHASE 17.J.7 — per-battery storage capacity. Read by the planet energy panel to compute
// total storage = batteryCount × BATTERY_BANK_CAPACITY.
export const BATTERY_BANK_CAPACITY = 500

// PHASE 17.L.A.2 — baseline fuel stockpile for planets with zero battery banks. Prevents the
// "zero-storage cripple" failure mode where a brand-new planet can't accumulate any fuel.
// Per TODO 17.L.A.2 "a small 'raw stockpile' baseline".
export const FUEL_RAW_STOCKPILE_BASELINE = 100

// PHASE 17.B.1 + super-review fix: drift gate is now an exported function instead of a
// module-load throw. Reason: throwing at import time means any tooling that imports this
// module (tests, type-check, SSR, storybook) explodes on misconfiguration with no chance to
// surface a friendly dev-console error. Call this once at app boot under DEV-only gating.
//
// `validateBuildingProductionCatalog` checks that every BLDG_* in BUILDINGS either has a
// production entry OR is declared utility-only. Throws on drift so dev catches it loudly.
export function validateBuildingProductionCatalog(): void {
  for (const def of BUILDINGS) {
    const hasProd = BUILDING_PRODUCTION.has(def.id)
    const isUtility = UTILITY_BUILDINGS_NO_PRODUCTION.has(def.id)
    if (!hasProd && !isUtility) {
      throw new Error(
        `[production.ts] Building ${String(def.id)} (${def.name}) has no production entry ` +
          `and is not declared utility-only. Add to BUILDING_PRODUCTION or to ` +
          `UTILITY_BUILDINGS_NO_PRODUCTION.`,
      )
    }
    if (hasProd && isUtility) {
      throw new Error(
        `[production.ts] Building ${String(def.id)} (${def.name}) is BOTH in BUILDING_PRODUCTION ` +
          `and UTILITY_BUILDINGS_NO_PRODUCTION. Pick one.`,
      )
    }
  }
}

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
  // PHASE 17.L.A.3 — when true (planet is in brownout = surplus < 0 AND fuel stockpile ≤ 0),
  // every fuel-consuming building's production tick is skipped this iteration. The brownout
  // "rationing pause" lets the planet's fuel-producing buildings (which don't consume fuel as
  // input) build up enough reserves for the next tick. Surfaces via idledBuildingCount in
  // the result + the "⚠ disabled — no fuel" indicator in PlanetEnergyPanel breakdown rows.
  readonly brownoutActive?: boolean
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

    // PHASE 17.L.A.3 — brownout gate. Buildings that consume fuel as input idle for this
    // tick when the planet is in brownout (insufficient capacity + empty reserves). Lets the
    // fuel producers (which don't consume fuel) catch up.
    const consumesFuel = production.inputs.some((i) => i.resource === RESOURCE_FUEL && i.amount > 0)
    if (inputs.brownoutActive && consumesFuel) {
      idledBuildingCount += 1
      continue
    }

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
