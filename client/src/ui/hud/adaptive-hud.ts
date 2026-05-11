export type ZoomLevel = 'galaxy' | 'system' | 'planet' | 'region' | 'base' | 'building'

export interface PanelVisibilityRules {
  readonly resourcesPanel: boolean
  readonly tilePlacementGrid: boolean
  readonly techTreePanel: boolean
  readonly deceptionPanel: boolean
  readonly launchPadPanel: boolean
  readonly colonyShipFlightPanel: boolean
  readonly beaconPanel: boolean
  readonly bootSequencePanel: boolean
  readonly aiPlayerPanel: boolean
  readonly hallOfChampionsPanel: boolean
  readonly achievementsPanel: boolean
  readonly productionGraphPanel: boolean
  readonly cameraReconPanel: boolean
  readonly audioSettingsPanel: boolean
  readonly accessibilitySettingsPanel: boolean
  readonly keybindingsPanel: boolean
  readonly lobbyPreviewPanel: boolean
  readonly profilePanel: boolean
}

const NONE: PanelVisibilityRules = {
  resourcesPanel: false,
  tilePlacementGrid: false,
  techTreePanel: false,
  deceptionPanel: false,
  launchPadPanel: false,
  colonyShipFlightPanel: false,
  beaconPanel: false,
  bootSequencePanel: false,
  aiPlayerPanel: false,
  hallOfChampionsPanel: false,
  achievementsPanel: false,
  productionGraphPanel: false,
  cameraReconPanel: false,
  audioSettingsPanel: false,
  accessibilitySettingsPanel: false,
  keybindingsPanel: false,
  lobbyPreviewPanel: false,
  profilePanel: false,
}

export const ZOOM_PANEL_RULES: Readonly<Record<ZoomLevel, PanelVisibilityRules>> = {
  galaxy: {
    ...NONE,
    aiPlayerPanel: true,
    colonyShipFlightPanel: true,
    beaconPanel: true,
  },
  system: {
    ...NONE,
    aiPlayerPanel: true,
    colonyShipFlightPanel: true,
    beaconPanel: true,
    productionGraphPanel: true,
  },
  planet: {
    ...NONE,
    resourcesPanel: true,
    techTreePanel: true,
    deceptionPanel: true,
    colonyShipFlightPanel: true,
    beaconPanel: true,
    productionGraphPanel: true,
    cameraReconPanel: true,
  },
  region: {
    ...NONE,
    resourcesPanel: true,
    tilePlacementGrid: true,
    deceptionPanel: true,
    productionGraphPanel: true,
    cameraReconPanel: true,
  },
  base: {
    ...NONE,
    resourcesPanel: true,
    tilePlacementGrid: true,
    launchPadPanel: true,
    bootSequencePanel: true,
    productionGraphPanel: true,
    cameraReconPanel: true,
  },
  building: {
    ...NONE,
    resourcesPanel: true,
    tilePlacementGrid: true,
    launchPadPanel: true,
    bootSequencePanel: true,
  },
}

export interface AdaptiveHudInputs {
  readonly zoom: ZoomLevel
  readonly minimalDensityOverride: boolean
}

export function panelsForZoom(inputs: AdaptiveHudInputs): PanelVisibilityRules {
  const base = ZOOM_PANEL_RULES[inputs.zoom]
  if (!inputs.minimalDensityOverride) return base
  return {
    ...NONE,
    aiPlayerPanel: base.aiPlayerPanel,
    beaconPanel: base.beaconPanel,
    resourcesPanel: base.resourcesPanel,
  }
}

export function animationDensityForZoom(zoom: ZoomLevel): 'minimal' | 'standard' | 'rich' {
  switch (zoom) {
    case 'galaxy':
      return 'minimal'
    case 'system':
      return 'minimal'
    case 'planet':
      return 'standard'
    case 'region':
      return 'standard'
    case 'base':
      return 'rich'
    case 'building':
      return 'rich'
  }
}
