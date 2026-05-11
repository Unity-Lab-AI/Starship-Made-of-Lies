import { type ReactNode } from 'react'
import './play-shell.css'

interface PanelFrameProps {
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

export function PanelFrame({
  title,
  emoji,
  onClose,
  children,
  variant = 'docked-right',
  width,
  extraClass,
}: PanelFrameProps) {
  const style: React.CSSProperties | undefined = width ? { width: `${width}px` } : undefined
  return (
    <div
      className={`panel-frame panel-frame--${variant} ${extraClass ?? ''}`}
      style={style}
      role="dialog"
      aria-label={title}
    >
      <header className="panel-frame__header">
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
          title="Close (ESC)"
          aria-label={`Close ${title}`}
        >
          ✕
        </button>
      </header>
      <div className="panel-frame__body">{children}</div>
    </div>
  )
}
