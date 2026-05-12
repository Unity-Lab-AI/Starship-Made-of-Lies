import { Room, type Client } from '@colyseus/core'
import {
  type AIPlayerStateMessage,
  type AnyProtocolMessage,
  type CivId,
  type ClientToServerMessage,
  type CoopAlliance,
  type CoopMatchConfig,
  type LobbyStateMessage,
  type MatchEndReason,
  type MatchStartedMessage,
  type MatchStateSyncMessage,
  type MissionObjectiveId,
  type PlanetId,
  type ServerToClientMessage,
  type TickMessage,
  DEFAULT_COOP_MATCH_CONFIG,
  PROTOCOL_VERSION,
  civId as civIdValue,
  hasWonByTech,
  isAIHostileToTarget,
  isClientToServerMessage,
  planetId as planetIdValue,
  resolveMatchEnd,
  themeIdValue,
} from '@smol/shared'
import { AIController, AIControllerRegistry } from '../ai/AIController'
import { lookupSessionToken } from '../auth/httpServer'
import { dispatchClientMessage, type HandlerContext } from '../match/handlers'
import {
  type CivAssignment,
  type MatchState,
  controlledPlanetsByCiv,
  newMatchState,
} from '../match/MatchState'
import {
  type Lobby,
  activeSlots,
  addHumanToLobby,
  effectiveTickCap,
  newLobby,
  removeFromLobby,
  rollSlotThemes,
  transitionToInMatch,
} from '../match/lobby'
import { type ClientRegistry, broadcastToAll, broadcastWithFogOfWar } from '../match/broadcast'
import { buildObservablesForCiv } from '../match/observables'
import { InMemorySnapshotStore, captureSnapshot } from '../match/snapshot'
import {
  DEFAULT_DISCONNECT_DIFFICULTY,
  DEFAULT_DISCONNECT_PLAYSTYLE,
  buildAITakeoverController,
  returnHumanControl,
} from '../match/disconnect'

export interface GameRoomCreateOptions {
  readonly seed?: number
  readonly maxPlayers?: number
  readonly tickIntervalMs?: number
  readonly coopConfig?: CoopMatchConfig
  readonly autoSaveEveryNTicks?: number
  readonly aiBroadcastEveryNTicks?: number
}

const DEFAULT_TICK_INTERVAL_MS = 200
const DEFAULT_AUTO_SAVE_INTERVAL = 50
const DEFAULT_AI_BROADCAST_INTERVAL = 10

export class GameRoom extends Room {
  override maxClients = 8
  private currentTick = 0
  private tickHandle: ReturnType<typeof setInterval> | null = null
  private readonly aiRegistry = new AIControllerRegistry()
  private readonly humanCivs = new Set<CivId>()
  private readonly clientByCivId = new Map<CivId, Client>()
  private readonly civIdByClient = new Map<string, CivId>()
  private alliances: CoopAlliance[] = []
  private coopConfig: CoopMatchConfig = DEFAULT_COOP_MATCH_CONFIG
  private lobby: Lobby = newLobby()
  private matchState: MatchState | null = null
  private readonly snapshotStore = new InMemorySnapshotStore()
  private autoSaveEveryNTicks = DEFAULT_AUTO_SAVE_INTERVAL
  private aiBroadcastEveryNTicks = DEFAULT_AI_BROADCAST_INTERVAL
  private rng: () => number = Math.random

  override onCreate(options: GameRoomCreateOptions): void {
    if (typeof options.maxPlayers === 'number') this.maxClients = options.maxPlayers
    if (options.coopConfig) this.coopConfig = options.coopConfig
    if (typeof options.autoSaveEveryNTicks === 'number') {
      this.autoSaveEveryNTicks = options.autoSaveEveryNTicks
    }
    if (typeof options.aiBroadcastEveryNTicks === 'number') {
      this.aiBroadcastEveryNTicks = options.aiBroadcastEveryNTicks
    }
    if (typeof options.seed === 'number') {
      this.rng = mulberry32(options.seed)
      this.lobby.config.rollSeed = options.seed
    }
    this.onMessage('*', (client, _type, message) => {
      if (!isProtocolMessage(message)) {
        this.sendProtocol(client, this.errMsg('PROTOCOL_INVALID', 'Bad shape'))
        return
      }
      if (!isClientToServerMessage(message)) {
        this.sendProtocol(
          client,
          this.errMsg('PROTOCOL_DIRECTION', `${message.type} is server-to-client`),
        )
        return
      }
      this.handleClientMessage(client, message)
    })
    const intervalMs = options.tickIntervalMs ?? DEFAULT_TICK_INTERVAL_MS
    this.tickHandle = setInterval(() => this.tickGame(), intervalMs)
  }

