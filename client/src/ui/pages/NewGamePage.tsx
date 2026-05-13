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

// PHASE 17.L.D (HOTFIX 2026-05-12) — user verbatim *"u have all this information crammed
// into a long as card that doent look good and i have to scroll down to use it.. remake this
// whole page with the lobby viewer to be better formated"* + *"and make the write up tool
// tips as not to corrupt the new game look"*. Page rewritten from a single long vertical
// form into a 5-tab single-pane layout (Galaxy / Players / Rules / Win / Preview). Long
// field descriptions migrated from visible italic paragraphs into hover tooltips on the ⓘ
// info-icons next to each label, so the panes stay short + scannable.
type TabId = 'galaxy' | 'players' | 'rules' | 'win' | 'preview'
const TABS: ReadonlyArray<{ readonly id: TabId; readonly emoji: string; readonly label: string }> =
  [
    { id: 'galaxy', emoji: '🌌', label: 'Galaxy' },
    { id: 'players', emoji: '👥', label: 'Players' },
    { id: 'rules', emoji: '⚙', label: 'Rules' },
    { id: 'win', emoji: '🏆', label: 'Win' },
    { id: 'preview', emoji: '👁', label: 'Preview' },
  ]

// Compact ⓘ tooltip icon. Uses the browser-native title attribute so we get a free, accessible
// hover tooltip with no JS deps or popper / floating-ui dance. Adequate for short hint text.
function InfoTip({ text }: { readonly text: string }) {
  return (
    <span className="new-game-page__info-tip" title={text} aria-label={text} role="img">
      ⓘ
    </span>
  )
}

