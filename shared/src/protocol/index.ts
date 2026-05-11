import { type CivId, type PlanetId, type TileId, type BuildingDefId } from '../types/index'
import { type ThemeId } from '../sim/themes'
import { type TechId } from '../sim/tech'
import { type CitizenTier } from '../sim/population'
import { type CampaignArchetype } from '../sim/deception'
import { type WorkforceCategory } from '../sim/workforce'
import { type AccountId } from '../sim/account'
import { type AchievementId } from '../sim/achievements'
import { type LeaderboardCategory, type ScoreEntry } from '../sim/leaderboard'
import { type LootDropId, type LootDebrisKind, type LootResourceEntry } from '../sim/loot'

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
  | 'REQUEST_PROFILE'
  | 'REQUEST_LEADERBOARD'
  | 'CLAIM_LOOT_DROP'
  | 'TRIGGER_LAST_HOPE_EVAC'
  | 'MANUAL_SHIP_FIRE'
  // PHASE 16.37 — UMS-faithful per-flight command channel. Mirrors UnityMissile.cs
  // UNITY_MSL_CMD: DETONATE / RESET / MERGE. Server forwards to flight tick logic.
  | 'MISSILE_COMMAND'
  // PHASE 16.37 — multi-pad controller mass-action channel. Mirrors UnityPad.cs
  // UNITY_PAD_CMD: BUILDALL / ARMALL / LAUNCHALL / ABORTALL / COPYTGT.
  | 'CONTROLLER_CMD'

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
  | 'AI_PLAYER_STATE'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'PROFILE_STATE'
  | 'LEADERBOARD_UPDATE'
  | 'LOOT_DROP_AVAILABLE'
  | 'LOOT_DROP_CLAIMED'
  | 'INCOMING_FLIGHT_WARNING'
  | 'LAST_HOPE_EVAC_TRIGGERED'
  | 'CHAT'
  | 'PONG'
  | 'ERROR'
  // PHASE 16.37 — UMS-faithful printer + pad state-machine notification. Mirrors UMS
  // UNITY_PRINTER_ACK + pad GONE→IDLE transition. Server broadcasts when a pad's print
  // cycle completes so the controller-mode UI can clear outcome badges + re-queue builds.
  | 'BUILD_COMPLETE'
  // PHASE 16.37 — UMS-faithful sensor/lidar detection broadcast. Mirrors UnitySignal.cs
  // UNITY_SAT_INTERCEPT / SIGNAL_DETECTION. Server emits when a defender's sensor net
  // acquires an incoming attacker — drives the BeaconPanel + alert pulse on the planet.
  | 'SIGNAL_DETECTION'
  // PHASE 16.37 — UMS-faithful miner-fleet status broadcast. Mirrors UnityBeacon.cs
  // MINER_BEACON broadcast every 3s. Server multicasts mining-ship status to the owning civ
  // so the MINER DETAIL LCD + Mining Fleet panel can render live.
  | 'BEACON_BROADCAST'

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

export interface RequestProfileMessage extends BaseMessage<'REQUEST_PROFILE'> {
  readonly accountId: AccountId
}

export interface RequestLeaderboardMessage extends BaseMessage<'REQUEST_LEADERBOARD'> {
  readonly category: LeaderboardCategory
  readonly themeId?: ThemeId
  readonly topN?: number
}

export interface ClaimLootDropMessage extends BaseMessage<'CLAIM_LOOT_DROP'> {
  readonly dropId: LootDropId
}

export interface TriggerLastHopeEvacMessage extends BaseMessage<'TRIGGER_LAST_HOPE_EVAC'> {
  readonly fromPlanetId: PlanetId
}

export interface ManualShipFireMessage extends BaseMessage<'MANUAL_SHIP_FIRE'> {
  readonly fromPlanetId: PlanetId
  readonly targetPlanetId: PlanetId
  readonly buildId: string
  readonly variantHint?: string
  readonly mode: 'single' | 'barrage' | 'auto-salvo'
}

// PHASE 16.37 — UMS UnityMissile.cs UNITY_MSL_CMD channel. Per-flight commands targeted at
// a specific flight by id. UMS uses pad-id-qualified DETONATE:{padID} / RESET:{padID} / MERGE.
// SMoL flight ids are globally unique so no qualification needed.
export type MissileCommandKind = 'DETONATE' | 'RESET' | 'MERGE'
export interface MissileCommandMessage extends BaseMessage<'MISSILE_COMMAND'> {
  readonly flightId: string
  readonly command: MissileCommandKind
}

