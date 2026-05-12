import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import {
  completeGoogleSignIn,
  getAllowedRedirectUris,
  getGoogleOAuthServerConfig,
  isRedirectUriAllowed,
  type GoogleOAuthServerConfig,
} from './google'
import {
  completeGitHubSignIn,
  getAllowedGitHubRedirectUris,
  getGitHubOAuthServerConfig,
  isGitHubRedirectUriAllowed,
  type GitHubOAuthServerConfig,
} from './github'
import {
  completeDiscordSignIn,
  getAllowedDiscordRedirectUris,
  getDiscordOAuthServerConfig,
  isDiscordRedirectUriAllowed,
  type DiscordOAuthServerConfig,
} from './discord'
import { InMemoryAccountStore, type AccountStore } from '../persistence/AccountStore'
import { FileAccountStore } from '../persistence/FileAccountStore'
import { PostgresAccountStore } from '../persistence/PostgresAccountStore'

// PHASE 17.0 + Layer E #3 — pluggable account persistence backend. Default is file-backed
// (JSON on disk, survives restarts). Set SMOL_ACCOUNT_STORE_BACKEND=memory for ephemeral
// in-memory mode (tests / fresh-state dev). Set SMOL_ACCOUNT_STORE_BACKEND=postgres to use
// the Postgres adapter (requires `pg` package + DATABASE_URL env var). Postgres mode warms
// its cache asynchronously — the first /api/auth/* call after server boot may hit an empty
// cache; the operator should call warmCache() before binding the HTTP server in production.
function buildAccountStore(): AccountStore {
  const backend = (process.env.SMOL_ACCOUNT_STORE_BACKEND ?? 'file').toLowerCase()
  if (backend === 'memory') return new InMemoryAccountStore()
  if (backend === 'postgres') {
    try {
      const store = new PostgresAccountStore()
      // Fire-and-forget cache warm. Errors print + the server stays up with an empty cache;
      // operator can re-warm via `kill -USR1` (TODO: signal handler) or restart.
      store.warmCache().catch((err) => {
        console.error('[smol/auth] PostgresAccountStore.warmCache failed:', err)
      })
      return store
    } catch (err) {
      console.error(
        '[smol/auth] PostgresAccountStore construction failed; falling back to FileAccountStore:',
        err,
      )
      return new FileAccountStore()
    }
  }
  return new FileAccountStore()
}

const sharedAccountStore: AccountStore = buildAccountStore()

// Session tokens cover BOTH signed-in users (real accountId) AND guests (accountId === 'guest').
// Guests use the `guest-<UUIDv4>` shape so log scrubbers can distinguish them at a glance.
// Storing guests in the same map lets us treat token validation uniformly (lookup-based, no
// `startsWith` heuristic — that was a security hole flagged in super-review 2026-05-12).
const sessionTokens = new Map<string, { accountId: string; issuedAt: number }>()

function issueSessionToken(accountId: string): string {
  const token = randomUUID()
  sessionTokens.set(token, { accountId, issuedAt: Date.now() })
  return token
}

function issueGuestSessionToken(): string {
  const token = `guest-${randomUUID()}`
  sessionTokens.set(token, { accountId: 'guest', issuedAt: Date.now() })
  return token
}

export function isGuestToken(token: string): boolean {
  const session = sessionTokens.get(token)
  return session !== undefined && session.accountId === 'guest'
}

