import { Room, type Client } from '@colyseus/core'
import {
  type AnyProtocolMessage,
  type ClientToServerMessage,
  PROTOCOL_VERSION,
  isClientToServerMessage,
} from '@smol/shared'

export interface GameRoomCreateOptions {
  readonly seed?: number
  readonly maxPlayers?: number
}

export class GameRoom extends Room {
  override maxClients = 8

  override onCreate(options: GameRoomCreateOptions): void {
    if (typeof options.maxPlayers === 'number') this.maxClients = options.maxPlayers
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
  }

  override onJoin(_client: Client, _options: unknown): void {
    // PHASE 10 wiring: assign civ/theme + send LOBBY_STATE
  }

  override onLeave(_client: Client, _consented: boolean): void | Promise<void> {
    // PHASE 10 wiring: handle disconnects + civ-suspension policy
  }

  override onDispose(): void | Promise<void> {
    // PHASE 10 wiring: persist final match record to Hall of Champions
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
