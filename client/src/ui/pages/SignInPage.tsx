import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { THEMES, themeAsCSSVars } from '@smol/shared'
import {
  clearPersistedSession,
  getGoogleOAuthConfig,
  loadPersistedSession,
  startGoogleSignIn,
} from '../../auth/googleOAuth'
import './SubPage.css'
import './SignInPage.css'

export function SignInPage() {
  const navigate = useNavigate()
  const theme = THEMES[0]!
  const styleVars = themeAsCSSVars(theme)
  const existingSession = loadPersistedSession()
  const googleConfig = getGoogleOAuthConfig()
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)

  const handleGoogleSignIn = async (): Promise<void> => {
    setError(null)
    setSigningIn(true)
    try {
      await startGoogleSignIn()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setSigningIn(false)
    }
  }

  const handleContinueAsGuest = (): void => {
    navigate('/new-game', { state: { authMode: 'guest' } })
  }

  const handleSignOut = (): void => {
    clearPersistedSession()
    window.location.reload()
  }

  return (
    <div className="sub-page" style={styleVars as React.CSSProperties}>
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Sign In</h1>
      </header>
      <main className="signin-page__content">
        {existingSession ? (
          <section className="signin-page__signed-in">
            <h2>Signed in as {existingSession.displayName}</h2>
            <p className="signin-page__email">{existingSession.email}</p>
            <div className="signin-page__signed-in-actions">
              <button
                type="button"
                className="signin-page__btn signin-page__btn-primary"
                onClick={() => navigate('/new-game')}
              >
                Start a match
              </button>
              <button
                type="button"
                className="signin-page__btn signin-page__btn-secondary"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </section>
        ) : (
          <section className="signin-page__providers">
            <p className="signin-page__intro">
              Sign in to record matches, climb the Hall of Champions, and unlock achievements across
              devices. Continue as Guest plays locally — progress saves on this device only.
            </p>
            <div className="signin-page__provider-list">
              <button
                type="button"
                className="signin-page__btn signin-page__btn-google"
                onClick={handleGoogleSignIn}
                disabled={!googleConfig || signingIn}
              >
                <span className="signin-page__google-glyph" aria-hidden>
                  G
                </span>
                <span>{signingIn ? 'Redirecting to Google...' : 'Continue with Google'}</span>
              </button>
              {!googleConfig ? (
                <p className="signin-page__provider-disabled">
                  Google sign-in disabled — `VITE_GOOGLE_OAUTH_CLIENT_ID` not configured. See
                  EXTERNAL_BLOCKERS.md for the Google Cloud Console setup walkthrough.
                </p>
              ) : null}
              <button
                type="button"
                className="signin-page__btn signin-page__btn-disabled"
                disabled
                title="Discord OAuth — wired in a follow-up phase."
              >
                Continue with Discord (coming soon)
              </button>
              <button
                type="button"
                className="signin-page__btn signin-page__btn-disabled"
                disabled
                title="Apple OAuth — requires Apple Developer account."
              >
                Continue with Apple (coming soon)
              </button>
              <button
                type="button"
                className="signin-page__btn signin-page__btn-disabled"
                disabled
                title="Email magic-link — wired in a follow-up phase."
              >
                Email magic-link (coming soon)
              </button>
            </div>
            <div className="signin-page__divider">
              <span>or</span>
            </div>
            <button
              type="button"
              className="signin-page__btn signin-page__btn-guest"
              onClick={handleContinueAsGuest}
            >
              Continue as Guest (Player 1)
            </button>
            {error ? <p className="signin-page__error">{error}</p> : null}
          </section>
        )}
      </main>
    </div>
  )
}
