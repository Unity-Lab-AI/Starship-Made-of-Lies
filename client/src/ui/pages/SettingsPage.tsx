import { Link } from 'react-router-dom'
import './SubPage.css'

export function SettingsPage() {
  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Settings</h1>
      </header>
      <main className="sub-page-content">
        <p>
          Tabs: Audio (master / music / SFX / theme-music), Graphics (resolution / fullscreen /
          VSync / quality preset), Controls (WASD + QE + mousewheel + drag-pan rebinds),
          Accessibility (font size / high-contrast / colorblind mode / reduced-motion), Account
          (Unity AI Lab account link).
        </p>
        <p className="placeholder-note">
          Full settings UI lands in PHASE 14 (Polish + Launch Readiness — accessibility) + PHASE 12
          (Audio System — mixer wiring).
        </p>
      </main>
    </div>
  )
}
