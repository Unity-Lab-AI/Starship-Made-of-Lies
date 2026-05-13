import { type BuildingDefId } from '../types/index'
import {
  BLDG_APARTMENT,
  BLDG_BATTERY_BANK,
  BLDG_CATHEDRAL,
  BLDG_FACTORY,
  BLDG_LAUNCH_PAD,
  BLDG_LUMBER_CAMP,
  BLDG_MINE,
  BLDG_POWER_PLANT,
  BLDG_QUARRY,
  BLDG_REACTOR_ANTIMATTER,
  BLDG_REACTOR_FISSION,
  BLDG_REACTOR_FUSION,
  BLDG_REFINERY,
  BLDG_TV_STATION,
  BLDG_REEDUCATION,
  BLDG_CORP_PROMOTIONS,
  BLDG_COUNTER_MISSILE,
  BLDG_UNIVERSITY,
  BLDG_FOUNDRY,
  BLDG_GOD_CONTROL,
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
  // PHASE 17.L.D.19 (2026-05-13) — engineering-progression gate. Listed building defs must
  // have been built at least once by this civ (empire.everBuiltBuildings) before the tech
  // can be researched. Per user verbatim *"some things need to be gated behind actually
  // building the prerequisite building like the launch pad and command center before
  // getting in to the differnt tech for the differnt rockets ships"*. Demolition does NOT
  // clear the "ever built" flag — once you've flown the prototype, the knowledge sticks.
  readonly requiredBuildings?: ReadonlyArray<BuildingDefId>
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

// PHASE 16.25 — tech tree audit + expansion. Six new nodes fill progression gaps surfaced
// by the audit: industrial tier 1+2 (HEAVY_INDUSTRY, AUTOMATED_LOGISTICS), spacefaring tier 2
// (ROBOTICS), information-tier-2-bridge-to-control (CIVIL_DEFENSE), control tier 3
// (VOLUNTEER_INDOCTRINATION), forbidden tier 3 (BLACK_OPS_RESEARCH). Per user verbatim:
// "i dont thing tech tree is fully built out right".
export const TECH_HEAVY_INDUSTRY = techId('heavyIndustry')
export const TECH_AUTOMATED_LOGISTICS = techId('automatedLogistics')
export const TECH_ROBOTICS = techId('robotics')
export const TECH_CIVIL_DEFENSE = techId('civilDefense')
export const TECH_VOLUNTEER_INDOCTRINATION = techId('volunteerIndoctrination')
export const TECH_BLACK_OPS_RESEARCH = techId('blackOpsResearch')

// PHASE 16.31 — God Control. Forbidden tier-4 tech that gates BLDG_GOD_CONTROL building +
// the right-click flight-redirect UX. Per user verbatim *"shouldf be se;lect and right click
// to send your rocket places too as an option if 'god control' is researched and installed"*.
export const TECH_GOD_CONTROL = techId('godControl')

// PHASE 17.L.Q16 — Tech tree expansion 40 → 60+ per the PHASE 0 AskUserQuestion Q16 LOCKED
// answer. Twenty new nodes flesh out every tier across mainstream + suppressed + forbidden
// branches. Per user spec: "Gate ship pieces + advanced resources behind techs." These nodes
// stack natural multipliers (production / propaganda / research / promotion / volunteer-pool)
// onto the existing TechEffects schema — no new fields required.
//
// Tier 0 — early-game industrial / information foundations
export const TECH_BASIC_AGRICULTURE = techId('basicAgriculture')
export const TECH_METALLURGY = techId('metallurgy')
export const TECH_FIRE_CONTROL = techId('fireControl')
// Tier 1 — bridges between tier 0 and tier 2
export const TECH_PETROCHEMISTRY = techId('petrochemistry')
export const TECH_RADIO_BROADCAST = techId('radioBroadcast')
export const TECH_ASSEMBLY_LINE = techId('assemblyLine')
// Tier 2 — mid-game branches feeding tier 3 strategic + forbidden
export const TECH_ADVANCED_METALLURGY = techId('advancedMetallurgy')
export const TECH_PRECISION_OPTICS = techId('precisionOptics')
export const TECH_PLASMA_PHYSICS = techId('plasmaPhysics')
export const TECH_BIOENGINEERING = techId('bioengineering')
// Tier 3 — late-game advanced + suppressed branches feeding tier 4 forbidden
export const TECH_FUSION_PROPULSION = techId('fusionPropulsion')
export const TECH_PLASMA_WEAPONS = techId('plasmaWeapons')
export const TECH_NEURAL_INTERFACE = techId('neuralInterface')
export const TECH_COLD_FUSION = techId('coldFusion')
export const TECH_HOLOGRAPHIC_PROPAGANDA = techId('holographicPropaganda')
// Tier 4 — apex farFuture + forbidden additions
export const TECH_INTERSTELLAR_GATES = techId('interstellarGates')
export const TECH_RECURSIVE_AUTOMATION = techId('recursiveAutomation')
export const TECH_PSYCHIC_BROADCAST = techId('psychicBroadcast')
export const TECH_BIOWEAPON_PROTOCOLS = techId('bioweaponProtocols')
export const TECH_TIME_DILATION = techId('timeDilation')
// Two more nodes to land safely over the "60+" bar from Q16 — food-preservation gates a
// mid-tier industrial bridge, gravity-manipulation gives a far-future spacefaring path.
export const TECH_FOOD_PRESERVATION = techId('foodPreservation')
export const TECH_GRAVITY_MANIPULATION = techId('gravityManipulation')

// PHASE 17.L.A.17 — Self-Destruct Systems. Tier 1 mainstream industrial tech that gates the
// mid-flight ABORT (self-destruct) action. Per user verbatim 2026-05-11 (LAW #0): "i meant
// its a tach that needs to be researched andd installed on the ship before u can self destruct
// ships other wise impascting and crashing is only end to them ie plant hit, fall into star
// ect ect continues until crew dies then power runs out fuel is jsut a waiting time bomb and
// or anything else installed explosives ammunitions ectect reactor even is explosive".
//
// Without this tech researched, the player's flights can ONLY end via natural causes (planet
// impact / crash / crew starvation / power-out / fuel-out / reactor explosion at end-of-life).
// With this tech + a self-destruct-capable ship variant (suicide ships / counter-interceptors /
// explosive payloads — anything with detonation intent baked in), the player can manually
// trigger end-of-flight at any time.
export const TECH_SELF_DESTRUCT_SYSTEMS = techId('selfDestructSystems')

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
    description:
      'Radio + television + print media + organized congregations. Propaganda baseline infrastructure. Unlocks TV Station and theme-flavored Cathedral.',
    prerequisites: [],
    costPoints: 30,
    effects: {
      // PHASE 17.L.D.10 (HOTFIX 2026-05-13) — BLDG_CATHEDRAL added per user verbatim *"check
      // for other shit like that not gated correctly"*. Was previously absent from every tech's
      // unlockBuildings AND from TECH_GATED_BUILDINGS, so Cathedral was default-buildable from
      // match start despite being theme-flavored late-game indoctrination infrastructure. Now
      // gated behind Mass Communication (same tier-0 propaganda foundation as TV Station).
      unlockBuildings: [BLDG_TV_STATION, BLDG_CATHEDRAL],
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
    description: 'Grid-scale electrification. Boosts industrial throughput. Unlocks Battery Bank.',
    prerequisites: [],
    costPoints: 30,
    effects: {
      buildingProductionMultiplier: 1.15,
      // PHASE 17.J.7 — Battery Bank gated on Electric Power. Pure stockpile capacity for the
      // planet energy panel; per-bank capacity = BATTERY_BANK_CAPACITY.
      unlockBuildings: [BLDG_BATTERY_BANK],
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
    // PHASE 17.L.D.10 (HOTFIX 2026-05-13) — Lab REMOVED from this tech's unlockBuildings per
    // user verbatim *"we need a sciecence research point generating building to start with so
    // we can fucking do somthing as far as un l;ocking tech"*. Lab is now baseline-unlocked
    // (see placement.ts TECH_GATED_BUILDINGS). Computing keeps its researchSpeedMultiplier so
    // it remains valuable to research; it's just no longer the gate-keeper for the building.
    description:
      'Digital logic + early computation. Accelerates research throughput across every Lab and University on the empire.',
    prerequisites: [TECH_MASS_PRODUCTION, TECH_ELECTRIC_POWER],
    costPoints: 60,
    effects: {
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
      // PHASE 16.25: normalized to def.id camelCase tokens so isColonyShipUnlocked's
      // `unlockedVariantNames.has(def.id as unknown as string)` check matches reliably.
      unlockColonyShipVariants: ['scout', 'surveyor', 'probe'],
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
    description:
      'Controlled fission reactors. Survival-grade power for hostile biomes. Unlocks the planet-level Fission Reactor.',
    prerequisites: [TECH_MASS_PRODUCTION, TECH_ELECTRIC_POWER],
    costPoints: 60,
    effects: {
      unlockBiomes: ['arctic', 'desert'],
      // PHASE 17.J.8 — Fission Reactor as planet building. Consumes RESOURCE_RARE_METALS,
      // produces 8× a Power Plant's fuel throughput.
      unlockBuildings: [BLDG_REACTOR_FISSION],
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
    description:
      'Trans-orbit trajectory + station-keeping. Unlocks Tier 2 colony ship variants. Requires a Launch Pad built first — you have to fly the basic rocket before the next-gen one.',
    prerequisites: [TECH_AEROSPACE],
    requiredBuildings: [BLDG_LAUNCH_PAD],
    costPoints: 100,
    effects: {
      // PHASE 16.25: def.id tokens (was capitalized name fragments that failed multi-word
      // matches like 'LaserBeacon' vs def.name 'Laser-Targeting Beacon'). Also adds the
      // 4 crossPeaceful variants (mining/refugee/embassy/resupply) which were never unlocked
      // by any tech — bug fix per audit.
      unlockColonyShipVariants: [
        'standard',
        'laserBeacon',
        'decoy',
        'boarding',
        'mining',
        'refugee',
        'embassy',
        'resupply',
      ],
      colonyShipPayloadTier: 2,
      // PHASE 17.B + super-review fix: BLDG_MINING_OUTPOST removed from this tech's unlocks.
      // Outpost is foundational + available from match start per placement.ts TECH_GATED_BUILDINGS.
      // Orbital Mechanics still unlocks the spacefaring colony ship variants above.
      unlockBuildings: [],
    },
  },
  {
    id: TECH_FUSION_POWER,
    name: 'Fusion Power',
    emoji: '☀️',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description:
      'Sustained controlled fusion. Opens hot-biome + gas-giant colonization. Unlocks the Fusion Reactor.',
    prerequisites: [TECH_NUCLEAR_FISSION, TECH_COMPUTING],
    costPoints: 100,
    effects: {
      unlockBiomes: ['volcanic', 'gasGiantMoon'],
      buildingProductionMultiplier: 1.25,
      // PHASE 17.J.8 — Fusion Reactor as planet building. Consumes RESOURCE_FUSION_FUEL,
      // produces 16× a Power Plant's fuel throughput.
      unlockBuildings: [BLDG_REACTOR_FUSION],
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
      // PHASE 16.25: Saboteur unlock moved to TECH_ANTIMATTER. LASER_OPTICS is tier 2 +
      // doesn't bump colonyShipPayloadTier, so Saboteur (payloadTierRequired=3) was always
      // dead-listed here. ANTIMATTER bumps payloadTier=3 which Saboteur needs.
      unlockBuildings: [BLDG_COUNTER_MISSILE],
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
      'Antimatter containment + weaponization. Unlocks Tier 3 colony ships + lava biome + the Antimatter Reactor. Requires a Launch Pad built first.',
    prerequisites: [TECH_FUSION_POWER, TECH_ORBITAL_MECHANICS],
    requiredBuildings: [BLDG_LAUNCH_PAD],
    costPoints: 200,
    effects: {
      unlockBiomes: ['lava'],
      // PHASE 16.25: normalized to def.id tokens + Saboteur moved here from LASER_OPTICS
      // since Saboteur needs colonyShipPayloadTier=3 which this tech provides.
      unlockColonyShipVariants: ['explosive', 'heavy', 'counterColony', 'saboteur'],
      colonyShipPayloadTier: 3,
      // PHASE 17.J.8 — Antimatter Reactor as planet building. Consumes RESOURCE_ANTIMATTER,
      // produces 32× a Power Plant's fuel throughput. End-game energy infrastructure.
      unlockBuildings: [BLDG_REACTOR_ANTIMATTER],
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
      // PHASE 16.25: normalized to def.id tokens + adds finalColonyShip (the tier-4 apex
      // suicide variant). Before this fix none of these matched isColonyShipUnlocked's
      // def.id check ('PilgrimVolunteer' matches neither def.id 'pilgrimVolunteer' nor
      // def.name 'Pilgrim Volunteer') so the entire tier 4 catalog was dead-listed.
      unlockColonyShipVariants: [
        'pilgrimVolunteer',
        'massEvacuation',
        'orbitalWeaponPlatform',
        'finalColonyShip',
      ],
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
  // PHASE 16.25 — six new tech nodes filling progression gaps per audit. All use existing
  // TechEffects fields (no schema additions) so aggregateEffects merges them naturally.
  {
    id: TECH_HEAVY_INDUSTRY,
    name: 'Heavy Industry',
    emoji: '⚙️',
    tier: 1,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Mass-scale manufacturing infrastructure + dense urban housing. Production lines absorb shock losses; output climbs across every industrial building. Unlocks high-density Apartment Complex.',
    prerequisites: [TECH_MASS_PRODUCTION, TECH_ELECTRIC_POWER],
    costPoints: 60,
    effects: {
      buildingProductionMultiplier: 1.2,
      // PHASE 17.L.D.10 (HOTFIX 2026-05-13) — BLDG_APARTMENT added per user verbatim *"check
      // for other shit like that not gated correctly"*. Apartment was default-buildable from
      // match start (absent from every tech's unlockBuildings AND from TECH_GATED_BUILDINGS).
      // Apartment is high-density housing (32 citizens vs Home's 8) at heavier cost — clearly
      // a tier-1 industrial-scale construction project. Now properly gated behind Heavy
      // Industry tech (tier 1, mainstream, industrial).
      unlockBuildings: [BLDG_APARTMENT],
    },
  },
  {
    id: TECH_AUTOMATED_LOGISTICS,
    name: 'Automated Logistics',
    emoji: '📦',
    tier: 2,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Computer-routed supply chains. Stockpile turnover speeds up; factories run hotter without manual intervention.',
    prerequisites: [TECH_HEAVY_INDUSTRY, TECH_COMPUTING],
    costPoints: 100,
    effects: {
      buildingProductionMultiplier: 1.3,
    },
  },
  {
    id: TECH_ROBOTICS,
    name: 'Robotics',
    emoji: '🤖',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description:
      'Automated assembly + worker augmentation. Citizens promote faster as automation frees them for skilled labor.',
    prerequisites: [TECH_CONSUMER_ELECTRONICS, TECH_MASS_PRODUCTION],
    costPoints: 100,
    effects: {
      citizenPromotionRateMultiplier: 1.3,
      buildingProductionMultiplier: 1.15,
    },
  },
  {
    id: TECH_CIVIL_DEFENSE,
    name: 'Civil Defense',
    emoji: '🚨',
    tier: 2,
    visibility: 'mainstream',
    category: 'information',
    description:
      'Civilian emergency-broadcast grid + neighborhood drills. Doubles as a propaganda channel reaching every household.',
    prerequisites: [TECH_WARNING_SYSTEM, TECH_TELECOMMUNICATIONS],
    costPoints: 100,
    effects: {
      propagandaPowerMultiplier: 1.3,
    },
  },
  {
    id: TECH_SELF_DESTRUCT_SYSTEMS,
    name: 'Self-Destruct Systems',
    emoji: '💣',
    tier: 1,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Onboard termination charges + civ-side trigger network. Lets the player manually self-destruct their own colony ships mid-flight (only ships with detonation intent baked in — suicide-class, counter-interceptors, explosive payloads). Without this, ships can only end via planet impact, crash, crew starvation, power-out, fuel-out, or reactor end-of-life.',
    prerequisites: [TECH_INDUSTRIAL_LOGISTICS],
    costPoints: 50,
    effects: {},
  },
  {
    id: TECH_VOLUNTEER_INDOCTRINATION,
    name: 'Volunteer Indoctrination',
    emoji: '🎤',
    tier: 3,
    visibility: 'suppressed',
    category: 'control',
    description:
      'Curated lifelong propaganda pipeline. Citizens eagerly volunteer for one-way colony ships when called.',
    prerequisites: [TECH_MEMETIC_ENGINEERING, TECH_TELECOMMUNICATIONS],
    costPoints: 200,
    conquestGate: { minDefeatedCivs: 1 },
    effects: {
      volunteerPoolMultiplier: 1.4,
      propagandaPowerMultiplier: 1.5,
    },
  },
  {
    id: TECH_BLACK_OPS_RESEARCH,
    name: 'Black Ops Research',
    emoji: '🕵️',
    tier: 3,
    visibility: 'forbidden',
    category: 'forbidden',
    description:
      'Off-the-books research division. Forbidden techs accelerate; tier promotions clear oversight faster.',
    prerequisites: [TECH_BEHAVIORAL_COMPLIANCE, TECH_ANCIENT_TECH_REVERSE],
    costPoints: 300,
    conquestGate: { minDefeatedCivs: 2 },
    effects: {
      researchSpeedMultiplier: 1.6,
      citizenPromotionRateMultiplier: 1.5,
    },
  },
  // PHASE 16.31 — God Control. End-game forbidden override capability. Player can select an
  // in-flight colony ship + right-click any planet to redirect it (PHASE 16.31 UX). Requires
  // both this tech researched AND a BLDG_GOD_CONTROL building installed on any owned planet.
  // Effective vs even EMPTY_HULK ships (the god intervenes from above per project framing).
  {
    id: TECH_GOD_CONTROL,
    name: 'God Control',
    emoji: '🕹️',
    tier: 4,
    visibility: 'forbidden',
    category: 'forbidden',
    description:
      'End-game override infrastructure. Researched + installed → player can select any in-flight colony ship and right-click any planet to redirect it mid-arc. The god intervenes from above.',
    prerequisites: [TECH_MIND_CONTROL_BROADCAST, TECH_ANCIENT_TECH_REVERSE],
    costPoints: 400,
    conquestGate: { minDefeatedCivs: 3 },
    effects: {
      unlockBuildings: [BLDG_GOD_CONTROL],
    },
  },
  // ===== PHASE 17.L.Q16 — Tech tree expansion 40 → 60+ (20 new nodes) =====
  // All effects use existing TechEffects fields so aggregateEffects merges cleanly. Prereqs
  // chosen to keep the DAG valid + add meaningful gameplay branches without inventing new
  // dependency cycles. Each new tech offers a real progression incentive (production /
  // propaganda / research / promotion / volunteer pool / ship payload).

  // Tier 0 — early-game industrial / information foundations
  {
    id: TECH_BASIC_AGRICULTURE,
    name: 'Basic Agriculture',
    emoji: '🌾',
    tier: 0,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Plough + irrigation + crop rotation. Farms run hotter and food stockpiles climb faster from the very first tick.',
    prerequisites: [],
    costPoints: 25,
    effects: {
      buildingProductionMultiplier: 1.1,
    },
  },
  {
    id: TECH_METALLURGY,
    name: 'Metallurgy',
    emoji: '🔥',
    tier: 0,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Smelting + ore-grade separation. Foundries and refineries push more ingots + alloys per worker.',
    prerequisites: [TECH_INDUSTRIAL_LOGISTICS],
    costPoints: 35,
    effects: {
      buildingProductionMultiplier: 1.12,
    },
  },
  {
    id: TECH_FIRE_CONTROL,
    name: 'Fire Control',
    emoji: '🎯',
    tier: 0,
    visibility: 'mainstream',
    category: 'information',
    description:
      'Coordinated targeting + spotter networks. Mine-field placement gets pre-aim parameters, intercept calculations sharpen.',
    prerequisites: [TECH_WARNING_SYSTEM],
    costPoints: 35,
    effects: {},
  },

  // Tier 1 — bridges feeding tier 2 advanced
  {
    id: TECH_PETROCHEMISTRY,
    name: 'Petrochemistry',
    emoji: '⛽',
    tier: 1,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Cracking towers + catalytic refining. Fuel output climbs across every fuel-producing building.',
    prerequisites: [TECH_COMBUSTION_ENGINES, TECH_MASS_PRODUCTION],
    costPoints: 60,
    effects: {
      buildingProductionMultiplier: 1.18,
    },
  },
  {
    id: TECH_RADIO_BROADCAST,
    name: 'Radio Broadcast',
    emoji: '📻',
    tier: 1,
    visibility: 'mainstream',
    category: 'information',
    description:
      'Wide-area radio transmission. Propaganda saturates rural + low-density settlements that printed media never reached.',
    prerequisites: [TECH_MASS_COMMUNICATION],
    costPoints: 55,
    effects: {
      propagandaPowerMultiplier: 1.25,
    },
  },
  {
    id: TECH_ASSEMBLY_LINE,
    name: 'Assembly Line',
    emoji: '🔧',
    tier: 1,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Henry-Ford-style line production. Components + intermediate goods flow through factories at higher tempo.',
    prerequisites: [TECH_MASS_PRODUCTION, TECH_COMBUSTION_ENGINES],
    costPoints: 60,
    effects: {
      buildingProductionMultiplier: 1.2,
    },
  },

  // Tier 2 — mid-game branches
  {
    id: TECH_ADVANCED_METALLURGY,
    name: 'Advanced Metallurgy',
    emoji: '⚒️',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description:
      'Rare-metal alloying + vacuum smelting. Foundries output exotic alloys for hull plating + reactor jackets.',
    prerequisites: [TECH_METALLURGY, TECH_COMPUTING],
    costPoints: 100,
    effects: {
      buildingProductionMultiplier: 1.22,
    },
  },
  {
    id: TECH_PRECISION_OPTICS,
    name: 'Precision Optics',
    emoji: '🔭',
    tier: 2,
    visibility: 'mainstream',
    category: 'information',
    description:
      'Sub-arcsecond imaging + lens fabrication. Research output climbs and laser-based defense sharpens.',
    prerequisites: [TECH_CONSUMER_ELECTRONICS, TECH_LASER_OPTICS],
    costPoints: 110,
    effects: {
      researchSpeedMultiplier: 1.2,
    },
  },
  {
    id: TECH_PLASMA_PHYSICS,
    name: 'Plasma Physics',
    emoji: '🌡️',
    tier: 2,
    visibility: 'mainstream',
    category: 'advanced',
    description:
      'Magnetic confinement + plasma chemistry. Bridges fusion mainstream → antimatter advanced; opens hot-biome research.',
    prerequisites: [TECH_FUSION_POWER, TECH_COMPUTING],
    costPoints: 120,
    effects: {
      researchSpeedMultiplier: 1.15,
      buildingProductionMultiplier: 1.1,
    },
  },
  {
    id: TECH_BIOENGINEERING,
    name: 'Bioengineering',
    emoji: '🧪',
    tier: 2,
    visibility: 'mainstream',
    category: 'spacefaring',
    description:
      'Engineered crops + clinical medicine. Citizen tier promotion accelerates as the population stays healthier longer.',
    prerequisites: [TECH_GENETIC_ENGINEERING, TECH_CYBERNETICS],
    costPoints: 110,
    effects: {
      citizenPromotionRateMultiplier: 1.4,
    },
  },

  // Tier 3 — late-game depth feeding tier 4 apex
  {
    id: TECH_FUSION_PROPULSION,
    name: 'Fusion Propulsion',
    emoji: '🚀',
    tier: 3,
    visibility: 'mainstream',
    category: 'spacefaring',
    description:
      'Fusion-torch drives + magneto-plasma thrust. Bumps maximum colony-ship payload tier as faster ships carry more. Requires a Launch Pad built first.',
    prerequisites: [TECH_PLASMA_PHYSICS, TECH_ORBITAL_MECHANICS],
    requiredBuildings: [BLDG_LAUNCH_PAD],
    costPoints: 200,
    effects: {
      colonyShipPayloadTier: 3,
      buildingProductionMultiplier: 1.1,
    },
  },
  {
    id: TECH_PLASMA_WEAPONS,
    name: 'Plasma Weapons',
    emoji: '⚡',
    tier: 3,
    visibility: 'mainstream',
    category: 'spacefaring',
    description:
      'Magnetically-contained-plasma armaments. Counter-colony-ship defense pads pack much higher kill envelopes.',
    prerequisites: [TECH_PLASMA_PHYSICS, TECH_LASER_OPTICS],
    costPoints: 200,
    effects: {
      buildingProductionMultiplier: 1.15,
    },
  },
  {
    id: TECH_NEURAL_INTERFACE,
    name: 'Neural Interface',
    emoji: '🧠',
    tier: 3,
    visibility: 'mainstream',
    category: 'advanced',
    description:
      'Direct brain-computer links. Researchers think with the lab + citizens promote on every breakthrough.',
    prerequisites: [TECH_QUANTUM_COMPUTING, TECH_LIFE_EXTENSION],
    costPoints: 250,
    effects: {
      researchSpeedMultiplier: 1.5,
      citizenPromotionRateMultiplier: 1.5,
    },
  },
  {
    id: TECH_COLD_FUSION,
    name: 'Cold Fusion',
    emoji: '❄️',
    tier: 3,
    visibility: 'mainstream',
    category: 'advanced',
    description:
      'Room-temperature fusion via metallic hydrogen catalysis. Alternate-path massive production multiplier without antimatter.',
    prerequisites: [TECH_FUSION_POWER, TECH_NANOTECH],
    costPoints: 250,
    effects: {
      buildingProductionMultiplier: 1.6,
    },
  },
  {
    id: TECH_HOLOGRAPHIC_PROPAGANDA,
    name: 'Holographic Propaganda',
    emoji: '🎆',
    tier: 3,
    visibility: 'suppressed',
    category: 'control',
    description:
      'Volumetric civic spectacles + augmented-reality saturation. Loyalty conversion + volunteer pool jump together.',
    prerequisites: [TECH_MEMETIC_ENGINEERING, TECH_PRECISION_OPTICS],
    costPoints: 220,
    conquestGate: { minCapturedPlanets: 1 },
    effects: {
      propagandaPowerMultiplier: 2.2,
      volunteerPoolMultiplier: 1.6,
    },
  },

  // Tier 4 — apex farFuture + forbidden additions
  {
    id: TECH_INTERSTELLAR_GATES,
    name: 'Interstellar Gates',
    emoji: '🌀',
    tier: 4,
    visibility: 'mainstream',
    category: 'farFuture',
    description:
      'Wormhole-anchored faster-than-light gates between owned planets. Massive logistics + research compounding.',
    prerequisites: [TECH_FUSION_PROPULSION, TECH_QUANTUM_COMPUTING],
    costPoints: 450,
    effects: {
      researchSpeedMultiplier: 1.8,
      buildingProductionMultiplier: 1.4,
    },
  },
  {
    id: TECH_RECURSIVE_AUTOMATION,
    name: 'Recursive Automation',
    emoji: '♾️',
    tier: 4,
    visibility: 'mainstream',
    category: 'farFuture',
    description:
      'Self-improving production lines. Each generation of builders is built by the last. Compounding throughput across every industrial chain.',
    prerequisites: [TECH_SELF_REPLICATING_INDUSTRY, TECH_NEURAL_INTERFACE],
    costPoints: 450,
    effects: {
      buildingProductionMultiplier: 2.5,
      autoBuildEnabled: true,
    },
  },
  {
    id: TECH_PSYCHIC_BROADCAST,
    name: 'Psychic Broadcast',
    emoji: '🔮',
    tier: 4,
    visibility: 'forbidden',
    category: 'forbidden',
    description:
      'Direct cognitive saturation bypassing the senses. Volunteer pool effectively unlimited. Citizens believe what the broadcast tells them.',
    prerequisites: [TECH_HOLOGRAPHIC_PROPAGANDA, TECH_NEURAL_INTERFACE],
    costPoints: 400,
    conquestGate: { minDefeatedCivs: 2 },
    effects: {
      propagandaPowerMultiplier: 4.0,
      volunteerPoolMultiplier: 5.0,
      citizenPromotionRateMultiplier: 2.0,
    },
  },
  {
    id: TECH_BIOWEAPON_PROTOCOLS,
    name: 'Bioweapon Protocols',
    emoji: '☠️',
    tier: 4,
    visibility: 'forbidden',
    category: 'forbidden',
    description:
      'Targeted civilization-collapse pathogens. Disables enemy productive output via plague-grade industrial sabotage. Conquest accelerator.',
    prerequisites: [TECH_BIOENGINEERING, TECH_BLACK_OPS_RESEARCH],
    costPoints: 400,
    conquestGate: { minDefeatedCivs: 3 },
    effects: {
      disablesEnemyProduction: true,
    },
  },
  {
    id: TECH_TIME_DILATION,
    name: 'Time Dilation Lab',
    emoji: '⏱️',
    tier: 4,
    visibility: 'mainstream',
    category: 'farFuture',
    description:
      'Localized spacetime compression around research facilities. A year of work fits inside a week of objective time.',
    prerequisites: [TECH_INTERSTELLAR_GATES, TECH_COLD_FUSION],
    costPoints: 500,
    effects: {
      researchSpeedMultiplier: 3.0,
    },
  },
  {
    id: TECH_FOOD_PRESERVATION,
    name: 'Food Preservation',
    emoji: '🥫',
    tier: 1,
    visibility: 'mainstream',
    category: 'industrial',
    description:
      'Refrigeration + canning + chemical preservatives. Food stockpiles last through hard winters; population growth steadies.',
    prerequisites: [TECH_BASIC_AGRICULTURE, TECH_ELECTRIC_POWER],
    costPoints: 50,
    effects: {
      buildingProductionMultiplier: 1.08,
    },
  },
  {
    id: TECH_GRAVITY_MANIPULATION,
    name: 'Gravity Manipulation',
    emoji: '🌐',
    tier: 3,
    visibility: 'mainstream',
    category: 'farFuture',
    description:
      'Direct manipulation of local gravitational fields. Hostile biomes become trivially colonizable + ship payload tier climbs.',
    prerequisites: [TECH_FUSION_PROPULSION, TECH_NANOTECH],
    costPoints: 300,
    effects: {
      colonyShipPayloadTier: 4,
      buildingProductionMultiplier: 1.2,
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
