import { type ResourceId } from '../types/index'
import {
  RESOURCE_AMMUNITION,
  RESOURCE_ANTIMATTER,
  RESOURCE_COMPONENTS,
  RESOURCE_ELECTRONICS,
  RESOURCE_EXPLOSIVES,
  RESOURCE_FUEL,
  RESOURCE_FUSION_FUEL,
  RESOURCE_INGOTS,
  RESOURCE_MACHINERY,
  RESOURCE_PROPAGANDA_MATERIALS,
  RESOURCE_RARE_METALS,
} from './resources'

declare const __colonyShipBrand: unique symbol
type Brand<T, B> = T & { readonly [__colonyShipBrand]: B }

export type ColonyShipVariantId = Brand<string, 'ColonyShipVariantId'>
export const colonyShipVariantId = (s: string): ColonyShipVariantId => s as ColonyShipVariantId

export type DarknessTier = 1 | 2 | 3 | 4

export type ColonyShipCategory =
  | 'tier1Innocent'
  | 'tier2Discovery'
  | 'tier3Aggression'
  | 'tier4Eradication'
  | 'crossPeaceful'

export interface ColonyShipPayload {
  readonly citizenCapacity: number
  readonly cargoCapacity: number
  readonly weaponPayload: number
  readonly explosiveYield: number
}

export interface ColonyShipBuildCost {
  readonly resource: ResourceId
  readonly amount: number
}

// PHASE 16.32 — ship systems. Per user verbatim "and powered on the ship with batteries / or
// reactor / or solar // all shit works this way // crew needs to stay alive or it may be a
// empty hulk // just was a bomb waiting or is auto guidance attasck installed?". Every variant
// declares its power source + life-support capacity + auto-guidance + signal-range systems.
// tickFlight (colony-ship-flight.ts) drains these per tick and transitions to new phases
// STRANDED (out of signal range — calls for help that never comes) and EMPTY_HULK (crew dead
// + no auto-guidance — drifts on last-known velocity until it impacts a planet).
export type ShipPowerSource = 'battery' | 'reactor' | 'solar'

export interface ColonyShipDef {
  readonly id: ColonyShipVariantId
  readonly name: string
  readonly emoji: string
  readonly category: ColonyShipCategory
  readonly darknessTier: DarknessTier
  readonly payloadTierRequired: 1 | 2 | 3 | 4
  readonly description: string
  readonly buildCost: ReadonlyArray<ColonyShipBuildCost>
  readonly buildTimeTicks: number
  readonly fuelRequirement: number
  readonly ammoRequirement: number
  readonly payload: ColonyShipPayload
  readonly speedMultiplier: number
  readonly evasionMultiplier: number
  readonly canIntercept: boolean
  readonly suicideShip: boolean
  // PHASE 17.L.A.17 — derived flag. true when the variant has detonation intent baked in
  // (suicide ships / counter-interceptors / variants with explosive payload). Self-destruct
  // (mid-flight abort) requires BOTH this flag AND the launching civ having researched
  // TECH_SELF_DESTRUCT_SYSTEMS. Per user verbatim "researched and installed on the ship".
  readonly selfDestructCapable: boolean
  // PHASE 16.32 — ship systems config
  readonly powerSource: ShipPowerSource
  readonly powerCapacity: number
  readonly powerDrainPerTick: number
  readonly solarRegenPerTick: number
  readonly crewSupportTicks: number
  readonly autoGuidanceInstalled: boolean
  readonly signalRange: number
  // PHASE 17.J.5 — reactor fuel loading. Per user verbatim "and radioatives for rectors".
  // Reactor variants consume their tier-specific radioactive resource as a one-time launch
  // cost (loaded into the reactor before liftoff). Solar / battery variants have null. Tier 1
  // reactor ships use RESOURCE_RARE_METALS (uranium proxy); tier 2 use FUSION_FUEL; tier 3+
  // use ANTIMATTER. Validated at launch time and consumed from the launching planet's
  // inventory in parallel with the standard fuel / ammo / crew load.
  readonly reactorFuelType: ResourceId | null
  readonly reactorFuelAmount: number
}

