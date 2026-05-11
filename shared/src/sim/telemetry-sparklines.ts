// PHASE 16.35 — UMS-faithful sparkline cycle data model per SMOL_REFERENCE_GRAPHS_PANELS.md.
// UMS UnityPad/UnityInventory render a 12-graph rotation on LCD slot 6 showing per-tick trends
// for Bat/H2/O2/Cargo/Refinery/Asm/Prod/Power/Solar/Wind/Reactor. SMoL adapts this to its own
// metric catalog (resource totals, population, tech research points, active flights, mining
// cargo aggregate %, etc.) while keeping the UMS visual + rotation pattern.
//
// Design:
// - Fixed-size circular buffer per metric. SPARKLINE_BUFFER_SIZE samples covers the rolling
//   window. At SPARKLINE_CAPTURE_INTERVAL ticks per sample, 60 samples × 5 ticks = 300 ticks
//   (~1 minute at default 200ms tick at 1× speed; longer at slower speeds).
// - Append-on-write with wrap-around; readers iterate from oldest to newest via getSamples.
// - Pure value semantics — no class, no mutation outside the dedicated recordSparklineSample
//   helper. Keeps tickMatch deterministic + serializable.
// - Built-in metric ids cover the canonical UMS cycle adapted for SMoL. Operators can add new
//   ones by stringly-typing — SparklineMetricId is a brand on string, so new metrics drop in
//   without enum churn.

declare const __sparklineMetricBrand: unique symbol
type Brand<T, B> = T & { readonly [__sparklineMetricBrand]: B }
export type SparklineMetricId = Brand<string, 'SparklineMetricId'>
export const sparklineMetricId = (s: string): SparklineMetricId => s as SparklineMetricId

export const SPARKLINE_BUFFER_SIZE = 60
export const SPARKLINE_CAPTURE_INTERVAL = 5

// Canonical metric ids for the UMS-style 12-graph cycle, adapted for SMoL. Order matters —
// TelemetryRack slot 6 cycles through this list in display order.
export const SPARKLINE_RESOURCE_TOTAL = sparklineMetricId('resource-total')
export const SPARKLINE_POPULATION = sparklineMetricId('population')
export const SPARKLINE_TECH_POINTS = sparklineMetricId('tech-points')
export const SPARKLINE_ACTIVE_FLIGHTS = sparklineMetricId('active-flights')
export const SPARKLINE_MINING_CARGO_PCT = sparklineMetricId('mining-cargo-pct')
export const SPARKLINE_FOOD = sparklineMetricId('food-stock')
export const SPARKLINE_FUEL = sparklineMetricId('fuel-stock')
export const SPARKLINE_INGOTS = sparklineMetricId('ingots-stock')
export const SPARKLINE_COMPONENTS = sparklineMetricId('components-stock')
export const SPARKLINE_OWNED_PLANETS = sparklineMetricId('owned-planets')
export const SPARKLINE_DEFEATED_CIVS = sparklineMetricId('defeated-civs')
export const SPARKLINE_DETONATIONS = sparklineMetricId('detonations-window')

// Display metadata for each canonical metric. TelemetryRack reads this so the sparkline cycle
// renders meaningful labels + tinted SVG strokes per metric instead of generic "graph 1".
export interface SparklineDisplayMeta {
  readonly label: string
  readonly emoji: string
  readonly color: string
  readonly suffix?: string
}

export const SPARKLINE_DISPLAY: ReadonlyMap<SparklineMetricId, SparklineDisplayMeta> = new Map([
  [SPARKLINE_RESOURCE_TOTAL, { label: 'Resource total', emoji: '📦', color: '#d4a13a' }],
  [SPARKLINE_POPULATION, { label: 'Population', emoji: '👥', color: '#86efac' }],
  [SPARKLINE_TECH_POINTS, { label: 'Tech points', emoji: '🥼', color: '#c4b5fd' }],
  [SPARKLINE_ACTIVE_FLIGHTS, { label: 'Active flights', emoji: '🚀', color: '#fbc4c4' }],
  [
    SPARKLINE_MINING_CARGO_PCT,
    { label: 'Mining cargo', emoji: '⛏️', color: '#fcd34d', suffix: '%' },
  ],
  [SPARKLINE_FOOD, { label: 'Food stock', emoji: '🌾', color: '#86efac' }],
  [SPARKLINE_FUEL, { label: 'Fuel stock', emoji: '⛽', color: '#fb923c' }],
  [SPARKLINE_INGOTS, { label: 'Ingots stock', emoji: '🔩', color: '#94a3b8' }],
  [SPARKLINE_COMPONENTS, { label: 'Components', emoji: '⚙️', color: '#a78bfa' }],
  [SPARKLINE_OWNED_PLANETS, { label: 'Owned planets', emoji: '🪐', color: '#60a5fa' }],
  [SPARKLINE_DEFEATED_CIVS, { label: 'Defeated civs', emoji: '💀', color: '#f87171' }],
  [SPARKLINE_DETONATIONS, { label: 'Detonations (rolling)', emoji: '💥', color: '#fde047' }],
])

