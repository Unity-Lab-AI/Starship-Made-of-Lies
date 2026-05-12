import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type ColonyShipFlight,
  type FlightTelemetrySnapshot,
  flightTelemetrySnapshot,
} from '@smol/shared'
import './TelemetryGraphPanel.css'

// 17.2.3 — Per-flight telemetry SVG line charts. Distance-to-target / altitude / fuel% /
// life-support% over the last RING_SIZE ticks. Uses a client-side ring buffer keyed by
// flight.id stored in a ref — keeps the panel sim-state-independent so the buffer survives
// re-renders but no sim mutation is required (per the simpler-is-safer rule for v1; full
// sim-side telemetryLog persistence ships when 17.2.4 lands).

const RING_SIZE = 300
const SAMPLE_EVERY_MS = 250

interface RingEntry {
  readonly tick: number
  readonly snap: FlightTelemetrySnapshot
}

interface TelemetryGraphPanelProps {
  readonly flights: ReadonlyArray<ColonyShipFlight>
  readonly currentTick: number
}

export function TelemetryGraphPanel({ flights, currentTick }: TelemetryGraphPanelProps) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const buffersRef = useRef<Map<string, RingEntry[]>>(new Map())
  const [, force] = useState(0)

  useEffect(() => {
    if (flights.length === 0) return
    const handle = window.setInterval(() => {
      const buffers = buffersRef.current
      for (const flight of flights) {
        const id = String(flight.id)
        const ring = buffers.get(id) ?? []
        ring.push({ tick: currentTick, snap: flightTelemetrySnapshot(flight) })
        while (ring.length > RING_SIZE) ring.shift()
        buffers.set(id, ring)
      }
      // Garbage-collect rings for flights no longer present.
      const liveIds = new Set(flights.map((f) => String(f.id)))
      for (const id of Array.from(buffers.keys())) {
        if (!liveIds.has(id)) buffers.delete(id)
      }
      force((n) => (n + 1) % 1_000_000)
    }, SAMPLE_EVERY_MS)
    return () => window.clearInterval(handle)
  }, [flights, currentTick])

  const effectiveId = selectedFlightId ?? (flights[0] ? String(flights[0].id) : null)
  // Snapshot the ring through useMemo so the chartData hook below has a stable dep target.
  // The ref churns every interval tick; this isolates the read to the current effectiveId +
  // current tick so a missing-deps lint stays clean.
  const ring = useMemo<ReadonlyArray<RingEntry>>(() => {
    return effectiveId ? (buffersRef.current.get(effectiveId) ?? []) : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveId, currentTick])

  const chartData = useMemo(() => {
    if (ring.length < 2) return null
    const dists = ring.map((e) => e.snap.distToTarget)
    const alts = ring.map((e) => e.snap.altitude)
    const fuelPct = ring.map((e) => e.snap.fuelPct)
    const lsPct = ring.map((e) => e.snap.lifeSupportPct)
    return {
      dists,
      alts,
      fuelPct,
      lsPct,
      distMax: Math.max(...dists),
      altMax: Math.max(...alts),
      tickFirst: ring[0]!.tick,
      tickLast: ring[ring.length - 1]!.tick,
    }
  }, [ring])

  return (
    <section className="telemetry-graph-panel" aria-label="Telemetry graphs">
      <header className="telemetry-graph-panel__header">
        <h2>📈 Telemetry</h2>
        <select
          className="telemetry-graph-panel__select"
          value={effectiveId ?? ''}
          onChange={(e) => setSelectedFlightId(e.target.value || null)}
          disabled={flights.length === 0}
        >
          {flights.length === 0 ? (
            <option value="">(no active flights)</option>
          ) : (
            flights.map((f) => (
              <option key={String(f.id)} value={String(f.id)}>
                Flight {String(f.id)} · {f.phase}
              </option>
            ))
          )}
        </select>
      </header>

      {!chartData ? (
        <p className="telemetry-graph-panel__empty">
          Sampling telemetry... charts populate after a couple of ticks.
        </p>
      ) : (
        <>
          <Chart
            title="Distance to target"
            unit="u"
            values={chartData.dists}
            max={chartData.distMax}
            stroke="#d4a13a"
            invertGoodAxis
          />
          <Chart
            title="Altitude"
            unit="u"
            values={chartData.alts}
            max={chartData.altMax}
            stroke="#60a5fa"
            invertGoodAxis={false}
          />
          <Chart
            title="Fuel"
            unit="%"
            values={chartData.fuelPct.map((v) => v * 100)}
            max={100}
            stroke="#facc15"
            invertGoodAxis={false}
          />
          <Chart
            title="Life support"
            unit="%"
            values={chartData.lsPct.map((v) => v * 100)}
            max={100}
            stroke="#34d399"
            invertGoodAxis={false}
          />
          <p className="telemetry-graph-panel__footer">
            Window ticks {chartData.tickFirst} → {chartData.tickLast} · samples {ring.length}/
            {RING_SIZE}
          </p>
        </>
      )}
    </section>
  )
}

interface ChartProps {
  readonly title: string
  readonly unit: string
  readonly values: ReadonlyArray<number>
  readonly max: number
  readonly stroke: string
  readonly invertGoodAxis: boolean
}

function Chart({ title, unit, values, max, stroke, invertGoodAxis }: ChartProps) {
  const width = 320
  const height = 56
  const padding = 4
  const lastVal = values[values.length - 1] ?? 0
  const safeMax = max > 0 ? max : 1
  const points = useMemo(() => {
    if (values.length < 2) return ''
    const step = (width - 2 * padding) / Math.max(1, values.length - 1)
    return values
      .map((v, i) => {
        const x = padding + i * step
        const norm = Math.max(0, Math.min(1, v / safeMax))
        const y = padding + (height - 2 * padding) * (invertGoodAxis ? norm : 1 - norm)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [values, safeMax, invertGoodAxis])

  return (
    <figure className="telemetry-graph-panel__chart">
      <figcaption className="telemetry-graph-panel__chart-cap">
        {title}
        <span className="telemetry-graph-panel__chart-val">
          {lastVal.toFixed(unit === '%' ? 0 : 1)}
          {unit}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="telemetry-graph-panel__chart-svg"
        role="img"
        aria-label={`${title} sparkline`}
      >
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </figure>
  )
}
