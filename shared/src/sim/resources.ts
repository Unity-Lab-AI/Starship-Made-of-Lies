import { resourceId, type ResourceId } from '../types/index'

export type ResourceCategory = 'raw' | 'refined' | 'component' | 'product' | 'strategic'

export interface ResourceDef {
  readonly id: ResourceId
  readonly name: string
  readonly emoji: string
  readonly category: ResourceCategory
  readonly description: string
}

export const RESOURCE_FOOD = resourceId('food')
export const RESOURCE_WATER = resourceId('water')
export const RESOURCE_WOOD = resourceId('wood')
export const RESOURCE_STONE = resourceId('stone')
export const RESOURCE_METALS = resourceId('metals')
export const RESOURCE_RARE_METALS = resourceId('rareMetals')
export const RESOURCE_GAS = resourceId('gas')
export const RESOURCE_OIL = resourceId('oil')
export const RESOURCE_ICE = resourceId('ice')
export const RESOURCE_FISH = resourceId('fish')
export const RESOURCE_EXOTIC_FLORA = resourceId('exoticFlora')
export const RESOURCE_SCRAP = resourceId('scrap')

export const RESOURCE_PLANKS = resourceId('planks')
export const RESOURCE_BRICKS = resourceId('bricks')
export const RESOURCE_INGOTS = resourceId('ingots')
export const RESOURCE_ALLOYS = resourceId('alloys')
export const RESOURCE_EXOTIC_ALLOYS = resourceId('exoticAlloys')
export const RESOURCE_FUEL = resourceId('fuel')

export const RESOURCE_CIRCUITS = resourceId('circuits')
export const RESOURCE_GEARS = resourceId('gears')
export const RESOURCE_PANELS = resourceId('panels')
export const RESOURCE_COMPONENTS = resourceId('components')

export const RESOURCE_ELECTRONICS = resourceId('electronics')
export const RESOURCE_TOOLS = resourceId('tools')
export const RESOURCE_MACHINERY = resourceId('machinery')
export const RESOURCE_VEHICLES = resourceId('vehicles')
export const RESOURCE_PROPAGANDA_MATERIALS = resourceId('propagandaMaterials')

export const RESOURCE_AMMUNITION = resourceId('ammunition')
export const RESOURCE_EXPLOSIVES = resourceId('explosives')
export const RESOURCE_WEAPONS = resourceId('weapons')
export const RESOURCE_ANCIENT_TECH = resourceId('ancientTech')
export const RESOURCE_ANTIMATTER = resourceId('antimatter')
export const RESOURCE_FUSION_FUEL = resourceId('fusionFuel')

