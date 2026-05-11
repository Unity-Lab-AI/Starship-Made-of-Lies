import { useState } from 'react'
import {
  type AccessibilitySettings,
  type ColorBlindMode,
  COLOR_BLIND_MODE_LABELS,
  applyAccessibilityToDocument,
  clampFontScale,
  saveAccessibilitySettings,
} from '../../settings/accessibility'
import { LCDFrame } from './LCDFrame'
import './AccessibilitySettingsPanel.css'

interface AccessibilitySettingsPanelProps {
  readonly initial: AccessibilitySettings
}

export function AccessibilitySettingsPanel({ initial }: AccessibilitySettingsPanelProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(initial)

  const update = (next: AccessibilitySettings) => {
    const sanitized: AccessibilitySettings = { ...next, fontScale: clampFontScale(next.fontScale) }
    setSettings(sanitized)
    applyAccessibilityToDocument(sanitized)
    saveAccessibilitySettings(sanitized)
  }

  return (
    <LCDFrame
      title="♿ Accessibility"
      statusGlyph="◇"
      statusLabel={`scale ${settings.fontScale.toFixed(2)}×`}
      variant="blue"
    >
      <div className="accessibility-panel">
        <ToggleRow
          label="Reduced motion"
          hint="Cuts animations + scanline effects"
          value={settings.reducedMotion}
          onChange={(v) => update({ ...settings, reducedMotion: v })}
        />
        <ToggleRow
          label="High contrast"
          hint="Boosts UI contrast for low-vision users"
          value={settings.highContrast}
          onChange={(v) => update({ ...settings, highContrast: v })}
        />
        <ToggleRow
          label="Screen shake"
          hint="Camera shake on impacts. Off for vestibular sensitivity."
          value={settings.screenShake}
          onChange={(v) => update({ ...settings, screenShake: v })}
        />
        <ToggleRow
          label="Flash warnings"
          hint="Photosensitivity warnings before high-flash events"
          value={settings.flashWarnings}
          onChange={(v) => update({ ...settings, flashWarnings: v })}
        />
        <div className="accessibility-panel__row">
          <label className="accessibility-panel__label">Font scale</label>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={settings.fontScale}
            onChange={(e) => update({ ...settings, fontScale: Number(e.target.value) })}
            aria-label="Font scale"
          />
          <span className="accessibility-panel__value">{settings.fontScale.toFixed(2)}×</span>
        </div>
        <div className="accessibility-panel__row">
          <label className="accessibility-panel__label">Color-blind mode</label>
          <select
            value={settings.colorBlindMode}
            onChange={(e) =>
              update({ ...settings, colorBlindMode: e.target.value as ColorBlindMode })
            }
            aria-label="Color-blind mode"
          >
            {(Object.keys(COLOR_BLIND_MODE_LABELS) as ColorBlindMode[]).map((mode) => (
              <option key={mode} value={mode}>
                {COLOR_BLIND_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>
        <p className="accessibility-panel__hint">
          Settings persist to localStorage + apply via document.documentElement dataset attributes.
        </p>
      </div>
    </LCDFrame>
  )
}

interface ToggleRowProps {
  readonly label: string
  readonly hint: string
  readonly value: boolean
  readonly onChange: (next: boolean) => void
}

function ToggleRow({ label, hint, value, onChange }: ToggleRowProps) {
  return (
    <div className="accessibility-panel__row accessibility-panel__row--toggle">
      <div className="accessibility-panel__label-stack">
        <span className="accessibility-panel__label">{label}</span>
        <span className="accessibility-panel__hint-inline">{hint}</span>
      </div>
      <button
        type="button"
        className={`accessibility-panel__toggle ${value ? 'accessibility-panel__toggle--on' : ''}`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        {value ? '✓ on' : '— off'}
      </button>
    </div>
  )
}
