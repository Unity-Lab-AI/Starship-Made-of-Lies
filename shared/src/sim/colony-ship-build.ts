import { type ResourceId } from '../types/index'
import { type ColonyShipDef } from './colony-ship'
import {
  type TechId,
  TECH_AEROSPACE,
  TECH_ANCIENT_TECH_REVERSE,
  TECH_ANTIMATTER,
  TECH_ADVANCED_METALLURGY,
  TECH_BIOENGINEERING,
  TECH_FUSION_POWER,
  TECH_FUSION_PROPULSION,
  TECH_LASER_OPTICS,
  TECH_NEURAL_INTERFACE,
  TECH_ORBITAL_MECHANICS,
  TECH_PLASMA_WEAPONS,
  TECH_PRECISION_OPTICS,
  TECH_QUANTUM_COMPUTING,
  TECH_RADIO_BROADCAST,
  TECH_SELF_DESTRUCT_SYSTEMS,
  TECH_TELECOMMUNICATIONS,
} from './tech'
import {
  RESOURCE_ALLOYS,
  RESOURCE_AMMUNITION,
  RESOURCE_ANTIMATTER,
  RESOURCE_COMPONENTS,
  RESOURCE_ELECTRONICS,
  RESOURCE_EXPLOSIVES,
  RESOURCE_EXOTIC_ALLOYS,
  RESOURCE_FUSION_FUEL,
  RESOURCE_INGOTS,
  RESOURCE_MACHINERY,
} from './resources'

export type ShipPieceSlot =
  | 'hull'
  | 'propulsion'
  | 'life_support'
  | 'landing_gear'
  | 'payload'
  | 'sensors'
  | 'weapons'
  | 'comms'

export type ShipPieceTier = 1 | 2 | 3 | 4

export interface ShipPieceCost {
  readonly resource: ResourceId
  readonly amount: number
}

export interface ShipPieceStats {
  readonly citizenCapacity?: number
  readonly cargoCapacity?: number
  readonly weaponPayload?: number
  readonly explosiveYield?: number
  readonly fuelRequirement?: number
  readonly ammoRequirement?: number
  readonly speedDelta?: number
  readonly evasionDelta?: number
  readonly massPenalty?: number
  readonly landingGearTier?: 0 | 1 | 2 | 3
  readonly sensorTier?: 0 | 1 | 2 | 3
  readonly lifeSupportTier?: 0 | 1 | 2 | 3
  readonly weaponsTier?: 0 | 1 | 2 | 3
  readonly commsTier?: 0 | 1 | 2 | 3
  readonly buildTimeDelta?: number
}

export interface ShipPieceDef {
  readonly id: string
  readonly slot: ShipPieceSlot
  readonly tier: ShipPieceTier
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly costs: ReadonlyArray<ShipPieceCost>
  readonly techWalls: ReadonlyArray<TechId>
  readonly stats: ShipPieceStats
}

