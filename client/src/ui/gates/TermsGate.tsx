// PHASE 17.L.D (HOTFIX 2026-05-12) — Terms of Service + Privacy first-load gate per user
// verbatim *"also i dont see the game's privacy and terms of service and we need a terms
// of service gate on the game first load with links and all of that and a disagree that
// sends them to google.com"*. Blocks the whole app until the visitor clicks Agree.
// Disagree sends them to google.com (literal verbatim user spec). Acceptance is persisted
// to localStorage so the gate only shows once per browser. ToS + Privacy pages already
// exist at /terms + /privacy; the gate links to them in new tabs so reading doesn't lose
// the visitor's place at the gate.

import { useEffect, useState, type ReactNode } from 'react'
import './TermsGate.css'

const STORAGE_KEY = 'smol.tos.agreed.v1'
const DISAGREE_REDIRECT_URL = 'https://www.google.com'

interface TermsGateProps {
  readonly children: ReactNode
}

function hasAgreed(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // localStorage blocked (private browsing on iOS, strict cookies, etc.) — fail open so
    // the visitor can still play; we'll re-prompt on every fresh tab. Acceptable trade-off
    // for an alpha-stage indie game.
    return false
  }
}

function recordAgreement(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Swallow — see hasAgreed() comment for rationale.
  }
}

export function TermsGate({ children }: TermsGateProps) {
  const [agreed, setAgreed] = useState<boolean>(() => hasAgreed())

  useEffect(() => {
    // Re-check on mount in case another tab/window updated the flag while this tab was
    // sitting idle. Storage event would be cleaner but a one-shot mount check is enough
    // for the gate use case.
    if (!agreed && hasAgreed()) setAgreed(true)
  }, [agreed])

  if (agreed) return <>{children}</>

  const handleAgree = (): void => {
    recordAgreement()
    setAgreed(true)
  }

  const handleDisagree = (): void => {
    // Per user verbatim "a disagree that sends them to google.com". window.location.href
    // is the cleanest cross-browser redirect; the page unload tears down the React tree.
    window.location.href = DISAGREE_REDIRECT_URL
  }

  return (
    <div className="terms-gate" role="dialog" aria-modal="true" aria-labelledby="terms-gate-title">
      <div className="terms-gate__backdrop" aria-hidden />
      <div className="terms-gate__panel">
        <h1 id="terms-gate-title" className="terms-gate__title">
          🚀 Starship Made of Lies — Alpha
        </h1>
        <p className="terms-gate__intro">
          Before you play, you need to agree to the Terms of Service and acknowledge the Privacy
          Policy. SMoL is in <strong>alpha</strong> — mechanics, save formats, and accounts may
          change without notice.
        </p>

        <ul className="terms-gate__links" aria-label="Policy documents">
          <li>
            <a href="/terms" target="_blank" rel="noreferrer noopener">
              📜 Read the full Terms of Service
            </a>
          </li>
          <li>
            <a href="/privacy" target="_blank" rel="noreferrer noopener">
              🔒 Read the full Privacy Policy
            </a>
          </li>
        </ul>

        <p className="terms-gate__summary">
          By clicking <strong>Agree</strong> you accept the Terms of Service and Privacy Policy. By
          clicking <strong>Disagree</strong> you'll be redirected away from the game.
        </p>

        <div className="terms-gate__actions">
          <button
            type="button"
            className="terms-gate__btn terms-gate__btn--disagree"
            onClick={handleDisagree}
          >
            Disagree
          </button>
          <button
            type="button"
            className="terms-gate__btn terms-gate__btn--agree"
            onClick={handleAgree}
            autoFocus
          >
            ✅ Agree
          </button>
        </div>

        <p className="terms-gate__footnote">
          Unity AI Lab · Alpha v0.01.0 · Your agreement is stored in this browser only.
        </p>
      </div>
    </div>
  )
}
