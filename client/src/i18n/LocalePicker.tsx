// PHASE 18.7 — locale picker component. Drop-in <select> for the settings panel /
// account page. Persists choice to localStorage via setActiveLocale.

import { LOCALES, getActiveLocale, setActiveLocale, type LocaleId } from './i18n'

export function LocalePicker() {
  const current = getActiveLocale()
  return (
    <label className="locale-picker">
      <span>Language</span>
      <select
        value={current}
        onChange={(e) => setActiveLocale(e.target.value as LocaleId)}
        aria-label="Language picker"
      >
        {LOCALES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.nativeName} ({l.displayName})
          </option>
        ))}
      </select>
    </label>
  )
}
