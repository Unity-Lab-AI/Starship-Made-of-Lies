export type SynthCue =
  | 'click'
  | 'build'
  | 'launch'
  | 'citizen'
  | 'ambient'
  | 'tense'
  | 'victory'
  | 'defeat'

export interface SynthOptions {
  readonly volume?: number
  readonly themeAccent?: string
}

let sharedCtx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (sharedCtx) return sharedCtx
  if (typeof window === 'undefined') {
    throw new Error('AudioContext unavailable in non-browser environment')
  }
  const ctor: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!ctor) throw new Error('AudioContext not supported')
  sharedCtx = new ctor()
  return sharedCtx
}

export function playSynthCue(cue: SynthCue, opts: SynthOptions = {}): void {
  if (typeof window === 'undefined') return
  let ctx: AudioContext
  try {
    ctx = getAudioContext()
  } catch {
    return
  }
  const volume = clamp01(opts.volume ?? 0.18)
  switch (cue) {
    case 'click':
      tone(ctx, 880, 0.05, 'square', volume)
      break
    case 'build':
      arpeggio(ctx, [392, 523, 659], 0.08, 'triangle', volume)
      break
    case 'launch':
      sweep(ctx, 220, 660, 0.4, volume)
      break
    case 'citizen':
      tone(ctx, 660, 0.08, 'sine', volume * 0.8)
      break
    case 'ambient':
      ambientPad(ctx, 110, 4, volume * 0.4)
      break
    case 'tense':
      ambientPad(ctx, 75, 4, volume * 0.45)
      break
    case 'victory':
      arpeggio(ctx, [523, 659, 784, 1046], 0.15, 'sawtooth', volume)
      break
    case 'defeat':
      arpeggio(ctx, [330, 277, 220, 165], 0.2, 'sine', volume)
      break
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  wave: OscillatorType,
  volume: number,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = wave
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration + 0.05)
}

function arpeggio(
  ctx: AudioContext,
  freqs: ReadonlyArray<number>,
  stepDuration: number,
  wave: OscillatorType,
  volume: number,
): void {
  freqs.forEach((freq, idx) => {
    const start = ctx.currentTime + idx * stepDuration
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = wave
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(volume, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + stepDuration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + stepDuration + 0.02)
  })
}

function sweep(
  ctx: AudioContext,
  fromFreq: number,
  toFreq: number,
  duration: number,
  volume: number,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(fromFreq, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(toFreq, ctx.currentTime + duration)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration + 0.05)
}

function ambientPad(ctx: AudioContext, rootFreq: number, duration: number, volume: number): void {
  const oscRoot = ctx.createOscillator()
  const oscFifth = ctx.createOscillator()
  const gain = ctx.createGain()
  oscRoot.type = 'sine'
  oscFifth.type = 'sine'
  oscRoot.frequency.value = rootFreq
  oscFifth.frequency.value = rootFreq * 1.5
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + duration * 0.25)
  gain.gain.linearRampToValueAtTime(volume * 0.6, ctx.currentTime + duration * 0.75)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  oscRoot.connect(gain)
  oscFifth.connect(gain)
  gain.connect(ctx.destination)
  oscRoot.start()
  oscFifth.start()
  oscRoot.stop(ctx.currentTime + duration + 0.05)
  oscFifth.stop(ctx.currentTime + duration + 0.05)
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}
