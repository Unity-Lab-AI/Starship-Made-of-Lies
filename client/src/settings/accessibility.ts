export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'

export interface AccessibilitySettings {
  reducedMotion: boolean
  fontScale: number
  highContrast: boolean
  colorBlindMode: ColorBlindMode
  screenShake: boolean
  flashWarnings: boolean
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  reducedMotion: false,
  fontScale: 1.0,
  highContrast: false,
  colorBlindMode: 'none',
  screenShake: true,
  flashWarnings: true,
}

const STORAGE_KEY = 'smol.settings.accessibility.v1'

export function loadAccessibilitySettings(): AccessibilitySettings {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_ACCESSIBILITY_SETTINGS }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { ...DEFAULT_ACCESSIBILITY_SETTINGS }
  try {
    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS }
  }
}

export function saveAccessibilitySettings(settings: AccessibilitySettings): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    return true
  } catch {
    return false
  }
}

export function clampFontScale(value: number): number {
  return Math.max(0.8, Math.min(1.4, value))
}

export function applyAccessibilityToDocument(settings: AccessibilitySettings): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--font-scale', settings.fontScale.toString())
  root.dataset['reducedMotion'] = settings.reducedMotion ? 'true' : 'false'
  root.dataset['highContrast'] = settings.highContrast ? 'true' : 'false'
  root.dataset['colorBlindMode'] = settings.colorBlindMode
  root.dataset['screenShake'] = settings.screenShake ? 'true' : 'false'
  root.dataset['flashWarnings'] = settings.flashWarnings ? 'true' : 'false'
}

export const COLOR_BLIND_MODE_LABELS: Readonly<Record<ColorBlindMode, string>> = {
  none: 'Off',
  protanopia: 'Protanopia (red-blind)',
  deuteranopia: 'Deuteranopia (green-blind)',
  tritanopia: 'Tritanopia (blue-blind)',
}
