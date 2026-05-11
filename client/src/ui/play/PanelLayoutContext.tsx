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

export interface PanelPosition {
  readonly x: number
  readonly y: number
}

interface PersistShape {
  positions: Record<string, PanelPosition>
  zOrder: string[]
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
}

const PanelLayoutContext = createContext<PanelLayoutValue | null>(null)

function readPersisted(): PersistShape {
  if (typeof window === 'undefined') return { positions: {}, zOrder: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { positions: {}, zOrder: [] }
    const parsed = JSON.parse(raw) as Partial<PersistShape>
    return {
      positions: parsed.positions ?? {},
      zOrder: Array.isArray(parsed.zOrder) ? parsed.zOrder : [],
    }
  } catch {
    return { positions: {}, zOrder: [] }
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
  return {
    x: Math.min(maxX, Math.max(minX, pos.x)),
    y: Math.min(maxY, Math.max(minY, pos.y)),
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
  const [visibility, setVisibility] = useState<Record<string, boolean>>(initialVisibility)
  const knownPanelsRef = useRef<Set<string>>(new Set())
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ positions, zOrder }))
      } catch {
        // ignore
      }
    }, DEBOUNCE_MS)
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [positions, zOrder])

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
    }
  }
  return ctx
}
