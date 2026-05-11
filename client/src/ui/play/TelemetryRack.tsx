import { useMemo, useState } from 'react'
import {
  type BuildingDefId,
  type ColonyShipFlight,
  type LaunchPad,
  type PlanetInventory,
  type ShipBeaconBroadcast,
  type SparklineBuffer,
  type SparklineMetricId,
  RESOURCE_FUEL,
  SPARKLINE_CYCLE_ORDER,
  SPARKLINE_DISPLAY,
  TARGETING_MODE_EMOJI,
  flightTelemetrySnapshot,
  getBuildingProduction,
  getColonyShipDef,
} from '@smol/shared'
import { Sparkline } from './Sparkline'
import './telemetry-rack.css'

// PHASE 16.14 — UMS 11-LCD telemetry rack v1. UMS UnityPad/UnityInventory own 11 numbered LCDs
// in canonical positions (1=CONTROL, 2=BUILD, 3=SYSTEMS, 4=INV cycle, 5=POWER, 6=GRAPHS,
// 7=FLIGHT, 8=STATUS, 9=FLEET, 10=MINER, 11=PERSONAL). This rack is the always-visible
// SMoL equivalent — a collapsible 6×2 grid that surfaces compact one-line summaries per slot.
// v1 ships concrete content for the slots that have live data flowing today (1, 2, 7, 9);
// other slots show stub copy explaining what they will host once their data pipelines land.

export interface TelemetryRackProps {
  readonly activePads: ReadonlyArray<LaunchPad>
  readonly miningBeacons: ReadonlyArray<ShipBeaconBroadcast>
  readonly activeFlights: ReadonlyArray<ColonyShipFlight>
  readonly resourceTotals: number
  readonly populationTotal: number
  readonly empireTechs: number
  readonly currentTick: number
  // PHASE 16.19: active-planet inventory for LCD slot 4 INV CYCLE concrete data
  readonly activePlanetInventory?: PlanetInventory
  // PHASE 16.35: canonical 12-metric sparkline buffers from MatchState. LCD slot 6 cycles
  // through SPARKLINE_CYCLE_ORDER and renders the active metric's mini-chart live.
  readonly sparklines?: ReadonlyMap<SparklineMetricId, SparklineBuffer>
  // PHASE 16.37: empire-wide personal-equipment inventory aggregates for LCD slot 11. Sums
  // tools / weapons / ammo / gas-bottles across every owned-planet inventory. Maps to UMS
  // UnityInventory [TOOLS_WEAPONS] + [PERSONAL_AMMO] + [BOTTLES] sections.
  readonly empirePersonalEquip?: {
    readonly tools: number
    readonly weapons: number
    readonly ammo: number
    readonly gas: number
  }
  // PHASE 17.L.B.6 — active-planet POWER mirror for LCD slot 5. Compact at-a-glance view of
  // capacity / draw / surplus / brownout from the same source data PlanetEnergyPanel uses.
  // Optional — when missing, slot 5 falls back to the pre-17.L.B.6 empire-stats stub.
  readonly activePlanetBuildings?: Map<BuildingDefId, number>
  readonly techProductionMultiplier?: number
}

type LCDStatus = 'live' | 'stub'

interface LCDSlotProps {
  readonly slot: number
  readonly title: string
  readonly status: LCDStatus
  readonly children: React.ReactNode
}

function LCDSlot({ slot, title, status, children }: LCDSlotProps) {
  return (
    <div className={`telemetry-rack__lcd telemetry-rack__lcd--${status}`}>
      <header className="telemetry-rack__lcd-header">
        <span className="telemetry-rack__lcd-slot">{slot}</span>
        <span className="telemetry-rack__lcd-title">{title}</span>
      </header>
      <div className="telemetry-rack__lcd-body">{children}</div>
    </div>
  )
}

