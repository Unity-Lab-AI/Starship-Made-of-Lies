import { useMemo, useState } from 'react'
import {
  type Caravan,
  type PlanetId,
  type PlanetInventory,
  type ResourceId,
  CARAVAN_FUEL_COST,
  CARAVAN_MAX_AMOUNT_PER_RUN,
  MAX_ACTIVE_CARAVANS_PER_CIV,
  RESOURCE_FUEL,
  caravanProgressFraction,
  countActiveCaravans,
  getResourceDef,
  listStocks,
} from '@smol/shared'
import './CaravanPanel.css'

// PHASE 17.13.7 — caravan management panel. Two sections:
// 1. Active caravans list — each row shows source / target / resource / amount / progress bar
//    / ETA / cancel button.
// 2. Create caravan form — source planet dropdown, target planet dropdown, resource dropdown
//    (filtered to source planet's stocked resources only), amount slider.
//
// Per-civ active-caravan cap enforced via the create-button's disabled state. Per-launch fuel
// cost (CARAVAN_FUEL_COST=15) surfaced in the create form so the player sees the resource
// commitment before clicking. Per-caravan amount cap (CARAVAN_MAX_AMOUNT_PER_RUN=500) is the
// slider max.

export interface CaravanPanelPlanetSnapshot {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly inventory: PlanetInventory
}

interface CaravanPanelProps {
  readonly caravans: ReadonlyArray<Caravan>
  readonly ownedPlanets: ReadonlyArray<CaravanPanelPlanetSnapshot>
  readonly onCreateCaravan: (input: {
    fromPlanetId: PlanetId
    toPlanetId: PlanetId
    resource: ResourceId
    amount: number
  }) => void
  readonly onCancelCaravan: (caravanId: string) => void
}

