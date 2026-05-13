import { useMemo } from 'react'
import {
  type BuildingDef,
  type BuildingDefId,
  type Empire,
  type PlanetInventory,
  type TechId,
  type TechNode,
  type Theme,
  BLDG_AQUEDUCT,
  BLDG_FARM,
  BLDG_HOME,
  BLDG_LAB,
  BLDG_SCHOOL,
  BLDG_SOLAR_ARRAY,
  BUILDINGS,
  TECH_NODES,
  aggregateEffects,
  getThemedBuildingEmoji,
  getThemedBuildingName,
  stockOf,
} from '@smol/shared'
import { PanelFrame } from './PanelFrame'
import './play-shell.css'

// PHASE 17.12.2 (user correction 2026-05-12) — BLDG_MINE_FIELD removed from baseline-unlocked.
// Mines are LAUNCHED ships in the SMoL model, not tile-buildable defenses. The BLDG_MINE_FIELD
// def + MatchPlanetState.mineFields[] data model stays alive (deployed mines still render +
// intercept), but the player surface for "create a mine" routes through the Ship Builder →
// design a mine-laying variant → launch from a pad workflow. Per user verbatim *"mine fields
// are emjoi spaceships launched one at a time after printing and design work of what type of
// starship u are using for the mine fireld options"*.
//
// PHASE 17.L.D.10 (HOTFIX 2026-05-12) — BLDG_LUMBER_CAMP + BLDG_QUARRY REMOVED from baseline.
// Per user verbatim *"industiral tech has lumber camp in it and isnt researched but i can
// fucking buikld a lumber camp without it reserached so wtf??"*. Both are listed in
// placement.ts TECH_GATED_BUILDINGS — they require TECH_INDUSTRIAL_LOGISTICS researched. The
// UI used to declare them baseline-unlocked which contradicted the sim contract. Now they
// render as locked + show the 🧬 prereq hint until the tech is researched. Pre-built starter
// instances (1 Lumber Camp + 1 Quarry from seedStarterBuildings) still grandfather in because
// seedStarterBuildings bypasses placeBuildingCanonical entirely. Player has to research
// Industrial Logistics (30 pts → covered by the 30-pt research seed) to build ADDITIONAL
// Lumber Camps / Quarries on top of the freebies.
// PHASE 17.L.D.10 (HOTFIX 2026-05-13, REV 2) — BLDG_LAB ADDED to baseline. Per user verbatim
// *"we need a sciecence research point generating building to start with so we can fucking do
// somthing as far as un l;ocking tech, currently there is no way to unlick computing without
// having a research pooint poroducing building of starting spawn teir"*. Was gated behind
// TECH_COMPUTING (60+60+60 = 180 pts climb before research scaled past the 2 starter Labs);
// now baseline. TECH_COMPUTING still ships its researchSpeedMultiplier×1.2 effect so it
// remains valuable, just no longer the unlock for the building.
const BASELINE_UNLOCKED: ReadonlySet<BuildingDefId> = new Set([
  BLDG_FARM,
  BLDG_AQUEDUCT,
  BLDG_HOME,
  BLDG_LAB,
  BLDG_SCHOOL,
  BLDG_SOLAR_ARRAY,
])

// PHASE 17.L.D (HOTFIX 2026-05-12) — reverse lookup: which tech unlocks this building. Used
// to render a "🧬 Requires: TechName" hint on locked build cards so the player can see what
// they need to research instead of the building being invisible. Returns the first tech that
// lists the building in its effects.unlockBuildings; in practice each building is unlocked
// by exactly one tech.
function findTechUnlockingBuilding(buildingId: BuildingDefId): TechNode | null {
  for (const node of TECH_NODES) {
    if (node.effects.unlockBuildings?.includes(buildingId)) return node
  }
  return null
}

interface BuildPickerProps {
  readonly empire: Empire
  readonly inventory: PlanetInventory
  readonly onSelect: (defId: BuildingDefId) => void
  readonly onClose: () => void
  readonly currentBuildMode: BuildingDefId | null
  // PHASE 17.12.1 — theme drives per-building name + emoji reskins. When omitted (legacy
  // callers), the raw def.name + def.emoji ship through unchanged.
  readonly theme?: Theme
  // PHASE 17.L.D.16 (2026-05-13) — demolish mode toggle. When demolish mode is active, the
  // player clicks any built-on tile and the building is recycled with 100% buildCost refund.
  // BuildPicker exposes the button; PlayPage owns the boolean state + routes tile clicks.
  readonly demolishMode: boolean
  readonly onToggleDemolishMode: () => void
}

