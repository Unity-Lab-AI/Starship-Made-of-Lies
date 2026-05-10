import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  type Account,
  type BuildingDefId,
  type MissionObjectiveConfig,
  type ThemeId,
  THEMES,
  accountId as accountIdValue,
  newAnonymousAccount,
  themeAsCSSVars,
} from '@smol/shared'
import { type MatchConfig } from '../../match/MatchSim'
import { useMatchSim } from '../../match/useMatchSim'
import { AIPlayerPanel, type AIPlayerSnapshot } from '../panels/AIPlayerPanel'
import { BeaconPanel } from '../panels/BeaconPanel'
import { ColonyShipFlightPanel } from '../panels/ColonyShipFlightPanel'
import { DeceptionPanel } from '../panels/DeceptionPanel'
import { LaunchPadPanel } from '../panels/LaunchPadPanel'
import { ResourcesPanel } from '../panels/ResourcesPanel'
import { TechTreePanel } from '../panels/TechTreePanel'
import { TilePlacementGrid } from '../panels/TilePlacementGrid'
import { MatchEndScreen } from './MatchEndScreen'
import './SubPage.css'
import './PlayPage.css'

const QUICK_BUILDINGS: ReadonlyArray<{ defId: string; emoji: string; label: string }> = [
  { defId: 'farm', emoji: '🌾', label: 'Farm' },
  { defId: 'aqueduct', emoji: '💧', label: 'Aqueduct' },
  { defId: 'lumberCamp', emoji: '🪵', label: 'Lumber' },
  { defId: 'mine', emoji: '⛏️', label: 'Mine' },
  { defId: 'factory', emoji: '🏭', label: 'Factory' },
  { defId: 'lab', emoji: '🔬', label: 'Lab' },
  { defId: 'school', emoji: '🏫', label: 'School' },
  { defId: 'launchPad', emoji: '🚀', label: 'Launch Pad' },
]

interface MatchSetupHint {
  readonly seed: number
  readonly aiCount: number
  readonly planetCount: number
  readonly humanThemeId: ThemeId
}

