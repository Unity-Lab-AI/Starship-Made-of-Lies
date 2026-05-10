export type SettingScope = 'host_shared' | 'personal'

export interface SettingClassification {
  readonly key: string
  readonly scope: SettingScope
  readonly category: 'audio' | 'accessibility' | 'keybinds' | 'rendering' | 'gameplay' | 'meta'
  readonly description: string
  readonly hostCanOverride: boolean
}

export const SETTING_REGISTRY: ReadonlyArray<SettingClassification> = [
  // Personal — every user controls their own
  {
    key: 'audio.musicVolume',
    scope: 'personal',
    category: 'audio',
    description: 'Music bus level',
    hostCanOverride: false,
  },
  {
    key: 'audio.sfxVolume',
    scope: 'personal',
    category: 'audio',
    description: 'SFX bus level',
    hostCanOverride: false,
  },
  {
    key: 'audio.voiceVolume',
    scope: 'personal',
    category: 'audio',
    description: 'Voice bus level',
    hostCanOverride: false,
  },
  {
    key: 'audio.masterVolume',
    scope: 'personal',
    category: 'audio',
    description: 'Master bus level',
    hostCanOverride: false,
  },
  {
    key: 'accessibility.reducedMotion',
    scope: 'personal',
    category: 'accessibility',
    description: 'Disable non-essential animations',
    hostCanOverride: false,
  },
  {
    key: 'accessibility.fontScale',
    scope: 'personal',
    category: 'accessibility',
    description: 'UI font scaling',
    hostCanOverride: false,
  },
  {
    key: 'accessibility.colorBlindMode',
    scope: 'personal',
    category: 'accessibility',
    description: 'Color-blind palette adjustment',
    hostCanOverride: false,
  },
  {
    key: 'accessibility.screenShake',
    scope: 'personal',
    category: 'accessibility',
    description: 'Camera shake on impacts',
    hostCanOverride: false,
  },
  {
    key: 'accessibility.flashWarnings',
    scope: 'personal',
    category: 'accessibility',
    description: 'Flash warning effects on critical events',
    hostCanOverride: false,
  },
  {
    key: 'accessibility.highContrast',
    scope: 'personal',
    category: 'accessibility',
    description: 'High-contrast UI mode',
    hostCanOverride: false,
  },
  {
    key: 'keybinds.*',
    scope: 'personal',
    category: 'keybinds',
    description: 'Keyboard remap (per-user)',
    hostCanOverride: false,
  },
  {
    key: 'render.quality',
    scope: 'personal',
    category: 'rendering',
    description: 'Render-quality preset (Low/Med/High)',
    hostCanOverride: false,
  },
  {
    key: 'render.adaptiveHud',
    scope: 'personal',
    category: 'rendering',
    description: 'Adaptive HUD per zoom level',
    hostCanOverride: false,
  },
  // Host-shared — host pushes to all match users
  {
    key: 'gameplay.matchLength',
    scope: 'host_shared',
    category: 'gameplay',
    description: 'Match length (blitz/standard/epic/open)',
    hostCanOverride: true,
  },
  {
    key: 'gameplay.tickCapOverride',
    scope: 'host_shared',
    category: 'gameplay',
    description: 'Hard tick cap (overrides match length)',
    hostCanOverride: true,
  },
  {
    key: 'gameplay.conquestGateStrictness',
    scope: 'host_shared',
    category: 'gameplay',
    description: 'Forbidden tech conquest-gate strictness',
    hostCanOverride: true,
  },
  {
    key: 'gameplay.missionObjectives',
    scope: 'host_shared',
    category: 'gameplay',
    description: 'Active mission objectives + targets',
    hostCanOverride: true,
  },
  {
    key: 'gameplay.planetCount',
    scope: 'host_shared',
    category: 'gameplay',
    description: 'Galaxy planet count',
    hostCanOverride: true,
  },
  {
    key: 'gameplay.coopMode',
    scope: 'host_shared',
    category: 'gameplay',
    description: 'Coop mode toggle',
    hostCanOverride: true,
  },
  {
    key: 'gameplay.biomesAvailable',
    scope: 'host_shared',
    category: 'gameplay',
    description: 'Biome availability filter',
    hostCanOverride: true,
  },
  {
    key: 'meta.globalLeaderboardOptIn',
    scope: 'personal',
    category: 'meta',
    description: 'Submit local match results to global Hall of Champions',
    hostCanOverride: false,
  },
  {
    key: 'meta.telemetryOptIn',
    scope: 'personal',
    category: 'meta',
    description: 'Submit anonymous match-end stats for AI tuning',
    hostCanOverride: false,
  },
  {
    key: 'meta.crashReportingOptIn',
    scope: 'personal',
    category: 'meta',
    description: 'Submit crash reports',
    hostCanOverride: false,
  },
]

export function settingsByScope(scope: SettingScope): ReadonlyArray<SettingClassification> {
  return SETTING_REGISTRY.filter((s) => s.scope === scope)
}

export function settingsByCategory(
  category: SettingClassification['category'],
): ReadonlyArray<SettingClassification> {
  return SETTING_REGISTRY.filter((s) => s.category === category)
}

export function lookupSetting(key: string): SettingClassification | null {
  for (const s of SETTING_REGISTRY) {
    if (s.key === key) return s
    if (s.key.endsWith('*')) {
      const prefix = s.key.slice(0, -1)
      if (key.startsWith(prefix)) return s
    }
  }
  return null
}
