import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type MatchSnapshot, type SnapshotStore } from '../match/snapshot'

const __dirname = dirname(fileURLToPath(import.meta.url))

function defaultSnapshotDir(): string {
  return process.env.SMOL_SNAPSHOT_DIR ?? join(__dirname, '..', '..', '..', 'data', 'snapshots')
}

export class FileSnapshotStore implements SnapshotStore {
  private readonly dir: string

  constructor(dir?: string) {
    this.dir = dir ?? defaultSnapshotDir()
    if (!existsSync(this.dir)) mkdirSync(this.dir, { recursive: true })
  }

  private pathFor(matchId: string): string {
    const safeId = matchId.replace(/[^a-zA-Z0-9_-]/g, '_')
    return join(this.dir, `${safeId}.json`)
  }

  save(snapshot: MatchSnapshot): void {
    try {
      const tmp = this.pathFor(snapshot.matchId) + '.tmp'
      const final = this.pathFor(snapshot.matchId)
      writeFileSync(tmp, JSON.stringify(snapshot, null, 2), 'utf8')
      writeFileSync(final, JSON.stringify(snapshot, null, 2), 'utf8')
      try {
        unlinkSync(tmp)
      } catch {
        // tmp cleanup non-fatal
      }
    } catch (err) {
      console.error(`[smol/snapshot] save failed for matchId=${snapshot.matchId}:`, err)
    }
  }

  load(matchId: string): MatchSnapshot | null {
    const path = this.pathFor(matchId)
    if (!existsSync(path)) return null
    try {
      const raw = readFileSync(path, 'utf8')
      return JSON.parse(raw) as MatchSnapshot
    } catch (err) {
      console.error(`[smol/snapshot] load failed for matchId=${matchId}:`, err)
      return null
    }
  }

  list(): ReadonlyArray<{ matchId: string; tick: number }> {
    if (!existsSync(this.dir)) return []
    const files = readdirSync(this.dir).filter((f) => f.endsWith('.json'))
    const out: { matchId: string; tick: number }[] = []
    for (const f of files) {
      try {
        const raw = readFileSync(join(this.dir, f), 'utf8')
        const snap = JSON.parse(raw) as MatchSnapshot
        out.push({ matchId: snap.matchId, tick: snap.currentTick })
      } catch {
        // skip corrupted file
      }
    }
    return out
  }

  clear(matchId: string): void {
    const path = this.pathFor(matchId)
    if (existsSync(path)) {
      try {
        unlinkSync(path)
      } catch (err) {
        console.error(`[smol/snapshot] clear failed for matchId=${matchId}:`, err)
      }
    }
  }
}

let _sharedFileSnapshotStore: FileSnapshotStore | null = null

export function getSharedFileSnapshotStore(): FileSnapshotStore {
  if (!_sharedFileSnapshotStore) {
    _sharedFileSnapshotStore = new FileSnapshotStore()
  }
  return _sharedFileSnapshotStore
}
