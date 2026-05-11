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
          <strong>Last updated:</strong> 2026-05-10 — Alpha v0.01.0
        </p>

        <h2>What we collect by default</h2>
        <p>
          <strong>Nothing.</strong> SMoL plays anonymously by default. No account is required to
          play. Match state is local-only unless you opt in to cloud features.
        </p>

        <h2>Opt-in cloud features</h2>
        <p>If (and only if) you create an account and enable each feature in Settings:</p>
        <ul>
          <li>
            <strong>Hall of Champions submission</strong> — your match scores are submitted to the
            single global leaderboard. Includes display name, handle, score, theme played, match
            duration. Toggle in Settings → Account.
          </li>
          <li>
            <strong>Achievement persistence</strong> — your unlocked achievements sync across
            devices linked to your account.
          </li>
          <li>
            <strong>Cloud save sync</strong> — your in-progress matches sync across devices.
          </li>
          <li>
            <strong>Cross-device profile</strong> — your profile (display name, stats) follows you
            across web / desktop / mobile installs.
          </li>
        </ul>

        <h2>Telemetry (separate opt-in)</h2>
        <p>If you enable telemetry in Settings:</p>
        <ul>
          <li>
            <strong>Crash reports</strong> — anonymous-session-id + timestamp + client version +
            platform + error message + stack trace + current route + user agent + memory usage. Used
            solely for fixing crashes.
          </li>
          <li>
            <strong>Anonymous match-end stats</strong> — anonymous-session-id + match outcome
            (winner archetype + playstyle + difficulty distribution + theme distribution + match
            duration + ship counts + indigenous-civ outcome). Used solely for AI tuning post-launch
            (see the "Telemetry-driven AI tuning" design directive). No personally-identifying
            information.
          </li>
        </ul>
        <p>
          Telemetry is OFF by default. The anonymous session ID is generated locally in your browser
          and stored in <code>localStorage</code>; it never links to you personally.
        </p>

        <h2>OAuth providers (when account login lands)</h2>
        <p>
          When account login is implemented (PHASE 11+14 backend wire-up), you'll have 4 options:
          email passwordless / Discord / Google / Apple. Each provider hands us only the minimum
          identity claim (email or sub) and a display name — never your password, contacts, or
          social graph.
        </p>

        <h2>Where data lives</h2>
        <p>
          Alpha period: self-hosted on a single Windows PC running Postgres. No cloud SaaS for MVP.
          When we migrate, we'll update this policy with the new data location.
        </p>

        <h2>Third parties</h2>
        <p>
          <strong>Cloudflare</strong> — used for Tunnel (public ingress) and DNS. Cloudflare sees
          request metadata (IP, timestamp, URL) but does not see decrypted content (TLS terminates
          on their edge). Standard CDN behavior.
        </p>
        <p>
          <strong>Discord</strong> — single feedback channel. If you join the Discord, that's a
          relationship between you and Discord, governed by their privacy policy.
        </p>

        <h2>Your rights</h2>
        <p>You can:</p>
        <ul>
          <li>Play anonymously forever — no account ever required.</li>
          <li>Disable telemetry at any time in Settings.</li>
          <li>Delete your account and all associated data on request via Discord.</li>
          <li>Export your stats + match history via your profile page (when account is live).</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Questions or concerns:{' '}
          <a href="https://discord.gg/YWYk4CBr" target="_blank" rel="noreferrer">
            Discord — discord.gg/YWYk4CBr
          </a>
        </p>

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-mute)' }}>
          Alpha v0.01.0. Policy updates as features ship — check this page when major versions land.
        </p>
      </main>
    </div>
  )
}