function setCors(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8')
        resolve(body.length === 0 ? ({} as T) : (JSON.parse(body) as T))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function respondJson(res: ServerResponse, status: number, payload: unknown): void {
  setCors(res)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

interface GoogleCallbackBody {
  readonly code?: string
  readonly codeVerifier?: string
  readonly state?: string
  // PHASE 16.34 HOTFIX — client sends the EXACT redirect_uri used at /authorize so the
  // server-side /token call uses the same value. Without this, Google rejects with
  // redirect_uri_mismatch whenever the hosted origin (Cloudflare tunnel, ngrok, alt port,
  // production domain) differs from `GOOGLE_OAUTH_REDIRECT_URI` on the server.
  readonly redirectUri?: string
}

async function handleGoogleCallback(
  req: IncomingMessage,
  res: ServerResponse,
  config: GoogleOAuthServerConfig,
): Promise<void> {
  try {
    const body = await readJsonBody<GoogleCallbackBody>(req)
    if (!body.code || !body.codeVerifier) {
      respondJson(res, 400, { error: 'Missing code or codeVerifier in request body.' })
      return
    }
    // PHASE 16.34 HOTFIX — validate client-supplied redirect_uri against the allowlist before
    // forwarding to Google. If the client didn't supply one (legacy callers), fall back to the
    // server's env-var redirect_uri so v1 behavior is preserved. If the client supplied one and
    // it's NOT in the allowlist, return a CLEAR 403 with both the supplied + allowed values so
    // the operator can see exactly what to whitelist.
    let clientRedirectUri: string | undefined
    if (body.redirectUri && body.redirectUri.length > 0) {
      const allowed = getAllowedRedirectUris()
      if (!isRedirectUriAllowed(body.redirectUri, allowed)) {
        respondJson(res, 403, {
          error:
            `Client redirect_uri "${body.redirectUri}" is not in the server allowlist. ` +
            `Add it to GOOGLE_OAUTH_ALLOWED_REDIRECT_URIS (comma-separated) AND register it in ` +
            `Google Cloud Console > APIs & Services > Credentials > your OAuth client > ` +
            `Authorized redirect URIs, then restart the auth server.`,
          suppliedRedirectUri: body.redirectUri,
          allowedRedirectUris: [...allowed],
        })
        return
      }
      clientRedirectUri = body.redirectUri
    }
    const result = await completeGoogleSignIn({
      code: body.code,
      codeVerifier: body.codeVerifier,
      config,
      store: sharedAccountStore,
      currentTick: 0,
      issueSessionToken,
      ...(clientRedirectUri ? { clientRedirectUri } : {}),
    })
    respondJson(res, 200, {
      accountId: String(result.account.profile.accountId),
      email: result.email,
      displayName: result.account.profile.displayName,
      pictureUrl: null,
      sessionToken: result.sessionToken,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[smol/auth] Google callback handler failed:', message)
    respondJson(res, 500, { error: message })
  }
}

// PHASE 17.0 — GitHub OAuth callback. GitHub does NOT use PKCE (no codeVerifier param),
// so the body only requires `code` + optional `redirectUri`.
interface GitHubCallbackBody {
  readonly code?: string
  readonly state?: string
  readonly redirectUri?: string
}

async function handleGitHubCallback(
  req: IncomingMessage,
  res: ServerResponse,
  config: GitHubOAuthServerConfig,
): Promise<void> {
  try {
    const body = await readJsonBody<GitHubCallbackBody>(req)
    if (!body.code) {
      respondJson(res, 400, { error: 'Missing code in request body.' })
      return
    }
    let clientRedirectUri: string | undefined
    if (body.redirectUri && body.redirectUri.length > 0) {
      const allowed = getAllowedGitHubRedirectUris()
      if (!isGitHubRedirectUriAllowed(body.redirectUri, allowed)) {
        respondJson(res, 403, {
          error:
            `Client redirect_uri "${body.redirectUri}" is not in the GitHub allowlist. ` +
            `Add it to GITHUB_OAUTH_ALLOWED_REDIRECT_URIS (comma-separated) AND register it ` +
            `in the GitHub OAuth app's Authorization callback URL.`,
          suppliedRedirectUri: body.redirectUri,
          allowedRedirectUris: [...allowed],
        })
        return
      }
      clientRedirectUri = body.redirectUri
    }
    const result = await completeGitHubSignIn({
      code: body.code,
      config,
      store: sharedAccountStore,
      currentTick: 0,
      issueSessionToken,
      ...(clientRedirectUri ? { clientRedirectUri } : {}),
    })
    respondJson(res, 200, {
      accountId: String(result.account.profile.accountId),
      email: result.email,
      displayName: result.account.profile.displayName,
      pictureUrl: null,
      sessionToken: result.sessionToken,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[smol/auth] GitHub callback handler failed:', message)
    respondJson(res, 500, { error: message })
  }
}

interface DiscordCallbackBody {
  readonly code?: string
  readonly state?: string
  readonly redirectUri?: string
}

async function handleDiscordCallback(
  req: IncomingMessage,
  res: ServerResponse,
  config: DiscordOAuthServerConfig,
): Promise<void> {
  try {
    const body = await readJsonBody<DiscordCallbackBody>(req)
    if (!body.code) {
      respondJson(res, 400, { error: 'Missing code in request body.' })
      return
    }
    let clientRedirectUri: string | undefined
    if (body.redirectUri && body.redirectUri.length > 0) {
      const allowed = getAllowedDiscordRedirectUris()
      if (!isDiscordRedirectUriAllowed(body.redirectUri, allowed)) {
        respondJson(res, 403, {
          error:
            `Client redirect_uri "${body.redirectUri}" is not in the Discord allowlist. ` +
            `Add it to DISCORD_OAUTH_ALLOWED_REDIRECT_URIS (comma-separated) AND register it ` +
            `in the Discord Developer Portal's OAuth2 Redirects list.`,
          suppliedRedirectUri: body.redirectUri,
          allowedRedirectUris: [...allowed],
        })
        return
      }
      clientRedirectUri = body.redirectUri
    }
    const result = await completeDiscordSignIn({
      code: body.code,
      config,
      store: sharedAccountStore,
      currentTick: 0,
      issueSessionToken,
      ...(clientRedirectUri ? { clientRedirectUri } : {}),
    })
    respondJson(res, 200, {
      accountId: String(result.account.profile.accountId),
      email: result.email,
      displayName: result.account.profile.displayName,
      pictureUrl: null,
      sessionToken: result.sessionToken,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[smol/auth] Discord callback handler failed:', message)
    respondJson(res, 500, { error: message })
  }
}

// Matchmaking pre-check. Client POSTs Bearer session token; server validates the token via
// lookup (no `startsWith` heuristic — that was a security hole flagged in super-review
// 2026-05-12) and returns the Colyseus host URL the client uses for `Client.joinOrCreate`.
// Colyseus itself handles real room allocation via its /matchmake HTTP endpoint; this
// endpoint only fails-fast on bad/unknown tokens so the UI shows a clear "sign in again"
// error instead of an opaque WebSocket-rejected message.
interface MatchmakingJoinBody {
  readonly preferredThemeId?: string
  readonly preferredGalaxySize?: string
  readonly coopWithAccountIds?: ReadonlyArray<string>
}

async function handleMatchmakingJoin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const authHeader = req.headers['authorization'] ?? ''
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!bearer) {
      respondJson(res, 401, { error: 'Missing Authorization: Bearer <token> header.' })
      return
    }
    const session = lookupSessionToken(bearer)
    if (!session) {
      respondJson(res, 401, {
        error:
          'Unknown session token. Sign in via /api/auth/* first, or POST /api/auth/guest to mint a guest token.',
      })
      return
    }
    const body = await readJsonBody<MatchmakingJoinBody>(req).catch(
      () => ({}) as MatchmakingJoinBody,
    )
    void body // preferences ignored at v1; future polish uses them for room filtering.
    const host = process.env.SMOL_PUBLIC_WS_URL ?? 'ws://localhost:2567'
    respondJson(res, 200, {
      host,
      tokenIsGuest: session.accountId === 'guest',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[smol/auth] Matchmaking join handler failed:', message)
    respondJson(res, 500, { error: message })
  }
}

// POST /api/auth/guest — mint a new guest session token. Returns `{sessionToken}` shape
// matching the OAuth callback responses so the client can stash it in the same localStorage
// slot. Guest tokens are stored server-side (alongside signed-in tokens) so subsequent
// validation is lookup-based, not heuristic.
async function handleGuestMint(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const token = issueGuestSessionToken()
    respondJson(res, 200, {
      sessionToken: token,
      kind: 'guest',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[smol/auth] Guest mint handler failed:', message)
    respondJson(res, 500, { error: message })
  }
}

export interface AuthHttpServerHandle {
  readonly port: number
  readonly close: () => void
}

export type ShutdownHook = () => Promise<void>

let registeredShutdownHook: ShutdownHook | null = null

export function registerShutdownHook(hook: ShutdownHook): void {
  registeredShutdownHook = hook
}

export function startAuthHttpServer(port = 2568): AuthHttpServerHandle {
  const config = getGoogleOAuthServerConfig()
  const githubConfig = getGitHubOAuthServerConfig()
  const discordConfig = getDiscordOAuthServerConfig()
  if (!config) {
    console.warn(
      '[smol/auth] Google OAuth server config missing — set GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI in .env.local. The auth endpoint will return 503 until configured.',
    )
  }
  if (!githubConfig) {
    console.warn(
      '[smol/auth] GitHub OAuth server config missing — set GITHUB_OAUTH_CLIENT_ID / GITHUB_OAUTH_CLIENT_SECRET / GITHUB_OAUTH_REDIRECT_URI in .env.local. The GitHub endpoint will return 503 until configured.',
    )
  }
  if (!discordConfig) {
    console.warn(
      '[smol/auth] Discord OAuth server config missing — set DISCORD_OAUTH_CLIENT_ID / DISCORD_OAUTH_CLIENT_SECRET / DISCORD_OAUTH_REDIRECT_URI in .env.local. The Discord endpoint will return 503 until configured.',
    )
  }

  const server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      setCors(res)
      res.statusCode = 204
      res.end()
      return
    }
    if (req.method === 'POST' && req.url === '/api/auth/google/callback') {
      if (!config) {
        respondJson(res, 503, {
          error:
            'Google OAuth not configured on server. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI in .env.local and restart the server.',
        })
        return
      }
      await handleGoogleCallback(req, res, config)
      return
    }
    if (req.method === 'POST' && req.url === '/api/auth/github/callback') {
      if (!githubConfig) {
        respondJson(res, 503, {
          error:
            'GitHub OAuth not configured on server. Set GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET, GITHUB_OAUTH_REDIRECT_URI in .env.local and restart the server.',
        })
        return
      }
      await handleGitHubCallback(req, res, githubConfig)
      return
    }
    if (req.method === 'POST' && req.url === '/api/auth/discord/callback') {
      if (!discordConfig) {
        respondJson(res, 503, {
          error:
            'Discord OAuth not configured on server. Set DISCORD_OAUTH_CLIENT_ID, DISCORD_OAUTH_CLIENT_SECRET, DISCORD_OAUTH_REDIRECT_URI in .env.local and restart the server.',
        })
        return
      }
      await handleDiscordCallback(req, res, discordConfig)
      return
    }
    if (req.method === 'POST' && req.url === '/api/matchmaking/join') {
      await handleMatchmakingJoin(req, res)
      return
    }
    if (req.method === 'POST' && req.url === '/api/auth/guest') {
      await handleGuestMint(req, res)
      return
    }
    if (req.method === 'GET' && req.url === '/api/auth/health') {
      respondJson(res, 200, {
        ok: true,
        googleConfigured: config !== null,
        githubConfigured: githubConfig !== null,
        discordConfigured: discordConfig !== null,
        accountsRegistered: sharedAccountStore.list().length,
      })
      return
    }
    if (req.method === 'POST' && req.url === '/api/admin/shutdown') {
      respondJson(res, 200, {
        ok: true,
        message: 'Shutdown initiated — saving all active matches, disconnecting clients.',
      })
      // Schedule shutdown AFTER the response flushes (give it 250ms to send)
      setTimeout(() => {
        void (async () => {
          if (registeredShutdownHook) {
            console.info('[smol/auth] Shutdown hook invoked — running graceful shutdown...')
            try {
              await registeredShutdownHook()
            } catch (err) {
              console.error('[smol/auth] Shutdown hook failed:', err)
            }
          }
          console.info('[smol/auth] Server exiting.')
          process.exit(0)
        })()
      }, 250)
      return
    }
    setCors(res)
    res.statusCode = 404
    res.end('Not found')
  })

  server.listen(port, () => {
    console.info(`[smol/auth] HTTP auth server listening on http://localhost:${port}`)
    console.info(`[smol/auth]   POST /api/auth/google/callback   (Google OAuth exchange)`)
    console.info(`[smol/auth]   POST /api/auth/github/callback   (GitHub OAuth exchange)`)
    console.info(`[smol/auth]   POST /api/auth/discord/callback  (Discord OAuth exchange)`)
    console.info(
      `[smol/auth]   POST /api/matchmaking/join        (token pre-check + Colyseus host hint)`,
    )
    console.info(`[smol/auth]   POST /api/auth/guest              (mint guest session token)`)
    console.info(`[smol/auth]   GET  /api/auth/health             (status check)`)
    // PHASE 16.34.1 — log the live redirect_uri allowlist on startup so the operator can see
    // exactly which URIs the server will accept from clients. If you're hitting a 403 mismatch,
    // this is the source of truth for "what's whitelisted right now".
    const allowed = getAllowedRedirectUris()
    if (allowed.size === 0) {
      console.warn('[smol/auth]   Redirect-URI allowlist: EMPTY (sign-in will fail)')
    } else {
      console.info('[smol/auth]   Redirect-URI allowlist:')
      for (const u of allowed) console.info(`[smol/auth]     - ${u}`)
    }
  })

  return {
    port,
    close: () => server.close(),
  }
}

export function getSharedAccountStore(): AccountStore {
  return sharedAccountStore
}

export function lookupSessionToken(token: string): { accountId: string; issuedAt: number } | null {
  return sessionTokens.get(token) ?? null
}
