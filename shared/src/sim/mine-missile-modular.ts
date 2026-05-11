import { type CivId, type PlanetId, type Vec3 } from '../types/index'
import { type DeathLedger, recordDeath } from './death'

export type MineCrewState = 'crewed' | 'auto_pilot' | 'marooned' | 'dead'

export interface ModularMineConfig {
  readonly mineId: string
  readonly planetId: PlanetId
  readonly civId: CivId
  readonly position: Vec3
  readonly batteryCapacity: number
  readonly fuelCapacity: number
  readonly hasAutoGuidance: boolean
  readonly initialCrewCount: number
  readonly maxCrewCount: number
  readonly detonationRadius: number
}

export interface ModularMineState {
  readonly config: ModularMineConfig
  battery: number
  fuel: number
  crewCount: number
  crewState: MineCrewState
  detonationsRemaining: number
  marronedSinceTick: number | null
}

export const MINE_BATTERY_DRAIN_PER_TICK = 0.05
export const MINE_FUEL_DRAIN_PER_DETONATION = 8
export const MINE_RECHARGE_PER_TICK_WITH_CREW = 0.4
export const MINE_AUTO_PILOT_DRAIN_BONUS = 0.08

export function newModularMine(
  config: ModularMineConfig,
  initialBatteryRatio = 1.0,
  initialFuelRatio = 1.0,
): ModularMineState {
  return {
    config,
    battery: config.batteryCapacity * initialBatteryRatio,
    fuel: config.fuelCapacity * initialFuelRatio,
    crewCount: config.initialCrewCount,
    crewState:
      config.initialCrewCount > 0 ? 'crewed' : config.hasAutoGuidance ? 'auto_pilot' : 'marooned',
    detonationsRemaining: Math.floor(config.fuelCapacity / MINE_FUEL_DRAIN_PER_DETONATION),
    marronedSinceTick: null,
  }
}

export interface MineTickInputs {
  readonly currentTick: number
  readonly mine: ModularMineState
  readonly ledger: DeathLedger
}

export function tickMineState(inputs: MineTickInputs): void {
  const m = inputs.mine
  if (m.crewCount > 0) {
    m.battery = Math.min(m.config.batteryCapacity, m.battery + MINE_RECHARGE_PER_TICK_WITH_CREW)
  } else {
    if (m.crewState === 'auto_pilot') {
      m.battery = Math.max(
        0,
        m.battery - (MINE_BATTERY_DRAIN_PER_TICK + MINE_AUTO_PILOT_DRAIN_BONUS),
      )
    } else {
      m.battery = Math.max(0, m.battery - MINE_BATTERY_DRAIN_PER_TICK)
    }
  }

  if (m.crewCount > 0 && m.fuel <= 0 && m.battery <= 0) {
    if (m.marronedSinceTick === null) m.marronedSinceTick = inputs.currentTick
    m.crewState = 'marooned'
    if (inputs.currentTick - (m.marronedSinceTick ?? inputs.currentTick) > 200) {
      const crewLost = m.crewCount
      m.crewCount = 0
      m.crewState = 'dead'
      recordDeath(inputs.ledger, {
        tick: inputs.currentTick,
        planetId: m.config.planetId,
        cause: 'no_air',
        count: crewLost,
        tier: null,
        note: `mine ${m.config.mineId} crew marooned + lost`,
      })
    }
  } else if (m.crewCount === 0 && !m.config.hasAutoGuidance) {
    m.crewState = 'marooned'
  } else if (m.crewCount === 0 && m.battery > 0) {
    m.crewState = 'auto_pilot'
  } else if (m.crewCount > 0) {
    m.crewState = 'crewed'
  }
}

export function mineCanDetonate(mine: ModularMineState): boolean {
  if (mine.detonationsRemaining <= 0) return false
  if (mine.fuel < MINE_FUEL_DRAIN_PER_DETONATION) return false
  if (mine.crewState === 'dead' || mine.crewState === 'marooned') return false
  if (mine.battery < 0.2 * mine.config.batteryCapacity && mine.crewCount === 0) return false
  return true
}

export function consumeMineDetonation(mine: ModularMineState): boolean {
  if (!mineCanDetonate(mine)) return false
  mine.fuel = Math.max(0, mine.fuel - MINE_FUEL_DRAIN_PER_DETONATION)
  mine.battery = Math.max(0, mine.battery - 0.15 * mine.config.batteryCapacity)
  mine.detonationsRemaining -= 1
  return true
}

export interface ModularMissileConfig {
  readonly missileId: string
  readonly civId: CivId
  readonly fromPlanetId: PlanetId
  readonly batteryCapacity: number
  readonly fuelCapacity: number
  readonly hasAutoGuidance: boolean
  readonly hasLaserAlign: boolean
  readonly crewCount: number
  readonly maxCrewCount: number
  readonly explosivePayload: number
  readonly speedMultiplier: number
}

export interface ModularMissileState {
  readonly config: ModularMissileConfig
  battery: number
  fuel: number
  crewCount: number
  crewState: MineCrewState
  contactLost: boolean
  ticksFlown: number
}

export function newModularMissile(config: ModularMissileConfig): ModularMissileState {
  return {
    config,
    battery: config.batteryCapacity,
    fuel: config.fuelCapacity,
    crewCount: config.crewCount,
    crewState: config.crewCount > 0 ? 'crewed' : config.hasAutoGuidance ? 'auto_pilot' : 'marooned',
    contactLost: false,
    ticksFlown: 0,
  }
}

export interface MissileTickInputs {
  readonly missile: ModularMissileState
  readonly currentTick: number
  readonly ledger: DeathLedger
  readonly homeSignalRangeTicks: number
}

export function tickModularMissile(inputs: MissileTickInputs): void {
  const m = inputs.missile
  m.ticksFlown += 1
  m.fuel = Math.max(0, m.fuel - 1)
  m.battery = Math.max(0, m.battery - MINE_BATTERY_DRAIN_PER_TICK)

  if (m.crewCount > 0 && m.fuel <= 0) {
    const lost = m.crewCount
    m.crewCount = 0
    recordDeath(inputs.ledger, {
      tick: inputs.currentTick,
      planetId: null,
      cause: 'no_air',
      count: lost,
      tier: null,
      note: `missile ${m.config.missileId} crew lost — fuel exhausted`,
    })
    m.crewState = m.config.hasAutoGuidance ? 'auto_pilot' : 'dead'
  }

  if (m.config.hasLaserAlign) {
    m.contactLost = false
  } else {
    m.contactLost = m.ticksFlown > inputs.homeSignalRangeTicks
  }
}

export function missileCanDetonate(missile: ModularMissileState): boolean {
  if (missile.config.explosivePayload <= 0) return false
  if (missile.crewState === 'dead' && !missile.config.hasAutoGuidance) return false
  return missile.fuel > 0 || missile.crewState === 'auto_pilot'
}
