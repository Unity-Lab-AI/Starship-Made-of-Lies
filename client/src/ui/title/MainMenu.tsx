import { Link } from 'react-router-dom'
import { useAuthSession } from '../../auth/useAuthSession'
import './MainMenu.css'

interface MenuItem {
  icon: string
  label: string
  to?: string
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

  const items: MenuItem[] = [
    { icon: '▶', label: 'Start', to: '/new-game' },
    signInItem,
    { icon: '◯', label: 'Multiplayer', to: '/multiplayer' },
    { icon: '⚙', label: 'Settings', to: '/settings' },
    { icon: '🏆', label: 'Achievements', to: '/achievements' },
    { icon: '📖', label: 'Wiki', to: '/wiki' },
    { icon: 'ℹ', label: 'About', to: '/about' },
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
        {items.map((item) =>
          item.to ? (
            <Link key={item.label} to={item.to} className="menu-button">
              <span className="menu-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="menu-label">{item.label}</span>
            </Link>
          ) : (
            <button key={item.label} type="button" className="menu-button" onClick={item.onClick}>
              <span className="menu-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="menu-label">{item.label}</span>
            </button>
          ),
        )}
      </nav>
    </>
  )
}
