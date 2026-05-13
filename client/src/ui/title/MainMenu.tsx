import { Link } from 'react-router-dom'
import { useAuthSession } from '../../auth/useAuthSession'
import { DEMO_BUILD_LABEL, IS_DEMO_BUILD } from '../../config/buildMode'
import { DISCORD_INVITE_URL } from '../../services/community'
import './MainMenu.css'

interface MenuItem {
  icon: string
  label: string
  to?: string
  href?: string
  onClick?: () => void
}

export function MainMenu() {
  const { session, isSignedIn, signOut } = useAuthSession()

  const handleQuit = () => {
    if (window.confirm('Quit Starship Made of Lies?')) {
      window.location.href = 'https://www.unityailab.com'
    }
  }

  const handleSignOut = () => {
    if (window.confirm(`Sign out of ${session?.email ?? 'your account'}?`)) {
      signOut()
    }
  }

  const signInItem: MenuItem = isSignedIn
    ? {
        icon: '👤',
        label: `Sign Out (${session?.displayName ?? 'Signed in'})`,
        onClick: handleSignOut,
      }
    : { icon: '🔐', label: 'Sign In', to: '/signin' }

  // PHASE 17.L.D.14 — Multiplayer menu item is hidden entirely in demo builds (GitHub Pages
  // static-host hath no backend; the Colyseus/Express/Postgres server doesn't exist in this
  // bundle). DEMO BUILD indicator badge renders under the Quit button so the user knows
  // they're on the static demo, not the full server-hosted game.
  const items: MenuItem[] = [
    { icon: '▶', label: 'Start', to: '/new-game' },
    signInItem,
    ...(IS_DEMO_BUILD ? [] : [{ icon: '◯', label: 'Multiplayer', to: '/multiplayer' }]),
    { icon: '⚙', label: 'Settings', to: '/settings' },
    { icon: '🏆', label: 'Achievements', to: '/achievements' },
    { icon: '📖', label: 'Wiki', to: '/wiki' },
    { icon: 'ℹ', label: 'About', to: '/about' },
    { icon: '💬', label: 'Open Discord', href: DISCORD_INVITE_URL },
    { icon: '⏻', label: 'Quit', onClick: handleQuit },
  ]

  return (
    <>
      {isSignedIn ? (
        <div className="main-menu__signed-in-badge" role="status">
          <span className="main-menu__signed-in-icon" aria-hidden>
            ✅
          </span>
          <span className="main-menu__signed-in-text">
            Signed in as <strong>{session?.displayName ?? 'Player'}</strong>
            {session?.email ? (
              <span className="main-menu__signed-in-email"> ({session.email})</span>
            ) : null}
          </span>
        </div>
      ) : null}
      <nav className="main-menu" aria-label="Main menu">
        {items.map((item) => {
          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className="menu-button">
                <span className="menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="menu-label">{item.label}</span>
              </Link>
            )
          }
          if (item.href) {
            return (
              <a
                key={item.label}
                href={item.href}
                className="menu-button"
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="menu-label">{item.label}</span>
              </a>
            )
          }
          return (
            <button key={item.label} type="button" className="menu-button" onClick={item.onClick}>
              <span className="menu-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="menu-label">{item.label}</span>
            </button>
          )
        })}
        {/* PHASE 17.L.D.14 — DEMO BUILD indicator badge under the Quit button. Renders only
            when VITE_SMOL_DEMO_MODE=true was set at build time (GitHub Pages static bundle).
            Tells the player they're on the demo, not the full server-hosted game. Includes
            a one-line caveat about which features are unavailable. */}
        {IS_DEMO_BUILD ? (
          <div className="main-menu__demo-badge" role="status" aria-label="Demo build indicator">
            <span className="main-menu__demo-badge-label">{DEMO_BUILD_LABEL}</span>
            <span className="main-menu__demo-badge-note">
              Single-player only · no multiplayer · no cross-device save
            </span>
          </div>
        ) : null}
      </nav>
    </>
  )
}
