import { type CivId } from '../types/index'

export type AllianceKind = 'humanCoop' | 'aiAxis' | 'temporary'

export interface CoopAlliance {
  readonly id: string
  readonly kind: AllianceKind
  readonly memberCivIds: ReadonlySet<CivId>
  readonly sharedIntel: boolean
  readonly formedAtTick: number
}

export function newCoopAlliance(
  id: string,
  kind: AllianceKind,
  memberCivIds: ReadonlyArray<CivId>,
  sharedIntel: boolean,
  formedAtTick: number,
): CoopAlliance {
  if (memberCivIds.length < 2) {
    throw new Error(`newCoopAlliance: alliance ${id} needs at least 2 members`)
  }
  return {
    id,
    kind,
    memberCivIds: new Set(memberCivIds),
    sharedIntel,
    formedAtTick,
  }
}

export function isCivInAlliance(alliance: CoopAlliance, civId: CivId): boolean {
  return alliance.memberCivIds.has(civId)
}

export function findAllianceForCiv(
  alliances: ReadonlyArray<CoopAlliance>,
  civId: CivId,
): CoopAlliance | null {
  for (const alliance of alliances) {
    if (alliance.memberCivIds.has(civId)) return alliance
  }
  return null
}

export function isAIHostileToTarget(
  aiCivId: CivId,
  targetCivId: CivId,
  alliances: ReadonlyArray<CoopAlliance>,
  isHumanCiv: (civId: CivId) => boolean,
): boolean {
  if (aiCivId === targetCivId) return false
  if (!isHumanCiv(aiCivId)) {
    const aiAlliance = findAllianceForCiv(alliances, aiCivId)
    if (aiAlliance && aiAlliance.memberCivIds.has(targetCivId)) return false
    if (isHumanCiv(targetCivId)) {
      const targetAlliance = findAllianceForCiv(alliances, targetCivId)
      if (targetAlliance && targetAlliance.kind === 'humanCoop') {
        return true
      }
    }
    return true
  }
  return false
}

export function applyAllianceIntelSharing<T>(
  alliance: CoopAlliance,
  perCivIntel: ReadonlyMap<CivId, ReadonlyArray<T>>,
): ReadonlyArray<T> {
  if (!alliance.sharedIntel) return []
  const merged: T[] = []
  for (const civId of alliance.memberCivIds) {
    const intel = perCivIntel.get(civId)
    if (intel) merged.push(...intel)
  }
  return merged
}

export interface CoopMatchConfig {
  readonly coopMode: boolean
  readonly humanAllianceId: string
  readonly sharedIntel: boolean
  readonly aiAxisEnabled: boolean
}

export const DEFAULT_COOP_MATCH_CONFIG: CoopMatchConfig = {
  coopMode: false,
  humanAllianceId: 'human-coop',
  sharedIntel: true,
  aiAxisEnabled: false,
}

export function buildHumanCoopAlliance(
  humanCivIds: ReadonlyArray<CivId>,
  config: CoopMatchConfig,
  formedAtTick: number,
): CoopAlliance | null {
  if (!config.coopMode) return null
  if (humanCivIds.length < 2) return null
  return newCoopAlliance(
    config.humanAllianceId,
    'humanCoop',
    humanCivIds,
    config.sharedIntel,
    formedAtTick,
  )
}
