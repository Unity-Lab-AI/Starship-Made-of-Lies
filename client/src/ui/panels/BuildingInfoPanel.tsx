// PHASE 17.L.D.16 (2026-05-13) — building inspection panel. Per user verbatim *"every
// building needs to be selectable with its production stats and maintance resource
// requirments ect ect"*. When the player clicks a tile that has a building (and demolish
// mode is off + build mode is off), this panel opens with the def's display name, emoji,
// description, build cost, build time, citizen slots, production inputs/outputs (if any),
// and a Demolish button that triggers the 100%-refund action via the existing
// demolishBuildingAction in MatchSim.ts.

import {
  type BuildingDefId,
  type PlanetId,
  type TileId,
  getBuildingDef,
  getBuildingProduction,
  getResourceDef,
} from '@smol/shared'
import { PanelFrame } from '../play/PanelFrame'
import './building-info-panel.css'

interface BuildingInfoPanelProps {
  readonly planetId: PlanetId
  readonly tileId: TileId
  readonly defId: BuildingDefId
  readonly onClose: () => void
  readonly onDemolish: () => void
}

export function BuildingInfoPanel({ tileId, defId, onClose, onDemolish }: BuildingInfoPanelProps) {
  const def = getBuildingDef(defId)
  const production = getBuildingProduction(defId)

  return (
    <PanelFrame
      panelId={`building-info-${String(tileId)}`}
      title={`${def.emoji} ${def.name}`}
      emoji=""
      onClose={onClose}
      variant="centered"
      width={480}
      extraClass="building-info-panel"
    >
      <p className="building-info-panel__desc">{def.description}</p>

      <dl className="building-info-panel__stats">
        <dt>Category</dt>
        <dd>{def.category}</dd>

        <dt>Citizen slots</dt>
        <dd>{def.citizenSlots}</dd>

        <dt>Build time</dt>
        <dd>{def.buildTimeTicks} ticks</dd>

        <dt>Build cost (refunded 100% on demolish)</dt>
        <dd>
          {def.buildCost.length === 0 ? (
            <em>Free</em>
          ) : (
            <ul className="building-info-panel__cost-list">
              {def.buildCost.map((c) => {
                const r = getResourceDef(c.resource)
                return (
                  <li key={String(c.resource)}>
                    {r ? `${r.emoji} ${r.name}` : String(c.resource)}: {c.amount}
                  </li>
                )
              })}
            </ul>
          )}
        </dd>

        {production && production.inputs.length > 0 ? (
          <>
            <dt>Per-tick inputs (maintenance)</dt>
            <dd>
              <ul className="building-info-panel__cost-list">
                {production.inputs.map((c) => {
                  const r = getResourceDef(c.resource)
                  return (
                    <li key={String(c.resource)}>
                      {r ? `${r.emoji} ${r.name}` : String(c.resource)}: {c.amount}/t
                    </li>
                  )
                })}
              </ul>
            </dd>
          </>
        ) : null}

        {production && production.outputs.length > 0 ? (
          <>
            <dt>Per-tick outputs (production)</dt>
            <dd>
              <ul className="building-info-panel__cost-list">
                {production.outputs.map((c) => {
                  const r = getResourceDef(c.resource)
                  return (
                    <li key={String(c.resource)}>
                      {r ? `${r.emoji} ${r.name}` : String(c.resource)}: {c.amount}/t
                      {c.requiredTechs && c.requiredTechs.length > 0
                        ? ` (gated on ${c.requiredTechs.length} tech${
                            c.requiredTechs.length === 1 ? '' : 's'
                          })`
                        : ''}
                    </li>
                  )
                })}
              </ul>
            </dd>
          </>
        ) : null}

        {!production ? (
          <>
            <dt>Production</dt>
            <dd>
              <em>Utility / no per-tick production</em>
            </dd>
          </>
        ) : null}
      </dl>

      <div className="building-info-panel__actions">
        <button
          type="button"
          className="building-info-panel__demolish-btn"
          onClick={onDemolish}
          title="Recycle this building. Refunds 100% of the build cost back to the planet inventory."
        >
          🔨 Demolish &amp; recycle (100% refund)
        </button>
      </div>
    </PanelFrame>
  )
}
