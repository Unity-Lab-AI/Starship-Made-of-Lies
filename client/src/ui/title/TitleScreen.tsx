import { Link } from 'react-router-dom'
import { DISCORD_INVITE_URL, GITHUB_REPO_URL } from '../../services/community'
import { MainMenu } from './MainMenu'
import './TitleScreen.css'

export function TitleScreen() {
  return (
    <div className="title-screen">
      <div className="hero-background" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />

      <header className="utility-bar utility-bar--top">
        <a
          href="https://www.unityailab.com"
          target="_blank"
          rel="noreferrer noopener"
          className="logo-link"
          aria-label="Unity AI Lab — home"
        >
          <span className="logo-mark" aria-hidden="true">
            ⚙
          </span>
          <span className="logo-word">Unity AI Lab</span>
        </a>
        <nav className="utility-links" aria-label="Top utility">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </header>

      <main className="title-content">
        <MainMenu />
      </main>

      <footer className="utility-bar utility-bar--bottom">
        <nav className="utility-links" aria-label="Bottom utility">
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer noopener">
            Discord
          </a>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer noopener">
            GitHub
          </a>
        </nav>
        <span className="version">v0.01.0 · © Unity AI Lab</span>
      </footer>
    </div>
  )
}