  // PHASE 18.1 — session-token validation. Colyseus calls onAuth before onJoin; throwing here
  // rejects the connection with the thrown error message. Anonymous players (no OAuth session)
  // pass through with a guest-XXXX token the client minted; signed-in players have a UUID
  // token issued by /api/auth/*/callback that we look up against the in-memory session map.
  // SMOL_MULTIPLAYER_AUTH=strict requires a real session — reject guests. Default is
  // permissive so single-host alpha playtests can join without a sign-in step.
  override onAuth(_client: Client, options: unknown): boolean {
    const opts = (options ?? {}) as { token?: string }
    const token = opts.token ?? ''
    const isGuest = token.startsWith('guest-')
    if (isGuest) {
      if (process.env.SMOL_MULTIPLAYER_AUTH === 'strict') {
        throw new Error('Guest tokens rejected — server in strict-auth mode. Sign in to play.')
      }
      return true
    }
    if (token.length === 0) {
      throw new Error('Missing session token. Reconnect via /api/matchmaking/join first.')
    }
    const session = lookupSessionToken(token)
    if (!session) {
      throw new Error(
        'Unknown session token. The auth server may have restarted (in-memory sessions clear). Sign in again.',
      )
    }
    return true
  }

  override onJoin(client: Client, options: unknown): void {
    const opts = (options ?? {}) as { displayName?: string; civId?: string }
    const civId = civIdValue(opts.civId ?? `civ-${client.sessionId}`)
    this.clientByCivId.set(civId, client)
    this.civIdByClient.set(client.sessionId, civId)
    this.humanCivs.add(civId)
    if (this.lobby.phase === 'CONFIGURING') {
      const slot = addHumanToLobby(this.lobby, {
        civId,
        displayName: opts.displayName ?? 'Player',
      })
      if (!slot) {
        this.sendProtocol(client, this.errMsg('LOBBY_FULL', 'No empty slots.'))
        return
      }
      rollSlotThemes(this.lobby, this.rng)
      this.broadcastLobbyState()
    } else if (this.matchState) {
      const perCiv = this.matchState.civs.get(civId)
      if (perCiv && perCiv.disconnected && perCiv.takenOverByAI) {
        returnHumanControl(this.matchState, civId)
        this.aiRegistry.unregister(civId)
      }
    }
  }

  override onLeave(client: Client, _consented: boolean): void | Promise<void> {
    const civId = this.civIdByClient.get(client.sessionId)
    if (!civId) return
    this.civIdByClient.delete(client.sessionId)
    this.clientByCivId.delete(civId)
    if (this.lobby.phase === 'CONFIGURING') {
      removeFromLobby(this.lobby, civId)
      this.humanCivs.delete(civId)
      this.broadcastLobbyState()
      return
    }
    if (this.matchState) {
      const perCiv = this.matchState.civs.get(civId)
      if (perCiv && perCiv.alive && perCiv.assignment.isHuman) {
        this.takeOverWithAI(civId)
      }
    }
  }

  override onDispose(): void | Promise<void> {
    if (this.tickHandle) {
      clearInterval(this.tickHandle)
      this.tickHandle = null
    }
    if (this.matchState) {
      this.snapshotStore.save(captureSnapshot(this.matchState))
    }
  }

  applyCoopConfig(config: CoopMatchConfig): void {
    this.coopConfig = config
  }

  getCoopConfig(): CoopMatchConfig {
    return this.coopConfig
  }

  setAlliances(alliances: ReadonlyArray<CoopAlliance>): void {
    this.alliances = [...alliances]
  }

  registerAIController(controller: AIController): void {
    this.aiRegistry.register(controller)
  }

  registerHumanCiv(civId: CivId): void {
    this.humanCivs.add(civId)
  }

