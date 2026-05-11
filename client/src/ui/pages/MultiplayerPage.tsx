import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { THEMES, themeAsCSSVars } from '@smol/shared'
import './SubPage.css'
import './MultiplayerPage.css'

export function MultiplayerPage() {
  const theme = THEMES[0]!
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])

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
              No multiplayer rooms available yet. Multiplayer server activation is gated on Google
              sign-in (PHASE 17.0 in progress) and the multiplayer backend going live (PHASE 18.1).
              Once both are wired, real player-hosted lobbies will appear here.
            </p>
            <p className="multiplayer-page__hint">
              For now, play single-player from the main menu — Continue As Guest works and records
              progress locally.
            </p>
          </div>
          <div className="multiplayer-page__actions">
            <button type="button" disabled className="multiplayer-page__btn">
              ▶ Join lobby
            </button>
            <button type="button" disabled className="multiplayer-page__btn">
              ＋ Host new lobby
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
