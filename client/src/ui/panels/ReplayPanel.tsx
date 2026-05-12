// PHASE 18.3 — Replay buffer viewer. Lists every snapshot the ring buffer has captured
// this session in newest-first order; each row shows the captured-at tick + the elapsed
// real-time. "Load" button rewinds the live MatchState to that snapshot via the existing
// saveLoad pipeline. Snapshots that pre-date the current state are reload-only (no future
// replay forward yet — that's a follow-on polish pass).

import { useEffect, useState } from 'react'
import { listReplaySnapshots, replayBufferSize, type ReplaySnapshotEntry } from '../../match/replay'

interface ReplayPanelProps {
  readonly currentTick: number
  readonly onLoadSnapshot: (index: number) => boolean
}

export function ReplayPanel({ currentTick, onLoadSnapshot }: ReplayPanelProps) {
  // Subscribe to a polling refresh so the list updates as new snapshots get captured (the
  // ring buffer is module-state, not React state, so we poll every 2 seconds).
  const [snapshots, setSnapshots] = useState<ReadonlyArray<ReplaySnapshotEntry>>(() =>
    listReplaySnapshots(),
  )
  useEffect(() => {
    const handle = window.setInterval(() => {
      setSnapshots([...listReplaySnapshots()])
    }, 2000)
    return () => window.clearInterval(handle)
  }, [])

  const sorted = [...snapshots].sort((a, b) => b.index - a.index)
  const totalCaptured = replayBufferSize()
  const nowMs = Date.now()

  return (
    <div className="replay-panel">
      <p className="replay-panel__summary">
        {totalCaptured === 0
          ? 'No snapshots captured yet. The buffer captures every ~12 seconds of play at 1× speed (every 60 sim ticks).'
          : `${totalCaptured} snapshot${totalCaptured === 1 ? '' : 's'} in buffer (newest first). Each entry is a full save; loading rewinds the match.`}
      </p>
      {sorted.length > 0 && (
        <ul className="replay-panel__list">
          {sorted.map((snap) => {
            const tickDelta = currentTick - snap.atTick
            const ageSec = Math.round((nowMs - snap.capturedAtMs) / 1000)
            return (
              <li key={snap.index} className="replay-panel__row">
                <div className="replay-panel__row-info">
                  <span className="replay-panel__row-tick">
                    Tick {snap.atTick.toLocaleString()}
                  </span>
                  <span className="replay-panel__row-delta">
                    {tickDelta > 0 ? `${tickDelta} ticks ago` : 'current'}
                    {ageSec > 0 ? ` · ${ageSec}s real-time` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="replay-panel__row-load"
                  onClick={() => {
                    const ok = onLoadSnapshot(snap.index)
                    if (!ok) {
                      console.warn('[smol/replay] Load failed for snapshot index', snap.index)
                    }
                  }}
                  disabled={tickDelta === 0}
                >
                  ⏪ Load
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
