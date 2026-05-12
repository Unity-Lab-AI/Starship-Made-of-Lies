// PHASE 18.7 — i18n scaffolding. Lightweight string-catalog + locale-switching plumbing
// designed so the UI can adopt translations incrementally (one panel / page at a time)
// without forcing a big-bang migration. Keys live in a flat string map; missing keys fall
// back to the English catalog with a console.warn flag in dev so untranslated strings
// surface during testing.
//
// Locales ship empty (just English) — translation work is content/translator workload, not
// engineering. The plumbing here is the path to bolt those in as JSON catalogs without
// touching UI code. Future polish: load per-locale JSON lazily, parameterized interpolation
// (`t('match.victory', { civ: 'Theocracy' })`), date/number formatting via Intl.
//
// RTL support: locales tagged `'rtl'` flip `document.documentElement.dir = 'rtl'`. UI panels
// that depend on direction read `useLocaleDir()` to swap left/right alignment.

import { useEffect, useState } from 'react'

export type LocaleId =
  | 'en' // English (base)
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'pt-BR' // Brazilian Portuguese
  | 'ja' // Japanese
  | 'zh-Hans' // Simplified Chinese
  | 'ko' // Korean
  | 'ru' // Russian
  | 'ar' // Arabic (RTL)
  | 'he' // Hebrew (RTL)

export type TextDirection = 'ltr' | 'rtl'

export interface LocaleDefinition {
  readonly id: LocaleId
  readonly displayName: string
  readonly nativeName: string
  readonly dir: TextDirection
  // Empty until translator content arrives. The English catalog below is the source-of-truth
  // for available keys; other locales override per-key as translations land.
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
  { id: 'es', displayName: 'Spanish', nativeName: 'Español', dir: 'ltr', strings: {} },
  { id: 'fr', displayName: 'French', nativeName: 'Français', dir: 'ltr', strings: {} },
  { id: 'de', displayName: 'German', nativeName: 'Deutsch', dir: 'ltr', strings: {} },
  {
    id: 'pt-BR',
    displayName: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    dir: 'ltr',
    strings: {},
  },
  { id: 'ja', displayName: 'Japanese', nativeName: '日本語', dir: 'ltr', strings: {} },
  {
    id: 'zh-Hans',
    displayName: 'Chinese (Simplified)',
    nativeName: '简体中文',
    dir: 'ltr',
    strings: {},
  },
  { id: 'ko', displayName: 'Korean', nativeName: '한국어', dir: 'ltr', strings: {} },
  { id: 'ru', displayName: 'Russian', nativeName: 'Русский', dir: 'ltr', strings: {} },
  { id: 'ar', displayName: 'Arabic', nativeName: 'العربية', dir: 'rtl', strings: {} },
  { id: 'he', displayName: 'Hebrew', nativeName: 'עברית', dir: 'rtl', strings: {} },
]

const LOCALE_BY_ID: Map<LocaleId, LocaleDefinition> = new Map(LOCALES.map((l) => [l.id, l]))

const LOCALE_STORAGE_KEY = 'smol.locale.v1'

let activeLocale: LocaleId = (() => {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleId | null
    if (stored && LOCALE_BY_ID.has(stored)) return stored
  } catch {
    /* localStorage disabled */
  }
  return 'en'
})()

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
    /* ignore */
  }
  for (const l of listeners) l(locale)
}

export function subscribeLocale(listener: LocaleListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Translation lookup. Falls back to English when the active locale has no entry; falls back
// to the raw key when English has no entry either (dev signal that a key wasn't registered).
export function t(key: string): string {
  const active = LOCALE_BY_ID.get(activeLocale)
  if (active && active.strings[key]) return active.strings[key]!
  if (EN_STRINGS[key]) return EN_STRINGS[key]!
  if (import.meta.env?.DEV) {
    console.warn(`[smol/i18n] Missing translation key: ${key}`)
  }
  return key
}

// React hook — re-renders the component when the active locale changes.
export function useLocale(): LocaleId {
  const [locale, setLocale] = useState<LocaleId>(activeLocale)
  useEffect(() => {
    return subscribeLocale(setLocale)
  }, [])
  return locale
}

// React hook — returns the active locale's text direction. Components that depend on bidi
// flip layout (e.g. mirror flex-direction, swap left/right paddings) read this.
export function useLocaleDir(): TextDirection {
  useLocale() // subscribe for re-renders on locale change
  return LOCALE_BY_ID.get(activeLocale)!.dir
}

// React component-friendly t() wrapper that also subscribes to locale changes. Use this in
// component bodies instead of plain `t()` so the component re-renders when locale switches.
export function useT(): (key: string) => string {
  useLocale() // subscribe for re-renders
  return t
}