  startMatch(seed: number, planetCount: number): void {
    if (this.lobby.phase !== 'STARTING') return
    if (this.matchState) return
    const civAssignments: CivAssignment[] = []
    const slots = activeSlots(this.lobby)
    const startingPlanets = pickStartingPlanets(slots.length, seed)
    slots.forEach((slot, i) => {
      if (!slot.civId || !slot.themeId) return
      civAssignments.push({
        civId: slot.civId,
        themeId: slot.themeId,
        startingPlanetId: startingPlanets[i] ?? startingPlanets[0]!,
        displayName: slot.displayName,
        isHuman: slot.kind === 'human',
      })
    })

    this.matchState = newMatchState({
      matchId: `match-${seed}-${Date.now()}`,
      seed,
      planetCount,
      civAssignments,
    })
    this.matchState.startedAtTick = this.currentTick

    for (const slot of slots) {
      if (
        slot.kind === 'ai' &&
        slot.civId &&
        slot.aiPlaystyle &&
        slot.aiDifficulty &&
        slot.themeId
      ) {
        const perCiv = this.matchState.civs.get(slot.civId)
        if (!perCiv) continue
        const controller = new AIController({
          civId: slot.civId,
          empire: perCiv.empire,
          theme: perCiv.theme,
          playstyleArchetype: slot.aiPlaystyle,
          difficulty: slot.aiDifficulty,
          decisionOffsetTicks: slot.slotIndex,
          rngSeed: seed + slot.slotIndex,
        })
        this.aiRegistry.register(controller)
      }
    }

    transitionToInMatch(this.lobby, this.matchState.matchId)
    this.broadcastMatchStarted(seed, planetCount, civAssignments)
  }

  takeOverWithAI(civId: CivId): boolean {
    if (!this.matchState) return false
    const controller = buildAITakeoverController(this.matchState, {
      civId,
      playstyleArchetype: DEFAULT_DISCONNECT_PLAYSTYLE,
      difficulty: DEFAULT_DISCONNECT_DIFFICULTY,
      decisionOffsetTicks: this.aiRegistry.size(),
      rngSeed: this.matchState.seed + this.aiRegistry.size(),
    })
    if (!controller) return false
    this.aiRegistry.register(controller)
    return true
  }

  getMatchState(): MatchState | null {
    return this.matchState
  }

  getLobby(): Lobby {
    return this.lobby
  }

  loadFromSnapshot(matchId: string): boolean {
    const snap = this.snapshotStore.load(matchId)
    return snap !== null
  }

  private isHumanCiv(civId: CivId): boolean {
    return this.humanCivs.has(civId)
  }

  private hostileResolver(sourceCivId: CivId, targetCivId: CivId): boolean {
    return isAIHostileToTarget(sourceCivId, targetCivId, this.alliances, (cid) =>
      this.isHumanCiv(cid),
    )
  }

  private clientRegistry(): ClientRegistry {
    const clientByCivId = this.clientByCivId
    return {
      send: (client, msg) => this.sendProtocol(client, msg),
      clientForCiv: (civId) => clientByCivId.get(civId) ?? null,
      allClients: () => {
        const out: { client: Client; civId: CivId }[] = []
        for (const [civId, client] of clientByCivId) out.push({ client, civId })
        return out
      },
    }
  }

  private tickGame(): void {
    this.currentTick += 1
    if (!this.matchState) return
    this.matchState.currentTick = this.currentTick

    if (this.aiRegistry.size() > 0) {
      const results = this.aiRegistry.tickAll(
        this.currentTick,
        (controller) => buildObservablesForCiv(this.matchState!, controller),
        (sourceCivId, targetCivId) => this.hostileResolver(sourceCivId, targetCivId),
      )
      if (this.currentTick % this.aiBroadcastEveryNTicks === 0) {
        for (const result of results) {
          if (result.snapshot) this.broadcastAIPlayerState(result.snapshot.civId)
        }
      }
    }

    const tickMsg: TickMessage = {
      type: 'TICK',
      v: PROTOCOL_VERSION,
      tick: this.currentTick,
    }
    broadcastToAll(this.clientRegistry(), tickMsg)

    if (this.currentTick % 10 === 0) {
      this.broadcastMatchStateSync()
    }

    if (this.currentTick % this.autoSaveEveryNTicks === 0) {
      this.snapshotStore.save(captureSnapshot(this.matchState))
    }

    const tickCap = effectiveTickCap(this.lobby.config)
    const aliveCivIds: CivId[] = []
    for (const civ of this.matchState.civs.values()) {
      if (civ.alive) aliveCivIds.push(civ.assignment.civId)
    }
    const civProgress = this.computeObjectiveProgress(aliveCivIds)
    const elapsedSinceStart =
      this.matchState.startedAtTick !== null
        ? this.currentTick - this.matchState.startedAtTick
        : this.currentTick
    const resolution = resolveMatchEnd({
      enabledObjectives: this.lobby.config.missionObjectives,
      civProgress,
      aliveCivIds,
      currentTick: elapsedSinceStart,
      tickCap,
    })
    if (resolution.ended) {
      this.endMatch(resolution.winningCivId, resolution.reason, resolution.resolvedObjectiveId)
    }
  }

