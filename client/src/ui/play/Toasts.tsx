import { type ToastNotification } from './types'
import './play-shell.css'

interface ToastsProps {
  readonly toasts: ReadonlyArray<ToastNotification>
  readonly onDismiss: (id: string) => void
}

export function Toasts({ toasts, onDismiss }: ToastsProps) {
  if (toasts.length === 0) return null
  return (
    <div className="toasts" role="alert" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`toast toast--${t.kind}`}
          onClick={() => onDismiss(t.id)}
          title="Click to dismiss"
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
