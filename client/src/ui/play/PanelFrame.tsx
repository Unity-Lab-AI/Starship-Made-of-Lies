import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { findDockZoneForPointer, usePanelLayout } from './PanelLayoutContext'
import './play-shell.css'

// PHASE 17.L.C.6 — sentinel to ignore dock-zone snap when the player explicitly held the
// Shift key while releasing. Lets the player free-position a panel near a viewport edge
// without it auto-docking — escape hatch for power users.
const SHIFT_HELD_RECENTLY_WINDOW_MS = 600
let lastShiftAtMs = 0
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') lastShiftAtMs = Date.now()
  })
}
function shiftHeldRecently(): boolean {
  return Date.now() - lastShiftAtMs < SHIFT_HELD_RECENTLY_WINDOW_MS
}

interface PanelFrameProps {
  readonly panelId: string
  readonly title: string
  readonly emoji?: string
  readonly onClose: () => void
  readonly children: ReactNode
  readonly variant?:
    | 'docked-left'
    | 'docked-right'
    | 'docked-top-left'
    | 'docked-top-right'
    | 'docked-bottom-right'
    | 'centered'
  readonly width?: number
  readonly extraClass?: string
}

interface DragState {
  startPointerX: number
  startPointerY: number
  startPanelX: number
  startPanelY: number
  pointerId: number
}

// PHASE 17.L.B.5 — resize-handle drag state. Tracks the starting pointer position + the
// pre-resize size so the mousemove handler can compute the new dimensions as deltas. Per-axis
// flag lets us reuse the same code path for E-edge (width only), S-edge (height only), and
// SE-corner (both axes) handles — only the corner is wired today but the structure is set up
// for adding the edge handles in a follow-on phase.
interface ResizeState {
  startPointerX: number
  startPointerY: number
  startWidth: number
  startHeight: number
  pointerId: number
  resizeX: boolean
  resizeY: boolean
}

