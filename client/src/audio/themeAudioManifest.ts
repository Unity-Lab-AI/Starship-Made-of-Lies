import {
  type ThemeId,
  THEMES,
  THEME_AI_OVERLORD,
  THEME_ANARCHO_CAPITALIST,
  THEME_BUREAUCRATIC,
  THEME_CLIMATE_REFUGEE,
  THEME_CORPORATE,
  THEME_CYBERPUNK_MEGACORP,
  THEME_ECOLOGICAL_CULT,
  THEME_EUGENICS,
  THEME_GAME_SHOW,
  THEME_GERONTOCRACY,
  THEME_HEREDITARY_MONARCHY,
  THEME_INFLUENCER,
  THEME_MEMETIC_CULT,
  THEME_MILITARY_JUNTA,
  THEME_PHARAONIC,
  THEME_PSYCHIC_HIVEMIND,
  THEME_SOVIET_COLLECTIVE,
  THEME_SURVEILLANCE,
  THEME_THEOCRACY,
  THEME_WARLORD_CONFEDERACY,
} from '@smol/shared'

export type AudioTrackKind = 'ambient' | 'tense' | 'victory' | 'defeat'

export interface ThemeAudioTrack {
  readonly kind: AudioTrackKind
  readonly path: string
  readonly hasRealAudio: boolean
  readonly synthCueFallbackId: 'ambient' | 'tense' | 'victory' | 'defeat'
}

export interface ThemeAudioPack {
  readonly themeId: ThemeId
  readonly slug: string
  readonly tracks: ReadonlyArray<ThemeAudioTrack>
}

const ASSET_BASE = '/assets/themes'

function packFor(themeId: ThemeId, slug: string): ThemeAudioPack {
  const make = (kind: AudioTrackKind): ThemeAudioTrack => ({
    kind,
    path: `${ASSET_BASE}/${slug}/${kind}.ogg`,
    hasRealAudio: false,
    synthCueFallbackId: kind,
  })
  return {
    themeId,
    slug,
    tracks: [make('ambient'), make('tense'), make('victory'), make('defeat')],
  }
}

export const THEME_AUDIO_PACKS: ReadonlyMap<ThemeId, ThemeAudioPack> = new Map<
  ThemeId,
  ThemeAudioPack
>([
  [THEME_THEOCRACY, packFor(THEME_THEOCRACY, 'theocracy')],
  [THEME_CORPORATE, packFor(THEME_CORPORATE, 'corporate-dictatorship')],
  [THEME_MILITARY_JUNTA, packFor(THEME_MILITARY_JUNTA, 'military-junta')],
  [THEME_SURVEILLANCE, packFor(THEME_SURVEILLANCE, 'surveillance-state')],
  [THEME_CLIMATE_REFUGEE, packFor(THEME_CLIMATE_REFUGEE, 'climate-refugee-state')],
  [THEME_EUGENICS, packFor(THEME_EUGENICS, 'eugenics-utopia')],
  [THEME_AI_OVERLORD, packFor(THEME_AI_OVERLORD, 'ai-overlord')],
  [THEME_ANARCHO_CAPITALIST, packFor(THEME_ANARCHO_CAPITALIST, 'anarcho-capitalist')],
  [THEME_HEREDITARY_MONARCHY, packFor(THEME_HEREDITARY_MONARCHY, 'hereditary-monarchy')],
  [THEME_ECOLOGICAL_CULT, packFor(THEME_ECOLOGICAL_CULT, 'ecological-cult')],
  [THEME_PSYCHIC_HIVEMIND, packFor(THEME_PSYCHIC_HIVEMIND, 'psychic-hivemind')],
  [THEME_GAME_SHOW, packFor(THEME_GAME_SHOW, 'game-show-reality')],
  [THEME_CYBERPUNK_MEGACORP, packFor(THEME_CYBERPUNK_MEGACORP, 'cyberpunk-megacorp')],
  [THEME_GERONTOCRACY, packFor(THEME_GERONTOCRACY, 'gerontocracy')],
  [THEME_MEMETIC_CULT, packFor(THEME_MEMETIC_CULT, 'memetic-cult')],
  [THEME_WARLORD_CONFEDERACY, packFor(THEME_WARLORD_CONFEDERACY, 'warlord-confederacy')],
  [THEME_PHARAONIC, packFor(THEME_PHARAONIC, 'pharaonic-dynasty')],
  [THEME_BUREAUCRATIC, packFor(THEME_BUREAUCRATIC, 'bureaucratic-hellscape')],
  [THEME_INFLUENCER, packFor(THEME_INFLUENCER, 'influencer-republic')],
  [THEME_SOVIET_COLLECTIVE, packFor(THEME_SOVIET_COLLECTIVE, 'soviet-collective')],
])

export function getThemeAudioPack(themeId: ThemeId): ThemeAudioPack {
  const pack = THEME_AUDIO_PACKS.get(themeId)
  if (!pack) throw new Error(`getThemeAudioPack: no audio pack for theme ${String(themeId)}`)
  return pack
}

export function getThemeTrack(themeId: ThemeId, kind: AudioTrackKind): ThemeAudioTrack {
  const pack = getThemeAudioPack(themeId)
  const track = pack.tracks.find((t) => t.kind === kind)
  if (!track) throw new Error(`getThemeTrack: theme ${String(themeId)} missing kind ${kind}`)
  return track
}

export function isThemePackComplete(themeId: ThemeId): boolean {
  const pack = THEME_AUDIO_PACKS.get(themeId)
  if (!pack) return false
  return pack.tracks.every((t) => t.hasRealAudio)
}

export function listIncompleteThemePacks(): ReadonlyArray<ThemeId> {
  const out: ThemeId[] = []
  for (const theme of THEMES) {
    if (!isThemePackComplete(theme.id)) out.push(theme.id)
  }
  return out
}

export function realAudioCoverageRatio(): number {
  let total = 0
  let real = 0
  for (const pack of THEME_AUDIO_PACKS.values()) {
    for (const track of pack.tracks) {
      total += 1
      if (track.hasRealAudio) real += 1
    }
  }
  return total > 0 ? real / total : 0
}
