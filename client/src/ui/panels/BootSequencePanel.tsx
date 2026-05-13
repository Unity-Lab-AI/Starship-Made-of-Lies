import { useEffect, useRef, useState } from 'react'
import {
  type BootSequence,
  bootProgress,
  getThemedBootLabel,
  newBootSequence,
  type Theme,
  tickBootSequence,
} from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import './BootSequencePanel.css'

interface BootSequencePanelProps {
  readonly theme: Theme
  readonly tickIntervalMs?: number
  readonly autoStart?: boolean
  // PHASE 17.L.A.14 — onFinished callback fires once when the sequence finishes (whether by
  // ticking through all checks or by Space-skip). PlayPage uses this to unlock the world view
  // — the panel is rendered as a fullscreen overlay until the player either waits it out or
  // hits Space to skip.
  readonly onFinished?: () => void
  // PHASE 17.L.A.14 — when true, Space key fast-forwards through every remaining check + fires
  // onFinished. Listens at the document level. Default false to preserve the panel's prior
  // standalone behavior in PreviewPage.
  readonly skippable?: boolean
}

export function BootSequencePanel({
  theme,
  tickIntervalMs = 120,
  autoStart = true,
  onFinished,
  skippable,
}: BootSequencePanelProps) {
  const [sequence, setSequence] = useState<BootSequence>(() => newBootSequence())
  const [running, setRunning] = useState(autoStart)

  useEffect(() => {
    if (!running || sequence.finished) return
    const handle = window.setInterval(() => {
      setSequence((prev) => {
        const next: BootSequence = {
          states: prev.states.map((s) => ({ ...s })),
          currentIdx: prev.currentIdx,
          finished: prev.finished,
        }
        tickBootSequence(next)
        return next
      })
    }, tickIntervalMs)
    return () => window.clearInterval(handle)
  }, [running, sequence.finished, tickIntervalMs])

  // PHASE 17.L.D.18 (2026-05-13) — auto-scroll the boot list so the active (running) row
  // stays visible as the ceremony advances. Per user verbatim *"and the boot up needs to
  // scroll with the ok registered items of the boot ceremony"*. Before this fix, with
  // max-height: 14rem on .boot-panel__list, rows past the visible window stayed hidden;
  // the player saw the same top few checks the whole time while progress crept past them.
  // We track the latest non-pending row (running if any, else the highest completed) and
  // scrollIntoView({ block: 'nearest' }) it on each render. 'nearest' avoids scrolling the
  // outer page; 'smooth' on the behavior keeps the eye continuity.
  const listRef = useRef<HTMLUListElement | null>(null)
  const activeRowRef = useRef<HTMLLIElement | null>(null)
  const activeIdx = (() => {
    let lastNonPending = -1
    for (let i = 0; i < sequence.states.length; i++) {
      const status = sequence.states[i]!.status
      if (status === 'running') return i
      if (status !== 'pending') lastNonPending = i
    }
    return lastNonPending
  })()

  useEffect(() => {
    const row = activeRowRef.current
    if (!row) return
    row.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIdx])

  // PHASE 17.L.A.14 — fire onFinished once when the sequence transitions to finished. Tracked
  // via ref to avoid re-firing across re-renders when the prop function identity is stable.
  const firedFinishedRef = useRef(false)
  useEffect(() => {
    if (sequence.finished && !firedFinishedRef.current) {
      firedFinishedRef.current = true
      onFinished?.()
    }
  }, [sequence.finished, onFinished])

  // PHASE 17.L.A.14 — Space-key skip. Advance the sequence to finished instantly + caller's
  // onFinished fires on the next render via the effect above.
  useEffect(() => {
    if (!skippable) return
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      e.preventDefault()
      setSequence((prev) => {
        if (prev.finished) return prev
        const states = prev.states.map((s) => ({
          ...s,
          status: 'completed' as const,
        }))
        return {
          states,
          currentIdx: states.length - 1,
          finished: true,
        }
      })
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [skippable])

  const progress = bootProgress(sequence)

  return (
    <LCDFrame
      title="◆ System Boot Checklist"
      statusGlyph={sequence.finished ? '✓' : '◌'}
      statusLabel={sequence.finished ? 'all systems online' : `${Math.round(progress * 100)}%`}
      variant={sequence.finished ? 'green' : 'amber'}
    >
      <div className="boot-panel">
        <div className="boot-panel__progress" role="img" aria-label="Boot progress">
          <div
            className="boot-panel__progress-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <ul className="boot-panel__list" ref={listRef}>
          {sequence.states.map((state, idx) => (
            <li
              key={state.check.id}
              ref={idx === activeIdx ? activeRowRef : null}
              className={`boot-panel__row boot-panel__row--${state.status}`}
            >
              <span className="boot-panel__row-glyph">{glyphForStatus(state.status)}</span>
              <span className="boot-panel__row-label">
                {getThemedBootLabel(state.check, theme)}
              </span>
              <span className="boot-panel__row-status">{statusLabel(state.status)}</span>
            </li>
          ))}
        </ul>
        <div className="boot-panel__controls">
          <button type="button" onClick={() => setRunning((r) => !r)}>
            {running ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button type="button" onClick={() => setSequence(newBootSequence())}>
            ⟲ Replay
          </button>
        </div>
      </div>
    </LCDFrame>
  )
}

function glyphForStatus(status: 'pending' | 'running' | 'completed' | 'failed'): string {
  switch (status) {
    case 'pending':
      return '·'
    case 'running':
      return '▶'
    case 'completed':
      return '✓'
    case 'failed':
      return '✕'
  }
}

function statusLabel(status: 'pending' | 'running' | 'completed' | 'failed'): string {
  switch (status) {
    case 'pending':
      return 'queued'
    case 'running':
      return 'running'
    case 'completed':
      return 'ok'
    case 'failed':
      return 'fail'
  }
}
