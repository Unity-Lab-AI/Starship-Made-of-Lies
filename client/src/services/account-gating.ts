export type CloudFeatureId =
  | 'hall_of_champions_submit'
  | 'leaderboard_submit'
  | 'achievement_persistence'
  | 'cloud_save_sync'
  | 'global_match_history'
  | 'cross_device_profile'

export interface CloudFeatureRequirement {
  readonly featureId: CloudFeatureId
  readonly requiresAccount: boolean
  readonly displayName: string
  readonly description: string
}

export const CLOUD_FEATURE_REQUIREMENTS: ReadonlyArray<CloudFeatureRequirement> = [
  {
    featureId: 'hall_of_champions_submit',
    requiresAccount: true,
    displayName: 'Hall of Champions Submission',
    description: 'Submit your match results to the single global Hall of Champions.',
  },
  {
    featureId: 'leaderboard_submit',
    requiresAccount: true,
    displayName: 'Global Leaderboard Submission',
    description: 'Submit scores to the global leaderboard (one global instance, all servers).',
  },
  {
    featureId: 'achievement_persistence',
    requiresAccount: true,
    displayName: 'Persistent Achievements',
    description: 'Achievements unlock across all your devices.',
  },
  {
    featureId: 'cloud_save_sync',
    requiresAccount: true,
    displayName: 'Cloud Save Sync',
    description: 'Sync solo-match saves across devices.',
  },
  {
    featureId: 'global_match_history',
    requiresAccount: true,
    displayName: 'Match History',
    description: 'See all your past matches with full breakdowns.',
  },
  {
    featureId: 'cross_device_profile',
    requiresAccount: true,
    displayName: 'Cross-Device Profile',
    description: 'Your profile follows you across web/desktop/mobile.',
  },
]

const REQ_INDEX: ReadonlyMap<CloudFeatureId, CloudFeatureRequirement> = new Map(
  CLOUD_FEATURE_REQUIREMENTS.map((r) => [r.featureId, r]),
)

export interface AccountState {
  readonly accountId: string | null
  readonly displayName: string | null
  readonly globalLeaderboardOptIn: boolean
}

export function isFeatureAvailable(
  featureId: CloudFeatureId,
  account: AccountState,
): { available: boolean; reason: string | null } {
  const req = REQ_INDEX.get(featureId)
  if (!req) return { available: false, reason: 'unknown_feature' }
  if (req.requiresAccount && !account.accountId) {
    return { available: false, reason: 'account_required' }
  }
  if (
    (featureId === 'hall_of_champions_submit' || featureId === 'leaderboard_submit') &&
    !account.globalLeaderboardOptIn
  ) {
    return { available: false, reason: 'global_leaderboard_opt_in_required' }
  }
  return { available: true, reason: null }
}

const GLOBAL_LB_OPT_IN_KEY = 'smol.account.globalLeaderboardOptIn.v1'

export function getGlobalLeaderboardOptIn(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(GLOBAL_LB_OPT_IN_KEY) === '1'
}

export function setGlobalLeaderboardOptIn(optIn: boolean): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    if (optIn) localStorage.setItem(GLOBAL_LB_OPT_IN_KEY, '1')
    else localStorage.removeItem(GLOBAL_LB_OPT_IN_KEY)
    return true
  } catch {
    return false
  }
}

export function buildLocalPlayPrompt(): string {
  return 'Submit this match to the single global Hall of Champions? You can change this in Settings any time.'
}
