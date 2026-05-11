import { Server } from '@colyseus/core'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { GameRoom } from './rooms/GameRoom'
import { startAuthHttpServer } from './auth/httpServer'

const PORT = Number(process.env.PORT ?? 2567)
const AUTH_PORT = Number(process.env.AUTH_PORT ?? 2568)

export function createServer(): Server {
  const server = new Server({
    transport: new WebSocketTransport({}),
  })
  server.define('smol_match', GameRoom).enableRealtimeListing()
  return server
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer()
  server.listen(PORT)
  console.info(`[smol/server] listening on ws://localhost:${PORT}`)
  startAuthHttpServer(AUTH_PORT)
}
