import { Room, type Client } from '@colyseus/core'
import {
  type AnyProtocolMessage,
  type ClientToServerMessage,
  type CivId,
  type CoopAlliance,
  type CoopMatchConfig,
  DEFAULT_COOP_MATCH_CONFIG,
  PROTOCOL_VERSION,
  isAIHostileToTarget,
  isClientToServerMessage,
} from '@smol/shared'
import { AIControllerRegistry, type AITickObservables, type AIController } from '../ai/AIController'

export interface GameRoomCreateOptions {
  readonly seed?: number
  readonly maxPlayers?: number
  readonly tickIntervalMs?: number
  readonly coopConfig?: CoopMatchConfig
}

const DEFAULT_TICK_INTERVAL_MS = 100

export class GameRoom extends Room {
  override maxClients = 8
  private currentTick = 0
  private tickHandle: ReturnType<typeof setInterval> | null = null
  private readonly aiRegistry = new AIControllerRegistry()
  private readonly humanCivs = new Set<CivId>()
  private alliances: CoopAlliance[] = []
  private coopConfig: CoopMatchConfig = DEFAULT_COOP_MATCH_CONFIG

  override onCreate(options: GameRoomCreateOptions): void {
    if (typeof options.maxPlayers === 'number') this.maxClients = options.maxPlayers
    if (options.coopConfig) this.coopConfig = options.coopConfig
    this.onMessage('*', (client, _type, message) => {
      if (!isProtocolMessage(message)) {
        this.sendProtocol(client, {
          type: 'ERROR',
          v: PROTOCOL_VERSION,
          code: 'PROTOCOL_INVALID',
          detail: 'Message did not match protocol shape',
        })
        return
      }
      if (!isClientToServerMessage(message)) {
        this.sendProtocol(client, {
          type: 'ERROR',
          v: PROTOCOL_VERSION,
          code: 'PROTOCOL_DIRECTION',
          detail: `Message type ${message.type} is server-to-client; not accepted from client.`,
        })
        return
      }
      this.handleClientMessage(client, message)
    })
    const intervalMs = options.tickIntervalMs ?? DEFAULT_TICK_INTERVAL_MS
    this.tickHandle = setInterval(() => this.tickGame(), intervalMs)
  }

  override onJoin(_client: Client, _options: unknown): void {
    // PHASE 10 wiring: assign civ/theme + send LOBBY_STATE
  }

  override onLeave(_client: Client, _consented: boolean): void | Promise<void> {
    // PHASE 10 wiring: handle disconnects + civ-suspension policy
  }

  override onDispose(): void | Promise<void> {
    if (this.tickHandle) {
      clearInterval(this.tickHandle)
      this.tickHandle = null
    }
    // PHASE 10 wiring: persist final match record to Hall of Champions
  }

  registerAIController(controller: AIController): void {
    this.aiRegistry.register(controller)
  }

  registerHumanCiv(civId: CivId): void {
    this.humanCivs.add(civId)
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

  private isHumanCiv(civId: CivId): boolean {
    return this.humanCivs.has(civId)
  }

  private hostileResolver(sourceCivId: CivId, targetCivId: CivId): boolean {
    return isAIHostileToTarget(sourceCivId, targetCivId, this.alliances, (cid) =>
      this.isHumanCiv(cid),
    )
  }

  private buildObservablesForController(_controller: AIController): AITickObservables {
    return {
      buildingCtx: null,
      unlockedBuildings: null,
      shipCtx: null,
      observedEnemies: [],
      campaignCtx: null,
      resourceSurplusRatio: 0,
    }
  }

  private tickGame(): void {
    this.currentTick += 1
    if (this.aiRegistry.size() > 0) {
      this.aiRegistry.tickAll(
        this.currentTick,
        (controller) => this.buildObservablesForController(controller),
        (sourceCivId, targetCivId) => this.hostileResolver(sourceCivId, targetCivId),
      )
    }
  }

  private handleClientMessage(_client: Client, _message: ClientToServerMessage): void {
    // PHASE 10 wiring: dispatch to per-message handlers
  }

  private sendProtocol(client: Client, message: AnyProtocolMessage): void {
    client.send(message.type, message)
  }
}

function isProtocolMessage(value: unknown): value is AnyProtocolMessage {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { type?: unknown; v?: unknown }
  return typeof v.type === 'string' && typeof v.v === 'number'
}