export function PlayPage() {
  const location = useLocation() as { state?: MatchSetupHint }
  const navigate = useNavigate()

  const initialConfig = useMemo<MatchConfig>(() => {
    const hint = location.state ?? null
    const seed = hint?.seed ?? Math.floor(Math.random() * 0xffffff)
    const aiCount = hint?.aiCount ?? 3
    const planetCount = hint?.planetCount ?? 30
    const humanThemeId = hint?.humanThemeId ?? THEMES[Math.floor(Math.random() * THEMES.length)]!.id
    const account: Account = newAnonymousAccount(accountIdValue('local-player'), 'You', 'gee', 0)
    const objectives: ReadonlyArray<MissionObjectiveConfig> = [
      { id: 'highscore_target', target: 50000 },
      { id: 'last_civ_standing', target: 1 },
      { id: 'apex_tech', target: 1 },
    ]
    return {
      seed,
      planetCount,
      aiCount,
      humanThemeId,
      humanDisplayName: 'You',
      humanAccount: account,
      objectives,
      tickCapOverride: null,
    }
  }, [location.state])

  const sim = useMatchSim(initialConfig)
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('farm')

  const humanCivState = sim.state.civs.get(sim.state.humanCivId)!
  const homePlanet = sim.state.planets.get(humanCivState.homePlanetId)!
  const humanTheme = humanCivState.theme
  const styleVars = useMemo(() => themeAsCSSVars(humanTheme), [humanTheme])

  const aiSnapshots: ReadonlyArray<AIPlayerSnapshot> = [...sim.state.civs.values()]
    .filter((c) => !c.isHuman && c.alive)
    .map((c) => ({
      civLabel: c.displayName,
      theme: c.theme,
      playstyle: c.playstyle ?? 'builder',
      difficulty: c.difficulty ?? 'medium',
      lastDecisionLine: `tick=${sim.state.currentTick} | techs=${c.empire.researchedTechs.size} | ships=${c.deceptionLedger.colonyShipsLaunched}`,
      lastTick: sim.state.currentTick,
    }))

  const otherPlanets = [...sim.state.planets.values()]
    .filter((p) => p.civId !== sim.state.humanCivId)
    .map((p) => ({ id: p.planet.id, label: `${p.civId}` }))

  const handleTileClick = (tileId: string): void => {
    const tile = homePlanet.planet.tiles.find((t) => t.id === (tileId as never))
    if (!tile) return
    if (tile.occupancy !== 'empty') return
    sim.placeBuilding({
      planetId: homePlanet.planet.id,
      tileId: tile.id,
      defId: selectedBuildingId as BuildingDefId,
    })
  }
  void handleTileClick

  const handleQuickBuild = (defId: string): void => {
    setSelectedBuildingId(defId)
    sim.placeBuilding({
      planetId: homePlanet.planet.id,
      defId: defId as BuildingDefId,
    })
  }

  const handleCampaign = (archetype: string): void => {
    sim.launchCampaign({
      planetId: homePlanet.planet.id,
      archetype: archetype as never,
    })
  }

  const handleResetTo = (themeId: ThemeId): void => {
    sim.resetMatch({
      ...initialConfig,
      seed: Math.floor(Math.random() * 0xffffff),
      humanThemeId: themeId,
    })
  }

  if (sim.state.phase === 'ENDED') {
    return (
      <MatchEndScreen
        match={sim.state}
        onPlayAgain={(themeId) => handleResetTo(themeId)}
        onGoHome={() => navigate('/')}
      />
    )
  }

  return (
    <div className="play-page" style={styleVars as React.CSSProperties}>
      <header className="play-page__header">
        <Link to="/" className="back-link">
          ← Quit
        </Link>
        <div className="play-page__title">
          <span className="play-page__emoji" aria-hidden>
            {humanTheme.emoji}
          </span>
          <span>{humanTheme.name}</span>
          <span className="play-page__sep">·</span>
          <span className="play-page__theme-tagline">{humanTheme.tagline}</span>
        </div>
        <div className="play-page__time">
          <span>tick {sim.state.currentTick}</span>
          <button type="button" className="play-page__btn" onClick={sim.togglePause}>
            {sim.running ? '⏸' : '▶'}
          </button>
          {([1, 2, 4, 8] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`play-page__btn ${sim.speed === s ? 'play-page__btn--on' : ''}`}
              onClick={() => sim.setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </header>

      <main className="play-page__layout">
        <aside className="play-page__col play-page__col--left">
          <ResourcesPanel
            inventory={homePlanet.inventory}
            title={`${humanTheme.emoji} Stockpile`}
          />
          <DeceptionPanel
            theme={humanTheme}
            faction={homePlanet.faction}
            ledger={humanCivState.deceptionLedger}
          />
          <TechTreePanel empire={humanCivState.empire} />
        </aside>

        <section className="play-page__col play-page__col--center">
          <div className="play-page__build-bar">
            {QUICK_BUILDINGS.map((b) => (
              <button
                key={b.defId}
                type="button"
                className={`play-page__build-btn ${selectedBuildingId === b.defId ? 'play-page__build-btn--on' : ''}`}
                onClick={() => handleQuickBuild(b.defId)}
                title={`Build ${b.label} on next empty tile`}
              >
                <span aria-hidden>{b.emoji}</span> {b.label}
              </button>
            ))}
          </div>
          <TilePlacementGrid
            tiles={homePlanet.planet.tiles.slice(0, 37)}
            biome={homePlanet.planet.biome}
            civResearchedTechs={humanCivState.empire.researchedTechs}
            selectedBuildingDefId={selectedBuildingId as BuildingDefId}
          />
          <div className="play-page__campaigns">
            <h3>Propaganda</h3>
            {(
              [
                ['newWorldHope', '🌅 New World Hope'],
                ['pioneerDrive', '🚀 Pioneer Drive'],
                ['unityRally', '🤝 Unity Rally'],
                ['enemyAtTheGates', '⚠️ Enemy at the Gates'],
                ['sacrificeForTomorrow', '🕯️ Sacrifice For Tomorrow'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="play-page__campaign-btn"
                onClick={() => handleCampaign(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <aside className="play-page__col play-page__col--right">
          {(() => {
            const firstPad = [...homePlanet.launchPads.values()][0]
            if (!firstPad) {
              return (
                <div className="play-page__pad-empty">
                  Build a 🚀 Launch Pad to start fielding colony ships.
                </div>
              )
            }
            return <LaunchPadPanel pad={firstPad} onAfterAction={() => undefined} />
          })()}
          <ColonyShipFlightPanel
            flights={[...sim.state.flights.values()]}
            onAfterAction={() => undefined}
          />
          <BeaconPanel beacon={homePlanet.beacon} currentTick={sim.state.currentTick} />
        </aside>
      </main>

      <footer className="play-page__footer">
        <details className="play-page__events">
          <summary>📜 Events ({sim.state.events.length})</summary>
          <ul>
            {[...sim.state.events]
              .reverse()
              .slice(0, 30)
              .map((ev, i) => (
                <li key={i}>
                  <span className="play-page__event-tick">[t{ev.atTick}]</span> {ev.message}
                </li>
              ))}
          </ul>
        </details>
        <AIPlayerPanel snapshots={aiSnapshots} />
        <p className="play-page__targets" hidden={otherPlanets.length === 0}>
          Targetable: {otherPlanets.length} other planet{otherPlanets.length === 1 ? '' : 's'}
        </p>
      </footer>
    </div>
  )
}
