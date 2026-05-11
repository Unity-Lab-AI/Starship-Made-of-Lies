import { buildingDefId, type BuildingDefId, type ResourceId } from '../types/index'
import {
  RESOURCE_AMMUNITION,
  RESOURCE_ANTIMATTER,
  RESOURCE_BRICKS,
  RESOURCE_COMPONENTS,
  RESOURCE_ELECTRONICS,
  RESOURCE_FUEL,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_PLANKS,
  RESOURCE_PROPAGANDA_MATERIALS,
  RESOURCE_RARE_METALS,
  RESOURCE_STONE,
} from './resources'

export type BuildingCategory =
  | 'food'
  | 'extraction'
  | 'industry'
  | 'research'
  | 'housing'
  | 'propaganda'
  | 'defense'
  | 'launch'
  | 'utility'

export interface ResourceCost {
  readonly resource: ResourceId
  readonly amount: number
}

export interface BuildingDef {
  readonly id: BuildingDefId
  readonly name: string
  readonly emoji: string
  readonly category: BuildingCategory
  readonly buildCost: ReadonlyArray<ResourceCost>
  readonly buildTimeTicks: number
  readonly citizenSlots: number
  readonly description: string
}

export const BLDG_FARM = buildingDefId('farm')
export const BLDG_AQUEDUCT = buildingDefId('aqueduct')
export const BLDG_LUMBER_CAMP = buildingDefId('lumberCamp')
export const BLDG_QUARRY = buildingDefId('quarry')
export const BLDG_MINE = buildingDefId('mine')
export const BLDG_REFINERY = buildingDefId('refinery')
export const BLDG_FOUNDRY = buildingDefId('foundry')
export const BLDG_FACTORY = buildingDefId('factory')
export const BLDG_LAB = buildingDefId('lab')
export const BLDG_SCHOOL = buildingDefId('school')
export const BLDG_UNIVERSITY = buildingDefId('university')
export const BLDG_CATHEDRAL = buildingDefId('cathedral')
export const BLDG_REEDUCATION = buildingDefId('reeducationCenter')
export const BLDG_CORP_PROMOTIONS = buildingDefId('corpPromotionsOffice')
export const BLDG_TV_STATION = buildingDefId('tvStation')
export const BLDG_HOME = buildingDefId('home')
export const BLDG_APARTMENT = buildingDefId('apartmentComplex')
export const BLDG_POWER_PLANT = buildingDefId('powerPlant')
export const BLDG_SOLAR_ARRAY = buildingDefId('solarArray')
// PHASE 17.J.7 — utility battery storage. Pure stockpile capacity for the planet energy
// panel; does not produce or consume per tick. capacityStat surfaces in the energy panel
// as "battery storage cap = N".
export const BLDG_BATTERY_BANK = buildingDefId('batteryBank')
// PHASE 17.J.8 — three planet-level reactor tiers. Each consumes its tier-specific
// radioactive resource per tick and produces high RESOURCE_FUEL output. Tech-gated on
// TECH_NUCLEAR_FISSION / TECH_FUSION_POWER / TECH_ANTIMATTER respectively.
export const BLDG_REACTOR_FISSION = buildingDefId('reactorFission')
export const BLDG_REACTOR_FUSION = buildingDefId('reactorFusion')
export const BLDG_REACTOR_ANTIMATTER = buildingDefId('reactorAntimatter')
export const BLDG_LAUNCH_PAD = buildingDefId('launchPad')
export const BLDG_MINE_FIELD = buildingDefId('mineField')
export const BLDG_COUNTER_MISSILE = buildingDefId('counterMissilePad')
export const BLDG_MINING_OUTPOST = buildingDefId('miningOutpost')
// PHASE 16.31 — God Control building. Per user verbatim "send your rocket places too as an
// option if 'god control' is researched and installed". Gates the right-click flight-redirect
// UX in PlayPage. Requires TECH_GOD_CONTROL researched + at least one BLDG_GOD_CONTROL on any
// owned planet for the redirect action to validate.
export const BLDG_GOD_CONTROL = buildingDefId('godControl')

