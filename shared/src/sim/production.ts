import { type BuildingDefId, type ResourceId } from '../types/index'
import { type BiomeDef } from '../gen/biome'
import {
  BLDG_APARTMENT,
  BLDG_AQUEDUCT,
  BLDG_BATTERY_BANK,
  BLDG_CATHEDRAL,
  BLDG_CIVIC_CENTER,
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
  type TechId,
  TECH_ADVANCED_METALLURGY,
  TECH_ANTIMATTER,
  TECH_ASSEMBLY_LINE,
  TECH_CONSUMER_ELECTRONICS,
  TECH_METALLURGY,
  TECH_PETROCHEMISTRY,
} from './tech'
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

// PHASE 17.L.7.4 — per-output tech walls. Adds an optional `requiredTechs` field to each
// output entry so multi-output buildings can gate the advanced outputs without blocking the
// basic ones. A Factory produces components from day 1 but only emits electronics once
// Consumer Electronics is researched. Empty array = no walls (default).
export interface BuildingProductionOutput {
  readonly resource: ResourceId
  readonly amount: number
  readonly requiredTechs?: ReadonlyArray<TechId>
}

export interface BuildingProduction {
  readonly inputs: ReadonlyArray<{ resource: ResourceId; amount: number }>
  readonly outputs: ReadonlyArray<BuildingProductionOutput>
  readonly biomeHintKey?: string
}

