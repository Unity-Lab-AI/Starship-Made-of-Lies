const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const PKCE_STORAGE_KEY = 'smol:auth:pkce-verifier'
const STATE_STORAGE_KEY = 'smol:auth:state'

export interface GoogleOAuthConfig {
  readonly clientId: string
  readonly redirectUri: string
  readonly scopes: ReadonlyArray<string>
}

export const DEFAULT_GOOGLE_SCOPES: ReadonlyArray<string> = ['openid', 'profile', 'email']

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string | undefined
  if (!clientId || clientId.length === 0) return null
  const redirectUri = `${window.location.origin}/auth/google/callback`
  return {
    clientId,
    redirectUri,
    scopes: DEFAULT_GOOGLE_SCOPES,
  }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generatePkceVerifierAndChallenge(): Promise<{
  verifier: string
  challenge: string
}> {
  const verifierBytes = new Uint8Array(32)
  window.crypto.getRandomValues(verifierBytes)
  const verifier = base64UrlEncode(verifierBytes)
  const verifierBuffer = new TextEncoder().encode(verifier)
  const digest = await window.crypto.subtle.digest('SHA-256', verifierBuffer)
  const challenge = base64UrlEncode(new Uint8Array(digest))
  return { verifier, challenge }
}

function generateRandomState(): string {
  const stateBytes = new Uint8Array(16)
  window.crypto.getRandomValues(stateBytes)
  return base64UrlEncode(stateBytes)
}

export async function startGoogleSignIn(): Promise<void> {
  const config = getGoogleOAuthConfig()
  if (!config) {
    throw new Error(
      'Google OAuth client ID not configured. Set VITE_GOOGLE_OAUTH_CLIENT_ID in .claude/.env (alongside the server-side secret) — see EXTERNAL_BLOCKERS.md for the Google Cloud Console setup walkthrough.',
    )
  }
  const { verifier, challenge } = await generatePkceVerifierAndChallenge()
  const state = generateRandomState()
  sessionStorage.setItem(PKCE_STORAGE_KEY, verifier)
  sessionStorage.setItem(STATE_STORAGE_KEY, state)
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
    access_type: 'online',
    prompt: 'consent',
  })
  window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export interface GoogleCallbackResult {
  readonly code: string
  readonly codeVerifier: string
  readonly state: string
}

export function readGoogleOAuthCallback(): GoogleCallbackResult | { error: string } {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const error = params.get('error')
  if (error) return { error: `Google sign-in canceled or failed: ${error}` }
  if (!code || !state) return { error: 'Missing OAuth callback parameters.' }
  const storedState = sessionStorage.getItem(STATE_STORAGE_KEY)
  const verifier = sessionStorage.getItem(PKCE_STORAGE_KEY)
  if (!storedState || storedState !== state) {
    return { error: 'OAuth state mismatch — possible CSRF or stale session.' }
  }
  if (!verifier) {
    return { error: 'PKCE verifier missing — session storage cleared mid-flow.' }
  }
  sessionStorage.removeItem(PKCE_STORAGE_KEY)
  sessionStorage.removeItem(STATE_STORAGE_KEY)
  return { code, codeVerifier: verifier, state }
}

export interface GoogleSignInResponse {
  readonly accountId: string
  readonly email: string
  readonly displayName: string
  readonly pictureUrl: string | null
  readonly sessionToken: string
}

export async function exchangeGoogleCodeForSession(
  result: GoogleCallbackResult,
  authEndpoint: string,
): Promise<GoogleSignInResponse> {
  const response = await fetch(authEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: result.code,
      codeVerifier: result.codeVerifier,
      state: result.state,
    }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown error')
    throw new Error(`Google sign-in exchange failed (${response.status}): ${text}`)
  }
  const data = (await response.json()) as GoogleSignInResponse
  return data
}

const SESSION_STORAGE_KEY = 'smol:auth:session'

export function persistSession(session: GoogleSignInResponse): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function loadPersistedSession(): GoogleSignInResponse | null {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GoogleSignInResponse
  } catch {
    return null
  }
}

export function clearPersistedSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}
