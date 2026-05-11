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
                <svg
                  className="signin-page__google-glyph"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  aria-hidden
                  focusable="false"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
                <span>{signingIn ? 'Redirecting to Google...' : 'Sign in with Google'}</span>
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
