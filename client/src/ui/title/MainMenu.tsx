import { Link } from 'react-router-dom'
import './MainMenu.css'

interface MenuItem {
  icon: string
  label: string
  to?: string
  onClick?: () => void
}

export function MainMenu() {
  const handleQuit = () => {
    if (window.confirm('Quit Starship Made of Lies?')) {
      window.location.href = 'https://www.unityailab.com'
    }
  }

  const items: MenuItem[] = [
    { icon: '▶', label: 'Start', to: '/new-game' },
    { icon: '◯', label: 'Multiplayer', to: '/multiplayer' },
    { icon: '⚙', label: 'Settings', to: '/settings' },
    { icon: '🏆', label: 'Achievements', to: '/achievements' },
    { icon: '📖', label: 'Wiki', to: '/wiki' },
    { icon: 'ℹ', label: 'About', to: '/about' },
    { icon: '⏻', label: 'Quit', onClick: handleQuit },
  ]

  return (
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
  )
}
