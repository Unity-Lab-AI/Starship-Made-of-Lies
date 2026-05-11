import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import {
  completeGoogleSignIn,
  getGoogleOAuthServerConfig,
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
    const result = await completeGoogleSignIn({
      code: body.code,
      codeVerifier: body.codeVerifier,
      config,
      store: sharedAccountStore,
      currentTick: 0,
      issueSessionToken,
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
