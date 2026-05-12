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
  // PHASE 17.13.5 — Settlements picker. Lists every settlement across every owned planet,
  // grouped by planet. Read-only inspection in v1; active-settlement-switch lands with
  // 17.13.6 aggregate-vs-detail toggle when per-settlement state lives in sim.
  | 'settlements'
  // PHASE 17.12.7 — Hall of Champions in-game wiring. Real localStorage-backed leaderboards
  // (NEVER mock per the no-mock-player-data LAW). Match-end scores persist + the panel
  // surfaces top-10 per global category.
  | 'hallOfChampions'
  // PHASE 17.12.2 — Defense panel. Per-planet mine-field count + counter-pad count +
  // incoming-threat list + quick-build shortcuts. Cover-arc on sphere surface deferred to
  // a follow-on polish pass.
  | 'defense'
  // PHASE 17.13.7 — inter-planet caravan trade. Active caravan list + new-caravan dispatch form.
  | 'caravans'
  // 17.2.1 — Signal hub control panel. Detection range + early warning + incoming-flight roster
  // + own-flight link status (radio / laser-align / lost). Driven by `shared/sim/signal.ts`.
  | 'signalHub'
  // 17.2.3 — Per-flight telemetry SVG sparklines (distance / altitude / fuel% / LS%). Client-
  // side rolling buffer keyed by flight.id.
  | 'telemetryGraph'

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
  { id: 'settlements', emoji: '🏘', label: 'Settlements' },
  { id: 'hallOfChampions', emoji: '🏛️', label: 'Hall of Champions' },
  { id: 'defense', emoji: '🛡', label: 'Defense' },
  { id: 'caravans', emoji: '🛒', label: 'Caravans' },
  { id: 'signalHub', emoji: '📡', label: 'Signal Hub' },
  { id: 'telemetryGraph', emoji: '📈', label: 'Telemetry' },
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

// PHASE 17.L 2026-05-12 user feedback: "we need sub sections not a wall of ui buttons".
// Toolbar buttons now grouped into 6 collapsible categories. Each category renders as a
// single button in the bottom HUD; clicking one expands a row of its child buttons above.
// Settings is a SPECIAL category — instead of panel-toggle buttons, it renders inline
// utility actions (Save / Load / Reset Layout / Quit / Mute Audio).
export type ToolbarCategoryId = 'build' | 'fleet' | 'intel' | 'research' | 'comms' | 'settings'

export interface ToolbarCategoryDef {
  readonly id: ToolbarCategoryId
  readonly emoji: string
  readonly label: string
  // Panel ids in this category. Empty for the Settings category — that one is rendered
  // specially with inline utility actions.
  readonly panelIds: ReadonlyArray<PanelId>
  // When true, the entire category is hidden until the player has at least one launch pad
  // built. Per user feedback: "i should have access to launch controls when i dont have a
  // build launch pad yet... like wtf did you do to my ui button layout" — Fleet is the
  // category that's irrelevant pre-pad and shouldn't clutter the toolbar.
  readonly requiresLaunchPad?: boolean
}

export const TOOLBAR_CATEGORIES: ReadonlyArray<ToolbarCategoryDef> = [
  {
    id: 'build',
    emoji: '🏗',
    label: 'Build',
    panelIds: ['build', 'quotas', 'productionChains', 'energy', 'techDetail'],
  },
  {
    id: 'fleet',
    emoji: '🚀',
    label: 'Fleet',
    panelIds: [
      'ships',
      'flights',
      'shipBuilder',
      'mining',
      'beacon',
      'command',
      'trackingCamera',
      'defense',
    ],
    requiresLaunchPad: true,
  },
  {
    id: 'intel',
    emoji: '📊',
    label: 'Intel',
    panelIds: [
      'planets',
      'planetSummary',
      'planetInventory',
      'settlements',
      'citizens',
      'resources',
      'events',
      'ai',
      'indigenous',
      'caravans',
    ],
  },
  {
    id: 'research',
    emoji: '🧬',
    label: 'Research',
    panelIds: ['tech'],
  },
  {
    id: 'comms',
    emoji: '📡',
    label: 'Comms',
    panelIds: [
      'signalHub',
      'telemetryGraph',
      'campaigns',
      'deception',
      'hallOfChampions',
      'loot',
      'lastHope',
    ],
  },
  {
    id: 'settings',
    emoji: '⚙',
    label: 'Settings',
    panelIds: [],
  },
]

// O(1) lookup: panel id → toolbar button def so the category sub-row knows the emoji/label
// per panel without re-walking TOOLBAR_BUTTONS.
export const TOOLBAR_BUTTON_BY_PANEL: ReadonlyMap<PanelId, ToolbarButtonDef> = new Map(
  TOOLBAR_BUTTONS.filter(
    (b): b is ToolbarButtonDef & { readonly id: PanelId } => b.id !== 'galaxy' && b.id !== 'quit',
  ).map((b) => [b.id, b]),
)
