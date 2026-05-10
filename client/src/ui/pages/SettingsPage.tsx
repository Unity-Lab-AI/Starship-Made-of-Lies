import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAudioSystem } from '../../audio/AudioSystem'
import { loadAccessibilitySettings } from '../../settings/accessibility'
import { loadKeybindMap } from '../../settings/keybindings'
import { AccessibilitySettingsPanel } from '../panels/AccessibilitySettingsPanel'
import { AudioSettingsPanel } from '../panels/AudioSettingsPanel'
import { KeybindingsPanel } from '../panels/KeybindingsPanel'
import './SubPage.css'
import './SettingsPage.css'

type SettingsTab = 'audio' | 'accessibility' | 'keybinds' | 'about'

const TABS: ReadonlyArray<{ id: SettingsTab; label: string; emoji: string }> = [
  { id: 'audio', label: 'Audio', emoji: '🔊' },
  { id: 'accessibility', label: 'Accessibility', emoji: '♿' },
  { id: 'keybinds', label: 'Keybinds', emoji: '⌨️' },
  { id: 'about', label: 'About', emoji: 'ℹ️' },
]

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('audio')
  const audioSystem = useMemo(() => getAudioSystem(), [])
  const accessibilityInitial = useMemo(() => loadAccessibilitySettings(), [])
  const keybindMapInitial = useMemo(() => loadKeybindMap(), [])

  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Settings</h1>
      </header>
      <main className="settings-page__content">
        <nav className="settings-page__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`settings-page__tab ${tab === t.id ? 'settings-page__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span aria-hidden>{t.emoji}</span> {t.label}
            </button>
          ))}
        </nav>
        <section className="settings-page__panel" role="tabpanel">
          {tab === 'audio' && <AudioSettingsPanel audioSystem={audioSystem} />}
          {tab === 'accessibility' && <AccessibilitySettingsPanel initial={accessibilityInitial} />}
          {tab === 'keybinds' && <KeybindingsPanel initial={keybindMapInitial} />}
          {tab === 'about' && (
            <div className="settings-page__about">
              <h2>SMoL Alpha v0.01.0</h2>
              <p>
                Top-down emoji civilization-builder where you trick your own citizens onto colony
                ships aimed at other civilizations.
              </p>
              <dl>
                <dt>Version</dt>
                <dd>v0.01.0 — Alpha</dd>
                <dt>Engine</dt>
                <dd>TypeScript + React + Three.js + Vite + Colyseus</dd>
                <dt>Public hosting</dt>
                <dd>Self-hosted via Cloudflare Tunnel</dd>
                <dt>Source</dt>
                <dd>
                  <a
                    href="https://github.com/Unity-Lab-AI/Starship-Made-of-Lies"
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/Unity-Lab-AI/Starship-Made-of-Lies
                  </a>
                </dd>
                <dt>Feedback</dt>
                <dd>
                  <a href="https://discord.gg/YWYk4CBr" target="_blank" rel="noreferrer">
                    Discord — discord.gg/YWYk4CBr
                  </a>
                </dd>
              </dl>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
