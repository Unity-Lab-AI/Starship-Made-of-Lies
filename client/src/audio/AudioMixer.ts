export type AudioBusId = 'master' | 'music' | 'sfx' | 'voice'

export interface AudioBusState {
  readonly id: AudioBusId
  volume: number
  muted: boolean
}

export interface AudioMixerSnapshot {
  readonly buses: ReadonlyArray<AudioBusState>
  readonly globalMuted: boolean
}

const STORAGE_KEY = 'smol.audio.mixer.v1'

interface PersistedMixer {
  readonly buses: ReadonlyArray<AudioBusState>
  readonly globalMuted: boolean
}

function defaultBuses(): AudioBusState[] {
  return [
    { id: 'master', volume: 0.8, muted: false },
    { id: 'music', volume: 0.7, muted: false },
    { id: 'sfx', volume: 0.85, muted: false },
    { id: 'voice', volume: 0.9, muted: false },
  ]
}

export class AudioMixer {
  private readonly buses: Map<AudioBusId, AudioBusState>
  private globalMuted = false
  private context: AudioContext | null = null
  private readonly gainNodes = new Map<AudioBusId, GainNode>()
  private masterGain: GainNode | null = null

  constructor(initial?: AudioMixerSnapshot) {
    this.buses = new Map()
    const buses = initial?.buses ?? defaultBuses()
    for (const bus of buses) {
      this.buses.set(bus.id, { ...bus })
    }
    if (initial) this.globalMuted = initial.globalMuted
  }

  ensureContext(): AudioContext {
    if (this.context) return this.context
    type WebkitWindow = Window & {
      webkitAudioContext?: typeof AudioContext
    }
    const Ctor =
      typeof window !== 'undefined' &&
      (window.AudioContext ?? (window as WebkitWindow).webkitAudioContext)
    if (!Ctor)
      throw new Error('AudioMixer.ensureContext: AudioContext not available in this environment')
    const ctx = new Ctor()
    this.context = ctx
    this.masterGain = ctx.createGain()
    this.masterGain.connect(ctx.destination)
    this.applyMasterGain()
    for (const id of ['music', 'sfx', 'voice'] as AudioBusId[]) {
      const node = ctx.createGain()
      node.connect(this.masterGain)
      this.gainNodes.set(id, node)
      this.applyBusGain(id)
    }
    return ctx
  }

  busOutput(id: AudioBusId): GainNode {
    this.ensureContext()
    if (id === 'master') {
      if (!this.masterGain) throw new Error('AudioMixer.busOutput: masterGain not initialized')
      return this.masterGain
    }
    const node = this.gainNodes.get(id)
    if (!node) throw new Error(`AudioMixer.busOutput: bus ${id} not initialized`)
    return node
  }

  setBusVolume(id: AudioBusId, value: number): void {
    const clamped = Math.min(1, Math.max(0, value))
    const bus = this.buses.get(id)
    if (!bus) throw new Error(`AudioMixer.setBusVolume: unknown bus ${id}`)
    bus.volume = clamped
    this.applyBusGain(id)
  }

  setBusMuted(id: AudioBusId, muted: boolean): void {
    const bus = this.buses.get(id)
    if (!bus) throw new Error(`AudioMixer.setBusMuted: unknown bus ${id}`)
    bus.muted = muted
    this.applyBusGain(id)
  }

  setGlobalMuted(muted: boolean): void {
    this.globalMuted = muted
    this.applyMasterGain()
  }

  isGloballyMuted(): boolean {
    return this.globalMuted
  }

  getBusState(id: AudioBusId): AudioBusState {
    const bus = this.buses.get(id)
    if (!bus) throw new Error(`AudioMixer.getBusState: unknown bus ${id}`)
    return { ...bus }
  }

  snapshot(): AudioMixerSnapshot {
    const buses: AudioBusState[] = []
    for (const id of ['master', 'music', 'sfx', 'voice'] as AudioBusId[]) {
      const bus = this.buses.get(id)
      if (bus) buses.push({ ...bus })
    }
    return { buses, globalMuted: this.globalMuted }
  }

  loadSnapshot(snapshot: AudioMixerSnapshot): void {
    this.globalMuted = snapshot.globalMuted
    for (const bus of snapshot.buses) {
      const existing = this.buses.get(bus.id)
      if (existing) {
        existing.volume = bus.volume
        existing.muted = bus.muted
        this.applyBusGain(bus.id)
      }
    }
    this.applyMasterGain()
  }

  saveToLocalStorage(): boolean {
    if (typeof localStorage === 'undefined') return false
    const persisted: PersistedMixer = this.snapshot()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
      return true
    } catch {
      return false
    }
  }

  private applyBusGain(id: AudioBusId): void {
    if (id === 'master') {
      this.applyMasterGain()
      return
    }
    const node = this.gainNodes.get(id)
    const bus = this.buses.get(id)
    if (!node || !bus) return
    const target = bus.muted ? 0 : bus.volume
    if (this.context) {
      node.gain.setTargetAtTime(target, this.context.currentTime, 0.02)
    } else {
      node.gain.value = target
    }
  }

  private applyMasterGain(): void {
    if (!this.masterGain) return
    const bus = this.buses.get('master')
    if (!bus) return
    const target = bus.muted || this.globalMuted ? 0 : bus.volume
    if (this.context) {
      this.masterGain.gain.setTargetAtTime(target, this.context.currentTime, 0.02)
    } else {
      this.masterGain.gain.value = target
    }
  }
}

export function loadMixerSnapshotFromLocalStorage(): AudioMixerSnapshot | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedMixer
    if (!Array.isArray(parsed.buses)) return null
    return parsed
  } catch {
    return null
  }
}
