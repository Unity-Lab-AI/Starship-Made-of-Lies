import { type CivId, type PlanetId } from '../types/index'
import {
  type AnyProtocolMessage,
  type ColonyShipLaunchedMessage,
  type ColonyShipOutcomeMessage,
  type PlanetCapturedMessage,
  type PlanetStateUpdateMessage,
  type ServerToClientMessage,
} from './index'

export interface FogOfWarContext {
  readonly observerCivId: CivId
  readonly observableCivIds: ReadonlySet<CivId>
  readonly observablePlanetIds: ReadonlySet<PlanetId>
}

export function shouldDeliverToObserver(msg: ServerToClientMessage, ctx: FogOfWarContext): boolean {
  switch (msg.type) {
    case 'CIV_STATE_UPDATE':
      return msg.civId === ctx.observerCivId
    case 'PLANET_STATE_UPDATE':
      return ctx.observablePlanetIds.has((msg as PlanetStateUpdateMessage).planetId)
    case 'COLONY_SHIP_LAUNCHED': {
      const m = msg as ColonyShipLaunchedMessage
      return (
        m.launchingCivId === ctx.observerCivId ||
        ctx.observablePlanetIds.has(m.fromPlanetId) ||
        ctx.observablePlanetIds.has(m.targetPlanetId)
      )
    }
    case 'COLONY_SHIP_OUTCOME': {
      const m = msg as ColonyShipOutcomeMessage
      return (
        ctx.observablePlanetIds.has(m.fromPlanetId) || ctx.observablePlanetIds.has(m.targetPlanetId)
      )
    }
    case 'TECH_RESEARCHED':
      return msg.civId === ctx.observerCivId
    case 'PLANET_CAPTURED': {
      const m = msg as PlanetCapturedMessage
      return (
        ctx.observablePlanetIds.has(m.planetId) ||
        m.newOwnerCivId === ctx.observerCivId ||
        m.priorOwnerCivId === ctx.observerCivId
      )
    }
    case 'CIV_DEFEATED':
      return ctx.observableCivIds.has(msg.defeatedCivId)
    case 'AI_PLAYER_STATE':
      return ctx.observableCivIds.has(msg.civId) || msg.civId === ctx.observerCivId
    case 'ACHIEVEMENT_UNLOCKED':
      return true
    case 'PROFILE_STATE':
      return true
    case 'LEADERBOARD_UPDATE':
      return true
    default:
      return true
  }
}

export function filterMessagesForObserver<T extends AnyProtocolMessage>(
  messages: ReadonlyArray<T>,
  ctx: FogOfWarContext,
): ReadonlyArray<T> {
  const out: T[] = []
  for (const msg of messages) {
    if (isServerToClient(msg)) {
      if (shouldDeliverToObserver(msg, ctx)) out.push(msg)
    } else {
      out.push(msg)
    }
  }
  return out
}

function isServerToClient(msg: AnyProtocolMessage): msg is ServerToClientMessage {
  switch (msg.type) {
    case 'LOBBY_STATE':
    case 'MATCH_STARTED':
    case 'TICK':
    case 'CIV_STATE_UPDATE':
    case 'PLANET_STATE_UPDATE':
    case 'COLONY_SHIP_LAUNCHED':
    case 'COLONY_SHIP_OUTCOME':
    case 'TECH_RESEARCHED':
    case 'PLANET_CAPTURED':
    case 'CIV_DEFEATED':
    case 'MATCH_ENDED':
    case 'AI_PLAYER_STATE':
    case 'BEACON_ALERT':
    case 'CIVIL_FACTION_SHIFT':
    case 'MATCH_STATE_SYNC':
    case 'RESOURCE_TICK':
    case 'ACHIEVEMENT_UNLOCKED':
    case 'PROFILE_STATE':
    case 'LEADERBOARD_UPDATE':
    case 'PONG':
    case 'ERROR':
      return true
    case 'CHAT':
      return 'fromCivId' in (msg as object)
    default:
      return false
  }
}
