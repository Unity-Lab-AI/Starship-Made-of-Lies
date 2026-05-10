import { type CivId, type PlanetId, type TileId, type BuildingDefId } from '../types/index'
import { type ThemeId } from '../sim/themes'
import { type TechId } from '../sim/tech'
import { type CitizenTier } from '../sim/population'
import { type CampaignArchetype } from '../sim/deception'
import { type WorkforceCategory } from '../sim/workforce'

export type ProtocolVersion = 1
export const PROTOCOL_VERSION: ProtocolVersion = 1

export type ClientToServerMessageType =
  | 'JOIN_LOBBY'
  | 'LEAVE_LOBBY'
  | 'START_MATCH'
  | 'PLACE_BUILDING'
  | 'CANCEL_CONSTRUCTION'
  | 'START_RESEARCH'
  | 'LAUNCH_CAMPAIGN'
  | 'CONSCRIPT_CITIZENS'
  | 'LAUNCH_COLONY_SHIP'
  | 'SET_WORKFORCE_SLIDER'
  | 'CHAT'
  | 'PING'

export type ServerToClientMessageType =
  | 'LOBBY_STATE'
  | 'MATCH_STARTED'
  | 'TICK'
  | 'CIV_STATE_UPDATE'
  | 'PLANET_STATE_UPDATE'
  | 'COLONY_SHIP_LAUNCHED'
  | 'COLONY_SHIP_OUTCOME'
  | 'TECH_RESEARCHED'
  | 'PLANET_CAPTURED'
  | 'CIV_DEFEATED'
  | 'MATCH_ENDED'
  | 'RESOURCE_TICK'
  | 'CIVIL_FACTION_SHIFT'
  | 'MATCH_STATE_SYNC'
  | 'BEACON_ALERT'
  | 'CHAT'
  | 'PONG'
  | 'ERROR'

export interface BaseMessage<T extends string> {
  readonly type: T
  readonly v: ProtocolVersion
  readonly tick?: number
}

export interface JoinLobbyMessage extends BaseMessage<'JOIN_LOBBY'> {
  readonly displayName: string
  readonly preferredThemeId?: ThemeId
}

export type LeaveLobbyMessage = BaseMessage<'LEAVE_LOBBY'>

export interface StartMatchMessage extends BaseMessage<'START_MATCH'> {
  readonly seed: number
  readonly planetCount: number
}

export interface PlaceBuildingMessage extends BaseMessage<'PLACE_BUILDING'> {
  readonly planetId: PlanetId
  readonly tileId: TileId
  readonly buildingDefId: BuildingDefId
}

export interface CancelConstructionMessage extends BaseMessage<'CANCEL_CONSTRUCTION'> {
  readonly planetId: PlanetId
  readonly tileId: TileId
}

export interface StartResearchMessage extends BaseMessage<'START_RESEARCH'> {
  readonly techId: TechId
}

export interface LaunchCampaignMessage extends BaseMessage<'LAUNCH_CAMPAIGN'> {
  readonly archetype: CampaignArchetype
  readonly planetId: PlanetId
}

export interface ConscriptCitizensMessage extends BaseMessage<'CONSCRIPT_CITIZENS'> {
  readonly planetId: PlanetId
  readonly fromTier: CitizenTier
  readonly count: number
}

export interface LaunchColonyShipMessage extends BaseMessage<'LAUNCH_COLONY_SHIP'> {
  readonly fromPlanetId: PlanetId
  readonly targetPlanetId: PlanetId
  readonly variant: string
  readonly citizensAboard: number
}

export interface SetWorkforceSliderMessage extends BaseMessage<'SET_WORKFORCE_SLIDER'> {
  readonly planetId: PlanetId
  readonly category: WorkforceCategory
  readonly value: number
}

export interface ChatClientMessage extends BaseMessage<'CHAT'> {
  readonly text: string
}

export interface PingMessage extends BaseMessage<'PING'> {
  readonly t: number
}

export type ClientToServerMessage =
  | JoinLobbyMessage
  | LeaveLobbyMessage
  | StartMatchMessage
  | PlaceBuildingMessage
  | CancelConstructionMessage
  | StartResearchMessage
  | LaunchCampaignMessage
  | ConscriptCitizensMessage
  | LaunchColonyShipMessage
  | SetWorkforceSliderMessage
  | ChatClientMessage
  | PingMessage

export interface LobbyStateMessage extends BaseMessage<'LOBBY_STATE'> {
  readonly players: ReadonlyArray<{
    readonly civId: CivId
    readonly displayName: string
    readonly themeId: ThemeId
    readonly ready: boolean
  }>
}

export interface MatchStartedMessage extends BaseMessage<'MATCH_STARTED'> {
  readonly seed: number
  readonly planetCount: number
  readonly civAssignments: ReadonlyArray<{
    civId: CivId
    themeId: ThemeId
    startingPlanetId: PlanetId
  }>
}

export interface TickMessage extends BaseMessage<'TICK'> {
  readonly tick: number
}

export interface CivStateUpdateMessage extends BaseMessage<'CIV_STATE_UPDATE'> {
  readonly civId: CivId
  readonly researchedTechs: ReadonlyArray<TechId>
  readonly activeResearchTechId: TechId | null
  readonly activeResearchProgress: number
  readonly defeatedCivCount: number
  readonly capturedPlanetCount: number
  readonly controlledPlanetCount: number
}

export interface PlanetStateUpdateMessage extends BaseMessage<'PLANET_STATE_UPDATE'> {
  readonly planetId: PlanetId
  readonly ownerCivId: CivId | null
  readonly population: number
  readonly stocks: ReadonlyArray<{ resourceId: string; amount: number }>
  readonly factionLoyal: number
  readonly factionSkeptic: number
  readonly factionDissident: number
}

