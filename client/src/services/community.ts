export const DISCORD_INVITE_URL = 'https://discord.gg/JyF2bY4BC6'
export const GITHUB_REPO_URL = 'https://github.com/Unity-Lab-AI/Starship-Made-of-Lies'

export type FeedbackChannel = 'discord' | 'github_issues' | 'in_app'

export const PRIMARY_FEEDBACK_CHANNEL: FeedbackChannel = 'discord'

export interface CommunityLink {
  readonly id: string
  readonly label: string
  readonly url: string
  readonly emoji: string
  readonly description: string
}

export const COMMUNITY_LINKS: ReadonlyArray<CommunityLink> = [
  {
    id: 'discord',
    label: 'Open Discord',
    url: DISCORD_INVITE_URL,
    emoji: '💬',
    description: 'Single feedback channel — drop bugs, ideas, and your weirdest match stories.',
  },
  {
    id: 'github',
    label: 'GitHub Repo',
    url: GITHUB_REPO_URL,
    emoji: '📂',
    description: 'Source code (public). `.claude/` workflow is proprietary and gitignored.',
  },
]

export function openDiscord(): void {
  if (typeof window === 'undefined') return
  window.open(DISCORD_INVITE_URL, '_blank', 'noopener,noreferrer')
}
