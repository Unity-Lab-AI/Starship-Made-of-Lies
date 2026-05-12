import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'smol.panel-layout.v1'
const BASE_Z_INDEX = 30
const DEBOUNCE_MS = 250
const EDGE_KEEP_VISIBLE_PX = 60

// PHASE 17.L.B.5 — per-panel resize handles. Sizes are clamped to PANEL_SIZE_MIN /
// PANEL_SIZE_MAX so the player can't shrink a panel to 0 (would be uncloseable) or grow it
// past the viewport (would lose the drag handle).
const PANEL_SIZE_MIN_W = 220
const PANEL_SIZE_MIN_H = 140
const PANEL_SIZE_MAX_W = 1600
const PANEL_SIZE_MAX_H = 1200

// PHASE 17.L.C.6 — snap-to-grid + dock zones. Panel positions are rounded to a 16-px grid so
// neighbouring panels line up perfectly. DOCK_THRESHOLD_PX is the distance from the viewport
// edge at which a panel's drop becomes a dock-to-edge action (snap to anchor + apply preset
// size). DOCK_ZONE_DEFINITIONS describes the three available zones.
export const PANEL_SNAP_GRID_PX = 16
export const PANEL_DOCK_THRESHOLD_PX = 48

export type DockZoneId = 'left' | 'right' | 'bottom'

export interface DockZoneDef {
  readonly id: DockZoneId
  readonly label: string
  // Returns the anchor position + size to apply when a panel docks here. Values derived from
  // the live window size so it adapts to viewport changes.
  computeRect(): { x: number; y: number; width: number; height: number }
}

export const DOCK_ZONES: ReadonlyArray<DockZoneDef> = [
  {
    id: 'left',
    label: 'Dock left',
    computeRect: () => ({
      x: 16,
      y: 96,
      width: Math.min(360, Math.floor(window.innerWidth * 0.28)),
      height: Math.max(280, Math.floor(window.innerHeight * 0.6)),
    }),
  },
  {
    id: 'right',
    label: 'Dock right',
    computeRect: () => {
      const w = Math.min(360, Math.floor(window.innerWidth * 0.28))
      return {
        x: window.innerWidth - w - 16,
        y: 96,
        width: w,
        height: Math.max(280, Math.floor(window.innerHeight * 0.6)),
      }
    },
  },
  {
    id: 'bottom',
    label: 'Dock bottom',
    computeRect: () => {
      const h = Math.max(220, Math.floor(window.innerHeight * 0.3))
      return {
        x: 16,
        y: window.innerHeight - h - 100,
        width: window.innerWidth - 32,
        height: h,
      }
    },
  },
]

// Maps a final pointer position to the dock zone (if any) it landed in. Returns null when no
// zone matches so the caller falls back to grid-snapped free-positioning.
export function findDockZoneForPointer(clientX: number, clientY: number): DockZoneDef | null {
  if (typeof window === 'undefined') return null
  if (clientX < PANEL_DOCK_THRESHOLD_PX) return DOCK_ZONES[0]!
  if (clientX > window.innerWidth - PANEL_DOCK_THRESHOLD_PX) return DOCK_ZONES[1]!
  if (clientY > window.innerHeight - PANEL_DOCK_THRESHOLD_PX) return DOCK_ZONES[2]!
  return null
}

export interface PanelPosition {
  readonly x: number
  readonly y: number
}

// PHASE 17.L.B.5 — persisted per-panel size. Width / height in CSS pixels. Persisted
// alongside the positions Record under the same STORAGE_KEY so a single localStorage roundtrip
// captures both layout dimensions.
export interface PanelSize {
  readonly width: number
  readonly height: number
}

interface PersistShape {
  positions: Record<string, PanelPosition>
  zOrder: string[]
  // PHASE 17.L.B.5 — sizes persisted alongside positions. Optional for backwards-compat with
  // saved layouts written before this field existed.
  sizes?: Record<string, PanelSize>
}

