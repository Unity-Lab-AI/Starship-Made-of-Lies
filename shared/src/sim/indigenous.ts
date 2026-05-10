import { type CivId, type PlanetId, type TileId, civId as civIdValue } from '../types/index'
import { type Planet } from '../gen/planet'
import { type Tile } from './tile'
import { type IndigenousHostility } from './theme-polish'

export interface IndigenousCiv {
  readonly civId: CivId
  readonly homePlanetId: PlanetId
  readonly hostHumanCivId: CivId
  readonly hostility: IndigenousHostility
  readonly displayName: string
  readonly emoji: string
  controlledTileIds: Set<TileId>
  alive: boolean
  attacksAttempted: number
  attacksSucceeded: number
  parleysAccepted: number
}

export interface SpawnIndigenousInputs {
  readonly hostHumanCivId: CivId
  readonly homePlanet: Planet
  readonly hostility: IndigenousHostility
  readonly themeName: string
  readonly rng: () => number
  readonly tilesPerSpawn?: number
}

const DEFAULT_TILES_PER_SPAWN = 8

const HOSTILE_NAMES = [
  'Native Resistance',
  'The First Inhabitants',
  'Pre-Colonial Holdouts',
  'The Soil-Born',
  'The Old Ones',
] as const

const ALLIED_NAMES = [
  'Welcoming Locals',
  'Friendly Indigenes',
  'The Greeters',
  'The Hosts',
] as const

const NEUTRAL_NAMES = [
  'Indigenous Tribes',
  'The Locals',
  'Original Inhabitants',
  'The Settled Folk',
] as const

const HOSTILE_EMOJIS = ['🪓', '🏹', '⚔️', '🛡️']
const ALLIED_EMOJIS = ['🤝', '🌾', '🕊️']
const NEUTRAL_EMOJIS = ['🪶', '🏘️', '🌳']

function pickName(hostility: IndigenousHostility, rng: () => number, themeName: string): string {
  const list =
    hostility === 'hostile' ? HOSTILE_NAMES : hostility === 'allied' ? ALLIED_NAMES : NEUTRAL_NAMES
  const idx = Math.floor(rng() * list.length)
  return `${list[idx] ?? list[0]!} of ${themeName}`
}

function pickEmoji(hostility: IndigenousHostility, rng: () => number): string {
  const list =
    hostility === 'hostile'
      ? HOSTILE_EMOJIS
      : hostility === 'allied'
        ? ALLIED_EMOJIS
        : NEUTRAL_EMOJIS
  const idx = Math.floor(rng() * list.length)
  return list[idx] ?? '🪶'
}

export function spawnIndigenousCiv(inputs: SpawnIndigenousInputs): IndigenousCiv | null {
  const tilesPerSpawn = inputs.tilesPerSpawn ?? DEFAULT_TILES_PER_SPAWN
  const emptyTiles = inputs.homePlanet.tiles.filter((t) => t.occupancy === 'empty' && !t.ownerCivId)
  if (emptyTiles.length === 0) return null

  const indigCivId = civIdValue(
    `indig-${String(inputs.homePlanet.id)}-${String(inputs.hostHumanCivId)}`,
  )
  const controlled = new Set<TileId>()
  const target = Math.min(tilesPerSpawn, emptyTiles.length)
  const pool = [...emptyTiles]
  for (let i = 0; i < target; i++) {
    const idx = Math.floor(inputs.rng() * pool.length)
    const tile = pool[idx]
    if (!tile) continue
    pool.splice(idx, 1)
    tile.ownerCivId = indigCivId
    controlled.add(tile.id)
  }

  return {
    civId: indigCivId,
    homePlanetId: inputs.homePlanet.id,
    hostHumanCivId: inputs.hostHumanCivId,
    hostility: inputs.hostility,
    displayName: pickName(inputs.hostility, inputs.rng, inputs.themeName),
    emoji: pickEmoji(inputs.hostility, inputs.rng),
    controlledTileIds: controlled,
    alive: true,
    attacksAttempted: 0,
    attacksSucceeded: 0,
    parleysAccepted: 0,
  }
}

