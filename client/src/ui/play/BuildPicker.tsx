import { useMemo } from 'react'
import {
  type BuildingDef,
  type BuildingDefId,
  type Empire,
  type PlanetInventory,
  type TechId,
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
}

export function BuildPicker({
  empire,
  inventory,
  onSelect,
  onClose,
  currentBuildMode,
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
  readonly onClick: () => void
}

function BuildCard({ def, inventory, affordable, selected, onClick }: BuildCardProps) {
  return (
    <button
      type="button"
      className={`build-card ${selected ? 'build-card--selected' : ''} ${affordable ? '' : 'build-card--unaffordable'}`}
      onClick={onClick}
      title={def.description}
    >
      <span className="build-card__emoji" aria-hidden>
        {def.emoji}
      </span>
      <span className="build-card__name">{def.name}</span>
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
