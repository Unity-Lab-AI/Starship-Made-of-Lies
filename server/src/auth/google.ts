import {
  type Account,
  type AccountCredentials,
  accountId as accountIdValue,
  applyMatchResultToStats,
  newAccountLifetimeStats,
} from '@smol/shared'
import { type AccountStore } from '../persistence/AccountStore'

void applyMatchResultToStats

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

export interface GoogleOAuthServerConfig {
  readonly clientId: string
  readonly clientSecret: string
  readonly redirectUri: string
}

export function getGoogleOAuthServerConfig(): GoogleOAuthServerConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) return null
  return { clientId, clientSecret, redirectUri }
}

export interface GoogleTokenResponse {
  readonly access_token: string
  readonly expires_in: number
  readonly id_token: string
  readonly scope: string
  readonly token_type: string
  readonly refresh_token?: string
}

export interface GoogleUserInfo {
  readonly sub: string
  readonly email: string
  readonly email_verified: boolean
  readonly name: string
  readonly picture: string | null
}

export async function exchangeCodeForGoogleTokens(
  code: string,
  codeVerifier: string,
  config: GoogleOAuthServerConfig,
  // PHASE 16.34 HOTFIX — the redirect_uri sent to Google /token MUST exactly match the one
  // the client used at /authorize. The client derives that from `window.location.origin`
  // (so it varies by host: localhost dev vs Cloudflare tunnel vs prod domain). Caller passes
  // the client's exact value here after allowlist-validating it; falls back to config.redirectUri
  // for legacy callers. Without this override, server-side env-var-only flows reject every
  // hosted setup that isn't 1:1 with the env var (redirect_uri_mismatch from Google).
  redirectUriOverride?: string,
): Promise<GoogleTokenResponse> {
  const effectiveRedirectUri = redirectUriOverride ?? config.redirectUri
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    code_verifier: codeVerifier,
    redirect_uri: effectiveRedirectUri,
    grant_type: 'authorization_code',
  })
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown error')
    throw new Error(`Google token exchange failed (${response.status}): ${text}`)
  }
  return (await response.json()) as GoogleTokenResponse
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown error')
    throw new Error(`Google userinfo fetch failed (${response.status}): ${text}`)
  }
  return (await response.json()) as GoogleUserInfo
}

export interface ResolveGoogleAccountInputs {
  readonly userInfo: GoogleUserInfo
  readonly store: AccountStore
  readonly currentTick: number
}

export function resolveOrCreateGoogleAccount(inputs: ResolveGoogleAccountInputs): Account {
  const { userInfo, store, currentTick } = inputs
  for (const existing of store.list()) {
    if (
      existing.credentials.method === 'google' &&
      existing.credentials.externalId === userInfo.sub
    ) {
      return existing
    }
  }
  const id = accountIdValue(`google-${userInfo.sub}`)
  const credentials: AccountCredentials = {
    method: 'google',
    externalId: userInfo.sub,
    emailVerified: userInfo.email_verified,
  }
  const account: Account = {
    profile: {
      accountId: id,
      displayName: userInfo.name || userInfo.email || 'Player',
      handle: userInfo.email || userInfo.sub,
      createdAtTick: currentTick,
      favoriteThemeId: null,
      cosmeticUnlocks: new Set<string>(),
      badgeIds: new Set<string>(),
    },
    credentials,
    stats: newAccountLifetimeStats(),
  }
  store.create(account)
  return account
}

export interface GoogleSignInOutput {
  readonly account: Account
  readonly sessionToken: string
  readonly email: string
}

export async function completeGoogleSignIn(input: {
  readonly code: string
  readonly codeVerifier: string
  readonly config: GoogleOAuthServerConfig
  readonly store: AccountStore
  readonly currentTick: number
  readonly issueSessionToken: (accountId: string) => string
  // PHASE 16.34 HOTFIX — exact redirect_uri the client used at /authorize. Server-supplied
  // env-var redirect_uri (config.redirectUri) used as fallback for legacy callers.
  readonly clientRedirectUri?: string
}): Promise<GoogleSignInOutput> {
  const tokens = await exchangeCodeForGoogleTokens(
    input.code,
    input.codeVerifier,
    input.config,
    input.clientRedirectUri,
  )
  const userInfo = await fetchGoogleUserInfo(tokens.access_token)
  const account = resolveOrCreateGoogleAccount({
    userInfo,
    store: input.store,
    currentTick: input.currentTick,
  })
  const sessionToken = input.issueSessionToken(String(account.profile.accountId))
  return { account, sessionToken, email: userInfo.email }
}

// PHASE 16.34 HOTFIX — allowlist for client-supplied redirect_uri. Server-side env var
// `GOOGLE_OAUTH_ALLOWED_REDIRECT_URIS` (comma-separated) is the primary source. The single
// `GOOGLE_OAUTH_REDIRECT_URI` env var is automatically added to the allowlist if present so
// existing deployments don't break. Empty allowlist = block ALL client-supplied URIs (server
// falls back to its env-var redirect_uri, preserving v1 behavior).
export function getAllowedRedirectUris(): ReadonlySet<string> {
  const explicit = (process.env.GOOGLE_OAUTH_ALLOWED_REDIRECT_URIS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const fallback = process.env.GOOGLE_OAUTH_REDIRECT_URI
  const all = new Set<string>(explicit)
  if (fallback && fallback.length > 0) all.add(fallback)
  return all
}

export function isRedirectUriAllowed(uri: string, allowed: ReadonlySet<string>): boolean {
  if (allowed.size === 0) return false
  return allowed.has(uri)
}