interface PanelLayoutValue {
  getPosition(panelId: string): PanelPosition | null
  getZIndex(panelId: string): number
  isVisible(panelId: string): boolean
  setVisible(panelId: string, visible: boolean): void
  toggleVisible(panelId: string): void
  setPosition(panelId: string, pos: PanelPosition): void
  clearPosition(panelId: string): void
  bringToFront(panelId: string): void
  resetAll(): void
  registerKnownPanel(panelId: string): void
  getKnownPanels(): readonly string[]
  // PHASE 17.L.B.5 — per-panel resize support. getSize returns the stored size or null when
  // the panel has never been resized. setSize clamps to PANEL_SIZE_MIN/MAX. clearSize wipes
  // the entry so the panel returns to its natural CSS-default width/height.
  getSize(panelId: string): PanelSize | null
  setSize(panelId: string, size: PanelSize): void
  clearSize(panelId: string): void
  // PHASE 17.L.C.6 — dock zone ghost overlays surface when any panel is actively being
  // dragged so the player sees where they'd land if they release near an edge. PanelFrame
  // calls setDragActive(panelId) on pointerDown and setDragActive(null) on pointerUp; the
  // provider exposes activeDragPanelId for the overlay layer.
  readonly activeDragPanelId: string | null
  setDragActive(panelId: string | null): void
}

const PanelLayoutContext = createContext<PanelLayoutValue | null>(null)

function readPersisted(): PersistShape {
  if (typeof window === 'undefined') return { positions: {}, zOrder: [], sizes: {} }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { positions: {}, zOrder: [], sizes: {} }
    const parsed = JSON.parse(raw) as Partial<PersistShape>
    return {
      positions: parsed.positions ?? {},
      zOrder: Array.isArray(parsed.zOrder) ? parsed.zOrder : [],
      sizes: parsed.sizes ?? {},
    }
  } catch {
    return { positions: {}, zOrder: [], sizes: {} }
  }
}

function clampPanelSize(size: PanelSize): PanelSize {
  return {
    width: Math.min(PANEL_SIZE_MAX_W, Math.max(PANEL_SIZE_MIN_W, Math.round(size.width))),
    height: Math.min(PANEL_SIZE_MAX_H, Math.max(PANEL_SIZE_MIN_H, Math.round(size.height))),
  }
}

