import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import {
  completeGoogleSignIn,
  getAllowedRedirectUris,
  getGoogleOAuthServerConfig,
  isRedirectUriAllowed,
  type GoogleOAuthServerConfig,
} from './google'
import { InMemoryAccountStore, type AccountStore } from '../persistence/AccountStore'

const sharedAccountStore: AccountStore = new InMemoryAccountStore()

const sessionTokens = new Map<string, { accountId: string; issuedAt: number }>()

function issueSessionToken(accountId: string): string {
  const token = randomUUID()
  sessionTokens.set(token, { accountId, issuedAt: Date.now() })
  return token
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
  if (!config) {
    console.warn(
      '[smol/auth] Google OAuth server config missing — set GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI in .env.local. The auth endpoint will return 503 until configured.',
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
    if (req.method === 'GET' && req.url === '/api/auth/health') {
      respondJson(res, 200, {
        ok: true,
        googleConfigured: config !== null,
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