export const SHIP_SCOUT = colonyShipVariantId('scout')
export const SHIP_SURVEYOR = colonyShipVariantId('surveyor')
export const SHIP_PROBE = colonyShipVariantId('probe')

export const SHIP_STANDARD = colonyShipVariantId('standard')
export const SHIP_LASER_BEACON = colonyShipVariantId('laserBeacon')
export const SHIP_DECOY = colonyShipVariantId('decoy')
export const SHIP_BOARDING = colonyShipVariantId('boarding')

export const SHIP_SABOTEUR = colonyShipVariantId('saboteur')
export const SHIP_EXPLOSIVE = colonyShipVariantId('explosive')
export const SHIP_HEAVY = colonyShipVariantId('heavy')
export const SHIP_COUNTER_COLONY = colonyShipVariantId('counterColony')

export const SHIP_PILGRIM_VOLUNTEER = colonyShipVariantId('pilgrimVolunteer')
export const SHIP_MASS_EVACUATION = colonyShipVariantId('massEvacuation')
export const SHIP_ORBITAL_WEAPON_PLATFORM = colonyShipVariantId('orbitalWeaponPlatform')
export const SHIP_FINAL_COLONY_SHIP = colonyShipVariantId('finalColonyShip')

export const SHIP_MINING = colonyShipVariantId('mining')
export const SHIP_REFUGEE = colonyShipVariantId('refugee')
export const SHIP_EMBASSY = colonyShipVariantId('embassy')
export const SHIP_RESUPPLY = colonyShipVariantId('resupply')

// PHASE 16.32 — raw catalog entries omit the ship-systems fields (powerSource / capacity /
// drain / regen / crewSupport / autoGuidance / signalRange). They're derived by deriveShipSystems
// below from the existing per-variant fields (citizenCapacity, fuelRequirement, canIntercept,
// id). Per-variant overrides handled inline. This keeps the catalog readable + the tuning
// rules in one place.
type ColonyShipDefRaw = Omit<
  ColonyShipDef,
  | 'powerSource'
  | 'powerCapacity'
  | 'powerDrainPerTick'
  | 'solarRegenPerTick'
  | 'crewSupportTicks'
  | 'autoGuidanceInstalled'
  | 'signalRange'
  | 'reactorFuelType'
  | 'reactorFuelAmount'
  | 'selfDestructCapable'
>

