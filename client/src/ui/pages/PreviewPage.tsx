import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BLDG_FARM,
  BLDG_LAUNCH_PAD,
  BLDG_MINE,
  type BuildingDefId,
  civId,
  generateGalaxy,
  getTheme,
  newDeceptionLedger,
  newEmpire,
  newFactionSplit,
  newPlanetInventory,
  RESOURCE_FOOD,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_PLANKS,
  RESOURCE_PROPAGANDA_MATERIALS,
  recordColonyShipLaunch,
  recordConscription,
  recordEnemyCivDestroyed,
  recordVolunteers,
  startResearch,
  TECH_AEROSPACE,
  TECH_COMPUTING,
  TECH_INDUSTRIAL_LOGISTICS,
  TECH_MASS_PRODUCTION,
  THEMES,
  type ThemeId,
  themeAsCSSVars,
  type TechId,
} from '@smol/shared'
import { DeceptionPanel } from '../panels/DeceptionPanel'
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
      </div>
    </div>
  )
}
