import { useEffect, useMemo, useRef, useState } from 'react'
import { type CivId, type PlanetId, type ResourceId, CITIZEN_TIERS, RESOURCES } from '@smol/shared'
import { type EmpireAggregate } from '../../match/empireSelectors'
import './top-toolbar.css'

interface PlanetInventoryLike {
  readonly planetId: PlanetId
  readonly stocks: ReadonlyMap<ResourceId, number>
}

interface OwnedPlanetTooltipRow {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly inventory: PlanetInventoryLike
}

interface TopToolbarProps {
  readonly humanCivId: CivId
  readonly humanCivLabel: string
  // PHASE 17.L.C.8 — single-source aggregate computed in PlayPage via selectEmpireAggregate.
  // TopToolbar used to walk per-planet snapshots itself and compute totals; that duplicated
  // the loop that PlayPage's empireTotals + empirePersonalEquip were also running. Now every
  // consumer reads the same precomputed bundle so the toolbar resource count + the Telemetry
  // POWER slot + the new PlanetSummary panel never disagree.
  readonly empire: EmpireAggregate
  // Per-planet rows kept around solely for the tooltip on each resource chip (so the player can
  // see which planet holds how much of a resource without opening a panel). PlayPage passes a
  // light prop with just inventory.stocks + label, no population needed here anymore.
  readonly ownedPlanetTooltips: ReadonlyArray<OwnedPlanetTooltipRow>
  readonly currentTick: number
  // PHASE 17.L.D.10 (HOTFIX 2026-05-13) — research pool + per-tick accrual surfaced in the
  // top toolbar per user verbatim *"we need research point counter along with the resource
  // bar info"*. Pool is the empire-wide currency for tech purchases; per-tick rate is what
  // tickCivResearch deposits each tick. Same data the Tech Tree panel shows in its header,
  // mirrored here so the player sees it without opening the panel.
  readonly researchPointsPool: number
  readonly researchPointsPerTick: number
  // PHASE 17.L 2026-05-12 user feedback — pause/speed migrate from the (now-nuked) hud-header
  // into this bar, anchored to the far right (opposite the resources block). Always-visible
  // so the player can pause / scrub speed without opening any popover.
  readonly running: boolean
  readonly speed: 1 | 2 | 4 | 8
  readonly togglePause: () => void
  readonly setSpeed: (s: 1 | 2 | 4 | 8) => void
  // PHASE 17.L 2026-05-12 user feedback — "in mulitplayer games the speed is only set in the
  // host menu pregame setup canyt have people all changing games peeds on a hosts computer".
  // When true, speed buttons render disabled (display current speed but don't accept input).
  // Pause stays interactive — pause is a host-pad command, but a co-op observer could still
  // pause their LOCAL render only? For v1, pause is also disabled in MP — the authoritative
  // server tick rate is the only legitimate driver.
  readonly multiplayerMode: boolean
}

const DISPLAYED_RESOURCES: ReadonlyArray<ResourceId> = RESOURCES.map((r) => r.id)
const NONZERO_THRESHOLD = 0.5

