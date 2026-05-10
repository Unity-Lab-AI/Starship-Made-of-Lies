import { type AIPersonalityArchetype, type Theme, type ThemeId, THEMES, getTheme } from './themes'

export function rollThemeForCiv(rng: () => number, excludedThemes?: ReadonlySet<ThemeId>): ThemeId {
  const candidates =
    excludedThemes && excludedThemes.size > 0
      ? THEMES.filter((t) => !excludedThemes.has(t.id))
      : THEMES
  if (candidates.length === 0) throw new Error('rollThemeForCiv: no candidate themes available')
  const idx = Math.floor(rng() * candidates.length)
  const picked = candidates[idx]
  if (!picked) throw new Error('rollThemeForCiv: index out of range')
  return picked.id
}

export function rollDistinctThemes(rng: () => number, count: number): ReadonlyArray<ThemeId> {
  if (count > THEMES.length) {
    throw new Error(`rollDistinctThemes: requested ${count} distinct themes from ${THEMES.length}`)
  }
  const pool = [...THEMES]
  const out: ThemeId[] = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length)
    const picked = pool.splice(idx, 1)[0]
    if (!picked) throw new Error('rollDistinctThemes: empty pool')
    out.push(picked.id)
  }
  return out
}

export function inheritThemeForColony(parentCivThemeId: ThemeId): ThemeId {
  return parentCivThemeId
}

export const DEFAULT_THEME_CONVERSION_TICKS = 60

export interface ThemeConversion {
  readonly sourceThemeId: ThemeId
  readonly targetThemeId: ThemeId
  readonly ticksTotal: number
  ticksRemaining: number
}

export function newThemeConversion(
  sourceThemeId: ThemeId,
  targetThemeId: ThemeId,
  ticksTotal: number = DEFAULT_THEME_CONVERSION_TICKS,
): ThemeConversion {
  if (ticksTotal <= 0) {
    throw new Error(`newThemeConversion: ticksTotal must be positive, got ${ticksTotal}`)
  }
  if (sourceThemeId === targetThemeId) {
    throw new Error('newThemeConversion: source and target themes must differ')
  }
  return { sourceThemeId, targetThemeId, ticksTotal, ticksRemaining: ticksTotal }
}

export function themeConversionProgress(conv: ThemeConversion): number {
  if (conv.ticksTotal <= 0) return 1
  return 1 - conv.ticksRemaining / conv.ticksTotal
}

export function applyThemeConversionTick(conv: ThemeConversion): boolean {
  if (conv.ticksRemaining > 0) conv.ticksRemaining -= 1
  return conv.ticksRemaining <= 0
}

export function isThemeConversionComplete(conv: ThemeConversion): boolean {
  return conv.ticksRemaining <= 0
}

export interface AIPersonalityBias {
  readonly aggression: number
  readonly expansion: number
  readonly propagandaSpend: number
  readonly tradeAffinity: number
  readonly diplomacyPriority: number
  readonly forbiddenTechAffinity: number
  readonly suicideShipPreference: number
}

export const ARCHETYPE_BIASES: Readonly<Record<AIPersonalityArchetype, AIPersonalityBias>> = {
  warmonger: {
    aggression: 0.9,
    expansion: 0.7,
    propagandaSpend: 0.3,
    tradeAffinity: 0.1,
    diplomacyPriority: 0.2,
    forbiddenTechAffinity: 0.6,
    suicideShipPreference: 0.7,
  },
  expansionist: {
    aggression: 0.5,
    expansion: 0.9,
    propagandaSpend: 0.5,
    tradeAffinity: 0.3,
    diplomacyPriority: 0.4,
    forbiddenTechAffinity: 0.4,
    suicideShipPreference: 0.5,
  },
  builder: {
    aggression: 0.3,
    expansion: 0.5,
    propagandaSpend: 0.4,
    tradeAffinity: 0.6,
    diplomacyPriority: 0.5,
    forbiddenTechAffinity: 0.2,
    suicideShipPreference: 0.3,
  },
  trader: {
    aggression: 0.2,
    expansion: 0.4,
    propagandaSpend: 0.3,
    tradeAffinity: 0.9,
    diplomacyPriority: 0.7,
    forbiddenTechAffinity: 0.3,
    suicideShipPreference: 0.2,
  },
  cultist: {
    aggression: 0.6,
    expansion: 0.5,
    propagandaSpend: 0.9,
    tradeAffinity: 0.2,
    diplomacyPriority: 0.3,
    forbiddenTechAffinity: 0.7,
    suicideShipPreference: 0.9,
  },
  isolationist: {
    aggression: 0.3,
    expansion: 0.2,
    propagandaSpend: 0.5,
    tradeAffinity: 0.3,
    diplomacyPriority: 0.4,
    forbiddenTechAffinity: 0.3,
    suicideShipPreference: 0.3,
  },
  subversive: {
    aggression: 0.5,
    expansion: 0.4,
    propagandaSpend: 0.8,
    tradeAffinity: 0.5,
    diplomacyPriority: 0.4,
    forbiddenTechAffinity: 0.8,
    suicideShipPreference: 0.6,
  },
  opportunist: {
    aggression: 0.4,
    expansion: 0.5,
    propagandaSpend: 0.5,
    tradeAffinity: 0.6,
    diplomacyPriority: 0.5,
    forbiddenTechAffinity: 0.5,
    suicideShipPreference: 0.4,
  },
}

export function aiBiasForArchetype(archetype: AIPersonalityArchetype): AIPersonalityBias {
  return ARCHETYPE_BIASES[archetype]
}

export function aiBiasForTheme(theme: Theme): AIPersonalityBias {
  return aiBiasForArchetype(theme.aiPersonalityArchetype)
}

export function aiBiasForThemeId(themeId: ThemeId): AIPersonalityBias {
  return aiBiasForTheme(getTheme(themeId))
}