function readVisibility(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem('smol.panel-visibility.v1')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function clampToViewport(pos: PanelPosition): PanelPosition {
  if (typeof window === 'undefined') return pos
  const maxX = Math.max(0, window.innerWidth - EDGE_KEEP_VISIBLE_PX)
  const maxY = Math.max(0, window.innerHeight - EDGE_KEEP_VISIBLE_PX)
  const minX = -10000
  const minY = 0
  // PHASE 17.L.C.6 — snap-to-grid on every position write so panels line up at clean
  // 16-px boundaries. Rounding happens before clamping so the grid step doesn't push the
  // panel past the viewport edge.
  const snappedX = Math.round(pos.x / PANEL_SNAP_GRID_PX) * PANEL_SNAP_GRID_PX
  const snappedY = Math.round(pos.y / PANEL_SNAP_GRID_PX) * PANEL_SNAP_GRID_PX
  return {
    x: Math.min(maxX, Math.max(minX, snappedX)),
    y: Math.min(maxY, Math.max(minY, snappedY)),
  }
}

export function PanelLayoutProvider({ children }: { readonly children: ReactNode }) {
  const initial = useMemo(readPersisted, [])
  const initialVisibility = useMemo(readVisibility, [])
  const [positions, setPositions] = useState<Record<string, PanelPosition>>(() => {
    const clamped: Record<string, PanelPosition> = {}
    for (const [id, pos] of Object.entries(initial.positions)) clamped[id] = clampToViewport(pos)
    return clamped
  })
  const [zOrder, setZOrder] = useState<string[]>(initial.zOrder)
  // PHASE 17.L.B.5 — per-panel size state, persisted under the same STORAGE_KEY as positions
  // + zOrder. Clamped on read to the same MIN/MAX guards used at write time so a corrupted
  // saved value can't break the panel layout.
  const [sizes, setSizes] = useState<Record<string, PanelSize>>(() => {
    const clamped: Record<string, PanelSize> = {}
    for (const [id, sz] of Object.entries(initial.sizes ?? {})) clamped[id] = clampPanelSize(sz)
    return clamped
  })
  const [visibility, setVisibility] = useState<Record<string, boolean>>(initialVisibility)
  // PHASE 17.L.C.6 — which panel is currently being dragged. Drives the dock-zone overlay
  // visibility. NOT persisted — purely transient during the drag gesture.
  const [activeDragPanelId, setActiveDragPanelIdState] = useState<string | null>(null)
  const knownPanelsRef = useRef<Set<string>>(new Set())
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ positions, zOrder, sizes }))
      } catch {
        // ignore
      }
    }, DEBOUNCE_MS)
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [positions, zOrder, sizes])

  useEffect(() => {
    try {
      window.localStorage.setItem('smol.panel-visibility.v1', JSON.stringify(visibility))
    } catch {
      // ignore
    }
  }, [visibility])

  const getPosition = useCallback((panelId: string) => positions[panelId] ?? null, [positions])

  const getZIndex = useCallback(
    (panelId: string) => {
      const idx = zOrder.indexOf(panelId)
      if (idx === -1) return BASE_Z_INDEX
      return BASE_Z_INDEX + idx + 1
    },
    [zOrder],
  )

  const isVisible = useCallback((panelId: string) => visibility[panelId] !== false, [visibility])

  const setVisible = useCallback((panelId: string, visible: boolean) => {
    setVisibility((prev) => ({ ...prev, [panelId]: visible }))
  }, [])

  const toggleVisible = useCallback((panelId: string) => {
    setVisibility((prev) => ({ ...prev, [panelId]: prev[panelId] === false }))
  }, [])

  const setPosition = useCallback((panelId: string, pos: PanelPosition) => {
    const clamped = clampToViewport(pos)
    setPositions((prev) => ({ ...prev, [panelId]: clamped }))
  }, [])

  const clearPosition = useCallback((panelId: string) => {
    setPositions((prev) => {
      if (!(panelId in prev)) return prev
      const next = { ...prev }
      delete next[panelId]
      return next
    })
  }, [])

  // PHASE 17.L.B.5 — per-panel size mutators. setSize clamps to PANEL_SIZE_MIN/MAX so a
  // pathological drag can never produce an unreachable or zero-size panel. clearSize wipes
  // the entry (used by resetAll + reset-layout button).
  const getSize = useCallback((panelId: string) => sizes[panelId] ?? null, [sizes])

  const setSize = useCallback((panelId: string, size: PanelSize) => {
    const clamped = clampPanelSize(size)
    setSizes((prev) => ({ ...prev, [panelId]: clamped }))
  }, [])

  const clearSize = useCallback((panelId: string) => {
    setSizes((prev) => {
      if (!(panelId in prev)) return prev
      const next = { ...prev }
      delete next[panelId]
      return next
    })
  }, [])

  // PHASE 17.L.C.6 — drag-active setter. Stored alongside positions / sizes / zOrder so the
  // overlay layer can read it via the same context. Passing null clears it (pointerUp).
  const setDragActive = useCallback((panelId: string | null) => {
    setActiveDragPanelIdState(panelId)
  }, [])

  const bringToFront = useCallback((panelId: string) => {
    setZOrder((prev) => {
      const without = prev.filter((id) => id !== panelId)
      without.push(panelId)
      return without.slice(-50)
    })
  }, [])

  const resetAll = useCallback(() => {
    setPositions({})
    setZOrder([])
    setVisibility({})
    setSizes({})
    try {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem('smol.panel-visibility.v1')
    } catch {
      // ignore
    }
  }, [])

  const registerKnownPanel = useCallback((panelId: string) => {
    knownPanelsRef.current.add(panelId)
  }, [])

  const getKnownPanels = useCallback(() => Array.from(knownPanelsRef.current).sort(), [])

  const value = useMemo<PanelLayoutValue>(
    () => ({
      getPosition,
      getZIndex,
      isVisible,
      setVisible,
      toggleVisible,
      setPosition,
      clearPosition,
      bringToFront,
      resetAll,
      registerKnownPanel,
      getKnownPanels,
      getSize,
      setSize,
      clearSize,
      activeDragPanelId,
      setDragActive,
    }),
    [
      getPosition,
      getZIndex,
      isVisible,
      setVisible,
      toggleVisible,
      setPosition,
      clearPosition,
      bringToFront,
      resetAll,
      registerKnownPanel,
      getKnownPanels,
      getSize,
      setSize,
      clearSize,
      activeDragPanelId,
      setDragActive,
    ],
  )

  return <PanelLayoutContext.Provider value={value}>{children}</PanelLayoutContext.Provider>
}

export function usePanelLayout(): PanelLayoutValue {
  const ctx = useContext(PanelLayoutContext)
  if (!ctx) {
    return {
      getPosition: () => null,
      getZIndex: () => BASE_Z_INDEX,
      isVisible: () => true,
      setVisible: () => undefined,
      toggleVisible: () => undefined,
      setPosition: () => undefined,
      clearPosition: () => undefined,
      bringToFront: () => undefined,
      resetAll: () => undefined,
      registerKnownPanel: () => undefined,
      getKnownPanels: () => [],
      getSize: () => null,
      setSize: () => undefined,
      clearSize: () => undefined,
      activeDragPanelId: null,
      setDragActive: () => undefined,
    }
  }
  return ctx
}