export function PanelFrame({
  panelId,
  title,
  emoji,
  onClose,
  children,
  variant = 'docked-right',
  width,
  extraClass,
}: PanelFrameProps) {
  const layout = usePanelLayout()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  // PHASE 17.L.B.5 — resize drag state lives next to the drag state but uses its own pointer
  // id + initial-size capture so the two paths can't interfere with each other.
  const resizeStateRef = useRef<ResizeState | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const savedPosition = layout.getPosition(panelId)
  const savedSize = layout.getSize(panelId)
  const zIndex = layout.getZIndex(panelId)

  useEffect(() => {
    layout.registerKnownPanel(panelId)
  }, [layout, panelId])

  const handleRootPointerDown = useCallback(() => {
    layout.bringToFront(panelId)
  }, [layout, panelId])

  const handleHeaderPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      const target = event.target as HTMLElement
      if (target.closest('.panel-frame__close')) return

      const node = rootRef.current
      if (!node) return

      const rect = node.getBoundingClientRect()
      const currentX = savedPosition?.x ?? rect.left
      const currentY = savedPosition?.y ?? rect.top

      dragStateRef.current = {
        startPointerX: event.clientX,
        startPointerY: event.clientY,
        startPanelX: currentX,
        startPanelY: currentY,
        pointerId: event.pointerId,
      }
      setIsDragging(true)
      layout.bringToFront(panelId)
      // PHASE 17.L.C.6 — flag drag-active in the context so the dock-zone overlay layer can
      // render its zone hints. Cleared in handleHeaderPointerEnd regardless of drop outcome.
      layout.setDragActive(panelId)
      event.currentTarget.setPointerCapture(event.pointerId)
      event.preventDefault()
    },
    [layout, panelId, savedPosition],
  )

  const handleHeaderPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      const dx = event.clientX - drag.startPointerX
      const dy = event.clientY - drag.startPointerY
      layout.setPosition(panelId, {
        x: drag.startPanelX + dx,
        y: drag.startPanelY + dy,
      })
    },
    [layout, panelId],
  )

  const handleHeaderPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      dragStateRef.current = null
      setIsDragging(false)
      layout.setDragActive(null)
      // PHASE 17.L.C.6 — on drop, check if the pointer landed inside a dock zone. If so,
      // snap the panel to the zone's anchor + apply the zone's preset size. Shift-hold
      // escape hatch bypasses dock snapping for free-positioning near edges. Grid-snap
      // already applied inside layout.setPosition so non-dock drops still align cleanly.
      const dockZone = shiftHeldRecently()
        ? null
        : findDockZoneForPointer(event.clientX, event.clientY)
      if (dockZone) {
        const rect = dockZone.computeRect()
        layout.setPosition(panelId, { x: rect.x, y: rect.y })
        layout.setSize(panelId, { width: rect.width, height: rect.height })
      }
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // pointer may already be released
      }
    },
    [layout, panelId],
  )

  // PHASE 17.L.B.5 — resize-handle pointer handlers. Same three-phase pattern as the header
  // drag (down → move → up/cancel) but writes to layout.setSize instead of setPosition. The
  // initial size capture reads the live DOMRect so dragging works correctly even when the
  // panel is at its CSS-default size (no savedSize yet).
  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, axes: { x: boolean; y: boolean }) => {
      if (event.button !== 0) return
      const node = rootRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      resizeStateRef.current = {
        startPointerX: event.clientX,
        startPointerY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        pointerId: event.pointerId,
        resizeX: axes.x,
        resizeY: axes.y,
      }
      setIsResizing(true)
      layout.bringToFront(panelId)
      event.currentTarget.setPointerCapture(event.pointerId)
      event.preventDefault()
      event.stopPropagation()
    },
    [layout, panelId],
  )

  const handleResizeMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const resize = resizeStateRef.current
      if (!resize || resize.pointerId !== event.pointerId) return
      const dx = event.clientX - resize.startPointerX
      const dy = event.clientY - resize.startPointerY
      const nextWidth = resize.resizeX ? resize.startWidth + dx : resize.startWidth
      const nextHeight = resize.resizeY ? resize.startHeight + dy : resize.startHeight
      layout.setSize(panelId, { width: nextWidth, height: nextHeight })
    },
    [layout, panelId],
  )

  const handleResizeEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = resizeStateRef.current
    if (!resize || resize.pointerId !== event.pointerId) return
    resizeStateRef.current = null
    setIsResizing(false)
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // pointer may already be released
    }
  }, [])

  const style: CSSProperties = { zIndex }
  if (width != null) style.width = `${width}px`
  if (savedPosition) {
    style.left = `${savedPosition.x}px`
    style.top = `${savedPosition.y}px`
    style.right = 'auto'
    style.bottom = 'auto'
    style.transform = 'none'
  }
  // PHASE 17.L.B.5 — saved size wins over the panel-defined `width` prop so a player-resized
  // panel keeps its dimensions across renders. Height stays unspecified until the player
  // actively drags the resize handle so the panel can grow naturally with its body content.
  if (savedSize) {
    style.width = `${savedSize.width}px`
    style.height = `${savedSize.height}px`
  }

  const className = [
    'panel-frame',
    `panel-frame--${variant}`,
    savedPosition ? 'panel-frame--floating' : '',
    isDragging ? 'panel-frame--dragging' : '',
    isResizing ? 'panel-frame--resizing' : '',
    savedSize ? 'panel-frame--resized' : '',
    extraClass ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={rootRef}
      className={className}
      style={style}
      role="dialog"
      aria-label={title}
      onPointerDown={handleRootPointerDown}
    >
      <div
        className="panel-frame__header"
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerEnd}
        onPointerCancel={handleHeaderPointerEnd}
      >
        <span className="panel-frame__title">
          {emoji && (
            <span aria-hidden className="panel-frame__title-emoji">
              {emoji}
            </span>
          )}
          {title}
        </span>
        <button
          type="button"
          className="panel-frame__close"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          title="Close (ESC)"
          aria-label={`Close ${title}`}
        >
          ✕
        </button>
      </div>
      <div className="panel-frame__body">{children}</div>
      {/* PHASE 17.L.B.5 — SE-corner resize grip + E/S edge grips. Pointer-drag updates the
          panel's persisted size via layout.setSize. Double-click the SE grip resets back to
          the panel's natural CSS-default dimensions. */}
      <div
        className="panel-frame__resize panel-frame__resize--e"
        onPointerDown={(e) => handleResizeStart(e, { x: true, y: false })}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
        title="Resize width"
        aria-hidden
      />
      <div
        className="panel-frame__resize panel-frame__resize--s"
        onPointerDown={(e) => handleResizeStart(e, { x: false, y: true })}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
        title="Resize height"
        aria-hidden
      />
      <div
        className="panel-frame__resize panel-frame__resize--se"
        onPointerDown={(e) => handleResizeStart(e, { x: true, y: true })}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
        onDoubleClick={() => layout.clearSize(panelId)}
        title="Resize — drag to size, double-click to reset"
        aria-label={`Resize ${title}`}
      />
    </div>
  )
}
