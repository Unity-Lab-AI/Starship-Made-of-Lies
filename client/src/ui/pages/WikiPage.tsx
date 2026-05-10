import { Link } from 'react-router-dom'
import './SubPage.css'

export function WikiPage() {
  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Game Wiki</h1>
      </header>
      <main className="sub-page-content">
        <p>
          Living documentation built progressively as the game grows. Initial sections: Mechanics,
          Themes, Tech Tree, Multiplayer, FAQ. Markdown-driven from <code>assets/wiki/*.md</code> so
          non-coders can contribute.
        </p>
        <p className="placeholder-note">
          Wiki content lands progressively across all phases — &quot;we will build as we go.&quot;
        </p>
      </main>
    </div>
  )
}
