import { useEffect, useState } from 'react'
import {
  type KeybindAction,
  type KeybindActionId,
  type KeybindMap,
  KEYBIND_ACTIONS,
  buildDefaultKeybindMap,
  rebindAction,
  saveKeybindMap,
} from '../../settings/keybindings'
import { LCDFrame } from './LCDFrame'
import './KeybindingsPanel.css'

interface KeybindingsPanelProps {
  readonly initial: KeybindMap
}

export function KeybindingsPanel({ initial }: KeybindingsPanelProps) {
  const [map, setMap] = useState<KeybindMap>(initial)
  const [listening, setListening] = useState<KeybindActionId | null>(null)
  const [displaced, setDisplaced] = useState<KeybindActionId | null>(null)

  useEffect(() => {
    if (!listening) return
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      const result = rebindAction(map, listening, e.code)
      setMap(result.map)
      saveKeybindMap(result.map)
      setDisplaced(result.displaced)
      setListening(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [listening, map])

  const onResetAll = () => {
    const defaults = buildDefaultKeybindMap()
    setMap(defaults)
    saveKeybindMap(defaults)
    setDisplaced(null)
  }

  const grouped = groupByCategory(KEYBIND_ACTIONS)

  return (
    <LCDFrame
      title="⌨️ Keybindings"
      statusGlyph="◇"
      statusLabel={
        listening ? `listening: ${getActionLabel(listening)}` : `${KEYBIND_ACTIONS.length} actions`
      }
      variant={listening ? 'amber' : 'blue'}
    >
      <div className="keybinds-panel">
        {grouped.map(([category, actions]) => (
          <div key={category} className="keybinds-panel__group">
            <h3 className="keybinds-panel__group-title">{category}</h3>
            <ul className="keybinds-panel__list">
              {actions.map((action) => (
                <li key={action.id} className="keybinds-panel__row">
                  <span className="keybinds-panel__action">{action.label}</span>
                  <button
                    type="button"
                    className={`keybinds-panel__key ${listening === action.id ? 'keybinds-panel__key--listening' : ''}`}
                    onClick={() => setListening(action.id)}
                  >
                    {listening === action.id ? '— press a key —' : map[action.id]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="keybinds-panel__footer">
          {displaced && (
            <span className="keybinds-panel__displaced">
              ↳ {getActionLabel(displaced)} reset to default (key conflict)
            </span>
          )}
          <button type="button" className="keybinds-panel__reset" onClick={onResetAll}>
            ⟲ Reset all to defaults
          </button>
        </div>
      </div>
    </LCDFrame>
  )
}

function groupByCategory(
  actions: ReadonlyArray<KeybindAction>,
): ReadonlyArray<readonly [KeybindAction['category'], ReadonlyArray<KeybindAction>]> {
  const map = new Map<KeybindAction['category'], KeybindAction[]>()
  for (const a of actions) {
    const arr = map.get(a.category) ?? []
    arr.push(a)
    map.set(a.category, arr)
  }
  const order: KeybindAction['category'][] = ['camera', 'menus', 'time', 'overlays', 'actions']
  return order.filter((c) => map.has(c)).map((c) => [c, map.get(c) ?? []] as const)
}

function getActionLabel(id: KeybindActionId): string {
  const a = KEYBIND_ACTIONS.find((x) => x.id === id)
  return a?.label ?? id
}