const COLONY_SHIPS_RAW: ReadonlyArray<ColonyShipDefRaw> = [
  {
    id: SHIP_SCOUT,
    name: 'Scout',
    emoji: '🛰️',
    category: 'tier1Innocent',
    darknessTier: 1,
    payloadTierRequired: 1,
    description: 'Auto-explore probe. Charts unknown planets. Returns biome + threat data.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 30 },
      { resource: RESOURCE_COMPONENTS, amount: 15 },
    ],
    buildTimeTicks: 60,
    fuelRequirement: 20,
    ammoRequirement: 0,
    payload: { citizenCapacity: 0, cargoCapacity: 5, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 1.6,
    evasionMultiplier: 1.4,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_SURVEYOR,
    name: 'Surveyor',
    emoji: '📡',
    category: 'tier1Innocent',
    darknessTier: 1,
    payloadTierRequired: 1,
    description: 'Stationary orbital surveyor. Maps planet hex tiles + flags resource hotspots.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 40 },
      { resource: RESOURCE_ELECTRONICS, amount: 20 },
    ],
    buildTimeTicks: 80,
    fuelRequirement: 25,
    ammoRequirement: 0,
    payload: { citizenCapacity: 0, cargoCapacity: 8, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 1.0,
    evasionMultiplier: 1.0,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_PROBE,
    name: 'Probe',
    emoji: '🔬',
    category: 'tier1Innocent',
    darknessTier: 1,
    payloadTierRequired: 1,
    description: 'Atmospheric probe. Reads enemy civ tech-tier signature.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 25 },
      { resource: RESOURCE_ELECTRONICS, amount: 25 },
    ],
    buildTimeTicks: 70,
    fuelRequirement: 22,
    ammoRequirement: 0,
    payload: { citizenCapacity: 0, cargoCapacity: 3, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 1.3,
    evasionMultiplier: 1.5,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_STANDARD,
    name: 'Standard Colony Ship',
    emoji: '🚀',
    category: 'tier2Discovery',
    darknessTier: 2,
    payloadTierRequired: 2,
    description:
      'Mid-size colony ship. Carries citizens + bootstrap resources to target planet. Mostly true.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 80 },
      { resource: RESOURCE_COMPONENTS, amount: 40 },
      { resource: RESOURCE_FUEL, amount: 30 },
    ],
    buildTimeTicks: 150,
    fuelRequirement: 60,
    ammoRequirement: 10,
    payload: { citizenCapacity: 200, cargoCapacity: 80, weaponPayload: 5, explosiveYield: 0 },
    speedMultiplier: 1.0,
    evasionMultiplier: 1.0,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_LASER_BEACON,
    name: 'Laser-Targeting Beacon',
    emoji: '🔦',
    category: 'tier2Discovery',
    darknessTier: 2,
    payloadTierRequired: 2,
    description:
      'Lands intact + activates ground-based laser. Guides follow-up colony ships with +30% accuracy.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 50 },
      { resource: RESOURCE_ELECTRONICS, amount: 50 },
    ],
    buildTimeTicks: 120,
    fuelRequirement: 45,
    ammoRequirement: 0,
    payload: { citizenCapacity: 20, cargoCapacity: 30, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 1.1,
    evasionMultiplier: 1.2,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_DECOY,
    name: 'Decoy',
    emoji: '🎭',
    category: 'tier2Discovery',
    darknessTier: 2,
    payloadTierRequired: 2,
    description:
      'Empty hull with telemetry mimic. Soaks up counter-missiles. Cheap, fast, expendable.',
    buildCost: [{ resource: RESOURCE_INGOTS, amount: 30 }],
    buildTimeTicks: 60,
    fuelRequirement: 20,
    ammoRequirement: 0,
    payload: { citizenCapacity: 0, cargoCapacity: 0, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 1.4,
    evasionMultiplier: 0.8,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_BOARDING,
    name: 'Boarding Ship',
    emoji: '🤝',
    category: 'tier2Discovery',
    darknessTier: 2,
    payloadTierRequired: 2,
    description:
      'Armed citizens take over enemy installations on landing. Diplomatic-by-day, takeover-by-night.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 60 },
      { resource: RESOURCE_COMPONENTS, amount: 30 },
      { resource: RESOURCE_AMMUNITION, amount: 40 },
    ],
    buildTimeTicks: 130,
    fuelRequirement: 50,
    ammoRequirement: 60,
    payload: { citizenCapacity: 80, cargoCapacity: 40, weaponPayload: 60, explosiveYield: 0 },
    speedMultiplier: 1.0,
    evasionMultiplier: 1.0,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_SABOTEUR,
    name: 'Saboteur',
    emoji: '💣',
    category: 'tier3Aggression',
    darknessTier: 3,
    payloadTierRequired: 3,
    description: 'Lands + plants explosives in target infrastructure. Disables enemy production.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 70 },
      { resource: RESOURCE_EXPLOSIVES, amount: 50 },
      { resource: RESOURCE_ELECTRONICS, amount: 30 },
    ],
    buildTimeTicks: 160,
    fuelRequirement: 55,
    ammoRequirement: 30,
    payload: { citizenCapacity: 30, cargoCapacity: 20, weaponPayload: 30, explosiveYield: 100 },
    speedMultiplier: 1.2,
    evasionMultiplier: 1.3,
    canIntercept: false,
    suicideShip: true,
  },
  {
    id: SHIP_EXPLOSIVE,
    name: 'Explosive',
    emoji: '💥',
    category: 'tier3Aggression',
    darknessTier: 3,
    payloadTierRequired: 3,
    description: 'Massive payload. Suicide-strike. Devastates target tile + adjacent ring.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 100 },
      { resource: RESOURCE_EXPLOSIVES, amount: 200 },
      { resource: RESOURCE_FUEL, amount: 80 },
    ],
    buildTimeTicks: 200,
    fuelRequirement: 80,
    ammoRequirement: 0,
    payload: { citizenCapacity: 0, cargoCapacity: 0, weaponPayload: 0, explosiveYield: 500 },
    speedMultiplier: 0.8,
    evasionMultiplier: 0.6,
    canIntercept: false,
    suicideShip: true,
  },
  {
    id: SHIP_HEAVY,
    name: 'Heavy Colony Ship',
    emoji: '🛳️',
    category: 'tier3Aggression',
    darknessTier: 3,
    payloadTierRequired: 3,
    description:
      'Larger crew + cargo + fuel for longer durations. The propaganda is starting to fray.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 150 },
      { resource: RESOURCE_COMPONENTS, amount: 80 },
      { resource: RESOURCE_MACHINERY, amount: 30 },
      { resource: RESOURCE_FUEL, amount: 100 },
    ],
    buildTimeTicks: 280,
    fuelRequirement: 120,
    ammoRequirement: 50,
    payload: { citizenCapacity: 600, cargoCapacity: 200, weaponPayload: 30, explosiveYield: 0 },
    speedMultiplier: 0.7,
    evasionMultiplier: 0.7,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_COUNTER_COLONY,
    name: 'Counter-Colony',
    emoji: '🛡️',
    category: 'tier3Aggression',
    darknessTier: 3,
    payloadTierRequired: 3,
    description: 'Intercepts incoming enemy colony ships mid-flight. Defensive specialist.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 60 },
      { resource: RESOURCE_FUEL, amount: 40 },
      { resource: RESOURCE_AMMUNITION, amount: 80 },
      { resource: RESOURCE_ELECTRONICS, amount: 30 },
    ],
    buildTimeTicks: 140,
    fuelRequirement: 50,
    ammoRequirement: 100,
    payload: { citizenCapacity: 0, cargoCapacity: 10, weaponPayload: 100, explosiveYield: 50 },
    speedMultiplier: 1.5,
    evasionMultiplier: 1.4,
    canIntercept: true,
    suicideShip: false,
  },
  {
    id: SHIP_PILGRIM_VOLUNTEER,
    name: 'Pilgrim Volunteer',
    emoji: '🕊️',
    category: 'tier4Eradication',
    darknessTier: 4,
    payloadTierRequired: 4,
    description:
      'Tier 4-5 citizens "eagerly volunteer" — propaganda elevated them too well. One-way trip; the propaganda dresses it up.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 200 },
      { resource: RESOURCE_FUSION_FUEL, amount: 80 },
      { resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 150 },
    ],
    buildTimeTicks: 260,
    fuelRequirement: 100,
    ammoRequirement: 0,
    payload: { citizenCapacity: 1500, cargoCapacity: 100, weaponPayload: 0, explosiveYield: 800 },
    speedMultiplier: 1.0,
    evasionMultiplier: 0.8,
    canIntercept: false,
    suicideShip: true,
  },
  {
    id: SHIP_MASS_EVACUATION,
    name: 'Mass Evacuation',
    emoji: '🌆',
    category: 'tier4Eradication',
    darknessTier: 4,
    payloadTierRequired: 4,
    description:
      'Industrial-scale relocation framing. Citizens told their world is dying. Massive payload.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 300 },
      { resource: RESOURCE_FUSION_FUEL, amount: 150 },
      { resource: RESOURCE_MACHINERY, amount: 100 },
    ],
    buildTimeTicks: 350,
    fuelRequirement: 180,
    ammoRequirement: 0,
    payload: { citizenCapacity: 5000, cargoCapacity: 500, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 0.6,
    evasionMultiplier: 0.5,
    canIntercept: false,
    suicideShip: true,
  },
  {
    id: SHIP_ORBITAL_WEAPON_PLATFORM,
    name: 'Orbital Weapon Platform',
    emoji: '🛰️',
    category: 'tier4Eradication',
    darknessTier: 4,
    payloadTierRequired: 4,
    description:
      'Settles into orbit and rains down kinetic strikes. UMS BLACKOUT_SAT auto-conversion carryover.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 250 },
      { resource: RESOURCE_FUSION_FUEL, amount: 120 },
      { resource: RESOURCE_AMMUNITION, amount: 200 },
      { resource: RESOURCE_EXPLOSIVES, amount: 100 },
    ],
    buildTimeTicks: 320,
    fuelRequirement: 140,
    ammoRequirement: 250,
    payload: { citizenCapacity: 50, cargoCapacity: 100, weaponPayload: 300, explosiveYield: 200 },
    speedMultiplier: 1.0,
    evasionMultiplier: 1.0,
    canIntercept: true,
    suicideShip: false,
  },
  {
    id: SHIP_FINAL_COLONY_SHIP,
    name: 'The Final Colony Ship',
    emoji: '🌌',
    category: 'tier4Eradication',
    darknessTier: 4,
    payloadTierRequired: 4,
    description:
      'End-game apex. Antimatter-driven. Devastates everything in target hex + 2-ring radius. The propaganda is now baroque.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 400 },
      { resource: RESOURCE_ANTIMATTER, amount: 50 },
      { resource: RESOURCE_FUSION_FUEL, amount: 200 },
      { resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 300 },
    ],
    buildTimeTicks: 500,
    fuelRequirement: 250,
    ammoRequirement: 100,
    payload: { citizenCapacity: 800, cargoCapacity: 200, weaponPayload: 500, explosiveYield: 2000 },
    speedMultiplier: 1.2,
    evasionMultiplier: 0.9,
    canIntercept: false,
    suicideShip: true,
  },
  {
    id: SHIP_MINING,
    name: 'Mining Colony Ship',
    emoji: '⛏️',
    category: 'crossPeaceful',
    darknessTier: 1,
    payloadTierRequired: 2,
    description:
      'Auto-shuttle mining crew + extractor. UMS UnityBeacon shuttle-cycle carryover with multi-planet rotation, auto-recall, fleet auto-balancing. Returns with cargo.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 100 },
      { resource: RESOURCE_FUEL, amount: 80 },
      { resource: RESOURCE_MACHINERY, amount: 50 },
    ],
    buildTimeTicks: 200,
    fuelRequirement: 100,
    ammoRequirement: 0,
    payload: { citizenCapacity: 30, cargoCapacity: 400, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 0.9,
    evasionMultiplier: 0.7,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_REFUGEE,
    name: 'Refugee',
    emoji: '🚑',
    category: 'crossPeaceful',
    darknessTier: 1,
    payloadTierRequired: 2,
    description:
      'Genuine evacuation when player loses a planet. Citizens flee to nearest friendly + boost loyalty there.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 60 },
      { resource: RESOURCE_FUEL, amount: 40 },
    ],
    buildTimeTicks: 100,
    fuelRequirement: 40,
    ammoRequirement: 0,
    payload: { citizenCapacity: 400, cargoCapacity: 50, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 1.2,
    evasionMultiplier: 1.0,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_EMBASSY,
    name: 'Embassy',
    emoji: '📜',
    category: 'crossPeaceful',
    darknessTier: 1,
    payloadTierRequired: 2,
    description:
      'Diplomatic mission. Opens trade channel + reduces hostile diplomacy stance over time.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 50 },
      { resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 60 },
      { resource: RESOURCE_ELECTRONICS, amount: 20 },
    ],
    buildTimeTicks: 110,
    fuelRequirement: 35,
    ammoRequirement: 0,
    payload: { citizenCapacity: 30, cargoCapacity: 40, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 1.1,
    evasionMultiplier: 1.0,
    canIntercept: false,
    suicideShip: false,
  },
  {
    id: SHIP_RESUPPLY,
    name: 'Resupply',
    emoji: '📦',
    category: 'crossPeaceful',
    darknessTier: 1,
    payloadTierRequired: 2,
    description:
      'Cargo-only run between owned planets. Bypasses inter-planet inventory limit by special exemption.',
    buildCost: [
      { resource: RESOURCE_INGOTS, amount: 70 },
      { resource: RESOURCE_FUEL, amount: 50 },
    ],
    buildTimeTicks: 130,
    fuelRequirement: 60,
    ammoRequirement: 0,
    payload: { citizenCapacity: 0, cargoCapacity: 600, weaponPayload: 0, explosiveYield: 0 },
    speedMultiplier: 0.8,
    evasionMultiplier: 0.8,
    canIntercept: false,
    suicideShip: false,
  },
]