export const SHIP_PIECES: ReadonlyArray<ShipPieceDef> = [
  {
    id: 'hull-light',
    slot: 'hull',
    tier: 1,
    name: 'Light Hull',
    emoji: '🛸',
    description: 'Cheap, low-mass hull. Small crew + cargo.',
    costs: [{ resource: RESOURCE_INGOTS, amount: 30 }],
    techWalls: [],
    stats: { citizenCapacity: 30, cargoCapacity: 20, evasionDelta: 0.1, massPenalty: 0.05 },
  },
  {
    id: 'hull-standard',
    slot: 'hull',
    tier: 2,
    name: 'Standard Hull',
    emoji: '🚀',
    description: 'Mid-tier hull. Balanced citizen + cargo capacity.',
    costs: [
      { resource: RESOURCE_INGOTS, amount: 80 },
      { resource: RESOURCE_COMPONENTS, amount: 30 },
    ],
    techWalls: [TECH_AEROSPACE],
    stats: { citizenCapacity: 200, cargoCapacity: 80, evasionDelta: 0, massPenalty: 0.15 },
  },
  {
    id: 'hull-heavy',
    slot: 'hull',
    tier: 3,
    name: 'Heavy Hull',
    emoji: '🛳️',
    description: 'Industrial hull. Large crew + heavy cargo.',
    costs: [
      { resource: RESOURCE_INGOTS, amount: 200 },
      { resource: RESOURCE_ALLOYS, amount: 60 },
      { resource: RESOURCE_MACHINERY, amount: 30 },
    ],
    techWalls: [TECH_ORBITAL_MECHANICS, TECH_ADVANCED_METALLURGY],
    stats: { citizenCapacity: 800, cargoCapacity: 300, evasionDelta: -0.15, massPenalty: 0.4 },
  },
  {
    id: 'hull-colossal',
    slot: 'hull',
    tier: 4,
    name: 'Colossal Hull',
    emoji: '🌌',
    description: 'Endgame hull. Civilization-scale displacement.',
    costs: [
      { resource: RESOURCE_INGOTS, amount: 400 },
      { resource: RESOURCE_EXOTIC_ALLOYS, amount: 80 },
    ],
    techWalls: [TECH_ANTIMATTER, TECH_ANCIENT_TECH_REVERSE],
    stats: { citizenCapacity: 5000, cargoCapacity: 600, evasionDelta: -0.3, massPenalty: 0.7 },
  },

  {
    id: 'prop-chemical',
    slot: 'propulsion',
    tier: 1,
    name: 'Chemical Engine',
    emoji: '🛢️',
    description: 'Cheap chemical propellant. Slow but always available.',
    costs: [
      { resource: RESOURCE_INGOTS, amount: 15 },
      { resource: RESOURCE_COMPONENTS, amount: 10 },
    ],
    techWalls: [],
    stats: { fuelRequirement: 30, speedDelta: 0, evasionDelta: 0 },
  },
  {
    id: 'prop-fusion',
    slot: 'propulsion',
    tier: 2,
    name: 'Fusion Drive',
    emoji: '☀️',
    description: 'Sustained fusion thrust. Mid-tier speed.',
    costs: [
      { resource: RESOURCE_COMPONENTS, amount: 40 },
      { resource: RESOURCE_FUSION_FUEL, amount: 20 },
    ],
    techWalls: [TECH_FUSION_POWER],
    stats: { fuelRequirement: 60, speedDelta: 0.4, evasionDelta: 0.1 },
  },
  {
    id: 'prop-antimatter',
    slot: 'propulsion',
    tier: 3,
    name: 'Antimatter Drive',
    emoji: '⚛️',
    description: 'Apex propulsion. Endgame speed.',
    costs: [
      { resource: RESOURCE_COMPONENTS, amount: 80 },
      { resource: RESOURCE_ANTIMATTER, amount: 10 },
    ],
    techWalls: [TECH_ANTIMATTER, TECH_FUSION_PROPULSION],
    stats: { fuelRequirement: 120, speedDelta: 0.8, evasionDelta: 0.2 },
  },

  {
    id: 'life-minimal',
    slot: 'life_support',
    tier: 1,
    name: 'Minimal Life-Support',
    emoji: '💨',
    description: 'Bare survival. Citizens arrive haggard.',
    costs: [{ resource: RESOURCE_COMPONENTS, amount: 8 }],
    techWalls: [],
    stats: { lifeSupportTier: 1 },
  },
  {
    id: 'life-standard',
    slot: 'life_support',
    tier: 2,
    name: 'Standard Life-Support',
    emoji: '🌬️',
    description: 'Acceptable survival rate. Standard atmosphere recycler.',
    costs: [
      { resource: RESOURCE_COMPONENTS, amount: 25 },
      { resource: RESOURCE_ELECTRONICS, amount: 10 },
    ],
    techWalls: [TECH_AEROSPACE],
    stats: { lifeSupportTier: 2 },
  },
  {
    id: 'life-luxe',
    slot: 'life_support',
    tier: 3,
    name: 'Luxe Life-Support',
    emoji: '🛁',
    description: 'Pampered survival. Pinnacle citizens travel comfortably.',
    costs: [
      { resource: RESOURCE_COMPONENTS, amount: 60 },
      { resource: RESOURCE_ELECTRONICS, amount: 30 },
    ],
    techWalls: [TECH_ORBITAL_MECHANICS, TECH_BIOENGINEERING],
    stats: { lifeSupportTier: 3 },
  },

  {
    id: 'gear-none',
    slot: 'landing_gear',
    tier: 1,
    name: 'No Landing Gear',
    emoji: '💀',
    description: 'No gear. Ship CRASHES on arrival. Cargo becomes loot. Crew mostly dies.',
    costs: [],
    techWalls: [],
    stats: { landingGearTier: 0 },
  },
  {
    id: 'gear-basic',
    slot: 'landing_gear',
    tier: 1,
    name: 'Basic Landing Gear',
    emoji: '🦿',
    description: 'Minimal touchdown survival. Dropping landing gear after touchdown.',
    costs: [
      { resource: RESOURCE_INGOTS, amount: 25 },
      { resource: RESOURCE_COMPONENTS, amount: 10 },
    ],
    techWalls: [TECH_AEROSPACE],
    stats: { landingGearTier: 1, massPenalty: 0.05 },
  },
  {
    id: 'gear-advanced',
    slot: 'landing_gear',
    tier: 2,
    name: 'Advanced Landing Gear',
    emoji: '🛬',
    description: 'Reusable + soft-landing. Full crew survives.',
    costs: [
      { resource: RESOURCE_COMPONENTS, amount: 40 },
      { resource: RESOURCE_MACHINERY, amount: 20 },
    ],
    techWalls: [TECH_ORBITAL_MECHANICS],
    stats: { landingGearTier: 2, massPenalty: 0.1 },
  },
  {
    id: 'gear-precision',
    slot: 'landing_gear',
    tier: 3,
    name: 'Precision Landing System',
    emoji: '🎯',
    description: 'Pinpoint vector landing. No crash risk + retains all cargo.',
    costs: [
      { resource: RESOURCE_COMPONENTS, amount: 80 },
      { resource: RESOURCE_ELECTRONICS, amount: 40 },
    ],
    techWalls: [TECH_LASER_OPTICS, TECH_QUANTUM_COMPUTING, TECH_PRECISION_OPTICS],
    stats: { landingGearTier: 3, massPenalty: 0.15 },
  },

  {
    id: 'payload-cargo',
    slot: 'payload',
    tier: 1,
    name: 'Cargo Payload',
    emoji: '📦',
    description: 'Pure cargo bay. Bulk-resources transport.',
    costs: [{ resource: RESOURCE_INGOTS, amount: 20 }],
    techWalls: [],
    stats: { cargoCapacity: 120, evasionDelta: -0.05 },
  },
  {
    id: 'payload-citizens',
    slot: 'payload',
    tier: 1,
    name: 'Citizen Bunks',
    emoji: '🛏️',
    description: 'Citizen cryo + bunks. Doubles citizen capacity over baseline hull.',
    costs: [{ resource: RESOURCE_COMPONENTS, amount: 30 }],
    techWalls: [],
    stats: { citizenCapacity: 200 },
  },
  {
    id: 'payload-explosive',
    slot: 'payload',
    tier: 2,
    name: 'Explosive Payload',
    emoji: '💥',
    description: 'High-yield warhead. Suicide-ship payload.',
    costs: [{ resource: RESOURCE_EXPLOSIVES, amount: 100 }],
    techWalls: [TECH_AEROSPACE, TECH_SELF_DESTRUCT_SYSTEMS],
    stats: { explosiveYield: 400, massPenalty: 0.2 },
  },
  {
    id: 'payload-orbital-weapon',
    slot: 'payload',
    tier: 3,
    name: 'Orbital Weapon Bay',
    emoji: '🛰️',
    description: 'Settle into orbit + rain kinetics. Indefinite bombardment.',
    costs: [
      { resource: RESOURCE_AMMUNITION, amount: 200 },
      { resource: RESOURCE_EXPLOSIVES, amount: 100 },
    ],
    techWalls: [TECH_ORBITAL_MECHANICS, TECH_PLASMA_WEAPONS],
    stats: { weaponPayload: 200, ammoRequirement: 200, weaponsTier: 3 },
  },

  {
    id: 'sensors-none',
    slot: 'sensors',
    tier: 1,
    name: 'No Sensors',
    emoji: '🚫',
    description: 'No sensor suite. Cannot lock targets.',
    costs: [],
    techWalls: [],
    stats: { sensorTier: 0 },
  },
  {
    id: 'sensors-basic',
    slot: 'sensors',
    tier: 1,
    name: 'Basic Sensors',
    emoji: '📡',
    description: 'Local-area sensor. Lock-on within 1 hex.',
    costs: [{ resource: RESOURCE_ELECTRONICS, amount: 12 }],
    techWalls: [],
    stats: { sensorTier: 1, evasionDelta: 0.05 },
  },
  {
    id: 'sensors-laser-target',
    slot: 'sensors',
    tier: 2,
    name: 'Laser-Target Sensors',
    emoji: '🔦',
    description: 'Laser-guided target locks. Boosts accuracy + can guide other ships.',
    costs: [{ resource: RESOURCE_ELECTRONICS, amount: 35 }],
    techWalls: [TECH_LASER_OPTICS],
    stats: { sensorTier: 2, evasionDelta: 0.1 },
  },
  {
    id: 'sensors-auto',
    slot: 'sensors',
    tier: 3,
    name: 'Auto-Guidance Suite',
    emoji: '🧠',
    description: 'Autonomous flight. Intelligent course-correction + intercept.',
    costs: [
      { resource: RESOURCE_ELECTRONICS, amount: 80 },
      { resource: RESOURCE_COMPONENTS, amount: 40 },
    ],
    techWalls: [TECH_QUANTUM_COMPUTING, TECH_NEURAL_INTERFACE],
    stats: { sensorTier: 3, evasionDelta: 0.2 },
  },

  {
    id: 'weapons-none',
    slot: 'weapons',
    tier: 1,
    name: 'Unarmed',
    emoji: '🚫',
    description: 'No offensive armament.',
    costs: [],
    techWalls: [],
    stats: { weaponsTier: 0 },
  },
  {
    id: 'weapons-light',
    slot: 'weapons',
    tier: 1,
    name: 'Light Weapons',
    emoji: '🔫',
    description: 'Point-defense + light strike. Counter-ship adequate.',
    costs: [{ resource: RESOURCE_AMMUNITION, amount: 40 }],
    techWalls: [],
    stats: { weaponPayload: 30, weaponsTier: 1, ammoRequirement: 40 },
  },
  {
    id: 'weapons-heavy',
    slot: 'weapons',
    tier: 2,
    name: 'Heavy Weapons',
    emoji: '💣',
    description: 'Heavy ordnance. Ground-strike capable.',
    costs: [
      { resource: RESOURCE_AMMUNITION, amount: 100 },
      { resource: RESOURCE_EXPLOSIVES, amount: 60 },
    ],
    techWalls: [TECH_AEROSPACE, TECH_PLASMA_WEAPONS],
    stats: { weaponPayload: 120, weaponsTier: 2, ammoRequirement: 100 },
  },

  {
    id: 'comms-none',
    slot: 'comms',
    tier: 1,
    name: 'No Comms',
    emoji: '🚫',
    description: 'Silent runner. Lost-contact at radio range.',
    costs: [],
    techWalls: [],
    stats: { commsTier: 0 },
  },
  {
    id: 'comms-radio',
    slot: 'comms',
    tier: 1,
    name: 'Radio Comms',
    emoji: '📻',
    description: 'Radio-band telemetry. Fades at radio-range fog.',
    costs: [{ resource: RESOURCE_ELECTRONICS, amount: 12 }],
    techWalls: [TECH_TELECOMMUNICATIONS, TECH_RADIO_BROADCAST],
    stats: { commsTier: 1 },
  },
  {
    id: 'comms-laser-align',
    slot: 'comms',
    tier: 2,
    name: 'Laser-Align Comms',
    emoji: '🔦',
    description: 'Laser-aligned to home base. Maintains link beyond radio range.',
    costs: [
      { resource: RESOURCE_ELECTRONICS, amount: 30 },
      { resource: RESOURCE_COMPONENTS, amount: 15 },
    ],
    techWalls: [TECH_LASER_OPTICS],
    stats: { commsTier: 2 },
  },
]

