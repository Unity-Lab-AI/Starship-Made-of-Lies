import { useMemo } from 'react'
import {
  type ProductionHistory,
  type ResourceId,
  buildResourceSeries,
  getResourceDef,
  listObservedResources,
  maxAbsValueInSeries,
  readChronological,
} from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import './ProductionGraphPanel.css'

interface ProductionGraphPanelProps {
  readonly history: ProductionHistory
  readonly title?: string
}

export function ProductionGraphPanel({ history, title }: ProductionGraphPanelProps) {
  const resources = useMemo(() => listObservedResources(history), [history])
  const samples = useMemo(() => readChronological(history), [history])
  const tickRange = samples.length > 0 ? `T-${samples.length} → T-0` : '— no samples —'
  return (
    <LCDFrame
      title={title ?? '📈 Production Graph'}
      statusGlyph="◇"
      statusLabel={tickRange}
      variant="green"
    >
      <div className="prod-graph">
        {resources.length === 0 ? (
          <p className="prod-graph__empty">No production samples recorded yet.</p>
        ) : (
          <ul className="prod-graph__list">
            {resources.map((resourceId) => (
              <ResourceRow key={resourceId} resourceId={resourceId} history={history} />
            ))}
          </ul>
        )}
      </div>
    </LCDFrame>
  )
}

interface ResourceRowProps {
  readonly resourceId: ResourceId
  readonly history: ProductionHistory
}

function ResourceRow({ resourceId, history }: ResourceRowProps) {
  const series = buildResourceSeries(history, resourceId)
  const peak = Math.max(1, maxAbsValueInSeries(series))
  const def = getResourceDef(resourceId)
  const width = 120
  const height = 24
  const xStep = series.netPerTick.length > 1 ? width / (series.netPerTick.length - 1) : width
  const points = series.netPerTick.map((v, i) => {
    const x = i * xStep
    const yMid = height / 2
    const y = yMid - (v / peak) * (height / 2 - 1)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const lastNet = series.netPerTick[series.netPerTick.length - 1] ?? 0
  const lastSign = lastNet > 0 ? '+' : ''
  return (
    <li className="prod-graph__row">
      <span className="prod-graph__label">
        {def.emoji} {def.name}
      </span>
      <svg
        className="prod-graph__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${def.name} net production over time`}
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        {points.length > 1 && (
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="var(--lcd-glow, #d4a13a)"
            strokeWidth="1.2"
          />
        )}
      </svg>
      <span className={`prod-graph__net prod-graph__net--${lastNet >= 0 ? 'pos' : 'neg'}`}>
        {lastSign}
        {lastNet}
      </span>
    </li>
  )
}
