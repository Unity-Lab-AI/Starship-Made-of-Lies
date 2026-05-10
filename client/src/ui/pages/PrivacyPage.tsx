import { Link } from 'react-router-dom'
import './SubPage.css'

export function PrivacyPage() {
  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Privacy Policy</h1>
      </header>
      <main className="sub-page-content">
        <p>
          <strong>SMoL collects no personal data by default.</strong> Match state is local-only
          unless you opt in to Hall of Champions cloud sync (PHASE 11). Telemetry is disabled.
        </p>
        <p>Future opt-in features (account-linked):</p>
        <ul>
          <li>Hall of Champions leaderboards (cross-device match scores)</li>
          <li>Achievement progression sync</li>
          <li>Friend/lobby finding (PHASE 10 multiplayer)</li>
        </ul>
        <p className="placeholder-note">
          Final GDPR-compliant policy text lands in PHASE 13/14 (legal review). This is scaffold
          copy.
        </p>
      </main>
    </div>
  )
}