export function TelemetryRack({
  activePads,
  miningBeacons,
  activeFlights,
  resourceTotals,
  populationTotal,
  empireTechs,
  currentTick,
  activePlanetInventory,
  sparklines,
  empirePersonalEquip,
  activePlanetBuildings,
  techProductionMultiplier,
}: TelemetryRackProps) {
  const [expanded, setExpanded] = useState(false)
  // PHASE 16.35 — LCD slot 6 GRAPHS cycle index. Auto-advances every SPARKLINE_AUTO_ADVANCE_TICKS
  // ticks of currentTick to mimic the UMS 12-graph rotation. Player can also click to advance
  // manually (next-button on the slot).
  const sparklineCycleIdx = Math.floor(currentTick / 100) % SPARKLINE_CYCLE_ORDER.length
  const [sparklineManualIdx, setSparklineManualIdx] = useState<number | null>(null)
  const activeSparklineIdx = sparklineManualIdx ?? sparklineCycleIdx
  const activeSparklineMetricId =
    SPARKLINE_CYCLE_ORDER[activeSparklineIdx] ?? SPARKLINE_CYCLE_ORDER[0]!
  const activeSparkline = sparklines?.get(activeSparklineMetricId)
  const activeSparklineMeta = SPARKLINE_DISPLAY.get(activeSparklineMetricId)

  // PHASE 16.19: LCD slot 4 INV CYCLE — top 4 resources on the active planet by stock count.
  // Cycles in the UMS-faithful 7-tab pattern (BUILD/MISSILE/FUEL/POWER/CARGO/PROD/FACILITIES)
  // is roadmapped; v1 just shows the top stocks so the slot has live data.
  const topInventoryEntries = useMemo<ReadonlyArray<readonly [string, number]>>(() => {
    if (!activePlanetInventory) return []
    const sorted = [...activePlanetInventory.stocks.entries()].sort((a, b) => b[1] - a[1])
    return sorted.slice(0, 4).map(([id, amount]) => [String(id), amount] as const)
  }, [activePlanetInventory])

  // PHASE 16.20 → 16.21 → 16.33: LCD slot 8 MISSILE STATUS UMS-faithful telemetry per
  // .claude/SMOL_REFERENCE_MISSILE.md UNITY_MSL channel spec. Per active flight (resolved
  // flights filtered out): variant + distToTarget (km) + closingSpeed (m/s) + altitude (km)
  // + citizens aboard + phase + signalLost badge + PHASE 16.33 targeting mode emoji.
  // Sorted by progress desc so most-traveled missiles surface first (matches UMS pad LCD7
  // ordering).
  const topFlightStatus = useMemo<
    ReadonlyArray<{
      id: string
      label: string
      progressPct: number
      altitudeKm: number
      distToTargetKm: number
      closingSpeed: number
      citizens: number
      phase: string
      signalLost: boolean
      modeEmoji: string
    }>
  >(() => {
    const out: Array<{
      id: string
      label: string
      progressPct: number
      altitudeKm: number
      distToTargetKm: number
      closingSpeed: number
      citizens: number
      phase: string
      signalLost: boolean
      modeEmoji: string
    }> = []
    for (const f of activeFlights) {
      if (
        f.phase === 'DETONATE' ||
        f.phase === 'INTERCEPTED' ||
        f.phase === 'ABORTED' ||
        f.phase === 'CRASH_LANDED'
      ) {
        continue
      }
      const def = getColonyShipDef(f.variantId)
      const tel = flightTelemetrySnapshot(f)
      out.push({
        id: String(f.id),
        label: `${def.emoji} ${def.name}`,
        progressPct: Math.round(tel.progress * 100),
        altitudeKm: tel.altitude / 1000,
        distToTargetKm: tel.distToTarget / 1000,
        closingSpeed: Math.round(tel.closingSpeed),
        citizens: f.citizensAboard,
        phase: f.phase,
        signalLost: tel.signalLost,
        modeEmoji: TARGETING_MODE_EMOJI[tel.targetingMode],
      })
    }
    out.sort((a, b) => b.progressPct - a.progressPct)
    return out.slice(0, 3)
  }, [activeFlights])

  // PHASE 16.33: LCD slot 3 SHIP SYSTEMS live — aggregates the most-distressed active flights
  // by ship-systems state from PHASE 16.32 (power, life support, crew, auto-guidance). Sort
  // priority: STRANDED + EMPTY_HULK first (most critical), then starving crew, then low power,
  // then by overall systems-distress index. Top 3 surface so the player sees the worst-off
  // flights without opening the FlightDetailPanel for each.
  const topShipSystems = useMemo<
    ReadonlyArray<{
      id: string
      label: string
      powerSource: 'battery' | 'reactor' | 'solar'
      powerPct: number
      lifeSupportPct: number
      crewAlive: number
      crewTotal: number
      isStarving: boolean
      isStranded: boolean
      isEmptyHulk: boolean
      autoGuidance: boolean
    }>
  >(() => {
    const out: Array<{
      id: string
      label: string
      powerSource: 'battery' | 'reactor' | 'solar'
      powerPct: number
      lifeSupportPct: number
      crewAlive: number
      crewTotal: number
      isStarving: boolean
      isStranded: boolean
      isEmptyHulk: boolean
      autoGuidance: boolean
      distressScore: number
    }> = []
    for (const f of activeFlights) {
      if (
        f.phase === 'DETONATE' ||
        f.phase === 'INTERCEPTED' ||
        f.phase === 'ABORTED' ||
        f.phase === 'CRASH_LANDED'
      ) {
        continue
      }
      const def = getColonyShipDef(f.variantId)
      const tel = flightTelemetrySnapshot(f)
      const isStarving = tel.crewStarvationTimer > 0 && tel.crewAlive > 0
      const isStranded = f.phase === 'STRANDED'
      const isEmptyHulk = f.phase === 'EMPTY_HULK'
      // Higher score = more distressed. EMPTY_HULK + STRANDED dominate; starving + low power
      // stack below. Unmanned ships with healthy systems score near zero.
      let distressScore = 0
      if (isEmptyHulk) distressScore += 1000
      if (isStranded) distressScore += 800
      if (isStarving) distressScore += 400
      distressScore += (1 - tel.powerPct) * 100
      distressScore += (1 - tel.lifeSupportPct) * 100
      out.push({
        id: String(f.id),
        label: `${def.emoji} ${def.name}`,
        powerSource: tel.powerSource,
        powerPct: Math.round(tel.powerPct * 100),
        lifeSupportPct: Math.round(tel.lifeSupportPct * 100),
        crewAlive: tel.crewAlive,
        crewTotal: f.citizensAboard,
        isStarving,
        isStranded,
        isEmptyHulk,
        autoGuidance: tel.autoGuidanceInstalled,
        distressScore,
      })
    }
    out.sort((a, b) => b.distressScore - a.distressScore)
    return out.slice(0, 3).map(({ distressScore: _omit, ...rest }) => {
      void _omit
      return rest
    })
  }, [activeFlights])

  // PHASE 16.20: LCD slot 10 MINER DETAIL live data — top 3 mining ships by cargo% across all
  // planets, surfacing shipName + status + cargo % so the player sees fleet-level activity
  // without opening the Mining Fleet panel. UMS-faithful per-ship detail (storage cycle,
  // trajectory, battery, H2%) is roadmapped — v1 gives the panel real data.
  const topMinerDetail = useMemo<
    ReadonlyArray<{ id: string; shipName: string; status: string; cargoPct: number }>
  >(() => {
    const enriched = miningBeacons.map((b) => ({
      id: String(b.shipId),
      shipName: b.shipName,
      status: b.status,
      cargoPct:
        b.cargoCapacity > 0
          ? Math.min(100, Math.round((b.cargoAmount / b.cargoCapacity) * 100))
          : 0,
    }))
    enriched.sort((a, b) => b.cargoPct - a.cargoPct)
    return enriched.slice(0, 3)
  }, [miningBeacons])

  const padCounts = useMemo(() => {
    let idle = 0
    let building = 0
    let ready = 0
    let armed = 0
    let launched = 0
    for (const pad of activePads) {
      switch (pad.state) {
        case 'INIT':
        case 'IDLE':
          idle += 1
          break
        case 'PRINT':
        case 'BUILD':
        case 'DOCK':
        case 'FUEL':
        case 'AMMO':
          building += 1
          break
        case 'READY':
          ready += 1
          break
        case 'ARM':
          armed += 1
          break
        case 'LAUNCH':
        case 'GONE':
          launched += 1
          break
      }
    }
    return { idle, building, ready, armed, launched, total: activePads.length }
  }, [activePads])

  const fleetCounts = useMemo(() => {
    let docked = 0
    let outbound = 0
    let drilling = 0
    let inbound = 0
    let offloading = 0
    let cargoFull = 0
    let cargoTotal = 0
    for (const b of miningBeacons) {
      switch (b.status) {
        case 'DOCKED':
        case 'IDLE':
          docked += 1
          break
        case 'OUTBOUND_TRAVELING':
          outbound += 1
          break
        case 'AT_DEPOSIT_DRILLING':
          drilling += 1
          break
        case 'INBOUND_RETURNING':
          inbound += 1
          break
        case 'OFFLOADING':
          offloading += 1
          break
      }
      cargoFull += b.cargoAmount
      cargoTotal += b.cargoCapacity
    }
    const cargoPct = cargoTotal > 0 ? Math.round((cargoFull / cargoTotal) * 100) : 0
    return {
      total: miningBeacons.length,
      docked,
      outbound,
      drilling,
      inbound,
      offloading,
      cargoPct,
    }
  }, [miningBeacons])

  const flightCounts = useMemo(() => {
    let climb = 0
    let coast = 0
    let target = 0
    let reentry = 0
    let resolved = 0
    for (const f of activeFlights) {
      switch (f.phase) {
        case 'CLIMB':
          climb += 1
          break
        case 'COAST':
          coast += 1
          break
        case 'REENTRY':
          reentry += 1
          break
        case 'TARGET':
          target += 1
          break
        case 'DETONATE':
        case 'INTERCEPTED':
        case 'ABORTED':
        case 'CRASH_LANDED':
          resolved += 1
          break
      }
    }
    return {
      total: activeFlights.length,
      climb,
      coast,
      reentry,
      target,
      resolved,
    }
  }, [activeFlights])

  return (
    <section
      className={`telemetry-rack ${expanded ? 'telemetry-rack--expanded' : 'telemetry-rack--collapsed'}`}
      aria-label="11-LCD telemetry rack"
    >
      <button
        type="button"
        className="telemetry-rack__toggle"
        onClick={() => setExpanded((v) => !v)}
        title={expanded ? 'Collapse the LCD rack' : 'Expand the 11-LCD rack (UMS telemetry)'}
      >
        {expanded ? '▾' : '▴'} LCD Rack · 11 panels
      </button>
      {expanded && (
        <div className="telemetry-rack__grid">
          <LCDSlot slot={1} title="CONTROL" status="live">
            <div>
              Pads: <strong>{padCounts.total}</strong>
            </div>
            <div className="telemetry-rack__line">
              R/A/L: {padCounts.ready}/{padCounts.armed}/{padCounts.launched}
            </div>
            <div className="telemetry-rack__line">t{currentTick}</div>
          </LCDSlot>

          <LCDSlot slot={2} title="BUILD STATUS" status="live">
            <div>
              Building: <strong>{padCounts.building}</strong>
            </div>
            <div className="telemetry-rack__line">Idle: {padCounts.idle}</div>
          </LCDSlot>

          <LCDSlot slot={3} title="SHIP SYSTEMS" status="live">
            {topShipSystems.length === 0 ? (
              <div className="telemetry-rack__stub">No active colony-ship flights.</div>
            ) : (
              <>
                {topShipSystems.map((s) => {
                  const powerGlyph =
                    s.powerSource === 'solar' ? '🔆' : s.powerSource === 'battery' ? '🔋' : '⚛️'
                  const crewLabel =
                    s.crewTotal === 0
                      ? 'unmanned'
                      : `👥 ${s.crewAlive.toLocaleString()}/${s.crewTotal.toLocaleString()}`
                  const flags = [
                    s.isEmptyHulk ? '🪦 HULK' : null,
                    s.isStranded ? '🛰️ STRANDED' : null,
                    s.isStarving ? '⚠️ STARVING' : null,
                    s.autoGuidance ? '🤖 AUTO' : null,
                  ]
                    .filter((x): x is string => x !== null)
                    .join(' ')
                  return (
                    <div key={s.id} className="telemetry-rack__line">
                      {s.label} · {powerGlyph} <strong>{s.powerPct}%</strong> · LS{' '}
                      {s.lifeSupportPct}% · {crewLabel}
                      {flags ? ` · ${flags}` : ''}
                    </div>
                  )
                })}
              </>
            )}
          </LCDSlot>

          <LCDSlot slot={4} title="INV CYCLE" status="live">
            {topInventoryEntries.length === 0 ? (
              <div className="telemetry-rack__stub">No active planet inventory data.</div>
            ) : (
              <>
                {topInventoryEntries.map(([resId, amount]) => (
                  <div key={resId} className="telemetry-rack__line">
                    {resId}: <strong>{amount.toLocaleString()}</strong>
                  </div>
                ))}
              </>
            )}
          </LCDSlot>

          <LCDSlot slot={5} title="POWER" status="live">
            {/* PHASE 17.L.B.6 — POWER mirror. Compact capacity / draw / surplus + brownout
               warning + fuel stock. Falls back to empire-stats stub when no active-planet
               building data is threaded through (e.g. early boot or no-planet-selected). */}
            {(() => {
              if (!activePlanetBuildings) {
                return (
                  <>
                    <div>
                      Pop: <strong>{populationTotal.toLocaleString()}</strong>
                    </div>
                    <div className="telemetry-rack__line">
                      Stock: <strong>{resourceTotals.toLocaleString()}</strong>
                    </div>
                    <div className="telemetry-rack__line">Techs: {empireTechs}</div>
                  </>
                )
              }
              const techMult = techProductionMultiplier ?? 1
              let capacity = 0
              let draw = 0
              for (const [defId, count] of activePlanetBuildings) {
                if (count === 0) continue
                const prod = getBuildingProduction(defId)
                if (!prod) continue
                const fuelOut = prod.outputs.find((o) => o.resource === RESOURCE_FUEL)?.amount ?? 0
                if (fuelOut > 0) capacity += fuelOut * count * techMult
                const fuelIn = prod.inputs.find((i) => i.resource === RESOURCE_FUEL)?.amount ?? 0
                if (fuelIn > 0) draw += fuelIn * count
              }
              const surplus = capacity - draw
              const fuelStock = activePlanetInventory?.stocks.get(RESOURCE_FUEL) ?? 0
              const brownout = surplus < 0 && fuelStock <= 0
              return (
                <>
                  <div>
                    Capacity: <strong>{capacity.toFixed(1)}</strong> ⛽/t
                  </div>
                  <div className="telemetry-rack__line">
                    Draw: <strong>{draw.toFixed(1)}</strong> ⛽/t
                  </div>
                  <div className="telemetry-rack__line">
                    Surplus:{' '}
                    <strong style={{ color: surplus >= 0 ? '#7dd87d' : '#e07b6f' }}>
                      {surplus >= 0 ? '+' : ''}
                      {surplus.toFixed(1)}
                    </strong>{' '}
                    ⛽/t
                  </div>
                  <div className="telemetry-rack__line">
                    Stock: <strong>{Math.round(fuelStock)}</strong> ⛽
                    {brownout ? <span style={{ marginLeft: '0.4em' }}>⚠ Brownout</span> : null}
                  </div>
                </>
              )
            })()}
          </LCDSlot>

          <LCDSlot slot={6} title="GRAPHS" status="live">
            {activeSparkline && activeSparklineMeta ? (
              <>
                <Sparkline
                  buffer={activeSparkline}
                  label={activeSparklineMeta.label}
                  emoji={activeSparklineMeta.emoji}
                  color={activeSparklineMeta.color}
                  {...(activeSparklineMeta.suffix ? { suffix: activeSparklineMeta.suffix } : {})}
                />
                <div className="telemetry-rack__sparkline-cycle">
                  <button
                    type="button"
                    className="telemetry-rack__sparkline-cycle-btn"
                    title="Previous graph"
                    onClick={() =>
                      setSparklineManualIdx(
                        (activeSparklineIdx + SPARKLINE_CYCLE_ORDER.length - 1) %
                          SPARKLINE_CYCLE_ORDER.length,
                      )
                    }
                  >
                    ◀
                  </button>
                  <span className="telemetry-rack__sparkline-cycle-pos">
                    {activeSparklineIdx + 1}/{SPARKLINE_CYCLE_ORDER.length}
                  </span>
                  <button
                    type="button"
                    className="telemetry-rack__sparkline-cycle-btn"
                    title="Next graph"
                    onClick={() =>
                      setSparklineManualIdx((activeSparklineIdx + 1) % SPARKLINE_CYCLE_ORDER.length)
                    }
                  >
                    ▶
                  </button>
                  {sparklineManualIdx !== null ? (
                    <button
                      type="button"
                      className="telemetry-rack__sparkline-cycle-btn"
                      title="Resume auto-cycle"
                      onClick={() => setSparklineManualIdx(null)}
                    >
                      ⟳
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="telemetry-rack__stub">
                Sparkline buffers not wired — pass sparklines prop from PlayPage.
              </div>
            )}
          </LCDSlot>

          <LCDSlot slot={7} title="FLIGHT COMMS" status="live">
            <div>
              Flights: <strong>{flightCounts.total}</strong>
            </div>
            <div className="telemetry-rack__line">
              CL/CO/RE/TG: {flightCounts.climb}/{flightCounts.coast}/{flightCounts.reentry}/
              {flightCounts.target}
            </div>
            <div className="telemetry-rack__line">Resolved: {flightCounts.resolved}</div>
          </LCDSlot>

          <LCDSlot slot={8} title="MISSILE STATUS" status="live">
            {topFlightStatus.length === 0 ? (
              <div className="telemetry-rack__stub">No active colony-ship flights.</div>
            ) : (
              <>
                {topFlightStatus.map((f) => (
                  <div key={f.id} className="telemetry-rack__line">
                    {f.modeEmoji} {f.label} · <strong>{f.distToTargetKm.toFixed(1)}km</strong> ↓
                    {f.closingSpeed}m/s · {f.phase}
                    {f.signalLost ? ' 📡✕' : ''} · 👥 {f.citizens.toLocaleString()}
                  </div>
                ))}
              </>
            )}
          </LCDSlot>

          <LCDSlot slot={9} title="FLEET READINESS" status="live">
            <div>
              Miners: <strong>{fleetCounts.total}</strong>
            </div>
            <div className="telemetry-rack__line">
              D/O/Dr/I/Of: {fleetCounts.docked}/{fleetCounts.outbound}/{fleetCounts.drilling}/
              {fleetCounts.inbound}/{fleetCounts.offloading}
            </div>
            <div className="telemetry-rack__line">Cargo: {fleetCounts.cargoPct}%</div>
          </LCDSlot>

          <LCDSlot slot={10} title="MINER DETAIL" status="live">
            {topMinerDetail.length === 0 ? (
              <div className="telemetry-rack__stub">
                No active mining beacons — open the ⛏️ Mining Fleet panel once ships launch.
              </div>
            ) : (
              <>
                {topMinerDetail.map((s) => (
                  <div key={s.id} className="telemetry-rack__line">
                    {s.shipName} · <strong>{s.cargoPct}%</strong> · {s.status}
                  </div>
                ))}
              </>
            )}
          </LCDSlot>

          <LCDSlot slot={11} title="PERSONAL EQUIP." status="live">
            {empirePersonalEquip ? (
              <>
                <div className="telemetry-rack__line">
                  🛠️ Tools: <strong>{empirePersonalEquip.tools.toLocaleString()}</strong>
                </div>
                <div className="telemetry-rack__line">
                  🔫 Weapons: <strong>{empirePersonalEquip.weapons.toLocaleString()}</strong>
                </div>
                <div className="telemetry-rack__line">
                  🎯 Ammo: <strong>{empirePersonalEquip.ammo.toLocaleString()}</strong>
                </div>
                <div className="telemetry-rack__line">
                  🧪 Gas: <strong>{empirePersonalEquip.gas.toLocaleString()}</strong>
                </div>
              </>
            ) : (
              <div className="telemetry-rack__stub">No empire data available.</div>
            )}
          </LCDSlot>
        </div>
      )}
    </section>
  )
}
