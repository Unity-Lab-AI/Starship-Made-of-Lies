import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { THEMES, themeAsCSSVars } from '@smol/shared'
import { connectToRoom, requestMatchmaking } from '../../multiplayer/MultiplayerClient'
import './SubPage.css'
import './MultiplayerPage.css'

// PHASE 18.1 — multiplayer client wire-up. The Colyseus + auth server is host-side work
// gated on Layer E #3 (Postgres install + OAuth provider creds). When the server is down,
// the matchmaking call fails fast with a clear error so the player sees real network
// feedback instead of a forever-disabled button.
//
// Default host targets the dev Vite proxy at localhost; production builds should override
// via VITE_SMOL_AUTH_URL env var at build time. The Colyseus WS host is returned by the
// matchmaking endpoint per-room so the client doesn't need to bake it in here.
const DEFAULT_AUTH_URL =
  (import.meta.env?.VITE_SMOL_AUTH_URL as string | undefined) ?? 'http://localhost:2568'

export function MultiplayerPage() {
  const theme = THEMES[0]!
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])
  const [status, setStatus] = useState<string>('Idle — sign in then click Join.')
  const [busy, setBusy] = useState<boolean>(false)

  const handleJoin = async (): Promise<void> => {
    setBusy(true)
    setStatus('Requesting matchmaking…')
    // PHASE 18.1 — pull session token from localStorage (set by the OAuth callback flow).
    // Anonymous players get auto-guest behavior server-side, but the matchmaking endpoint
    // requires SOME token; we fall back to a generated guest token.
    let sessionToken: string
    try {
      sessionToken =
        window.localStorage.getItem('smol.session.token.v1') ??
        `guest-${Math.random().toString(36).slice(2, 10)}`
    } catch {
      sessionToken = `guest-${Math.random().toString(36).slice(2, 10)}`
    }
    const matchmaking = await requestMatchmaking({
      authServerUrl: DEFAULT_AUTH_URL,
      sessionToken,
      preferences: {},
    })
    if (!matchmaking) {
      setStatus(
        `Matchmaking unavailable — server may be offline. Tried ${DEFAULT_AUTH_URL}/api/matchmaking/join. ` +
          'Activate via Layer E #3 (Postgres + OAuth creds + Colyseus server).',
      )
      setBusy(false)
      return
    }
    setStatus(`Connecting to room ${matchmaking.roomId} at ${matchmaking.host}…`)
    connectToRoom({
      host: matchmaking.host,
      roomId: matchmaking.roomId,
      sessionToken,
      handlers: {
        onOpen: () => setStatus(`Connected. Joined room ${matchmaking.roomId}.`),
        onMessage: (envelope) => {
          console.info('[smol/multiplayer] message:', envelope.type)
        },
        onError: () => setStatus('Connection error — see browser console for details.'),
        onClose: (code, reason) =>
          setStatus(
            `Disconnected (code ${code})${reason ? ` — ${reason}` : ''}. Click Join to reconnect.`,
          ),
      },
    })
    setBusy(false)
  }

  return (
    <div className="sub-page" style={styleVars as React.CSSProperties}>
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Multiplayer</h1>
      </header>
      <main className="multiplayer-page__content">
        <section className="multiplayer-page__rooms" aria-labelledby="room-list-heading">
          <h2 id="room-list-heading">Open lobbies</h2>
          <div className="multiplayer-page__empty">
            <p>
              Multiplayer client is wired to the Colyseus server endpoint. When the server is live +
              your account is signed in, Join routes you into matchmaking and onward to the assigned
              room. When the server is down, you'll see a clear failure message.
            </p>
            <p className="multiplayer-page__hint">
              For now, play single-player from the main menu — Continue As Guest works and records
              progress locally.
            </p>
            <p className="multiplayer-page__status" role="status">
              {status}
            </p>
          </div>
          <div className="multiplayer-page__actions">
            <button
              type="button"
              className="multiplayer-page__btn"
              onClick={() => {
                void handleJoin()
              }}
              disabled={busy}
            >
              ▶ Join lobby
            </button>
            <button type="button" disabled className="multiplayer-page__btn">
              ＋ Host new lobby (server-side, coming)
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
