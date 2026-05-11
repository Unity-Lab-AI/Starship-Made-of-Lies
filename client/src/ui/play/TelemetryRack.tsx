import { useMemo, useState } from 'react'
import {
  type ColonyShipFlight,
  type LaunchPad,
  type PlanetInventory,
  type ShipBeaconBroadcast,
  getColonyShipDef,
} from '@smol/shared'
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
}: TelemetryRackProps) {
  const [expanded, setExpanded] = useState(false)

  // PHASE 16.19: LCD slot 4 INV CYCLE — top 4 resources on the active planet by stock count.
  // Cycles in the UMS-faithful 7-tab pattern (BUILD/MISSILE/FUEL/POWER/CARGO/PROD/FACILITIES)
  // is roadmapped; v1 just shows the top stocks so the slot has live data.
  const topInventoryEntries = useMemo<ReadonlyArray<readonly [string, number]>>(() => {
    if (!activePlanetInventory) return []
    const sorted = [...activePlanetInventory.stocks.entries()].sort((a, b) => b[1] - a[1])
    return sorted.slice(0, 4).map(([id, amount]) => [String(id), amount] as const)
  }, [activePlanetInventory])

  // PHASE 16.20: LCD slot 8 MISSILE STATUS live data — top 3 in-flight colony ships sorted
  // by progress (most-traveled first), surfacing variant emoji + citizens aboard + flight
  // progress %. Resolved flights (DETONATE/INTERCEPTED/ABORTED/CRASH_LANDED) are filtered
  // out so the slot tracks active payloads only. UMS-faithful per-flight payload load-out
  // (fuel/ammo/citizens columns) is roadmapped — v1 gives the panel real data.
  const topFlightStatus = useMemo<
    ReadonlyArray<{
      id: string
      label: string
      progressPct: number
      citizens: number
      phase: string
    }>
  >(() => {
    const out: Array<{
      id: string
      label: string
      progressPct: number
      citizens: number
      phase: string
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
      const progressPct =
        f.totalTicks > 0 ? Math.min(100, Math.round((f.ticksFlown / f.totalTicks) * 100)) : 0
      out.push({
        id: String(f.id),
        label: `${def.emoji} ${def.name}`,
        progressPct,
        citizens: f.citizensAboard,
        phase: f.phase,
      })
    }
    out.sort((a, b) => b.progressPct - a.progressPct)
    return out.slice(0, 3)
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

          <LCDSlot slot={3} title="SHIP SYSTEMS" status="stub">
            <div className="telemetry-rack__stub">
              Per-pad missile-systems breakdown — landing with build-phase machine wire-up.
            </div>
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
            <div>
              Pop: <strong>{populationTotal.toLocaleString()}</strong>
            </div>
            <div className="telemetry-rack__line">
              Stock: <strong>{resourceTotals.toLocaleString()}</strong>
            </div>
            <div className="telemetry-rack__line">Techs: {empireTechs}</div>
          </LCDSlot>

          <LCDSlot slot={6} title="GRAPHS" status="stub">
            <div className="telemetry-rack__stub">
              12-graph sparkline cycle (Bat/H2/O2/Cargo/Refinery/Asm/Prod/Power/Solar/Wind/ Reactor)
              — pending.
            </div>
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
                    {f.label} · <strong>{f.progressPct}%</strong> · 👥 {f.citizens.toLocaleString()}{' '}
                    · {f.phase}
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

          <LCDSlot slot={11} title="PERSONAL EQUIP." status="stub">
            <div className="telemetry-rack__stub">
              Tools / Weapons / Ammo / Bottles 4-column — pending equipment data model.
            </div>
          </LCDSlot>
        </div>
      )}
    </section>
  )
}
