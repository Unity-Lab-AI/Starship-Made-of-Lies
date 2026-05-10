import { type BuildingDefId } from '../types/index'
import {
  BLDG_FACTORY,
  BLDG_LAB,
  BLDG_LAUNCH_PAD,
  BLDG_LUMBER_CAMP,
  BLDG_MINE,
  BLDG_POWER_PLANT,
  BLDG_QUARRY,
  BLDG_REFINERY,
  BLDG_TV_STATION,
  BLDG_REEDUCATION,
  BLDG_CORP_PROMOTIONS,
  BLDG_COUNTER_MISSILE,
  BLDG_UNIVERSITY,
  BLDG_FOUNDRY,
  BLDG_MINING_OUTPOST,
} from './building'

declare const __techBrand: unique symbol
type Brand<T, B> = T & { readonly [__techBrand]: B }

export type TechId = Brand<string, 'TechId'>
export const techId = (s: string): TechId => s as TechId

export type TechVisibility = 'mainstream' | 'suppressed' | 'forbidden'
export type TechTier = 0 | 1 | 2 | 3 | 4

export type TechCategory =
  | 'industrial'
  | 'information'
  | 'spacefaring'
  | 'advanced'
  | 'farFuture'
  | 'control'
  | 'forbidden'

export interface ConquestGate {
  readonly minDefeatedCivs?: number
  readonly minCapturedPlanets?: number
  readonly requiredAncientTech?: number
}

export interface TechEffects {
  readonly unlockBuildings?: ReadonlyArray<BuildingDefId>
  readonly unlockColonyShipVariants?: ReadonlyArray<string>
  readonly unlockBiomes?: ReadonlyArray<string>
  readonly researchSpeedMultiplier?: number
  readonly citizenPromotionRateMultiplier?: number
  readonly colonyShipPayloadTier?: 1 | 2 | 3 | 4
  readonly volunteerPoolMultiplier?: number
  readonly autoBuildEnabled?: boolean
  readonly buildingProductionMultiplier?: number
  readonly propagandaPowerMultiplier?: number
  readonly disablesEnemyProduction?: boolean
  readonly winsGame?: boolean
}

export interface TechNode {
  readonly id: TechId
  readonly name: string
  readonly emoji: string
  readonly tier: TechTier
  readonly visibility: TechVisibility
  readonly category: TechCategory
  readonly description: string
  readonly prerequisites: ReadonlyArray<TechId>
  readonly costPoints: number
  readonly conquestGate?: ConquestGate
  readonly requiresApexCheck?: boolean
  readonly effects: TechEffects
}

export const TECH_INDUSTRIAL_LOGISTICS = techId('industrialLogistics')
export const TECH_COMBUSTION_ENGINES = techId('combustionEngines')
export const TECH_MASS_PRODUCTION = techId('massProduction')
export const TECH_MASS_COMMUNICATION = techId('massCommunication')
export const TECH_ELECTRIC_POWER = techId('electricPower')
export const TECH_WARNING_SYSTEM = techId('warningSystem')

export const TECH_COMPUTING = techId('computing')
export const TECH_TELECOMMUNICATIONS = techId('telecommunications')
export const TECH_AEROSPACE = techId('aerospace')
export const TECH_NUCLEAR_FISSION = techId('nuclearFission')
export const TECH_CONSUMER_ELECTRONICS = techId('consumerElectronics')

export const TECH_ORBITAL_MECHANICS = techId('orbitalMechanics')
export const TECH_FUSION_POWER = techId('fusionPower')
export const TECH_GENETIC_ENGINEERING = techId('geneticEngineering')
export const TECH_LASER_OPTICS = techId('laserOptics')
export const TECH_AI_COGNITION = techId('aiCognition')
export const TECH_CYBERNETICS = techId('cybernetics')

