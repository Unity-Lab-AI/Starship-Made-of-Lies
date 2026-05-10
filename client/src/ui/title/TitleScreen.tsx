import { Link } from 'react-router-dom'
import { MainMenu } from './MainMenu'
import './TitleScreen.css'

const EMOJI_RAIL_LEFT = '🌾🏠🏭🏫⛪🚀⛏️📡🛰️🛐💼🪖👁️🌡️🧬🤖💰👑🌿🧠📺🌃⏳🎭'
const EMOJI_RAIL_RIGHT = '⛏️🌾🏭🏠🏫⛪🚀📡🛰️🛐💼🪖👁️🌡️🧬🤖💰👑🌿🧠📺🌃⏳🎭'

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

      <div className="emoji-rail emoji-rail--left" aria-hidden="true">
        {EMOJI_RAIL_LEFT}
      </div>
      <div className="emoji-rail emoji-rail--right" aria-hidden="true">
        {EMOJI_RAIL_RIGHT}
      </div>

      <main className="title-content">
        <h1 className="title-hero">Starship Made of Lies</h1>
        <p className="title-tagline">Conquer the galaxy.</p>
        <MainMenu />
      </main>

      <footer className="utility-bar utility-bar--bottom">
        <nav className="utility-links" aria-label="Bottom utility">
          <a href="https://discord.gg/unityailab" target="_blank" rel="noreferrer noopener">
            Discord
          </a>
          <a
            href="https://github.com/Unity-Lab-AI/Starship-Made-of-Lies"
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
          </a>
        </nav>
        <span className="version">v0.1.0 · © Unity AI Lab</span>
      </footer>
    </div>
  )
}