export function CaravanPanel({
  caravans,
  ownedPlanets,
  onCreateCaravan,
  onCancelCaravan,
}: CaravanPanelProps) {
  const activeCount = countActiveCaravans(caravans)
  const atCap = activeCount >= MAX_ACTIVE_CARAVANS_PER_CIV

  const [fromPlanetId, setFromPlanetId] = useState<PlanetId | null>(
    ownedPlanets[0]?.planetId ?? null,
  )
  const [toPlanetId, setToPlanetId] = useState<PlanetId | null>(ownedPlanets[1]?.planetId ?? null)
  const fromPlanet = useMemo(
    () => ownedPlanets.find((p) => p.planetId === fromPlanetId) ?? null,
    [ownedPlanets, fromPlanetId],
  )
  const availableResources = useMemo(
    () => (fromPlanet ? listStocks(fromPlanet.inventory).filter((s) => s.amount > 0) : []),
    [fromPlanet],
  )
  const [resource, setResource] = useState<ResourceId | null>(null)
  const effectiveResource = resource ?? availableResources[0]?.def.id ?? null
  const sourceStockOfResource = useMemo(() => {
    if (!fromPlanet || !effectiveResource) return 0
    return fromPlanet.inventory.stocks.get(effectiveResource) ?? 0
  }, [fromPlanet, effectiveResource])
  const sourceFuelStock = fromPlanet?.inventory.stocks.get(RESOURCE_FUEL) ?? 0
  const haveFuel = sourceFuelStock >= CARAVAN_FUEL_COST

  const sliderMax = Math.min(CARAVAN_MAX_AMOUNT_PER_RUN, sourceStockOfResource)
  const [amount, setAmount] = useState(50)
  const effectiveAmount = Math.min(amount, sliderMax)

  const canCreate =
    !atCap &&
    fromPlanet !== null &&
    toPlanetId !== null &&
    fromPlanetId !== toPlanetId &&
    effectiveResource !== null &&
    effectiveAmount > 0 &&
    sourceStockOfResource >= effectiveAmount &&
    haveFuel

  return (
    <section className="caravan-panel" aria-label="Inter-planet caravan trade">
      <header className="caravan-panel__header">
        <h2>🛒 Caravans</h2>
        <span
          className={`caravan-panel__count${atCap ? ' caravan-panel__count--cap' : ''}`}
          title={`Per-civ active-caravan cap = ${MAX_ACTIVE_CARAVANS_PER_CIV}`}
        >
          {activeCount} / {MAX_ACTIVE_CARAVANS_PER_CIV} active
        </span>
      </header>

      <section className="caravan-panel__section" aria-label="Active caravans">
        <h3 className="caravan-panel__section-title">Active routes</h3>
        {caravans.length === 0 ? (
          <p className="caravan-panel__empty">
            No active caravans. Use the form below to create the first one.
          </p>
        ) : (
          <ul className="caravan-panel__list">
            {caravans.map((c) => {
              const def = getResourceDef(c.resource)
              const progress = caravanProgressFraction(c)
              const progressPct = Math.round(progress * 100)
              return (
                <li
                  key={c.id}
                  className={`caravan-panel__row caravan-panel__row--${c.status.toLowerCase()}`}
                >
                  <div className="caravan-panel__row-head">
                    <span className="caravan-panel__row-emoji" aria-hidden>
                      {def.emoji}
                    </span>
                    <span className="caravan-panel__row-route">
                      {String(c.fromPlanetId)} → {String(c.toPlanetId)}
                    </span>
                    <span className="caravan-panel__row-cargo">
                      {c.amount} {def.name}
                    </span>
                  </div>
                  <div className="caravan-panel__row-progress">
                    <div className="caravan-panel__bar">
                      <div
                        className="caravan-panel__bar-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="caravan-panel__row-eta">
                      {c.status === 'OUTBOUND'
                        ? `ETA ${c.ticksRemaining}t (${progressPct}%)`
                        : c.status === 'DELIVERED'
                          ? 'Delivered'
                          : 'Cancelled'}
                    </span>
                    {c.status === 'OUTBOUND' && (
                      <button
                        type="button"
                        className="caravan-panel__cancel-btn"
                        onClick={() => onCancelCaravan(c.id)}
                        title="Cancel this caravan mid-route. Cargo will be lost."
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="caravan-panel__section" aria-label="Dispatch new caravan">
        <h3 className="caravan-panel__section-title">Dispatch new caravan</h3>
        {ownedPlanets.length < 2 ? (
          <p className="caravan-panel__empty">
            Need at least 2 owned planets to dispatch a caravan.
          </p>
        ) : (
          <div className="caravan-panel__form">
            <label className="caravan-panel__field">
              <span className="caravan-panel__field-label">From</span>
              <select
                value={fromPlanetId ? String(fromPlanetId) : ''}
                onChange={(e) =>
                  setFromPlanetId(e.target.value ? (e.target.value as unknown as PlanetId) : null)
                }
              >
                {ownedPlanets.map((p) => (
                  <option key={String(p.planetId)} value={String(p.planetId)}>
                    {p.planetLabel}
                  </option>
                ))}
              </select>
            </label>
            <label className="caravan-panel__field">
              <span className="caravan-panel__field-label">To</span>
              <select
                value={toPlanetId ? String(toPlanetId) : ''}
                onChange={(e) =>
                  setToPlanetId(e.target.value ? (e.target.value as unknown as PlanetId) : null)
                }
              >
                {ownedPlanets
                  .filter((p) => p.planetId !== fromPlanetId)
                  .map((p) => (
                    <option key={String(p.planetId)} value={String(p.planetId)}>
                      {p.planetLabel}
                    </option>
                  ))}
              </select>
            </label>
            <label className="caravan-panel__field">
              <span className="caravan-panel__field-label">Resource</span>
              <select
                value={effectiveResource ? String(effectiveResource) : ''}
                onChange={(e) =>
                  setResource(e.target.value ? (e.target.value as unknown as ResourceId) : null)
                }
                disabled={availableResources.length === 0}
              >
                {availableResources.length === 0 ? (
                  <option value="">(source planet has nothing in stock)</option>
                ) : (
                  availableResources.map((s) => (
                    <option key={String(s.def.id)} value={String(s.def.id)}>
                      {s.def.emoji} {s.def.name} — {s.amount.toLocaleString()}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="caravan-panel__field caravan-panel__field--full">
              <span className="caravan-panel__field-label">
                Amount: <strong>{effectiveAmount}</strong> / {sliderMax} (cap{' '}
                {CARAVAN_MAX_AMOUNT_PER_RUN})
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, sliderMax)}
                step={1}
                value={effectiveAmount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                disabled={sliderMax === 0}
              />
            </label>
            <p
              className={`caravan-panel__fuel-cost${
                haveFuel ? '' : ' caravan-panel__fuel-cost--short'
              }`}
            >
              Fuel cost: <strong>{CARAVAN_FUEL_COST}</strong> from source planet (have{' '}
              {sourceFuelStock}).
            </p>
            <button
              type="button"
              className="caravan-panel__dispatch-btn"
              disabled={!canCreate}
              onClick={() => {
                if (!canCreate || !fromPlanetId || !toPlanetId || !effectiveResource) return
                onCreateCaravan({
                  fromPlanetId,
                  toPlanetId,
                  resource: effectiveResource,
                  amount: effectiveAmount,
                })
              }}
            >
              {atCap
                ? `⛔ At cap (${MAX_ACTIVE_CARAVANS_PER_CIV} max)`
                : !haveFuel
                  ? `⛔ Need ${CARAVAN_FUEL_COST} fuel at source`
                  : sliderMax === 0
                    ? '⛔ Pick a resource the source has in stock'
                    : '🛒 Dispatch Caravan'}
            </button>
          </div>
        )}
      </section>
    </section>
  )
}
