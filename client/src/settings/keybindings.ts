export type KeybindActionId =
  | 'panUp'
  | 'panDown'
  | 'panLeft'
  | 'panRight'
  | 'rotateLeft'
  | 'rotateRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'centerOnHomeworld'
  | 'openBuildMenu'
  | 'openResearchMenu'
  | 'openCampaignMenu'
  | 'openLaunchPad'
  | 'openBeacon'
  | 'openHallOfChampions'
  | 'openAchievements'
  | 'openSettings'
  | 'pauseMatch'
  | 'speedUp'
  | 'speedDown'
  | 'cancelAction'
  | 'confirmAction'
  | 'toggleFogOfWarOverlay'
  | 'toggleProductionGraph'

export interface KeybindAction {
  readonly id: KeybindActionId
  readonly label: string
  readonly category: 'camera' | 'menus' | 'time' | 'overlays' | 'actions'
  readonly defaultKey: string
}

export const KEYBIND_ACTIONS: ReadonlyArray<KeybindAction> = [
  { id: 'panUp', label: 'Pan Camera Up', category: 'camera', defaultKey: 'KeyW' },
  { id: 'panDown', label: 'Pan Camera Down', category: 'camera', defaultKey: 'KeyS' },
  { id: 'panLeft', label: 'Pan Camera Left', category: 'camera', defaultKey: 'KeyA' },
  { id: 'panRight', label: 'Pan Camera Right', category: 'camera', defaultKey: 'KeyD' },
  { id: 'rotateLeft', label: 'Rotate Camera Left', category: 'camera', defaultKey: 'KeyQ' },
  { id: 'rotateRight', label: 'Rotate Camera Right', category: 'camera', defaultKey: 'KeyE' },
  { id: 'zoomIn', label: 'Zoom In', category: 'camera', defaultKey: 'Equal' },
  { id: 'zoomOut', label: 'Zoom Out', category: 'camera', defaultKey: 'Minus' },
  { id: 'centerOnHomeworld', label: 'Center on Homeworld', category: 'camera', defaultKey: 'KeyH' },
  { id: 'openBuildMenu', label: 'Open Build Menu', category: 'menus', defaultKey: 'KeyB' },
  { id: 'openResearchMenu', label: 'Open Research Menu', category: 'menus', defaultKey: 'KeyR' },
  { id: 'openCampaignMenu', label: 'Open Campaigns', category: 'menus', defaultKey: 'KeyC' },
  { id: 'openLaunchPad', label: 'Open Launch Pad', category: 'menus', defaultKey: 'KeyL' },
  { id: 'openBeacon', label: 'Open Beacon', category: 'menus', defaultKey: 'KeyG' },
  { id: 'openHallOfChampions', label: 'Hall of Champions', category: 'menus', defaultKey: 'F1' },
  { id: 'openAchievements', label: 'Achievements', category: 'menus', defaultKey: 'F2' },
  { id: 'openSettings', label: 'Settings', category: 'menus', defaultKey: 'Escape' },
  { id: 'pauseMatch', label: 'Pause / Unpause', category: 'time', defaultKey: 'Space' },
  { id: 'speedUp', label: 'Speed Up Time', category: 'time', defaultKey: 'BracketRight' },
  { id: 'speedDown', label: 'Slow Down Time', category: 'time', defaultKey: 'BracketLeft' },
  { id: 'cancelAction', label: 'Cancel Action', category: 'actions', defaultKey: 'Escape' },
  { id: 'confirmAction', label: 'Confirm Action', category: 'actions', defaultKey: 'Enter' },
  {
    id: 'toggleFogOfWarOverlay',
    label: 'Toggle Fog-of-War Overlay',
    category: 'overlays',
    defaultKey: 'KeyF',
  },
  {
    id: 'toggleProductionGraph',
    label: 'Toggle Production Graph',
    category: 'overlays',
    defaultKey: 'KeyP',
  },
]

const ACTION_INDEX = new Map<KeybindActionId, KeybindAction>(KEYBIND_ACTIONS.map((a) => [a.id, a]))

export function getKeybindAction(id: KeybindActionId): KeybindAction {
  const a = ACTION_INDEX.get(id)
  if (!a) throw new Error(`getKeybindAction: unknown keybind ${id}`)
  return a
}

export type KeybindMap = Record<KeybindActionId, string>

export function buildDefaultKeybindMap(): KeybindMap {
  const map = {} as KeybindMap
  for (const action of KEYBIND_ACTIONS) {
    map[action.id] = action.defaultKey
  }
  return map
}

const STORAGE_KEY = 'smol.settings.keybinds.v1'

export function loadKeybindMap(): KeybindMap {
  if (typeof localStorage === 'undefined') return buildDefaultKeybindMap()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return buildDefaultKeybindMap()
  try {
    const parsed = JSON.parse(raw) as Partial<KeybindMap>
    const defaults = buildDefaultKeybindMap()
    return { ...defaults, ...parsed }
  } catch {
    return buildDefaultKeybindMap()
  }
}

export function saveKeybindMap(map: KeybindMap): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    return true
  } catch {
    return false
  }
}

export function findActionForKey(map: KeybindMap, keyCode: string): KeybindActionId | null {
  for (const action of KEYBIND_ACTIONS) {
    if (map[action.id] === keyCode) return action.id
  }
  return null
}

export function rebindAction(
  map: KeybindMap,
  actionId: KeybindActionId,
  newKey: string,
): { readonly map: KeybindMap; readonly displaced: KeybindActionId | null } {
  const next = { ...map }
  let displaced: KeybindActionId | null = null
  const conflict = findActionForKey(next, newKey)
  if (conflict && conflict !== actionId) {
    displaced = conflict
    const def = getKeybindAction(conflict).defaultKey
    next[conflict] = def
  }
  next[actionId] = newKey
  return { map: next, displaced }
}
