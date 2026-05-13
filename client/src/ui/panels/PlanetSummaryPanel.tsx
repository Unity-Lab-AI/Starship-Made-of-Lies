import { useState } from 'react'
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
  type BuildingDefId,
  type CitizenTier,
  type PlanetInventory,
  type PlanetPopulation,
  type ResourceId,
  type Settlement,
  type Tile,
  type TileId,
} from '@smol/shared'
import { useT } from '../../i18n/i18n'
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
  // PHASE 17.13.6 — optional per-settlement bifurcation. When the host provides settlements
  // + the planet's tile + building maps, the panel exposes a "Per settlement" toggle that
  // shows each settlement's tile-count + building-count + proportional population share.
  // Population, inventory, and workforce remain planet-aggregate at v1 (the data model is
  // still single-pool); the proportional share is calculated as
  // (settlement.controlledTileIds.size / planet.tiles.length) so the detail view stays
  // truthful without lying about per-settlement economy. Per user verbatim 2026-05-10
  // "multi-settlement per planet — players can have unlimited settlements per planet, each
  // with its own population/inventory/workforce/buildings".
  readonly settlements?: ReadonlyArray<Settlement>
  readonly tiles?: ReadonlyArray<Tile>
  readonly buildingsByTile?: ReadonlyMap<TileId, BuildingDefId>
  // PHASE 17.L.D (HOTFIX 2026-05-12) — user verbatim *"farms arent producing enoutgh food or
  // i need a demmand counter so i know how many i need"*. Per-tick food + water demand
  // (consumption) and supply (building output × workforce mult) computed by the host (PlayPage)
  // so this panel doesn't reach into sim internals. Surplus/shortfall is rendered prominently
  // so the player sees at a glance how many farms / aqueducts they need to build.
  readonly foodDemandPerTick?: number
  readonly foodSupplyPerTick?: number
  readonly waterDemandPerTick?: number
  readonly waterSupplyPerTick?: number
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
  settlements,
  tiles,
  buildingsByTile,
  foodDemandPerTick,
  foodSupplyPerTick,
  waterDemandPerTick,
  waterSupplyPerTick,
}: PlanetSummaryPanelProps) {
  const t = useT()
  const totalPop = (Object.values(population.tierCounts) as ReadonlyArray<number>).reduce(
    (s, n) => s + n,
    0,
  )

  // PHASE 17.13.6 — aggregate-vs-detail toggle state. Only renders when the host wires
  // settlements + tiles into props; otherwise the panel stays in pure aggregate mode for
  // back-compat with callers that haven't been updated yet.
  const [viewMode, setViewMode] = useState<'aggregate' | 'perSettlement'>('aggregate')
  const canShowPerSettlement = !!settlements && !!tiles && settlements.length > 0
  const showDetail = viewMode === 'perSettlement' && canShowPerSettlement

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
            <dt>{t('planetSummary.tilesUsed')}</dt>
            <dd>
              {tilesUsed.toLocaleString()} / {tilesTotal.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt>{t('planetSummary.buildings')}</dt>
            <dd>{buildingCountTotal.toLocaleString()}</dd>
          </div>
          <div>
            <dt>{t('planetSummary.totalPopulation')}</dt>
            <dd>{totalPop.toLocaleString()}</dd>
          </div>
          <div>
            <dt>{t('planetSummary.storageTier')}</dt>
            <dd>T{inventoryCapacityTier}</dd>
          </div>
        </dl>
        {canShowPerSettlement && (
          <div className="planet-summary-panel__view-toggle" role="tablist" aria-label="View mode">
            <button
              type="button"
              role="tab"
              aria-selected={!showDetail}
              className={`planet-summary-panel__view-toggle-btn${!showDetail ? ' is-active' : ''}`}
              onClick={() => setViewMode('aggregate')}
            >
              {t('planetSummary.viewAggregate')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showDetail}
              className={`planet-summary-panel__view-toggle-btn${showDetail ? ' is-active' : ''}`}
              onClick={() => setViewMode('perSettlement')}
            >
              {t('planetSummary.viewPerSettlement')} ({settlements!.length})
            </button>
          </div>
        )}
      </header>

      {showDetail ? (
        <section className="planet-summary-panel__section" aria-label="Per settlement breakdown">
          <h3 className="planet-summary-panel__section-title">Settlements</h3>
          <p className="planet-summary-panel__detail-note">
            Tile-count + buildings are per-settlement. Population share is proportional to
            controlled tiles; planet economy remains a single pool until per-settlement inventory
            ships.
          </p>
          <ul className="planet-summary-panel__settlement-list">
            {settlements!.map((settlement) => {
              const settlementTileCount = settlement.controlledTileIds.size
              const tileShare = tilesTotal > 0 ? settlementTileCount / tilesTotal : 0
              let settlementBuildingCount = 0
              if (buildingsByTile) {
                for (const tileId of settlement.controlledTileIds) {
                  if (buildingsByTile.has(tileId)) settlementBuildingCount += 1
                }
              }
              const populationShare = Math.round(totalPop * tileShare)
              return (
                <li
                  key={String(settlement.id)}
                  className="planet-summary-panel__settlement-row"
                  data-status={settlement.status}
                >
                  <div className="planet-summary-panel__settlement-header">
                    <span className="planet-summary-panel__settlement-name">{settlement.name}</span>
                    <span className="planet-summary-panel__settlement-status">
                      {settlement.status}
                    </span>
                  </div>
                  <dl className="planet-summary-panel__settlement-stats">
                    <div>
                      <dt>Tiles</dt>
                      <dd>{settlementTileCount.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>Buildings</dt>
                      <dd>{settlementBuildingCount.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>Pop share</dt>
                      <dd>
                        {populationShare.toLocaleString()} ({Math.round(tileShare * 100)}%)
                      </dd>
                    </div>
                  </dl>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
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
      )}

      {/* PHASE 17.L.D (HOTFIX 2026-05-12) — Food + water demand vs supply per tick. Renders
          only when the host wires the numbers in; falls back gracefully when omitted (legacy
          callers). Surplus = supply - demand; positive surplus is green, deficit is red. */}
      {(foodDemandPerTick !== undefined || waterDemandPerTick !== undefined) && (
        <section className="planet-summary-panel__section" aria-label="Resource flows">
          <h3 className="planet-summary-panel__section-title">Per-tick flows</h3>
          <ul className="planet-summary-panel__flow-list">
            {foodDemandPerTick !== undefined && foodSupplyPerTick !== undefined && (
              <li className="planet-summary-panel__flow-row">
                <span className="planet-summary-panel__flow-emoji" aria-hidden>
                  🍞
                </span>
                <span className="planet-summary-panel__flow-label">Food</span>
                <span className="planet-summary-panel__flow-numbers">
                  demand <strong>{foodDemandPerTick.toLocaleString()}</strong>/t · supply{' '}
                  <strong>{foodSupplyPerTick.toLocaleString()}</strong>/t
                </span>
                <span
                  className={`planet-summary-panel__flow-net${
                    foodSupplyPerTick - foodDemandPerTick >= 0
                      ? ' planet-summary-panel__flow-net--up'
                      : ' planet-summary-panel__flow-net--down'
                  }`}
                >
                  {foodSupplyPerTick - foodDemandPerTick >= 0 ? '+' : ''}
                  {(foodSupplyPerTick - foodDemandPerTick).toLocaleString()}/t
                </span>
              </li>
            )}
            {waterDemandPerTick !== undefined && waterSupplyPerTick !== undefined && (
              <li className="planet-summary-panel__flow-row">
                <span className="planet-summary-panel__flow-emoji" aria-hidden>
                  💧
                </span>
                <span className="planet-summary-panel__flow-label">Water</span>
                <span className="planet-summary-panel__flow-numbers">
                  demand <strong>{waterDemandPerTick.toLocaleString()}</strong>/t · supply{' '}
                  <strong>{waterSupplyPerTick.toLocaleString()}</strong>/t
                </span>
                <span
                  className={`planet-summary-panel__flow-net${
                    waterSupplyPerTick - waterDemandPerTick >= 0
                      ? ' planet-summary-panel__flow-net--up'
                      : ' planet-summary-panel__flow-net--down'
                  }`}
                >
                  {waterSupplyPerTick - waterDemandPerTick >= 0 ? '+' : ''}
                  {(waterSupplyPerTick - waterDemandPerTick).toLocaleString()}/t
                </span>
              </li>
            )}
          </ul>
        </section>
      )}

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
          🗄 {t('planetSummary.openInventory')}
        </button>
      </footer>
    </section>
  )
}
