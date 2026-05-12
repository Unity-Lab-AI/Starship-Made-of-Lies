// i18n — collapsed to English-only per user 2026-05-12. The 11-locale scaffold that
// previously shipped (es / fr / de / pt-BR / ja / zh-Hans / ko / ru / ar / he) was dead code
// — none had translator content and the user explicitly mandated English-only. The `useT()`
// hook + `t(key)` lookup + LocaleId type all stay so call sites in PlanetSummaryPanel /
// CinematicsOverlay / etc. continue to work unchanged. Re-add locales here when translation
// work actually begins (per-locale JSON, lazy-load, Intl date/number formatting, RTL flip).
//
// Why keep the surface area at all: re-introducing locales without a refactor of every call
// site requires the lookup API to stay stable. The cost is one tiny module + zero runtime
// branch (single-locale path is a Map.get with one entry).

import { useEffect, useState } from 'react'

export type LocaleId = 'en'

export type TextDirection = 'ltr' | 'rtl'

export interface LocaleDefinition {
  readonly id: LocaleId
  readonly displayName: string
  readonly nativeName: string
  readonly dir: TextDirection
  readonly strings: Readonly<Record<string, string>>
}

const EN_STRINGS: Readonly<Record<string, string>> = {
  // Common UI
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.confirm': 'Confirm',
  'common.skip': 'Skip',
  // Top toolbar
  'toolbar.population.totalLabel': 'Total population',
  'toolbar.citizens.tierLabel': 'Tier',
  // Planet summary
  'planetSummary.tilesUsed': 'Tiles used',
  'planetSummary.buildings': 'Buildings',
  'planetSummary.totalPopulation': 'Total population',
  'planetSummary.storageTier': 'Storage tier',
  'planetSummary.viewAggregate': 'Planet aggregate',
  'planetSummary.viewPerSettlement': 'Per settlement',
  'planetSummary.openInventory': 'Open Planet Inventory (upgradeable)',
  // Cinematics
  'cinematic.skipHint': 'Press Esc / Space / click to skip',
  // Match end
  'match.victory.title': 'THE GALAXY IS YOURS',
  'match.defeat.title': 'THE GAME IS UP',
  // Errors / toasts
  'toast.saveSuccess': 'Match saved',
  'toast.saveFailure': 'Save failed — localStorage may be full or sandboxed',
}

export const LOCALES: ReadonlyArray<LocaleDefinition> = [
  { id: 'en', displayName: 'English', nativeName: 'English', dir: 'ltr', strings: EN_STRINGS },
]

const LOCALE_BY_ID: Map<LocaleId, LocaleDefinition> = new Map(LOCALES.map((l) => [l.id, l]))

const LOCALE_STORAGE_KEY = 'smol.locale.v1'

// English-only today; the constant + listener machinery stays so a future re-introduction of
// locales doesn't need to retrofit the hook API.
let activeLocale: LocaleId = 'en'

type LocaleListener = (locale: LocaleId) => void
const listeners = new Set<LocaleListener>()

export function getActiveLocale(): LocaleId {
  return activeLocale
}

export function setActiveLocale(locale: LocaleId): void {
  if (!LOCALE_BY_ID.has(locale)) return
  if (locale === activeLocale) return
  activeLocale = locale
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
      const def = LOCALE_BY_ID.get(locale)!
      document.documentElement.dir = def.dir
      document.documentElement.lang = locale
    }
  } catch {
    /* localStorage disabled */
  }
  for (const l of listeners) l(locale)
}

export function subscribeLocale(listener: LocaleListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Translation lookup. With English-only this is a single Map.get; falls back to raw key with
// a dev-mode console.warn when a key isn't registered (signals dev they need to add it).
export function t(key: string): string {
  const value = EN_STRINGS[key]
  if (value !== undefined) return value
  if (import.meta.env?.DEV) {
    console.warn(`[smol/i18n] Missing translation key: ${key}`)
  }
  return key
}

export function useLocale(): LocaleId {
  const [locale, setLocale] = useState<LocaleId>(activeLocale)
  useEffect(() => {
    return subscribeLocale(setLocale)
  }, [])
  return locale
}

export function useLocaleDir(): TextDirection {
  useLocale()
  return LOCALE_BY_ID.get(activeLocale)!.dir
}

export function useT(): (key: string) => string {
  useLocale()
  return t
}