const PIECE_INDEX: ReadonlyMap<string, ShipPieceDef> = new Map(SHIP_PIECES.map((p) => [p.id, p]))

export function getShipPiece(id: string): ShipPieceDef {
  const def = PIECE_INDEX.get(id)
  if (!def) throw new Error(`Unknown ship piece id: ${id}`)
  return def
}

export function piecesBySlot(slot: ShipPieceSlot): ReadonlyArray<ShipPieceDef> {
  return SHIP_PIECES.filter((p) => p.slot === slot)
}

export interface ColonyShipBuild {
  readonly buildId: string
  readonly displayName: string
  readonly pieces: ReadonlyArray<string>
}

export interface ResolvedShipStats {
  citizenCapacity: number
  cargoCapacity: number
  weaponPayload: number
  explosiveYield: number
  fuelRequirement: number
  ammoRequirement: number
  speedDelta: number
  evasionDelta: number
  massPenalty: number
  landingGearTier: 0 | 1 | 2 | 3
  sensorTier: 0 | 1 | 2 | 3
  lifeSupportTier: 0 | 1 | 2 | 3
  weaponsTier: 0 | 1 | 2 | 3
  commsTier: 0 | 1 | 2 | 3
  buildTimeDelta: number
}

export interface ResolvedShipBuild {
  readonly build: ColonyShipBuild
  readonly pieces: ReadonlyArray<ShipPieceDef>
  readonly stats: ResolvedShipStats
  readonly missingTechs: ReadonlyArray<TechId>
  readonly totalCost: ReadonlyArray<ShipPieceCost>
}

