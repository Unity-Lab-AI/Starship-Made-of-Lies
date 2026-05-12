import { useMemo, useState } from 'react'
import {
  describeVisibleTree,
  type Empire,
  getResearchableTechs,
  getTechNode,
  TECH_NODES,
  type TechId,
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
  // PHASE 17.L.D.10 (HOTFIX 2026-05-11) — local selection state for the inspection sidebar.
  // External `selectedTechId` prop still wins when supplied. When not, panel manages its
  // own selection so clicking a tech in the tree opens its detail sidebar.
  const [localSelectedId, setLocalSelectedId] = useState<TechNode['id'] | null>(null)
  const effectiveSelectedId = selectedTechId ?? localSelectedId

  const visibility = describeVisibleTree(empire)
  const researchable = new Set(getResearchableTechs(empire).map((n) => n.id))
  const knownIds = new Set(visibility.knownNodes.map((n) => n.id))
  const hintedIds = new Set(visibility.hintedNodes.map((n) => n.id))
  const clickableSet = new Set(clickableStates)

  // PHASE 17.L.D.10 — reverse-prerequisite index so the detail panel can list "Unlocks"
  // (the downstream techs that have THIS tech as a prerequisite). Built once per render.
  const unlocksByTechId = useMemo(() => {
    const out = new Map<TechId, TechId[]>()
    for (const node of TECH_NODES) {
      for (const prereqId of node.prerequisites) {
        const arr = out.get(prereqId) ?? []
        arr.push(node.id)
        out.set(prereqId, arr)
      }
    }
    return out
  }, [])

  const handleSelect = (id: TechNode['id']): void => {
    setLocalSelectedId(id)
    onSelectTech?.(id)
  }

  const selectedNode =
    effectiveSelectedId !== null ? TECH_NODES.find((n) => n.id === effectiveSelectedId) : null

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

      <div className="tech-tree-panel__body">
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
                      selected={effectiveSelectedId === node.id}
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

        {/* PHASE 17.L.D.10 (HOTFIX 2026-05-11) — selected-tech detail sidebar. Surfaces
            full description + prerequisites (with status badges) + unlocks (downstream
            techs gated by this one) + cost + tier + category + visibility. Replaces the
            unreliable browser-native title-attribute tooltips. */}
        {selectedNode ? (
          <aside className="tech-tree-panel__detail" aria-label="Selected tech details">
            <header className="tech-tree-panel__detail-header">
              <span className="tech-tree-panel__detail-emoji">{selectedNode.emoji}</span>
              <h3 className="tech-tree-panel__detail-name">{selectedNode.name}</h3>
              <span className="tech-tree-panel__detail-badge">Tier {selectedNode.tier}</span>
            </header>
            <p className="tech-tree-panel__detail-desc">{selectedNode.description}</p>
            <dl className="tech-tree-panel__detail-stats">
              <div>
                <dt>Visibility</dt>
                <dd>{selectedNode.visibility}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{selectedNode.category}</dd>
              </div>
              <div>
                <dt>Cost</dt>
                <dd>{selectedNode.costPoints} research points</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  {empire.researchedTechs.has(selectedNode.id)
                    ? '✅ Researched'
                    : researchable.has(selectedNode.id)
                      ? '🟢 Researchable now'
                      : hintedIds.has(selectedNode.id)
                        ? '👀 Hinted'
                        : knownIds.has(selectedNode.id)
                          ? '🔒 Locked (prereqs needed)'
                          : '❓ Forbidden'}
                </dd>
              </div>
            </dl>

            <section className="tech-tree-panel__detail-section">
              <h4>Prerequisites ({selectedNode.prerequisites.length})</h4>
              {selectedNode.prerequisites.length === 0 ? (
                <p className="tech-tree-panel__detail-empty">
                  None — research available immediately.
                </p>
              ) : (
                <ul className="tech-tree-panel__detail-list">
                  {selectedNode.prerequisites.map((pid) => {
                    const pnode = getTechNode(pid)
                    const isDone = empire.researchedTechs.has(pid)
                    return (
                      <li
                        key={String(pid)}
                        className={
                          isDone
                            ? 'tech-tree-panel__detail-list-item tech-tree-panel__detail-list-item--ok'
                            : 'tech-tree-panel__detail-list-item tech-tree-panel__detail-list-item--missing'
                        }
                      >
                        <button
                          type="button"
                          className="tech-tree-panel__detail-link"
                          onClick={() => handleSelect(pnode.id)}
                          title={pnode.description}
                        >
                          {isDone ? '✅' : '⏳'} {pnode.emoji} {pnode.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className="tech-tree-panel__detail-section">
              <h4>Unlocks ({(unlocksByTechId.get(selectedNode.id) ?? []).length})</h4>
              {(unlocksByTechId.get(selectedNode.id) ?? []).length === 0 ? (
                <p className="tech-tree-panel__detail-empty">
                  This tech is a leaf — no downstream techs depend on it.
                </p>
              ) : (
                <ul className="tech-tree-panel__detail-list">
                  {(unlocksByTechId.get(selectedNode.id) ?? []).map((uid) => {
                    const unode = getTechNode(uid)
                    return (
                      <li key={String(uid)} className="tech-tree-panel__detail-list-item">
                        <button
                          type="button"
                          className="tech-tree-panel__detail-link"
                          onClick={() => handleSelect(unode.id)}
                          title={unode.description}
                        >
                          ➡ {unode.emoji} {unode.name} (Tier {unode.tier})
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </aside>
        ) : (
          <aside className="tech-tree-panel__detail tech-tree-panel__detail--empty">
            <p>Click any tech to view its full description, prerequisites, and unlocks.</p>
          </aside>
        )}
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
