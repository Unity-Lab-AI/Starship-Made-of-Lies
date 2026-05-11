import { type BuildingDefId } from '../types/index'
import { type BiomeDef } from '../gen/biome'
import {
  BLDG_AQUEDUCT,
  BLDG_COUNTER_MISSILE,
  BLDG_FARM,
  BLDG_LAUNCH_PAD,
  BLDG_LUMBER_CAMP,
  BLDG_MINE,
  BLDG_MINE_FIELD,
  BLDG_MINING_OUTPOST,
  BLDG_QUARRY,
  BLDG_SOLAR_ARRAY,
  getBuildingDef,
} from './building'
import { type Empire, isTechResearchable } from './empire'
import { aggregateEffects, TECH_NODES, type TechId, type TechNode } from './tech'
import { type Tile, type TileOccupancy } from './tile'

export interface PlacementContext {
  readonly tile: Tile
  readonly biome: BiomeDef
  readonly buildingDefId: BuildingDefId
  readonly civResearchedTechs: ReadonlySet<TechId>
}

export type PlacementRejectionReason =
  | 'tile-occupied'
  | 'biome-incompatible'
  | 'tech-locked'
  | 'unknown-building'

export interface PlacementResult {
  readonly canPlace: boolean
  readonly reason?: PlacementRejectionReason
  readonly detail?: string
}

const BIOME_REQUIREMENTS: ReadonlyMap<BuildingDefId, ReadonlyArray<string>> = new Map([
  [BLDG_FARM, ['food']],
  [BLDG_AQUEDUCT, ['water']],
  [BLDG_LUMBER_CAMP, ['wood']],
  [BLDG_QUARRY, ['stone']],
  [BLDG_MINE, ['metals', 'rareMetals']],
  [BLDG_MINING_OUTPOST, ['metals', 'rareMetals']],
  [BLDG_SOLAR_ARRAY, ['energy']],
])

const SPECIAL_OCCUPANCY: ReadonlyMap<BuildingDefId, TileOccupancy> = new Map([
  [BLDG_LAUNCH_PAD, 'launchPad'],
  [BLDG_MINE, 'mine'],
  [BLDG_MINE_FIELD, 'mineField'],
  [BLDG_COUNTER_MISSILE, 'counterMissilePad'],
])

export function specialOccupancyFor(buildingDefId: BuildingDefId): TileOccupancy {
  return SPECIAL_OCCUPANCY.get(buildingDefId) ?? 'building'
}

export function canPlaceBuildingOnTile(ctx: PlacementContext): PlacementResult {
  let buildingDef
  try {
    buildingDef = getBuildingDef(ctx.buildingDefId)
  } catch {
    return { canPlace: false, reason: 'unknown-building' }
  }
  if (ctx.tile.occupancy !== 'empty') {
    return {
      canPlace: false,
      reason: 'tile-occupied',
      detail: `Tile occupied by ${ctx.tile.occupancy}`,
    }
  }
  const requiredHints = BIOME_REQUIREMENTS.get(ctx.buildingDefId)
  if (requiredHints && requiredHints.length > 0) {
    const supports = requiredHints.some((hint) => (ctx.biome.resourceHints[hint] ?? 0) > 0.3)
    if (!supports) {
      return {
        canPlace: false,
        reason: 'biome-incompatible',
        detail: `${buildingDef.name} needs biome with one of: ${requiredHints.join(', ')}`,
      }
    }
  }
  const aggregated = aggregateEffects(ctx.civResearchedTechs)
  const requiresTechUnlock = isBuildingTechGated(ctx.buildingDefId)
  if (requiresTechUnlock && !aggregated.unlockedBuildings.has(ctx.buildingDefId)) {
    return {
      canPlace: false,
      reason: 'tech-locked',
      detail: `${buildingDef.name} requires unlocking via the tech tree`,
    }
  }
  return { canPlace: true }
}

const TECH_GATED_BUILDINGS: ReadonlySet<string> = new Set([
  'lumberCamp',
  'quarry',
  'mine',
  'refinery',
  'foundry',
  'factory',
  'lab',
  'university',
  'reeducationCenter',
  'corpPromotionsOffice',
  'tvStation',
  'powerPlant',
  'launchPad',
  'counterMissilePad',
  // PHASE 17.B + super-review fix: miningOutpost INTENTIONALLY ungated. Per the new economy
  // (17.B.2) miners are produced by outposts, not given for free at match start. Gating the
  // outpost behind tech meant no civ could mine until they researched tier-2 — economy
  // starved before launch. Outpost is now foundational, available from match start.
])

function isBuildingTechGated(buildingDefId: BuildingDefId): boolean {
  return TECH_GATED_BUILDINGS.has(buildingDefId as unknown as string)
}

export function listPlaceableBuildings(
  tile: Tile,
  biome: BiomeDef,
  civResearchedTechs: ReadonlySet<TechId>,
  candidates: ReadonlyArray<BuildingDefId>,
): ReadonlyArray<BuildingDefId> {
  const out: BuildingDefId[] = []
  for (const buildingDefId of candidates) {
    const result = canPlaceBuildingOnTile({ tile, biome, buildingDefId, civResearchedTechs })
    if (result.canPlace) out.push(buildingDefId)
  }
  return out
}

export function isBuildingUnlocked(
  buildingDefId: BuildingDefId,
  researchedTechs: ReadonlySet<TechId>,
): boolean {
  if (!isBuildingTechGated(buildingDefId)) return true
  return aggregateEffects(researchedTechs).unlockedBuildings.has(buildingDefId)
}

export function unlocksForBuilding(buildingDefId: BuildingDefId): ReadonlyArray<TechNode> {
  return TECH_NODES.filter((n) => n.effects.unlockBuildings?.includes(buildingDefId) ?? false)
}

export function nextResearchableBuildings(
  empire: Empire,
): ReadonlyArray<{ tech: TechNode; buildings: ReadonlyArray<BuildingDefId> }> {
  const out: { tech: TechNode; buildings: ReadonlyArray<BuildingDefId> }[] = []
  for (const node of TECH_NODES) {
    if (!node.effects.unlockBuildings || node.effects.unlockBuildings.length === 0) continue
    if (empire.researchedTechs.has(node.id)) continue
    if (!isTechResearchable(empire, node.id)) continue
    out.push({ tech: node, buildings: node.effects.unlockBuildings })
  }
  return out
}

export function isBuildingEventuallyResearchable(
  buildingDefId: BuildingDefId,
  empire: Empire,
): boolean {
  if (isBuildingUnlocked(buildingDefId, empire.researchedTechs)) return true
  for (const tech of unlocksForBuilding(buildingDefId)) {
    if (isTechResearchable(empire, tech.id)) return true
  }
  return false
}
