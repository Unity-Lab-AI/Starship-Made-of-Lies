import { useMemo } from 'react'
import { type SparklineBuffer, getSparklineSamples, sparklineStats } from '@smol/shared'

// PHASE 16.35 — UMS-faithful sparkline component for LCD slot 6 GRAPHS cycle. Renders an
// SVG polyline of the rolling-window samples + min/max labels + current value + trend arrow.
// Stays compact (defaults to 32px height) so it fits inside a single LCD-rack cell. Caller
// supplies the buffer + display metadata (label/emoji/color/suffix).
//
// Visual style mirrors UMS pad LCD6 12-graph cycle:
// - Tinted polyline stroke
// - Min/max value labels at the right edge
// - Current sample at the top-right
// - Trend arrow (↑ / ↓ / →) prefix

export interface SparklineProps {
  readonly buffer: SparklineBuffer
  readonly label: string
  readonly emoji: string
  readonly color: string
  readonly suffix?: string
  readonly width?: number
  readonly height?: number
}

function formatValue(value: number, suffix?: string): string {
  // Use compact notation for large numbers (1.2k, 3.4M, etc.) to keep LCD label tidy.
  const abs = Math.abs(value)
  let formatted: string
  if (abs >= 1_000_000) formatted = `${(value / 1_000_000).toFixed(1)}M`
  else if (abs >= 1_000) formatted = `${(value / 1_000).toFixed(1)}k`
  else if (Number.isInteger(value)) formatted = value.toString()
  else formatted = value.toFixed(1)
  return suffix ? `${formatted}${suffix}` : formatted
}

function trendGlyph(trend: 'up' | 'down' | 'flat'): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

export function Sparkline({
  buffer,
  label,
  emoji,
  color,
  suffix,
  width = 220,
  height = 36,
}: SparklineProps) {
  const samples = useMemo(() => getSparklineSamples(buffer), [buffer])
  const stats = useMemo(() => sparklineStats(buffer), [buffer])

  // Build polyline points. If the buffer is empty, render an empty area so the slot doesn't
  // jump as samples accumulate.
  const points = useMemo(() => {
    if (samples.length === 0) return ''
    const range = stats.max - stats.min
    const span = range > 0 ? range : 1
    return samples
      .map((v, i) => {
        const x = (i / Math.max(1, samples.length - 1)) * width
        const y = height - ((v - stats.min) / span) * (height - 4) - 2
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [samples, stats, width, height])

  return (
    <div className="sparkline">
      <div className="sparkline__header">
        <span className="sparkline__label">
          {emoji} {label}
        </span>
        <span className="sparkline__value" style={{ color }}>
          {trendGlyph(stats.trend)} {formatValue(stats.current, suffix)}
        </span>
      </div>
      <svg
        className="sparkline__chart"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {samples.length > 1 ? (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : (
          <text
            x={width / 2}
            y={height / 2 + 4}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="9"
            fontStyle="italic"
          >
            collecting samples…
          </text>
        )}
      </svg>
      <div className="sparkline__footer">
        <span className="sparkline__minmax">
          min {formatValue(stats.min, suffix)} · max {formatValue(stats.max, suffix)}
        </span>
      </div>
    </div>
  )
}
