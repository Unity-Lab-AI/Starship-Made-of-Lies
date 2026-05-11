import type { ReactNode } from 'react'
import './LCDFrame.css'

interface LCDFrameProps {
  readonly children: ReactNode
  readonly title?: string
  readonly statusGlyph?: string
  readonly statusLabel?: string
  readonly variant?: 'amber' | 'green' | 'blue' | 'red'
  readonly scanlines?: boolean
  readonly className?: string
}

export function LCDFrame({
  children,
  title,
  statusGlyph,
  statusLabel,
  variant = 'amber',
  scanlines = true,
  className,
}: LCDFrameProps) {
  const classes = [
    'lcd-frame',
    `lcd-frame--${variant}`,
    scanlines ? 'lcd-frame--scanlines' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes}>
      <div className="lcd-frame__bezel">
        {title || statusLabel ? (
          <header className="lcd-frame__header">
            {title ? <span className="lcd-frame__title">{title}</span> : null}
            {statusLabel ? (
              <span className="lcd-frame__status">
                {statusGlyph ? (
                  <span className="lcd-frame__status-glyph">{statusGlyph}</span>
                ) : null}
                {statusLabel}
              </span>
            ) : null}
          </header>
        ) : null}
        <div className="lcd-frame__screen">
          {scanlines ? <div className="lcd-frame__scanlines" aria-hidden="true" /> : null}
          <div className="lcd-frame__content">{children}</div>
        </div>
        <div className="lcd-frame__corner lcd-frame__corner--tl" aria-hidden="true">
          ◢
        </div>
        <div className="lcd-frame__corner lcd-frame__corner--tr" aria-hidden="true">
          ◣
        </div>
        <div className="lcd-frame__corner lcd-frame__corner--bl" aria-hidden="true">
          ◥
        </div>
        <div className="lcd-frame__corner lcd-frame__corner--br" aria-hidden="true">
          ◤
        </div>
      </div>
    </div>
  )
}