export function NewGamePage() {
  const navigate = useNavigate()
  // PHASE 17.L.D.5 (HOTFIX 2026-05-11) — default to 'small' (100 planets / ~14 stars). Tiny
  // preset stays as an option for quick testing.
  const [galaxySize, setGalaxySize] = useState<GalaxyPreset>('small')
  const [aiCount, setAiCount] = useState(3)
  const [coopMode, setCoopMode] = useState(false)
  // PHASE 17.K — host-chosen fog-of-war toggle per user 2026-05-11. Default ON.
  const [fogOfWarEnabled, setFogOfWarEnabled] = useState(true)
  // PHASE 17.L.A.13 — Q12 PHASE 17 LOCKED. Host picks save mode for the match. Defaults to
  // auto-5min — the UMS-faithful "match auto-saves every 5 minutes" pattern.
  const [saveMode, setSaveMode] = useState<'off' | 'manual' | 'auto-5min' | 'auto-15min'>(
    'auto-5min',
  )
  // PHASE 18.4 — host-configurable galactic random-event intensity. Defaults to medium.
  const [randomEventIntensity, setRandomEventIntensity] = useState<
    'off' | 'low' | 'medium' | 'high'
  >('medium')
  const [objectives, setObjectives] = useState<ObjectiveToggleState>(DEFAULT_OBJECTIVES)
  const [aiSlots, setAiSlots] = useState<ReadonlyArray<AISlotConfig>>(() =>
    Array.from({ length: 3 }, (_, i) => defaultAISlot(i)),
  )
  const [activeTab, setActiveTab] = useState<TabId>('galaxy')

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

  const handleStart = (): void => {
    const cfgObjectives: MissionObjectiveConfig[] = []
    if (objectives.lastCivStandingEnabled)
      cfgObjectives.push({ id: 'last_civ_standing', target: 1 })
    if (objectives.apexTechEnabled) cfgObjectives.push({ id: 'apex_tech', target: 1 })
    if (objectives.highscoreEnabled)
      cfgObjectives.push({ id: 'highscore_target', target: objectives.highscoreTarget })
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
        saveMode,
        randomEventIntensity,
      },
    })
  }

  return (
    <div className="sub-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>New Game</h1>
      </header>
      <main className="new-game-page__content">
        <nav className="new-game-page__tabnav" role="tablist" aria-label="Match configuration">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={`new-game-page__tab${activeTab === t.id ? ' new-game-page__tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span aria-hidden className="new-game-page__tab-emoji">
                {t.emoji}
              </span>
              <span className="new-game-page__tab-label">{t.label}</span>
            </button>
          ))}
        </nav>

        <section
          className="new-game-page__pane"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'galaxy' && (
            <div className="new-game-page__pane-inner">
              <h2 className="new-game-page__pane-title">🌌 Galaxy</h2>
              <div className="new-game-page__field-row">
                <label htmlFor="galaxy-size" className="new-game-page__label">
                  Galaxy size
                </label>
                <select
                  id="galaxy-size"
                  className="new-game-page__control"
                  value={galaxySize}
                  onChange={(e) => setGalaxySize(e.target.value as GalaxyPreset)}
                >
                  {Object.entries(GALAXY_PRESETS).map(([id, p]) => (
                    <option key={id} value={id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <InfoTip text="More planets = more enemies, more colonization targets, longer matches. Each system has one star (Sun)." />
              </div>
              <p className="new-game-page__theme-note">
                🎭 Your government theme is rolled by fate at match start. You can&apos;t see it,
                can&apos;t choose it, can&apos;t re-roll it. Every civilization plays the hand
                it&apos;s dealt.
              </p>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="new-game-page__pane-inner">
              <h2 className="new-game-page__pane-title">👥 Players</h2>
              <div className="new-game-page__field-row">
                <label htmlFor="ai-count" className="new-game-page__label">
                  AI civilizations
                </label>
                <input
                  id="ai-count"
                  type="range"
                  min={0}
                  max={11}
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="new-game-page__control new-game-page__control--slider"
                />
                <span className="new-game-page__field-value">{aiCount}</span>
                <InfoTip text="0 = solo sandbox. 1–11 = hostile AI civs you race against. Each plays its own playstyle archetype at its own difficulty." />
              </div>

              {aiCount > 0 && (
                <>
                  <div className="new-game-page__ai-header">
                    <span>🤖 AI player config ({aiCount})</span>
                    <button
                      type="button"
                      className="new-game-page__ai-randomize"
                      onClick={randomizeAllSlots}
                      title="Randomize all AI playstyles + difficulties"
                    >
                      🎲 Randomize all
                    </button>
                  </div>
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
                              updateAISlot(idx, {
                                playstyle: e.target.value as PlaystyleArchetype,
                              })
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
                              updateAISlot(idx, {
                                difficulty: e.target.value as AIDifficultyLevel,
                              })
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
                </>
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="new-game-page__pane-inner">
              <h2 className="new-game-page__pane-title">⚙ Match rules</h2>

              <div className="new-game-page__field-row">
                <label htmlFor="coop-mode" className="new-game-page__label">
                  Co-op mode
                </label>
                <label className="new-game-page__toggle">
                  <input
                    id="coop-mode"
                    type="checkbox"
                    checked={coopMode}
                    onChange={(e) => setCoopMode(e.target.checked)}
                  />
                  <span className="new-game-page__toggle-state">
                    {coopMode ? 'Allied' : 'Free-for-all'}
                  </span>
                </label>
                <InfoTip text="Co-op: human players share a tech pool and the AI is hostile to your alliance. Free-for-all: every civ for itself." />
              </div>

              <div className="new-game-page__field-row">
                <label htmlFor="fog-of-war" className="new-game-page__label">
                  Fog of war
                </label>
                <label className="new-game-page__toggle">
                  <input
                    id="fog-of-war"
                    type="checkbox"
                    checked={fogOfWarEnabled}
                    onChange={(e) => setFogOfWarEnabled(e.target.checked)}
                  />
                  <span className="new-game-page__toggle-state">
                    {fogOfWarEnabled ? 'Hidden until contact' : 'OFF — everything visible'}
                  </span>
                </label>
                <InfoTip text="ON: enemy planets stay hidden until you launch at them OR they launch at you. OFF: every civilization is visible on the galactic map from match start." />
              </div>

              <div className="new-game-page__field-row">
                <label htmlFor="save-mode" className="new-game-page__label">
                  Save mode
                </label>
                <select
                  id="save-mode"
                  className="new-game-page__control"
                  value={saveMode}
                  onChange={(e) =>
                    setSaveMode(e.target.value as 'off' | 'manual' | 'auto-5min' | 'auto-15min')
                  }
                >
                  <option value="off">Off — no autosaves</option>
                  <option value="manual">Manual — 💾 button only</option>
                  <option value="auto-5min">Auto-save every 5 minutes</option>
                  <option value="auto-15min">Auto-save every 15 minutes</option>
                </select>
                <InfoTip text="Auto-saves to local browser storage. Manual 💾 button still works regardless of mode. Off means match state lives only in memory and dies when you close the tab." />
              </div>

              <div className="new-game-page__field-row">
                <label htmlFor="random-events" className="new-game-page__label">
                  Galactic random events
                </label>
                <select
                  id="random-events"
                  className="new-game-page__control"
                  value={randomEventIntensity}
                  onChange={(e) =>
                    setRandomEventIntensity(e.target.value as 'off' | 'low' | 'medium' | 'high')
                  }
                >
                  <option value="off">Off — no random events</option>
                  <option value="low">Low — rare (~one per civ every 3 min)</option>
                  <option value="medium">Medium — moderate (~one per civ per minute)</option>
                  <option value="high">High — frequent (~one per civ every 25 sec)</option>
                </select>
                <InfoTip text="Solar Flares / Plague Outbreaks / Refugee Waves / Ancient Tech Discoveries / etc. fire across the galaxy. Up to 2 / 4 / 6 active per civ at low / medium / high intensity." />
              </div>
            </div>
          )}

          {activeTab === 'win' && (
            <div className="new-game-page__pane-inner">
              <h2 className="new-game-page__pane-title">🏆 Win conditions</h2>
              <p className="new-game-page__pane-hint">
                Match runs <strong>open-ended</strong> until a win condition triggers. Score-based
                conditions create a race; the others end the match when met.
              </p>

              <label className="new-game-page__win-row">
                <input
                  type="checkbox"
                  checked={objectives.lastCivStandingEnabled}
                  onChange={(e) =>
                    setObjectives({ ...objectives, lastCivStandingEnabled: e.target.checked })
                  }
                />
                <span className="new-game-page__win-name">🏴 Last Civ Standing</span>
                <InfoTip text="Last surviving civ wins. No time limit." />
              </label>

              <label className="new-game-page__win-row">
                <input
                  type="checkbox"
                  checked={objectives.apexTechEnabled}
                  onChange={(e) =>
                    setObjectives({ ...objectives, apexTechEnabled: e.target.checked })
                  }
                />
                <span className="new-game-page__win-name">🌌 Apex Tech</span>
                <InfoTip text="First civ to research a winning Apex tech wins. No time limit." />
              </label>

              <label className="new-game-page__win-row">
                <input
                  type="checkbox"
                  checked={objectives.highscoreEnabled}
                  onChange={(e) =>
                    setObjectives({ ...objectives, highscoreEnabled: e.target.checked })
                  }
                />
                <span className="new-game-page__win-name">🎯 Highscore</span>
                {objectives.highscoreEnabled && (
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    className="new-game-page__win-target"
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
                <InfoTip text="First civ to reach the target score wins. Score-based race." />
              </label>

              <label className="new-game-page__win-row">
                <input
                  type="checkbox"
                  checked={objectives.resourceEnabled}
                  onChange={(e) =>
                    setObjectives({ ...objectives, resourceEnabled: e.target.checked })
                  }
                />
                <span className="new-game-page__win-name">📦 Resource stockpile</span>
                {objectives.resourceEnabled && (
                  <input
                    type="number"
                    min={5000}
                    step={5000}
                    className="new-game-page__win-target"
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
                <InfoTip text="First civ to stockpile the target units of the picked resource wins. Score-based race." />
              </label>

              {objectives.resourceEnabled && (
                <div className="new-game-page__win-row new-game-page__win-row--sub">
                  <span className="new-game-page__win-name">Which resource:</span>
                  <select
                    className="new-game-page__control"
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
                  <InfoTip text="Sum of this resource across all your planets is what counts toward the target." />
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="new-game-page__pane-inner new-game-page__pane-inner--preview">
              <h2 className="new-game-page__pane-title">👁 Lobby preview</h2>
              <LobbyPreviewPanel summary={lobbySummary} />
            </div>
          )}
        </section>

        <footer className="new-game-page__footer">
          <div className="new-game-page__summary">
            <span className="new-game-page__summary-row">
              <strong>{matchIsTimed ? 'Open-ended (race to score)' : 'Open-ended'}</strong>
              <span className="new-game-page__summary-sep">·</span>
              <span>{winConditionsLabel}</span>
            </span>
            <span className="new-game-page__summary-row new-game-page__summary-row--mute">
              <span>
                🌌 {preset.label.split(' (')[0]} · {1 + aiCount} civs · Fog{' '}
                {fogOfWarEnabled ? 'ON' : 'OFF'}
              </span>
            </span>
          </div>
          <button type="button" className="new-game-page__start" onClick={handleStart}>
            ▶ Start Match
          </button>
        </footer>
      </main>
    </div>
  )
}
