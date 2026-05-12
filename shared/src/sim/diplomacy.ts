// PHASE 18.5 — diplomacy + cross-civ trade resolver. Per user verbatim 2026-05-10:
// *"ther is only tricking your colonists and fuck it only is coop set is there deplomacy
// and ais are alway no diplomacy has to be set in game setup"* — diplomacy ONLY exists
// inside a coop alliance, AIs are always hostile to humans, and alliance membership is
// fixed at game setup (no mid-match treaty switching). This module exposes the resolver
// helpers that consuming code (caravan-create action, fleet hostility check, intel sharing)
// uses to answer the "can civ A trade/ally/share-with civ B" question without each caller
// re-implementing the alliance walk.

import { type CivId } from '../types/index'
import { type CoopAlliance, findAllianceForCiv } from './ai-coop'

// Authoritative relationship between two civs. Used by trade gates + UI relationship labels.
export type DiplomaticRelation = 'self' | 'ally' | 'neutral' | 'hostile'

// Lookup pair (A, B) → relation. Symmetric — relation(A, B) === relation(B, A). The current
// alliance model is binary (in same alliance = ally; otherwise hostile because AIs default
// to hostility per user verbatim). 'neutral' is reserved for indigenous civs (parley state
// before assimilation/wipe) so the diplomacy panel can render them distinctly.
export function resolveDiplomaticRelation(
  fromCivId: CivId,
  toCivId: CivId,
  alliances: ReadonlyArray<CoopAlliance>,
  indigenousCivIds: ReadonlySet<CivId>,
): DiplomaticRelation {
  if (fromCivId === toCivId) return 'self'
  if (indigenousCivIds.has(toCivId)) return 'neutral'
  const fromAlliance = findAllianceForCiv(alliances, fromCivId)
  const toAlliance = findAllianceForCiv(alliances, toCivId)
  if (fromAlliance && toAlliance && fromAlliance.id === toAlliance.id) return 'ally'
  return 'hostile'
}

// PHASE 18.5 — caravan trade gate. The caravan-create action calls this to validate the
// destination civ. Returns true when the destination is the same civ (intra-empire trade,
// already supported) OR a co-op alliance member (PHASE 18.5 extension). False otherwise —
// hostile civs + indigenous civs can't receive trade caravans.
export function canTradeBetweenCivs(
  fromCivId: CivId,
  toCivId: CivId,
  alliances: ReadonlyArray<CoopAlliance>,
  indigenousCivIds: ReadonlySet<CivId>,
): boolean {
  const relation = resolveDiplomaticRelation(fromCivId, toCivId, alliances, indigenousCivIds)
  return relation === 'self' || relation === 'ally'
}

// PHASE 18.5 — fog-of-war intel-share gate. Allies in the same alliance MAY share intel
// (controlled by alliance.sharedIntel). This helper threads that bool through so callers
// don't have to walk the alliance themselves. Returns true when both civs are in the same
// alliance AND that alliance has sharedIntel enabled.
export function canShareIntelBetweenCivs(
  fromCivId: CivId,
  toCivId: CivId,
  alliances: ReadonlyArray<CoopAlliance>,
): boolean {
  if (fromCivId === toCivId) return true
  const fromAlliance = findAllianceForCiv(alliances, fromCivId)
  const toAlliance = findAllianceForCiv(alliances, toCivId)
  if (!fromAlliance || !toAlliance) return false
  if (fromAlliance.id !== toAlliance.id) return false
  return fromAlliance.sharedIntel
}

// PHASE 18.5 — explicit hostile-resolver wrapper. Returns the inverse of the trade gate
// (anything not-self and not-ally is hostile in the current model). Used by fleet-pathing
// + counter-launch logic so AIs don't fire on coop allies. Kept as a separate export
// (rather than inline `!canTradeBetweenCivs`) because future polish may distinguish
// 'cold-war neutral' from 'open hostile' without changing the trade rules.
export function isHostileBetweenCivs(
  fromCivId: CivId,
  toCivId: CivId,
  alliances: ReadonlyArray<CoopAlliance>,
  indigenousCivIds: ReadonlySet<CivId>,
): boolean {
  if (fromCivId === toCivId) return false
  return resolveDiplomaticRelation(fromCivId, toCivId, alliances, indigenousCivIds) === 'hostile'
}
