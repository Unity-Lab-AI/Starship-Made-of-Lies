import { useEffect, useState } from 'react'
import { DOCK_ZONES, usePanelLayout } from './PanelLayoutContext'
import './dock-zone-overlay.css'

// PHASE 17.L.C.6 — render the three dock zones (left / right / bottom) as fixed-position
// ghost overlays whenever any panel is currently being dragged. On drop near a zone the
// PanelFrame snaps the panel to the zone's anchor + size. This component is purely visual —
// the actual snap logic lives in PanelFrame.handleHeaderPointerEnd.
//
// Re-renders on window resize so the right-edge / bottom-edge zones stay aligned with the
// viewport after the player switches monitors / rotates a tablet / etc.

export function DockZoneOverlay() {
  const layout = usePanelLayout()
  const [, forceRender] = useState(0)

  useEffect(() => {
    if (!layout.activeDragPanelId) return
    const handler = () => forceRender((n) => n + 1)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [layout.activeDragPanelId])

  if (!layout.activeDragPanelId) return null

  return (
    <div className="dock-zone-overlay" aria-hidden>
      {DOCK_ZONES.map((zone) => {
        const rect = zone.computeRect()
        return (
          <div
            key={zone.id}
            className={`dock-zone dock-zone--${zone.id}`}
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
            }}
          >
            <div className="dock-zone__label">{zone.label}</div>
          </div>
        )
      })}
    </div>
  )
}
