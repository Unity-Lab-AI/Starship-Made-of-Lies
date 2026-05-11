import {
  type CivId,
  type FogOfWarContext,
  type PlanetId,
  type ServerToClientMessage,
  shouldDeliverToObserver,
} from '@smol/shared'
import type { Client } from '@colyseus/core'
import { type MatchState, type PerCivState } from './MatchState'

export interface ClientRegistry {
  send(client: Client, msg: ServerToClientMessage): void
  clientForCiv(civId: CivId): Client | null
  allClients(): ReadonlyArray<{ client: Client; civId: CivId }>
}

export function buildFogOfWarContext(state: MatchState, observerCivId: CivId): FogOfWarContext {
  const observableCivIds = new Set<CivId>()
  observableCivIds.add(observerCivId)
  const observablePlanetIds = new Set<PlanetId>()

  for (const ps of state.planetStates.values()) {
    if (ps.ownerCivId === observerCivId) {
      observablePlanetIds.add(ps.planet.id)
    }
  }

  for (const flight of state.flights.values()) {
    const launching = flight.launchingCivId
    const fromState = state.planetStates.get(flight.fromPlanetId)
    const targetState = state.planetStates.get(flight.targetPlanetId)
    if (
      launching === observerCivId ||
      (fromState && fromState.ownerCivId === observerCivId) ||
      (targetState && targetState.ownerCivId === observerCivId)
    ) {
      observableCivIds.add(launching)
      observablePlanetIds.add(flight.fromPlanetId)
      observablePlanetIds.add(flight.targetPlanetId)
    }
  }

  return { observerCivId, observableCivIds, observablePlanetIds }
}

export function broadcastWithFogOfWar(
  state: MatchState,
  registry: ClientRegistry,
  msg: ServerToClientMessage,
): number {
  let delivered = 0
  for (const civ of state.civs.values()) {
    const client = registry.clientForCiv(civ.assignment.civId)
    if (!client) continue
    const ctx = buildFogOfWarContext(state, civ.assignment.civId)
    if (shouldDeliverToObserver(msg, ctx)) {
      registry.send(client, msg)
      delivered += 1
    }
  }
  return delivered
}

export function broadcastToAll(registry: ClientRegistry, msg: ServerToClientMessage): number {
  let delivered = 0
  for (const { client } of registry.allClients()) {
    registry.send(client, msg)
    delivered += 1
  }
  return delivered
}

export function broadcastToCiv(
  registry: ClientRegistry,
  civId: CivId,
  msg: ServerToClientMessage,
): boolean {
  const client = registry.clientForCiv(civId)
  if (!client) return false
  registry.send(client, msg)
  return true
}

export function listObserversFor(
  state: MatchState,
  predicate: (perCiv: PerCivState) => boolean,
): ReadonlyArray<CivId> {
  const out: CivId[] = []
  for (const civ of state.civs.values()) {
    if (predicate(civ)) out.push(civ.assignment.civId)
  }
  return out
}