export const TECH_BEHAVIORAL_COMPLIANCE = techId('behavioralCompliance')
export const TECH_MASS_SURVEILLANCE_NETWORKS = techId('massSurveillanceNetworks')
export const TECH_MEMETIC_ENGINEERING = techId('memeticEngineering')

export const TECH_QUANTUM_COMPUTING = techId('quantumComputing')
export const TECH_ANTIMATTER = techId('antimatter')
export const TECH_NANOTECH = techId('nanotech')
export const TECH_LIFE_EXTENSION = techId('lifeExtension')

export const TECH_ANCIENT_TECH_REVERSE = techId('ancientTechReverseEngineering')
export const TECH_MIND_CONTROL_BROADCAST = techId('mindControlBroadcast')
export const TECH_MIND_WIPE = techId('civilizationScaleMindWipe')
export const TECH_REALITY_EDITING = techId('realityEditing')

export const TECH_SELF_REPLICATING_INDUSTRY = techId('selfReplicatingIndustry')
export const TECH_DYSON_SWARM = techId('dysonSwarm')
export const TECH_SINGULARITY = techId('singularity')

export const TECH_NODES: ReadonlyArray<TechNode> = [
  {
    id: TECH_INDUSTRIAL_LOGISTICS,
    name: 'Industrial Logistics',
    emoji: '🏗️',
    tier: 0,
    visibility: 'mainstream',
    category: 'industrial',
    description: 'Mass-scale supply chains. Unlocks heavy extraction + refining baseline.',
    prerequisites: [],
    costPoints: 30,
    effects: {
      unlockBuildings: [BLDG_LUMBER_CAMP, BLDG_QUARRY, BLDG_MINE, BLDG_REFINERY],
    },
  },
  {
    id: TECH_COMBUSTION_ENGINES,
    name: 'Combustion Engines',
    emoji: '🛢️',
    tier: 0,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Internal combustion + heavy machinery. Unlocks fuel-burning power infrastructure.',
    prerequisites: [],
    costPoints: 30,
    effects: {
      unlockBuildings: [BLDG_POWER_PLANT],
    },
  },
  {
    id: TECH_MASS_PRODUCTION,
    name: 'Mass Production',
    emoji: '🏭',
    tier: 0,
    visibility: 'mainstream',
    category: 'industrial',
    description: 'Assembly-line manufacturing. Components + intermediate-goods scale.',
    prerequisites: [],
    costPoints: 30,
    effects: {
      unlockBuildings: [BLDG_FACTORY, BLDG_FOUNDRY],
    },
  },
  {
    id: TECH_MASS_COMMUNICATION,
    name: 'Mass Communication',
    emoji: '📺',
    tier: 0,
    visibility: 'mainstream',
    category: 'industrial',
    description: 'Radio + television + print media. Propaganda baseline infrastructure.',
    prerequisites: [],
    costPoints: 30,
    effects: {
      unlockBuildings: [BLDG_TV_STATION],
      propagandaPowerMultiplier: 1.2,
    },
  },
  {
    id: TECH_ELECTRIC_POWER,
    name: 'Electric Power',
    emoji: '⚡',
    tier: 0,
    visibility: 'mainstream',
    category: 'industrial',
    description: 'Grid-scale electrification. Boosts industrial throughput.',
    prerequisites: [],
    costPoints: 30,
    effects: {
      buildingProductionMultiplier: 1.15,
    },
  },
  {
    id: TECH_WARNING_SYSTEM,
    name: 'Warning System',
    emoji: '📡',
    tier: 0,
    visibility: 'mainstream',
    category: 'information',
    description:
      'Early-detection grid for incoming colony ships. Adds 30 ticks of early warning + boosts detection range. Researchable before/with Aerospace.',
    prerequisites: [TECH_MASS_COMMUNICATION],
    costPoints: 35,
    effects: {},
  },
  {
    id: TECH_COMPUTING,
    name: 'Computing',
    emoji: '💻',
    tier: 1,
    visibility: 'mainstream',
    category: 'information',
    description: 'Digital logic + early computation. Unlocks dedicated research labs.',
    prerequisites: [TECH_MASS_PRODUCTION, TECH_ELECTRIC_POWER],
    costPoints: 60,
    effects: {
      unlockBuildings: [BLDG_LAB],
      researchSpeedMultiplier: 1.2,
    },
  },
  {
    id: TECH_TELECOMMUNICATIONS,
    name: 'Telecommunications',
    emoji: '📡',
    tier: 1,
    visibility: 'mainstream',
    category: 'information',
    description: 'Networked broadcast + targeted messaging. Indoctrination at scale.',
    prerequisites: [TECH_MASS_COMMUNICATION, TECH_COMPUTING],
    costPoints: 60,
    effects: {
      unlockBuildings: [BLDG_REEDUCATION],
      propagandaPowerMultiplier: 1.5,
    },
  },
  {
    id: TECH_AEROSPACE,
    name: 'Aerospace',
    emoji: '✈️',
    tier: 1,
    visibility: 'mainstream',
    category: 'spacefaring',
    description: 'High-altitude flight + early orbital launch. Unlocks Tier 1 colony ships.',
    prerequisites: [TECH_COMBUSTION_ENGINES, TECH_COMPUTING],
    costPoints: 60,
    effects: {
      unlockBuildings: [BLDG_LAUNCH_PAD],
      unlockColonyShipVariants: ['Scout', 'Surveyor', 'Probe'],
      colonyShipPayloadTier: 1,
    },
  },
  {
    id: TECH_NUCLEAR_FISSION,
    name: 'Nuclear Fission',
    emoji: '☢️',
    tier: 1,
    visibility: 'mainstream',
    category: 'information',
    description: 'Controlled fission reactors. Survival-grade power for hostile biomes.',
    prerequisites: [TECH_MASS_PRODUCTION, TECH_ELECTRIC_POWER],
    costPoints: 60,
    effects: {
      unlockBiomes: ['arctic', 'desert'],
    },
  },
  {
    id: TECH_CONSUMER_ELECTRONICS,
    name: 'Consumer Electronics',
    emoji: '📱',
    tier: 1,
    visibility: 'mainstream',
    category: 'information',
    description:
      'Personal computing + integrated circuits. Unlocks higher education infrastructure.',
    prerequisites: [TECH_COMPUTING],
    costPoints: 60,
    effects: {
      unlockBuildings: [BLDG_UNIVERSITY],
      researchSpeedMultiplier: 1.15,
    },
  },
  {
    id: TECH_ORBITAL_MECHANICS,
    name: 'Orbital Mechanics',
    emoji: '🛰️',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description: 'Trans-orbit trajectory + station-keeping. Unlocks Tier 2 colony ship variants.',
    prerequisites: [TECH_AEROSPACE],
    costPoints: 100,
    effects: {
      unlockColonyShipVariants: ['Standard', 'LaserBeacon', 'Decoy', 'Boarding'],
      colonyShipPayloadTier: 2,
      unlockBuildings: [BLDG_MINING_OUTPOST],
    },
  },
  {
    id: TECH_FUSION_POWER,
    name: 'Fusion Power',
    emoji: '☀️',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description: 'Sustained controlled fusion. Opens hot-biome + gas-giant colonization.',
    prerequisites: [TECH_NUCLEAR_FISSION, TECH_COMPUTING],
    costPoints: 100,
    effects: {
      unlockBiomes: ['volcanic', 'gasGiantMoon'],
      buildingProductionMultiplier: 1.25,
    },
  },
  {
    id: TECH_GENETIC_ENGINEERING,
    name: 'Genetic Engineering',
    emoji: '🧬',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description: 'Engineered citizenry. Accelerated tier promotion.',
    prerequisites: [TECH_CONSUMER_ELECTRONICS],
    costPoints: 100,
    effects: {
      citizenPromotionRateMultiplier: 1.5,
    },
  },
  {
    id: TECH_LASER_OPTICS,
    name: 'Laser Optics',
    emoji: '🔦',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description: 'Coherent-light targeting + intercept. Unlocks counter-colony-ship defense.',
    prerequisites: [TECH_COMPUTING, TECH_CONSUMER_ELECTRONICS],
    costPoints: 100,
    effects: {
      unlockBuildings: [BLDG_COUNTER_MISSILE],
      unlockColonyShipVariants: ['Saboteur'],
    },
  },
  {
    id: TECH_AI_COGNITION,
    name: 'AI Cognition',
    emoji: '🤖',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description: 'Autonomous decision systems. Speeds research + corporate-style citizen tier-up.',
    prerequisites: [TECH_COMPUTING, TECH_CONSUMER_ELECTRONICS],
    costPoints: 100,
    effects: {
      unlockBuildings: [BLDG_CORP_PROMOTIONS],
      researchSpeedMultiplier: 1.3,
      citizenPromotionRateMultiplier: 1.2,
    },
  },
  {
    id: TECH_CYBERNETICS,
    name: 'Cybernetics',
    emoji: '🦾',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description: 'Bio-mechanical augmentation. Citizens survive disease + hostile bioregions.',
    prerequisites: [TECH_CONSUMER_ELECTRONICS, TECH_COMPUTING],
    costPoints: 100,
    effects: {
      unlockBiomes: ['jungle', 'swamp', 'ocean'],
    },
  },
  {
    id: TECH_BEHAVIORAL_COMPLIANCE,
    name: 'Behavioral Compliance',
    emoji: '🧠',
    tier: 2,
    visibility: 'suppressed',
    category: 'control',
    description:
      'Conditioning + compliance drugs. Skeptics flip loyal at 2× rate. Citizen promotion sped.',
    prerequisites: [TECH_GENETIC_ENGINEERING, TECH_TELECOMMUNICATIONS],
    costPoints: 150,
    conquestGate: { minCapturedPlanets: 1 },
    effects: {
      propagandaPowerMultiplier: 2.0,
      citizenPromotionRateMultiplier: 1.4,
    },
  },
  {
    id: TECH_MASS_SURVEILLANCE_NETWORKS,
    name: 'Mass Surveillance Networks',
    emoji: '👁️',
    tier: 2,
    visibility: 'suppressed',
    category: 'control',
    description:
      'Pervasive monitoring + predictive flagging. Asteroid colonization + heavy propaganda boost.',
    prerequisites: [TECH_TELECOMMUNICATIONS, TECH_AI_COGNITION],
    costPoints: 150,
    conquestGate: { minDefeatedCivs: 1 },
    effects: {
      unlockBiomes: ['asteroid'],
      propagandaPowerMultiplier: 2.5,
    },
  },
  {
    id: TECH_MEMETIC_ENGINEERING,
    name: 'Memetic Engineering',
    emoji: '🎭',
    tier: 3,
    visibility: 'suppressed',
    category: 'control',
    description:
      'Designed viral ideologies. Auto-promotes Workers + 50% larger volunteer pool for one-way trips.',
    prerequisites: [TECH_AI_COGNITION, TECH_BEHAVIORAL_COMPLIANCE],
    costPoints: 150,
    conquestGate: { minDefeatedCivs: 2 },
    effects: {
      citizenPromotionRateMultiplier: 1.8,
      volunteerPoolMultiplier: 1.5,
    },
  },
  {
    id: TECH_QUANTUM_COMPUTING,
    name: 'Quantum Computing',
    emoji: '⚛️',
    tier: 3,
    visibility: 'mainstream',
    category: 'advanced',
    description: 'Superposition-based computation. Massive research-speed acceleration.',
    prerequisites: [TECH_AI_COGNITION, TECH_FUSION_POWER],
    costPoints: 200,
    effects: {
      researchSpeedMultiplier: 1.8,
    },
  },
  {
    id: TECH_ANTIMATTER,
    name: 'Antimatter',
    emoji: '💥',
    tier: 3,
    visibility: 'mainstream',
    category: 'advanced',
    description:
      'Antimatter containment + weaponization. Unlocks Tier 3 colony ships + lava biome.',
    prerequisites: [TECH_FUSION_POWER, TECH_ORBITAL_MECHANICS],
    costPoints: 200,
    effects: {
      unlockBiomes: ['lava'],
      unlockColonyShipVariants: ['Explosive', 'Heavy', 'CounterColony'],
      colonyShipPayloadTier: 3,
    },
  },
  {
    id: TECH_NANOTECH,
    name: 'Nanotech',
    emoji: '🔬',
    tier: 3,
    visibility: 'mainstream',
    category: 'advanced',
    description:
      'Atomic-scale fabrication. Crystalline-biome colonization + production multiplier.',
    prerequisites: [TECH_GENETIC_ENGINEERING, TECH_QUANTUM_COMPUTING],
    costPoints: 200,
    effects: {
      unlockBiomes: ['crystalline'],
      buildingProductionMultiplier: 1.5,
    },
  },
  {
    id: TECH_LIFE_EXTENSION,
    name: 'Life Extension',
    emoji: '⏳',
    tier: 3,
    visibility: 'mainstream',
    category: 'advanced',
    description: 'Cellular-aging reversal. Citizens promote 2× faster across all tiers.',
    prerequisites: [TECH_GENETIC_ENGINEERING, TECH_CONSUMER_ELECTRONICS],
    costPoints: 200,
    effects: {
      citizenPromotionRateMultiplier: 2.0,
    },
  },
  {
    id: TECH_ANCIENT_TECH_REVERSE,
    name: 'Ancient Tech Reverse-Engineering',
    emoji: '🏛️',
    tier: 3,
    visibility: 'forbidden',
    category: 'forbidden',
    description:
      'Decoding pre-extinction megastructures. Ringworld colonization + Tier 4 ship variants.',
    prerequisites: [TECH_ANTIMATTER, TECH_NANOTECH],
    costPoints: 300,
    conquestGate: { minCapturedPlanets: 1, requiredAncientTech: 5 },
    effects: {
      unlockBiomes: ['ringworld'],
      unlockColonyShipVariants: ['PilgrimVolunteer', 'MassEvacuation', 'OrbitalWeaponPlatform'],
      colonyShipPayloadTier: 4,
    },
  },
  {
    id: TECH_MIND_CONTROL_BROADCAST,
    name: 'Mind Control Broadcast',
    emoji: '📻',
    tier: 3,
    visibility: 'forbidden',
    category: 'forbidden',
    description:
      'Civilization-wide compliance signal. Citizens auto-promote to Pinnacle. Volunteer pool effectively unlimited.',
    prerequisites: [TECH_MASS_SURVEILLANCE_NETWORKS, TECH_AI_COGNITION],
    costPoints: 300,
    conquestGate: { minDefeatedCivs: 2 },
    effects: {
      propagandaPowerMultiplier: 5.0,
      citizenPromotionRateMultiplier: 4.0,
      volunteerPoolMultiplier: 10.0,
    },
  },
  {
    id: TECH_MIND_WIPE,
    name: 'Civilization-Scale Mind Wipe',
    emoji: '💀',
    tier: 4,
    visibility: 'forbidden',
    category: 'forbidden',
    description: 'Targeted broadcast that disables enemy productive output. Conquest accelerator.',
    prerequisites: [TECH_MIND_CONTROL_BROADCAST],
    costPoints: 300,
    conquestGate: { minDefeatedCivs: 5 },
    effects: {
      disablesEnemyProduction: true,
    },
  },
  {
    id: TECH_REALITY_EDITING,
    name: 'Reality Editing',
    emoji: '🌌',
    tier: 4,
    visibility: 'forbidden',
    category: 'forbidden',
    description:
      'Direct edit of physical constants. Final Forbidden apex — wins the match if researched.',
    prerequisites: [TECH_ANCIENT_TECH_REVERSE, TECH_MIND_CONTROL_BROADCAST],
    costPoints: 500,
    requiresApexCheck: true,
    effects: {
      winsGame: true,
    },
  },
  {
    id: TECH_SELF_REPLICATING_INDUSTRY,
    name: 'Self-Replicating Industry',
    emoji: '🛠️',
    tier: 4,
    visibility: 'mainstream',
    category: 'farFuture',
    description: 'Auto-fabricating buildings. Eliminates manual construction queue overhead.',
    prerequisites: [TECH_NANOTECH, TECH_AI_COGNITION],
    costPoints: 400,
    effects: {
      autoBuildEnabled: true,
      buildingProductionMultiplier: 2.0,
    },
  },
  {
    id: TECH_DYSON_SWARM,
    name: 'Dyson Swarm',
    emoji: '☀️',
    tier: 4,
    visibility: 'mainstream',
    category: 'farFuture',
    description: 'Stellar-scale energy harvest. Effectively unlimited power for endgame industry.',
    prerequisites: [TECH_ANTIMATTER, TECH_ORBITAL_MECHANICS],
    costPoints: 400,
    effects: {
      buildingProductionMultiplier: 3.0,
      researchSpeedMultiplier: 1.5,
    },
  },
  {
    id: TECH_SINGULARITY,
    name: 'Singularity',
    emoji: '🌠',
    tier: 4,
    visibility: 'mainstream',
    category: 'farFuture',
    description:
      'Recursive self-improving AI. Mainstream apex — wins the match if researched. Requires ≥10 controlled planets.',
    prerequisites: [TECH_AI_COGNITION, TECH_QUANTUM_COMPUTING, TECH_LIFE_EXTENSION],
    costPoints: 500,
    requiresApexCheck: true,
    effects: {
      winsGame: true,
    },
  },
]

