// PHASE 17.L.A.12 — Q11 PHASE 17 LOCKED. Quotas + auto-recycle UI surface. Two stacked
// sections per planet:
//
//   1. Resource Quotas — slider + numeric input per major resource. Sets the per-planet
//      target stockpile. Buildings producing the resource will idle once stock >= quota.
//   2. Building Production Modes — dropdown per building def with production capability.
//      Three modes: auto / paused / disassembly. Disassembly only valid for refinery /
//      foundry / factory; the picker greys out for other buildings.
//
// Direct UMS UnityInventory.QueueMissing + RecycleExcess carryover. UI mirrors the UMS
// quotas section in inventory CustomData (per SMOL_REFERENCE_INVENTORY.md §quotas).

import { useMemo } from 'react'
import {
  type BuildingDefId,
  type BuildingProductionMode,
  type PlanetId,
  type PlanetInventory,
  type ResourceId,
  BUILDINGS,
  RESOURCES,
  getBuildingProduction,
  stockOf,
} from '@smol/shared'
import './QuotasPanel.css'

export interface QuotasPanelProps {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly inventory: PlanetInventory
  readonly quotas: ReadonlyMap<ResourceId, number>
  readonly buildingsByDef: ReadonlyMap<BuildingDefId, number>
  readonly buildingModes: ReadonlyMap<BuildingDefId, BuildingProductionMode>
  readonly onSetQuota: (resource: ResourceId, target: number) => void
  readonly onSetBuildingMode: (defId: BuildingDefId, mode: BuildingProductionMode) => void
}

// Resources eligible for quota sliders: every resource that some building can PRODUCE on this
// planet (ignoring biome — we let the player set quotas for things they could theoretically
// hit through trade/conquest too). Skip raw-mining-only resources that have no producer
// building (they accumulate only via mining ships / outposts).
const QUOTA_ELIGIBLE: ReadonlySet<string> = new Set(
  BUILDINGS.flatMap(
    (b) => getBuildingProduction(b.id)?.outputs.map((o) => String(o.resource)) ?? [],
  ),
)

// PHASE 17.L.A.12 — disassembly-capable building defs. Mirrors the shared-sim
// DISASSEMBLY_CAPABLE_BUILDINGS set (refinery / foundry / factory). Used to grey out the
// 'disassembly' option on other building rows.
const DISASSEMBLY_BUILDING_IDS: ReadonlySet<string> = new Set(['refinery', 'foundry', 'factory'])

const MAX_QUOTA = 100000
const QUOTA_STEP = 100

export function QuotasPanel({
  planetLabel,
  inventory,
  quotas,
  buildingsByDef,
  buildingModes,
  onSetQuota,
  onSetBuildingMode,
}: QuotasPanelProps) {
  const quotaRows = useMemo(
    () =>
      RESOURCES.filter((r) => QUOTA_ELIGIBLE.has(String(r.id))).map((r) => ({
        resource: r.id,
        emoji: r.emoji,
        name: r.name,
        stock: stockOf(inventory, r.id),
        target: quotas.get(r.id) ?? 0,
      })),
    [inventory, quotas],
  )

  const buildingRows = useMemo(
    () =>
      BUILDINGS.filter((b) => getBuildingProduction(b.id) !== null)
        .filter((b) => (buildingsByDef.get(b.id) ?? 0) > 0)
        .map((b) => {
          const count = buildingsByDef.get(b.id) ?? 0
          const mode = buildingModes.get(b.id) ?? 'auto'
          const canDisassemble = DISASSEMBLY_BUILDING_IDS.has(String(b.id))
          return { defId: b.id, emoji: b.emoji, name: b.name, count, mode, canDisassemble }
        }),
    [buildingsByDef, buildingModes],
  )

  const activeQuotaCount = quotas.size
  const overrideModeCount = buildingModes.size

  return (
    <div className="quotas-panel">
      <p className="quotas-panel__intro">
        Active planet: <strong>{planetLabel}</strong>. Quotas throttle producers — buildings making
        a resource at-or-above its quota idle in auto-mode. Building modes override default behavior
        per building type. UMS UnityInventory.QueueMissing + RecycleExcess parity.
      </p>

      <section className="quotas-panel__section">
        <h3 className="quotas-panel__section-title">
          📋 Resource Quotas
          <span className="quotas-panel__section-meta">
            {activeQuotaCount} active · 0 = no limit
          </span>
        </h3>
        {quotaRows.length === 0 ? (
          <p className="quotas-panel__empty">No producible resources catalogued.</p>
        ) : (
          <ul className="quotas-panel__quota-rows">
            {quotaRows.map((row) => {
              const overQuota = row.target > 0 && row.stock >= row.target
              return (
                <li key={String(row.resource)} className="quotas-panel__quota-row">
                  <span className="quotas-panel__quota-label">
                    {row.emoji} {row.name}
                  </span>
                  <span
                    className={
                      overQuota
                        ? 'quotas-panel__quota-stock quotas-panel__quota-stock--over'
                        : 'quotas-panel__quota-stock'
                    }
                  >
                    stock: {row.stock}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={MAX_QUOTA}
                    step={QUOTA_STEP}
                    value={row.target}
                    onChange={(e) => onSetQuota(row.resource, Number(e.target.value))}
                    className="quotas-panel__quota-slider"
                    aria-label={`${row.name} quota`}
                  />
                  <input
                    type="number"
                    min={0}
                    max={MAX_QUOTA}
                    step={QUOTA_STEP}
                    value={row.target}
                    onChange={(e) => onSetQuota(row.resource, Number(e.target.value))}
                    className="quotas-panel__quota-input"
                    aria-label={`${row.name} quota value`}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="quotas-panel__section">
        <h3 className="quotas-panel__section-title">
          🏭 Building Production Modes
          <span className="quotas-panel__section-meta">
            {overrideModeCount} override{overrideModeCount === 1 ? '' : 's'} active
          </span>
        </h3>
        {buildingRows.length === 0 ? (
          <p className="quotas-panel__empty">No production buildings on this planet yet.</p>
        ) : (
          <ul className="quotas-panel__building-rows">
            {buildingRows.map((row) => (
              <li key={String(row.defId)} className="quotas-panel__building-row">
                <span className="quotas-panel__building-label">
                  {row.emoji} {row.name} <em>(×{row.count})</em>
                </span>
                <label className="quotas-panel__mode-radio">
                  <input
                    type="radio"
                    name={`mode-${String(row.defId)}`}
                    checked={row.mode === 'auto'}
                    onChange={() => onSetBuildingMode(row.defId, 'auto')}
                  />
                  Auto
                </label>
                <label className="quotas-panel__mode-radio">
                  <input
                    type="radio"
                    name={`mode-${String(row.defId)}`}
                    checked={row.mode === 'paused'}
                    onChange={() => onSetBuildingMode(row.defId, 'paused')}
                  />
                  Paused
                </label>
                <label
                  className={
                    row.canDisassemble
                      ? 'quotas-panel__mode-radio'
                      : 'quotas-panel__mode-radio quotas-panel__mode-radio--disabled'
                  }
                  title={
                    row.canDisassemble
                      ? 'Reverse production — consume outputs, recover inputs (85% recovery)'
                      : 'Only refinery / foundry / factory support disassembly'
                  }
                >
                  <input
                    type="radio"
                    name={`mode-${String(row.defId)}`}
                    checked={row.mode === 'disassembly'}
                    disabled={!row.canDisassemble}
                    onChange={() => onSetBuildingMode(row.defId, 'disassembly')}
                  />
                  Disassembly
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
