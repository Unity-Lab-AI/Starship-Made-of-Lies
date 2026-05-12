import { type PlanetId, type Settlement, type SettlementId } from '@smol/shared'
import './SettlementsPanel.css'

// PHASE 17.13.5 — settlement picker UI. Lists every settlement across every owned planet,
// grouped by planet. v1 is read-only inspection (population / tile-count / status). The
// active-settlement-switch action that retargets Stockpile / Workforce / Loyalty / Production
// panels lands in PHASE 17.13.6's aggregate-vs-detail toggle once per-settlement state lives
// in the sim. Until then this panel surfaces the data model in a human-readable form so the
// player can see where their settlements are + how big each one's territory is.

export interface SettlementGroupSnapshot {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly settlements: ReadonlyArray<Settlement>
}

interface SettlementsPanelProps {
  readonly groups: ReadonlyArray<SettlementGroupSnapshot>
  readonly activeSettlementId: SettlementId | null
  readonly onSelectSettlement: (planetId: PlanetId, settlementId: SettlementId) => void
}

export function SettlementsPanel({
  groups,
  activeSettlementId,
  onSelectSettlement,
}: SettlementsPanelProps) {
  const totalSettlements = groups.reduce((sum, g) => sum + g.settlements.length, 0)
  return (
    <section className="settlements-panel" aria-label="Settlements">
      <header className="settlements-panel__header">
        <h2>🏘 Settlements</h2>
        <span className="settlements-panel__count">
          {totalSettlements} total across {groups.length} planet{groups.length === 1 ? '' : 's'}
        </span>
      </header>
      {groups.length === 0 ? (
        <p className="settlements-panel__empty">
          You don't own any planets yet — no settlements to show.
        </p>
      ) : (
        <ul className="settlements-panel__group-list">
          {groups.map((group) => (
            <li key={String(group.planetId)} className="settlements-panel__group">
              <h3 className="settlements-panel__group-title">{group.planetLabel}</h3>
              <ul className="settlements-panel__settlement-list">
                {group.settlements.map((settlement) => {
                  const active = settlement.id === activeSettlementId
                  return (
                    <li key={String(settlement.id)}>
                      <button
                        type="button"
                        className={`settlements-panel__row settlements-panel__row--${settlement.status}${
                          active ? ' settlements-panel__row--active' : ''
                        }`}
                        onClick={() => onSelectSettlement(group.planetId, settlement.id)}
                      >
                        <span className="settlements-panel__emoji" aria-hidden>
                          {settlement.status === 'capital' ? '🏛️' : '🏘'}
                        </span>
                        <span className="settlements-panel__name">{settlement.name}</span>
                        <span className="settlements-panel__status">
                          {settlement.status === 'capital' ? 'Capital' : 'Founded'}
                        </span>
                        <span className="settlements-panel__tiles">
                          {settlement.controlledTileIds.size} tiles
                        </span>
                        {active && <span className="settlements-panel__active-badge">VIEWING</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
      <p className="settlements-panel__hint">
        Build a 🏛️ Civic Center on any empty owned tile to found a new settlement.
      </p>
    </section>
  )
}