const TECH_NODE_INDEX: ReadonlyMap<TechId, TechNode> = new Map(
  TECH_NODES.map((node) => [node.id, node]),
)

export function getTechNode(id: TechId): TechNode {
  const node = TECH_NODE_INDEX.get(id)
  if (!node) throw new Error(`Unknown tech id: ${id}`)
  return node
}

export function techsByVisibility(v: TechVisibility): ReadonlyArray<TechNode> {
  return TECH_NODES.filter((n) => n.visibility === v)
}

export function techsByTier(tier: TechTier): ReadonlyArray<TechNode> {
  return TECH_NODES.filter((n) => n.tier === tier)
}

export function techsByCategory(c: TechCategory): ReadonlyArray<TechNode> {
  return TECH_NODES.filter((n) => n.category === c)
}

export interface DAGValidationResult {
  readonly valid: boolean
  readonly errors: ReadonlyArray<string>
}

export function validateTechTreeDAG(
  nodes: ReadonlyArray<TechNode> = TECH_NODES,
): DAGValidationResult {
  const errors: string[] = []
  const ids = new Set(nodes.map((n) => n.id))

  for (const node of nodes) {
    for (const prereq of node.prerequisites) {
      if (!ids.has(prereq)) {
        errors.push(`Tech ${String(node.id)} prerequisite ${String(prereq)} does not exist`)
      }
    }
  }

  const WHITE = 0
  const GRAY = 1
  const BLACK = 2
  const color = new Map<TechId, number>()
  for (const n of nodes) color.set(n.id, WHITE)
  const indexById = new Map<TechId, TechNode>(nodes.map((n) => [n.id, n]))

  const visit = (id: TechId, path: TechId[]): boolean => {
    const c = color.get(id) ?? WHITE
    if (c === GRAY) {
      errors.push(`Cycle detected in tech tree: ${[...path, id].map((p) => String(p)).join(' → ')}`)
      return false
    }
    if (c === BLACK) return true
    color.set(id, GRAY)
    const node = indexById.get(id)
    if (node) {
      for (const prereq of node.prerequisites) {
        if (!visit(prereq, [...path, id])) return false
      }
    }
    color.set(id, BLACK)
    return true
  }

  for (const n of nodes) visit(n.id, [])

  return { valid: errors.length === 0, errors }
}

