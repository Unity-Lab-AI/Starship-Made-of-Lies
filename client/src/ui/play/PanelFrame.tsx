import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { usePanelLayout } from './PanelLayoutContext'
import './play-shell.css'

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
  const [isDragging, setIsDragging] = useState(false)
  const savedPosition = layout.getPosition(panelId)
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

  const handleHeaderPointerEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragStateRef.current = null
    setIsDragging(false)
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

  const className = [
    'panel-frame',
    `panel-frame--${variant}`,
    savedPosition ? 'panel-frame--floating' : '',
    isDragging ? 'panel-frame--dragging' : '',
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
    </div>
  )
}
