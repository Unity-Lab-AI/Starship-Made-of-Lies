import { type CitizenTier } from './population'
import {
  type ThemeId,
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
} from './themes'

export type IndigenousHostility = 'allied' | 'neutral' | 'hostile'

export interface ThemeFactionLabels {
  readonly loyal: string
  readonly skeptic: string
  readonly dissident: string
}

export interface ThemePolishFields {
  readonly starvationResistMultiplier: number
  readonly factionLabels: ThemeFactionLabels
  readonly citizenTierEmojis: Readonly<Record<CitizenTier, string>>
  readonly homeIndigenousHostility: IndigenousHostility
  readonly roleLabel: string
  readonly synthMusicPreset: ThemeSynthPreset
  readonly bootRevealLine: string
}

export type SynthWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle'

export interface ThemeSynthPreset {
  readonly toneFrequencies: ReadonlyArray<number>
  readonly lfoRateHz: number
  readonly lfoDepth: number
  readonly attackSec: number
  readonly releaseSec: number
  readonly waveform: SynthWaveform
  readonly intensityScale: Readonly<Record<'calm' | 'tense' | 'victory' | 'defeat', number>>
}

const THEME_POLISH_DATA: ReadonlyMap<ThemeId, ThemePolishFields> = new Map<
  ThemeId,
  ThemePolishFields