export function getDirectUnlocks(
  researched: ReadonlySet<TechId>,
  nodes: ReadonlyArray<TechNode> = TECH_NODES,
): ReadonlyArray<TechNode> {
  return nodes.filter((n) => {
    if (researched.has(n.id)) return false
    for (const prereq of n.prerequisites) if (!researched.has(prereq)) return false
    return true
  })
}

export function aggregateEffects(researched: ReadonlySet<TechId>): Required<
  Pick<
    TechEffects,
    | 'researchSpeedMultiplier'
    | 'citizenPromotionRateMultiplier'
    | 'buildingProductionMultiplier'
    | 'propagandaPowerMultiplier'
    | 'volunteerPoolMultiplier'
  >
> & {
  unlockedBuildings: ReadonlySet<BuildingDefId>
  unlockedColonyShipVariants: ReadonlySet<string>
  unlockedBiomes: ReadonlySet<string>
  maxPayloadTier: 0 | 1 | 2 | 3 | 4
  autoBuildEnabled: boolean
  disablesEnemyProduction: boolean
  hasWinningTech: boolean
} {
  let researchSpeedMultiplier = 1
  let citizenPromotionRateMultiplier = 1
  let buildingProductionMultiplier = 1
  let propagandaPowerMultiplier = 1
  let volunteerPoolMultiplier = 1
  const unlockedBuildings = new Set<BuildingDefId>()
  const unlockedColonyShipVariants = new Set<string>()
  const unlockedBiomes = new Set<string>()
  let maxPayloadTier: 0 | 1 | 2 | 3 | 4 = 0
  let autoBuildEnabled = false
  let disablesEnemyProduction = false
  let hasWinningTech = false

  for (const id of researched) {
    const node = TECH_NODE_INDEX.get(id)
    if (!node) continue
    const e = node.effects
    if (e.researchSpeedMultiplier) researchSpeedMultiplier *= e.researchSpeedMultiplier
    if (e.citizenPromotionRateMultiplier)
      citizenPromotionRateMultiplier *= e.citizenPromotionRateMultiplier
    if (e.buildingProductionMultiplier)
      buildingProductionMultiplier *= e.buildingProductionMultiplier
    if (e.propagandaPowerMultiplier) propagandaPowerMultiplier *= e.propagandaPowerMultiplier
    if (e.volunteerPoolMultiplier) volunteerPoolMultiplier *= e.volunteerPoolMultiplier
    if (e.unlockBuildings) for (const b of e.unlockBuildings) unlockedBuildings.add(b)
    if (e.unlockColonyShipVariants)
      for (const v of e.unlockColonyShipVariants) unlockedColonyShipVariants.add(v)
    if (e.unlockBiomes) for (const b of e.unlockBiomes) unlockedBiomes.add(b)
    if (e.colonyShipPayloadTier && e.colonyShipPayloadTier > maxPayloadTier)
      maxPayloadTier = e.colonyShipPayloadTier
    if (e.autoBuildEnabled) autoBuildEnabled = true
    if (e.disablesEnemyProduction) disablesEnemyProduction = true
    if (e.winsGame) hasWinningTech = true
  }

  return {
    researchSpeedMultiplier,
    citizenPromotionRateMultiplier,
    buildingProductionMultiplier,
    propagandaPowerMultiplier,
    volunteerPoolMultiplier,
    unlockedBuildings,
    unlockedColonyShipVariants,
    unlockedBiomes,
    maxPayloadTier,
    autoBuildEnabled,
    disablesEnemyProduction,
    hasWinningTech,
  }
}
