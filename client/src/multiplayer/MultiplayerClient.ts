// Real colyseus.js wire-up. The server runs Colyseus 0.16 (server/src/index.ts:
//   `server.define('smol_match', GameRoom)`) and its GameRoom.onAuth validates the bearer
// token. This module is the thin façade the React layer uses — joinSmolMatch wraps
// `Client.joinOrCreate('smol_match', {token})` and exposes a stable handle for send/leave.
//
// Previously this file shipped a raw-WebSocket adapter that couldn't speak Colyseus protocol
// (binary MessagePack envelopes + state-replication). Super-review 2026-05-12 caught that and
// the rewrite landed alongside the `colyseus.js` install on the same day.

import { Client, Room } from 'colyseus.js'

export type RoomLifecycleState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'

export interface JoinHandlers {
  readonly onOpen?: (info: { readonly roomId: string; readonly sessionId: string }) => void
  readonly onMessage?: (type: string, payload: unknown) => void
  readonly onError?: (err: Error) => void
  readonly onLeave?: (code: number) => void
}

export interface JoinSmolMatchInputs {
  // Colyseus WS host — e.g. `ws://localhost:2567` (dev) or `wss://smol.unityailab.com` (prod).
  readonly host: string
  // Session token. UUID for signed-in users (issued by /api/auth/<provider>/callback) or
  // `guest-<UUIDv4>` for guests (mint via `mintGuestToken`). GameRoom.onAuth validates this.
  readonly sessionToken: string
  // Optional join hints forwarded to GameRoom.onJoin.
  readonly options?: {
    readonly displayName?: string
    readonly civId?: string
  }
  readonly handlers: JoinHandlers
}

export interface SmolRoomHandle {
  readonly roomId: string
  readonly sessionId: string
  readonly send: (type: string, payload?: unknown) => void
  readonly leave: () => Promise<void>
  readonly state: () => RoomLifecycleState
}

// Tracks the live room's lifecycle so `state()` reports accurately after leave/close.
function makeHandle(room: Room): SmolRoomHandle {
  let phase: RoomLifecycleState = 'OPEN'
  room.onLeave(() => {
    phase = 'CLOSED'
  })
  return {
    roomId: room.roomId,
    sessionId: room.sessionId,
    send: (type, payload) => {
      if (phase !== 'OPEN') return
      // Colyseus 0.16 accepts string OR number for the type. We stick with strings.
      room.send(type, payload)
    },
    leave: async () => {
      if (phase === 'CLOSED' || phase === 'CLOSING') return
      phase = 'CLOSING'
      try {
        await room.leave(true)
      } finally {
        phase = 'CLOSED'
      }
    },
    state: () => phase,
  }
}

export async function joinSmolMatch(input: JoinSmolMatchInputs): Promise<SmolRoomHandle | null> {
  try {
    const client = new Client(input.host)
    const joinOptions = {
      token: input.sessionToken,
      ...input.options,
    }
    const room: Room = await client.joinOrCreate('smol_match', joinOptions)
    room.onMessage('*', (type, message) => {
      // Colyseus passes the message type back as the first arg; surface it raw so the caller
      // can route by type without knowing about colyseus.js internals.
      input.handlers.onMessage?.(String(type), message)
    })
    room.onError((code, message) => {
      const err = new Error(`Colyseus room error ${code}${message ? `: ${message}` : ''}`)
      input.handlers.onError?.(err)
    })
    room.onLeave((code) => {
      input.handlers.onLeave?.(code)
    })
    // Fire onOpen synchronously now that the room is connected and we've wired the listeners.
    input.handlers.onOpen?.({ roomId: room.roomId, sessionId: room.sessionId })
    return makeHandle(room)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    input.handlers.onError?.(error)
    return null
  }
}

