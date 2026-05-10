import { useState } from 'react'
import {
  type BiomeDef,
  canPlaceBuildingOnTile,
  type BuildingDefId,
  type Tile,
  type TechId,
} from '@smol/shared'
import './TilePlacementGrid.css'

interface TilePlacementGridProps {
  readonly tiles: ReadonlyArray<Tile>
  readonly biome: BiomeDef
  readonly civResearchedTechs: ReadonlySet<TechId>
  readonly selectedBuildingDefId: BuildingDefId | null
  readonly onTileClick?: (tile: Tile) => void
}

const HEX_RADIUS = 24

export function TilePlacementGrid({
  tiles,
  biome,
  civResearchedTechs,
  selectedBuildingDefId,
  onTileClick,
}: TilePlacementGridProps) {
  const [hoverTileId, setHoverTileId] = useState<string | null>(null)

  const layout = computeLayout(tiles)
  return (
    <section className="tile-grid-panel" aria-label="Planet tile grid">
      <header className="tile-grid-panel__header">
        <h2>
          {biome.emoji} {biome.name}{' '}
          <span className="tile-grid-panel__count">{tiles.length} tiles</span>
        </h2>
      </header>
      <svg
        className="tile-grid-panel__svg"
        role="img"
        aria-label="Top-down hex tile grid"
        viewBox={`${layout.minX} ${layout.minY} ${layout.width} ${layout.height}`}
      >
        {tiles.map((tile) => {
          const { cx, cy } = axialToPixel(tile.q, tile.r)
          const placement =
            selectedBuildingDefId !== null
              ? canPlaceBuildingOnTile({
                  tile,
                  biome,
                  buildingDefId: selectedBuildingDefId,
                  civResearchedTechs,
                })
              : null
          const fillClass = computeFillClass(tile, placement?.canPlace, hoverTileId === tile.id)
          return (
            <g
              key={tile.id}
              className={`tile-grid-panel__tile ${fillClass}`}
              onMouseEnter={() => setHoverTileId(tile.id)}
              onMouseLeave={() => setHoverTileId((h) => (h === tile.id ? null : h))}
              onClick={() => onTileClick?.(tile)}
            >
              <polygon points={hexPoints(cx, cy)} />
              <text x={cx} y={cy + 5} textAnchor="middle" className="tile-grid-panel__tile-label">
                {tileLabel(tile)}
              </text>
            </g>
          )
        })}
      </svg>
      {hoverTileId !== null && selectedBuildingDefId !== null ? (
        <PlacementHint
          tiles={tiles}
          tileId={hoverTileId}
          biome={biome}
          buildingDefId={selectedBuildingDefId}
          civResearchedTechs={civResearchedTechs}
        />
      ) : null}
    </section>
  )
}

interface PlacementHintProps {
  readonly tiles: ReadonlyArray<Tile>
  readonly tileId: string
  readonly biome: BiomeDef
  readonly buildingDefId: BuildingDefId
  readonly civResearchedTechs: ReadonlySet<TechId>
}

function PlacementHint({
  tiles,
  tileId,
  biome,
  buildingDefId,
  civResearchedTechs,
}: PlacementHintProps) {
  const tile = tiles.find((t) => t.id === tileId)
  if (!tile) return null
  const result = canPlaceBuildingOnTile({ tile, biome, buildingDefId, civResearchedTechs })
  return (
    <div
      className={`tile-grid-panel__hint ${result.canPlace ? 'tile-grid-panel__hint--ok' : 'tile-grid-panel__hint--bad'}`}
    >
      {result.canPlace ? 'Placement OK' : (result.detail ?? 'Cannot place here')}
    </div>
  )
}

function axialToPixel(q: number, r: number): { cx: number; cy: number } {
  const cx = HEX_RADIUS * Math.sqrt(3) * (q + r / 2)
  const cy = HEX_RADIUS * 1.5 * r
  return { cx, cy }
}

function hexPoints(cx: number, cy: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    const x = cx + HEX_RADIUS * Math.cos(angle)
    const y = cy + HEX_RADIUS * Math.sin(angle)
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return points.join(' ')
}

function tileLabel(tile: Tile): string {
  switch (tile.occupancy) {
    case 'building':
      return '🏛'
    case 'launchPad':
      return '🚀'
    case 'mine':
      return '⛏'
    case 'mineField':
      return '💣'
    case 'counterMissilePad':
      return '🛡'
    default:
      return ''
  }
}

function computeFillClass(tile: Tile, placeable: boolean | undefined, hovered: boolean): string {
  const parts: string[] = []
  if (tile.occupancy !== 'empty') parts.push('tile-grid-panel__tile--occupied')
  if (placeable === true) parts.push('tile-grid-panel__tile--placeable')
  if (placeable === false) parts.push('tile-grid-panel__tile--blocked')
  if (hovered) parts.push('tile-grid-panel__tile--hover')
  return parts.join(' ')
}

function computeLayout(tiles: ReadonlyArray<Tile>): {
  minX: number
  minY: number
  width: number
  height: number
} {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const tile of tiles) {
    const { cx, cy } = axialToPixel(tile.q, tile.r)
    if (cx - HEX_RADIUS < minX) minX = cx - HEX_RADIUS
    if (cy - HEX_RADIUS < minY) minY = cy - HEX_RADIUS
    if (cx + HEX_RADIUS > maxX) maxX = cx + HEX_RADIUS
    if (cy + HEX_RADIUS > maxY) maxY = cy + HEX_RADIUS
  }
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, width: 100, height: 100 }
  }
  return { minX, minY, width: maxX - minX, height: maxY - minY }
}