const BUILDING_PRODUCTION: ReadonlyMap<BuildingDefId, BuildingProduction> = new Map([
  // PHASE 17.L.D (HOTFIX 2026-05-12) — farm + aqueduct outputs bumped 3-4× per user playtest
  // *"farms arent producing enoutgh food"*. New per-citizen consumption is 0.05 food/tick +
  // 0.02 water/tick (MatchSim.ts), so 1000 citizens need ~50 food + ~20 water per tick. Farm
  // 12/tick × 0.9 workforce mult = 10.8/tick → ~5 farms feed 1000 pop. Aqueduct 20/tick ×
  // 0.9 = 18/tick → ~2 aqueducts hydrate 1000 pop. Balance scales linearly with pop growth.
  [
    BLDG_FARM,
    {
      inputs: [{ resource: RESOURCE_WATER, amount: 1 }],
      outputs: [{ resource: RESOURCE_FOOD, amount: 12 }],
      biomeHintKey: 'food',
    },
  ],
  [
    BLDG_AQUEDUCT,
    {
      inputs: [],
      outputs: [{ resource: RESOURCE_WATER, amount: 20 }],
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
        // PHASE 17.L.7.4 — rare-metal extraction gated on Advanced Metallurgy. Without that
        // tech the mine still ships baseline metals but rare-metal yield is zero.
        {
          resource: RESOURCE_RARE_METALS,
          amount: 1,
          requiredTechs: [TECH_ADVANCED_METALLURGY],
        },
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
      outputs: [
        // PHASE 17.L.7.4 — ingot smelting gated on tier-0 Metallurgy. Without it, foundries
        // sit idle; players have to research Metallurgy before tier-2 industry kicks in.
        { resource: RESOURCE_INGOTS, amount: 2, requiredTechs: [TECH_METALLURGY] },
      ],
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
        // PHASE 17.L.7.4 — components are the tier-2 industrial baseline (gated only on
        // Assembly Line). Electronics gated additionally on Consumer Electronics so the
        // advanced-circuit chain requires the tier-1 information tech.
        { resource: RESOURCE_COMPONENTS, amount: 2, requiredTechs: [TECH_ASSEMBLY_LINE] },
        {
          resource: RESOURCE_ELECTRONICS,
          amount: 1,
          requiredTechs: [TECH_ASSEMBLY_LINE, TECH_CONSUMER_ELECTRONICS],
        },
        { resource: RESOURCE_AMMUNITION, amount: 1, requiredTechs: [TECH_ASSEMBLY_LINE] },
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
      // PHASE 17.L.7.4 — power-plant fuel output left unwalled so the early-game energy chain
      // works from match start. Petrochemistry research bumps yield via
      // buildingProductionMultiplier rather than gating output entirely (avoids dead-building
      // states during the tech research window).
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
        // PHASE 17.L.7.4 — off-planet bulk metal extraction. Baseline metals flow without
        // walls (outpost is foundational). Rare-metal yield gated on Advanced Metallurgy AND
        // Petrochemistry (refining off-planet ore needs both).
        { resource: RESOURCE_METALS, amount: 4 },
        {
          resource: RESOURCE_RARE_METALS,
          amount: 2,
          requiredTechs: [TECH_ADVANCED_METALLURGY, TECH_PETROCHEMISTRY],
        },
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
      // PHASE 17.L.7.4 — defensive tech gate matches the building unlock (TECH_ANTIMATTER).
      // Belt-and-suspenders so if anyone ever wires this building outside the normal tech
      // unlock path, the production tick still refuses to emit until antimatter is researched.
      inputs: [{ resource: RESOURCE_ANTIMATTER, amount: 1 }],
      outputs: [{ resource: RESOURCE_FUEL, amount: 32, requiredTechs: [TECH_ANTIMATTER] }],
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
  // PHASE 17.13.2 — Civic Center founds a settlement on placement. Pure structural / political
  // role — no per-tick production. Settlement-aware action handler manages founding.
  BLDG_CIVIC_CENTER,
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

// PHASE 17.L.A.12 — Q11 PHASE 17 LOCKED ("Full UMS parity — per-resource quota system +
// auto-production tries to hit quotas + auto-recycle disassembles excess back into raw
// materials"). UMS UnityInventory.QueueMissing + RecycleExcess carryover. Three per-building
// modes player can pick:
//
//   - 'auto'        : default. Building runs normal production. Skipped when output is
//                     over its quota — prevents stockpile waste.
//   - 'paused'      : manual halt. Building skips production entirely (workforce idles).
//   - 'disassembly' : reverse-production. Building consumes its normal OUTPUT and produces
//                     its normal INPUT — the UnityInventory RecycleExcess pattern.
//                     Refinery (planks → wood) becomes (planks → wood reversed: takes planks
//                     out, returns wood). Useful when stockpile blew past quota AND you need
//                     the raw materials back.
export type BuildingProductionMode = 'auto' | 'paused' | 'disassembly'

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
  // PHASE 17.L.A.12 — Q11 LOCKED. Per-resource target stockpiles set via the QuotasPanel
  // sliders. When a resource has a quota, auto-mode buildings producing it will idle once
  // stock >= quota — saves workforce + prevents inventory overflow. Resources without a
  // quota entry run unthrottled (current behavior). null / undefined = no quotas configured.
  readonly quotas?: ReadonlyMap<ResourceId, number>
  // PHASE 17.L.A.12 — Q11 LOCKED. Per-building-def production mode override. Keyed by
  // BuildingDefId so the toggle applies to every instance of that building type on the
  // planet uniformly (matches the "set mode on the building type, not per-tile" pattern
  // from UMS UnityInventory). Missing entry = 'auto'.
  readonly buildingModes?: ReadonlyMap<BuildingDefId, BuildingProductionMode>
  // PHASE 17.L.7.4 — set of techs researched by the civ owning this planet. Per-output
  // `requiredTechs` walls are checked against this set; gated outputs idle until all their
  // required techs are researched. Missing / empty = no walls applied (legacy behavior).
  readonly researchedTechs?: ReadonlySet<TechId>
}

export interface ProductionTickResult {
  readonly producedByResource: ReadonlyMap<ResourceId, number>
  readonly consumedByResource: ReadonlyMap<ResourceId, number>
  readonly idledBuildingCount: number
  // PHASE 17.L.A.12 — Q11 LOCKED. Per-resource recycled-back-to-raw amounts so the
  // ProductionGraphPanel / ResourcesPanel can show "X recycled this tick" for disassembly-
  // mode buildings.
  readonly recycledByResource: ReadonlyMap<ResourceId, number>
}

// PHASE 17.L.A.12 — Q11 LOCKED. Refineries / Foundries / Factories are the only buildings
// that support disassembly mode (the UMS UnityInventory RecycleExcess set). Other building
// types — extractors, food, propaganda, etc. — only have one direction. When the player
// sets disassembly on a non-recyclable building, it falls back to 'paused' behavior so the
// building still idles cleanly.
const DISASSEMBLY_CAPABLE_BUILDINGS: ReadonlySet<BuildingDefId> = new Set([
  BLDG_REFINERY,
  BLDG_FOUNDRY,
  BLDG_FACTORY,
])

// PHASE 17.L.A.12 — Q11 LOCKED. Quota-aware skip predicate. Returns true when the building
// should idle this tick because all its OUTPUTS are at-or-above their configured quotas.
// Resources without a quota entry don't count as "over-quota" — they're unlimited. A building
// with mixed outputs (some over-quota, some under) keeps running so the under-quota outputs
// keep flowing.
function buildingExceedsAllOutputQuotas(
  production: BuildingProduction,
  inventory: PlanetInventory,
  quotas: ReadonlyMap<ResourceId, number> | undefined,
): boolean {
  if (!quotas || quotas.size === 0) return false
  if (production.outputs.length === 0) return false
  for (const output of production.outputs) {
    const quota = quotas.get(output.resource)
    if (quota === undefined) return false
    const stock = stockOf(inventory, output.resource)
    if (stock < quota) return false
  }
  return true
}

export function tickPlanetProduction(inputs: ProductionTickInputs): ProductionTickResult {
  const produced = new Map<ResourceId, number>()
  const consumed = new Map<ResourceId, number>()
  const recycled = new Map<ResourceId, number>()
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

    // PHASE 17.L.A.12 — Q11 LOCKED. Resolve per-building-def mode. Missing entry = 'auto'.
    // Disassembly on a non-recyclable building downgrades to 'paused'.
    const rawMode = inputs.buildingModes?.get(defId) ?? 'auto'
    const mode: BuildingProductionMode =
      rawMode === 'disassembly' && !DISASSEMBLY_CAPABLE_BUILDINGS.has(defId) ? 'paused' : rawMode

    if (mode === 'paused') {
      idledBuildingCount += 1
      continue
    }

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

    // PHASE 17.L.A.12 — Q11 LOCKED. DISASSEMBLY MODE — reverse the building. Consume normal
    // OUTPUT, produce normal INPUT. The "auto-recycle disassembles excess back into raw
    // materials" half of the locked answer. Uses the same effectiveMult on the recovered
    // raw-input yield (so an efficient factory recovers more raw materials per tick than an
    // inefficient one). Skipped when output stocks are empty (nothing to disassemble).
    if (mode === 'disassembly') {
      const allOutputsStocked = production.outputs.every(
        (output) => stockOf(inputs.inventory, output.resource) >= output.amount,
      )
      if (!allOutputsStocked) {
        idledBuildingCount += 1
        continue
      }
      for (const output of production.outputs) {
        consumeResource(inputs.inventory, output.resource, output.amount)
        consumed.set(output.resource, (consumed.get(output.resource) ?? 0) + output.amount)
      }
      // Recover inputs proportional to effectiveMult. Disassembly is slightly inefficient —
      // recoveryRate < 1 reflects friction (the UnityInventory RecycleExcess returns ~85% of
      // raw materials on disassembly).
      const recoveryRate = 0.85
      for (const input of production.inputs) {
        const amount = Math.max(0, Math.round(input.amount * effectiveMult * recoveryRate))
        if (amount <= 0) continue
        addResource(inputs.inventory, input.resource, amount)
        recycled.set(input.resource, (recycled.get(input.resource) ?? 0) + amount)
      }
      continue
    }

    // AUTO MODE — normal forward production. PHASE 17.L.A.12 — Q11 LOCKED. Quota-aware
    // throttle: skip when all outputs are at-or-above their configured quotas. Buildings
    // with only some-over-quota outputs still run (the under-quota ones get filled).
    if (buildingExceedsAllOutputQuotas(production, inputs.inventory, inputs.quotas)) {
      idledBuildingCount += 1
      continue
    }

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
      // PHASE 17.L.7.4 — per-output tech gate. If the output declares `requiredTechs`, skip
      // it unless every listed tech is in the civ's researched set. Allows multi-output
      // buildings to emit baseline outputs while gating advanced outputs behind techs.
      if (output.requiredTechs && output.requiredTechs.length > 0) {
        if (!inputs.researchedTechs) continue
        let allResearched = true
        for (const required of output.requiredTechs) {
          if (!inputs.researchedTechs.has(required)) {
            allResearched = false
            break
          }
        }
        if (!allResearched) continue
      }
      const amount = Math.max(0, Math.round(output.amount * effectiveMult))
      if (amount <= 0) continue
      addResource(inputs.inventory, output.resource, amount)
      produced.set(output.resource, (produced.get(output.resource) ?? 0) + amount)
    }
  }

  return {
    producedByResource: produced,
    consumedByResource: consumed,
    idledBuildingCount,
    recycledByResource: recycled,
  }
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
