export type RenderQuality = 'low' | 'medium' | 'high'

export interface RenderQualityConfig {
  readonly quality: RenderQuality
  readonly maxLODTier: 0 | 1 | 2 | 3
  readonly particlesEnabled: boolean
  readonly maxParticles: number
  readonly shadowsEnabled: boolean
  readonly bloomEnabled: boolean
  readonly antialiasing: boolean
  readonly textureAnisotropy: number
  readonly maxRenderedPlanetsPerFrame: number
  readonly maxRenderedFlightsPerFrame: number
  readonly animationDensity: 'minimal' | 'standard' | 'rich'
  readonly targetFps: number
}

export const RENDER_QUALITY_CONFIGS: Readonly<Record<RenderQuality, RenderQualityConfig>> = {
  low: {
    quality: 'low',
    maxLODTier: 1,
    particlesEnabled: false,
    maxParticles: 0,
    shadowsEnabled: false,
    bloomEnabled: false,
    antialiasing: false,
    textureAnisotropy: 1,
    maxRenderedPlanetsPerFrame: 50,
    maxRenderedFlightsPerFrame: 20,
    animationDensity: 'minimal',
    targetFps: 30,
  },
  medium: {
    quality: 'medium',
    maxLODTier: 2,
    particlesEnabled: true,
    maxParticles: 200,
    shadowsEnabled: false,
    bloomEnabled: true,
    antialiasing: true,
    textureAnisotropy: 4,
    maxRenderedPlanetsPerFrame: 200,
    maxRenderedFlightsPerFrame: 50,
    animationDensity: 'standard',
    targetFps: 60,
  },
  high: {
    quality: 'high',
    maxLODTier: 3,
    particlesEnabled: true,
    maxParticles: 1000,
    shadowsEnabled: true,
    bloomEnabled: true,
    antialiasing: true,
    textureAnisotropy: 16,
    maxRenderedPlanetsPerFrame: 1000,
    maxRenderedFlightsPerFrame: 200,
    animationDensity: 'rich',
    targetFps: 60,
  },
}

const STORAGE_KEY = 'smol.settings.render.v1'

export function detectRecommendedQuality(): RenderQuality {
  if (typeof navigator === 'undefined') return 'medium'
  const ua = navigator.userAgent.toLowerCase()
  const isMobile = /android|iphone|ipad|mobile/.test(ua)
  if (isMobile) return 'low'
  const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  if (cores >= 8 && memory >= 8) return 'high'
  if (cores >= 4 && memory >= 4) return 'medium'
  return 'low'
}

export function loadRenderQuality(): RenderQuality {
  if (typeof localStorage === 'undefined') return detectRecommendedQuality()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === 'low' || raw === 'medium' || raw === 'high') return raw
  return detectRecommendedQuality()
}

export function saveRenderQuality(quality: RenderQuality): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    localStorage.setItem(STORAGE_KEY, quality)
    return true
  } catch {
    return false
  }
}

export function getRenderQualityConfig(quality: RenderQuality): RenderQualityConfig {
  return RENDER_QUALITY_CONFIGS[quality]
}

export function applyRenderQualityToDocument(quality: RenderQuality): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset['renderQuality'] = quality
  const cfg = RENDER_QUALITY_CONFIGS[quality]
  document.documentElement.style.setProperty(
    '--anim-density',
    cfg.animationDensity === 'minimal' ? '0.3' : cfg.animationDensity === 'standard' ? '0.7' : '1',
  )
}
