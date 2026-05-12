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
  readonly clickableStates?: ReadonlyArray<TechRenderState>
  readonly selectedTechId?: TechNode['id'] | null
}

const TIERS: ReadonlyArray<TechTier> = [0, 1, 2, 3, 4]
// PHASE 17.L.D.10 (HOTFIX 2026-05-11) — was ['researchable']. Per user verbatim *"AND THE
// IN GAME TECH PANEL IS NOT SHOWING THE TOOL TIPS OR SHOWING SUB RESEARCH CORRECTLY WEHEN
// CLICKING ON AN ITEM"*. Old behavior disabled every chip except actively-researchable
// ones, so the player couldn't click a future tech to inspect its prereqs / unlocks /
// description. Now every visible state is clickable for INSPECTION (the start-research
// gate stays separate — only researchable chips show "Start research" in the detail
// panel; others are read-only info).
const DEFAULT_CLICKABLE_STATES: ReadonlyArray<TechRenderState> = [
  'researched',
  'researchable',
  'hinted',
  'visible',
]

export function TechTreePanel({
  empire,
  onSelectTech,
  clickableStates = DEFAULT_CLICKABLE_STATES,
  selectedTechId = null,
}: TechTreePanelProps) {
  // HOTFIX 17.L.D.14 — selection state is now OWNED BY PARENT. The embedded detail sidebar
  // moved to its own movable TechDetailPanel (per user verbatim "needs to be its own panel
  // along side pully movable like all panels shall be"). TechTreePanel just emits clicks
  // and renders the chips.
  const visibility = describeVisibleTree(empire)
  const researchable = new Set(getResearchableTechs(empire).map((n) => n.id))
  const knownIds = new Set(visibility.knownNodes.map((n) => n.id))
  const hintedIds = new Set(visibility.hintedNodes.map((n) => n.id))
  const clickableSet = new Set(clickableStates)

  const handleSelect = (id: TechNode['id']): void => {
    onSelectTech?.(id)
  }

  return (
    <section className="tech-tree-panel" aria-label="Tech tree">
      <header className="tech-tree-panel__header">
        <h2>🧬 Tech Tree</h2>
        <span className="tech-tree-panel__counts">
          <strong>{TECH_NODES.length}</strong> total ·{' '}
          <strong>{visibility.knownNodes.length}</strong> visible
          {visibility.hiddenForbiddenCount > 0 ? (
            <>
              {' '}
              · <strong>{visibility.hiddenForbiddenCount}</strong> forbidden hidden
            </>
          ) : null}
        </span>
      </header>

      <p className="tech-tree-panel__hint">
        Click any tech to inspect — full description, prerequisites, and unlocks open in the
        separate Tech Detail panel (movable / resizable like every other panel).
      </p>

      <div className="tech-tree-panel__tiers">
        {TIERS.map((tier) => (
          <div key={tier} className="tech-tree-panel__tier-column">
            <h3 className="tech-tree-panel__tier-heading">Tier {tier}</h3>
            <ul className="tech-tree-panel__tier-list">
              {TECH_NODES.filter((n) => n.tier === tier).map((node) => {
                const state = getTechState(node, empire, knownIds, hintedIds, researchable)
                return (
                  <TechNodeChip
                    key={node.id}
                    node={node}
                    state={state}
                    active={empire.activeResearchTechId === node.id}
                    selected={selectedTechId === node.id}
                    clickable={clickableSet.has(state)}
                    progress={
                      node.costPoints > 0
                        ? (empire.researchProgress.get(node.id) ?? 0) / node.costPoints
                        : 0
                    }
                    onClick={() => handleSelect(node.id)}
                  />
                )
              })}
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
  readonly selected: boolean
  readonly clickable: boolean
  readonly progress: number
  readonly onClick: () => void
}

function TechNodeChip({
  node,
  state,
  active,
  selected,
  clickable,
  progress,
  onClick,
}: TechNodeChipProps) {
  const className = `tech-tree-panel__chip tech-tree-panel__chip--${state}${active ? ' tech-tree-panel__chip--active' : ''}${selected ? ' tech-tree-panel__chip--selected' : ''}`
  const display = state === 'hidden' ? '???' : `${node.emoji} ${node.name}`
  const visibilityClass = `tech-tree-panel__chip-vis tech-tree-panel__chip-vis--${node.visibility}`
  return (
    <li>
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={!clickable}
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
