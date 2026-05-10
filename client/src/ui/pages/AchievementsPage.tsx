import { Link } from 'react-router-dom'
import './SubPage.css'

export function AchievementsPage() {
  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Hall of Champions</h1>
      </header>
      <main className="sub-page-content">
        <p>
          Multi-category leaderboards: Most Planets Controlled, Fastest Tech Apex, Most Deceptive,
          Theme Specialist, Most Ruthless. Achievement manifest + per-account lifetime stats.
        </p>
        <p className="placeholder-note">
          Hall of Champions + achievements wiring lands in PHASE 11 (Persistence +
          Meta-progression).
        </p>
      </main>
    </div>
  )
}
