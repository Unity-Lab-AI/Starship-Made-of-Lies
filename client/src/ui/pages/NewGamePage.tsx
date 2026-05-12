import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type AIDifficultyLevel,
  type MissionObjectiveConfig,
  type PlaystyleArchetype,
  type ResourceId,
  AI_DIFFICULTY_LEVELS,
  RESOURCES,
  RESOURCE_INGOTS,
  THEMES,
  civId,
  getAIDifficultyConfig,
  getPlaystyleProfile,
} from '@smol/shared'
import {
  LobbyPreviewPanel,
  type LobbyPreviewSlot,
  type LobbyPreviewSummary,
} from '../panels/LobbyPreviewPanel'
import './SubPage.css'
import './NewGamePage.css'

type GalaxyPreset = 'tiny' | 'small' | 'medium' | 'large'

// PHASE 17.L.D.1 (HOTFIX 2026-05-11) — added Tiny preset per user playtest report. The
// smallest valid generated galaxy at MIN_PLANET_COUNT=20 / AVG_PLANETS_PER_STAR=7 lands at
// ~3 stars (home + 2 enemies + maybe 1 indigenous), comfortably small for early playtests.
// Tiny is the new default so /play out-of-the-box doesn't drop the player into a 15-star
// crowd. Per user verbatim *"1 star per system each player starts in a system of planets
// with one star(Sun) per system"* — Tiny respects the spec at the smallest comfortable scale.
const GALAXY_PRESETS: Record<GalaxyPreset, { label: string; planetCount: number }> = {
  tiny: { label: 'Tiny (20 planets / about 3 systems)', planetCount: 20 },
  small: { label: 'Small (100 planets / about 15 systems)', planetCount: 100 },
  medium: { label: 'Medium (300 planets / about 43 systems)', planetCount: 300 },
  large: { label: 'Large (1000 planets / about 143 systems)', planetCount: 1000 },
}

interface ObjectiveToggleState {
  readonly highscoreEnabled: boolean
  readonly highscoreTarget: number
  readonly resourceEnabled: boolean
  readonly resourceTarget: number
  readonly resourceId: ResourceId
  readonly lastCivStandingEnabled: boolean
  readonly apexTechEnabled: boolean
}

const DEFAULT_OBJECTIVES: ObjectiveToggleState = {
  highscoreEnabled: false,
  highscoreTarget: 50000,
  resourceEnabled: false,
  resourceTarget: 100000,
  resourceId: RESOURCE_INGOTS,
  lastCivStandingEnabled: true,
  apexTechEnabled: true,
}

interface AISlotConfig {
  readonly playstyle: PlaystyleArchetype
  readonly difficulty: AIDifficultyLevel
}

const PLAYSTYLES: ReadonlyArray<PlaystyleArchetype> = [
  'builder',
  'warmonger',
  'researcher',
  'trickster',
]

function defaultAISlot(idx: number): AISlotConfig {
  return {
    playstyle: PLAYSTYLES[idx % PLAYSTYLES.length]!,
    difficulty: AI_DIFFICULTY_LEVELS[idx % AI_DIFFICULTY_LEVELS.length]!,
  }
}

function randomAISlot(rng: () => number): AISlotConfig {
  return {
    playstyle: PLAYSTYLES[Math.floor(rng() * PLAYSTYLES.length)]!,
    difficulty: AI_DIFFICULTY_LEVELS[Math.floor(rng() * AI_DIFFICULTY_LEVELS.length)]!,
  }
}