// ─── Auth pre-check + guest-token mint ──────────────────────────────────────
// The auth HTTP server (server/src/auth/httpServer.ts) exposes two helper endpoints used
// before the actual Colyseus join:
//   POST /api/auth/guest             → returns { sessionToken } for anonymous joins
//   POST /api/matchmaking/join       → validates token + returns { host, tokenIsGuest }
//                                       (host is the Colyseus WS endpoint to pass to
//                                       joinSmolMatch). Colyseus handles real matchmaking
//                                       internally via its own /matchmake HTTP route, but
//                                       this endpoint is the early sanity check that lets
//                                       the client fail-fast on bad tokens.

export interface MatchmakingPreferences {
  readonly preferredThemeId?: string
  readonly preferredGalaxySize?: string
  readonly coopWithAccountIds?: ReadonlyArray<string>
}

export interface MatchmakingPreCheckResult {
  readonly host: string
  readonly tokenIsGuest: boolean
}

export async function requestMatchmaking(input: {
  readonly authServerUrl: string
  readonly sessionToken: string
  readonly preferences: MatchmakingPreferences
}): Promise<MatchmakingPreCheckResult | null> {
  try {
    const response = await fetch(`${input.authServerUrl.replace(/\/$/, '')}/api/matchmaking/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.sessionToken}`,
      },
      body: JSON.stringify(input.preferences),
    })
    if (!response.ok) return null
    const body = (await response.json()) as {
      host?: string
      tokenIsGuest?: boolean
    }
    if (!body.host) return null
    return { host: body.host, tokenIsGuest: body.tokenIsGuest ?? false }
  } catch (err) {
    console.warn('[smol/multiplayer] Matchmaking pre-check failed:', err)
    return null
  }
}

export async function mintGuestToken(authServerUrl: string): Promise<string | null> {
  try {
    const response = await fetch(`${authServerUrl.replace(/\/$/, '')}/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (!response.ok) return null
    const body = (await response.json()) as { sessionToken?: string }
    return body.sessionToken ?? null
  } catch (err) {
    console.warn('[smol/multiplayer] Guest-token mint failed:', err)
    return null
  }
}

// ─── Backwards-compat: thin shim wrapping joinSmolMatch ─────────────────────
// MultiplayerPage previously imported `connectToRoom` from this module with a raw-WebSocket
// signature. The new flow is `joinSmolMatch` — but existing callers can keep using
// connectToRoom by adapting the signature. The roomId arg is now ignored (Colyseus assigns
// its own roomId via joinOrCreate); we still accept it for back-compat.

export interface MultiplayerSocketHandlers {
  readonly onOpen?: () => void
  readonly onMessage?: (envelope: { type: string; payload: unknown }) => void
  readonly onError?: (err: Error) => void
  readonly onClose?: (code: number, reason: string) => void
}

export interface MultiplayerSocketHandle {
  readonly send: (type: string, payload: unknown) => void
  readonly close: () => void
  readonly state: () => RoomLifecycleState
}

export function connectToRoom(inputs: {
  readonly host: string
  readonly roomId: string
  readonly sessionToken: string
  readonly handlers: MultiplayerSocketHandlers
}): MultiplayerSocketHandle {
  let handle: SmolRoomHandle | null = null
  let pendingPhase: RoomLifecycleState = 'CONNECTING'
  void joinSmolMatch({
    host: inputs.host,
    sessionToken: inputs.sessionToken,
    handlers: {
      onOpen: () => {
        inputs.handlers.onOpen?.()
      },
      onMessage: (type, payload) => {
        inputs.handlers.onMessage?.({ type, payload })
      },
      onError: (err) => {
        inputs.handlers.onError?.(err)
      },
      onLeave: (code) => {
        inputs.handlers.onClose?.(code, '')
        pendingPhase = 'CLOSED'
      },
    },
  }).then((h) => {
    handle = h
    pendingPhase = h ? 'OPEN' : 'CLOSED'
  })
  return {
    send: (type, payload) => handle?.send(type, payload),
    close: () => {
      void handle?.leave()
    },
    state: () => handle?.state() ?? pendingPhase,
  }
}

// Lobby discovery (Colyseus exposes /matchmake/<roomName>) is intentionally NOT exported
// here — the API surface differs across colyseus.js minor versions. Add a thin wrapper when
// the UI needs the open-rooms list.