// Canonical cycle order. TelemetryRack uses this for round-robin display.
export const SPARKLINE_CYCLE_ORDER: ReadonlyArray<SparklineMetricId> = [
  SPARKLINE_RESOURCE_TOTAL,
  SPARKLINE_POPULATION,
  SPARKLINE_TECH_POINTS,
  SPARKLINE_ACTIVE_FLIGHTS,
  SPARKLINE_MINING_CARGO_PCT,
  SPARKLINE_FOOD,
  SPARKLINE_FUEL,
  SPARKLINE_INGOTS,
  SPARKLINE_COMPONENTS,
  SPARKLINE_OWNED_PLANETS,
  SPARKLINE_DEFEATED_CIVS,
  SPARKLINE_DETONATIONS,
]

export interface SparklineBuffer {
  readonly metricId: SparklineMetricId
  readonly capacity: number
  // Fixed-length array of values. writeIdx is the next slot to write to. count tracks how many
  // samples have been written (capped at capacity once the buffer fills).
  samples: Array<number>
  writeIdx: number
  count: number
}

export function newSparklineBuffer(
  metricId: SparklineMetricId,
  capacity: number = SPARKLINE_BUFFER_SIZE,
): SparklineBuffer {
  return {
    metricId,
    capacity,
    samples: new Array<number>(capacity).fill(0),
    writeIdx: 0,
    count: 0,
  }
}

export function recordSparklineSample(buffer: SparklineBuffer, value: number): void {
  buffer.samples[buffer.writeIdx] = value
  buffer.writeIdx = (buffer.writeIdx + 1) % buffer.capacity
  if (buffer.count < buffer.capacity) buffer.count += 1
}

// Returns samples in chronological order (oldest first). If the buffer hasn't filled yet,
// returns only the recorded prefix.
export function getSparklineSamples(buffer: SparklineBuffer): ReadonlyArray<number> {
  if (buffer.count === 0) return []
  if (buffer.count < buffer.capacity) {
    return buffer.samples.slice(0, buffer.count)
  }
  // Buffer is full — chronological order = [writeIdx..end] ++ [0..writeIdx-1].
  const tail = buffer.samples.slice(buffer.writeIdx)
  const head = buffer.samples.slice(0, buffer.writeIdx)
  return [...tail, ...head]
}

export interface SparklineStats {
  readonly current: number
  readonly min: number
  readonly max: number
  readonly mean: number
  readonly trend: 'up' | 'down' | 'flat'
}

export function sparklineStats(buffer: SparklineBuffer): SparklineStats {
  const samples = getSparklineSamples(buffer)
  if (samples.length === 0) {
    return { current: 0, min: 0, max: 0, mean: 0, trend: 'flat' }
  }
  let min = samples[0]!
  let max = samples[0]!
  let sum = 0
  for (const v of samples) {
    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }
  const mean = sum / samples.length
  const current = samples[samples.length - 1]!
  // Trend: compare last sample to median-of-window-front (oldest quarter). Eliminates noise
  // from single-tick spikes.
  const frontQuartileIdx = Math.max(0, Math.floor(samples.length / 4) - 1)
  const front = samples[frontQuartileIdx]!
  let trend: SparklineStats['trend']
  const delta = current - front
  const rel = max - min > 0 ? Math.abs(delta) / (max - min) : 0
  if (rel < 0.05) trend = 'flat'
  else if (delta > 0) trend = 'up'
  else trend = 'down'
  return { current, min, max, mean, trend }
}

// Convenience: build the canonical full sparkline map for a fresh match. Caller drops this on
// MatchState at creation.
export function newCanonicalSparklineMap(): Map<SparklineMetricId, SparklineBuffer> {
  const map = new Map<SparklineMetricId, SparklineBuffer>()
  for (const id of SPARKLINE_CYCLE_ORDER) {
    map.set(id, newSparklineBuffer(id))
  }
  return map
}