function zeroStats(): ResolvedShipStats {
  return {
    citizenCapacity: 0,
    cargoCapacity: 0,
    weaponPayload: 0,
    explosiveYield: 0,
    fuelRequirement: 0,
    ammoRequirement: 0,
    speedDelta: 0,
    evasionDelta: 0,
    massPenalty: 0,
    landingGearTier: 0,
    sensorTier: 0,
    lifeSupportTier: 0,
    weaponsTier: 0,
    commsTier: 0,
    buildTimeDelta: 0,
  }
}

export function resolveShipBuild(
  build: ColonyShipBuild,
  researchedTechs: ReadonlySet<TechId>,
): ResolvedShipBuild {
  const pieces: ShipPieceDef[] = []
  const stats: ResolvedShipStats = zeroStats()
  const missingTechs: TechId[] = []
  const costs: ShipPieceCost[] = []

  for (const pieceId of build.pieces) {
    const piece = getShipPiece(pieceId)
    pieces.push(piece)
    for (const wall of piece.techWalls) {
      if (!researchedTechs.has(wall)) missingTechs.push(wall)
    }
    for (const cost of piece.costs) costs.push(cost)
    const s = piece.stats
    if (s.citizenCapacity) stats.citizenCapacity += s.citizenCapacity
    if (s.cargoCapacity) stats.cargoCapacity += s.cargoCapacity
    if (s.weaponPayload) stats.weaponPayload += s.weaponPayload
    if (s.explosiveYield) stats.explosiveYield += s.explosiveYield
    if (s.fuelRequirement) stats.fuelRequirement += s.fuelRequirement
    if (s.ammoRequirement) stats.ammoRequirement += s.ammoRequirement
    if (s.speedDelta) stats.speedDelta += s.speedDelta
    if (s.evasionDelta) stats.evasionDelta += s.evasionDelta
    if (s.massPenalty) stats.massPenalty += s.massPenalty
    if (s.landingGearTier !== undefined && s.landingGearTier > stats.landingGearTier) {
      stats.landingGearTier = s.landingGearTier
    }
    if (s.sensorTier !== undefined && s.sensorTier > stats.sensorTier)
      stats.sensorTier = s.sensorTier
    if (s.lifeSupportTier !== undefined && s.lifeSupportTier > stats.lifeSupportTier) {
      stats.lifeSupportTier = s.lifeSupportTier
    }
    if (s.weaponsTier !== undefined && s.weaponsTier > stats.weaponsTier) {
      stats.weaponsTier = s.weaponsTier
    }
    if (s.commsTier !== undefined && s.commsTier > stats.commsTier) stats.commsTier = s.commsTier
    if (s.buildTimeDelta) stats.buildTimeDelta += s.buildTimeDelta
  }

  return { build, pieces, stats, missingTechs, totalCost: costs }
}

