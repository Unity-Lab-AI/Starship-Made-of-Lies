import { Link } from 'react-router-dom'
import './SubPage.css'

export function AboutPage() {
  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>About</h1>
      </header>
      <main className="sub-page-content">
        <p>
          <strong>Starship Made of Lies</strong> &mdash; v0.1.0 (alpha). A top-down emoji
          civilization-builder where you trick your own citizens into boarding colony ships aimed at
          other civilizations. Conquer the galaxy. Dark comedy with a slow-corruption arc.
        </p>

        <h2>Unity AI Lab</h2>
        <ul>
          <li>
            <strong>Founder</strong> &mdash; Gee
          </li>
          <li>
            <strong>Server</strong> &mdash; Red
          </li>
          <li>
            <strong>Stack + Backend</strong> &mdash; Sponge
          </li>
          <li>
            <strong>Social + Dev + Implementation</strong> &mdash; Mills
          </li>
        </ul>

        <h2>Built with</h2>
        <p>
          TypeScript · React · Three.js · Vite · Tauri · Capacitor · WebSocket · pnpm workspaces
        </p>

        <p>
          <a href="https://www.unityailab.com" target="_blank" rel="noreferrer noopener">
            Visit unityailab.com →
          </a>
        </p>
      </main>
    </div>
  )
}