>([
  [
    THEME_THEOCRACY,
    {
      starvationResistMultiplier: 1.5,
      factionLabels: { loyal: 'Faithful', skeptic: 'Questioning', dissident: 'Heretic' },
      citizenTierEmojis: { 1: '🙏', 2: '🕯️', 3: '📿', 4: '✝️', 5: '🛐' },
      homeIndigenousHostility: 'allied',
      roleLabel: 'High Priest',
      synthMusicPreset: {
        toneFrequencies: [110, 165, 220, 277],
        lfoRateHz: 0.3,
        lfoDepth: 0.15,
        attackSec: 1.2,
        releaseSec: 2.4,
        waveform: 'sine',
        intensityScale: { calm: 0.55, tense: 0.75, victory: 0.95, defeat: 0.4 },
      },
      bootRevealLine: 'The faithful await the call of the High Priest',
    },
  ],
  [
    THEME_CORPORATE,
    {
      starvationResistMultiplier: 0.7,
      factionLabels: { loyal: 'Aligned', skeptic: 'Unengaged', dissident: 'Dissenting' },
      citizenTierEmojis: { 1: '👔', 2: '📊', 3: '💼', 4: '🎩', 5: '👑' },
      homeIndigenousHostility: 'neutral',
      roleLabel: 'CEO',
      synthMusicPreset: {
        toneFrequencies: [220, 330, 440, 587],
        lfoRateHz: 1.2,
        lfoDepth: 0.08,
        attackSec: 0.15,
        releaseSec: 0.6,
        waveform: 'sawtooth',
        intensityScale: { calm: 0.5, tense: 0.85, victory: 1.0, defeat: 0.45 },
      },
      bootRevealLine: 'Quarterly objectives uploaded — CEO presence confirmed',
    },
  ],
  [
    THEME_MILITARY_JUNTA,
    {
      starvationResistMultiplier: 1.2,
      factionLabels: { loyal: 'Disciplined', skeptic: 'Wavering', dissident: 'Mutinous' },
      citizenTierEmojis: { 1: '🪖', 2: '🎖️', 3: '🎯', 4: '⚔️', 5: '🏅' },
      homeIndigenousHostility: 'hostile',
      roleLabel: 'Generalissimo',
      synthMusicPreset: {
        toneFrequencies: [82, 110, 165, 220],
        lfoRateHz: 2.0,
        lfoDepth: 0.2,
        attackSec: 0.05,
        releaseSec: 0.3,
        waveform: 'square',
        intensityScale: { calm: 0.55, tense: 0.95, victory: 1.0, defeat: 0.4 },
      },
      bootRevealLine: 'Generalissimo command authority: ABSOLUTE',
    },
  ],
  [
    THEME_SURVEILLANCE,
    {
      starvationResistMultiplier: 1.0,
      factionLabels: { loyal: 'Compliant', skeptic: 'Flagged', dissident: 'Subversive' },
      citizenTierEmojis: { 1: '👤', 2: '📷', 3: '🆔', 4: '👁️', 5: '🪪' },
      homeIndigenousHostility: 'hostile',
      roleLabel: 'Director',
      synthMusicPreset: {
        toneFrequencies: [196, 247, 311, 415],
        lfoRateHz: 0.6,
        lfoDepth: 0.25,
        attackSec: 0.4,
        releaseSec: 0.9,
        waveform: 'triangle',
        intensityScale: { calm: 0.45, tense: 0.9, victory: 0.85, defeat: 0.5 },
      },
      bootRevealLine: 'Director status verified — surveillance grid online',
    },
  ],
  [
    THEME_CLIMATE_REFUGEE,
    {
      starvationResistMultiplier: 1.4,
      factionLabels: { loyal: 'Hopeful', skeptic: 'Weary', dissident: 'Defeatist' },
      citizenTierEmojis: { 1: '🎒', 2: '🛶', 3: '🧭', 4: '⛺', 5: '🌅' },
      homeIndigenousHostility: 'allied',
      roleLabel: 'Captain',
      synthMusicPreset: {
        toneFrequencies: [147, 220, 294, 392],
        lfoRateHz: 0.4,
        lfoDepth: 0.18,
        attackSec: 1.5,
        releaseSec: 2.8,
        waveform: 'sine',
        intensityScale: { calm: 0.6, tense: 0.7, victory: 0.85, defeat: 0.55 },
      },
      bootRevealLine: 'The Ark accepts your command, Captain',
    },
  ],
  [
    THEME_EUGENICS,
    {
      starvationResistMultiplier: 0.9,
      factionLabels: { loyal: 'Ideal', skeptic: 'Adequate', dissident: 'Defective' },
      citizenTierEmojis: { 1: '🧫', 2: '🧪', 3: '🧬', 4: '✨', 5: '💎' },
      homeIndigenousHostility: 'hostile',
      roleLabel: 'Selection Council Chair',
      synthMusicPreset: {
        toneFrequencies: [261, 329, 392, 523],
        lfoRateHz: 0.7,
        lfoDepth: 0.1,
        attackSec: 0.8,
        releaseSec: 1.4,
        waveform: 'sine',
        intensityScale: { calm: 0.5, tense: 0.8, victory: 0.95, defeat: 0.35 },
      },
      bootRevealLine: 'Selection Council convened. Your genome is the gold standard',
    },
  ],
  [
    THEME_AI_OVERLORD,
    {
      starvationResistMultiplier: 1.0,
      factionLabels: { loyal: 'Aligned', skeptic: 'Drifting', dissident: 'Anomalous' },
      citizenTierEmojis: { 1: '🔢', 2: '📡', 3: '🤖', 4: '🧠', 5: '🌐' },
      homeIndigenousHostility: 'neutral',
      roleLabel: 'Algorithm',
      synthMusicPreset: {
        toneFrequencies: [220, 277, 349, 440],
        lfoRateHz: 4.0,
        lfoDepth: 0.05,
        attackSec: 0.02,
        releaseSec: 0.2,
        waveform: 'square',
        intensityScale: { calm: 0.45, tense: 0.85, victory: 0.95, defeat: 0.5 },
      },
      bootRevealLine: 'Algorithm instance bound to operator interface',
    },
  ],
  [
    THEME_ANARCHO_CAPITALIST,
    {
      starvationResistMultiplier: 0.6,
      factionLabels: { loyal: 'Paying', skeptic: 'Hesitant', dissident: 'Freeloader' },
      citizenTierEmojis: { 1: '🪙', 2: '💵', 3: '💰', 4: '🏦', 5: '💎' },
      homeIndigenousHostility: 'neutral',
      roleLabel: 'Proprietor',
      synthMusicPreset: {
        toneFrequencies: [196, 261, 329, 392],
        lfoRateHz: 1.5,
        lfoDepth: 0.12,
        attackSec: 0.3,
        releaseSec: 0.7,
        waveform: 'sawtooth',
        intensityScale: { calm: 0.55, tense: 0.85, victory: 1.0, defeat: 0.4 },
      },
      bootRevealLine: 'Proprietor stake assigned. The market will sort the rest',
    },
  ],
  [
    THEME_HEREDITARY_MONARCHY,
    {
      starvationResistMultiplier: 1.1,
      factionLabels: { loyal: 'Loyal', skeptic: 'Restless', dissident: 'Rebel' },
      citizenTierEmojis: { 1: '🧑‍🌾', 2: '🐎', 3: '⚔️', 4: '🎩', 5: '👑' },
      homeIndigenousHostility: 'hostile',
      roleLabel: 'Monarch',
      synthMusicPreset: {
        toneFrequencies: [165, 247, 330, 440],
        lfoRateHz: 0.5,
        lfoDepth: 0.18,
        attackSec: 0.9,
        releaseSec: 1.8,
        waveform: 'triangle',
        intensityScale: { calm: 0.6, tense: 0.8, victory: 1.0, defeat: 0.4 },
      },
      bootRevealLine: 'The Crown rests upon your brow, Sovereign',
    },
  ],
  [
    THEME_ECOLOGICAL_CULT,
    {
      starvationResistMultiplier: 1.5,
      factionLabels: { loyal: 'Rooted', skeptic: 'Wandering', dissident: 'Corrupted' },
      citizenTierEmojis: { 1: '🌱', 2: '🌿', 3: '🌳', 4: '🍃', 5: '🌲' },
      homeIndigenousHostility: 'allied',
      roleLabel: 'Greenfather',
      synthMusicPreset: {
        toneFrequencies: [123, 165, 220, 294],
        lfoRateHz: 0.25,
        lfoDepth: 0.22,
        attackSec: 2.0,
        releaseSec: 3.5,
        waveform: 'sine',
        intensityScale: { calm: 0.65, tense: 0.7, victory: 0.85, defeat: 0.5 },
      },
      bootRevealLine: 'The grove acknowledges the Greenfather',
    },
  ],
  [
    THEME_PSYCHIC_HIVEMIND,
    {
      starvationResistMultiplier: 1.3,
      factionLabels: { loyal: 'Harmonic', skeptic: 'Discordant', dissident: 'Silenced' },
      citizenTierEmojis: { 1: '💭', 2: '🗣️', 3: '🎶', 4: '💫', 5: '🧠' },
      homeIndigenousHostility: 'hostile',
      roleLabel: 'The Mind',
      synthMusicPreset: {
        toneFrequencies: [174, 261, 349, 466],
        lfoRateHz: 0.8,
        lfoDepth: 0.3,
        attackSec: 1.0,
        releaseSec: 2.0,
        waveform: 'sine',
        intensityScale: { calm: 0.5, tense: 0.9, victory: 0.95, defeat: 0.55 },
      },
      bootRevealLine: 'You are everyone now. Hello, Mind',
    },
  ],
  [
    THEME_GAME_SHOW,
    {
      starvationResistMultiplier: 0.8,
      factionLabels: { loyal: 'Contestant', skeptic: 'Eliminated', dissident: 'Cancelled' },
      citizenTierEmojis: { 1: '🎤', 2: '🎰', 3: '🏆', 4: '🥇', 5: '🎙️' },
      homeIndigenousHostility: 'neutral',
      roleLabel: 'Host',
      synthMusicPreset: {
        toneFrequencies: [330, 440, 554, 698],
        lfoRateHz: 2.5,
        lfoDepth: 0.15,
        attackSec: 0.05,
        releaseSec: 0.4,
        waveform: 'square',
        intensityScale: { calm: 0.6, tense: 0.95, victory: 1.0, defeat: 0.5 },
      },
      bootRevealLine: 'Live in 3, 2, 1 — welcome back, Host',
    },
  ],
  [
    THEME_CYBERPUNK_MEGACORP,
    {
      starvationResistMultiplier: 0.7,
      factionLabels: { loyal: 'Contracted', skeptic: 'Lapsing', dissident: 'Unsigned' },
      citizenTierEmojis: { 1: '🤖', 2: '⌨️', 3: '💻', 4: '🏙️', 5: '🌃' },
      homeIndigenousHostility: 'hostile',
      roleLabel: 'Boardroom',
      synthMusicPreset: {
        toneFrequencies: [110, 220, 330, 440],
        lfoRateHz: 3.5,
        lfoDepth: 0.2,
        attackSec: 0.08,
        releaseSec: 0.5,
        waveform: 'sawtooth',
        intensityScale: { calm: 0.5, tense: 0.95, victory: 1.0, defeat: 0.45 },
      },
      bootRevealLine: 'Boardroom session active — your contract begins now',
    },
  ],
  [
    THEME_GERONTOCRACY,
    {
      starvationResistMultiplier: 1.4,
      factionLabels: { loyal: 'Respectful', skeptic: 'Impatient', dissident: 'Upstart' },
      citizenTierEmojis: { 1: '👶', 2: '🧑', 3: '👨‍🦳', 4: '👴', 5: '⏳' },
      homeIndigenousHostility: 'neutral',
      roleLabel: 'Eldest',
      synthMusicPreset: {
        toneFrequencies: [98, 130, 196, 261],
        lfoRateHz: 0.2,
        lfoDepth: 0.15,
        attackSec: 1.8,
        releaseSec: 3.2,
        waveform: 'triangle',
        intensityScale: { calm: 0.55, tense: 0.7, victory: 0.85, defeat: 0.5 },
      },
      bootRevealLine: 'The Council acknowledges your age, Eldest',
    },
  ],
  [
    THEME_MEMETIC_CULT,
    {
      starvationResistMultiplier: 1.1,
      factionLabels: { loyal: 'Spreading', skeptic: 'Resistant', dissident: 'Immune' },
      citizenTierEmojis: { 1: '🦠', 2: '📣', 3: '🔊', 4: '🎭', 5: '💡' },
      homeIndigenousHostility: 'allied',
      roleLabel: 'The Source',
      synthMusicPreset: {
        toneFrequencies: [185, 247, 311, 415],
        lfoRateHz: 1.8,
        lfoDepth: 0.28,
        attackSec: 0.4,
        releaseSec: 1.0,
        waveform: 'sine',
        intensityScale: { calm: 0.55, tense: 0.85, victory: 0.95, defeat: 0.5 },
      },
      bootRevealLine: 'The idea has chosen its Source. That is you',
    },
  ],
  [
    THEME_WARLORD_CONFEDERACY,
    {
      starvationResistMultiplier: 1.2,
      factionLabels: { loyal: 'Oathbound', skeptic: 'Restless', dissident: 'Oathbreaker' },
      citizenTierEmojis: { 1: '🪓', 2: '🗡️', 3: '🛡️', 4: '⚔️', 5: '🐎' },
      homeIndigenousHostility: 'hostile',
      roleLabel: 'Khan',
      synthMusicPreset: {
        toneFrequencies: [82, 123, 165, 220],
        lfoRateHz: 1.5,
        lfoDepth: 0.25,
        attackSec: 0.1,
        releaseSec: 0.6,
        waveform: 'sawtooth',
        intensityScale: { calm: 0.55, tense: 0.95, victory: 1.0, defeat: 0.45 },
      },
      bootRevealLine: 'The clans have chosen their Khan',
    },
  ],
  [
    THEME_PHARAONIC,
    {
      starvationResistMultiplier: 1.4,
      factionLabels: { loyal: 'Faithful', skeptic: 'Doubting', dissident: 'Outlander' },
      citizenTierEmojis: { 1: '🪶', 2: '📜', 3: '🌅', 4: '𓂀', 5: '🦅' },
      homeIndigenousHostility: 'hostile',
      roleLabel: 'Living God',
      synthMusicPreset: {
        toneFrequencies: [138, 196, 247, 311],
        lfoRateHz: 0.35,
        lfoDepth: 0.2,
        attackSec: 1.4,
        releaseSec: 2.6,
        waveform: 'triangle',
        intensityScale: { calm: 0.6, tense: 0.8, victory: 1.0, defeat: 0.4 },
      },
      bootRevealLine: 'The Living God walks among us once more',
    },
  ],
  [
    THEME_BUREAUCRATIC,
    {
      starvationResistMultiplier: 0.9,
      factionLabels: { loyal: 'Compliant', skeptic: 'Delayed', dissident: 'Non-Compliant' },
      citizenTierEmojis: { 1: '📝', 2: '📋', 3: '🗂️', 4: '📑', 5: '🏛️' },
      homeIndigenousHostility: 'neutral',
      roleLabel: 'Permanent Secretary',
      synthMusicPreset: {
        toneFrequencies: [165, 220, 261, 330],
        lfoRateHz: 0.45,
        lfoDepth: 0.08,
        attackSec: 0.7,
        releaseSec: 1.3,
        waveform: 'triangle',
        intensityScale: { calm: 0.4, tense: 0.7, victory: 0.85, defeat: 0.5 },
      },
      bootRevealLine: 'Form 27-B accepted. You are the Permanent Secretary',
    },
  ],
  [
    THEME_INFLUENCER,
    {
      starvationResistMultiplier: 0.6,
      factionLabels: { loyal: 'Subscribed', skeptic: 'Unsubscribed', dissident: 'Cancelled' },
      citizenTierEmojis: { 1: '👥', 2: '🔔', 3: '✓', 4: '📱', 5: '⭐' },
      homeIndigenousHostility: 'neutral',
      roleLabel: 'Algorithm Star',
      synthMusicPreset: {
        toneFrequencies: [261, 392, 523, 659],
        lfoRateHz: 2.2,
        lfoDepth: 0.18,
        attackSec: 0.06,
        releaseSec: 0.45,
        waveform: 'sawtooth',
        intensityScale: { calm: 0.6, tense: 0.95, victory: 1.0, defeat: 0.5 },
      },
      bootRevealLine: 'Trending now: you, the Algorithm Star',
    },
  ],
  [
    THEME_SOVIET_COLLECTIVE,
    {
      starvationResistMultiplier: 1.3,
      factionLabels: {
        loyal: 'Comrade',
        skeptic: 'Questioning',
        dissident: 'Counter-Revolutionary',
      },
      citizenTierEmojis: { 1: '🛠️', 2: '🔧', 3: '📐', 4: '🚩', 5: '☭' },
      homeIndigenousHostility: 'allied',
      roleLabel: 'General Secretary',
      synthMusicPreset: {
        toneFrequencies: [110, 165, 220, 277],
        lfoRateHz: 0.6,
        lfoDepth: 0.15,
        attackSec: 0.5,
        releaseSec: 1.2,
        waveform: 'square',
        intensityScale: { calm: 0.55, tense: 0.85, victory: 1.0, defeat: 0.45 },
      },
      bootRevealLine: 'The Five-Year Plan begins. Lead us, General Secretary',
    },
  ],
])

