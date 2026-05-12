import {
  MAX_INVENTORY_CAPACITY_TIER,
  getInventoryCapacityUpgradeCost,
  getResourceDef,
  listResourceCapacities,
  type PlanetInventory,
  type ResourceCapacityRow,
} from '@smol/shared'
import './PlanetInventoryPanel.css'

// PHASE 17.L.C.4 — full per-resource inventory popup. Shows every resource def with current
// stock + cap derived from the planet's inventoryCapacityTier. Bottom CTA upgrades the tier
// (consumes resources scaling exponentially per tier). UI surfaces:
// - Per-resource fill bar (red when >85% full so the player sees the overflow risk)
// - Total upgrade cost on the button + whether the player can afford it
// - Disabled state at MAX_INVENTORY_CAPACITY_TIER
// - Optional last-action feedback line (reason on failure / new tier on success)

interface PlanetInventoryPanelProps {
  readonly planetLabel: string
  readonly inventory: PlanetInventory
  readonly inventoryCapacityTier: number
  readonly onUpgradeCapacity: () => void
  readonly lastUpgradeFeedback?: string | null
}

const CATEGORY_ORDER: ReadonlyArray<string> = [
  'raw',
  'refined',
  'component',
  'product',
  'strategic',
]

const CATEGORY_LABEL: Record<string, string> = {
  raw: 'Raw materials',
  refined: 'Refined intermediates',
  component: 'Components',
  product: 'Products',
  strategic: 'Strategic',
}

export function PlanetInventoryPanel({
  planetLabel,
  inventory,
  inventoryCapacityTier,
  onUpgradeCapacity,
  lastUpgradeFeedback,
}: PlanetInventoryPanelProps) {
  const rows = listResourceCapacities(inventory, inventoryCapacityTier)
  const byCategory = new Map<string, ResourceCapacityRow[]>()
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, [])
  for (const row of rows) {
    const bucket = byCategory.get(row.def.category)
    if (bucket) bucket.push(row)
  }

  const upgradeCost = getInventoryCapacityUpgradeCost(inventoryCapacityTier)
  const atMaxTier = inventoryCapacityTier >= MAX_INVENTORY_CAPACITY_TIER
  const canAfford = upgradeCost.every((c) => (inventory.stocks.get(c.resource) ?? 0) >= c.amount)

  return (
    <section className="planet-inventory-panel" aria-label={`Planet inventory for ${planetLabel}`}>
      <header className="planet-inventory-panel__header">
        <h2>🗄 {planetLabel} — Inventory</h2>
        <p className="planet-inventory-panel__tier-line">
          Storage Tier <strong>T{inventoryCapacityTier}</strong> of T{MAX_INVENTORY_CAPACITY_TIER}
        </p>
      </header>

      {CATEGORY_ORDER.map((cat) => {
        const bucket = byCategory.get(cat) ?? []
        if (bucket.length === 0) return null
        return (
          <section
            key={cat}
            className={`planet-inventory-panel__category planet-inventory-panel__category--${cat}`}
            aria-label={CATEGORY_LABEL[cat]}
          >
            <h3 className="planet-inventory-panel__category-title">{CATEGORY_LABEL[cat]}</h3>
            <ul className="planet-inventory-panel__row-list">
              {bucket.map((row) => {
                const fillPct = Math.round(row.fill * 100)
                const isFull = fillPct >= 85
                return (
                  <li
                    key={String(row.def.id)}
                    className={`planet-inventory-panel__row${
                      isFull ? ' planet-inventory-panel__row--full' : ''
                    }`}
                  >
                    <span className="planet-inventory-panel__emoji" aria-hidden>
                      {row.def.emoji}
                    </span>
                    <span className="planet-inventory-panel__name">{row.def.name}</span>
                    <span className="planet-inventory-panel__amount">
                      {row.stock.toLocaleString()} / {row.cap.toLocaleString()}
                    </span>
                    <div className="planet-inventory-panel__bar" aria-hidden>
                      <div
                        className="planet-inventory-panel__bar-fill"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <footer className="planet-inventory-panel__footer">
        {lastUpgradeFeedback && (
          <p className="planet-inventory-panel__feedback">{lastUpgradeFeedback}</p>
        )}
        <div className="planet-inventory-panel__upgrade-section">
          <p className="planet-inventory-panel__upgrade-cost-label">
            {atMaxTier
              ? 'Maximum storage tier reached.'
              : `Upgrade to Storage Tier T${inventoryCapacityTier + 1} — cost:`}
          </p>
          {!atMaxTier && (
            <ul className="planet-inventory-panel__cost-list">
              {upgradeCost.map((c) => {
                const def = getResourceDef(c.resource)
                const have = inventory.stocks.get(c.resource) ?? 0
                const short = have < c.amount
                return (
                  <li
                    key={String(c.resource)}
                    className={`planet-inventory-panel__cost-row${
                      short ? ' planet-inventory-panel__cost-row--short' : ''
                    }`}
                  >
                    <span aria-hidden>{def.emoji}</span>
                    <span>{def.name}</span>
                    <span>
                      {have.toLocaleString()} / {c.amount.toLocaleString()}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          <button
            type="button"
            className="planet-inventory-panel__upgrade-btn"
            disabled={atMaxTier || !canAfford}
            onClick={onUpgradeCapacity}
          >
            {atMaxTier
              ? 'Max tier'
              : canAfford
                ? `🔧 Upgrade to T${inventoryCapacityTier + 1}`
                : '⛔ Insufficient resources'}
          </button>
        </div>
      </footer>
    </section>
  )
}
