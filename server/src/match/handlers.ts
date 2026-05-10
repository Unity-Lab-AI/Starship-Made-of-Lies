import {
  type CancelConstructionMessage,
  type ChatClientMessage,
  type ChatServerMessage,
  type CivId,
  type ClientToServerMessage,
  type ConscriptCitizensMessage,
  type ErrorMessage,
  type JoinLobbyMessage,
  type LaunchCampaignMessage,
  type LaunchColonyShipMessage,
  type PingMessage,
  type PlaceBuildingMessage,
  type PongMessage,
  type RequestLeaderboardMessage,
  type RequestProfileMessage,
  type ServerToClientMessage,
  type StartMatchMessage,
  type StartResearchMessage,
  type SetWorkforceSliderMessage,
  type TechResearchedMessage,
  PROTOCOL_VERSION,
  applyConscriptionPenalty,
  startResearch,
  techId as techIdValue,
} from '@smol/shared'
import { type MatchState, getPerCiv, getPlanetState } from './MatchState'
import { type Lobby, findSlotByCivId, setSlotReady, transitionToStarting } from './lobby'

export interface HandlerContext {
  readonly state: MatchState | null
  readonly lobby: Lobby
  readonly actorCivId: CivId
}

export type HandlerOutcome = {
  readonly broadcast: ReadonlyArray<ServerToClientMessage>
  readonly direct: ReadonlyArray<ServerToClientMessage>
  readonly error: ErrorMessage | null
}

const EMPTY_OUTCOME: HandlerOutcome = { broadcast: [], direct: [], error: null }

function makeError(code: string, detail: string): ErrorMessage {
  return { type: 'ERROR', v: PROTOCOL_VERSION, code, detail }
}

function withError(code: string, detail: string): HandlerOutcome {
  return { broadcast: [], direct: [], error: makeError(code, detail) }
}

export function dispatchClientMessage(
  ctx: HandlerContext,
  msg: ClientToServerMessage,
): HandlerOutcome {
  switch (msg.type) {
    case 'JOIN_LOBBY':
      return handleJoinLobby(ctx, msg)
    case 'LEAVE_LOBBY':
      return handleLeaveLobby(ctx)
    case 'START_MATCH':
      return handleStartMatch(ctx, msg)
    case 'PLACE_BUILDING':
      return handlePlaceBuilding(ctx, msg)
    case 'CANCEL_CONSTRUCTION':
      return handleCancelConstruction(ctx, msg)
    case 'START_RESEARCH':
      return handleStartResearch(ctx, msg)
    case 'LAUNCH_CAMPAIGN':
      return handleLaunchCampaign(ctx, msg)
    case 'CONSCRIPT_CITIZENS':
      return handleConscriptCitizens(ctx, msg)
    case 'LAUNCH_COLONY_SHIP':
      return handleLaunchColonyShip(ctx, msg)
    case 'SET_WORKFORCE_SLIDER':
      return handleSetWorkforceSlider(ctx, msg)
    case 'CHAT':
      return handleChat(ctx, msg)
    case 'PING':
      return handlePing(msg)
    case 'REQUEST_PROFILE':
      return handleRequestProfile(ctx, msg)
    case 'REQUEST_LEADERBOARD':
      return handleRequestLeaderboard(ctx, msg)
  }
}

function handleJoinLobby(ctx: HandlerContext, _msg: JoinLobbyMessage): HandlerOutcome {
  if (ctx.lobby.phase !== 'CONFIGURING') {
    return withError('LOBBY_CLOSED', 'Match has already started or completed.')
  }
  const slot = findSlotByCivId(ctx.lobby, ctx.actorCivId)
  if (!slot) return withError('SLOT_NOT_FOUND', 'No slot reserved for this connection.')
  return EMPTY_OUTCOME
}

function handleLeaveLobby(ctx: HandlerContext): HandlerOutcome {
  if (ctx.lobby.phase === 'IN_MATCH') {
    return EMPTY_OUTCOME
  }
  return EMPTY_OUTCOME
}

function handleStartMatch(ctx: HandlerContext, _msg: StartMatchMessage): HandlerOutcome {
  if (ctx.lobby.hostCivId !== ctx.actorCivId) {
    return withError('NOT_HOST', 'Only the lobby host can start the match.')
  }
  if (ctx.lobby.phase !== 'CONFIGURING') {
    return withError('LOBBY_NOT_CONFIGURING', `Lobby is in phase ${ctx.lobby.phase}.`)
  }
  if (!setSlotReady(ctx.lobby, ctx.actorCivId, true)) {
    return withError('NOT_READY', 'Could not mark host as ready.')
  }
  if (!transitionToStarting(ctx.lobby)) {
    return withError('SLOTS_NOT_READY', 'Some slots are not ready yet.')
  }
  return EMPTY_OUTCOME
}

function handlePlaceBuilding(ctx: HandlerContext, msg: PlaceBuildingMessage): HandlerOutcome {
  if (!ctx.state) return withError('NO_MATCH', 'No active match in this room.')
  const planetState = getPlanetState(ctx.state, msg.planetId)
  if (!planetState) return withError('PLANET_UNKNOWN', `Unknown planet ${String(msg.planetId)}.`)
  if (planetState.ownerCivId !== ctx.actorCivId) {
    return withError('NOT_OWNER', 'You do not control this planet.')
  }
  return EMPTY_OUTCOME
}

