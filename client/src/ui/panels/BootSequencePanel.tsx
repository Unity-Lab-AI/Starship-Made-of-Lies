import { useEffect, useState } from 'react'
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
}

export function BootSequencePanel({
  theme,
  tickIntervalMs = 120,
  autoStart = true,
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
        <ul className="boot-panel__list">
          {sequence.states.map((state) => (
            <li key={state.check.id} className={`boot-panel__row boot-panel__row--${state.status}`}>
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
