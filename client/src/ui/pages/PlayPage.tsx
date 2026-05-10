import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  type Account,
  type BuildingDefId,
  type ColonyShipVariantId,
  type LootDrop,
  type LootDropId,
  type MissionObjectiveConfig,
  type PlanetId,
  type ThemeId,
  type Tile,
  THEMES,
  accountId as accountIdValue,
  aggregateEffects,
  newAnonymousAccount,
  themeAsCSSVars,
} from '@smol/shared'
import { type MatchConfig } from '../../match/MatchSim'
import { useMatchSim } from '../../match/useMatchSim'
import { AIPlayerPanel, type AIPlayerSnapshot } from '../panels/AIPlayerPanel'
import { BeaconPanel } from '../panels/BeaconPanel'
import { ColonyShipFlightPanel } from '../panels/ColonyShipFlightPanel'
import { DeceptionPanel } from '../panels/DeceptionPanel'
import { IndigenousPanel } from '../panels/IndigenousPanel'
import { LastHopePanel } from '../panels/LastHopePanel'
import { LootDropPanel } from '../panels/LootDropPanel'
import { ResourcesPanel } from '../panels/ResourcesPanel'
import { ShipBuildPanel } from '../panels/ShipBuildPanel'
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
  readonly objectives?: ReadonlyArray<MissionObjectiveConfig>
}

const DEFAULT_OBJECTIVES: ReadonlyArray<MissionObjectiveConfig> = [
  { id: 'last_civ_standing', target: 1 },
  { id: 'apex_tech', target: 1 },
]

