import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  exchangeGoogleCodeForSession,
  persistSession,
  readGoogleOAuthCallback,
} from '../../auth/googleOAuth'
import './SubPage.css'

const SERVER_AUTH_ENDPOINT =
  (import.meta.env.VITE_SMOL_SERVER_BASE_URL as string | undefined) ??
  `${window.location.origin}/api/auth/google/callback`

export function GoogleOAuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState<string>('Verifying Google sign-in...')

  useEffect(() => {
    const callback = readGoogleOAuthCallback()
    if ('error' in callback) {
      setStatus('error')
      setMessage(callback.error)
      return
    }
    void (async () => {
      try {
        const session = await exchangeGoogleCodeForSession(callback, SERVER_AUTH_ENDPOINT)
        persistSession(session)
        setStatus('success')
        setMessage(`Welcome, ${session.displayName}.`)
        const timer = setTimeout(() => navigate('/', { replace: true }), 1200)
        return () => clearTimeout(timer)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : String(err))
        return undefined
      }
    })()
  }, [navigate])

  return (
    <div className="sub-page">
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <h1>
          {status === 'verifying'
            ? 'Verifying...'
            : status === 'success'
              ? 'Signed in'
              : 'Sign-in failed'}
        </h1>
        <p>{message}</p>
        {status === 'error' ? (
          <button type="button" onClick={() => navigate('/signin', { replace: true })}>
            ← Back to sign-in
          </button>
        ) : null}
      </main>
    </div>
  )
}
