import { Link } from 'react-router-dom'
import { DISCORD_INVITE_URL } from '../../services/community'
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
          <strong>Last updated:</strong> 2026-05-10 — Alpha v0.01.0
        </p>

        <h2>Alpha software disclaimer</h2>
        <p>
          Starship Made of Lies (SMoL) is <strong>alpha software</strong>. Mechanics, features, UI,
          save formats, leaderboards, and accounts may change without notice. Bugs are expected.
          Save data may not survive across versions.
        </p>
        <p>By playing the alpha you accept that nothing here is final, complete, or guaranteed.</p>

        <h2>License</h2>
        <p>
          Source code is open and available at{' '}
          <a
            href="https://github.com/Unity-Lab-AI/Starship-Made-of-Lies"
            target="_blank"
            rel="noreferrer"
          >
            github.com/Unity-Lab-AI/Starship-Made-of-Lies
          </a>
          . The repo is public for reference, code review, and bug discovery — but the project is
          not currently licensed for redistribution or commercial use. Do not fork-and-ship your own
          copy. Treat it as "source-available, all-rights-reserved" until a formal license lands.
        </p>

        <h2>No warranty</h2>
        <p>
          SMoL is provided "AS IS" without any warranty of any kind, express or implied, including
          but not limited to fitness for a particular purpose, merchantability, and
          non-infringement. You play at your own risk.
        </p>

        <h2>Multiplayer conduct (when multiplayer is live)</h2>
        <p>While in lobbies, chat, and matches:</p>
        <ul>
          <li>No exploiting bugs or unintended mechanics for unfair advantage.</li>
          <li>No harassment, hate speech, threats, or abusive behavior.</li>
          <li>No unauthorized modification of server-authoritative state (cheating).</li>
          <li>No spam, advertising, or impersonating other players.</li>
        </ul>
        <p>
          Violations result in lobby kick + account suspension at moderator discretion. Repeat
          offenses = permanent ban. Reports go through the Discord <code>#bug-reports</code>{' '}
          channel.
        </p>

        <h2>Account responsibility</h2>
        <p>
          If you create an account: you're responsible for keeping your credentials secure. We don't
          recover lost OAuth tokens. We can disable a compromised account on request via Discord.
        </p>

        <h2>Data + privacy</h2>
        <p>
          See the{' '}
          <Link to="/privacy" style={{ color: 'var(--ui-glow, #d4a13a)' }}>
            Privacy Policy
          </Link>
          .
        </p>

        <h2>Changes</h2>
        <p>
          These terms may update as the alpha matures. The "Last updated" date at the top reflects
          the current version. Continued play after a terms change = acceptance of the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions:{' '}
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">
            Discord — discord.gg/JyF2bY4BC6
          </a>
        </p>

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-mute)' }}>
          Alpha v0.01.0. These terms get a real legal pass before v1.0 launch. For now: be cool,
          report bugs, don't be a dick.
        </p>
      </main>
    </div>
  )
}