  private computeObjectiveProgress(
    aliveCivIds: ReadonlyArray<CivId>,
  ): Map<MissionObjectiveId, ReadonlyArray<{ civId: CivId; value: number }>> {
    const out = new Map<MissionObjectiveId, ReadonlyArray<{ civId: CivId; value: number }>>()
    if (!this.matchState) return out
    const highscore: { civId: CivId; value: number }[] = []
    const resource: { civId: CivId; value: number }[] = []
    const apex: { civId: CivId; value: number }[] = []
    for (const civId of aliveCivIds) {
      const civ = this.matchState.civs.get(civId)
      if (!civ) continue
      let civHighscore = 0
      let civResources = 0
      civHighscore += civ.empire.controlledPlanetIds.size * 1000
      civHighscore += civ.empire.defeatedCivIds.size * 5000
      civHighscore += civ.empire.researchedTechs.size * 200
      civHighscore += civ.ledger.colonyShipsLaunched * 50
      civHighscore += civ.ledger.enemyCivilizationsDestroyed * 2000
      for (const planetId of civ.empire.controlledPlanetIds) {
        const ps = this.matchState.planetStates.get(planetId)
        if (!ps) continue
        for (const amount of ps.inventory.stocks.values()) civResources += amount
      }
      highscore.push({ civId, value: civHighscore })
      resource.push({ civId, value: civResources })
      apex.push({ civId, value: hasWonByTech(civ.empire) ? 1 : 0 })
    }
    out.set('highscore_target', highscore)
    out.set('resource_target', resource)
    out.set('apex_tech', apex)
    return out
  }

  private endMatch(
    winningCivId: CivId | null,
    reason: 'objective_met' | 'tick_cap_hit' | 'admin_end' | null,
    resolvedObjectiveId: MissionObjectiveId | null,
  ): void {
    if (!this.matchState) return
    this.matchState.endedAtTick = this.currentTick
    if (winningCivId) this.matchState.winningCivId = winningCivId
    const protocolReason: MatchEndReason = mapEndReasonToProtocol(reason, resolvedObjectiveId)
    broadcastToAll(this.clientRegistry(), {
      type: 'MATCH_ENDED',
      v: PROTOCOL_VERSION,
      reason: protocolReason,
      winningCivId: this.matchState.winningCivId,
    })
  }

  private broadcastLobbyState(): void {
    const players: LobbyStateMessage['players'] = activeSlots(this.lobby).map((s) => ({
      civId: s.civId ?? civIdValue(''),
      displayName: s.displayName,
      themeId: s.themeId ?? themeIdValue(''),
      ready: s.ready,
    }))
    const msg: LobbyStateMessage = {
      type: 'LOBBY_STATE',
      v: PROTOCOL_VERSION,
      players,
    }
    broadcastToAll(this.clientRegistry(), msg)
  }

  private broadcastMatchStarted(
    seed: number,
    planetCount: number,
    civAssignments: ReadonlyArray<CivAssignment>,
  ): void {
    const msg: MatchStartedMessage = {
      type: 'MATCH_STARTED',
      v: PROTOCOL_VERSION,
      seed,
      planetCount,
      civAssignments: civAssignments.map((a) => ({
        civId: a.civId,
        themeId: a.themeId,
        startingPlanetId: a.startingPlanetId,
      })),
    }
    broadcastToAll(this.clientRegistry(), msg)
  }

