import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BLDG_FARM,
  BLDG_LAUNCH_PAD,
  BLDG_MINE,
  type BuildingDefId,
  civId,
  type ColonyShipFlight,
  colonyShipFlightId,
  generateGalaxy,
  getTheme,
  newColonyShipFlight,
  newDeceptionLedger,
  newEmpire,
  newFactionSplit,
  newLaunchPad,
  newPlanetBeacon,
  newPlanetInventory,
  type PlanetBeacon,
  planetId as planetIdValue,
  pushBeaconAlert,
  RESOURCE_FOOD,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_PLANKS,
  RESOURCE_PROPAGANDA_MATERIALS,
  recordColonyShipLaunch,
  recordConscription,
  recordEnemyCivDestroyed,
  recordVolunteers,
  setTargetQueue,
  SHIP_PILGRIM_VOLUNTEER,
  SHIP_SCOUT,
  SHIP_STANDARD,
  startResearch,
  TECH_AEROSPACE,
  TECH_COMPUTING,
  TECH_INDUSTRIAL_LOGISTICS,
  TECH_MASS_PRODUCTION,
  THEMES,
  type ThemeId,
  themeAsCSSVars,
  type TechId,
  tileId as tileIdValue,
} from '@smol/shared'
import { BeaconPanel } from '../panels/BeaconPanel'
import { BootSequencePanel } from '../panels/BootSequencePanel'
import { ColonyShipFlightPanel } from '../panels/ColonyShipFlightPanel'
import { DeceptionPanel } from '../panels/DeceptionPanel'
import { LaunchPadPanel } from '../panels/LaunchPadPanel'
import { TechTreePanel } from '../panels/TechTreePanel'
import { ResourcesPanel } from '../panels/ResourcesPanel'
import { TilePlacementGrid } from '../panels/TilePlacementGrid'
import { UnityAILabLogo } from '../branding/UnityAILabLogo'
import { playSynthCue } from '../../audio/synth'
import './PreviewPage.css'