export function PlayPage() {
  const location = useLocation() as { state?: MatchSetupHint }
  const navigate = useNavigate()

  const initialConfig = useMemo<MatchConfig>(() => {
    const hint = location.state ?? null
    const seed = hint?.seed ?? Math.floor(Math.random() * 0xffffff)
    const aiCount = hint?.aiCount ?? 3
    const planetCount = hint?.planetCount ?? 30
    const humanThemeId = hint?.humanThemeId ?? THEMES[Math.floor(Math.random() * THEMES.length)]!.id
    const objectives = hint?.objectives ?? DEFAULT_OBJECTIVES
    const account: Account = newAnonymousAccount(accountIdValue('local-player'), 'You', 'gee', 0)
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
  const [selectedPlanetId, setSelectedPlanetId] = useState<PlanetId | null>(null)

  const humanCivState = sim.state.civs.get(sim.state.humanCivId)!
  const humanTheme = humanCivState.theme

  const ownedPlanets = [...sim.state.planets.values()].filter(
    (p) => p.civId === sim.state.humanCivId,
  )
  void sim.tickCount
  const activePlanetId = selectedPlanetId ?? humanCivState.homePlanetId
  const activePlanet =
    sim.state.planets.get(activePlanetId) ?? sim.state.planets.get(humanCivState.homePlanetId)!

  const styleVars = useMemo(() => themeAsCSSVars(humanTheme), [humanTheme])

  const aiSnapshots: ReadonlyArray<AIPlayerSnapshot> = [...sim.state.civs.values()]
    .filter((c) => !c.isHuman && c.alive)
    .map((c) => ({
      civLabel: c.displayName,
      theme: c.theme,
      playstyle: c.playstyle ?? 'builder',
      difficulty: c.difficulty ?? 'medium',
      lastDecisionLine: `tick=${sim.state.currentTick} | techs=${c.empire.researchedTechs.size} | ships=${c.deceptionLedger.colonyShipsLaunched} | planets=${c.empire.controlledPlanetIds.size}`,
      lastTick: sim.state.currentTick,
    }))

  const otherPlanetsForLaunch = [...sim.state.planets.values()]
    .filter((p) => p.civId !== sim.state.humanCivId)
    .map((p) => ({
      id: String(p.planet.id),
      label: `${String(p.planet.id)} (${p.civId})`,
    }))

  const lootDropsOnOurPlanets: LootDrop[] = []
  for (const drop of sim.state.lootDrops.values()) {
    const p = sim.state.planets.get(drop.planetId)
    if (p && p.civId === sim.state.humanCivId) lootDropsOnOurPlanets.push(drop)
  }

  const indigenousOnActivePlanet = activePlanet.indigenousCivId
    ? (sim.state.indigenousCivs.get(activePlanet.indigenousCivId) ?? null)
    : null

  const techEffects = aggregateEffects(humanCivState.empire.researchedTechs)

  const firstPad = [...activePlanet.launchPads.values()][0] ?? null

  const handleTileClick = (tile: Tile): void => {
    if (tile.occupancy !== 'empty') return
    sim.placeBuilding({
      planetId: activePlanet.planet.id,
      tileId: tile.id,
      defId: selectedBuildingId as BuildingDefId,
    })
  }

  const handleQuickBuild = (defId: string): void => {
    setSelectedBuildingId(defId)
  }

  const handleQuickBuildPlace = (defId: string): void => {
    setSelectedBuildingId(defId)
    sim.placeBuilding({
      planetId: activePlanet.planet.id,
      defId: defId as BuildingDefId,
    })
  }

  const handleCampaign = (archetype: string): void => {
    sim.launchCampaign({
      planetId: activePlanet.planet.id,
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

  const handleClaimLoot = (id: LootDropId): void => {
    sim.claimLoot(id)
  }

  const handleTriggerLastHope = (): void => {
    sim.triggerLastHope(sim.state.humanCivId)
  }

  const handleBuildShip = (variantId: ColonyShipVariantId): void => {
    if (!firstPad) return
    sim.buildShip({ padId: firstPad.id, variantId })
  }

  const handleLaunchShip = (targetPlanetIdStr: string): void => {
    if (!firstPad) return
    sim.launchShipFromPad({
      padId: firstPad.id,
      targetPlanetId: targetPlanetIdStr as unknown as PlanetId,
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

      {ownedPlanets.length > 1 && (
        <div className="play-page__planet-selector">
          <span className="play-page__planet-selector-label">Viewing:</span>
          {ownedPlanets.map((p) => (
            <button
              key={String(p.planet.id)}
              type="button"
              className={`play-page__planet-pill ${activePlanet.planet.id === p.planet.id ? 'play-page__planet-pill--on' : ''}`}
              onClick={() => setSelectedPlanetId(p.planet.id)}
            >
              {p.planet.biome.emoji} {String(p.planet.id)}
            </button>
          ))}
        </div>
      )}

      <main className="play-page__layout">
        <aside className="play-page__col play-page__col--left">
          <ResourcesPanel
            inventory={activePlanet.inventory}
            title={`${humanTheme.emoji} Stockpile (${String(activePlanet.planet.id)})`}
          />
          <DeceptionPanel
            theme={humanTheme}
            faction={activePlanet.faction}
            ledger={humanCivState.deceptionLedger}
          />
          <IndigenousPanel indig={indigenousOnActivePlanet} />
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
                onDoubleClick={() => handleQuickBuildPlace(b.defId)}
                title={`Click to select. Double-click to place on next empty tile. Or click a tile.`}
              >
                <span aria-hidden>{b.emoji}</span> {b.label}
              </button>
            ))}
          </div>
          <p className="play-page__build-hint">
            Click a tile to place selected building. Double-click a build button to drop on next
            empty tile.
          </p>
          <TilePlacementGrid
            tiles={activePlanet.planet.tiles.slice(0, 37)}
            biome={activePlanet.planet.biome}
            civResearchedTechs={humanCivState.empire.researchedTechs}
            selectedBuildingDefId={selectedBuildingId as BuildingDefId}
            onTileClick={handleTileClick}
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
          <ShipBuildPanel
            pad={firstPad}
            inventory={activePlanet.inventory}
            researchedTechs={humanCivState.empire.researchedTechs}
            maxPayloadTier={techEffects.maxPayloadTier}
            onBuild={handleBuildShip}
            onLaunch={handleLaunchShip}
            otherPlanets={otherPlanetsForLaunch}
          />
          <ColonyShipFlightPanel
            flights={[...sim.state.flights.values()]}
            onAfterAction={() => undefined}
          />
          <LootDropPanel
            drops={lootDropsOnOurPlanets}
            currentTick={sim.state.currentTick}
            onClaim={handleClaimLoot}
          />
          <LastHopePanel
            state={humanCivState.lastHopeEvac}
            triggered={humanCivState.lastHopeTriggered}
            canTrigger={!humanCivState.lastHopeTriggered}
            onTrigger={handleTriggerLastHope}
          />
          <BeaconPanel beacon={activePlanet.beacon} currentTick={sim.state.currentTick} />
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
        <p className="play-page__targets" hidden={otherPlanetsForLaunch.length === 0}>
          Targetable: {otherPlanetsForLaunch.length} other planet
          {otherPlanetsForLaunch.length === 1 ? '' : 's'}
        </p>
      </footer>
    </div>
  )
}