// PHASE 16.32 — derive ship-systems fields from existing per-variant tunables. Heuristic with
// per-variant overrides. Per user verbatim 2026-05-11 "all shit works this way" — every variant
// gets a power source + life support + auto-guidance + signalRange.
function deriveShipSystems(raw: ColonyShipDefRaw): ColonyShipDef {
  // Power source assignment:
  // - solar: long-duration auto-shuttles + orbital platforms + survey/beacon variants that
  //   stay deployed for sustained periods (Mining, Surveyor, OrbitalWeaponPlatform, LaserBeacon)
  // - battery: short-range disposables that don't need long endurance (Scout, Probe, Decoy,
  //   Explosive)
  // - reactor: everything else (citizen-bearing colony ships, counter-missiles, etc.)
  let powerSource: ShipPowerSource = 'reactor'
  if (
    raw.id === SHIP_MINING ||
    raw.id === SHIP_SURVEYOR ||
    raw.id === SHIP_ORBITAL_WEAPON_PLATFORM ||
    raw.id === SHIP_LASER_BEACON
  ) {
    powerSource = 'solar'
  } else if (
    raw.id === SHIP_DECOY ||
    raw.id === SHIP_SCOUT ||
    raw.id === SHIP_PROBE ||
    raw.id === SHIP_EXPLOSIVE
  ) {
    powerSource = 'battery'
  }

  // Power capacity scales with fuel requirement (proxy for mission duration). Reactor variants
  // get a +50% multiplier (long-haul); solar variants get +100% (sustainable indefinitely with
  // regen); batteries stay at base (short missions).
  const baseCapacity = Math.max(40, raw.fuelRequirement * 2)
  const capacityMult = powerSource === 'reactor' ? 1.5 : powerSource === 'solar' ? 2 : 1
  const powerCapacity = Math.round(baseCapacity * capacityMult)

  // Drain rate: batteries burn fast (short ops); reactors steady; solar slow (efficient).
  const powerDrainPerTick = powerSource === 'battery' ? 1.5 : powerSource === 'solar' ? 0.5 : 1
  const solarRegenPerTick = powerSource === 'solar' ? 0.6 : 0

  // Crew life support — only matters if crew is aboard. 60-tick base + 1 tick per 10 citizens
  // (denser ships need proportionally more supplies).
  const crewSupportTicks =
    raw.payload.citizenCapacity > 0 ? 60 + Math.floor(raw.payload.citizenCapacity / 10) : 0

  // Auto-guidance — installed when ship is unmanned (canIntercept variants are autonomous
  // interceptors; cargo-only resupply runs auto). When citizens crew the ship they pilot it
  // themselves; without auto-guidance + dead crew = empty hulk drifts.
  const autoGuidanceInstalled = raw.payload.citizenCapacity === 0 || raw.canIntercept

  // Signal range — distance from launching civ's nearest owned planet beyond which the ship
  // goes STRANDED (UMS antennaRange concept, .claude/SMOL_REFERENCE_TRAJECTORY §11). Higher-
  // tier ships have stronger comm gear: solar variants (constellation/relay-style) get the
  // longest range; counter-missiles get the shortest (they're meant to die mid-flight anyway).
  let signalRange = 5500
  if (powerSource === 'solar') signalRange = 9000
  else if (raw.canIntercept) signalRange = 4500
  else if (raw.payload.citizenCapacity > 0) signalRange = 6500

  // PHASE 17.J.5 — reactor fuel loading. Only reactor variants need it (solar / battery don't).
  // Tier mapping: payloadTierRequired 1-2 → fission (RARE_METALS), 3 → fusion (FUSION_FUEL),
  // 4 → antimatter (ANTIMATTER). Amount scales with powerCapacity × 0.05 (rounded up). Solar /
  // battery ships set both fields to null/0 so the launch validator skips them.
  let reactorFuelType: ResourceId | null = null
  let reactorFuelAmount = 0
  if (powerSource === 'reactor') {
    if (raw.payloadTierRequired >= 4) {
      reactorFuelType = RESOURCE_ANTIMATTER
    } else if (raw.payloadTierRequired === 3) {
      reactorFuelType = RESOURCE_FUSION_FUEL
    } else {
      reactorFuelType = RESOURCE_RARE_METALS
    }
    reactorFuelAmount = Math.max(1, Math.ceil(powerCapacity * 0.05))
  }

  // PHASE 17.L.A.17 — derive selfDestructCapable from existing per-variant flags. Anything
  // with detonation intent baked in: suicide ships, counter-interceptors, explosive payloads,
  // or weapon-payload variants. Scouts / surveyors / mining / refugee / embassy / resupply
  // ships are NOT capable — they have no warhead, no detonator, no explosive cargo. The
  // tech research is the SECOND condition; this flag is the per-variant capability.
  const selfDestructCapable =
    raw.suicideShip ||
    raw.canIntercept ||
    raw.payload.explosiveYield > 0 ||
    raw.payload.weaponPayload > 0

  return {
    ...raw,
    powerSource,
    powerCapacity,
    powerDrainPerTick,
    solarRegenPerTick,
    crewSupportTicks,
    autoGuidanceInstalled,
    signalRange,
    reactorFuelType,
    reactorFuelAmount,
    selfDestructCapable,
  }
}

