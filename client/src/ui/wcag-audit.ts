import { type ThemeId, type ThemePalette, THEMES, getTheme } from '@smol/shared'

export const WCAG_AA_CONTRAST_RATIO = 4.5

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([\da-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const v = parseInt(m[1]!, 16)
  return { r: (v >> 16) & 0xff, g: (v >> 8) & 0xff, b: v & 0xff }
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const linearize = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b)
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  if (!a || !b) return 0
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

export interface PaletteContrastReport {
  readonly themeId: ThemeId
  readonly themeName: string
  readonly bgFgPrimary: number
  readonly bgFgSecondary: number
  readonly bgAccent: number
  readonly bgWarning: number
  readonly bgDanger: number
  readonly bgSuccess: number
  readonly violations: ReadonlyArray<string>
}

export function auditPaletteWCAG(
  palette: ThemePalette,
  themeId: ThemeId,
  themeName: string,
): PaletteContrastReport {
  const bgFgPrimary = contrastRatio(palette.bgPrimary, palette.fgPrimary)
  const bgFgSecondary = contrastRatio(palette.bgPrimary, palette.fgSecondary)
  const bgAccent = contrastRatio(palette.bgPrimary, palette.accent)
  const bgWarning = contrastRatio(palette.bgPrimary, palette.warning)
  const bgDanger = contrastRatio(palette.bgPrimary, palette.danger)
  const bgSuccess = contrastRatio(palette.bgPrimary, palette.success)
  const violations: string[] = []
  if (bgFgPrimary < WCAG_AA_CONTRAST_RATIO) {
    violations.push(`bg-vs-fg-primary: ${bgFgPrimary.toFixed(2)} < ${WCAG_AA_CONTRAST_RATIO}`)
  }
  if (bgFgSecondary < WCAG_AA_CONTRAST_RATIO) {
    violations.push(`bg-vs-fg-secondary: ${bgFgSecondary.toFixed(2)} < ${WCAG_AA_CONTRAST_RATIO}`)
  }
  if (bgAccent < 3.0) {
    violations.push(`bg-vs-accent: ${bgAccent.toFixed(2)} < 3.0 (large-text minimum)`)
  }
  if (bgWarning < 3.0) {
    violations.push(`bg-vs-warning: ${bgWarning.toFixed(2)} < 3.0`)
  }
  if (bgDanger < 3.0) {
    violations.push(`bg-vs-danger: ${bgDanger.toFixed(2)} < 3.0`)
  }
  if (bgSuccess < 3.0) {
    violations.push(`bg-vs-success: ${bgSuccess.toFixed(2)} < 3.0`)
  }
  return {
    themeId,
    themeName,
    bgFgPrimary,
    bgFgSecondary,
    bgAccent,
    bgWarning,
    bgDanger,
    bgSuccess,
    violations,
  }
}

export function auditAllThemes(): ReadonlyArray<PaletteContrastReport> {
  return THEMES.map((t) => auditPaletteWCAG(t.palette, t.id, t.name))
}

export interface PaletteRetuneOverride {
  readonly themeId: ThemeId
  readonly fgSecondary?: string
  readonly accent?: string
  readonly warning?: string
  readonly danger?: string
  readonly success?: string
  readonly muted?: string
  readonly notes: string
}

const RETUNE_OVERRIDES: ReadonlyArray<PaletteRetuneOverride> = []

export function getRetuneOverride(themeId: ThemeId): PaletteRetuneOverride | null {
  for (const o of RETUNE_OVERRIDES) {
    if (o.themeId === themeId) return o
  }
  return null
}

export function paletteWithRetuneApplied(themeId: ThemeId): ThemePalette {
  const base = getTheme(themeId).palette
  const o = getRetuneOverride(themeId)
  if (!o) return base
  return {
    bgPrimary: base.bgPrimary,
    bgSecondary: base.bgSecondary,
    fgPrimary: base.fgPrimary,
    fgSecondary: o.fgSecondary ?? base.fgSecondary,
    accent: o.accent ?? base.accent,
    accentAlt: base.accentAlt,
    success: o.success ?? base.success,
    warning: o.warning ?? base.warning,
    danger: o.danger ?? base.danger,
    muted: o.muted ?? base.muted,
    border: base.border,
  }
}

export function summarizeAuditReport(report: PaletteContrastReport): string {
  if (report.violations.length === 0) return `${report.themeName}: ✓ WCAG AA (4.5:1)`
  return `${report.themeName}: ${report.violations.length} violation(s) — ${report.violations.join('; ')}`
}