  private broadcastMatchStateSync(): void {
    if (!this.matchState) return
    const counts = controlledPlanetsByCiv(this.matchState)
    const totalControlledPlanets: { civId: CivId; count: number }[] = []
    for (const [civId, planetIds] of counts) {
      totalControlledPlanets.push({ civId, count: planetIds.length })
    }
    let aliveCount = 0
    for (const civ of this.matchState.civs.values()) {
      if (civ.alive) aliveCount += 1
    }
    const msg: MatchStateSyncMessage = {
      type: 'MATCH_STATE_SYNC',
      v: PROTOCOL_VERSION,
      tick: this.currentTick,
      civCount: this.matchState.civs.size,
      aliveCivCount: aliveCount,
      totalControlledPlanets,
    }
    broadcastWithFogOfWar(this.matchState, this.clientRegistry(), msg)
  }

  private broadcastAIPlayerState(civId: CivId): void {
    if (!this.matchState) return
    const controller = this.aiRegistry.get(civId)
    if (!controller) return
    const perCiv = this.matchState.civs.get(civId)
    if (!perCiv) return
    const msg: AIPlayerStateMessage = {
      type: 'AI_PLAYER_STATE',
      v: PROTOCOL_VERSION,
      civId,
      themeId: perCiv.assignment.themeId,
      playstyleArchetype: controller.playstyle.archetype,
      difficultyLevel: controller.difficultyConfig.level,
      lastDecisionLine: controller.lastSnapshot
        ? `tick=${controller.lastDecidedTick} | applied`
        : null,
      lastDecidedTick: controller.lastDecidedTick,
    }
    broadcastWithFogOfWar(this.matchState, this.clientRegistry(), msg)
  }

  private handleClientMessage(client: Client, message: ClientToServerMessage): void {
    const civId = this.civIdByClient.get(client.sessionId)
    if (!civId) {
      this.sendProtocol(client, this.errMsg('NO_CIV', 'No civ assigned to this connection.'))
      return
    }
    const ctx: HandlerContext = {
      state: this.matchState,
      lobby: this.lobby,
      actorCivId: civId,
    }
    const outcome = dispatchClientMessage(ctx, message)
    if (outcome.error) {
      this.sendProtocol(client, outcome.error)
      return
    }
    for (const direct of outcome.direct) {
      this.sendProtocol(client, direct)
    }
    if (this.matchState) {
      for (const broadcast of outcome.broadcast) {
        broadcastWithFogOfWar(this.matchState, this.clientRegistry(), broadcast)
      }
    } else {
      for (const broadcast of outcome.broadcast) {
        broadcastToAll(this.clientRegistry(), broadcast)
      }
    }

    if (message.type === 'START_MATCH' && this.lobby.phase === 'STARTING') {
      this.startMatch(message.seed, message.planetCount)
    }
    if (message.type === 'JOIN_LOBBY') {
      this.broadcastLobbyState()
    }
  }

  private sendProtocol(client: Client, message: ServerToClientMessage): void {
    client.send(message.type, message)
  }

  private errMsg(code: string, detail: string): ServerToClientMessage {
    return { type: 'ERROR', v: PROTOCOL_VERSION, code, detail }
  }
}

function isProtocolMessage(value: unknown): value is AnyProtocolMessage {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { type?: unknown; v?: unknown }
  return typeof v.type === 'string' && typeof v.v === 'number'
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickStartingPlanets(count: number, _seed: number): PlanetId[] {
  const out: PlanetId[] = []
  for (let i = 0; i < count; i++) {
    out.push(planetIdValue(`planet-${i}`))
  }
  return out
}

function mapEndReasonToProtocol(
  reason: 'objective_met' | 'tick_cap_hit' | 'admin_end' | null,
  objectiveId: MissionObjectiveId | null,
): MatchEndReason {
  if (reason === 'tick_cap_hit') return 'admin-end'
  if (reason === 'admin_end' || reason === null) return 'admin-end'
  if (objectiveId === 'apex_tech') return 'apex-tech'
  if (objectiveId === 'last_civ_standing') return 'last-civ-standing'
  if (objectiveId === 'highscore_target') return 'score'
  if (objectiveId === 'resource_target') return 'score'
  return 'admin-end'
}
