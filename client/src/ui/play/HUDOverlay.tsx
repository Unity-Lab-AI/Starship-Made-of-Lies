import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type Theme } from '@smol/shared'
import { getAudioSystem } from '../../audio/AudioSystem'
import { usePanelLayout } from './PanelLayoutContext'
import {
  type PanelId,
  type ToolbarCategoryId,
  TOOLBAR_BUTTON_BY_PANEL,
  TOOLBAR_CATEGORIES,
} from './types'
import './play-shell.css'

interface HUDOverlayProps {
  readonly theme: Theme
  readonly currentTick: number
  readonly running: boolean
  readonly speed: 1 | 2 | 4 | 8
  readonly togglePause: () => void
  readonly setSpeed: (s: 1 | 2 | 4 | 8) => void
  readonly openPanels: ReadonlySet<PanelId>
  readonly togglePanel: (id: PanelId) => void
  readonly buildModeBuildingDefId: string | null
  readonly onCancelBuildMode: () => void
  readonly onResetLayout: () => void
  readonly onSaveMatch: () => void
  readonly onLoadSavedMatch: () => void
  readonly hasSavedMatch: boolean
  // PHASE 17.L 2026-05-12 user feedback — gate Fleet category on launch-pad presence.
  // True when the human civ owns at least one planet with at least one launch pad built.
  readonly hasAnyLaunchPad: boolean
}