export const BUILDINGS: ReadonlyArray<BuildingDef> = [
  {
    id: BLDG_FARM,
    name: 'Farm',
    emoji: '🌾',
    category: 'food',
    buildCost: [
      { resource: RESOURCE_PLANKS, amount: 20 },
      { resource: RESOURCE_STONE, amount: 10 },
    ],
    buildTimeTicks: 30,
    citizenSlots: 4,
    description: 'Produces food from terrain. Biome multipliers apply.',
  },
  {
    id: BLDG_AQUEDUCT,
    name: 'Aqueduct',
    emoji: '💧',
    category: 'utility',
    buildCost: [
      { resource: RESOURCE_BRICKS, amount: 25 },
      { resource: RESOURCE_STONE, amount: 30 },
    ],
    buildTimeTicks: 40,
    citizenSlots: 2,
    description: 'Channels fresh water for population + agriculture.',
  },
  {
    id: BLDG_LUMBER_CAMP,
    name: 'Lumber Camp',
    emoji: '🪵',
    category: 'extraction',
    buildCost: [{ resource: RESOURCE_PLANKS, amount: 15 }],
    buildTimeTicks: 25,
    citizenSlots: 4,
    description: 'Harvests hardwood from forested tiles.',
  },
  {
    id: BLDG_QUARRY,
    name: 'Quarry',
    emoji: '⛏️',
    category: 'extraction',
    buildCost: [
      { resource: RESOURCE_PLANKS, amount: 20 },
      { resource: RESOURCE_METALS, amount: 10 },
    ],
    buildTimeTicks: 35,
    citizenSlots: 6,
    description: 'Extracts stone from rocky tiles.',
  },
  {
    id: BLDG_MINE,
    name: 'Mine',
    emoji: '🪨',
    category: 'extraction',
    buildCost: [
      { resource: RESOURCE_PLANKS, amount: 25 },
      { resource: RESOURCE_METALS, amount: 20 },
    ],
    buildTimeTicks: 45,
    citizenSlots: 8,
    description: 'Extracts metals + rare metals depending on biome.',
  },
  {
    id: BLDG_REFINERY,
    name: 'Refinery',
    emoji: '🏭',
    category: 'industry',
    buildCost: [
      { resource: RESOURCE_BRICKS, amount: 40 },
      { resource: RESOURCE_METALS, amount: 30 },
    ],
    buildTimeTicks: 60,
    citizenSlots: 6,
    description: 'Refines raw materials into refined intermediates (planks/bricks/ingots).',
  },
  {
    id: BLDG_FOUNDRY,
    name: 'Foundry',
    emoji: '⚒️',
    category: 'industry',
    buildCost: [
      { resource: RESOURCE_BRICKS, amount: 50 },
      { resource: RESOURCE_INGOTS, amount: 25 },
    ],
    buildTimeTicks: 70,
    citizenSlots: 6,
    description: 'Smelts metals into ingots + alloys. Tier-2 industry.',
  },
  {
    id: BLDG_FACTORY,
    name: 'Factory',
    emoji: '🏗️',
    category: 'industry',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 50 },
      { resource: RESOURCE_COMPONENTS, amount: 20 },
    ],
    buildTimeTicks: 90,
    citizenSlots: 12,
    description: 'Mass-produces components / electronics / vehicles. Tier-3 industry.',
  },
  {
    id: BLDG_LAB,
    name: 'Research Lab',
    emoji: '🥼',
    category: 'research',
    buildCost: [
      { resource: RESOURCE_BRICKS, amount: 30 },
      { resource: RESOURCE_ELECTRONICS, amount: 10 },
    ],
    buildTimeTicks: 80,
    citizenSlots: 4,
    description: 'Generates research points. Scientist citizens (Skilled+ tier) preferred.',
  },
  {
    id: BLDG_SCHOOL,
    name: 'School',
    emoji: '🏫',
    category: 'propaganda',
    buildCost: [
      { resource: RESOURCE_PLANKS, amount: 25 },
      { resource: RESOURCE_BRICKS, amount: 15 },
    ],
    buildTimeTicks: 50,
    citizenSlots: 4,
    description: 'Promotes Worker → Skilled citizens. Generates passive Loyalty.',
  },
  {
    id: BLDG_UNIVERSITY,
    name: 'University',
    emoji: '🎓',
    category: 'propaganda',
    buildCost: [
      { resource: RESOURCE_BRICKS, amount: 50 },
      { resource: RESOURCE_ELECTRONICS, amount: 20 },
    ],
    buildTimeTicks: 100,
    citizenSlots: 6,
    description: 'Promotes Skilled → Privileged citizens + research bonus.',
  },
  {
    id: BLDG_CATHEDRAL,
    name: 'Cathedral',
    emoji: '🛐',
    category: 'propaganda',
    buildCost: [
      { resource: RESOURCE_BRICKS, amount: 80 },
      { resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 30 },
    ],
    buildTimeTicks: 120,
    citizenSlots: 8,
    description:
      'Theme-flavored indoctrination (Theocracy). Promotes Privileged → Elite. Heavy Loyalty boost.',
  },
  {
    id: BLDG_REEDUCATION,
    name: 'Re-education Center',
    emoji: '👁️',
    category: 'propaganda',
    buildCost: [
      { resource: RESOURCE_BRICKS, amount: 40 },
      { resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 25 },
    ],
    buildTimeTicks: 90,
    citizenSlots: 6,
    description:
      'Theme-flavored indoctrination (Surveillance). Flips skeptics → loyal. Sustained Loyalty.',
  },
  {
    id: BLDG_CORP_PROMOTIONS,
    name: 'Corporate Promotions Office',
    emoji: '💼',
    category: 'propaganda',
    buildCost: [
      { resource: RESOURCE_ELECTRONICS, amount: 30 },
      { resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 20 },
    ],
    buildTimeTicks: 80,
    citizenSlots: 4,
    description: 'Theme-flavored indoctrination (Corporate). Tier-up via "promotion" pipeline.',
  },
  {
    id: BLDG_TV_STATION,
    name: 'TV Station',
    emoji: '📺',
    category: 'propaganda',
    buildCost: [
      { resource: RESOURCE_ELECTRONICS, amount: 40 },
      { resource: RESOURCE_COMPONENTS, amount: 30 },
    ],
    buildTimeTicks: 70,
    citizenSlots: 3,
    description:
      'Broad-spectrum propaganda broadcast. Passive Loyalty across all Worker / Skilled tiers.',
  },
  {
    id: BLDG_HOME,
    name: 'Home',
    emoji: '🏠',
    category: 'housing',
    buildCost: [
      { resource: RESOURCE_PLANKS, amount: 15 },
      { resource: RESOURCE_BRICKS, amount: 10 },
    ],
    buildTimeTicks: 20,
    citizenSlots: 0,
    description: 'Houses 8 citizens. Baseline housing.',
  },
  {
    id: BLDG_APARTMENT,
    name: 'Apartment Complex',
    emoji: '🏘️',
    category: 'housing',
    buildCost: [
      { resource: RESOURCE_BRICKS, amount: 60 },
      { resource: RESOURCE_COMPONENTS, amount: 20 },
    ],
    buildTimeTicks: 70,
    citizenSlots: 0,
    description: 'Houses 32 citizens. Higher density, lower happiness ceiling.',
  },
  {
    id: BLDG_POWER_PLANT,
    name: 'Power Plant',
    emoji: '⚡',
    category: 'utility',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 60 },
      { resource: RESOURCE_COMPONENTS, amount: 30 },
    ],
    buildTimeTicks: 100,
    citizenSlots: 4,
    description: 'Burns fuel for energy. Constant draw on fuel reserves.',
  },
  {
    id: BLDG_SOLAR_ARRAY,
    name: 'Solar Array',
    emoji: '☀️',
    category: 'utility',
    buildCost: [
      { resource: RESOURCE_COMPONENTS, amount: 40 },
      { resource: RESOURCE_INGOTS, amount: 20 },
    ],
    buildTimeTicks: 60,
    citizenSlots: 1,
    description: 'Free energy. Biome multiplier: desert / ringworld bonus.',
  },
  {
    id: BLDG_BATTERY_BANK,
    name: 'Battery Bank',
    emoji: '🔋',
    category: 'utility',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 50 },
      { resource: RESOURCE_ELECTRONICS, amount: 30 },
      { resource: RESOURCE_COMPONENTS, amount: 20 },
    ],
    buildTimeTicks: 70,
    citizenSlots: 2,
    description:
      'Stores surplus fuel for use when production dips below draw. Surfaces in the planet energy panel as battery capacity.',
  },
  {
    id: BLDG_REACTOR_FISSION,
    name: 'Fission Reactor',
    emoji: '☢️',
    category: 'utility',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 120 },
      { resource: RESOURCE_COMPONENTS, amount: 60 },
      { resource: RESOURCE_ELECTRONICS, amount: 40 },
    ],
    buildTimeTicks: 180,
    citizenSlots: 8,
    description:
      'Burns rare-metal fuel rods for sustained energy output. 4× the fuel throughput of a Power Plant. Requires TECH_NUCLEAR_FISSION.',
  },
  {
    id: BLDG_REACTOR_FUSION,
    name: 'Fusion Reactor',
    emoji: '🌟',
    category: 'utility',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 200 },
      { resource: RESOURCE_ELECTRONICS, amount: 120 },
      { resource: RESOURCE_COMPONENTS, amount: 80 },
      { resource: RESOURCE_RARE_METALS, amount: 40 },
    ],
    buildTimeTicks: 260,
    citizenSlots: 10,
    description:
      'Sustained fusion. Consumes fusion fuel, outputs 8× a Power Plant. Requires TECH_FUSION_POWER.',
  },
  {
    id: BLDG_REACTOR_ANTIMATTER,
    name: 'Antimatter Reactor',
    emoji: '💠',
    category: 'utility',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 280 },
      { resource: RESOURCE_ELECTRONICS, amount: 200 },
      { resource: RESOURCE_COMPONENTS, amount: 140 },
      { resource: RESOURCE_ANTIMATTER, amount: 20 },
    ],
    buildTimeTicks: 340,
    citizenSlots: 14,
    description:
      'Annihilation reactor. Consumes antimatter, outputs 16× a Power Plant. Requires TECH_ANTIMATTER.',
  },
  {
    id: BLDG_LAUNCH_PAD,
    name: 'Launch Pad',
    emoji: '🚀',
    category: 'launch',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 100 },
      { resource: RESOURCE_FUEL, amount: 50 },
      { resource: RESOURCE_COMPONENTS, amount: 50 },
    ],
    buildTimeTicks: 150,
    citizenSlots: 8,
    description:
      'Builds + launches colony ships. Multi-pad coordination per UMS UnityPad carryover.',
  },
  {
    id: BLDG_MINE_FIELD,
    name: 'Mine Field',
    emoji: '💣',
    category: 'defense',
    buildCost: [
      { resource: RESOURCE_AMMUNITION, amount: 30 },
      { resource: RESOURCE_METALS, amount: 20 },
    ],
    buildTimeTicks: 30,
    citizenSlots: 0,
    description: 'Pre-placed defense. Intercepts incoming colony ships passing through tile.',
  },
  {
    id: BLDG_COUNTER_MISSILE,
    name: 'Counter-Missile Pad',
    emoji: '🛡️',
    category: 'defense',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 60 },
      { resource: RESOURCE_FUEL, amount: 30 },
      { resource: RESOURCE_AMMUNITION, amount: 40 },
    ],
    buildTimeTicks: 100,
    citizenSlots: 6,
    description: 'Launches counter-colony-ships to intercept incoming attacks mid-flight.',
  },
  {
    id: BLDG_MINING_OUTPOST,
    name: 'Mining Outpost',
    emoji: '⛏️',
    category: 'extraction',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 80 },
      { resource: RESOURCE_FUEL, amount: 40 },
      { resource: RESOURCE_COMPONENTS, amount: 30 },
    ],
    buildTimeTicks: 120,
    citizenSlots: 6,
    description: 'Off-planet mining via auto-shuttle. UMS UnityBeacon shuttle-cycle carryover.',
  },
  {
    id: BLDG_GOD_CONTROL,
    name: 'God Control',
    emoji: '🕹️',
    category: 'utility',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 200 },
      { resource: RESOURCE_ELECTRONICS, amount: 150 },
      { resource: RESOURCE_COMPONENTS, amount: 120 },
      { resource: RESOURCE_ANTIMATTER, amount: 30 },
    ],
    buildTimeTicks: 400,
    citizenSlots: 12,
    description:
      'Endgame override infrastructure. Select an in-flight colony ship and right-click any planet to redirect it mid-arc. Requires TECH_GOD_CONTROL researched.',
  },
]

export function getBuildingDef(id: BuildingDefId): BuildingDef {
  const b = BUILDINGS.find((x) => x.id === id)
  if (!b) throw new Error(`Unknown building id: ${id}`)
  return b
}

export function buildingsByCategory(category: BuildingCategory): ReadonlyArray<BuildingDef> {
  return BUILDINGS.filter((b) => b.category === category)
}
