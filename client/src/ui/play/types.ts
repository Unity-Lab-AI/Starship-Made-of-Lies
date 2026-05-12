export type PanelId =
  | 'build'
  | 'campaigns'
  | 'planets'
  | 'tech'
  | 'resources'
  | 'deception'
  | 'ships'
  | 'flights'
  | 'indigenous'
  | 'loot'
  | 'lastHope'
  | 'beacon'
  | 'mining'
  | 'ai'
  | 'events'
  | 'command'
  | 'energy'
  | 'citizens'
  | 'shipBuilder'
  // PHASE 17.L.A.12 — Q11 LOCKED. Per-planet production-mode + quota controls panel.
  | 'quotas'
  // HOTFIX 17.L.D.14 — Tech detail panel extracted from TechTreePanel into its own movable
  // PanelFrame so it no longer overlays the tech grid (per user verbatim).
  | 'techDetail'
  // PHASE 17.L.A.10 — Q14 LOCKED. Production-chain Sankey diagram panel.
  | 'productionChains'
  // PHASE 17.L.A.9 — Q13 LOCKED. Top-down tracking-cam minimap + telemetry for one flight.
  | 'trackingCamera'
  // PHASE 17.L.C.4 — Planet summary popup (per-tier citizen counts + main resources at top +
  // 🗄 Open Inventory button). Opens from the 📍 Planets panel "View" button or the galaxy
  // planet-click in selectedPlanetId workflow.
  | 'planetSummary'
  // PHASE 17.L.C.4 — Planet inventory popup with upgradeable per-resource storage caps.
  // Opens via the button inside PlanetSummaryPanel.
  | 'planetInventory'

export type ToolbarButtonDef = {
  readonly id: PanelId | 'galaxy' | 'quit'
  readonly emoji: string
  readonly label: string
  readonly hotkey?: string
}

// NOTE: WASD + QE + mouse-wheel + mouse-edge-scroll are RESERVED for 3D-universe
// navigation (PHASE 16.2): W/A/S/D = pan, Q/E = rotate, wheel = zoom, mouse-edge = RTS-style pan.
// Panel hotkeys MUST avoid these letters.
export const TOOLBAR_BUTTONS: ReadonlyArray<ToolbarButtonDef> = [
  { id: 'build', emoji: '🏗', label: 'Build', hotkey: 'B' },
  { id: 'campaigns', emoji: '📣', label: 'Campaigns', hotkey: 'P' },
  { id: 'tech', emoji: '🧬', label: 'Tech', hotkey: 'T' },
  { id: 'resources', emoji: '📊', label: 'Stockpile', hotkey: 'R' },
  { id: 'deception', emoji: '🧠', label: 'Loyalty', hotkey: 'L' },
  { id: 'ships', emoji: '🚀', label: 'Ships', hotkey: 'K' },
  { id: 'flights', emoji: '🛰️', label: 'Flights', hotkey: 'F' },
  { id: 'indigenous', emoji: '🪶', label: 'Indigenous', hotkey: 'I' },
  { id: 'loot', emoji: '🎁', label: 'Salvage' },
  { id: 'lastHope', emoji: '🚨', label: 'Last Hope' },
  { id: 'beacon', emoji: '🛰', label: 'Beacon' },
  { id: 'mining', emoji: '⛏️', label: 'Mining Fleet' },
  { id: 'command', emoji: '🎛', label: 'Command Pad' },
  { id: 'energy', emoji: '⚡', label: 'Energy', hotkey: 'Y' },
  { id: 'citizens', emoji: '👥', label: 'Citizens', hotkey: 'N' },
  { id: 'shipBuilder', emoji: '🛠', label: 'Ship Builder', hotkey: 'U' },
  { id: 'quotas', emoji: '📋', label: 'Quotas' },
  { id: 'techDetail', emoji: '🔍', label: 'Tech Detail' },
  { id: 'productionChains', emoji: '🔗', label: 'Production Chains' },
  { id: 'trackingCamera', emoji: '📹', label: 'Tracking Camera' },
  { id: 'planetSummary', emoji: '🪐', label: 'Planet Summary' },
  { id: 'planetInventory', emoji: '🗄', label: 'Planet Inventory' },
  { id: 'ai', emoji: '🤖', label: 'AI Players' },
  { id: 'events', emoji: '📜', label: 'Events', hotkey: 'X' },
  { id: 'planets', emoji: '📍', label: 'Planets', hotkey: 'G' },
  { id: 'galaxy', emoji: '🌌', label: 'Galaxy (zoom out)', hotkey: 'M' },
]

export interface ToastNotification {
  readonly id: string
  readonly message: string
  readonly kind: 'info' | 'warning' | 'error' | 'success'
  readonly expiresAtMs: number
}
