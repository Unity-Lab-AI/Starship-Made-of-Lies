import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { type ThemeId, THEMES, civId, getTheme, themeAsCSSVars } from '@smol/shared'
import {
  LobbyPreviewPanel,
  type LobbyPreviewSlot,
  type LobbyPreviewSummary,
} from '../panels/LobbyPreviewPanel'
import './SubPage.css'
import './NewGamePage.css'

type GalaxyPreset = 'small' | 'medium' | 'large'
type MatchLength = 'blitz' | 'standard' | 'epic' | 'open'

const GALAXY_PRESETS: Record<GalaxyPreset, { label: string; planetCount: number }> = {
  small: { label: 'Small (100 planets)', planetCount: 100 },
  medium: { label: 'Medium (300 planets)', planetCount: 300 },
  large: { label: 'Large (1000 planets)', planetCount: 1000 },
}

const MATCH_LENGTH_LABELS: Record<MatchLength, string> = {
  blitz: 'Blitz (5 min)',
  standard: 'Standard (15 min)',
  epic: 'Epic (30 min)',
  open: 'Open-ended (mission objectives)',
}

export function NewGamePage() {
  const [galaxySize, setGalaxySize] = useState<GalaxyPreset>('small')
  const [aiCount, setAiCount] = useState(3)
  const [matchLength, setMatchLength] = useState<MatchLength>('open')
  const [coopMode, setCoopMode] = useState(false)
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId>(THEMES[0]!.id)

  const theme = getTheme(previewThemeId)
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])
  const preset = GALAXY_PRESETS[galaxySize]

  const lobbySummary = useMemo<LobbyPreviewSummary>(() => {
    const slots: LobbyPreviewSlot[] = [
      {
        slotIndex: 0,
        kind: 'human',
        civId: civId('civ-local'),
        displayName: 'You',
        themeId: previewThemeId,
        themeLocked: true,
        ready: true,
        aiPlaystyle: null,
        aiDifficulty: null,
        isHost: true,
      },
    ]
    const playstyles: ReadonlyArray<'builder' | 'warmonger' | 'researcher' | 'trickster'> = [
      'builder',
      'warmonger',
      'researcher',
      'trickster',
    ]
    const difficulties: ReadonlyArray<'easy' | 'medium' | 'hard' | 'brutal'> = [
      'easy',
      'medium',
      'hard',
      'brutal',
    ]
    for (let i = 0; i < aiCount; i++) {
      slots.push({
        slotIndex: i + 1,
        kind: 'ai',
        civId: civId(`civ-ai-${i}`),
        displayName: `AI · ${playstyles[i % playstyles.length]}`,
        themeId: THEMES[(i + 1) % THEMES.length]!.id,
        themeLocked: false,
        ready: true,
        aiPlaystyle: playstyles[i % playstyles.length] ?? 'builder',
        aiDifficulty: difficulties[i % difficulties.length] ?? 'medium',
        isHost: false,
      })
    }
    while (slots.length < 12) {
      slots.push({
        slotIndex: slots.length,
        kind: 'empty',
        civId: null,
        displayName: '',
        themeId: null,
        themeLocked: false,
        ready: false,
        aiPlaystyle: null,
        aiDifficulty: null,
        isHost: false,
      })
    }
    return {
      phase: 'CONFIGURING',
      planetCount: preset.planetCount,
      playerCount: 1 + aiCount,
      matchLength: matchLength === 'open' ? 'standard' : matchLength,
      winConditionsLabel: 'Apex Tech · Last Civ · Highscore',
      biomesLabel: 'All biomes',
      coopMode,
      slots,
    }
  }, [aiCount, coopMode, matchLength, preset.planetCount, previewThemeId])

  return (
    <div className="sub-page" style={styleVars as React.CSSProperties}>
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>New Game</h1>
      </header>
      <main className="new-game-page__content">
        <section className="new-game-page__form" aria-labelledby="new-game-config">
          <h2 id="new-game-config">Match configuration</h2>

          <label className="new-game-page__field">
            <span>Galaxy size</span>
            <select
              value={galaxySize}
              onChange={(e) => setGalaxySize(e.target.value as GalaxyPreset)}
            >
              {Object.entries(GALAXY_PRESETS).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="new-game-page__field">
            <span>AI civilizations</span>
            <input
              type="range"
              min={0}
              max={11}
              value={aiCount}
              onChange={(e) => setAiCount(Number(e.target.value))}
            />
            <span className="new-game-page__field-value">{aiCount}</span>
          </label>

          <label className="new-game-page__field">
            <span>Match length</span>
            <select
              value={matchLength}
              onChange={(e) => setMatchLength(e.target.value as MatchLength)}
            >
              {Object.entries(MATCH_LENGTH_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="new-game-page__field">
            <span>Co-op mode</span>
            <input
              type="checkbox"
              checked={coopMode}
              onChange={(e) => setCoopMode(e.target.checked)}
            />
            <span className="new-game-page__field-hint">
              {coopMode ? 'Humans share tech pool, AI hostile to alliance' : 'Free-for-all'}
            </span>
          </label>

          <label className="new-game-page__field">
            <span>Theme preview</span>
            <select
              value={previewThemeId}
              onChange={(e) => setPreviewThemeId(e.target.value as ThemeId)}
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name}
                </option>
              ))}
            </select>
          </label>
          <p className="new-game-page__theme-note">
            <strong>
              {theme.emoji} {theme.name}:
            </strong>{' '}
            {theme.tagline}
            <br />
            <em>{theme.description}</em>
          </p>

          <div className="new-game-page__cta">
            <button type="button" className="new-game-page__start" disabled>
              ▶ Start Match (gameplay loop in PHASE 8)
            </button>
            <p className="new-game-page__cta-hint">
              In-match HUD lands with PHASE 8 (3D scene + camera). Lobby + AI logic + sim engine are
              fully wired — preview the configuration to the right.
            </p>
          </div>
        </section>

        <aside className="new-game-page__preview">
          <h2>Lobby preview</h2>
          <LobbyPreviewPanel summary={lobbySummary} />
        </aside>
      </main>
    </div>
  )
}
