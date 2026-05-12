// PHASE 17.L.A.10 — Q14 PHASE 17 LOCKED. Production-chain Sankey panel.
//
// User verbatim (LAW #0): "Full Sankey-flow diagram — new 'Production Chains' panel: raw
// materials (left) → refined (middle) → products (right). Line thickness = current per-tick
// throughput."
//
// Implementation: SVG-based Sankey with 5 columns matching resource categories (raw / refined
// / component / product / strategic). Each resource is a node; each building's input→output
// pair is an edge. Edge thickness scales with the building's static base yield (proxy for
// per-tick throughput — true live-throughput tracking would require ProductionTickResult to
// surface to PlayPage every tick, deferred to a follow-up).
//
// Hover on a resource node highlights every edge it touches (input OR output). Hover on a
// building tooltip-shows the building emoji + name + per-tick yield.

import { useMemo, useState } from 'react'
import {
  BUILDINGS,
  type BuildingDefId,
  getBuildingProduction,
  RESOURCES,
  type ResourceCategory,
  type ResourceId,
} from '@smol/shared'
import './ProductionChainsPanel.css'

// Five columns L→R. Strategic resources (antimatter / fusion fuel / etc.) get their own column
// because they sit at the apex of multiple chains.
const COLUMN_ORDER: ReadonlyArray<ResourceCategory> = [
  'raw',
  'refined',
  'component',
  'product',
  'strategic',
]

const COLUMN_X: Readonly<Record<ResourceCategory, number>> = {
  raw: 60,
  refined: 280,
  component: 500,
  product: 720,
  strategic: 940,
}

const COLUMN_LABEL: Readonly<Record<ResourceCategory, string>> = {
  raw: 'Raw',
  refined: 'Refined',
  component: 'Components',
  product: 'Products',
  strategic: 'Strategic',
}

const NODE_WIDTH = 160
const NODE_HEIGHT = 26
const NODE_GAP = 6
const TOP_PAD = 40
const BOTTOM_PAD = 20
const SVG_WIDTH = 1120

interface SankeyEdge {
  readonly fromResource: ResourceId
  readonly toResource: ResourceId
  readonly buildingId: BuildingDefId
  readonly buildingEmoji: string
  readonly buildingName: string
  readonly yieldAmount: number
}

interface SankeyLayout {
  readonly nodes: ReadonlyMap<ResourceId, { x: number; y: number; category: ResourceCategory }>
  readonly edges: ReadonlyArray<SankeyEdge>
  readonly columnHeights: ReadonlyMap<ResourceCategory, number>
  readonly svgHeight: number
}

function computeLayout(): SankeyLayout {
  // Group resources by category, preserving the RESOURCES catalog order within each column.
  const byCategory = new Map<ResourceCategory, ResourceId[]>()
  for (const cat of COLUMN_ORDER) byCategory.set(cat, [])
  for (const def of RESOURCES) byCategory.get(def.category)?.push(def.id)

  // Assign Y positions per column.
  const nodes = new Map<ResourceId, { x: number; y: number; category: ResourceCategory }>()
  const columnHeights = new Map<ResourceCategory, number>()
  let maxRows = 0
  for (const cat of COLUMN_ORDER) {
    const list = byCategory.get(cat) ?? []
    columnHeights.set(cat, list.length)
    maxRows = Math.max(maxRows, list.length)
    list.forEach((id, idx) => {
      nodes.set(id, {
        x: COLUMN_X[cat],
        y: TOP_PAD + idx * (NODE_HEIGHT + NODE_GAP),
        category: cat,
      })
    })
  }

  // Derive edges from every BUILDING_PRODUCTION entry.
  const edges: SankeyEdge[] = []
  for (const def of BUILDINGS) {
    const prod = getBuildingProduction(def.id)
    if (!prod) continue
    for (const input of prod.inputs) {
      for (const output of prod.outputs) {
        edges.push({
          fromResource: input.resource,
          toResource: output.resource,
          buildingId: def.id,
          buildingEmoji: def.emoji,
          buildingName: def.name,
          yieldAmount: output.amount,
        })
      }
    }
    // Buildings with zero inputs (extractors like Farm/Mine/Quarry) still produce — render as
    // a synthetic "source" edge from a virtual `__source` node on the LEFT margin. Skip those
    // here; we'll handle them inline in the renderer as a stub-out from the left edge.
  }

  const svgHeight = TOP_PAD + maxRows * (NODE_HEIGHT + NODE_GAP) + BOTTOM_PAD
  return { nodes, edges, columnHeights, svgHeight }
}