// PHASE 17.L 2026-05-12 user feedback nuke pass:
//   - hud-header (the "big oval card with quit on left") REMOVED entirely. Tick counter +
//     theme tagline + pause/play/speed all migrated into the Settings popover so the top of
//     the screen is fully clear of UI chrome.
//   - 30-button flat toolbar replaced with 6 collapsible categories. Click a category emoji
//     to expand its sub-row above; click again to collapse.
//   - Settings is a special category — renders inline utility controls (Pause / Speed /
//     Save / Load / Reset Layout / Mute / Quit) instead of panel-toggle buttons.
//   - Fleet category hidden until the player has at least one launch pad (no irrelevant
//     ship/flight/builder UI before the prerequisite building exists).
export function HUDOverlay({
  theme,
  currentTick,
  running,
  speed,
  togglePause,
  setSpeed,
  openPanels,
  togglePanel,
  buildModeBuildingDefId,
  onCancelBuildMode,
  onResetLayout,
  onSaveMatch,
  onLoadSavedMatch,
  hasSavedMatch,
  hasAnyLaunchPad,
}: HUDOverlayProps) {
  const layout = usePanelLayout()
  const navigate = useNavigate()
  const [expandedCategory, setExpandedCategory] = useState<ToolbarCategoryId | null>(null)
  // Music mute starts true (PlayPage forces music-bus mute at mount per user "constant
  // mind-numbing tone" feedback). The Mute toggle in Settings flips it; we mirror the local
  // state so the button label reflects truth without a subscription to mixer events.
  const [musicMuted, setMusicMuted] = useState<boolean>(true)

  const handleResetClick = () => {
    layout.resetAll()
    onResetLayout()
    setExpandedCategory(null)
  }
  const handleQuit = () => {
    if (window.confirm('Quit to title screen?')) {
      navigate('/')
    }
  }
  const handleToggleMusic = () => {
    try {
      const next = !musicMuted
      getAudioSystem().setBusMuted('music', next)
      setMusicMuted(next)
    } catch {
      // Audio system unavailable — keep UI state in sync regardless.
      setMusicMuted((m) => !m)
    }
  }

  const toggleCategory = (id: ToolbarCategoryId) => {
    setExpandedCategory((current) => (current === id ? null : id))
  }

  const visibleCategories = TOOLBAR_CATEGORIES.filter((cat) => {
    if (cat.requiresLaunchPad && !hasAnyLaunchPad) return false
    return true
  })

  const expanded = visibleCategories.find((c) => c.id === expandedCategory) ?? null

  return (
    <>
      {buildModeBuildingDefId && (
        <div className="hud-build-mode" role="status">
          <span className="hud-build-mode__icon">🏗</span>
          <span className="hud-build-mode__msg">
            Build mode — click an empty owned tile to place. Hold <strong>Shift</strong> to
            chain-place. <strong>ESC</strong> cancels.
          </span>
          <button
            type="button"
            className="hud-build-mode__cancel"
            onClick={onCancelBuildMode}
            title="Cancel build mode (ESC)"
          >
            ✕ Cancel
          </button>
        </div>
      )}

      {/* Expanded sub-row (above the category strip). Either a row of panel buttons or, for
          the Settings category, a row of inline utility controls. */}
      {expanded && (
        <div
          className="hud-toolbar-expanded"
          role="region"
          aria-label={`${expanded.label} controls`}
        >
          {expanded.id === 'settings' ? (
            <>
              <span className="hud-toolbar-expanded__tick" title="Current tick + match theme">
                t{currentTick} · {theme.emoji} {theme.name}
              </span>
              <button
                type="button"
                className="hud-toolbar__btn"
                onClick={togglePause}
                title={running ? 'Pause (Space)' : 'Resume (Space)'}
              >
                <span aria-hidden className="hud-toolbar__btn-emoji">
                  {running ? '⏸' : '▶'}
                </span>
                <span className="hud-toolbar__btn-label">{running ? 'Pause' : 'Resume'}</span>
              </button>
              {([1, 2, 4, 8] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`hud-toolbar__btn ${speed === s ? 'hud-toolbar__btn--on' : ''}`}
                  onClick={() => setSpeed(s)}
                  title={`Speed ${s}× (key ${Math.log2(s) + 1})`}
                >
                  <span aria-hidden className="hud-toolbar__btn-emoji">
                    {s}×
                  </span>
                  <span className="hud-toolbar__btn-label">Speed</span>
                </button>
              ))}
              <button
                type="button"
                className="hud-toolbar__btn"
                onClick={onSaveMatch}
                title="Save match to local browser storage"
              >
                <span aria-hidden className="hud-toolbar__btn-emoji">
                  💾
                </span>
                <span className="hud-toolbar__btn-label">Save</span>
              </button>
              <button
                type="button"
                className="hud-toolbar__btn"
                onClick={onLoadSavedMatch}
                disabled={!hasSavedMatch}
                title={
                  hasSavedMatch
                    ? 'Restore from last saved match — overwrites current state'
                    : 'No saved match to load'
                }
              >
                <span aria-hidden className="hud-toolbar__btn-emoji">
                  📂
                </span>
                <span className="hud-toolbar__btn-label">Load</span>
              </button>
              <button
                type="button"
                className="hud-toolbar__btn"
                onClick={handleResetClick}
                title="Reset panel layout — restore every panel to its default position and close all open panels"
              >
                <span aria-hidden className="hud-toolbar__btn-emoji">
                  ↺
                </span>
                <span className="hud-toolbar__btn-label">Reset</span>
              </button>
              <button
                type="button"
                className="hud-toolbar__btn"
                onClick={handleToggleMusic}
                title={
                  musicMuted ? 'Theme music currently MUTED — click to enable' : 'Mute theme music'
                }
              >
                <span aria-hidden className="hud-toolbar__btn-emoji">
                  {musicMuted ? '🔇' : '🔊'}
                </span>
                <span className="hud-toolbar__btn-label">
                  {musicMuted ? 'Music off' : 'Music on'}
                </span>
              </button>
              <button
                type="button"
                className="hud-toolbar__btn hud-toolbar__btn--danger"
                onClick={handleQuit}
                title="Quit to title screen"
              >
                <span aria-hidden className="hud-toolbar__btn-emoji">
                  ⏻
                </span>
                <span className="hud-toolbar__btn-label">Quit</span>
              </button>
            </>
          ) : (
            expanded.panelIds.map((panelId) => {
              const def = TOOLBAR_BUTTON_BY_PANEL.get(panelId)
              if (!def) return null
              const isOpen = openPanels.has(panelId)
              return (
                <button
                  key={panelId}
                  type="button"
                  className={`hud-toolbar__btn ${isOpen ? 'hud-toolbar__btn--on' : ''}`}
                  onClick={() => togglePanel(panelId)}
                  title={`${def.label}${def.hotkey ? ` (${def.hotkey})` : ''}`}
                  aria-pressed={isOpen}
                >
                  <span aria-hidden className="hud-toolbar__btn-emoji">
                    {def.emoji}
                  </span>
                  <span className="hud-toolbar__btn-label">{def.label}</span>
                </button>
              )
            })
          )}
        </div>
      )}

      {/* Category strip — the only persistent toolbar UI. 5-6 buttons, hugely less wall-of-
          buttons than the previous flat 30-button layout. */}
      <footer className="hud-toolbar" role="toolbar" aria-label="Game toolbar">
        {visibleCategories.map((cat) => {
          const isExpanded = expandedCategory === cat.id
          const childOpen = cat.panelIds.some((p) => openPanels.has(p))
          return (
            <button
              key={cat.id}
              type="button"
              className={`hud-toolbar__btn hud-toolbar__btn--category ${
                isExpanded ? 'hud-toolbar__btn--on' : ''
              } ${childOpen ? 'hud-toolbar__btn--has-open' : ''}`}
              onClick={() => toggleCategory(cat.id)}
              title={cat.label}
              aria-expanded={isExpanded}
            >
              <span aria-hidden className="hud-toolbar__btn-emoji">
                {cat.emoji}
              </span>
              <span className="hud-toolbar__btn-label">{cat.label}</span>
            </button>
          )
        })}
      </footer>
    </>
  )
}
