import { Link } from 'react-router-dom'
import './SubPage.css'

export function TermsPage() {
  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Terms of Service</h1>
      </header>
      <main className="sub-page-content">
        <p>
          Standard EULA + acceptable-use + multiplayer conduct policy. By playing Starship Made of
          Lies, you agree to use the game in accordance with these terms.
        </p>
        <p>Multiplayer conduct policy includes:</p>
        <ul>
          <li>No exploiting bugs or game mechanics for unfair advantage</li>
          <li>No harassment, hate speech, or abusive behavior in lobbies/chat</li>
          <li>No unauthorized modification of server-authoritative state</li>
        </ul>
        <p className="placeholder-note">
          Final EULA text lands in PHASE 13/14 (legal review). This is scaffold copy.
        </p>
      </main>
    </div>
  )
}