export function BuildPicker({
  empire,
  inventory,
  onSelect,
  onClose,
  currentBuildMode,
  theme,
  demolishMode,
  onToggleDemolishMode,
}: BuildPickerProps) {
  const unlockedSet = useMemo<ReadonlySet<BuildingDefId>>(() => {
    const set = new Set<BuildingDefId>(BASELINE_UNLOCKED)
    const techEffects = aggregateEffects(empire.researchedTechs as ReadonlySet<TechId>)
    for (const id of techEffects.unlockedBuildings) set.add(id)
    return set
  }, [empire.researchedTechs])

  // PHASE 17.L.D (HOTFIX 2026-05-12) — user verbatim *"im not seeing anywhere how to unlock
  // the different parts for my spaceships or the differetn space ships or the launch pads
  // and command pads and the mininers no way to build them or research them"*. Previously
  // the filter was `.unlocked || currentBuildMode` which HID every tech-gated building from
  // the picker. Player couldn't see Launch Pad, Mining Outpost, reactors, etc. existed.
  // Now every building renders; locked ones are visually de-emphasized + show a 🧬
  // tech-prereq hint so the player knows exactly what to research.
  const cards = BUILDINGS.map((b) => ({
    def: b,
    unlocked: unlockedSet.has(b.id),
    affordable: b.buildCost.every((c) => stockOf(inventory, c.resource) >= c.amount),
    unlockingTech: unlockedSet.has(b.id) ? null : findTechUnlockingBuilding(b.id),
  }))

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
        {demolishMode
          ? '🔨 DEMOLISH MODE — click any owned built tile to recycle the building (100% refund). Click Demolish again to cancel.'
          : 'Pick a building, then click any empty owned tile to place it. ESC to cancel.'}
      </p>
      {/* PHASE 17.L.D.16 — demolish mode toggle. Visually distinct (red border + danger icon)
          so the player understands this is a destructive-but-refundable action. When active,
          tile clicks demolish instead of placing. */}
      <button
        type="button"
        className={`build-picker__demolish-toggle${demolishMode ? ' build-picker__demolish-toggle--active' : ''}`}
        onClick={onToggleDemolishMode}
        aria-pressed={demolishMode}
      >
        <span aria-hidden>🔨</span>
        <span>
          {demolishMode
            ? 'Demolish mode — ON (click a building to recycle)'
            : 'Demolish (recycle 100% of buildCost)'}
        </span>
      </button>
      <div className="build-picker__grid">
        {cards.map(({ def, affordable, unlocked, unlockingTech }) => (
          <BuildCard
            key={String(def.id)}
            def={def}
            inventory={inventory}
            affordable={affordable}
            unlocked={unlocked}
            unlockingTech={unlockingTech}
            selected={currentBuildMode === def.id}
            displayName={(theme && getThemedBuildingName(theme, def.id)) ?? def.name}
            displayEmoji={(theme && getThemedBuildingEmoji(theme, def.id)) ?? def.emoji}
            onClick={() => {
              if (unlocked) onSelect(def.id)
            }}
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
  readonly unlocked: boolean
  readonly unlockingTech: TechNode | null
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
  unlocked,
  unlockingTech,
  selected,
  displayName,
  displayEmoji,
  onClick,
}: BuildCardProps) {
  const className = [
    'build-card',
    selected ? 'build-card--selected' : '',
    !unlocked ? 'build-card--locked' : '',
    unlocked && !affordable ? 'build-card--unaffordable' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const title = unlocked
    ? def.description
    : unlockingTech
      ? `🔒 Locked — research ${unlockingTech.emoji} ${unlockingTech.name} to unlock.\n\n${def.description}`
      : `🔒 Locked.\n\n${def.description}`
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={!unlocked}
      title={title}
    >
      <span className="build-card__emoji" aria-hidden>
        {displayEmoji}
      </span>
      <span className="build-card__name">{displayName}</span>
      {!unlocked && unlockingTech && (
        <span className="build-card__lock-hint">
          🧬 {unlockingTech.emoji} {unlockingTech.name}
        </span>
      )}
      {unlocked && (
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
      )}
      {unlocked && (
        <span className="build-card__slots">
          {def.citizenSlots > 0 ? `👤 ${def.citizenSlots}` : ''}
        </span>
      )}
    </button>
  )
}
