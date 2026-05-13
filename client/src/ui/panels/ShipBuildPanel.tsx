import { useMemo, useState } from 'react'
import {
  type ColonyShipDef,
  type ColonyShipVariantId,
  type LaunchPad,
  type PlanetInventory,
  type TechId,
  type TechNode,
  COLONY_SHIPS,
  TECH_NODES,
  defaultBuildFromShipDef,
  getShipPiece,
  resolveShipBuild,
  stockOf,
} from '@smol/shared'
import './ShipBuildPanel.css'

// PHASE 17.L.D (HOTFIX 2026-05-12) — reverse lookup: which tech unlocks this colony-ship
// variant (by id) OR the payloadTier required. Returns the first tech that gates this
// variant; rendered as a 🧬 prereq hint on locked ship cards so the player sees what to
// research. Variants are gated by either an explicit unlockColonyShipVariants list OR by
// requiring a payloadTier the player hasn't unlocked yet.
function findTechUnlockingShipVariant(
  variantId: ColonyShipVariantId,
  requiredPayloadTier: 0 | 1 | 2 | 3 | 4,
  currentMaxPayloadTier: 0 | 1 | 2 | 3 | 4,
): TechNode | null {
  // First pass — explicit variant mention.
  for (const node of TECH_NODES) {
    if (node.effects.unlockColonyShipVariants?.includes(String(variantId))) return node
  }
  // Second pass — first tech that bumps colonyShipPayloadTier to >= required.
  if (requiredPayloadTier > currentMaxPayloadTier) {
    for (const node of TECH_NODES) {
      const tier = node.effects.colonyShipPayloadTier
      if (tier !== undefined && tier >= requiredPayloadTier) return node
    }
  }
  return null
}

interface ShipBuildPanelProps {
  readonly pad: LaunchPad | null
  readonly inventory: PlanetInventory
  readonly researchedTechs: ReadonlySet<TechId>
  readonly maxPayloadTier: 0 | 1 | 2 | 3 | 4
  readonly onBuild: (variantId: ColonyShipVariantId) => void
  readonly onLaunch: (targetPlanetId: string) => void
  readonly otherPlanets: ReadonlyArray<{ id: string; label: string }>
}

const CATEGORY_LABEL: Readonly<Record<string, string>> = {
  tier1Innocent: 'Tier 1 — Innocent',
  tier2Discovery: 'Tier 2 — Discovery',
  tier3Aggression: 'Tier 3 — Aggression',
  tier4Eradication: 'Tier 4 — Eradication',
  crossPeaceful: 'Cross — Peaceful',
}

