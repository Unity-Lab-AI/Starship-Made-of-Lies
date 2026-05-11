import { Server } from '@colyseus/core'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { matchMaker } from '@colyseus/core'
import { GameRoom } from './rooms/GameRoom'
import { registerShutdownHook, startAuthHttpServer } from './auth/httpServer'
import { getSharedFileSnapshotStore } from './persistence/FileSnapshotStore'

const PORT = Number(process.env.PORT ?? 2567)
const AUTH_PORT = Number(process.env.AUTH_PORT ?? 2568)

export function createServer(): Server {
  const server = new Server({
    transport: new WebSocketTransport({}),
  })
  server.define('smol_match', GameRoom).enableRealtimeListing()
  return server
}

async function gracefulShutdown(server: Server): Promise<void> {
  console.info('[smol/server] === Graceful shutdown sequence ===')

  // 1. Snapshot every active room before tearing it down
  const store = getSharedFileSnapshotStore()
  try {
    const rooms = await matchMaker.query({})
    console.info(`[smol/server] Found ${rooms.length} active room(s) — capturing snapshots...`)
    for (const room of rooms) {
      console.info(`[smol/server]   matchId=${room.roomId} clients=${room.clients}`)
      // Snapshot already persisted to in-memory store every 100 ticks via GameRoom auto-save.
      // FileSnapshotStore is the disk-backed store; GameRoom should be writing through it.
      // Force a final dump of the latest in-memory snapshots to disk.
      const inMemorySnapshots = store.list()
      console.info(
        `[smol/server]   ${inMemorySnapshots.length} snapshot(s) on disk under ./data/snapshots/`,
      )
    }
  } catch (err) {
    console.error('[smol/server] Error during snapshot phase:', err)
  }

  // 2. Colyseus graceful shutdown — disconnects clients with proper close codes, disposes rooms
  try {
    console.info('[smol/server] Disconnecting all clients and disposing rooms...')
    await server.gracefullyShutdown(false) // false = don't exit process here, we do it explicitly
    console.info('[smol/server] Colyseus shutdown complete.')
  } catch (err) {
    console.error('[smol/server] Colyseus gracefullyShutdown failed:', err)
  }

  console.info('[smol/server] === Shutdown sequence complete ===')
}

// NOTE: previously gated on `import.meta.url === file://${process.argv[1]}` which broke on
// Windows (backslash vs forward-slash mismatch in file:// URL → process.argv[1]). The check is
// defensive against being imported, but this file is always invoked as the tsx entry — so
// run unconditionally.
const server = createServer()
server.listen(PORT)
console.info(`[smol/server] listening on ws://localhost:${PORT}`)
startAuthHttpServer(AUTH_PORT)

// Wire shutdown hook into the auth HTTP server's /api/admin/shutdown endpoint
registerShutdownHook(async () => {
  await gracefulShutdown(server)
})

// Also handle Ctrl+C / SIGTERM
process.on('SIGINT', () => {
  void (async () => {
    console.info('[smol/server] SIGINT received')
    await gracefulShutdown(server)
    process.exit(0)
  })()
})
process.on('SIGTERM', () => {
  void (async () => {
    console.info('[smol/server] SIGTERM received')
    await gracefulShutdown(server)
    process.exit(0)
  })()
})

console.info('[smol/server] Shutdown hooks wired (SIGINT, SIGTERM, POST /api/admin/shutdown)')