export const RESOURCES: ReadonlyArray<ResourceDef> = [
  {
    id: RESOURCE_FOOD,
    name: 'Food',
    emoji: '🌾',
    category: 'raw',
    description: 'Agricultural output. Sustains population growth.',
  },
  {
    id: RESOURCE_WATER,
    name: 'Water',
    emoji: '💧',
    category: 'raw',
    description: 'Fresh water. Required for population + agriculture.',
  },
  {
    id: RESOURCE_WOOD,
    name: 'Wood',
    emoji: '🪵',
    category: 'raw',
    description: 'Hardwood lumber. Construction baseline.',
  },
  {
    id: RESOURCE_STONE,
    name: 'Stone',
    emoji: '🪨',
    category: 'raw',
    description: 'Quarried stone. Heavy construction.',
  },
  {
    id: RESOURCE_METALS,
    name: 'Metals',
    emoji: '🔩',
    category: 'raw',
    description: 'Iron + base metals. Industrial baseline.',
  },
  {
    id: RESOURCE_RARE_METALS,
    name: 'Rare Metals',
    emoji: '💍',
    category: 'raw',
    description: 'Lithium / titanium / platinum. Advanced tech inputs.',
  },
  {
    id: RESOURCE_GAS,
    name: 'Gas',
    emoji: '💨',
    category: 'raw',
    description: 'Methane / hydrogen / helium. Fuel + atmospheric processing.',
  },
  {
    id: RESOURCE_OIL,
    name: 'Oil',
    emoji: '🛢️',
    category: 'raw',
    description: 'Petroleum. Industrial fuel.',
  },
  {
    id: RESOURCE_ICE,
    name: 'Ice',
    emoji: '🧊',
    category: 'raw',
    description: 'Frozen water. Refines to water + gas.',
  },
  {
    id: RESOURCE_FISH,
    name: 'Fish',
    emoji: '🍤',
    category: 'raw',
    description: 'Aquaculture food source. Coastal / ocean biomes.',
  },
  {
    id: RESOURCE_EXOTIC_FLORA,
    name: 'Exotic Flora',
    emoji: '🌺',
    category: 'raw',
    description: 'Rare plant compounds. Medicine + propaganda chemicals.',
  },
  {
    id: RESOURCE_SCRAP,
    name: 'Scrap',
    emoji: '🗑️',
    category: 'raw',
    description: 'Salvage from junkyard biomes. Refines to components.',
  },

  {
    id: RESOURCE_PLANKS,
    name: 'Planks',
    emoji: '🪚',
    category: 'refined',
    description: 'Sawn wood. Construction-grade.',
  },
  {
    id: RESOURCE_BRICKS,
    name: 'Bricks',
    emoji: '🧱',
    category: 'refined',
    description: 'Fired stone. Mass construction.',
  },
  {
    id: RESOURCE_INGOTS,
    name: 'Ingots',
    emoji: '🟥',
    category: 'refined',
    description: 'Smelted metal. Manufacturing input.',
  },
  {
    id: RESOURCE_ALLOYS,
    name: 'Alloys',
    emoji: '🔗',
    category: 'refined',
    description: 'Combined metals. High-stress applications.',
  },
  {
    id: RESOURCE_EXOTIC_ALLOYS,
    name: 'Exotic Alloys',
    emoji: '🔮',
    category: 'refined',
    description: 'Rare-metal alloys. End-game tech.',
  },
  {
    id: RESOURCE_FUEL,
    name: 'Fuel',
    emoji: '⛽',
    category: 'refined',
    description: 'Refined petroleum / gas. Vehicle + colony-ship propellant.',
  },

  {
    id: RESOURCE_CIRCUITS,
    name: 'Circuits',
    emoji: '💾',
    category: 'component',
    description: 'Electronic boards. Tech-tier baseline.',
  },
  {
    id: RESOURCE_GEARS,
    name: 'Gears',
    emoji: '⚙️',
    category: 'component',
    description: 'Mechanical components.',
  },
  {
    id: RESOURCE_PANELS,
    name: 'Panels',
    emoji: '🪟',
    category: 'component',
    description: 'Solar / structural panels.',
  },
  {
    id: RESOURCE_COMPONENTS,
    name: 'Components',
    emoji: '📦',
    category: 'component',
    description: 'Mixed mid-tier parts. Building / vehicle assembly.',
  },

  {
    id: RESOURCE_ELECTRONICS,
    name: 'Electronics',
    emoji: '💻',
    category: 'product',
    description: 'Consumer + industrial electronics. Citizen tier-up input.',
  },
  {
    id: RESOURCE_TOOLS,
    name: 'Tools',
    emoji: '🔨',
    category: 'product',
    description: 'Hand + power tools. Worker productivity multiplier.',
  },
  {
    id: RESOURCE_MACHINERY,
    name: 'Machinery',
    emoji: '🏗️',
    category: 'product',
    description: 'Heavy equipment. Industrial-tier construction.',
  },
  {
    id: RESOURCE_VEHICLES,
    name: 'Vehicles',
    emoji: '🚗',
    category: 'product',
    description: 'Ground / atmospheric transports.',
  },
  {
    id: RESOURCE_PROPAGANDA_MATERIALS,
    name: 'Propaganda Materials',
    emoji: '📜',
    category: 'product',
    description: 'Posters / broadcasts / pamphlets. Faction-loyalty fuel.',
  },

  {
    id: RESOURCE_AMMUNITION,
    name: 'Ammunition',
    emoji: '💥',
    category: 'strategic',
    description: 'Standard rounds. Defense + military baseline.',
  },
  {
    id: RESOURCE_EXPLOSIVES,
    name: 'Explosives',
    emoji: '💣',
    category: 'strategic',
    description: 'Industrial + military explosives. Mining + colony-ship payloads.',
  },
  {
    id: RESOURCE_WEAPONS,
    name: 'Weapons',
    emoji: '🔫',
    category: 'strategic',
    description: 'Personal + emplacement weapons. Defense + offense.',
  },
  {
    id: RESOURCE_ANCIENT_TECH,
    name: 'Ancient Tech',
    emoji: '🏛️',
    category: 'strategic',
    description: 'Salvaged from ringworld / crystalline / junkyard. Unlocks Forbidden tech.',
  },
  {
    id: RESOURCE_ANTIMATTER,
    name: 'Antimatter',
    emoji: '⚛️',
    category: 'strategic',
    description: 'Tier-4 strategic. Final colony ship propellant.',
  },
  {
    id: RESOURCE_FUSION_FUEL,
    name: 'Fusion Fuel',
    emoji: '☢️',
    category: 'strategic',
    description: 'Tier-3 strategic. Heavy colony ship + endgame buildings.',
  },
]

export function getResourceDef(id: ResourceId): ResourceDef {
  const r = RESOURCES.find((x) => x.id === id)
  if (!r) throw new Error(`Unknown resource id: ${id}`)
  return r
}

export function resourcesByCategory(category: ResourceCategory): ReadonlyArray<ResourceDef> {
  return RESOURCES.filter((r) => r.category === category)
}
