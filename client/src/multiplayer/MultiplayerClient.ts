// PHASE 18.1 — client-side multiplayer connection scaffold. The server already ships with
// Colyseus 0.16 + GameRoom + handlers (server/src/rooms/GameRoom.ts). This module is the
// client wire-up — a thin WebSocket adapter that lets the React layer subscribe to room
// state messages, send commands, and react to connection lifecycle without pulling in the
// full `colyseus.js` package dependency.
//
// Protocol assumptions (mirror server/src/match/handlers.ts):
//   - Connection: WebSocket to wss://host/colyseus/<roomId>?token=<sessionToken>
//   - Inbound messages: JSON {type: string, payload: object} pushed by GameRoom.broadcast
//   - Outbound messages: same envelope, client→server via socket.send(JSON.stringify(...))
//
// Used by PlayPage when MatchConfig.multiplayerMode === true. The single-player path skips
// this entirely — useMatchSim's local sim drives state without a network round-trip.
//
// Not yet wired into PlayPage — the multiplayer-lobby UI + matchmaking flow is the
// connecting tissue (PHASE 18.1.X polish). Module exists so adopters have a stable API.

export interface MultiplayerSocketHandlers {
  readonly onOpen?: () => void
  readonly onMessage?: (envelope: { type: string; payload: unknown }) => void
  readonly onError?: (err: Event) => void
  readonly onClose?: (code: number, reason: string) => void
}

export interface MultiplayerSocketHandle {
  readonly send: (type: string, payload: unknown) => void
  readonly close: () => void
  readonly state: () => 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'
}

export interface MultiplayerConnectInputs {
  // Host URL (e.g. wss://smol.unityailab.com or ws://localhost:2567)
  readonly host: string
  // Room id / match id assigned by the matchmaking step. Server routes this to its
  // GameRoom.onJoin handler.
  readonly roomId: string
  // Session token from the OAuth sign-in flow (httpServer.ts /api/auth/*/callback returns
  // sessionToken). Server-side handler validates the token before admitting the connection.
  readonly sessionToken: string
  readonly handlers: MultiplayerSocketHandlers
}

export function connectToRoom(inputs: MultiplayerConnectInputs): MultiplayerSocketHandle {
  // URL-encode the token so special characters don't break the query string.
  const url =
    `${inputs.host.replace(/\/$/, '')}/colyseus/${encodeURIComponent(inputs.roomId)}` +
    `?token=${encodeURIComponent(inputs.sessionToken)}`
  const socket = new WebSocket(url)
  socket.addEventListener('open', () => inputs.handlers.onOpen?.())
  socket.addEventListener('message', (e) => {
    if (typeof e.data !== 'string') return
    try {
      const envelope = JSON.parse(e.data) as { type: string; payload: unknown }
      inputs.handlers.onMessage?.(envelope)
    } catch (err) {
      console.warn('[smol/multiplayer] Malformed message:', err)
    }
  })
  socket.addEventListener('error', (e) => inputs.handlers.onError?.(e))
  socket.addEventListener('close', (e) => inputs.handlers.onClose?.(e.code, e.reason))
  function stateLabel(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' {
    switch (socket.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'OPEN'
      case WebSocket.CLOSING:
        return 'CLOSING'
      default:
        return 'CLOSED'
    }
  }
  return {
    send: (type, payload) => {
      if (socket.readyState !== WebSocket.OPEN) return
      socket.send(JSON.stringify({ type, payload }))
    },
    close: () => socket.close(1000, 'Client closed'),
    state: stateLabel,
  }
}

// PHASE 18.1 — REST helper for the matchmaking step. Server's auth HTTP server exposes
// /api/matchmaking/join (when wired); client POSTs preferences + receives a {roomId, host}
// pair to feed into connectToRoom. Until the matchmaking endpoint exists, callers can stub
// roomId locally and skip this function. Returns null on auth failure / no room available.
export interface MatchmakingPreferences {
  readonly preferredThemeId?: string
  readonly preferredGalaxySize?: string
  readonly coopWithAccountIds?: ReadonlyArray<string>
}

export interface MatchmakingResult {
  readonly roomId: string
  readonly host: string // ws / wss URL
}

export async function requestMatchmaking(input: {
  readonly authServerUrl: string
  readonly sessionToken: string
  readonly preferences: MatchmakingPreferences
}): Promise<MatchmakingResult | null> {
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
    return (await response.json()) as MatchmakingResult
  } catch (err) {
    console.warn('[smol/multiplayer] Matchmaking request failed:', err)
    return null
  }
}