export function NewGamePage() {
  const navigate = useNavigate()
  const [galaxySize, setGalaxySize] = useState<GalaxyPreset>('tiny')
  const [aiCount, setAiCount] = useState(3)
  const [coopMode, setCoopMode] = useState(false)
  // PHASE 17.K — host-chosen fog-of-war toggle per user verbatim 2026-05-11. Default ON.
  const [fogOfWarEnabled, setFogOfWarEnabled] = useState(true)
  const [objectives, setObjectives] = useState<ObjectiveToggleState>(DEFAULT_OBJECTIVES)
  const [aiSlots, setAiSlots] = useState<ReadonlyArray<AISlotConfig>>(() =>
    Array.from({ length: 3 }, (_, i) => defaultAISlot(i)),
  )

  useEffect(() => {
    setAiSlots((current) => {
      if (current.length === aiCount) return current
      if (current.length > aiCount) return current.slice(0, aiCount)
      const next = [...current]
      for (let i = current.length; i < aiCount; i++) next.push(defaultAISlot(i))
      return next
    })
  }, [aiCount])

  const updateAISlot = (idx: number, patch: Partial<AISlotConfig>): void => {
    setAiSlots((current) => current.map((slot, i) => (i === idx ? { ...slot, ...patch } : slot)))
  }
  const randomizeAllSlots = (): void => {
    setAiSlots(Array.from({ length: aiCount }, () => randomAISlot(Math.random)))
  }
  const randomizeOneSlot = (idx: number): void => {
    setAiSlots((current) =>
      current.map((slot, i) => (i === idx ? randomAISlot(Math.random) : slot)),
    )
  }

  const preset = GALAXY_PRESETS[galaxySize]

  const matchIsTimed = objectives.highscoreEnabled || objectives.resourceEnabled
  const winConditionsLabel = (() => {
    const parts: string[] = []
    if (objectives.apexTechEnabled) parts.push('Apex Tech')
    if (objectives.lastCivStandingEnabled) parts.push('Last Civ')
    if (objectives.highscoreEnabled) parts.push(`Score → ${objectives.highscoreTarget}`)
    if (objectives.resourceEnabled) {
      const resDef = RESOURCES.find((r) => r.id === objectives.resourceId)
      const resLabel = resDef ? `${resDef.emoji} ${resDef.name}` : String(objectives.resourceId)
      parts.push(`${resLabel} → ${objectives.resourceTarget}`)
    }
    if (parts.length === 0) return 'Open-ended (no end condition!)'
    return parts.join(' · ')
  })()

  const lobbySummary = useMemo<LobbyPreviewSummary>(() => {
    const slots: LobbyPreviewSlot[] = [
      {
        slotIndex: 0,
        kind: 'human',
        civId: civId('civ-local'),
        displayName: 'You (theme revealed at match start)',
        themeId: null,
        themeLocked: true,
        ready: true,
        aiPlaystyle: null,
        aiDifficulty: null,
        isHost: true,
      },
    ]
    for (let i = 0; i < aiCount; i++) {
      const slotCfg = aiSlots[i] ?? defaultAISlot(i)
      slots.push({
        slotIndex: i + 1,
        kind: 'ai',
        civId: civId(`civ-ai-${i}`),
        displayName: `AI · ${slotCfg.playstyle}`,
        themeId: THEMES[(i + 1) % THEMES.length]!.id,
        themeLocked: false,
        ready: true,
        aiPlaystyle: slotCfg.playstyle,
        aiDifficulty: slotCfg.difficulty,
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
  }, [aiCount, aiSlots, coopMode, preset.planetCount, winConditionsLabel])

  return (
    <div className="sub-page">
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

          {aiCount > 0 && (
            <details className="new-game-page__ai-config" open>
              <summary>
                <span>🤖 AI player config ({aiCount})</span>
                <button
                  type="button"
                  className="new-game-page__ai-randomize"
                  onClick={(e) => {
                    e.preventDefault()
                    randomizeAllSlots()
                  }}
                  title="Randomize all AI playstyles + difficulties"
                >
                  🎲 Randomize all
                </button>
              </summary>
              <ul className="new-game-page__ai-list">
                {aiSlots.map((slot, idx) => {
                  const playstyleProfile = getPlaystyleProfile(slot.playstyle)
                  const difficultyConfig = getAIDifficultyConfig(slot.difficulty)
                  return (
                    <li key={idx} className="new-game-page__ai-row">
                      <span className="new-game-page__ai-row-label">AI #{idx + 1}</span>
                      <select
                        className="new-game-page__ai-select"
                        value={slot.playstyle}
                        onChange={(e) =>
                          updateAISlot(idx, { playstyle: e.target.value as PlaystyleArchetype })
                        }
                        title={playstyleProfile.description}
                      >
                        {PLAYSTYLES.map((p) => {
                          const prof = getPlaystyleProfile(p)
                          return (
                            <option key={p} value={p}>
                              {prof.emoji} {prof.name}
                            </option>
                          )
                        })}
                      </select>
                      <select
                        className="new-game-page__ai-select"
                        value={slot.difficulty}
                        onChange={(e) =>
                          updateAISlot(idx, { difficulty: e.target.value as AIDifficultyLevel })
                        }
                        title={difficultyConfig.description}
                      >
                        {AI_DIFFICULTY_LEVELS.map((d) => {
                          const cfg = getAIDifficultyConfig(d)
                          return (
                            <option key={d} value={d}>
                              {cfg.emoji} {cfg.name}
                            </option>
                          )
                        })}
                      </select>
                      <button
                        type="button"
                        className="new-game-page__ai-row-rand"
                        onClick={() => randomizeOneSlot(idx)}
                        title="Randomize this AI slot"
                      >
                        🎲
                      </button>
                    </li>
                  )
                })}
              </ul>
            </details>
          )}

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
            <span>Fog of war</span>
            <input
              type="checkbox"
              checked={fogOfWarEnabled}
              onChange={(e) => setFogOfWarEnabled(e.target.checked)}
            />
            <span className="new-game-page__field-hint">
              {fogOfWarEnabled
                ? 'Enemy planets hidden until you launch at them OR they launch at you'
                : 'OFF — every civilization visible on the galactic map from match start'}
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
                First civ to stockpile target units of the picked resource wins.
              </span>
            </label>
            {objectives.resourceEnabled && (
              <label className="new-game-page__objective new-game-page__objective--resource-pick">
                <span style={{ visibility: 'hidden' }}>•</span>
                <span>Which resource:</span>
                <select
                  className="new-game-page__objective-resource"
                  value={objectives.resourceId}
                  onChange={(e) =>
                    setObjectives({ ...objectives, resourceId: e.target.value as ResourceId })
                  }
                  aria-label="Resource to stockpile"
                >
                  {RESOURCES.map((r) => (
                    <option key={String(r.id)} value={String(r.id)}>
                      {r.emoji} {r.name} ({r.category})
                    </option>
                  ))}
                </select>
                <span className="new-game-page__objective-hint">
                  Sum of this resource across all your planets is what counts toward the target.
                </span>
              </label>
            )}
          </fieldset>

          <p className="new-game-page__match-status">
            Match type:{' '}
            <strong>{matchIsTimed ? 'Open-ended (race to score)' : 'Open-ended'}</strong>
            <br />
            <span className="new-game-page__match-status-detail">
              Win conditions: {winConditionsLabel}
            </span>
            <br />
            <span className="new-game-page__match-status-detail">
              Fog of war: <strong>{fogOfWarEnabled ? 'ON' : 'OFF'}</strong>
            </span>
          </p>

          <p className="new-game-page__theme-note new-game-page__theme-note--blind">
            🎭 Your government theme is rolled by fate at match start. You can&apos;t see it,
            can&apos;t choose it, can&apos;t re-roll it. Every civilization plays the hand it&apos;s
            dealt.
          </p>

          <div className="new-game-page__cta">
            <button
              type="button"
              className="new-game-page__start"
              onClick={() => {
                const cfgObjectives: MissionObjectiveConfig[] = []
                if (objectives.lastCivStandingEnabled)
                  cfgObjectives.push({ id: 'last_civ_standing', target: 1 })
                if (objectives.apexTechEnabled) cfgObjectives.push({ id: 'apex_tech', target: 1 })
                if (objectives.highscoreEnabled)
                  cfgObjectives.push({
                    id: 'highscore_target',
                    target: objectives.highscoreTarget,
                  })
                if (objectives.resourceEnabled)
                  cfgObjectives.push({
                    id: 'resource_target',
                    target: objectives.resourceTarget,
                    resource: objectives.resourceId,
                  })
                navigate('/play', {
                  state: {
                    seed: Math.floor(Math.random() * 0xffffff),
                    aiCount,
                    planetCount: preset.planetCount,
                    objectives: cfgObjectives,
                    aiSlots,
                    fogOfWarEnabled,
                  },
                })
              }}
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