export interface BuildValidationResult {
  readonly valid: boolean
  readonly errors: ReadonlyArray<string>
}

export function validateShipBuild(build: ColonyShipBuild): BuildValidationResult {
  const errors: string[] = []
  const slotsSeen = new Set<ShipPieceSlot>()
  for (const pieceId of build.pieces) {
    let piece: ShipPieceDef
    try {
      piece = getShipPiece(pieceId)
    } catch {
      errors.push(`Unknown piece: ${pieceId}`)
      continue
    }
    if (slotsSeen.has(piece.slot)) {
      errors.push(`Duplicate slot: ${piece.slot} (piece ${pieceId})`)
    }
    slotsSeen.add(piece.slot)
  }
  for (const required of [
    'hull',
    'propulsion',
    'life_support',
    'landing_gear',
  ] as ShipPieceSlot[]) {
    if (!slotsSeen.has(required)) errors.push(`Missing required slot: ${required}`)
  }
  return { valid: errors.length === 0, errors }
}

export function defaultBuildFromShipDef(def: ColonyShipDef): ColonyShipBuild {
  const tier = def.payloadTierRequired
  const hull =
    tier === 1
      ? 'hull-light'
      : tier === 2
        ? 'hull-standard'
        : tier === 3
          ? 'hull-heavy'
          : 'hull-colossal'
  const prop = tier <= 1 ? 'prop-chemical' : tier === 2 ? 'prop-fusion' : 'prop-antimatter'
  const life = tier <= 1 ? 'life-minimal' : tier === 2 ? 'life-standard' : 'life-luxe'
  const gear =
    def.darknessTier <= 1
      ? 'gear-none'
      : tier === 2
        ? 'gear-basic'
        : tier === 3
          ? 'gear-advanced'
          : 'gear-precision'
  const payload =
    def.payload.explosiveYield > 0
      ? 'payload-explosive'
      : def.payload.citizenCapacity > 0
        ? 'payload-citizens'
        : 'payload-cargo'
  const sensors = tier <= 1 ? 'sensors-basic' : tier === 2 ? 'sensors-laser-target' : 'sensors-auto'
  const weapons = def.payload.weaponPayload > 0 ? 'weapons-heavy' : 'weapons-none'
  const comms = tier <= 1 ? 'comms-radio' : 'comms-laser-align'
  return {
    buildId: `default-${String(def.id)}`,
    displayName: def.name,
    pieces: [hull, prop, life, gear, payload, sensors, weapons, comms],
  }
}

export interface CrashOutcome {
  readonly crashed: boolean
  readonly survivalRate: number
  readonly cargoLootRate: number
}

export function computeCrashOutcome(landingGearTier: 0 | 1 | 2 | 3): CrashOutcome {
  switch (landingGearTier) {
    case 0:
      return { crashed: true, survivalRate: 0.15, cargoLootRate: 0.85 }
    case 1:
      return { crashed: false, survivalRate: 0.7, cargoLootRate: 0.15 }
    case 2:
      return { crashed: false, survivalRate: 0.95, cargoLootRate: 0.0 }
    case 3:
      return { crashed: false, survivalRate: 1.0, cargoLootRate: 0.0 }
  }
}