function handleCancelConstruction(
  ctx: HandlerContext,
  msg: CancelConstructionMessage,
): HandlerOutcome {
  if (!ctx.state) return withError('NO_MATCH', 'No active match in this room.')
  const planetState = getPlanetState(ctx.state, msg.planetId)
  if (!planetState) return withError('PLANET_UNKNOWN', `Unknown planet ${String(msg.planetId)}.`)
  if (planetState.ownerCivId !== ctx.actorCivId) {
    return withError('NOT_OWNER', 'You do not control this planet.')
  }
  return EMPTY_OUTCOME
}

function handleStartResearch(ctx: HandlerContext, msg: StartResearchMessage): HandlerOutcome {
  if (!ctx.state) return withError('NO_MATCH', 'No active match in this room.')
  const perCiv = getPerCiv(ctx.state, ctx.actorCivId)
  if (!perCiv) return withError('CIV_UNKNOWN', 'Civ not found in match state.')
  const ok = startResearch(perCiv.empire, techIdValue(String(msg.techId)))
  if (!ok) return withError('TECH_NOT_RESEARCHABLE', 'Tech is locked or already researched.')
  const ev: TechResearchedMessage = {
    type: 'TECH_RESEARCHED',
    v: PROTOCOL_VERSION,
    civId: ctx.actorCivId,
    techId: msg.techId,
    tick: ctx.state.currentTick,
  }
  return { broadcast: [ev], direct: [], error: null }
}

function handleLaunchCampaign(ctx: HandlerContext, msg: LaunchCampaignMessage): HandlerOutcome {
  if (!ctx.state) return withError('NO_MATCH', 'No active match in this room.')
  const planetState = getPlanetState(ctx.state, msg.planetId)
  if (!planetState) return withError('PLANET_UNKNOWN', `Unknown planet ${String(msg.planetId)}.`)
  if (planetState.ownerCivId !== ctx.actorCivId) {
    return withError('NOT_OWNER', 'You do not control this planet.')
  }
  return EMPTY_OUTCOME
}

function handleConscriptCitizens(
  ctx: HandlerContext,
  msg: ConscriptCitizensMessage,
): HandlerOutcome {
  if (!ctx.state) return withError('NO_MATCH', 'No active match in this room.')
  const planetState = getPlanetState(ctx.state, msg.planetId)
  if (!planetState) return withError('PLANET_UNKNOWN', `Unknown planet ${String(msg.planetId)}.`)
  if (planetState.ownerCivId !== ctx.actorCivId) {
    return withError('NOT_OWNER', 'You do not control this planet.')
  }
  if (msg.count <= 0) return withError('BAD_COUNT', 'Count must be positive.')
  applyConscriptionPenalty(planetState.faction, msg.count)
  planetState.totalPopulation = Math.max(0, planetState.totalPopulation - msg.count)
  return EMPTY_OUTCOME
}

function handleLaunchColonyShip(ctx: HandlerContext, msg: LaunchColonyShipMessage): HandlerOutcome {
  if (!ctx.state) return withError('NO_MATCH', 'No active match in this room.')
  const fromState = getPlanetState(ctx.state, msg.fromPlanetId)
  if (!fromState) return withError('PLANET_UNKNOWN', 'Source planet unknown.')
  if (fromState.ownerCivId !== ctx.actorCivId) {
    return withError('NOT_OWNER', 'You do not control the source planet.')
  }
  if (msg.fromPlanetId === msg.targetPlanetId) {
    return withError('SAME_PLANET', 'Cannot launch to the same planet.')
  }
  return EMPTY_OUTCOME
}

function handleSetWorkforceSlider(
  ctx: HandlerContext,
  msg: SetWorkforceSliderMessage,
): HandlerOutcome {
  if (!ctx.state) return withError('NO_MATCH', 'No active match in this room.')
  const planetState = getPlanetState(ctx.state, msg.planetId)
  if (!planetState) return withError('PLANET_UNKNOWN', `Unknown planet ${String(msg.planetId)}.`)
  if (planetState.ownerCivId !== ctx.actorCivId) {
    return withError('NOT_OWNER', 'You do not control this planet.')
  }
  if (msg.value < 0 || msg.value > 1) {
    return withError('BAD_SLIDER', 'Slider value must be in 0..1 range.')
  }
  return EMPTY_OUTCOME
}

function handleChat(ctx: HandlerContext, msg: ChatClientMessage): HandlerOutcome {
  if (msg.text.length === 0 || msg.text.length > 500) {
    return withError('BAD_CHAT', 'Chat must be 1-500 chars.')
  }
  const slot = findSlotByCivId(ctx.lobby, ctx.actorCivId)
  const fromName = slot ? slot.displayName : String(ctx.actorCivId)
  const ev: ChatServerMessage = {
    type: 'CHAT',
    v: PROTOCOL_VERSION,
    fromCivId: ctx.actorCivId,
    fromName,
    text: msg.text,
  }
  return { broadcast: [ev], direct: [], error: null }
}

function handlePing(msg: PingMessage): HandlerOutcome {
  const pong: PongMessage = {
    type: 'PONG',
    v: PROTOCOL_VERSION,
    t: msg.t,
  }
  return { broadcast: [], direct: [pong], error: null }
}

function handleRequestProfile(_ctx: HandlerContext, _msg: RequestProfileMessage): HandlerOutcome {
  return EMPTY_OUTCOME
}

function handleRequestLeaderboard(
  _ctx: HandlerContext,
  _msg: RequestLeaderboardMessage,
): HandlerOutcome {
  return EMPTY_OUTCOME
}