export function ShipBuildPanel({
  pad,
  inventory,
  researchedTechs,
  maxPayloadTier,
  onBuild,
  onLaunch,
  otherPlanets,
}: ShipBuildPanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<ColonyShipVariantId | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string>('')

  // PHASE 17.L.D (HOTFIX 2026-05-12) — user verbatim *"im not seeing anywhere how to unlock
  // ... the differetn space ships"*. Previously filtered to ships the player could already
  // build, hiding every locked variant. Now show ALL variants with a locked-state per ship
  // so the player can see what unlocks where. eligibleShips becomes the buildable subset;
  // the full list (with locked flag) is what renders.
  const allShips = useMemo(
    () =>
      COLONY_SHIPS.map((s) => {
        const unlocked = s.payloadTierRequired <= maxPayloadTier
        return {
          ship: s,
          unlocked,
          unlockingTech: unlocked
            ? null
            : findTechUnlockingShipVariant(s.id, s.payloadTierRequired, maxPayloadTier),
        }
      }),
    [maxPayloadTier],
  )

  const selectedShip = selectedVariantId
    ? (allShips.find((s) => s.ship.id === selectedVariantId)?.ship ?? null)
    : null

  const buildBreakdown = useMemo(() => {
    if (!selectedShip) return null
    const build = defaultBuildFromShipDef(selectedShip)
    return resolveShipBuild(build, researchedTechs)
  }, [selectedShip, researchedTechs])

  const canAfford = (ship: ColonyShipDef): boolean => {
    return ship.buildCost.every((c) => stockOf(inventory, c.resource) >= c.amount)
  }

  if (!pad) {
    return (
      <section className="ship-build-panel" aria-label="Ship build">
        <header className="ship-build-panel__header">
          <h2>🚀 Ship Build</h2>
        </header>
        <p className="ship-build-panel__empty">Build a 🚀 Launch Pad first.</p>
      </section>
    )
  }

  const showLaunchUI = pad.state === 'READY' || pad.state === 'ARM'

  return (
    <section className="ship-build-panel" aria-label="Ship build">
      <header className="ship-build-panel__header">
        <h2>🚀 Ship Build</h2>
        <span className="ship-build-panel__pad-state">{pad.state}</span>
      </header>

      {showLaunchUI ? (
        <div className="ship-build-panel__launch">
          <p className="ship-build-panel__launch-title">
            Pad ready — pick a target planet to launch.
          </p>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="ship-build-panel__select"
          >
            <option value="">Select target...</option>
            {otherPlanets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ship-build-panel__launch-btn"
            disabled={!selectedTarget}
            onClick={() => onLaunch(selectedTarget)}
          >
            🚀 Launch
          </button>
        </div>
      ) : (
        <div className="ship-build-panel__variants">
          <ul className="ship-build-panel__variant-list">
            {allShips.map(({ ship, unlocked, unlockingTech }) => {
              const affordable = unlocked && canAfford(ship)
              const isSelected = selectedVariantId === ship.id
              const classNames = [
                'ship-build-panel__variant',
                isSelected ? 'ship-build-panel__variant--selected' : '',
                !unlocked ? 'ship-build-panel__variant--locked' : '',
                unlocked && !affordable ? 'ship-build-panel__variant--unaffordable' : '',
              ]
                .filter(Boolean)
                .join(' ')
              const lockedTitle =
                !unlocked && unlockingTech
                  ? `🔒 Locked — research ${unlockingTech.emoji} ${unlockingTech.name} (or unlock payload tier ${ship.payloadTierRequired}) to enable.`
                  : !unlocked
                    ? `🔒 Locked — requires colony ship payload tier ${ship.payloadTierRequired}.`
                    : ship.description
              return (
                <li
                  key={String(ship.id)}
                  className={classNames}
                  onClick={() => {
                    if (unlocked) setSelectedVariantId(ship.id)
                  }}
                  title={lockedTitle}
                >
                  <div className="ship-build-panel__variant-head">
                    <span className="ship-build-panel__variant-emoji">{ship.emoji}</span>
                    <span className="ship-build-panel__variant-name">{ship.name}</span>
                    <span className={`ship-build-panel__variant-tier tier-${ship.darknessTier}`}>
                      T{ship.darknessTier}
                    </span>
                  </div>
                  <div className="ship-build-panel__variant-category">
                    {CATEGORY_LABEL[ship.category] ?? ship.category}
                  </div>
                  {!unlocked && unlockingTech && (
                    <div className="ship-build-panel__variant-lock-hint">
                      🧬 {unlockingTech.emoji} {unlockingTech.name}
                    </div>
                  )}
                  {!unlocked && !unlockingTech && (
                    <div className="ship-build-panel__variant-lock-hint">
                      🔒 Payload tier {ship.payloadTierRequired}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {selectedShip && buildBreakdown && (
            <div className="ship-build-panel__breakdown">
              <h3>{selectedShip.name}</h3>
              <p className="ship-build-panel__breakdown-desc">{selectedShip.description}</p>
              <div className="ship-build-panel__breakdown-section">
                <strong>Modular pieces:</strong>
                <ul className="ship-build-panel__pieces">
                  {buildBreakdown.pieces.map((piece) => (
                    <li key={piece.id} className="ship-build-panel__piece">
                      <span>{piece.emoji}</span>
                      <span className="ship-build-panel__piece-slot">{piece.slot}</span>
                      <span>{piece.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ship-build-panel__breakdown-section">
                <strong>Stats:</strong>
                <ul className="ship-build-panel__stats">
                  <li>👤 Citizens: {buildBreakdown.stats.citizenCapacity}</li>
                  <li>📦 Cargo: {buildBreakdown.stats.cargoCapacity}</li>
                  <li>⛽ Fuel req: {buildBreakdown.stats.fuelRequirement}</li>
                  {selectedShip.reactorFuelType && selectedShip.reactorFuelAmount > 0 && (
                    <li
                      className={
                        stockOf(inventory, selectedShip.reactorFuelType) >=
                        selectedShip.reactorFuelAmount
                          ? 'ship-build-panel__cost-ok'
                          : 'ship-build-panel__cost-short'
                      }
                      title="Reactor variants consume their tier-specific radioactive at launch time."
                    >
                      ☢️ Reactor fuel: {selectedShip.reactorFuelAmount}{' '}
                      {String(selectedShip.reactorFuelType)} (have{' '}
                      {stockOf(inventory, selectedShip.reactorFuelType)})
                    </li>
                  )}
                  {buildBreakdown.stats.weaponPayload > 0 && (
                    <li>🔫 Weapons: {buildBreakdown.stats.weaponPayload}</li>
                  )}
                  {buildBreakdown.stats.explosiveYield > 0 && (
                    <li>💥 Explosive yield: {buildBreakdown.stats.explosiveYield}</li>
                  )}
                  <li>🛬 Landing gear: T{buildBreakdown.stats.landingGearTier}</li>
                  <li>📡 Comms: T{buildBreakdown.stats.commsTier}</li>
                </ul>
              </div>
              <div className="ship-build-panel__breakdown-section">
                <strong>Build cost:</strong>
                <ul className="ship-build-panel__costs">
                  {selectedShip.buildCost.map((c) => {
                    const have = stockOf(inventory, c.resource)
                    const enough = have >= c.amount
                    return (
                      <li
                        key={String(c.resource)}
                        className={
                          enough ? 'ship-build-panel__cost-ok' : 'ship-build-panel__cost-short'
                        }
                      >
                        {String(c.resource)}: {c.amount} (have {have})
                      </li>
                    )
                  })}
                </ul>
              </div>
              <button
                type="button"
                className="ship-build-panel__build-btn"
                disabled={
                  !canAfford(selectedShip) || (pad.state !== 'IDLE' && pad.state !== 'GONE')
                }
                onClick={() => onBuild(selectedShip.id)}
              >
                🛠 Print {selectedShip.name}
              </button>
              {selectedShip.suicideShip && (
                <p className="ship-build-panel__suicide-note">
                  ⚠️ Suicide ship — citizens won&apos;t come back.
                </p>
              )}
              {buildBreakdown.missingTechs.length > 0 && (
                <p className="ship-build-panel__missing-techs">
                  Missing techs: {buildBreakdown.missingTechs.map((t) => String(t)).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

void getShipPiece
