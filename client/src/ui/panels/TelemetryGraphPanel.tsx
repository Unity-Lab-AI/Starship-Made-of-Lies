import { useMemo, useState } from 'react'
import { type ColonyShipFlight, TELEMETRY_LOG_RING_SIZE } from '@smol/shared'
import './TelemetryGraphPanel.css'

// 17.2.3 — Per-flight telemetry SVG line charts. Distance-to-target / altitude / fuel% /
// life-support% over the last TELEMETRY_LOG_RING_SIZE ticks.
//
// 17.2.4 — Reads from flight.telemetryLog (sim-owned ring) instead of the prior client-side
// useRef ring buffer. Sim-owned data survives panel mount/unmount cycles, round-trips through
// save/load, and becomes available to the PHASE 18.3 match-replay system.

interface TelemetryGraphPanelProps {
  readonly flights: ReadonlyArray<ColonyShipFlight>
  readonly currentTick: number
}

export function TelemetryGraphPanel({ flights, currentTick }: TelemetryGraphPanelProps) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const effectiveId = selectedFlightId ?? (flights[0] ? String(flights[0].id) : null)
  const selectedFlight = useMemo<ColonyShipFlight | null>(() => {
    if (!effectiveId) return null
    return flights.find((f) => String(f.id) === effectiveId) ?? null
  }, [effectiveId, flights])

  const chartData = useMemo(() => {
    if (!selectedFlight) return null
    const log = selectedFlight.telemetryLog
    if (log.length < 2) return null
    const dists = log.map((s) => s.distToTarget)
    const alts = log.map((s) => s.altitude)
    const fuelPct = log.map((s) => s.fuelPct)
    const lsPct = log.map((s) => s.lifeSupportPct)
    return {
      dists,
      alts,
      fuelPct,
      lsPct,
      distMax: Math.max(...dists),
      altMax: Math.max(...alts),
      // Telemetry log is sim-owned and untimestamped — the window endpoint is the current
      // tick and the start is currentTick minus log length.
      tickFirst: Math.max(0, currentTick - log.length + 1),
      tickLast: currentTick,
      sampleCount: log.length,
    }
  }, [selectedFlight, currentTick])

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
            Window ticks {chartData.tickFirst} → {chartData.tickLast} · samples{' '}
            {chartData.sampleCount}/{TELEMETRY_LOG_RING_SIZE}
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
