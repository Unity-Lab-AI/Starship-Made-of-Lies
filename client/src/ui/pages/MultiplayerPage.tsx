import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { THEMES, themeAsCSSVars } from '@smol/shared'
import { DEMO_BUILD_LABEL, IS_DEMO_BUILD } from '../../config/buildMode'
import {
  joinSmolMatch,
  mintGuestToken,
  requestMatchmaking,
  type SmolRoomHandle,
} from '../../multiplayer/MultiplayerClient'
import './SubPage.css'
import './MultiplayerPage.css'

// Multiplayer client wire-up over real colyseus.js. Three-step flow:
//   1. Ensure session token in localStorage (mint a guest one if missing).
//   2. POST /api/matchmaking/join for the Colyseus host hint + token pre-check.
//   3. Client.joinOrCreate('smol_match', {token}) via joinSmolMatch().
//
// Default host targets the dev auth server at localhost:2568; production builds should
// override via VITE_SMOL_AUTH_URL env var at build time.
const DEFAULT_AUTH_URL =
  (import.meta.env?.VITE_SMOL_AUTH_URL as string | undefined) ?? 'http://localhost:2568'

const SESSION_TOKEN_KEY = 'smol.session.token.v1'

function readLocalSessionToken(): string | null {
  try {
    return window.localStorage.getItem(SESSION_TOKEN_KEY)
  } catch {
    return null
  }
}

function writeLocalSessionToken(token: string): void {
  try {
    window.localStorage.setItem(SESSION_TOKEN_KEY, token)
  } catch {
    // localStorage disabled (private browsing, etc.) — caller falls back to in-memory token.
  }
}

export function MultiplayerPage() {
  const theme = THEMES[0]!
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])
  const [status, setStatus] = useState<string>(
    'Idle — click Join (signs you in as guest if needed).',
  )
  const [busy, setBusy] = useState<boolean>(false)
  const roomHandleRef = useRef<SmolRoomHandle | null>(null)

  // Worker that does the three-step flow. `isRetry=true` is the recursion path after a 401
  // wiped a stale localStorage token — we mint a fresh guest token + try once more. Cap at
  // one retry so a persistently-misconfigured server doesn't infinite-loop.
  const attemptJoin = async (isRetry: boolean): Promise<void> => {
    // ─── Step 1: ensure we have a session token ─────────────────────────────
    let sessionToken = readLocalSessionToken()
    if (!sessionToken) {
      setStatus('Minting guest session token…')
      const minted = await mintGuestToken(DEFAULT_AUTH_URL)
      if (!minted) {
        setStatus(
          `Guest token mint failed — auth server may be offline at ${DEFAULT_AUTH_URL}. ` +
            'Start it with `pnpm dev:server` (port 2568).',
        )
        setBusy(false)
        return
      }
      writeLocalSessionToken(minted)
      sessionToken = minted
    }
    // ─── Step 2: matchmaking pre-check ──────────────────────────────────────
    setStatus('Pre-checking matchmaking…')
    const pre = await requestMatchmaking({
      authServerUrl: DEFAULT_AUTH_URL,
      sessionToken,
      preferences: {},
    })
    if (!pre.ok) {
      // 401 → server doesn't know this token. Most common cause: server was restarted
      // (in-memory session map wiped) but the client still has the old token in
      // localStorage. Clear it + retry once with a freshly-minted guest token. Single
      // transparent retry is honest UX; persistent failures fall through.
      if (pre.status === 401 && !isRetry) {
        try {
          window.localStorage.removeItem(SESSION_TOKEN_KEY)
        } catch {
          // localStorage disabled — proceed anyway.
        }
        setStatus('Session expired (server may have restarted) — re-minting guest token…')
        return attemptJoin(true)
      }
      const detail =
        pre.status === 0 ? `Network error: ${pre.message}` : `${pre.message} (HTTP ${pre.status})`
      setStatus(`Matchmaking unavailable — ${detail}.`)
      setBusy(false)
      return
    }
    // ─── Step 3: actual Colyseus join ───────────────────────────────────────
    setStatus(`Connecting to Colyseus at ${pre.host}…`)
    const handle = await joinSmolMatch({
      host: pre.host,
      sessionToken,
      handlers: {
        onOpen: (info) =>
          setStatus(`Connected. Room: ${info.roomId} · Session: ${info.sessionId}.`),
        onMessage: (type) => {
          console.info('[smol/multiplayer] message:', type)
        },
        onError: (err) => setStatus(`Connection error — ${err.message}. See browser console.`),
        onLeave: (code) => setStatus(`Disconnected (code ${code}). Click Join to reconnect.`),
      },
    })
    roomHandleRef.current = handle
    if (!handle) {
      setStatus(
        'Colyseus join failed — see browser console. Common causes: gameserver offline ' +
          '(start with `pnpm dev:server`), token rejected by GameRoom.onAuth.',
      )
    }
    setBusy(false)
  }

  const handleJoin = async (): Promise<void> => {
    setBusy(true)
    await attemptJoin(false)
  }

  // PHASE 17.L.D.14 — demo-build guard. Static demo bundle on GitHub Pages has no backend
  // (no Colyseus, no auth, no Postgres). Direct navigation to /multiplayer shows a clear
  // "demo build" notice instead of a dead matchmaking endpoint. Hooks above run regardless
  // so React's rules-of-hooks stay satisfied even though the guard short-circuits the
  // render below.
  if (IS_DEMO_BUILD) {
    return (
      <div className="sub-page" style={styleVars as React.CSSProperties}>
        <header className="sub-page-header">
          <Link to="/" className="back-link">
            ← Back
          </Link>
          <h1>Multiplayer</h1>
        </header>
        <main className="multiplayer-page__content multiplayer-page__demo-notice">
          <h2>🔒 Not available in {DEMO_BUILD_LABEL}</h2>
          <p>
            You&apos;re on the static demo build hosted on GitHub Pages. Multiplayer needs a live
            server (Colyseus + Express + Postgres) which doesn&apos;t run in a static bundle.
          </p>
          <p>
            <strong>Available in this demo:</strong> single-player matches against AI civs, full
            tech tree, every government archetype, Wiki, Discord, About, Settings.
          </p>
          <p>
            For multiplayer, run the full game locally (<code>pnpm dev</code> +{' '}
            <code>pnpm dev:server</code>) or play on the hosted production server when it&apos;s up.
          </p>
        </main>
      </div>
    )
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
