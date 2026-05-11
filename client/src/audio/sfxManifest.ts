import { type ThemeId } from '@smol/shared'

export type SfxEventId =
  | 'click'
  | 'click-back'
  | 'build-start'
  | 'build-complete'
  | 'launch-colony-ship'
  | 'colony-ship-impact'
  | 'colony-ship-intercepted'
  | 'colony-established'
  | 'research-progress-tick'
  | 'research-complete'
  | 'tech-apex-unlocked'
  | 'campaign-launch'
  | 'conscript-citizens'
  | 'civ-defeated'
  | 'achievement-unlocked'
  | 'beacon-alert-incoming'
  | 'beacon-alert-impact'
  | 'match-victory'
  | 'match-defeat'
  | 'ui-error'

export type SfxBus = 'sfx' | 'voice' | 'music'

export interface SfxSynthParams {
  readonly waveform: 'sine' | 'square' | 'sawtooth' | 'triangle'
  readonly frequencyHz: number
  readonly endFrequencyHz?: number
  readonly durationMs: number
  readonly attackMs: number
  readonly releaseMs: number
  readonly peakGain: number
}

export interface SfxEventDef {
  readonly id: SfxEventId
  readonly bus: SfxBus
  readonly synthParams: SfxSynthParams
  readonly assetPath?: string
}

const SFX_EVENT_DEFS: ReadonlyArray<SfxEventDef> = [
  {
    id: 'click',
    bus: 'sfx',
    synthParams: {
      waveform: 'square',
      frequencyHz: 880,
      durationMs: 60,
      attackMs: 4,
      releaseMs: 30,
      peakGain: 0.18,
    },
  },
  {
    id: 'click-back',
    bus: 'sfx',
    synthParams: {
      waveform: 'square',
      frequencyHz: 600,
      durationMs: 70,
      attackMs: 4,
      releaseMs: 40,
      peakGain: 0.16,
    },
  },
  {
    id: 'build-start',
    bus: 'sfx',
    synthParams: {
      waveform: 'triangle',
      frequencyHz: 220,
      endFrequencyHz: 440,
      durationMs: 220,
      attackMs: 8,
      releaseMs: 80,
      peakGain: 0.25,
    },
  },
  {
    id: 'build-complete',
    bus: 'sfx',
    synthParams: {
      waveform: 'sine',
      frequencyHz: 660,
      endFrequencyHz: 990,
      durationMs: 350,
      attackMs: 10,
      releaseMs: 120,
      peakGain: 0.32,
    },
  },
  {
    id: 'launch-colony-ship',
    bus: 'sfx',
    synthParams: {
      waveform: 'sawtooth',
      frequencyHz: 110,
      endFrequencyHz: 880,
      durationMs: 800,
      attackMs: 30,
      releaseMs: 200,
      peakGain: 0.4,
    },
  },
  {
    id: 'colony-ship-impact',
    bus: 'sfx',
    synthParams: {
      waveform: 'sawtooth',
      frequencyHz: 220,
      endFrequencyHz: 55,
      durationMs: 600,
      attackMs: 5,
      releaseMs: 350,
      peakGain: 0.5,
    },
  },
  {
    id: 'colony-ship-intercepted',
    bus: 'sfx',
    synthParams: {
      waveform: 'square',
      frequencyHz: 880,
      endFrequencyHz: 220,
      durationMs: 400,
      attackMs: 5,
      releaseMs: 200,
      peakGain: 0.42,
    },
  },
  {
    id: 'colony-established',
    bus: 'sfx',
    synthParams: {
      waveform: 'sine',
      frequencyHz: 440,
      endFrequencyHz: 880,
      durationMs: 1200,
      attackMs: 200,
      releaseMs: 600,
      peakGain: 0.36,
    },
  },
  {
    id: 'research-progress-tick',
    bus: 'sfx',
    synthParams: {
      waveform: 'sine',
      frequencyHz: 1320,
      durationMs: 30,
      attackMs: 2,
      releaseMs: 18,
      peakGain: 0.08,
    },
  },
  {
    id: 'research-complete',
    bus: 'sfx',
    synthParams: {
      waveform: 'triangle',
      frequencyHz: 523,
      endFrequencyHz: 1046,
      durationMs: 700,
      attackMs: 30,
      releaseMs: 300,
      peakGain: 0.4,
    },
  },
  {
    id: 'tech-apex-unlocked',
    bus: 'music',
    synthParams: {
      waveform: 'sine',
      frequencyHz: 261,
      endFrequencyHz: 1568,
      durationMs: 2200,
      attackMs: 200,
      releaseMs: 1200,
      peakGain: 0.48,
    },
  },
  {
    id: 'campaign-launch',
    bus: 'voice',
    synthParams: {
      waveform: 'sawtooth',
      frequencyHz: 220,
      endFrequencyHz: 660,
      durationMs: 600,
      attackMs: 60,
      releaseMs: 250,
      peakGain: 0.35,
    },
  },
  {
    id: 'conscript-citizens',
    bus: 'sfx',
    synthParams: {
      waveform: 'square',
      frequencyHz: 165,
      durationMs: 350,
      attackMs: 8,
      releaseMs: 150,
      peakGain: 0.4,
    },
  },
  {
    id: 'civ-defeated',
    bus: 'sfx',
    synthParams: {
      waveform: 'sawtooth',
      frequencyHz: 440,
      endFrequencyHz: 55,
      durationMs: 1500,
      attackMs: 30,
      releaseMs: 800,
      peakGain: 0.5,
    },
  },
  {
    id: 'achievement-unlocked',
    bus: 'sfx',
    synthParams: {
      waveform: 'triangle',
      frequencyHz: 880,
      endFrequencyHz: 1760,
      durationMs: 600,
      attackMs: 30,
      releaseMs: 250,
      peakGain: 0.45,
    },
  },
  {
    id: 'beacon-alert-incoming',
    bus: 'sfx',
    synthParams: {
      waveform: 'square',
      frequencyHz: 1320,
      durationMs: 200,
      attackMs: 4,
      releaseMs: 80,
      peakGain: 0.32,
    },
  },
  {
    id: 'beacon-alert-impact',
    bus: 'sfx',
    synthParams: {
      waveform: 'sawtooth',
      frequencyHz: 110,
      durationMs: 400,
      attackMs: 4,
      releaseMs: 200,
      peakGain: 0.55,
    },
  },
  {
    id: 'match-victory',
    bus: 'music',
    synthParams: {
      waveform: 'sine',
      frequencyHz: 523,
      endFrequencyHz: 1568,
      durationMs: 3500,
      attackMs: 200,
      releaseMs: 2000,
      peakGain: 0.55,
    },
  },
  {
    id: 'match-defeat',
    bus: 'music',
    synthParams: {
      waveform: 'sawtooth',
      frequencyHz: 440,
      endFrequencyHz: 110,
      durationMs: 3500,
      attackMs: 200,
      releaseMs: 2000,
      peakGain: 0.5,
    },
  },
  {
    id: 'ui-error',
    bus: 'sfx',
    synthParams: {
      waveform: 'square',
      frequencyHz: 220,
      endFrequencyHz: 110,
      durationMs: 280,
      attackMs: 4,
      releaseMs: 160,
      peakGain: 0.32,
    },
  },
]

