import { type ThemeId, type Vec3 } from '@smol/shared'
import {
  AudioMixer,
  type AudioBusId,
  type AudioMixerSnapshot,
  loadMixerSnapshotFromLocalStorage,
} from './AudioMixer'
import { AdaptiveMusic, type MusicIntensity, type MusicSignals } from './AdaptiveMusic'
import { type SfxEventId, getSfxEventDef, resolveSfxParams } from './sfxManifest'
import { type SpatialAudioOptions, computeSpatialGain, computeStereoPan } from './spatialAudio'

export interface AudioSystemOptions {
  readonly mixerSnapshot?: AudioMixerSnapshot
}

export class AudioSystem {
  readonly mixer: AudioMixer
  readonly music: AdaptiveMusic
  private currentThemeId: ThemeId | null = null

  constructor(opts: AudioSystemOptions = {}) {
    const snapshot = opts.mixerSnapshot ?? loadMixerSnapshotFromLocalStorage() ?? undefined
    this.mixer = new AudioMixer(snapshot ?? undefined)
    this.music = new AdaptiveMusic(this.mixer, (ctx, output, intensity) =>
      synthMusicLayer(ctx, output, intensity),
    )
  }

  setTheme(themeId: ThemeId): void {
    this.currentThemeId = themeId
    this.music.setTheme(themeId)
  }

  setIntensity(intensity: MusicIntensity): void {
    this.music.setIntensity(intensity)
  }

  applyMusicSignals(signals: MusicSignals): MusicIntensity {
    return this.music.applySignals(signals)
  }

  setBusVolume(bus: AudioBusId, value: number): void {
    this.mixer.setBusVolume(bus, value)
    this.mixer.saveToLocalStorage()
  }

  setBusMuted(bus: AudioBusId, muted: boolean): void {
    this.mixer.setBusMuted(bus, muted)
    this.mixer.saveToLocalStorage()
  }

  setGlobalMuted(muted: boolean): void {
    this.mixer.setGlobalMuted(muted)
    this.mixer.saveToLocalStorage()
  }

  playSfx(eventId: SfxEventId, opts: { spatial?: SpatialAudioOptions } = {}): void {
    const ctx = this.mixer.ensureContext()
    const def = getSfxEventDef(eventId)
    const params = resolveSfxParams(eventId, this.currentThemeId)
    const busOutput = this.mixer.busOutput(def.bus)
    const oscillator = ctx.createOscillator()
    oscillator.type = params.waveform
    oscillator.frequency.value = params.frequencyHz
    if (typeof params.endFrequencyHz === 'number') {
      oscillator.frequency.linearRampToValueAtTime(
        params.endFrequencyHz,
        ctx.currentTime + params.durationMs / 1000,
      )
    }
    const gain = ctx.createGain()
    gain.gain.value = 0
    const peak = params.peakGain * (opts.spatial ? computeSpatialGain(opts.spatial) : 1)
    if (peak <= 0) {
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.01)
      return
    }
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(peak, now + params.attackMs / 1000)
    gain.gain.setValueAtTime(peak, now + (params.durationMs - params.releaseMs) / 1000)
    gain.gain.linearRampToValueAtTime(0, now + params.durationMs / 1000)
    oscillator.connect(gain)
    if (opts.spatial && typeof StereoPannerNode !== 'undefined') {
      const panner = ctx.createStereoPanner()
      panner.pan.value = computeStereoPan(opts.spatial.listenerPos, opts.spatial.eventPos)
      gain.connect(panner)
      panner.connect(busOutput)
    } else {
      gain.connect(busOutput)
    }
    oscillator.start(now)
    oscillator.stop(now + params.durationMs / 1000 + 0.05)
  }

  playSpatialSfx(
    eventId: SfxEventId,
    eventPos: Vec3,
    listenerPos: Vec3,
    falloffRadius: number,
  ): void {
    this.playSfx(eventId, {
      spatial: { eventPos, listenerPos, falloffRadius },
    })
  }
}

let SINGLETON: AudioSystem | null = null

export function getAudioSystem(): AudioSystem {
  if (!SINGLETON) SINGLETON = new AudioSystem()
  return SINGLETON
}

export function resetAudioSystemForTests(): void {
  SINGLETON = null
}

interface MusicLayerHandle {
  stop(): void
}

function synthMusicLayer(
  ctx: AudioContext,
  output: AudioNode,
  intensity: MusicIntensity,
): MusicLayerHandle {
  const params = synthParamsForIntensity(intensity)
  const gain = ctx.createGain()
  gain.gain.value = 1
  gain.connect(output)
  const oscillators: OscillatorNode[] = []
  for (const tone of params.tones) {
    const osc = ctx.createOscillator()
    osc.type = tone.waveform
    osc.frequency.value = tone.frequencyHz
    const oscGain = ctx.createGain()
    oscGain.gain.value = tone.gain
    osc.connect(oscGain)
    oscGain.connect(gain)
    osc.start()
    oscillators.push(osc)
  }
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = params.lfoFrequencyHz
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = params.lfoDepth
  lfo.connect(lfoGain)
  lfoGain.connect(gain.gain)
  lfo.start()
  return {
    stop: () => {
      try {
        for (const osc of oscillators) osc.stop()
        lfo.stop()
        gain.disconnect()
      } catch {
        /* already stopped */
      }
    },
  }
}

interface SynthMusicTone {
  readonly waveform: 'sine' | 'square' | 'sawtooth' | 'triangle'
  readonly frequencyHz: number
  readonly gain: number
}

interface SynthMusicParams {
  readonly tones: ReadonlyArray<SynthMusicTone>
  readonly lfoFrequencyHz: number
  readonly lfoDepth: number
}

function synthParamsForIntensity(intensity: MusicIntensity): SynthMusicParams {
  switch (intensity) {
    case 'calm':
      return {
        tones: [
          { waveform: 'sine', frequencyHz: 220, gain: 0.18 },
          { waveform: 'sine', frequencyHz: 330, gain: 0.12 },
          { waveform: 'triangle', frequencyHz: 110, gain: 0.1 },
        ],
        lfoFrequencyHz: 0.18,
        lfoDepth: 0.06,
      }
    case 'tense':
      return {
        tones: [
          { waveform: 'sawtooth', frequencyHz: 110, gain: 0.16 },
          { waveform: 'square', frequencyHz: 165, gain: 0.1 },
          { waveform: 'sine', frequencyHz: 55, gain: 0.18 },
        ],
        lfoFrequencyHz: 1.4,
        lfoDepth: 0.18,
      }
    case 'victory':
      return {
        tones: [
          { waveform: 'sine', frequencyHz: 523, gain: 0.16 },
          { waveform: 'sine', frequencyHz: 659, gain: 0.14 },
          { waveform: 'sine', frequencyHz: 784, gain: 0.12 },
          { waveform: 'triangle', frequencyHz: 261, gain: 0.18 },
        ],
        lfoFrequencyHz: 0.6,
        lfoDepth: 0.08,
      }
    case 'defeat':
      return {
        tones: [
          { waveform: 'sawtooth', frequencyHz: 73, gain: 0.2 },
          { waveform: 'sine', frequencyHz: 110, gain: 0.14 },
          { waveform: 'triangle', frequencyHz: 55, gain: 0.18 },
        ],
        lfoFrequencyHz: 0.25,
        lfoDepth: 0.12,
      }
  }
}
