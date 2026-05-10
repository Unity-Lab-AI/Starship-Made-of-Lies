import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { type ThemeId, THEMES, civId, getTheme, themeAsCSSVars } from '@smol/shared'
import {
  LobbyPreviewPanel,
  type LobbyPreviewSlot,
  type LobbyPreviewSummary,
} from '../panels/LobbyPreviewPanel'
import './SubPage.css'
import './NewGamePage.css'

type GalaxyPreset = 'small' | 'medium' | 'large'

const GALAXY_PRESETS: Record<GalaxyPreset, { label: string; planetCount: number }> = {
  small: { label: 'Small (100 planets)', planetCount: 100 },
  medium: { label: 'Medium (300 planets)', planetCount: 300 },
  large: { label: 'Large (1000 planets)', planetCount: 1000 },
}

interface ObjectiveToggleState {
  readonly highscoreEnabled: boolean
  readonly highscoreTarget: number
  readonly resourceEnabled: boolean
  readonly resourceTarget: number
  readonly lastCivStandingEnabled: boolean
  readonly apexTechEnabled: boolean
}

const DEFAULT_OBJECTIVES: ObjectiveToggleState = {
  highscoreEnabled: false,
  highscoreTarget: 50000,
  resourceEnabled: false,
  resourceTarget: 100000,
  lastCivStandingEnabled: true,
  apexTechEnabled: true,
}

export function NewGamePage() {
  const navigate = useNavigate()
  const [galaxySize, setGalaxySize] = useState<GalaxyPreset>('small')
  const [aiCount, setAiCount] = useState(3)
  const [coopMode, setCoopMode] = useState(false)
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId>(THEMES[0]!.id)
  const [objectives, setObjectives] = useState<ObjectiveToggleState>(DEFAULT_OBJECTIVES)

  const theme = getTheme(previewThemeId)
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])
  const preset = GALAXY_PRESETS[galaxySize]

  const matchIsTimed = objectives.highscoreEnabled || objectives.resourceEnabled
  const winConditionsLabel = (() => {
    const parts: string[] = []
    if (objectives.apexTechEnabled) parts.push('Apex Tech')
    if (objectives.lastCivStandingEnabled) parts.push('Last Civ')
    if (objectives.highscoreEnabled) parts.push(`Score → ${objectives.highscoreTarget}`)
    if (objectives.resourceEnabled) parts.push(`Resource → ${objectives.resourceTarget}`)
    if (parts.length === 0) return 'Open-ended (no end condition!)'
    return parts.join(' · ')
  })()

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
      matchLength: 'standard',
      winConditionsLabel,
      biomesLabel: 'All biomes',
      coopMode,
      slots,
    }
  }, [aiCount, coopMode, preset.planetCount, previewThemeId, winConditionsLabel])

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

          <fieldset className="new-game-page__objectives">
            <legend>Win conditions</legend>
            <p className="new-game-page__objectives-hint">
              Match runs <strong>open-ended</strong> until a win condition triggers. Score-based
              conditions create a race; the others end the match when met.
            </p>

            <label className="new-game-page__objective">
              <input
                type="checkbox"
                checked={objectives.lastCivStandingEnabled}
                onChange={(e) =>
                  setObjectives({ ...objectives, lastCivStandingEnabled: e.target.checked })
                }
              />
              <span>🏴 Last Civ Standing</span>
              <span className="new-game-page__objective-hint">
                Last surviving civ wins. No time limit.
              </span>
            </label>

            <label className="new-game-page__objective">
              <input
                type="checkbox"
                checked={objectives.apexTechEnabled}
                onChange={(e) =>
                  setObjectives({ ...objectives, apexTechEnabled: e.target.checked })
                }
              />
              <span>🌌 Apex Tech</span>
              <span className="new-game-page__objective-hint">
                First civ to research a winning Apex tech wins. No time limit.
              </span>
            </label>

            <label className="new-game-page__objective">
              <input
                type="checkbox"
                checked={objectives.highscoreEnabled}
                onChange={(e) =>
                  setObjectives({ ...objectives, highscoreEnabled: e.target.checked })
                }
              />
              <span>🎯 Highscore Target — race</span>
              {objectives.highscoreEnabled && (
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  className="new-game-page__objective-target"
                  value={objectives.highscoreTarget}
                  onChange={(e) =>
                    setObjectives({
                      ...objectives,
                      highscoreTarget: Math.max(1000, Number(e.target.value) || 50000),
                    })
                  }
                  aria-label="Highscore target"
                />
              )}
              <span className="new-game-page__objective-hint">
                First civ to reach target score wins.
              </span>
            </label>

            <label className="new-game-page__objective">
              <input
                type="checkbox"
                checked={objectives.resourceEnabled}
                onChange={(e) =>
                  setObjectives({ ...objectives, resourceEnabled: e.target.checked })
                }
              />
              <span>📦 Resource Target — race</span>
              {objectives.resourceEnabled && (
                <input
                  type="number"
                  min={5000}
                  step={5000}
                  className="new-game-page__objective-target"
                  value={objectives.resourceTarget}
                  onChange={(e) =>
                    setObjectives({
                      ...objectives,
                      resourceTarget: Math.max(5000, Number(e.target.value) || 100000),
                    })
                  }
                  aria-label="Resource target"
                />
              )}
              <span className="new-game-page__objective-hint">
                First civ to stockpile target resource units wins.
              </span>
            </label>
          </fieldset>

          <p className="new-game-page__match-status">
            Match type:{' '}
            <strong>{matchIsTimed ? 'Open-ended (race to score)' : 'Open-ended'}</strong>
            <br />
            <span className="new-game-page__match-status-detail">
              Win conditions: {winConditionsLabel}
            </span>
          </p>

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
            <button
              type="button"
              className="new-game-page__start"
              onClick={() =>
                navigate('/play', {
                  state: {
                    seed: Math.floor(Math.random() * 0xffffff),
                    aiCount,
                    planetCount: preset.planetCount,
                    humanThemeId: previewThemeId,
                  },
                })
              }
            >
              ▶ Start Match
            </button>
            <p className="new-game-page__cta-hint">
              Solo match runs open-ended until a win condition triggers. No clock — just race the AI
              to your picked condition.
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