const SFX_EVENT_INDEX: ReadonlyMap<SfxEventId, SfxEventDef> = new Map(
  SFX_EVENT_DEFS.map((d) => [d.id, d]),
)

export function getSfxEventDef(id: SfxEventId): SfxEventDef {
  const def = SFX_EVENT_INDEX.get(id)
  if (!def) throw new Error(`getSfxEventDef: unknown SFX event ${id}`)
  return def
}

export function listSfxEventIds(): ReadonlyArray<SfxEventId> {
  return SFX_EVENT_DEFS.map((d) => d.id)
}

export interface ThemeSfxOverrides {
  readonly themeId: ThemeId
  readonly overrides: ReadonlyMap<SfxEventId, Partial<SfxSynthParams>>
}

const THEME_SFX_OVERRIDES = new Map<ThemeId, ReadonlyMap<SfxEventId, Partial<SfxSynthParams>>>()

export function registerThemeSfxOverrides(overrides: ThemeSfxOverrides): void {
  THEME_SFX_OVERRIDES.set(overrides.themeId, overrides.overrides)
}

export function resolveSfxParams(eventId: SfxEventId, themeId: ThemeId | null): SfxSynthParams {
  const base = getSfxEventDef(eventId).synthParams
  if (!themeId) return base
  const overrides = THEME_SFX_OVERRIDES.get(themeId)
  if (!overrides) return base
  const overrideParams = overrides.get(eventId)
  if (!overrideParams) return base
  return { ...base, ...overrideParams }
}