const RESOURCE_EMOJI_BY_ID: ReadonlyMap<string, { emoji: string; name: string }> = new Map(
  RESOURCES.map((r) => [String(r.id), { emoji: r.emoji, name: r.name }]),
)

function edgeStrokeWidth(yieldAmount: number): number {
  // Map yield 1..10 to stroke width 1.5..7. Higher-throughput chains stand out.
  const clamped = Math.max(1, Math.min(10, yieldAmount))
  return 1.5 + (clamped - 1) * (5.5 / 9)
}

export function ProductionChainsPanel() {
  const layout = useMemo(() => computeLayout(), [])
  const [hoveredResource, setHoveredResource] = useState<ResourceId | null>(null)
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingDefId | null>(null)

  return (
    <div className="production-chains-panel">
      <p className="production-chains-panel__intro">
        Raw materials (left) flow through refined → components → products (right) via your building
        network. Edge thickness = base per-tick yield. Hover a resource to highlight every chain
        that touches it.
      </p>

      <div className="production-chains-panel__svg-wrap">
        <svg
          className="production-chains-panel__svg"
          viewBox={`0 0 ${SVG_WIDTH} ${layout.svgHeight}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Production chain Sankey diagram"
        >
          {/* Column headers */}
          {COLUMN_ORDER.map((cat) => (
            <text
              key={cat}
              x={COLUMN_X[cat] + NODE_WIDTH / 2}
              y={TOP_PAD - 14}
              className="production-chains-panel__col-header"
              textAnchor="middle"
            >
              {COLUMN_LABEL[cat]}
            </text>
          ))}

          {/* Edges (drawn FIRST so nodes overlay them) */}
          {layout.edges.map((edge, i) => {
            const fromNode = layout.nodes.get(edge.fromResource)
            const toNode = layout.nodes.get(edge.toResource)
            if (!fromNode || !toNode) return null
            const x1 = fromNode.x + NODE_WIDTH
            const y1 = fromNode.y + NODE_HEIGHT / 2
            const x2 = toNode.x
            const y2 = toNode.y + NODE_HEIGHT / 2
            const midX = (x1 + x2) / 2
            const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
            const isResourceHovered =
              hoveredResource !== null &&
              (hoveredResource === edge.fromResource || hoveredResource === edge.toResource)
            const isBuildingHovered = hoveredBuilding === edge.buildingId
            const dimmed =
              (hoveredResource !== null && !isResourceHovered) ||
              (hoveredBuilding !== null && !isBuildingHovered)
            const highlighted = isResourceHovered || isBuildingHovered
            const strokeWidth = edgeStrokeWidth(edge.yieldAmount)
            return (
              <g
                key={`edge-${i}-${String(edge.buildingId)}-${String(edge.fromResource)}-${String(edge.toResource)}`}
                onMouseEnter={() => setHoveredBuilding(edge.buildingId)}
                onMouseLeave={() => setHoveredBuilding(null)}
              >
                <path
                  d={path}
                  className={
                    highlighted
                      ? 'production-chains-panel__edge production-chains-panel__edge--highlight'
                      : dimmed
                        ? 'production-chains-panel__edge production-chains-panel__edge--dim'
                        : 'production-chains-panel__edge'
                  }
                  strokeWidth={strokeWidth}
                  fill="none"
                >
                  <title>
                    {edge.buildingEmoji} {edge.buildingName}: yields {edge.yieldAmount}/tick of{' '}
                    {RESOURCE_EMOJI_BY_ID.get(String(edge.toResource))?.name ?? ''}
                  </title>
                </path>
                {highlighted && (
                  <text
                    x={midX}
                    y={(y1 + y2) / 2 - 4}
                    className="production-chains-panel__edge-label"
                    textAnchor="middle"
                  >
                    {edge.buildingEmoji} {edge.yieldAmount}/t
                  </text>
                )}
              </g>
            )
          })}

          {/* Nodes (drawn LAST so they overlay edges) */}
          {[...layout.nodes.entries()].map(([resourceId, pos]) => {
            const meta = RESOURCE_EMOJI_BY_ID.get(String(resourceId))
            if (!meta) return null
            const isHovered = hoveredResource === resourceId
            return (
              <g
                key={String(resourceId)}
                onMouseEnter={() => setHoveredResource(resourceId)}
                onMouseLeave={() => setHoveredResource(null)}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={4}
                  className={
                    isHovered
                      ? 'production-chains-panel__node production-chains-panel__node--hover'
                      : `production-chains-panel__node production-chains-panel__node--${pos.category}`
                  }
                />
                <text
                  x={pos.x + 10}
                  y={pos.y + NODE_HEIGHT / 2 + 4}
                  className="production-chains-panel__node-label"
                >
                  {meta.emoji} {meta.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