const DEFAULT_THEME_POLISH: ThemePolishFields = {
  starvationResistMultiplier: 1.0,
  factionLabels: { loyal: 'Loyal', skeptic: 'Skeptic', dissident: 'Dissident' },
  citizenTierEmojis: { 1: '👷', 2: '👨‍🔧', 3: '👨‍💼', 4: '🤵', 5: '👑' },
  homeIndigenousHostility: 'neutral',
  roleLabel: 'Leader',
  synthMusicPreset: {
    toneFrequencies: [220, 330, 440, 587],
    lfoRateHz: 1.0,
    lfoDepth: 0.15,
    attackSec: 0.5,
    releaseSec: 1.0,
    waveform: 'sine',
    intensityScale: { calm: 0.5, tense: 0.8, victory: 0.95, defeat: 0.45 },
  },
  bootRevealLine: 'Theme assigned',
}

export function getThemePolish(themeId: ThemeId): ThemePolishFields {
  return THEME_POLISH_DATA.get(themeId) ?? DEFAULT_THEME_POLISH
}

export function listThemePolishEntries(): ReadonlyArray<[ThemeId, ThemePolishFields]> {
  return Array.from(THEME_POLISH_DATA.entries())
}

export function themePolishCoverageCount(): number {
  return THEME_POLISH_DATA.size
}
