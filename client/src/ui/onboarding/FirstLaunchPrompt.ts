import { type ThemeId, getTheme, getThemePolish } from '@smol/shared'

export interface FirstLaunchCopy {
  readonly themeName: string
  readonly themeEmoji: string
  readonly headline: string
  readonly subhead: string
}

export function buildFirstLaunchCopy(themeId: ThemeId): FirstLaunchCopy {
  const theme = getTheme(themeId)
  const polish = getThemePolish(themeId)
  const article = startsWithVowel(polish.roleLabel) ? 'an' : 'a'
  return {
    themeName: theme.name,
    themeEmoji: theme.emoji,
    headline: `You are ${article} ${polish.roleLabel}`,
    subhead: theme.tagline,
  }
}

function startsWithVowel(s: string): boolean {
  if (s.length === 0) return false
  return /^[aeiou]/i.test(s.trim())
}

const FIRST_LAUNCH_KEY = 'smol.firstLaunchSeen.v1'

export function hasSeenFirstLaunch(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(FIRST_LAUNCH_KEY) === '1'
}

export function markFirstLaunchSeen(): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    localStorage.setItem(FIRST_LAUNCH_KEY, '1')
    return true
  } catch {
    return false
  }
}