export const COLONY_SHIPS: ReadonlyArray<ColonyShipDef> = COLONY_SHIPS_RAW.map(deriveShipSystems)

const COLONY_SHIP_INDEX: ReadonlyMap<ColonyShipVariantId, ColonyShipDef> = new Map(
  COLONY_SHIPS.map((s) => [s.id, s]),
)

export function getColonyShipDef(id: ColonyShipVariantId): ColonyShipDef {
  const def = COLONY_SHIP_INDEX.get(id)
  if (!def) throw new Error(`Unknown colony ship variant: ${String(id)}`)
  return def
}

export function colonyShipsByTier(tier: DarknessTier): ReadonlyArray<ColonyShipDef> {
  return COLONY_SHIPS.filter((s) => s.darknessTier === tier)
}

export function colonyShipsByCategory(category: ColonyShipCategory): ReadonlyArray<ColonyShipDef> {
  return COLONY_SHIPS.filter((s) => s.category === category)
}

export function colonyShipsByPayloadTier(payloadTier: 1 | 2 | 3 | 4): ReadonlyArray<ColonyShipDef> {
  return COLONY_SHIPS.filter((s) => s.payloadTierRequired <= payloadTier)
}

export function isColonyShipUnlocked(
  variantId: ColonyShipVariantId,
  unlockedVariantNames: ReadonlySet<string>,
  maxPayloadTier: 0 | 1 | 2 | 3 | 4,
): boolean {
  const def = getColonyShipDef(variantId)
  if (def.payloadTierRequired > maxPayloadTier) return false
  return unlockedVariantNames.has(def.name) || unlockedVariantNames.has(def.id as unknown as string)
}
