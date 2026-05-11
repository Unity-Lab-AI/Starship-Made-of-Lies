import { type Vec3 } from '@smol/shared'

export interface SpatialAudioOptions {
  readonly listenerPos: Vec3
  readonly eventPos: Vec3
  readonly falloffRadius: number
  readonly minGain?: number
}

export const DEFAULT_FALLOFF_RADIUS = 5000
export const DEFAULT_MIN_GAIN = 0.05

export function distance3(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function computeSpatialGain(opts: SpatialAudioOptions): number {
  const dist = distance3(opts.listenerPos, opts.eventPos)
  const radius = Math.max(1, opts.falloffRadius)
  const linear = Math.max(0, 1 - dist / radius)
  const inverse = 1 / (1 + (dist / radius) * 4)
  const blended = linear * 0.4 + inverse * 0.6
  const minGain = opts.minGain ?? DEFAULT_MIN_GAIN
  if (blended < minGain && dist > radius) return 0
  return Math.max(minGain, Math.min(1, blended))
}

export function computeStereoPan(listenerPos: Vec3, eventPos: Vec3): number {
  const dx = eventPos.x - listenerPos.x
  const dy = eventPos.y - listenerPos.y
  const dz = eventPos.z - listenerPos.z
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
  if (dist === 0) return 0
  const horizontalDist = Math.sqrt(dx * dx + dz * dz)
  if (horizontalDist === 0) return 0
  const normalizedX = dx / horizontalDist
  return Math.max(-1, Math.min(1, normalizedX))
}

export interface SpatialAudioConfig {
  readonly enabled: boolean
  readonly listenerPos: Vec3
  readonly defaultFalloffRadius: number
}

export const DEFAULT_SPATIAL_CONFIG: SpatialAudioConfig = {
  enabled: true,
  listenerPos: { x: 0, y: 0, z: 0 },
  defaultFalloffRadius: DEFAULT_FALLOFF_RADIUS,
}

export function applySpatialGainToNode(
  context: AudioContext,
  gainNode: GainNode,
  spatialOpts: SpatialAudioOptions,
): void {
  const target = computeSpatialGain(spatialOpts)
  gainNode.gain.setTargetAtTime(target, context.currentTime, 0.05)
}
