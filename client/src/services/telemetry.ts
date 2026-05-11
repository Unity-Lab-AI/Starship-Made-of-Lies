export type TelemetryOptInState = 'unset' | 'opted_in' | 'opted_out'

export interface CrashReport {
  readonly anonymousSessionId: string
  readonly capturedAtIsoUtc: string
  readonly clientVersion: string
  readonly platform: 'web' | 'desktop' | 'android' | 'ios'
  readonly errorMessage: string
  readonly errorStack: string | null
  readonly currentRoute: string
  readonly userAgent: string
  readonly memoryUsageMb: number | null
}

export interface AnonymousMatchEndStats {
  readonly anonymousSessionId: string
  readonly matchId: string
  readonly capturedAtIsoUtc: string
  readonly matchDurationTicks: number
  readonly civCount: number
  readonly aliveAtEnd: number
  readonly winningArchetype: string | null
  readonly winningPlaystyle: string | null
  readonly difficultyDistribution: Readonly<Record<string, number>>
  readonly themeDistribution: Readonly<Record<string, number>>
  readonly outcomeKind:
    | 'objective_met_highscore'
    | 'objective_met_resource'
    | 'objective_met_apex'
    | 'last_civ_standing'
    | 'tick_cap_hit'
    | 'admin_end'
  readonly forbiddenTechCount: number
  readonly colonyShipsLaunched: number
  readonly colonyShipsCrashed: number
  readonly indigenousCivsConquered: number
  readonly lastHopeEvacTriggered: boolean
}

export interface TelemetryPipeline {
  reportCrash(report: CrashReport): Promise<boolean>
  reportMatchEnd(stats: AnonymousMatchEndStats): Promise<boolean>
  getCrashOptIn(): TelemetryOptInState
  getMatchStatsOptIn(): TelemetryOptInState
  setCrashOptIn(state: TelemetryOptInState): void
  setMatchStatsOptIn(state: TelemetryOptInState): void
}

const CRASH_OPT_IN_KEY = 'smol.telemetry.crashOptIn.v1'
const MATCH_STATS_OPT_IN_KEY = 'smol.telemetry.matchStatsOptIn.v1'
const ANON_SESSION_ID_KEY = 'smol.telemetry.anonSessionId.v1'

function readOptIn(key: string): TelemetryOptInState {
  if (typeof localStorage === 'undefined') return 'unset'
  const v = localStorage.getItem(key)
  if (v === 'opted_in' || v === 'opted_out') return v
  return 'unset'
}

function writeOptIn(key: string, state: TelemetryOptInState): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (state === 'unset') localStorage.removeItem(key)
    else localStorage.setItem(key, state)
  } catch {
    /* storage full or denied */
  }
}

export function getOrCreateAnonymousSessionId(): string {
  if (typeof localStorage === 'undefined') return `eph-${Math.random().toString(36).slice(2)}`
  const existing = localStorage.getItem(ANON_SESSION_ID_KEY)
  if (existing) return existing
  const generated = `anon-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
  try {
    localStorage.setItem(ANON_SESSION_ID_KEY, generated)
  } catch {
    /* storage full or denied */
  }
  return generated
}

export interface TelemetryEndpointConfig {
  readonly crashEndpoint: string | null
  readonly matchStatsEndpoint: string | null
}

export class HttpTelemetryPipeline implements TelemetryPipeline {
  constructor(private readonly cfg: TelemetryEndpointConfig) {}

  async reportCrash(report: CrashReport): Promise<boolean> {
    if (this.getCrashOptIn() !== 'opted_in') return false
    if (!this.cfg.crashEndpoint) return false
    try {
      const res = await fetch(this.cfg.crashEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(report),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async reportMatchEnd(stats: AnonymousMatchEndStats): Promise<boolean> {
    if (this.getMatchStatsOptIn() !== 'opted_in') return false
    if (!this.cfg.matchStatsEndpoint) return false
    try {
      const res = await fetch(this.cfg.matchStatsEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(stats),
      })
      return res.ok
    } catch {
      return false
    }
  }

  getCrashOptIn(): TelemetryOptInState {
    return readOptIn(CRASH_OPT_IN_KEY)
  }

  getMatchStatsOptIn(): TelemetryOptInState {
    return readOptIn(MATCH_STATS_OPT_IN_KEY)
  }

  setCrashOptIn(state: TelemetryOptInState): void {
    writeOptIn(CRASH_OPT_IN_KEY, state)
  }

  setMatchStatsOptIn(state: TelemetryOptInState): void {
    writeOptIn(MATCH_STATS_OPT_IN_KEY, state)
  }
}

export function buildCrashReport(
  err: Error,
  ctx: { route: string; platform: CrashReport['platform']; clientVersion: string },
): CrashReport {
  const memoryUsageMb =
    typeof performance !== 'undefined' &&
    'memory' in performance &&
    typeof (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory ===
      'object'
      ? Math.round(
          ((performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory
            ?.usedJSHeapSize ?? 0) /
            (1024 * 1024),
        )
      : null
  return {
    anonymousSessionId: getOrCreateAnonymousSessionId(),
    capturedAtIsoUtc: new Date().toISOString(),
    clientVersion: ctx.clientVersion,
    platform: ctx.platform,
    errorMessage: err.message,
    errorStack: err.stack ?? null,
    currentRoute: ctx.route,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    memoryUsageMb,
  }
}
