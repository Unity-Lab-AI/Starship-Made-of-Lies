import { type ThemeId } from '@smol/shared'
import { type AudioMixer } from './AudioMixer'
import { type AudioTrackKind, getThemeTrack } from './themeAudioManifest'

export type MusicIntensity = 'calm' | 'tense' | 'victory' | 'defeat'

export interface MusicSignals {
  readonly underAttack: boolean
  readonly enemyCivAlive: boolean
  readonly playerWonMatch: boolean
  readonly playerLostMatch: boolean
  readonly nearTechApex: boolean
}

export function deriveIntensity(signals: MusicSignals): MusicIntensity {
  if (signals.playerWonMatch) return 'victory'
  if (signals.playerLostMatch) return 'defeat'
  if (signals.underAttack || signals.nearTechApex) return 'tense'
  return 'calm'
}

const INTENSITY_TO_TRACK: Readonly<Record<MusicIntensity, AudioTrackKind>> = {
  calm: 'ambient',
  tense: 'tense',
  victory: 'victory',
  defeat: 'defeat',
}

export interface CrossfadeOptions {
  readonly durationSec: number
}

export const DEFAULT_CROSSFADE_DURATION_SEC = 1.6

interface ActiveLayer {
  readonly intensity: MusicIntensity
  readonly themeId: ThemeId
  readonly source: AudioBufferSourceNode | null
  readonly synthFallback: { stop: () => void } | null
  readonly gain: GainNode
  startedAtTime: number
}

export type SynthFallbackPlayer = (
  context: AudioContext,
  output: AudioNode,
  intensity: MusicIntensity,
) => { stop: () => void }

export class AdaptiveMusic {
  private currentLayer: ActiveLayer | null = null
  private currentThemeId: ThemeId | null = null
  private currentIntensity: MusicIntensity = 'calm'
  private crossfadeDurationSec = DEFAULT_CROSSFADE_DURATION_SEC

  constructor(
    private readonly mixer: AudioMixer,
    private readonly synthFallback: SynthFallbackPlayer,
  ) {}

  setCrossfadeDuration(seconds: number): void {
    if (seconds < 0)
      throw new Error('AdaptiveMusic.setCrossfadeDuration: duration must be non-negative')
    this.crossfadeDurationSec = seconds
  }

  getCurrentIntensity(): MusicIntensity {
    return this.currentIntensity
  }

  getCurrentThemeId(): ThemeId | null {
    return this.currentThemeId
  }

  setTheme(themeId: ThemeId, opts: Partial<CrossfadeOptions> = {}): void {
    if (this.currentThemeId === themeId) return
    this.currentThemeId = themeId
    this.swapLayer(themeId, this.currentIntensity, opts)
  }

  setIntensity(intensity: MusicIntensity, opts: Partial<CrossfadeOptions> = {}): void {
    if (this.currentIntensity === intensity) return
    this.currentIntensity = intensity
    if (this.currentThemeId) {
      this.swapLayer(this.currentThemeId, intensity, opts)
    }
  }

  applySignals(signals: MusicSignals, opts: Partial<CrossfadeOptions> = {}): MusicIntensity {
    const next = deriveIntensity(signals)
    this.setIntensity(next, opts)
    return next
  }

  stop(opts: Partial<CrossfadeOptions> = {}): void {
    if (!this.currentLayer) return
    const duration = opts.durationSec ?? this.crossfadeDurationSec
    this.fadeOutAndDispose(this.currentLayer, duration)
    this.currentLayer = null
  }

  private swapLayer(
    themeId: ThemeId,
    intensity: MusicIntensity,
    opts: Partial<CrossfadeOptions>,
  ): void {
    const ctx = this.mixer.ensureContext()
    const duration = opts.durationSec ?? this.crossfadeDurationSec
    const previous = this.currentLayer
    const newLayer = this.startLayer(ctx, themeId, intensity)
    if (newLayer) this.fadeIn(newLayer, duration)
    if (previous) this.fadeOutAndDispose(previous, duration)
    this.currentLayer = newLayer
  }

  private startLayer(
    ctx: AudioContext,
    themeId: ThemeId,
    intensity: MusicIntensity,
  ): ActiveLayer | null {
    const trackKind = INTENSITY_TO_TRACK[intensity]
    const track = getThemeTrack(themeId, trackKind)
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(this.mixer.busOutput('music'))
    if (track.hasRealAudio) {
      const source = ctx.createBufferSource()
      source.connect(gain)
      return {
        intensity,
        themeId,
        source,
        synthFallback: null,
        gain,
        startedAtTime: ctx.currentTime,
      }
    }
    const fallback = this.synthFallback(ctx, gain, intensity)
    return {
      intensity,
      themeId,
      source: null,
      synthFallback: fallback,
      gain,
      startedAtTime: ctx.currentTime,
    }
  }

  private fadeIn(layer: ActiveLayer, durationSec: number): void {
    const ctx = this.mixer.ensureContext()
    const now = ctx.currentTime
    layer.gain.gain.cancelScheduledValues(now)
    layer.gain.gain.setValueAtTime(0, now)
    layer.gain.gain.linearRampToValueAtTime(1, now + Math.max(0.01, durationSec))
  }

  private fadeOutAndDispose(layer: ActiveLayer, durationSec: number): void {
    const ctx = this.mixer.ensureContext()
    const now = ctx.currentTime
    layer.gain.gain.cancelScheduledValues(now)
    layer.gain.gain.setValueAtTime(layer.gain.gain.value, now)
    layer.gain.gain.linearRampToValueAtTime(0, now + Math.max(0.01, durationSec))
    setTimeout(
      () => {
        if (layer.synthFallback) layer.synthFallback.stop()
        if (layer.source) {
          try {
            layer.source.stop()
          } catch {
            /* already stopped */
          }
        }
        try {
          layer.gain.disconnect()
        } catch {
          /* already disconnected */
        }
      },
      Math.ceil(durationSec * 1000) + 50,
    )
  }
}
