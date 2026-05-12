import {
  CITIZEN_TIERS,
  RESOURCE_AMMUNITION,
  RESOURCE_COMPONENTS,
  RESOURCE_FOOD,
  RESOURCE_FUEL,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_WATER,
  getResourceDef,
  getResourceCapacityAt,
  type CitizenTier,
  type PlanetInventory,
  type PlanetPopulation,
  type ResourceId,
} from '@smol/shared'
import './PlanetSummaryPanel.css'

// PHASE 17.L.C.4 — Planet summary popup per user verbatim 2026-05-10:
// "and make sure the population and type counter and resoures that are the main ones are listed
//  at the top and there is a button for planet invenrtoy that shows the planet inventory
//  (upgradeable, just like all things and nuture)"
//
// Header: per-tier citizen counts (Worker → Pinnacle). Body: pinned "main" resources (food,
// water, fuel, metals, ingots, components, ammo). Footer: 🗄 button that opens the upgradeable
// PlanetInventoryPanel popup.

interface PlanetSummaryPanelProps {
  readonly planetLabel: string
  readonly biomeEmoji: string
  readonly biomeName: string
  readonly population: PlanetPopulation
  readonly inventory: PlanetInventory
  readonly inventoryCapacityTier: number
  readonly buildingCountTotal: number
  readonly tilesTotal: number
  readonly tilesUsed: number
  readonly onOpenInventory: () => void
}

// "Main" resources — the anchors the player needs at a glance. Order chosen so survival
// (food/water) shows first, then industry (fuel/metals/ingots/components), then defense (ammo).
const MAIN_RESOURCE_ORDER: ReadonlyArray<ResourceId> = [
  RESOURCE_FOOD,
  RESOURCE_WATER,
  RESOURCE_FUEL,
  RESOURCE_METALS,
  RESOURCE_INGOTS,
  RESOURCE_COMPONENTS,
  RESOURCE_AMMUNITION,
]

export function PlanetSummaryPanel({
  planetLabel,
  biomeEmoji,
  biomeName,
  population,
  inventory,
  inventoryCapacityTier,
  buildingCountTotal,
  tilesTotal,
  tilesUsed,
  onOpenInventory,
}: PlanetSummaryPanelProps) {
  const totalPop = (Object.values(population.tierCounts) as ReadonlyArray<number>).reduce(
    (s, n) => s + n,
    0,
  )

  return (
    <section className="planet-summary-panel" aria-label={`Planet summary for ${planetLabel}`}>
      <header className="planet-summary-panel__header">
        <div className="planet-summary-panel__biome">
          <span className="planet-summary-panel__biome-emoji" aria-hidden>
            {biomeEmoji}
          </span>
          <div className="planet-summary-panel__biome-text">
            <h2 className="planet-summary-panel__title">{planetLabel}</h2>
            <p className="planet-summary-panel__subtitle">{biomeName}</p>
          </div>
        </div>
        <dl className="planet-summary-panel__topo">
          <div>
            <dt>Tiles used</dt>
            <dd>
              {tilesUsed.toLocaleString()} / {tilesTotal.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt>Buildings</dt>
            <dd>{buildingCountTotal.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Total population</dt>
            <dd>{totalPop.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Storage tier</dt>
            <dd>T{inventoryCapacityTier}</dd>
          </div>
        </dl>
      </header>

      <section className="planet-summary-panel__section" aria-label="Population by tier">
        <h3 className="planet-summary-panel__section-title">Citizens by tier</h3>
        <ul className="planet-summary-panel__tier-list">
          {CITIZEN_TIERS.map((tierDef) => {
            const count = population.tierCounts[tierDef.tier as CitizenTier] ?? 0
            const pct = totalPop > 0 ? Math.round((count / totalPop) * 100) : 0
            return (
              <li key={tierDef.id} className="planet-summary-panel__tier-row">
                <span className="planet-summary-panel__tier-emoji" aria-hidden>
                  {tierDef.emoji}
                </span>
                <span className="planet-summary-panel__tier-name">
                  T{tierDef.tier} {tierDef.name}
                </span>
                <span className="planet-summary-panel__tier-count">{count.toLocaleString()}</span>
                <span className="planet-summary-panel__tier-pct">{pct}%</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="planet-summary-panel__section" aria-label="Main resources">
        <h3 className="planet-summary-panel__section-title">Main resources</h3>
        <ul className="planet-summary-panel__resource-list">
          {MAIN_RESOURCE_ORDER.map((rid) => {
            const def = getResourceDef(rid)
            const stock = inventory.stocks.get(rid) ?? 0
            const cap = getResourceCapacityAt(inventoryCapacityTier, rid)
            const fillPct = cap > 0 ? Math.min(100, Math.round((stock / cap) * 100)) : 0
            return (
              <li key={String(rid)} className="planet-summary-panel__resource-row">
                <span className="planet-summary-panel__resource-emoji" aria-hidden>
                  {def.emoji}
                </span>
                <span className="planet-summary-panel__resource-name">{def.name}</span>
                <span className="planet-summary-panel__resource-amount">
                  {stock.toLocaleString()} / {cap.toLocaleString()}
                </span>
                <div className="planet-summary-panel__resource-bar" aria-hidden>
                  <div
                    className="planet-summary-panel__resource-bar-fill"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <footer className="planet-summary-panel__footer">
        <button
          type="button"
          className="planet-summary-panel__open-inventory-btn"
          onClick={onOpenInventory}
        >
          🗄 Open Planet Inventory (upgradeable)
        </button>
      </footer>
    </section>
  )
}
