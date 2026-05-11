import { useEffect, useState, useCallback } from 'react'
import {
  type GoogleSignInResponse,
  clearPersistedSession,
  loadPersistedSession,
} from './googleOAuth'

const SESSION_STORAGE_KEY = 'smol:auth:session'

export interface AuthSessionState {
  readonly session: GoogleSignInResponse | null
  readonly isSignedIn: boolean
  readonly signOut: () => void
}

export function useAuthSession(): AuthSessionState {
  const [session, setSession] = useState<GoogleSignInResponse | null>(() => loadPersistedSession())

  useEffect(() => {
    function onStorageChange(event: StorageEvent): void {
      if (event.key !== SESSION_STORAGE_KEY) return
      setSession(loadPersistedSession())
    }
    window.addEventListener('storage', onStorageChange)
    return () => window.removeEventListener('storage', onStorageChange)
  }, [])

  const signOut = useCallback((): void => {
    clearPersistedSession()
    setSession(null)
  }, [])

  return {
    session,
    isSignedIn: session !== null,
    signOut,
  }
}
