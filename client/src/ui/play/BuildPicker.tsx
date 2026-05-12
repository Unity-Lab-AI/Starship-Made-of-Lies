import { useMemo } from 'react'
import {
  type BuildingDef,
  type BuildingDefId,
  type Empire,
  type PlanetInventory,
  type TechId,
  type Theme,
  BLDG_AQUEDUCT,
  BLDG_FARM,
  BLDG_HOME,
  BLDG_LUMBER_CAMP,
  BLDG_MINE_FIELD,
  BLDG_QUARRY,
  BLDG_SCHOOL,
  BLDG_SOLAR_ARRAY,
  BUILDINGS,
  aggregateEffects,
  getThemedBuildingEmoji,
  getThemedBuildingName,
  stockOf,
} from '@smol/shared'
import { PanelFrame } from './PanelFrame'
import './play-shell.css'

const BASELINE_UNLOCKED: ReadonlySet<BuildingDefId> = new Set([
  BLDG_FARM,
  BLDG_AQUEDUCT,
  BLDG_LUMBER_CAMP,
  BLDG_QUARRY,
  BLDG_HOME,
  BLDG_SCHOOL,
  BLDG_SOLAR_ARRAY,
  BLDG_MINE_FIELD,
])

interface BuildPickerProps {
  readonly empire: Empire
  readonly inventory: PlanetInventory
  readonly onSelect: (defId: BuildingDefId) => void
  readonly onClose: () => void
  readonly currentBuildMode: BuildingDefId | null
  // PHASE 17.12.1 — theme drives per-building name + emoji reskins. When omitted (legacy
  // callers), the raw def.name + def.emoji ship through unchanged.
  readonly theme?: Theme
}

export function BuildPicker({
  empire,
  inventory,
  onSelect,
  onClose,
  currentBuildMode,
  theme,
}: BuildPickerProps) {
  const unlockedSet = useMemo<ReadonlySet<BuildingDefId>>(() => {
    const set = new Set<BuildingDefId>(BASELINE_UNLOCKED)
    const techEffects = aggregateEffects(empire.researchedTechs as ReadonlySet<TechId>)
    for (const id of techEffects.unlockedBuildings) set.add(id)
    return set
  }, [empire.researchedTechs])

  const cards = BUILDINGS.map((b) => ({
    def: b,
    unlocked: unlockedSet.has(b.id),
    affordable: b.buildCost.every((c) => stockOf(inventory, c.resource) >= c.amount),
  })).filter((entry) => entry.unlocked || entry.def.id === currentBuildMode)

  return (
    <PanelFrame
      panelId="build-picker"
      title="Build"
      emoji="🏗"
      onClose={onClose}
      variant="centered"
      width={680}
      extraClass="build-picker"
    >
      <p className="build-picker__hint">
        Pick a building, then click any empty owned tile to place it. ESC to cancel.
      </p>
      <div className="build-picker__grid">
        {cards.map(({ def, affordable }) => (
          <BuildCard
            key={String(def.id)}
            def={def}
            inventory={inventory}
            affordable={affordable}
            selected={currentBuildMode === def.id}
            displayName={(theme && getThemedBuildingName(theme, def.id)) ?? def.name}
            displayEmoji={(theme && getThemedBuildingEmoji(theme, def.id)) ?? def.emoji}
            onClick={() => onSelect(def.id)}
          />
        ))}
      </div>
    </PanelFrame>
  )
}

interface BuildCardProps {
  readonly def: BuildingDef
  readonly inventory: PlanetInventory
  readonly affordable: boolean
  readonly selected: boolean
  // PHASE 17.12.1 — theme-overridden display name + emoji. Falls back to def.name / def.emoji
  // when the active theme has no override for this building.
  readonly displayName: string
  readonly displayEmoji: string
  readonly onClick: () => void
}

function BuildCard({
  def,
  inventory,
  affordable,
  selected,
  displayName,
  displayEmoji,
  onClick,
}: BuildCardProps) {
  return (
    <button
      type="button"
      className={`build-card ${selected ? 'build-card--selected' : ''} ${affordable ? '' : 'build-card--unaffordable'}`}
      onClick={onClick}
      title={def.description}
    >
      <span className="build-card__emoji" aria-hidden>
        {displayEmoji}
      </span>
      <span className="build-card__name">{displayName}</span>
      <ul className="build-card__costs">
        {def.buildCost.map((cost) => {
          const have = stockOf(inventory, cost.resource)
          const enough = have >= cost.amount
          return (
            <li
              key={String(cost.resource)}
              className={`build-card__cost ${enough ? '' : 'build-card__cost--short'}`}
            >
              {cost.amount} {String(cost.resource)}
            </li>
          )
        })}
      </ul>
      <span className="build-card__slots">
        {def.citizenSlots > 0 ? `👤 ${def.citizenSlots}` : ''}
      </span>
    </button>
  )
}