export interface ColonyShipLaunchedMessage extends BaseMessage<'COLONY_SHIP_LAUNCHED'> {
  readonly fromPlanetId: PlanetId
  readonly targetPlanetId: PlanetId
  readonly launchingCivId: CivId
  readonly variant: string
  readonly etaTicks: number
}

export type ColonyShipOutcomeKind =
  | 'TARGET_HIT'
  | 'PROBABLE_HIT'
  | 'SIGNAL_LOST'
  | 'INTERCEPTED'
  | 'ABORTED'

export interface ColonyShipOutcomeMessage extends BaseMessage<'COLONY_SHIP_OUTCOME'> {
  readonly fromPlanetId: PlanetId
  readonly targetPlanetId: PlanetId
  readonly outcome: ColonyShipOutcomeKind
  readonly citizensSurvived: number
}

export interface TechResearchedMessage extends BaseMessage<'TECH_RESEARCHED'> {
  readonly civId: CivId
  readonly techId: TechId
}

export interface PlanetCapturedMessage extends BaseMessage<'PLANET_CAPTURED'> {
  readonly planetId: PlanetId
  readonly newOwnerCivId: CivId
  readonly priorOwnerCivId: CivId | null
}

export interface CivDefeatedMessage extends BaseMessage<'CIV_DEFEATED'> {
  readonly defeatedCivId: CivId
  readonly defeatedByCivId: CivId
}

export type MatchEndReason =
  | 'apex-tech'
  | 'last-civ-standing'
  | 'map-control'
  | 'score'
  | 'admin-end'

export interface MatchEndedMessage extends BaseMessage<'MATCH_ENDED'> {
  readonly reason: MatchEndReason
  readonly winningCivId: CivId | null
}

export interface ResourceTickMessage extends BaseMessage<'RESOURCE_TICK'> {
  readonly planetId: PlanetId
  readonly produced: ReadonlyArray<{ resourceId: string; amount: number }>
  readonly consumed: ReadonlyArray<{ resourceId: string; amount: number }>
  readonly idledBuildingCount: number
}

export interface CivilFactionShiftMessage extends BaseMessage<'CIVIL_FACTION_SHIFT'> {
  readonly planetId: PlanetId
  readonly loyalDelta: number
  readonly skepticDelta: number
  readonly dissidentDelta: number
  readonly cause: 'propaganda' | 'conscription' | 'campaign' | 'natural-growth' | 'event'
}

export interface MatchStateSyncMessage extends BaseMessage<'MATCH_STATE_SYNC'> {
  readonly tick: number
  readonly civCount: number
  readonly aliveCivCount: number
  readonly totalControlledPlanets: ReadonlyArray<{ civId: CivId; count: number }>
  readonly snapshotChecksum?: string
}

export interface BeaconAlertMessage extends BaseMessage<'BEACON_ALERT'> {
  readonly planetId: PlanetId
  readonly observerCivId: CivId
  readonly alertId: string
  readonly kind: string
  readonly summary: string
}

export interface ChatServerMessage extends BaseMessage<'CHAT'> {
  readonly fromCivId: CivId
  readonly fromName: string
  readonly text: string
}

export interface PongMessage extends BaseMessage<'PONG'> {
  readonly t: number
}

export interface ErrorMessage extends BaseMessage<'ERROR'> {
  readonly code: string
  readonly detail: string
}

export type ServerToClientMessage =
  | LobbyStateMessage
  | MatchStartedMessage
  | TickMessage
  | CivStateUpdateMessage
  | PlanetStateUpdateMessage
  | ColonyShipLaunchedMessage
  | ColonyShipOutcomeMessage
  | TechResearchedMessage
  | PlanetCapturedMessage
  | CivDefeatedMessage
  | MatchEndedMessage
  | ResourceTickMessage
  | CivilFactionShiftMessage
  | MatchStateSyncMessage
  | BeaconAlertMessage
  | ChatServerMessage
  | PongMessage
  | ErrorMessage

export type AnyProtocolMessage = ClientToServerMessage | ServerToClientMessage

export function isClientToServerMessage(msg: AnyProtocolMessage): msg is ClientToServerMessage {
  return CLIENT_TO_SERVER_TYPES.has(msg.type)
}

export function isServerToClientMessage(msg: AnyProtocolMessage): msg is ServerToClientMessage {
  return SERVER_TO_CLIENT_TYPES.has(msg.type)
}

const CLIENT_TO_SERVER_TYPES: ReadonlySet<string> = new Set<ClientToServerMessageType>([
  'JOIN_LOBBY',
  'LEAVE_LOBBY',
  'START_MATCH',
  'PLACE_BUILDING',
  'CANCEL_CONSTRUCTION',
  'START_RESEARCH',
  'LAUNCH_CAMPAIGN',
  'CONSCRIPT_CITIZENS',
  'LAUNCH_COLONY_SHIP',
  'SET_WORKFORCE_SLIDER',
  'CHAT',
  'PING',
])

const SERVER_TO_CLIENT_TYPES: ReadonlySet<string> = new Set<ServerToClientMessageType>([
  'LOBBY_STATE',
  'MATCH_STARTED',
  'TICK',
  'CIV_STATE_UPDATE',
  'PLANET_STATE_UPDATE',
  'COLONY_SHIP_LAUNCHED',
  'COLONY_SHIP_OUTCOME',
  'TECH_RESEARCHED',
  'PLANET_CAPTURED',
  'CIV_DEFEATED',
  'MATCH_ENDED',
  'RESOURCE_TICK',
  'CIVIL_FACTION_SHIFT',
  'MATCH_STATE_SYNC',
  'BEACON_ALERT',
  'CHAT',
  'PONG',
  'ERROR',
])