// PHASE 16.37 — UMS UnityPad.cs UNITY_PAD_CMD channel. Controller-mode mass actions sent
// from the player's controller pad to every slave pad on that planet.
export type ControllerCmdKind = 'BUILDALL' | 'ARMALL' | 'LAUNCHALL' | 'ABORTALL' | 'COPYTGT'
export interface ControllerCmdMessage extends BaseMessage<'CONTROLLER_CMD'> {
  readonly planetId: PlanetId
  readonly command: ControllerCmdKind
  // For BUILDALL: which colony-ship variant to enqueue across all pads. Ignored otherwise.
  readonly variantHint?: string
  // For LAUNCHALL salvo-stagger: optional target-pad addressing (per-pad targeted LAUNCH).
  readonly targetPadHint?: string
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
  | RequestProfileMessage
  | RequestLeaderboardMessage
  | ClaimLootDropMessage
  | TriggerLastHopeEvacMessage
  | ManualShipFireMessage
  | MissileCommandMessage
  | ControllerCmdMessage

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

export interface AIPlayerStateMessage extends BaseMessage<'AI_PLAYER_STATE'> {
  readonly civId: CivId
  readonly themeId: ThemeId
  readonly playstyleArchetype: 'builder' | 'warmonger' | 'researcher' | 'trickster'
  readonly difficultyLevel: 'easy' | 'medium' | 'hard' | 'brutal'
  readonly lastDecisionLine: string | null
  readonly lastDecidedTick: number
}

export interface AchievementUnlockedMessage extends BaseMessage<'ACHIEVEMENT_UNLOCKED'> {
  readonly accountId: AccountId
  readonly achievementId: AchievementId
  readonly atTick: number
  readonly matchId: string
}

export interface ProfileStateMessage extends BaseMessage<'PROFILE_STATE'> {
  readonly accountId: AccountId
  readonly displayName: string
  readonly handle: string
  readonly matchesPlayed: number
  readonly matchesWon: number
  readonly winRate: number
  readonly themesPlayedCount: number
  readonly fastestApexTicks: number | null
  readonly achievementsUnlocked: number
  readonly achievementsTotal: number
  readonly badgeIds: ReadonlyArray<string>
  readonly cosmeticUnlocks: ReadonlyArray<string>
}

export interface LeaderboardUpdateMessage extends BaseMessage<'LEADERBOARD_UPDATE'> {
  readonly category: LeaderboardCategory
  readonly themeId: ThemeId | null
  readonly topEntries: ReadonlyArray<ScoreEntry>
  readonly capturedAtTick: number
}

export interface LootDropAvailableMessage extends BaseMessage<'LOOT_DROP_AVAILABLE'> {
  readonly dropId: LootDropId
  readonly tileId: TileId
  readonly planetId: PlanetId
  readonly originCivId: CivId | null
  readonly debrisKind: LootDebrisKind
  readonly resources: ReadonlyArray<LootResourceEntry>
  readonly droppedAtTick: number
  readonly expiresAtTick: number | null
}

export interface LootDropClaimedMessage extends BaseMessage<'LOOT_DROP_CLAIMED'> {
  readonly dropId: LootDropId
  readonly claimedByCivId: CivId
  readonly resources: ReadonlyArray<LootResourceEntry>
  readonly atTick: number
}

export interface IncomingFlightWarningMessage extends BaseMessage<'INCOMING_FLIGHT_WARNING'> {
  readonly observerCivId: CivId
  readonly fromCivId: CivId | null
  readonly targetPlanetId: PlanetId
  readonly etaTicks: number
  readonly warningSource: 'warning_system' | 'beacon' | 'laser_align'
  readonly confidence: number
}

export interface LastHopeEvacTriggeredMessage extends BaseMessage<'LAST_HOPE_EVAC_TRIGGERED'> {
  readonly civId: CivId
  readonly fromPlanetId: PlanetId
  readonly etaTicks: number
  readonly citizensAboard: number
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

// PHASE 16.37 — UMS UnityPad.cs printer-ack equivalent. Server broadcasts when a pad finishes
// its PRINT/BUILD cycle so the controller-mode UI can clear outcome badges + auto-queue the
// next build. Mirrors UMS UNITY_PRINTER_ACK fanout.
export interface BuildCompleteMessage extends BaseMessage<'BUILD_COMPLETE'> {
  readonly planetId: PlanetId
  readonly padId: TileId
  readonly variantHint?: string
}

// PHASE 16.37 — UMS UnitySignal.cs sensor-acquisition broadcast. Server emits when a defender
// civ's sensor network acquires an incoming attacker flight. Drives BeaconPanel alert pulses.
export interface SignalDetectionMessage extends BaseMessage<'SIGNAL_DETECTION'> {
  readonly defenderCivId: CivId
  readonly attackerFlightId: string
  readonly targetPlanetId: PlanetId
  readonly source: 'antenna' | 'sensor' | 'lidar' | 'satellite'
}

// PHASE 16.37 — UMS UnityBeacon.cs miner-fleet broadcast. Server multicasts mining-ship
// status updates to the owning civ at the same cadence UMS broadcasts MINER_BEACON. Drives
// the MINER DETAIL LCD + Mining Fleet panel + ship-beacon overlay sprites.
export interface BeaconBroadcastMessage extends BaseMessage<'BEACON_BROADCAST'> {
  readonly civId: CivId
  readonly shipId: string
  readonly shipName: string
  readonly status: string
  readonly cargoPct: number
  readonly position: { readonly x: number; readonly y: number; readonly z: number }
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
  | AIPlayerStateMessage
  | AchievementUnlockedMessage
  | ProfileStateMessage
  | LeaderboardUpdateMessage
  | LootDropAvailableMessage
  | LootDropClaimedMessage
  | IncomingFlightWarningMessage
  | LastHopeEvacTriggeredMessage
  | ChatServerMessage
  | PongMessage
  | ErrorMessage
  | BuildCompleteMessage
  | SignalDetectionMessage
  | BeaconBroadcastMessage

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
  'REQUEST_PROFILE',
  'REQUEST_LEADERBOARD',
  'CLAIM_LOOT_DROP',
  'TRIGGER_LAST_HOPE_EVAC',
  'MANUAL_SHIP_FIRE',
  'MISSILE_COMMAND',
  'CONTROLLER_CMD',
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
  'AI_PLAYER_STATE',
  'ACHIEVEMENT_UNLOCKED',
  'PROFILE_STATE',
  'LEADERBOARD_UPDATE',
  'LOOT_DROP_AVAILABLE',
  'LOOT_DROP_CLAIMED',
  'INCOMING_FLIGHT_WARNING',
  'LAST_HOPE_EVAC_TRIGGERED',
  'CHAT',
  'PONG',
  'ERROR',
  'BUILD_COMPLETE',
  'SIGNAL_DETECTION',
  'BEACON_BROADCAST',
])
