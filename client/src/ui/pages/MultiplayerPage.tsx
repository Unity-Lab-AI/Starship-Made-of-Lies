import { Link } from 'react-router-dom'
import './SubPage.css'

export function MultiplayerPage() {
  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Multiplayer</h1>
      </header>
      <main className="sub-page-content">
        <p>
          Host a match (galaxy size / max players 1–12 / win conditions / co-op toggle / theme-roll
          preview / room code generation) or join via room code or open-lobby browser.
        </p>
        <p className="placeholder-note">
          Lobby + WebSocket multiplayer land in PHASE 10 (Multiplayer Server).
        </p>
      </main>
    </div>
  )
}