export function PreviewPage() {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(THEMES[0]!.id)
  const [selectedBuildingDefId, setSelectedBuildingDefId] = useState<BuildingDefId | null>(
    BLDG_FARM,
  )

  const theme = getTheme(selectedThemeId)
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])

  const galaxy = useMemo(() => generateGalaxy({ seed: 1234, planetCount: 100 }), [])
  const startingPlanet = galaxy.planets[0]!

  const empire = useMemo(() => {
    const e = newEmpire(civId('preview-civ'), startingPlanet.id)
    e.researchedTechs.add(TECH_INDUSTRIAL_LOGISTICS)
    e.researchedTechs.add(TECH_MASS_PRODUCTION)
    e.researchedTechs.add(TECH_COMPUTING)
    startResearch(e, TECH_AEROSPACE)
    e.researchProgress.set(TECH_AEROSPACE, 24)
    return e
  }, [startingPlanet.id])

  const civResearchedTechs: ReadonlySet<TechId> = empire.researchedTechs

  const inventory = useMemo(() => {
    const inv = newPlanetInventory(startingPlanet.id)
    inv.stocks.set(RESOURCE_FOOD, 1240)
    inv.stocks.set(RESOURCE_PLANKS, 320)
    inv.stocks.set(RESOURCE_METALS, 880)
    inv.stocks.set(RESOURCE_INGOTS, 240)
    inv.stocks.set(RESOURCE_PROPAGANDA_MATERIALS, 80)
    return inv
  }, [startingPlanet.id])

  const faction = useMemo(() => {
    const f = newFactionSplit(1000)
    f.skeptic = 320
    f.dissident = 80
    f.loyal = 600
    return f
  }, [])

  const ledger = useMemo(() => {
    const l = newDeceptionLedger()
    recordVolunteers(l, 4830)
    recordConscription(l, 1200)
    recordColonyShipLaunch(l, 420)
    recordColonyShipLaunch(l, 380)
    recordEnemyCivDestroyed(l)
    recordEnemyCivDestroyed(l)
    return l
  }, [])

  const [, forceRefresh] = useState(0)
  const triggerRefresh = () => forceRefresh((n) => n + 1)

  const launchPad = useMemo(() => {
    const pad = newLaunchPad(
      tileIdValue('preview-pad-1'),
      civId('preview-civ'),
      startingPlanet.id,
      true,
    )
    pad.state = 'READY'
    pad.loadedShipVariantId = SHIP_STANDARD
    pad.fuelLoaded = 60
    pad.ammoLoaded = 10
    pad.citizensLoaded = 200
    setTargetQueue(pad, [
      {
        targetPlanetId: galaxy.planets[1]?.id ?? planetIdValue('preview-target'),
        label: 'Target Alpha',
      },
    ])
    return pad
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startingPlanet.id])

  const inFlightShips = useMemo<ColonyShipFlight[]>(() => {
    const target = galaxy.planets[1]?.position ?? { x: 1000, y: 0, z: 0 }
    const scout = newColonyShipFlight({
      id: colonyShipFlightId('preview-flight-1'),
      variantId: SHIP_SCOUT,
      launchingCivId: civId('preview-civ'),
      fromPlanetId: startingPlanet.id,
      targetPlanetId: galaxy.planets[1]?.id ?? planetIdValue('preview-target'),
      fromPosition: startingPlanet.position,
      targetPosition: target,
      travelRadius: 1000,
      citizensAboard: 0,
      signalLossSeed: 12345,
    })
    scout.ticksFlown = Math.max(1, Math.round(scout.totalTicks * 0.4))
    scout.phase = 'COAST'

    const pilgrim = newColonyShipFlight({
      id: colonyShipFlightId('preview-flight-2'),
      variantId: SHIP_PILGRIM_VOLUNTEER,
      launchingCivId: civId('preview-civ'),
      fromPlanetId: startingPlanet.id,
      targetPlanetId: galaxy.planets[2]?.id ?? planetIdValue('preview-target-2'),
      fromPosition: startingPlanet.position,
      targetPosition: galaxy.planets[2]?.position ?? { x: 800, y: 400, z: 200 },
      travelRadius: 1000,
      citizensAboard: 1500,
      signalLossSeed: 67890,
    })
    pilgrim.ticksFlown = Math.max(1, Math.round(pilgrim.totalTicks * 0.85))
    pilgrim.phase = 'REENTRY'

    return [scout, pilgrim]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startingPlanet.id])

  const beacon = useMemo<PlanetBeacon>(() => {
    const b = newPlanetBeacon(startingPlanet.id, civId('preview-civ'))
    pushBeaconAlert(b, {
      id: 'a1',
      planetId: startingPlanet.id,
      observerCivId: civId('preview-civ'),
      kind: 'INCOMING_HOSTILE',
      atTick: 110,
      summary: 'Hostile inbound from THE-CHOSEN-2 — ETA 14 ticks',
      relatedFlightId: 'f-9001',
    })
    pushBeaconAlert(b, {
      id: 'a2',
      planetId: startingPlanet.id,
      observerCivId: civId('preview-civ'),
      kind: 'OUTGOING_LAUNCH',
      atTick: 105,
      summary: 'Outbound to TARGET-DELTA — ETA 38 ticks',
    })
    pushBeaconAlert(b, {
      id: 'a3',
      planetId: startingPlanet.id,
      observerCivId: civId('preview-civ'),
      kind: 'INTERCEPT_SUCCESS',
      atTick: 92,
      summary: 'Intercepted hostile from RED-ARM-7',
    })
    pushBeaconAlert(b, {
      id: 'a4',
      planetId: startingPlanet.id,
      observerCivId: civId('preview-civ'),
      kind: 'COLONY_ESTABLISHED',
      atTick: 80,
      summary: 'Colony established by allied-trade-2',
    })
    return b
  }, [startingPlanet.id])

  return (
    <div className="preview-page" style={styleVars as React.CSSProperties}>
      <header className="preview-page__header">
        <div className="preview-page__brand">
          <UnityAILabLogo size={36} />
          <h1>SMoL Panel Preview</h1>
        </div>
        <div className="preview-page__controls">
          <label>
            Theme:
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value as ThemeId)}
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Building:
            <select
              value={selectedBuildingDefId ?? ''}
              onChange={(e) =>
                setSelectedBuildingDefId(
                  e.target.value === '' ? null : (e.target.value as BuildingDefId),
                )
              }
            >
              <option value="">— none —</option>
              <option value={BLDG_FARM as unknown as string}>🌾 Farm</option>
              <option value={BLDG_MINE as unknown as string}>🪨 Mine</option>
              <option value={BLDG_LAUNCH_PAD as unknown as string}>🚀 Launch Pad</option>
            </select>
          </label>
          <button type="button" onClick={() => playSynthCue('click')}>
            Click ▶
          </button>
          <button type="button" onClick={() => playSynthCue('build')}>
            Build ▶
          </button>
          <button type="button" onClick={() => playSynthCue('launch')}>
            Launch ▶
          </button>
          <Link to="/" className="preview-page__back-link">
            ← Title
          </Link>
        </div>
      </header>

      <p className="preview-page__tagline">
        <strong>{theme.name}:</strong> {theme.tagline}
      </p>

      <div className="preview-page__grid">
        <DeceptionPanel theme={theme} faction={faction} ledger={ledger} />
        <ResourcesPanel inventory={inventory} title={`${theme.emoji} Stockpile`} />
        <TechTreePanel empire={empire} />
        <TilePlacementGrid
          tiles={startingPlanet.tiles.slice(0, 37)}
          biome={startingPlanet.biome}
          civResearchedTechs={civResearchedTechs}
          selectedBuildingDefId={selectedBuildingDefId}
        />
        <LaunchPadPanel pad={launchPad} onAfterAction={triggerRefresh} />
        <ColonyShipFlightPanel flights={inFlightShips} onAfterAction={triggerRefresh} />
        <BeaconPanel beacon={beacon} currentTick={120} />
        <BootSequencePanel theme={theme} />
      </div>
    </div>
  )
}
