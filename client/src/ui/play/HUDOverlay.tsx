import { Link } from 'react-router-dom'
import { type Theme } from '@smol/shared'
import { usePanelLayout } from './PanelLayoutContext'
import { type PanelId, TOOLBAR_BUTTONS } from './types'
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
  // PHASE 17.L.A.13 — Q12 PHASE 17 LOCKED. Save / Load callbacks render as toolbar utility
  // buttons (next to Reset Layout). saveMatchNow returns boolean for toast feedback;
  // loadSavedMatch swaps state in-place; hasSavedMatch controls the Load button enabled state.
  readonly onSaveMatch: () => void
  readonly onLoadSavedMatch: () => void
  readonly hasSavedMatch: boolean
}

// PHASE 16.13.9: the 🌌 galaxy toolbar button is suppressed because GalaxyView is now the always-on
// /play canvas (no modal toggle needed). The TOOLBAR_BUTTONS array still includes 'galaxy' for
// historical reasons; we filter it here at the render boundary.
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
}: HUDOverlayProps) {
  const layout = usePanelLayout()
  const handleResetClick = () => {
    layout.resetAll()
    onResetLayout()
  }
  return (
    <>
      <header className="hud-header" role="banner">
        <Link to="/" className="hud-header__quit" title="Quit to title screen">
          ← Quit
        </Link>
        <div className="hud-header__theme">
          <span className="hud-header__theme-emoji" aria-hidden>
            {theme.emoji}
          </span>
          <span className="hud-header__theme-name">{theme.name}</span>
          <span className="hud-header__sep">·</span>
          <span className="hud-header__theme-tagline">{theme.tagline}</span>
        </div>
        <div className="hud-header__time">
          <span className="hud-header__tick" title="Current tick">
            t{currentTick}
          </span>
          <button
            type="button"
            className="hud-header__btn"
            onClick={togglePause}
            title={running ? 'Pause (Space)' : 'Resume (Space)'}
          >
            {running ? '⏸' : '▶'}
          </button>
          {([1, 2, 4, 8] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`hud-header__btn ${speed === s ? 'hud-header__btn--on' : ''}`}
              onClick={() => setSpeed(s)}
              title={`Speed ${s}× (key ${Math.log2(s) + 1})`}
            >
              {s}×
            </button>
          ))}
        </div>
      </header>

      {buildModeBuildingDefId && (
        <div className="hud-build-mode" role="status">
          <span className="hud-build-mode__icon">🏗</span>
          <span className="hud-build-mode__msg">
            {/* PHASE 17.L.D.8 — surface tile-click semantics. Default click = place +
               exit build mode (one-shot). Shift-click = place + stay in build mode
               (chain placement). ESC = cancel without placing. */}
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

      <footer className="hud-toolbar" role="toolbar" aria-label="Game toolbar">
        {TOOLBAR_BUTTONS.filter((b) => b.id !== 'galaxy').map((btn) => {
          const panelId = btn.id as PanelId
          const isOpen = openPanels.has(panelId)
          return (
            <button
              key={btn.id}
              type="button"
              className={`hud-toolbar__btn ${isOpen ? 'hud-toolbar__btn--on' : ''}`}
              onClick={() => togglePanel(panelId)}
              title={`${btn.label}${btn.hotkey ? ` (${btn.hotkey})` : ''}`}
              aria-pressed={isOpen}
            >
              <span aria-hidden className="hud-toolbar__btn-emoji">
                {btn.emoji}
              </span>
              <span className="hud-toolbar__btn-label">{btn.label}</span>
            </button>
          )
        })}
        <button
          type="button"
          className="hud-toolbar__btn hud-toolbar__btn--reset"
          onClick={handleResetClick}
          title="Reset Panel Layout — restore every panel to its default position and close all open panels"
        >
          <span aria-hidden className="hud-toolbar__btn-emoji">
            ↺
          </span>
          <span className="hud-toolbar__btn-label">Reset Layout</span>
        </button>
        {/* PHASE 17.L.A.13 — Q12 LOCKED. Save / Load utility buttons. Save Now writes to
            localStorage; Load Saved Match restores in-place. Load is disabled when no save
            exists yet. */}
        <button
          type="button"
          className="hud-toolbar__btn hud-toolbar__btn--save"
          onClick={onSaveMatch}
          title="Save match to local browser storage (also fires automatically based on the save mode picked at match setup)"
        >
          <span aria-hidden className="hud-toolbar__btn-emoji">
            💾
          </span>
          <span className="hud-toolbar__btn-label">Save Now</span>
        </button>
        <button
          type="button"
          className="hud-toolbar__btn hud-toolbar__btn--load"
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
          <span className="hud-toolbar__btn-label">Load Saved</span>
        </button>
      </footer>
    </>
  )
}
