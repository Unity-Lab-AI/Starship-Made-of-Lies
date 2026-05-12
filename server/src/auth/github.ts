// PHASE 17.0 — GitHub OAuth sign-in scaffold. Mirrors `auth/google.ts` shape so the
// httpServer wire-up can stay symmetrical. Set GITHUB_OAUTH_CLIENT_ID /
// GITHUB_OAUTH_CLIENT_SECRET / GITHUB_OAUTH_REDIRECT_URI in `.env.local` to enable.
//
// Flow:
//   1. Client redirects user to https://github.com/login/oauth/authorize with client_id +
//      scope=read:user user:email + state.
//   2. GitHub redirects back to the configured redirect_uri with `?code=...`.
//   3. Client POSTs the code to /api/auth/github/callback on the auth server.
//   4. Server exchanges code → access_token at https://github.com/login/oauth/access_token.
//   5. Server fetches user info from https://api.github.com/user (+ /user/emails if needed).
//   6. Server resolves-or-creates account in the AccountStore + issues a session token.
//
// GitHub does NOT support PKCE for OAuth apps (only for new GitHub Apps), so the flow uses
// the classic client_secret exchange — no code_verifier parameter.

import {
  type Account,
  type AccountCredentials,
  accountId as accountIdValue,
  newAccountLifetimeStats,
} from '@smol/shared'
import { type AccountStore } from '../persistence/AccountStore'

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const GITHUB_USER_URL = 'https://api.github.com/user'
const GITHUB_EMAIL_URL = 'https://api.github.com/user/emails'

export interface GitHubOAuthServerConfig {
  readonly clientId: string
  readonly clientSecret: string
  readonly redirectUri: string
}

export function getGitHubOAuthServerConfig(): GitHubOAuthServerConfig | null {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET
  const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) return null
  return { clientId, clientSecret, redirectUri }
}

export interface GitHubTokenResponse {
  readonly access_token: string
  readonly scope: string
  readonly token_type: string
}

export interface GitHubUserInfo {
  readonly id: number
  readonly login: string
  readonly name: string | null
  readonly email: string | null
  readonly avatar_url: string | null
}

export interface GitHubEmailEntry {
  readonly email: string
  readonly primary: boolean
  readonly verified: boolean
  readonly visibility: 'public' | 'private' | null
}

export async function exchangeCodeForGitHubToken(
  code: string,
  config: GitHubOAuthServerConfig,
  redirectUriOverride?: string,
): Promise<GitHubTokenResponse> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUriOverride ?? config.redirectUri,
  })
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown error')
    throw new Error(`GitHub token exchange failed (${response.status}): ${text}`)
  }
  return (await response.json()) as GitHubTokenResponse
}

export async function fetchGitHubUserInfo(accessToken: string): Promise<GitHubUserInfo> {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'smol-auth',
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown error')
    throw new Error(`GitHub user fetch failed (${response.status}): ${text}`)
  }
  return (await response.json()) as GitHubUserInfo
}

// GitHub /user.email is null when the user keeps email private. Fall back to /user/emails
// + pick the primary verified entry. This requires the `user:email` scope at /authorize.
export async function fetchGitHubPrimaryEmail(accessToken: string): Promise<string | null> {
  const response = await fetch(GITHUB_EMAIL_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'smol-auth',
    },
  })
  if (!response.ok) return null
  const emails = (await response.json()) as ReadonlyArray<GitHubEmailEntry>
  const primary = emails.find((e) => e.primary && e.verified)
  return primary?.email ?? null
}

export function resolveOrCreateGitHubAccount(inputs: {
  readonly userInfo: GitHubUserInfo
  readonly resolvedEmail: string | null
  readonly store: AccountStore
  readonly currentTick: number
}): Account {
  const { userInfo, resolvedEmail, store, currentTick } = inputs
  const externalId = String(userInfo.id)
  for (const existing of store.list()) {
    if (
      existing.credentials.method === 'github' &&
      existing.credentials.externalId === externalId
    ) {
      return existing
    }
  }
  const id = accountIdValue(`github-${externalId}`)
  const credentials: AccountCredentials = {
    method: 'github',
    externalId,
    emailVerified: !!resolvedEmail,
  }
  const account: Account = {
    profile: {
      accountId: id,
      displayName: userInfo.name || userInfo.login || 'GitHub Player',
      handle: userInfo.login,
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

export interface GitHubSignInOutput {
  readonly account: Account
  readonly sessionToken: string
  readonly email: string | null
}

export async function completeGitHubSignIn(input: {
  readonly code: string
  readonly config: GitHubOAuthServerConfig
  readonly store: AccountStore
  readonly currentTick: number
  readonly issueSessionToken: (accountId: string) => string
  readonly clientRedirectUri?: string
}): Promise<GitHubSignInOutput> {
  const tokens = await exchangeCodeForGitHubToken(input.code, input.config, input.clientRedirectUri)
  const userInfo = await fetchGitHubUserInfo(tokens.access_token)
  const resolvedEmail = userInfo.email ?? (await fetchGitHubPrimaryEmail(tokens.access_token))
  const account = resolveOrCreateGitHubAccount({
    userInfo,
    resolvedEmail,
    store: input.store,
    currentTick: input.currentTick,
  })
  const sessionToken = input.issueSessionToken(String(account.profile.accountId))
  return { account, sessionToken, email: resolvedEmail }
}

const BUILT_IN_GITHUB_REDIRECT_URIS: ReadonlyArray<string> = [
  'http://localhost:5173/auth/github/callback',
  'http://localhost:4173/auth/github/callback',
  'https://smol.unityailab.com/auth/github/callback',
]

export function getAllowedGitHubRedirectUris(): ReadonlySet<string> {
  const explicit = (process.env.GITHUB_OAUTH_ALLOWED_REDIRECT_URIS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const fallback = process.env.GITHUB_OAUTH_REDIRECT_URI
  const all = new Set<string>(BUILT_IN_GITHUB_REDIRECT_URIS)
  for (const u of explicit) all.add(u)
  if (fallback && fallback.length > 0) all.add(fallback)
  return all
}

export function isGitHubRedirectUriAllowed(uri: string, allowed: ReadonlySet<string>): boolean {
  if (allowed.size === 0) return false
  return allowed.has(uri)
}
