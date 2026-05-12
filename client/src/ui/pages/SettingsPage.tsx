import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAudioSystem } from '../../audio/AudioSystem'
import { DISCORD_INVITE_URL } from '../../services/community'
import { loadAccessibilitySettings } from '../../settings/accessibility'
import { loadKeybindMap } from '../../settings/keybindings'
import { AccessibilitySettingsPanel } from '../panels/AccessibilitySettingsPanel'
import { AudioSettingsPanel } from '../panels/AudioSettingsPanel'
import { CameraSettingsPanel } from '../panels/CameraSettingsPanel'
import { KeybindingsPanel } from '../panels/KeybindingsPanel'
import './SubPage.css'
import './SettingsPage.css'

type SettingsTab = 'audio' | 'accessibility' | 'camera' | 'keybinds' | 'game' | 'about'

const TABS: ReadonlyArray<{ id: SettingsTab; label: string; emoji: string }> = [
  { id: 'audio', label: 'Audio', emoji: '🔊' },
  { id: 'accessibility', label: 'Accessibility', emoji: '♿' },
  { id: 'camera', label: 'Camera', emoji: '🎮' },
  { id: 'keybinds', label: 'Keybinds', emoji: '⌨️' },
  { id: 'game', label: 'Game', emoji: '🎯' },
  { id: 'about', label: 'About', emoji: 'ℹ️' },
]

const ONBOARDING_KEY = 'smol.onboarding.firstPlay.v1'

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
          {tab === 'camera' && <CameraSettingsPanel />}
          {tab === 'keybinds' && <KeybindingsPanel initial={keybindMapInitial} />}
          {tab === 'game' && <GameSettingsPanel />}
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
                  <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">
                    Discord — discord.gg/JyF2bY4BC6
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

function GameSettingsPanel() {
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(ONBOARDING_KEY) === '1'
    } catch {
      return false
    }
  })

  const handleReplayOnboarding = () => {
    try {
      window.localStorage.removeItem(ONBOARDING_KEY)
      setOnboardingDone(false)
    } catch {
      // localStorage unavailable
    }
  }

  return (
    <div className="settings-page__game">
      <h2>Game Settings</h2>
      <section className="settings-page__game-section">
        <h3>Onboarding</h3>
        <p className="settings-page__game-help">
          The welcome hint shows once on your first match. Clear it here to see it again on the next
          /play load — useful for demos or new players sharing your account.
        </p>
        <div className="settings-page__game-row">
          <span className="settings-page__game-status">
            Status:{' '}
            <strong>{onboardingDone ? '✓ Already seen' : '○ Will show on next match'}</strong>
          </span>
          <button
            type="button"
            className="settings-page__game-btn"
            onClick={handleReplayOnboarding}
            disabled={!onboardingDone}
            title="Clear the localStorage flag so the onboarding hint fires again on the next /play mount"
          >
            🔄 Replay onboarding hint
          </button>
        </div>
      </section>
    </div>
  )
}
