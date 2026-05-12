import { useState } from 'react'
import {
  ANNEX_PROPAGANDA_COST,
  type PlanetId,
  type Settlement,
  type SettlementId,
  type TileId,
} from '@smol/shared'
import './SettlementsPanel.css'

// PHASE 17.13.5 — settlement picker UI. Lists every settlement across every owned planet,
// grouped by planet. v1 is read-only inspection (population / tile-count / status). The
// active-settlement-switch action that retargets Stockpile / Workforce / Loyalty / Production
// panels lands in PHASE 17.13.6's aggregate-vs-detail toggle once per-settlement state lives
// in the sim. Until then this panel surfaces the data model in a human-readable form so the
// player can see where their settlements are + how big each one's territory is.
//
// PHASE 17.13.10 — player rename surface. Each settlement row has a small ✏️ button that
// opens an inline editor; submitting an empty value restores the themed default. The rename
// is dispatched through the onRenameSettlement callback to the sim's renameSettlementAction.

// PHASE 17.13.3 — per-settlement annex preview. PlayPage walks each settlement and surfaces
// the candidate tiles (owned-by-this-civ + adjacent-to-settlement-territory + not-already-in-
// this-settlement) so the panel can render an Annex button per tile. Capped to a reasonable
// row count to avoid a 50-button blob; full tile picker UI on the surface renderer ships with
// PHASE 17.13.4 settlement-boundary tinting.
export interface SettlementAnnexCandidate {
  readonly tileId: TileId
  readonly tileLabel: string
}

export interface SettlementGroupSnapshot {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly settlements: ReadonlyArray<Settlement>
  // PHASE 17.13.3 — annex candidates per settlement on this planet. Empty array when no tiles
  // are eligible (planet edge, already maxed, etc.).
  readonly annexCandidatesBySettlementId?: ReadonlyMap<
    SettlementId,
    ReadonlyArray<SettlementAnnexCandidate>
  >
}

interface SettlementsPanelProps {
  readonly groups: ReadonlyArray<SettlementGroupSnapshot>
  readonly activeSettlementId: SettlementId | null
  readonly onSelectSettlement: (planetId: PlanetId, settlementId: SettlementId) => void
  // PHASE 17.13.10 — optional rename callback. PlayPage wires this to sim.renameSettlement;
  // panel falls back to read-only mode if omitted (preserves prior call-sites).
  readonly onRenameSettlement?: (
    planetId: PlanetId,
    settlementId: SettlementId,
    newName: string,
  ) => boolean
  // PHASE 17.13.3 — optional annex callback. PlayPage wires this to sim.annexTile. Falls back
  // to read-only mode when omitted (preserves panel reusability for other contexts).
  readonly onAnnexTile?: (planetId: PlanetId, settlementId: SettlementId, tileId: TileId) => void
  // PHASE 17.13.3 — current human planet propaganda stock (per planet group). Used to grey out
  // the Annex button when stock < ANNEX_PROPAGANDA_COST.
  readonly propagandaStockByPlanetId?: ReadonlyMap<PlanetId, number>
}

export function SettlementsPanel({
  groups,
  activeSettlementId,
  onSelectSettlement,
  onRenameSettlement,
  onAnnexTile,
  propagandaStockByPlanetId,
}: SettlementsPanelProps) {
  const [renamingId, setRenamingId] = useState<SettlementId | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
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
                  const editing = renamingId === settlement.id
                  const commitRename = (): void => {
                    if (onRenameSettlement) {
                      onRenameSettlement(group.planetId, settlement.id, renameDraft)
                    }
                    setRenamingId(null)
                    setRenameDraft('')
                  }
                  const cancelRename = (): void => {
                    setRenamingId(null)
                    setRenameDraft('')
                  }
                  return (
                    <li key={String(settlement.id)} className="settlements-panel__settlement-li">
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
                      {onAnnexTile &&
                        (() => {
                          const candidates =
                            group.annexCandidatesBySettlementId?.get(settlement.id) ?? []
                          if (candidates.length === 0) return null
                          const propagandaStock =
                            propagandaStockByPlanetId?.get(group.planetId) ?? 0
                          const canAfford = propagandaStock >= ANNEX_PROPAGANDA_COST
                          return (
                            <div className="settlements-panel__annex">
                              <span className="settlements-panel__annex-label">
                                Adjacent tiles ({candidates.length}) — {ANNEX_PROPAGANDA_COST}{' '}
                                propaganda each:
                              </span>
                              <div className="settlements-panel__annex-buttons">
                                {candidates.slice(0, 8).map((c) => (
                                  <button
                                    key={String(c.tileId)}
                                    type="button"
                                    className="settlements-panel__annex-btn"
                                    disabled={!canAfford}
                                    aria-label={`Annex ${c.tileLabel} for ${ANNEX_PROPAGANDA_COST} propaganda materials`}
                                    onClick={() =>
                                      onAnnexTile(group.planetId, settlement.id, c.tileId)
                                    }
                                  >
                                    + {c.tileLabel}
                                  </button>
                                ))}
                                {candidates.length > 8 && (
                                  <span className="settlements-panel__annex-overflow">
                                    +{candidates.length - 8} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })()}
                      {onRenameSettlement &&
                        (editing ? (
                          <form
                            className="settlements-panel__rename-form"
                            onSubmit={(e) => {
                              e.preventDefault()
                              commitRename()
                            }}
                          >
                            <input
                              autoFocus
                              type="text"
                              maxLength={60}
                              value={renameDraft}
                              onChange={(e) => setRenameDraft(e.target.value)}
                              placeholder={settlement.name}
                              aria-label="New settlement name"
                              className="settlements-panel__rename-input"
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') cancelRename()
                              }}
                            />
                            <button
                              type="submit"
                              className="settlements-panel__rename-save"
                              aria-label="Save rename (empty input restores themed default)"
                            >
                              💾 Save
                            </button>
                            <button
                              type="button"
                              className="settlements-panel__rename-cancel"
                              aria-label="Cancel rename"
                              onClick={cancelRename}
                            >
                              ✕
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            className="settlements-panel__rename-trigger"
                            aria-label={`Rename ${settlement.name}`}
                            onClick={() => {
                              setRenamingId(settlement.id)
                              setRenameDraft(settlement.name)
                            }}
                          >
                            ✏️ Rename
                          </button>
                        ))}
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
