import {
  describeVisibleTree,
  type Empire,
  getResearchableTechs,
  TECH_NODES,
  type TechNode,
  type TechTier,
} from '@smol/shared'
import './TechTreePanel.css'

interface TechTreePanelProps {
  readonly empire: Empire
  readonly onSelectTech?: (techId: TechNode['id']) => void
}

const TIERS: ReadonlyArray<TechTier> = [0, 1, 2, 3, 4]

export function TechTreePanel({ empire, onSelectTech }: TechTreePanelProps) {
  const visibility = describeVisibleTree(empire)
  const researchable = new Set(getResearchableTechs(empire).map((n) => n.id))
  const knownIds = new Set(visibility.knownNodes.map((n) => n.id))
  const hintedIds = new Set(visibility.hintedNodes.map((n) => n.id))

  return (
    <section className="tech-tree-panel" aria-label="Tech tree">
      <header className="tech-tree-panel__header">
        <h2>🧬 Tech Tree</h2>
        <span className="tech-tree-panel__hidden-count">
          {visibility.hiddenForbiddenCount > 0
            ? `${visibility.hiddenForbiddenCount} forbidden tech${visibility.hiddenForbiddenCount === 1 ? '' : 's'} hidden`
            : null}
        </span>
      </header>

      <div className="tech-tree-panel__tiers">
        {TIERS.map((tier) => (
          <div key={tier} className="tech-tree-panel__tier-column">
            <h3 className="tech-tree-panel__tier-heading">Tier {tier}</h3>
            <ul className="tech-tree-panel__tier-list">
              {TECH_NODES.filter((n) => n.tier === tier).map((node) => (
                <TechNodeChip
                  key={node.id}
                  node={node}
                  state={getTechState(node, empire, knownIds, hintedIds, researchable)}
                  active={empire.activeResearchTechId === node.id}
                  progress={
                    node.costPoints > 0
                      ? (empire.researchProgress.get(node.id) ?? 0) / node.costPoints
                      : 0
                  }
                  onClick={() => onSelectTech?.(node.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

type TechRenderState = 'researched' | 'researchable' | 'hinted' | 'visible' | 'hidden'

function getTechState(
  node: TechNode,
  empire: Empire,
  known: ReadonlySet<TechNode['id']>,
  hinted: ReadonlySet<TechNode['id']>,
  researchable: ReadonlySet<TechNode['id']>,
): TechRenderState {
  if (empire.researchedTechs.has(node.id)) return 'researched'
  if (researchable.has(node.id)) return 'researchable'
  if (hinted.has(node.id)) return 'hinted'
  if (known.has(node.id)) return 'visible'
  return 'hidden'
}

interface TechNodeChipProps {
  readonly node: TechNode
  readonly state: TechRenderState
  readonly active: boolean
  readonly progress: number
  readonly onClick: () => void
}

function TechNodeChip({ node, state, active, progress, onClick }: TechNodeChipProps) {
  const className = `tech-tree-panel__chip tech-tree-panel__chip--${state}${active ? ' tech-tree-panel__chip--active' : ''}`
  const isClickable = state === 'researchable'
  const display = state === 'hidden' ? '???' : `${node.emoji} ${node.name}`
  const visibilityClass = `tech-tree-panel__chip-vis tech-tree-panel__chip-vis--${node.visibility}`
  return (
    <li>
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={!isClickable}
        title={state === 'hidden' ? 'Forbidden tech — conditions not met' : node.description}
      >
        <span className={visibilityClass}>{node.visibility[0]?.toUpperCase()}</span>
        <span className="tech-tree-panel__chip-name">{display}</span>
        {state === 'researched' ? <span className="tech-tree-panel__chip-status">✓</span> : null}
        {active && progress > 0 ? (
          <span
            className="tech-tree-panel__chip-progress"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        ) : null}
      </button>
    </li>
  )
}
