import { Link } from 'react-router-dom'
import './SubPage.css'

export function NewGamePage() {
  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>New Game</h1>
      </header>
      <main className="sub-page-content">
        <p>
          Single-player setup: galaxy size (100–1000 planets), AI civ count + personality mix
          (Builder / Warmonger / Researcher / Trickster) × difficulty (Easy / Medium / Hard /
          Brutal), win-condition combo, theme-roll preview (random per civ — you cannot choose).
        </p>
        <p className="placeholder-note">Full setup UI lands in PHASE 9 (AI Players).</p>
      </main>
    </div>
  )
}