export interface IndigenousAttackInputs {
  readonly indig: IndigenousCiv
  readonly hostPlanetTiles: ReadonlyArray<Tile>
  readonly hostHumanCivId: CivId
  readonly currentTick: number
  readonly rng: () => number
}

export interface IndigenousAttackResult {
  readonly attacked: boolean
  readonly tileLostByHost: TileId | null
  readonly attemptCount: number
}

const HOSTILE_ATTACK_INTERVAL_TICKS = 80

export function tickIndigenousAttacks(inputs: IndigenousAttackInputs): IndigenousAttackResult {
  if (!inputs.indig.alive) return { attacked: false, tileLostByHost: null, attemptCount: 0 }
  if (inputs.indig.hostility !== 'hostile') {
    return { attacked: false, tileLostByHost: null, attemptCount: 0 }
  }
  if (inputs.currentTick % HOSTILE_ATTACK_INTERVAL_TICKS !== 0) {
    return { attacked: false, tileLostByHost: null, attemptCount: 0 }
  }
  inputs.indig.attacksAttempted += 1
  const hostTiles = inputs.hostPlanetTiles.filter(
    (t) => t.ownerCivId === inputs.hostHumanCivId && t.occupancy !== 'mineField',
  )
  if (hostTiles.length === 0) {
    return { attacked: true, tileLostByHost: null, attemptCount: inputs.indig.attacksAttempted }
  }
  if (inputs.rng() > 0.35) {
    return { attacked: true, tileLostByHost: null, attemptCount: inputs.indig.attacksAttempted }
  }
  const targetIdx = Math.floor(inputs.rng() * hostTiles.length)
  const target = hostTiles[targetIdx]
  if (!target) {
    return { attacked: true, tileLostByHost: null, attemptCount: inputs.indig.attacksAttempted }
  }
  target.ownerCivId = inputs.indig.civId
  target.occupancy = 'empty'
  inputs.indig.controlledTileIds.add(target.id)
  inputs.indig.attacksSucceeded += 1
  return {
    attacked: true,
    tileLostByHost: target.id,
    attemptCount: inputs.indig.attacksAttempted,
  }
}

export interface IndigenousParleyInputs {
  readonly indig: IndigenousCiv
  readonly currentTick: number
  readonly propagandaPower: number
}

export interface IndigenousParleyResult {
  readonly accepted: boolean
  readonly defectingTiles: ReadonlyArray<TileId>
}

export function attemptIndigenousParley(inputs: IndigenousParleyInputs): IndigenousParleyResult {
  if (!inputs.indig.alive) return { accepted: false, defectingTiles: [] }
  const acceptThreshold =
    inputs.indig.hostility === 'allied' ? 0.05 : inputs.indig.hostility === 'neutral' ? 0.18 : 0.45
  if (inputs.propagandaPower < acceptThreshold) {
    return { accepted: false, defectingTiles: [] }
  }
  const defectingCount = Math.min(2, inputs.indig.controlledTileIds.size)
  if (defectingCount === 0) return { accepted: false, defectingTiles: [] }
  const tileIds = Array.from(inputs.indig.controlledTileIds).slice(0, defectingCount)
  for (const tid of tileIds) inputs.indig.controlledTileIds.delete(tid)
  inputs.indig.parleysAccepted += 1
  if (inputs.indig.controlledTileIds.size === 0) inputs.indig.alive = false
  return { accepted: true, defectingTiles: tileIds }
}

export function isIndigenousCleared(indig: IndigenousCiv): boolean {
  return !indig.alive || indig.controlledTileIds.size === 0
}

export function indigenousLootOnDefeat(indig: IndigenousCiv): {
  readonly resourceBonus: number
  readonly ancientTechChance: number
} {
  const baseBonus = indig.hostility === 'hostile' ? 200 : indig.hostility === 'neutral' ? 80 : 30
  const ancientChance = indig.hostility === 'hostile' ? 0.25 : 0.05
  return { resourceBonus: baseBonus, ancientTechChance: ancientChance }
}