export function TopToolbar({
  humanCivLabel,
  empire,
  ownedPlanetTooltips,
  currentTick,
  researchPointsPool,
  researchPointsPerTick,
  running,
  speed,
  togglePause,
  setSpeed,
  multiplayerMode,
}: TopToolbarProps) {
  const aggregateStocks = empire.stocksByResource
  const aggregateTiers = empire.tierCounts

  const prevStocksRef = useRef<Map<ResourceId, number>>(new Map())
  const prevTickRef = useRef<number>(currentTick)
  const [deltas, setDeltas] = useState<Map<ResourceId, number>>(new Map())

  useEffect(() => {
    if (currentTick === prevTickRef.current) return
    const tickGap = currentTick - prevTickRef.current
    if (tickGap <= 0) {
      prevTickRef.current = currentTick
      return
    }
    const nextDeltas = new Map<ResourceId, number>()
    for (const resourceId of DISPLAYED_RESOURCES) {
      const prev = prevStocksRef.current.get(resourceId) ?? 0
      const now = aggregateStocks.get(resourceId) ?? 0
      const delta = (now - prev) / tickGap
      if (Math.abs(delta) > NONZERO_THRESHOLD) nextDeltas.set(resourceId, delta)
    }
    setDeltas(nextDeltas)
    prevStocksRef.current = new Map(aggregateStocks)
    prevTickRef.current = currentTick
  }, [aggregateStocks, currentTick])

  const totalPopulation = empire.populationTotal

  const visibleResources = useMemo(() => {
    return RESOURCES.filter((def) => (aggregateStocks.get(def.id) ?? 0) > 0)
  }, [aggregateStocks])

  return (
    <header className="top-toolbar" aria-label="Empire Toolbar">
      <div className="top-toolbar__civ" title={`Tick ${currentTick}`}>
        <span className="top-toolbar__civ-label">{humanCivLabel}</span>
        <span className="top-toolbar__civ-tick">t {currentTick}</span>
      </div>

      {/* PHASE 17.L.D.10 (HOTFIX 2026-05-13) — research pool chip lives at the start of the
          resource row so the player sees it before scanning every stock. Tooltip surfaces
          the per-tick rate + the "click Tech Tree to spend" hint. Float values floored for
          display; sim keeps the float-precision pool. */}
      <div
        className="top-toolbar__research"
        title={`🔬 Research pool: ${Math.floor(researchPointsPool).toLocaleString()} pts · +${researchPointsPerTick.toLocaleString()}/tick from your scientists. Open the Tech Tree panel to spend the pool on a tech.`}
      >
        <span className="top-toolbar__research-emoji" aria-hidden>
          🔬
        </span>
        <span className="top-toolbar__research-count">
          {Math.floor(researchPointsPool).toLocaleString()}
        </span>
        <span className="top-toolbar__research-rate">
          +{researchPointsPerTick.toLocaleString()}/t
        </span>
      </div>

      <div className="top-toolbar__resources" role="list">
        {visibleResources.map((def) => {
          const count = aggregateStocks.get(def.id) ?? 0
          const delta = deltas.get(def.id) ?? 0
          const deltaClass =
            delta > 0 ? 'top-toolbar__delta--up' : delta < 0 ? 'top-toolbar__delta--down' : ''
          const perPlanet = ownedPlanetTooltips
            .map((p) => ({ id: p.planetLabel, qty: p.inventory.stocks.get(def.id) ?? 0 }))
            .filter((row) => row.qty > 0)
            .sort((a, b) => b.qty - a.qty)
          const tooltip =
            `${def.emoji} ${def.name} — total ${formatNumber(count)}` +
            (perPlanet.length > 0
              ? '\n' + perPlanet.map((row) => `  ${row.id}: ${formatNumber(row.qty)}`).join('\n')
              : '')
          return (
            <div
              key={String(def.id)}
              className="top-toolbar__resource"
              role="listitem"
              title={tooltip}
            >
              <span className="top-toolbar__resource-emoji" aria-hidden>
                {def.emoji}
              </span>
              <span className="top-toolbar__resource-count">{formatNumber(count)}</span>
              {delta !== 0 && (
                <span className={`top-toolbar__delta ${deltaClass}`}>
                  {delta > 0 ? '+' : ''}
                  {delta.toFixed(1)}/t
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="top-toolbar__citizens" role="list" aria-label="Citizen Tiers">
        <div
          className="top-toolbar__citizen-total"
          title={`Total population across ${empire.ownedPlanetCount} planet${empire.ownedPlanetCount === 1 ? '' : 's'}`}
        >
          <span aria-hidden>👥</span>
          <span>{formatNumber(totalPopulation)}</span>
        </div>
        {CITIZEN_TIERS.map((def) => {
          const count = aggregateTiers[def.tier]
          const tooltip = `${def.emoji} ${def.name} (Tier ${def.tier}) — ${formatNumber(count)}\n${def.description}`
          return (
            <div
              key={def.id}
              className={`top-toolbar__citizen-tier top-toolbar__citizen-tier--t${def.tier}`}
              role="listitem"
              title={tooltip}
            >
              <span className="top-toolbar__citizen-emoji" aria-hidden>
                {def.emoji}
              </span>
              <span className="top-toolbar__citizen-count">{formatNumber(count)}</span>
            </div>
          )
        })}
      </div>

      {/* PHASE 17.L 2026-05-12 — pause + speed controls anchored to the right edge of the
          top toolbar (opposite side from the resource list). Always visible so the player
          can scrub time without opening any popover. Pause hotkey: Space. Speed hotkeys:
          1 / 2 / 3 / 4 (where each maps to 1× / 2× / 4× / 8×).
          In multiplayer the host sets speed at pre-game setup; both controls render
          disabled here so co-op players can't reach onto the host's computer and change
          tick rate mid-match. The current speed still SHOWS (so everyone sees what the
          host picked) — it just can't be changed. */}
      <div className="top-toolbar__controls" role="group" aria-label="Time controls">
        {multiplayerMode && (
          <span
            className="top-toolbar__controls-lock-note"
            title="Speed is set by the match host in the pre-game New Game menu."
          >
            🔒 host-set
          </span>
        )}
        <button
          type="button"
          className="top-toolbar__control-btn"
          onClick={togglePause}
          disabled={multiplayerMode}
          title={
            multiplayerMode
              ? 'Pause is disabled in multiplayer — the server tick is authoritative.'
              : running
                ? 'Pause (Space)'
                : 'Resume (Space)'
          }
          aria-pressed={!running}
        >
          {running ? '⏸' : '▶'}
        </button>
        {([1, 2, 4, 8] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`top-toolbar__control-btn ${speed === s ? 'top-toolbar__control-btn--on' : ''}`}
            onClick={() => setSpeed(s)}
            disabled={multiplayerMode}
            title={
              multiplayerMode
                ? `Speed ${s}× — host-set in multiplayer (read-only).`
                : `Speed ${s}× (key ${Math.log2(s) + 1})`
            }
            aria-pressed={speed === s}
          >
            {s}×
          </button>
        ))}
      </div>
    </header>
  )
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`
  return `${Math.round(n)}`
}
