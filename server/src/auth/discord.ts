// PHASE 17.0 — Discord OAuth sign-in scaffold. Mirrors `auth/google.ts` shape. Discord
// uses OAuth 2.0 with PKCE optional + client_secret required. Set DISCORD_OAUTH_CLIENT_ID /
// DISCORD_OAUTH_CLIENT_SECRET / DISCORD_OAUTH_REDIRECT_URI in `.env.local` to enable.
//
// Flow:
//   1. Client redirects user to https://discord.com/oauth2/authorize with response_type=code +
//      scope=identify+email + state.
//   2. Discord redirects back to redirect_uri with `?code=...`.
//   3. Client POSTs the code to /api/auth/discord/callback.
//   4. Server exchanges code → access_token at https://discord.com/api/v10/oauth2/token.
//   5. Server fetches user info from https://discord.com/api/v10/users/@me.
//   6. Server resolves-or-creates account + issues a session token.

import {
  type Account,
  type AccountCredentials,
  accountId as accountIdValue,
  newAccountLifetimeStats,
} from '@smol/shared'
import { type AccountStore } from '../persistence/AccountStore'

const DISCORD_TOKEN_URL = 'https://discord.com/api/v10/oauth2/token'
const DISCORD_USER_URL = 'https://discord.com/api/v10/users/@me'

export interface DiscordOAuthServerConfig {
  readonly clientId: string
  readonly clientSecret: string
  readonly redirectUri: string
}

export function getDiscordOAuthServerConfig(): DiscordOAuthServerConfig | null {
  const clientId = process.env.DISCORD_OAUTH_CLIENT_ID
  const clientSecret = process.env.DISCORD_OAUTH_CLIENT_SECRET
  const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) return null
  return { clientId, clientSecret, redirectUri }
}

export interface DiscordTokenResponse {
  readonly access_token: string
  readonly expires_in: number
  readonly refresh_token: string
  readonly scope: string
  readonly token_type: string
}

export interface DiscordUserInfo {
  readonly id: string
  readonly username: string
  readonly global_name: string | null
  readonly email: string | null
  readonly verified: boolean
  readonly avatar: string | null
}

export async function exchangeCodeForDiscordToken(
  code: string,
  config: DiscordOAuthServerConfig,
  redirectUriOverride?: string,
): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUriOverride ?? config.redirectUri,
  })
  const response = await fetch(DISCORD_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown error')
    throw new Error(`Discord token exchange failed (${response.status}): ${text}`)
  }
  return (await response.json()) as DiscordTokenResponse
}

export async function fetchDiscordUserInfo(accessToken: string): Promise<DiscordUserInfo> {
  const response = await fetch(DISCORD_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown error')
    throw new Error(`Discord user fetch failed (${response.status}): ${text}`)
  }
  return (await response.json()) as DiscordUserInfo
}

export function resolveOrCreateDiscordAccount(inputs: {
  readonly userInfo: DiscordUserInfo
  readonly store: AccountStore
  readonly currentTick: number
}): Account {
  const { userInfo, store, currentTick } = inputs
  for (const existing of store.list()) {
    if (
      existing.credentials.method === 'discord' &&
      existing.credentials.externalId === userInfo.id
    ) {
      return existing
    }
  }
  const id = accountIdValue(`discord-${userInfo.id}`)
  const credentials: AccountCredentials = {
    method: 'discord',
    externalId: userInfo.id,
    emailVerified: userInfo.verified,
  }
  const account: Account = {
    profile: {
      accountId: id,
      displayName: userInfo.global_name || userInfo.username || 'Discord Player',
      handle: userInfo.username,
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

export interface DiscordSignInOutput {
  readonly account: Account
  readonly sessionToken: string
  readonly email: string | null
}

export async function completeDiscordSignIn(input: {
  readonly code: string
  readonly config: DiscordOAuthServerConfig
  readonly store: AccountStore
  readonly currentTick: number
  readonly issueSessionToken: (accountId: string) => string
  readonly clientRedirectUri?: string
}): Promise<DiscordSignInOutput> {
  const tokens = await exchangeCodeForDiscordToken(
    input.code,
    input.config,
    input.clientRedirectUri,
  )
  const userInfo = await fetchDiscordUserInfo(tokens.access_token)
  const account = resolveOrCreateDiscordAccount({
    userInfo,
    store: input.store,
    currentTick: input.currentTick,
  })
  const sessionToken = input.issueSessionToken(String(account.profile.accountId))
  return { account, sessionToken, email: userInfo.email }
}

const BUILT_IN_DISCORD_REDIRECT_URIS: ReadonlyArray<string> = [
  'http://localhost:5173/auth/discord/callback',
  'http://localhost:4173/auth/discord/callback',
  'https://smol.unityailab.com/auth/discord/callback',
]

export function getAllowedDiscordRedirectUris(): ReadonlySet<string> {
  const explicit = (process.env.DISCORD_OAUTH_ALLOWED_REDIRECT_URIS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const fallback = process.env.DISCORD_OAUTH_REDIRECT_URI
  const all = new Set<string>(BUILT_IN_DISCORD_REDIRECT_URIS)
  for (const u of explicit) all.add(u)
  if (fallback && fallback.length > 0) all.add(fallback)
  return all
}

export function isDiscordRedirectUriAllowed(uri: string, allowed: ReadonlySet<string>): boolean {
  if (allowed.size === 0) return false
  return allowed.has(uri)
}
