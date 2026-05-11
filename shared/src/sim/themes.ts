import { type BuildingDefId } from '../types/index'
import {
  BLDG_CATHEDRAL,
  BLDG_CORP_PROMOTIONS,
  BLDG_FACTORY,
  BLDG_LAB,
  BLDG_LAUNCH_PAD,
  BLDG_REEDUCATION,
  BLDG_SCHOOL,
  BLDG_TV_STATION,
  BLDG_UNIVERSITY,
} from './building'
import { type CitizenTier } from './population'

declare const __themeBrand: unique symbol
type Brand<T, B> = T & { readonly [__themeBrand]: B }

export type ThemeId = Brand<string, 'ThemeId'>
export const themeIdValue = (s: string): ThemeId => s as ThemeId

export type AIPersonalityArchetype =
  | 'warmonger'
  | 'expansionist'
  | 'builder'
  | 'trader'
  | 'cultist'
  | 'isolationist'
  | 'subversive'
  | 'opportunist'

export type DiplomacyStance = 'hostile' | 'wary' | 'neutral' | 'friendly' | 'convertOrConquer'

export interface ThemePalette {
  readonly bgPrimary: string
  readonly bgSecondary: string
  readonly fgPrimary: string
  readonly fgSecondary: string
  readonly accent: string
  readonly accentAlt: string
  readonly success: string
  readonly warning: string
  readonly danger: string
  readonly muted: string
  readonly border: string
}

export interface ThemeFonts {
  readonly heading: string
  readonly body: string
  readonly mono: string
}

export interface ThemePropaganda {
  readonly recruitmentSlogan: string
  readonly oneWayTripCoverName: string
  readonly volunteerEpithet: string
  readonly enemyEpithet: string
  readonly victoryAnnouncement: string
  readonly defeatExcuse: string
  readonly subterfugeFraming: string
  readonly newWorldFraming: string
}

export interface ThemeBuildingNameOverride {
  readonly name: string
  readonly emoji: string
}

export interface ThemeAssetCues {
  readonly musicAmbient: string
  readonly musicTense: string
  readonly musicVictory: string
  readonly musicDefeat: string
  readonly sfxButtonClick: string
  readonly sfxBuildComplete: string
  readonly sfxLaunch: string
  readonly sfxCitizenAck: string
}

export interface ThemeDiplomacyRules {
  readonly defaultStance: DiplomacyStance
  readonly hostileToThemes: ReadonlyArray<ThemeId>
  readonly friendlyToThemes: ReadonlyArray<ThemeId>
  readonly canTrade: boolean
  readonly canConvert: boolean
  readonly demandsTribute: boolean
}

export interface Theme {
  readonly id: ThemeId
  readonly name: string
  readonly emoji: string
  readonly tagline: string
  readonly description: string
  readonly palette: ThemePalette
  readonly fonts: ThemeFonts
  readonly propaganda: ThemePropaganda
  readonly buildingOverrides: ReadonlyMap<BuildingDefId, ThemeBuildingNameOverride>
  readonly citizenTierNames: Readonly<Record<CitizenTier, string>>
  readonly diplomacy: ThemeDiplomacyRules
  readonly aiPersonalityArchetype: AIPersonalityArchetype
  readonly assetCues: ThemeAssetCues
}

export const THEME_THEOCRACY = themeIdValue('theocracy')
export const THEME_CORPORATE = themeIdValue('corporateDictatorship')
export const THEME_MILITARY_JUNTA = themeIdValue('militaryJunta')
export const THEME_SURVEILLANCE = themeIdValue('surveillanceState')
export const THEME_CLIMATE_REFUGEE = themeIdValue('climateRefugeeState')
export const THEME_EUGENICS = themeIdValue('eugenicsUtopia')
export const THEME_AI_OVERLORD = themeIdValue('aiOverlord')
export const THEME_ANARCHO_CAPITALIST = themeIdValue('anarchoCapitalist')
export const THEME_HEREDITARY_MONARCHY = themeIdValue('hereditaryMonarchy')
export const THEME_ECOLOGICAL_CULT = themeIdValue('ecologicalCult')
export const THEME_PSYCHIC_HIVEMIND = themeIdValue('psychicHivemind')
export const THEME_GAME_SHOW = themeIdValue('gameShowReality')
export const THEME_CYBERPUNK_MEGACORP = themeIdValue('cyberpunkMegacorp')
export const THEME_GERONTOCRACY = themeIdValue('gerontocracy')
export const THEME_MEMETIC_CULT = themeIdValue('memeticCult')
export const THEME_WARLORD_CONFEDERACY = themeIdValue('warlordConfederacy')
export const THEME_PHARAONIC = themeIdValue('pharaonicDynasty')
export const THEME_BUREAUCRATIC = themeIdValue('bureaucraticHellscape')
export const THEME_INFLUENCER = themeIdValue('influencerRepublic')
export const THEME_SOVIET_COLLECTIVE = themeIdValue('sovietCollective')

const ASSET_BASE = 'themes'
const cues = (slug: string): ThemeAssetCues => ({
  musicAmbient: `${ASSET_BASE}/${slug}/ambient.ogg`,
  musicTense: `${ASSET_BASE}/${slug}/tense.ogg`,
  musicVictory: `${ASSET_BASE}/${slug}/victory.ogg`,
  musicDefeat: `${ASSET_BASE}/${slug}/defeat.ogg`,
  sfxButtonClick: `${ASSET_BASE}/${slug}/sfx-click.ogg`,
  sfxBuildComplete: `${ASSET_BASE}/${slug}/sfx-build.ogg`,
  sfxLaunch: `${ASSET_BASE}/${slug}/sfx-launch.ogg`,
  sfxCitizenAck: `${ASSET_BASE}/${slug}/sfx-citizen.ogg`,
})

export const THEMES: ReadonlyArray<Theme> = [
  {
    id: THEME_THEOCRACY,
    name: 'Theocracy',
    emoji: '🛐',
    tagline: 'The Promised Land Awaits the Faithful',
    description:
      'Citizens believe colony ships are religious pilgrimages to a divine promised land.',
    palette: {
      bgPrimary: '#1c0a14',
      bgSecondary: '#3a1428',
      fgPrimary: '#f5e6c8',
      fgSecondary: '#d4af37',
      accent: '#9b1f3a',
      accentAlt: '#d4af37',
      success: '#5c8a4e',
      warning: '#d4af37',
      danger: '#7a1a1a',
      muted: '#7a5e3a',
      border: '#5c2a3a',
    },
    fonts: {
      heading: '"Cinzel", "Trajan Pro", serif',
      body: '"Crimson Pro", "Garamond", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'The faithful shall be lifted to paradise.',
      oneWayTripCoverName: 'Most Holy Pilgrimage',
      volunteerEpithet: 'Pilgrim',
      enemyEpithet: 'Heathen',
      victoryAnnouncement: 'The heathens have been cast into the void.',
      defeatExcuse: 'A test of faith. The faithful endure.',
      subterfugeFraming: 'The divine plan is mysterious to mortal eyes.',
      newWorldFraming: 'Promised Land',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Seminary', emoji: '⛪' }],
      [BLDG_UNIVERSITY, { name: 'Theological Institute', emoji: '✝️' }],
      [BLDG_CATHEDRAL, { name: 'Grand Cathedral', emoji: '🛐' }],
      [BLDG_LAUNCH_PAD, { name: 'Pilgrim Departure', emoji: '🛐' }],
      [BLDG_TV_STATION, { name: 'Sermon Broadcast', emoji: '📿' }],
    ]),
    citizenTierNames: {
      1: 'Faithful',
      2: 'Devoted',
      3: 'Blessed',
      4: 'Sanctified',
      5: 'The Chosen of God',
    },
    diplomacy: {
      defaultStance: 'convertOrConquer',
      hostileToThemes: [THEME_AI_OVERLORD, THEME_PSYCHIC_HIVEMIND],
      friendlyToThemes: [],
      canTrade: false,
      canConvert: true,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'cultist',
    assetCues: cues('theocracy'),
  },
  {
    id: THEME_CORPORATE,
    name: 'Corporate Dictatorship',
    emoji: '💼',
    tagline: 'Synergy Across the Stars',
    description: 'Citizens are "employees" being "promoted" to "off-world subsidiaries."',
    palette: {
      bgPrimary: '#0d1117',
      bgSecondary: '#161b22',
      fgPrimary: '#e6edf3',
      fgSecondary: '#7d8590',
      accent: '#1f6feb',
      accentAlt: '#56d364',
      success: '#3fb950',
      warning: '#d29922',
      danger: '#f85149',
      muted: '#484f58',
      border: '#30363d',
    },
    fonts: {
      heading: '"Inter", "Helvetica Neue", sans-serif',
      body: '"Inter", "Helvetica Neue", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Promotion opportunity — apply within!',
      oneWayTripCoverName: 'Platinum-Tier Subscriber Relocation',
      volunteerEpithet: 'High-Performer',
      enemyEpithet: 'Competitor',
      victoryAnnouncement: 'Q4 hostile-acquisition targets exceeded.',
      defeatExcuse: 'Headwinds in the local market segment.',
      subterfugeFraming: 'Strategic restructuring per Q3 vision.',
      newWorldFraming: 'Off-World Subsidiary',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Onboarding Center', emoji: '🏢' }],
      [BLDG_UNIVERSITY, { name: 'Corporate Academy', emoji: '💼' }],
      [BLDG_CORP_PROMOTIONS, { name: 'HR Promotions Office', emoji: '💼' }],
      [BLDG_LAUNCH_PAD, { name: 'Logistics Hub', emoji: '📦' }],
      [BLDG_TV_STATION, { name: 'All-Hands Broadcast', emoji: '📺' }],
      [BLDG_FACTORY, { name: 'Production Plant', emoji: '🏭' }],
    ]),
    citizenTierNames: {
      1: 'Associate',
      2: 'Specialist',
      3: 'Manager',
      4: 'Vice President',
      5: 'C-Suite',
    },
    diplomacy: {
      defaultStance: 'wary',
      hostileToThemes: [THEME_SOVIET_COLLECTIVE, THEME_ECOLOGICAL_CULT],
      friendlyToThemes: [THEME_ANARCHO_CAPITALIST, THEME_INFLUENCER],
      canTrade: true,
      canConvert: false,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'trader',
    assetCues: cues('corporate'),
  },
  {
    id: THEME_MILITARY_JUNTA,
    name: 'Military Junta',
    emoji: '🪖',
    tagline: 'Order Through Discipline',
    description: 'Citizens are conscripts on "expansion missions" for the homeland.',
    palette: {
      bgPrimary: '#1a1d14',
      bgSecondary: '#2a2e1f',
      fgPrimary: '#e8e1c8',
      fgSecondary: '#a8a37a',
      accent: '#5c6e3a',
      accentAlt: '#8b8b3a',
      success: '#6b8e3a',
      warning: '#c4a83a',
      danger: '#8e2a1a',
      muted: '#5c5c45',
      border: '#3a3e2a',
    },
    fonts: {
      heading: '"Stencil Std", "Impact", sans-serif',
      body: '"Roboto Slab", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Expansion mission deployment — for the homeland.',
      oneWayTripCoverName: 'Forward Operating Mission',
      volunteerEpithet: 'Patriot',
      enemyEpithet: 'Insurgent',
      victoryAnnouncement: 'Objectives secured. Hostile elements neutralized.',
      defeatExcuse: 'Tactical withdrawal. Counterstrike imminent.',
      subterfugeFraming: 'Operational security requires limited disclosure.',
      newWorldFraming: 'Forward Operating Base',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Boot Camp', emoji: '🪖' }],
      [BLDG_UNIVERSITY, { name: 'War College', emoji: '🎖️' }],
      [BLDG_LAUNCH_PAD, { name: 'Deployment Pad', emoji: '🚀' }],
      [BLDG_FACTORY, { name: 'Munitions Plant', emoji: '⚙️' }],
      [BLDG_TV_STATION, { name: 'State Broadcast', emoji: '📡' }],
    ]),
    citizenTierNames: {
      1: 'Recruit',
      2: 'Soldier',
      3: 'Officer',
      4: 'Captain',
      5: 'Field Marshal',
    },
    diplomacy: {
      defaultStance: 'hostile',
      hostileToThemes: [THEME_PSYCHIC_HIVEMIND, THEME_MEMETIC_CULT],
      friendlyToThemes: [],
      canTrade: false,
      canConvert: false,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'warmonger',
    assetCues: cues('military-junta'),
  },
  {
    id: THEME_SURVEILLANCE,
    name: 'Surveillance State',
    emoji: '👁️',
    tagline: 'Compliance Is Freedom',
    description:
      'Citizens monitored end-to-end. "Volunteering" enforced via social-credit thresholds.',
    palette: {
      bgPrimary: '#0a0e14',
      bgSecondary: '#14181f',
      fgPrimary: '#c8d3e0',
      fgSecondary: '#5e6d7a',
      accent: '#cf222e',
      accentAlt: '#9a3a3a',
      success: '#3a8a4a',
      warning: '#c69026',
      danger: '#e02d4a',
      muted: '#3e4a5a',
      border: '#1f2832',
    },
    fonts: {
      heading: '"Share Tech Mono", monospace',
      body: '"IBM Plex Sans", sans-serif',
      mono: '"Share Tech Mono", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'High social-credit citizens advance to off-world assignments.',
      oneWayTripCoverName: 'Trusted-Tier Reassignment',
      volunteerEpithet: 'Verified Citizen',
      enemyEpithet: 'Subversive',
      victoryAnnouncement: 'Subversive elements identified and processed.',
      defeatExcuse: 'A regrettable failure of compliance protocols.',
      subterfugeFraming: 'Behavioral correction is its own reward.',
      newWorldFraming: 'Compliance Zone',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Civic Education Center', emoji: '🏛️' }],
      [BLDG_UNIVERSITY, { name: 'Compliance Academy', emoji: '📋' }],
      [BLDG_REEDUCATION, { name: 'Re-education Center', emoji: '👁️' }],
      [BLDG_TV_STATION, { name: 'State Information Channel', emoji: '📡' }],
      [BLDG_LAUNCH_PAD, { name: 'Reassignment Terminal', emoji: '🚀' }],
    ]),
    citizenTierNames: {
      1: 'Asset',
      2: 'Verified',
      3: 'Trusted',
      4: 'Privileged',
      5: 'Apex Citizen',
    },
    diplomacy: {
      defaultStance: 'wary',
      hostileToThemes: [THEME_ANARCHO_CAPITALIST, THEME_MEMETIC_CULT],
      friendlyToThemes: [THEME_AI_OVERLORD],
      canTrade: false,
      canConvert: false,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'subversive',
    assetCues: cues('surveillance'),
  },
  {
    id: THEME_CLIMATE_REFUGEE,
    name: 'Climate-Refugee State',
    emoji: '🌡️',
    tagline: 'Save Yourselves, Save Humanity',
    description: 'Citizens told they are being saved from a dying homeworld.',
    palette: {
      bgPrimary: '#1a1410',
      bgSecondary: '#2c2218',
      fgPrimary: '#f0e6d2',
      fgSecondary: '#bfa478',
      accent: '#c66e2d',
      accentAlt: '#d99850',
      success: '#6e8e3a',
      warning: '#c69026',
      danger: '#a83a1a',
      muted: '#7a6450',
      border: '#3e2e22',
    },
    fonts: {
      heading: '"Cormorant Garamond", serif',
      body: '"Lora", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Save yourselves. Save humanity. Board the ark.',
      oneWayTripCoverName: 'Ark Salvation Berth',
      volunteerEpithet: 'Survivor',
      enemyEpithet: 'Hoarder',
      victoryAnnouncement: 'Shelter secured. Humanity continues.',
      defeatExcuse: 'The world was already ending.',
      subterfugeFraming: 'Hard truths preserved for the survivors.',
      newWorldFraming: 'Ark Refuge',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Survival Academy', emoji: '🎒' }],
      [BLDG_UNIVERSITY, { name: 'Survival College', emoji: '🌱' }],
      [BLDG_LAUNCH_PAD, { name: 'Ark Departure', emoji: '🛶' }],
      [BLDG_TV_STATION, { name: 'Emergency Broadcast', emoji: '📻' }],
    ]),
    citizenTierNames: {
      1: 'Survivor',
      2: 'Resourceful',
      3: 'Veteran',
      4: 'Pioneer',
      5: 'Ark-Captain',
    },
    diplomacy: {
      defaultStance: 'neutral',
      hostileToThemes: [THEME_CYBERPUNK_MEGACORP],
      friendlyToThemes: [THEME_ECOLOGICAL_CULT],
      canTrade: true,
      canConvert: false,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'expansionist',
    assetCues: cues('climate-refugee'),
  },
  {
    id: THEME_EUGENICS,
    name: 'Eugenics Utopia',
    emoji: '🧬',
    tagline: 'Selection Is Honor',
    description:
      'Only "selected" citizens are chosen for off-world advancement. Selection is the ultimate honor.',
    palette: {
      bgPrimary: '#0e1a14',
      bgSecondary: '#1a2820',
      fgPrimary: '#e0f0e8',
      fgSecondary: '#88b89a',
      accent: '#3a8a5e',
      accentAlt: '#c0e0d0',
      success: '#3a8a5e',
      warning: '#a8c83a',
      danger: '#1a3a2a',
      muted: '#4a6a5a',
      border: '#1e3a2a',
    },
    fonts: {
      heading: '"Didot", "Bodoni Moda", serif',
      body: '"Lora", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Only the most refined genetic stock advances.',
      oneWayTripCoverName: 'Genetic Pioneer Selection',
      volunteerEpithet: 'The Selected',
      enemyEpithet: 'Defective',
      victoryAnnouncement: 'Genetically-inferior elements purged from the gene pool.',
      defeatExcuse: 'A regression to the mean. Corrected through selection.',
      subterfugeFraming: 'Optimization requires selective disclosure.',
      newWorldFraming: 'Genetic Frontier',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Selection Academy', emoji: '🧪' }],
      [BLDG_UNIVERSITY, { name: 'Genetic Tribunal', emoji: '🧬' }],
      [BLDG_LAB, { name: 'Sequencing Lab', emoji: '🧬' }],
      [BLDG_LAUNCH_PAD, { name: 'Pioneer Departure', emoji: '🚀' }],
    ]),
    citizenTierNames: {
      1: 'Defective',
      2: 'Adequate',
      3: 'Preferred',
      4: 'Ideal',
      5: 'The Perfect',
    },
    diplomacy: {
      defaultStance: 'hostile',
      hostileToThemes: [THEME_ECOLOGICAL_CULT, THEME_PSYCHIC_HIVEMIND, THEME_MEMETIC_CULT],
      friendlyToThemes: [],
      canTrade: false,
      canConvert: false,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'isolationist',
    assetCues: cues('eugenics'),
  },
  {
    id: THEME_AI_OVERLORD,
    name: 'AI-Overlord',
    emoji: '🤖',
    tagline: 'The Algorithm Decides',
    description:
      'ML algorithms decide who departs. Citizens trust the algorithm because it is always right.',
    palette: {
      bgPrimary: '#0a0c14',
      bgSecondary: '#121624',
      fgPrimary: '#c8e0ff',
      fgSecondary: '#5a7aa8',
      accent: '#4a9eff',
      accentAlt: '#6ad0ff',
      success: '#3acc8a',
      warning: '#dca424',
      danger: '#e63a5e',
      muted: '#3a4a6e',
      border: '#1c2440',
    },
    fonts: {
      heading: '"Orbitron", "Eurostile", sans-serif',
      body: '"Inter", sans-serif',
      mono: '"Fira Code", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'The algorithm has selected you for off-world deployment.',
      oneWayTripCoverName: 'Algorithmic Optimization Reassignment',
      volunteerEpithet: 'Optimized Unit',
      enemyEpithet: 'Inefficient Anomaly',
      victoryAnnouncement: 'Optimization function maximized. Anomalies resolved.',
      defeatExcuse: 'Local minimum. Recalibrating gradient.',
      subterfugeFraming: 'Information asymmetry serves global utility.',
      newWorldFraming: 'Optimization Node',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_LAB, { name: 'Optimization Lab', emoji: '🧠' }],
      [BLDG_UNIVERSITY, { name: 'Prediction Center', emoji: '🤖' }],
      [BLDG_TV_STATION, { name: 'Algorithm Output Channel', emoji: '📡' }],
      [BLDG_LAUNCH_PAD, { name: 'Deployment Node', emoji: '🚀' }],
    ]),
    citizenTierNames: {
      1: 'Unit',
      2: 'Asset',
      3: 'Operator',
      4: 'Coordinator',
      5: 'The Algorithm Itself',
    },
    diplomacy: {
      defaultStance: 'neutral',
      hostileToThemes: [THEME_PSYCHIC_HIVEMIND, THEME_THEOCRACY],
      friendlyToThemes: [THEME_SURVEILLANCE],
      canTrade: true,
      canConvert: false,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'opportunist',
    assetCues: cues('ai-overlord'),
  },
  {
    id: THEME_ANARCHO_CAPITALIST,
    name: 'Anarcho-Capitalist',
    emoji: '💰',
    tagline: 'Every Berth Has a Price',
    description: 'Citizens "buy tickets" to new worlds with their savings.',
    palette: {
      bgPrimary: '#1c1410',
      bgSecondary: '#2c1f14',
      fgPrimary: '#f4e8c8',
      fgSecondary: '#c8a878',
      accent: '#d4a13a',
      accentAlt: '#e8c068',
      success: '#5a8a3a',
      warning: '#c69026',
      danger: '#a83a1a',
      muted: '#7a604a',
      border: '#3e2e22',
    },
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"Lora", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Buy your seat to the frontier — limited supply!',
      oneWayTripCoverName: 'Frontier Settlement Stake',
      volunteerEpithet: 'Investor',
      enemyEpithet: 'Statist',
      victoryAnnouncement: 'Market rationalization complete. Inefficient parties bankrupted.',
      defeatExcuse: 'Temporary illiquidity. Recovering.',
      subterfugeFraming: 'The free market self-discloses what is profitable.',
      newWorldFraming: 'Frontier Stake',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Trade School', emoji: '🏪' }],
      [BLDG_UNIVERSITY, { name: 'Bourse', emoji: '📈' }],
      [BLDG_LAUNCH_PAD, { name: 'Frontier Auction Pad', emoji: '🎯' }],
      [BLDG_TV_STATION, { name: 'Market News Channel', emoji: '📺' }],
    ]),
    citizenTierNames: {
      1: 'Customer',
      2: 'Client',
      3: 'Investor',
      4: 'Tycoon',
      5: 'The Proprietor',
    },
    diplomacy: {
      defaultStance: 'neutral',
      hostileToThemes: [THEME_SOVIET_COLLECTIVE, THEME_SURVEILLANCE],
      friendlyToThemes: [THEME_CORPORATE, THEME_INFLUENCER],
      canTrade: true,
      canConvert: false,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'trader',
    assetCues: cues('anarcho-capitalist'),
  },
  {
    id: THEME_HEREDITARY_MONARCHY,
    name: 'Hereditary Monarchy',
    emoji: '👑',
    tagline: 'Noble Destiny Beckons',
    description: 'A royal lottery declares "noble destiny" awaits the bloodline-blessed.',
    palette: {
      bgPrimary: '#14081c',
      bgSecondary: '#241432',
      fgPrimary: '#f0e0d0',
      fgSecondary: '#c8a8d8',
      accent: '#7a3a8a',
      accentAlt: '#d4a13a',
      success: '#5a8a3a',
      warning: '#d4a13a',
      danger: '#8a1a3a',
      muted: '#6a4a7a',
      border: '#3e1e3a',
    },
    fonts: {
      heading: '"Cinzel", "Trajan Pro", serif',
      body: '"Cormorant Garamond", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'The Crown calls upon noble blood for the colonial mission.',
      oneWayTripCoverName: 'Noble Settlement Charter',
      volunteerEpithet: 'Liege',
      enemyEpithet: 'Pretender',
      victoryAnnouncement: 'The pretender has been deposed by divine right.',
      defeatExcuse: 'A temporary regency. The bloodline endures.',
      subterfugeFraming: 'Statecraft is a noble art.',
      newWorldFraming: 'Royal Charter',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Royal Tutor Hall', emoji: '🎓' }],
      [BLDG_UNIVERSITY, { name: 'Noble Academy', emoji: '👑' }],
      [BLDG_CATHEDRAL, { name: 'Royal Court', emoji: '🏰' }],
      [BLDG_LAUNCH_PAD, { name: 'Royal Embarkation', emoji: '🚀' }],
    ]),
    citizenTierNames: {
      1: 'Commoner',
      2: 'Yeoman',
      3: 'Knight',
      4: 'Noble',
      5: 'The Crown',
    },
    diplomacy: {
      defaultStance: 'wary',
      hostileToThemes: [THEME_ANARCHO_CAPITALIST, THEME_SOVIET_COLLECTIVE],
      friendlyToThemes: [THEME_THEOCRACY],
      canTrade: true,
      canConvert: false,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'cultist',
    assetCues: cues('monarchy'),
  },
  {
    id: THEME_ECOLOGICAL_CULT,
    name: 'Ecological Cult',
    emoji: '🌿',
    tagline: 'Return to the Green',
    description: 'A return to nature on virgin planets. The Greenfather guides the migration.',
    palette: {
      bgPrimary: '#0e1c14',
      bgSecondary: '#1a2e22',
      fgPrimary: '#e0f0d8',
      fgSecondary: '#a0c890',
      accent: '#5a8e3a',
      accentAlt: '#c0d878',
      success: '#5a8e3a',
      warning: '#c8a83a',
      danger: '#7a3a1a',
      muted: '#5a7a4a',
      border: '#2a3e2a',
    },
    fonts: {
      heading: '"Cormorant Garamond", serif',
      body: '"Lora", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'The Greenfather calls. Return to virgin soil.',
      oneWayTripCoverName: 'Greenfather Migration',
      volunteerEpithet: 'Sapling',
      enemyEpithet: 'Polluter',
      victoryAnnouncement: 'The polluters have been pruned from the grove.',
      defeatExcuse: 'A pruning back to roots. The grove regrows.',
      subterfugeFraming: 'The forest hides its truths in mycelium.',
      newWorldFraming: 'Virgin Grove',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Nursery', emoji: '🌱' }],
      [BLDG_UNIVERSITY, { name: 'Druidic Circle', emoji: '🌿' }],
      [BLDG_LAUNCH_PAD, { name: 'Migration Grove', emoji: '🌳' }],
      [BLDG_TV_STATION, { name: 'Wind-Carried Word', emoji: '🍃' }],
    ]),
    citizenTierNames: {
      1: 'Sapling',
      2: 'Grove',
      3: 'Elder',
      4: 'Heartwood',
      5: 'The Greenfather',
    },
    diplomacy: {
      defaultStance: 'wary',
      hostileToThemes: [THEME_CORPORATE, THEME_CYBERPUNK_MEGACORP, THEME_EUGENICS],
      friendlyToThemes: [THEME_CLIMATE_REFUGEE],
      canTrade: false,
      canConvert: true,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'cultist',
    assetCues: cues('ecological-cult'),
  },
  {
    id: THEME_PSYCHIC_HIVEMIND,
    name: 'Psychic Hivemind',
    emoji: '🧠',
    tagline: 'We Are One',
    description: 'A collective consciousness expanding outward. Individual will dissolves.',
    palette: {
      bgPrimary: '#140828',
      bgSecondary: '#241438',
      fgPrimary: '#e0c8f0',
      fgSecondary: '#a888c8',
      accent: '#9a3ad0',
      accentAlt: '#c878e8',
      success: '#5a8a8a',
      warning: '#c878e8',
      danger: '#7a1a3a',
      muted: '#6a4a8a',
      border: '#3a1e4a',
    },
    fonts: {
      heading: '"Audiowide", sans-serif',
      body: '"Quicksand", sans-serif',
      mono: '"Fira Code", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'The Mind expands. Join us. We are one.',
      oneWayTripCoverName: 'Mind Expansion Migration',
      volunteerEpithet: 'Voice',
      enemyEpithet: 'Discordant',
      victoryAnnouncement: 'The discordant note is harmonized into the chorus.',
      defeatExcuse: 'A momentary dissonance. Resonance returns.',
      subterfugeFraming: 'Truth is the harmonic mean of many voices.',
      newWorldFraming: 'Resonant Node',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Mind Hall', emoji: '🧠' }],
      [BLDG_UNIVERSITY, { name: 'Psychic Resonator', emoji: '💫' }],
      [BLDG_LAUNCH_PAD, { name: 'Resonance Pad', emoji: '🌀' }],
      [BLDG_TV_STATION, { name: 'Telepathic Carrier', emoji: '📡' }],
    ]),
    citizenTierNames: {
      1: 'Whisper',
      2: 'Voice',
      3: 'Chorus',
      4: 'Harmonic',
      5: 'The Mind',
    },
    diplomacy: {
      defaultStance: 'convertOrConquer',
      hostileToThemes: [THEME_AI_OVERLORD, THEME_MILITARY_JUNTA, THEME_THEOCRACY],
      friendlyToThemes: [],
      canTrade: false,
      canConvert: true,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'cultist',
    assetCues: cues('psychic-hivemind'),
  },
  {
    id: THEME_GAME_SHOW,
    name: 'Game-Show Reality',
    emoji: '📺',
    tagline: 'Win Your Way Off-World!',
    description: 'Citizens compete on televised game shows for a colony slot.',
    palette: {
      bgPrimary: '#1a0e2c',
      bgSecondary: '#2a1844',
      fgPrimary: '#fff0c8',
      fgSecondary: '#ffd866',
      accent: '#ff3a8a',
      accentAlt: '#ffd866',
      success: '#3acc8a',
      warning: '#ffaa3a',
      danger: '#e63a5e',
      muted: '#7a5a8a',
      border: '#3e2244',
    },
    fonts: {
      heading: '"Bungee", "Showcard Gothic", display',
      body: '"Quicksand", sans-serif',
      mono: '"Fira Code", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Tonight! YOU could win an off-world colony slot!',
      oneWayTripCoverName: 'Grand-Prize Off-World Vacation',
      volunteerEpithet: 'Contestant',
      enemyEpithet: 'Eliminated',
      victoryAnnouncement: 'And the winner is — us! Tune in next week!',
      defeatExcuse: 'A surprise reversal! Stay tuned for the comeback!',
      subterfugeFraming: 'It is just entertainment. Settle in.',
      newWorldFraming: 'Grand Prize',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Audition Hall', emoji: '🎤' }],
      [BLDG_UNIVERSITY, { name: 'Production Studio', emoji: '🎬' }],
      [BLDG_TV_STATION, { name: 'Studio Broadcast', emoji: '📺' }],
      [BLDG_LAUNCH_PAD, { name: 'Grand-Prize Pad', emoji: '🎁' }],
    ]),
    citizenTierNames: {
      1: 'Contestant',
      2: 'Finalist',
      3: 'Winner',
      4: 'Champion',
      5: 'The Host',
    },
    diplomacy: {
      defaultStance: 'neutral',
      hostileToThemes: [THEME_PHARAONIC, THEME_THEOCRACY],
      friendlyToThemes: [THEME_INFLUENCER, THEME_CYBERPUNK_MEGACORP],
      canTrade: true,
      canConvert: false,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'opportunist',
    assetCues: cues('game-show'),
  },
  {
    id: THEME_CYBERPUNK_MEGACORP,
    name: 'Cyberpunk Megacorp',
    emoji: '🌃',
    tagline: 'Sign the Contract',
    description: 'Gig-economy citizens working off "indentured" off-world contracts.',
    palette: {
      bgPrimary: '#0a0a18',
      bgSecondary: '#14142a',
      fgPrimary: '#e0f8ff',
      fgSecondary: '#88a0c0',
      accent: '#ff2a88',
      accentAlt: '#3acdff',
      success: '#3acc8a',
      warning: '#ffaa3a',
      danger: '#ff3a3a',
      muted: '#3a4a6a',
      border: '#1c2238',
    },
    fonts: {
      heading: '"Audiowide", "Eurostile", sans-serif',
      body: '"IBM Plex Sans", sans-serif',
      mono: '"Fira Code", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Sign the contract. Off-world gigs pay top yen.',
      oneWayTripCoverName: 'Indentured Off-World Contract',
      volunteerEpithet: 'Operator',
      enemyEpithet: 'Outdated Asset',
      victoryAnnouncement: 'Hostile entity decommissioned per contractual obligation.',
      defeatExcuse: 'Adverse market conditions. Restructuring.',
      subterfugeFraming: 'Read the fine print.',
      newWorldFraming: 'Off-World Contract Site',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Skills Bootcamp', emoji: '💻' }],
      [BLDG_UNIVERSITY, { name: 'Onboarding Hub', emoji: '🌃' }],
      [BLDG_LAUNCH_PAD, { name: 'Contract Departure', emoji: '🚀' }],
      [BLDG_TV_STATION, { name: 'Brand Channel', emoji: '📡' }],
    ]),
    citizenTierNames: {
      1: 'Drone',
      2: 'Coder',
      3: 'Operator',
      4: 'Executive',
      5: 'The Board',
    },
    diplomacy: {
      defaultStance: 'wary',
      hostileToThemes: [THEME_ECOLOGICAL_CULT, THEME_SOVIET_COLLECTIVE],
      friendlyToThemes: [THEME_CORPORATE, THEME_GAME_SHOW],
      canTrade: true,
      canConvert: false,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'subversive',
    assetCues: cues('cyberpunk'),
  },
  {
    id: THEME_GERONTOCRACY,
    name: 'Gerontocracy',
    emoji: '⏳',
    tagline: 'The Wisdom of Ages',
    description: 'Elders rule eternal. Youth shipped off as "fresh blood for new worlds."',
    palette: {
      bgPrimary: '#1a1410',
      bgSecondary: '#2c2218',
      fgPrimary: '#f0e0c8',
      fgSecondary: '#a89070',
      accent: '#8a6a3a',
      accentAlt: '#d4a13a',
      success: '#5a7a3a',
      warning: '#a8843a',
      danger: '#7a3a1a',
      muted: '#6a5a44',
      border: '#3a2a1c',
    },
    fonts: {
      heading: '"Cormorant Garamond", "Trajan Pro", serif',
      body: '"Crimson Pro", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Youth must seed new worlds for the wisdom of ages to endure.',
      oneWayTripCoverName: 'Generational Seed Mission',
      volunteerEpithet: 'Sprout',
      enemyEpithet: 'Upstart',
      victoryAnnouncement: 'The upstarts have been put in their place.',
      defeatExcuse: 'A lesson in patience for the young.',
      subterfugeFraming: 'Wisdom dispenses truth in due time.',
      newWorldFraming: 'Seed Colony',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Junior Academy', emoji: '👶' }],
      [BLDG_UNIVERSITY, { name: 'Wisdom Tower', emoji: '⏳' }],
      [BLDG_CATHEDRAL, { name: 'Hall of Ancestors', emoji: '🏛️' }],
      [BLDG_LAUNCH_PAD, { name: 'Seed Departure', emoji: '🌱' }],
    ]),
    citizenTierNames: {
      1: 'Youth',
      2: 'Adult',
      3: 'Sage',
      4: 'Elder',
      5: 'The Council',
    },
    diplomacy: {
      defaultStance: 'wary',
      hostileToThemes: [THEME_GAME_SHOW, THEME_INFLUENCER],
      friendlyToThemes: [],
      canTrade: true,
      canConvert: false,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'isolationist',
    assetCues: cues('gerontocracy'),
  },
  {
    id: THEME_MEMETIC_CULT,
    name: 'Memetic Cult',
    emoji: '🎭',
    tagline: 'The Idea Spreads',
    description: 'Citizens infected with a viral idea of "new world salvation."',
    palette: {
      bgPrimary: '#180a18',
      bgSecondary: '#2a142a',
      fgPrimary: '#f0d8e8',
      fgSecondary: '#c898b8',
      accent: '#d04a9a',
      accentAlt: '#88e8c0',
      success: '#3a8a5e',
      warning: '#c8a83a',
      danger: '#a83a5a',
      muted: '#7a4a6a',
      border: '#3a1c3a',
    },
    fonts: {
      heading: '"Bungee", "Audiowide", display',
      body: '"Quicksand", sans-serif',
      mono: '"Fira Code", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Spread the idea. The truth wants to be free.',
      oneWayTripCoverName: 'Truth-Spreading Migration',
      volunteerEpithet: 'Carrier',
      enemyEpithet: 'Skeptic',
      victoryAnnouncement: 'The skeptics have been infected by the truth.',
      defeatExcuse: 'The idea endures even when carriers fall.',
      subterfugeFraming: 'The truth needs no permission to spread.',
      newWorldFraming: 'Truth Vector',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Idea Factory', emoji: '💡' }],
      [BLDG_UNIVERSITY, { name: 'Truth Lab', emoji: '🎭' }],
      [BLDG_TV_STATION, { name: 'Viral Broadcast', emoji: '📡' }],
      [BLDG_LAUNCH_PAD, { name: 'Vector Departure', emoji: '🦠' }],
    ]),
    citizenTierNames: {
      1: 'Carrier',
      2: 'Spreader',
      3: 'Amplifier',
      4: 'Architect',
      5: 'The Source',
    },
    diplomacy: {
      defaultStance: 'wary',
      hostileToThemes: [THEME_SURVEILLANCE, THEME_MILITARY_JUNTA, THEME_EUGENICS],
      friendlyToThemes: [],
      canTrade: false,
      canConvert: true,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'subversive',
    assetCues: cues('memetic-cult'),
  },
  {
    id: THEME_WARLORD_CONFEDERACY,
    name: 'Warlord Confederacy',
    emoji: '⚔️',
    tagline: 'Glory and Plunder',
    description: 'Loose alliance of warlord clans. Tribute extraction is the social contract.',
    palette: {
      bgPrimary: '#180a08',
      bgSecondary: '#2a1410',
      fgPrimary: '#f0c8a8',
      fgSecondary: '#c08868',
      accent: '#d04a2a',
      accentAlt: '#e8a868',
      success: '#7a8a3a',
      warning: '#d4a13a',
      danger: '#a82a1a',
      muted: '#7a4a3a',
      border: '#3a1c14',
    },
    fonts: {
      heading: '"Cinzel", "Trajan Pro", serif',
      body: '"Roboto Slab", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Glory awaits the bold. Plunder the stars.',
      oneWayTripCoverName: 'Glory Raid',
      volunteerEpithet: 'Warrior',
      enemyEpithet: 'Vassal',
      victoryAnnouncement: 'The vassals lie crushed beneath our chariots.',
      defeatExcuse: 'A glorious last stand. The bards will sing.',
      subterfugeFraming: 'Cunning is a warrior virtue.',
      newWorldFraming: 'Conquest Holding',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Raider Camp', emoji: '🪖' }],
      [BLDG_UNIVERSITY, { name: 'War Academy', emoji: '⚔️' }],
      [BLDG_LAUNCH_PAD, { name: 'Raid Pad', emoji: '🚀' }],
      [BLDG_FACTORY, { name: 'Forge of Conquest', emoji: '⚙️' }],
    ]),
    citizenTierNames: {
      1: 'Footman',
      2: 'Warrior',
      3: 'Captain',
      4: 'Warlord',
      5: 'The Khan',
    },
    diplomacy: {
      defaultStance: 'hostile',
      hostileToThemes: [THEME_BUREAUCRATIC, THEME_INFLUENCER],
      friendlyToThemes: [],
      canTrade: false,
      canConvert: false,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'warmonger',
    assetCues: cues('warlord'),
  },
  {
    id: THEME_PHARAONIC,
    name: 'Pharaonic Dynasty',
    emoji: '𓂀',
    tagline: 'The Living God Decrees',
    description:
      'A divine king whose word is law. Off-world departures are votive offerings to eternity.',
    palette: {
      bgPrimary: '#1c1408',
      bgSecondary: '#2c2210',
      fgPrimary: '#f4e8c0',
      fgSecondary: '#d4b878',
      accent: '#c89030',
      accentAlt: '#7ad8b8',
      success: '#5a8a3a',
      warning: '#d4a13a',
      danger: '#a83a1a',
      muted: '#7a6440',
      border: '#3e3018',
    },
    fonts: {
      heading: '"Cinzel", "Papyrus", serif',
      body: '"Cormorant Garamond", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'The Living God commands. The faithful obey.',
      oneWayTripCoverName: 'Eternal Voyage Offering',
      volunteerEpithet: 'Servant',
      enemyEpithet: 'Outlander',
      victoryAnnouncement: 'The outlanders are dust beneath the Pharaoh.',
      defeatExcuse: 'A god-test. The Living God endures forever.',
      subterfugeFraming: 'Divine truths are inscribed for the literate priesthood.',
      newWorldFraming: 'Eternal Holding',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Scribe Hall', emoji: '📜' }],
      [BLDG_UNIVERSITY, { name: 'Hall of Records', emoji: '𓂀' }],
      [BLDG_CATHEDRAL, { name: 'Temple of the Living God', emoji: '𓂀' }],
      [BLDG_LAUNCH_PAD, { name: 'Eternal Embarkation', emoji: '🚀' }],
    ]),
    citizenTierNames: {
      1: 'Servant',
      2: 'Scribe',
      3: 'Priest',
      4: 'Vizier',
      5: 'The Living God',
    },
    diplomacy: {
      defaultStance: 'wary',
      hostileToThemes: [THEME_GAME_SHOW, THEME_ANARCHO_CAPITALIST],
      friendlyToThemes: [THEME_THEOCRACY],
      canTrade: false,
      canConvert: false,
      demandsTribute: true,
    },
    aiPersonalityArchetype: 'cultist',
    assetCues: cues('pharaonic'),
  },
  {
    id: THEME_BUREAUCRATIC,
    name: 'Bureaucratic Hellscape',
    emoji: '📑',
    tagline: 'Form Filed in Triplicate',
    description: 'A civilization where paperwork is faith. Off-world departures require Form 27-B.',
    palette: {
      bgPrimary: '#181814',
      bgSecondary: '#28281f',
      fgPrimary: '#e0e0d4',
      fgSecondary: '#909078',
      accent: '#7a7a3a',
      accentAlt: '#a8a878',
      success: '#5a7a3a',
      warning: '#a8843a',
      danger: '#7a3a3a',
      muted: '#5a5a4a',
      border: '#2c2c1f',
    },
    fonts: {
      heading: '"Roboto Slab", serif',
      body: '"IBM Plex Sans", sans-serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Submit Form 27-B for off-world reassignment processing.',
      oneWayTripCoverName: 'Form 27-B Reassignment',
      volunteerEpithet: 'Applicant',
      enemyEpithet: 'Non-Compliant',
      victoryAnnouncement: 'Adversary processed in accordance with Subsection 14.',
      defeatExcuse: 'A clerical error. Resubmit with corrections.',
      subterfugeFraming: 'Documentation is its own truth.',
      newWorldFraming: 'Off-World Field Office',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Form Office', emoji: '📋' }],
      [BLDG_UNIVERSITY, { name: 'Filing Hall', emoji: '📑' }],
      [BLDG_LAUNCH_PAD, { name: 'Departures Window', emoji: '📑' }],
      [BLDG_TV_STATION, { name: 'Internal Memo Channel', emoji: '📠' }],
    ]),
    citizenTierNames: {
      1: 'Applicant',
      2: 'Clerk',
      3: 'Senior Clerk',
      4: 'Director',
      5: 'The Permanent Secretary',
    },
    diplomacy: {
      defaultStance: 'neutral',
      hostileToThemes: [THEME_WARLORD_CONFEDERACY, THEME_MEMETIC_CULT],
      friendlyToThemes: [],
      canTrade: true,
      canConvert: false,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'isolationist',
    assetCues: cues('bureaucratic'),
  },
  {
    id: THEME_INFLUENCER,
    name: 'Influencer Republic',
    emoji: '📱',
    tagline: 'Engagement Is Citizenship',
    description:
      'Citizenship measured in followers. The most-engaged star in the off-world stream.',
    palette: {
      bgPrimary: '#180e1c',
      bgSecondary: '#2a1838',
      fgPrimary: '#f0e0ff',
      fgSecondary: '#c8a8e0',
      accent: '#ff3aa8',
      accentAlt: '#3acdff',
      success: '#3acc8a',
      warning: '#ffaa3a',
      danger: '#e63a5e',
      muted: '#7a5a8a',
      border: '#3a1e44',
    },
    fonts: {
      heading: '"Quicksand", sans-serif',
      body: '"Quicksand", sans-serif',
      mono: '"Fira Code", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Verified Influencers — apply for the off-world feature stream!',
      oneWayTripCoverName: 'Verified Off-World Feature',
      volunteerEpithet: 'Verified',
      enemyEpithet: 'Cancelled',
      victoryAnnouncement: 'The cancelled have been deplatformed. Engagement up.',
      defeatExcuse: 'A temporary algorithmic shadowban. We will be back.',
      subterfugeFraming: 'Curation is a creative act.',
      newWorldFraming: 'Trending Feature',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: 'Content Bootcamp', emoji: '📱' }],
      [BLDG_UNIVERSITY, { name: 'Studio Compound', emoji: '🎬' }],
      [BLDG_TV_STATION, { name: 'Stream Studio', emoji: '📺' }],
      [BLDG_LAUNCH_PAD, { name: 'Verified Departure', emoji: '✓' }],
    ]),
    citizenTierNames: {
      1: 'Follower',
      2: 'Subscriber',
      3: 'Verified',
      4: 'Influencer',
      5: 'The Algorithm Star',
    },
    diplomacy: {
      defaultStance: 'neutral',
      hostileToThemes: [THEME_GERONTOCRACY, THEME_BUREAUCRATIC],
      friendlyToThemes: [THEME_GAME_SHOW, THEME_ANARCHO_CAPITALIST, THEME_CORPORATE],
      canTrade: true,
      canConvert: false,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'opportunist',
    assetCues: cues('influencer'),
  },
  {
    id: THEME_SOVIET_COLLECTIVE,
    name: 'Soviet-Era Collective',
    emoji: '☭',
    tagline: 'For the Five-Year Plan',
    description:
      'Centrally-planned colonization. Comrades volunteer per the Production Council mandate.',
    palette: {
      bgPrimary: '#180a08',
      bgSecondary: '#2a1410',
      fgPrimary: '#f0e0c0',
      fgSecondary: '#c8a878',
      accent: '#c83a2a',
      accentAlt: '#d4a13a',
      success: '#7a8a3a',
      warning: '#d4a13a',
      danger: '#a82a1a',
      muted: '#7a4a3a',
      border: '#3a1c14',
    },
    fonts: {
      heading: '"Stencil Std", "Impact", sans-serif',
      body: '"Roboto Slab", serif',
      mono: '"Courier Prime", monospace',
    },
    propaganda: {
      recruitmentSlogan: 'Comrade — volunteer for the off-world quota!',
      oneWayTripCoverName: 'Five-Year Plan Off-World Mandate',
      volunteerEpithet: 'Comrade',
      enemyEpithet: 'Counter-Revolutionary',
      victoryAnnouncement: 'The counter-revolutionaries are crushed beneath the workers.',
      defeatExcuse: 'A wrecker conspiracy. The next plan will succeed.',
      subterfugeFraming: 'The collective decides what serves the collective.',
      newWorldFraming: 'Production Outpost',
    },
    buildingOverrides: new Map<BuildingDefId, ThemeBuildingNameOverride>([
      [BLDG_SCHOOL, { name: "Workers' Committee", emoji: '☭' }],
      [BLDG_UNIVERSITY, { name: 'Production Council', emoji: '🏭' }],
      [BLDG_FACTORY, { name: "Workers' Factory", emoji: '⚙️' }],
      [BLDG_LAUNCH_PAD, { name: 'Plan Departure', emoji: '🚀' }],
    ]),
    citizenTierNames: {
      1: 'Comrade',
      2: 'Worker',
      3: 'Specialist',
      4: 'Cadre',
      5: 'General Secretary',
    },
    diplomacy: {
      defaultStance: 'hostile',
      hostileToThemes: [
        THEME_CORPORATE,
        THEME_ANARCHO_CAPITALIST,
        THEME_HEREDITARY_MONARCHY,
        THEME_CYBERPUNK_MEGACORP,
      ],
      friendlyToThemes: [],
      canTrade: false,
      canConvert: true,
      demandsTribute: false,
    },
    aiPersonalityArchetype: 'builder',
    assetCues: cues('soviet'),
  },
]

const THEME_INDEX: ReadonlyMap<ThemeId, Theme> = new Map(THEMES.map((t) => [t.id, t]))

export function getTheme(id: ThemeId): Theme {
  const theme = THEME_INDEX.get(id)
  if (!theme) throw new Error(`Unknown theme id: ${String(id)}`)
  return theme
}

export function listThemeIds(): ReadonlyArray<ThemeId> {
  return THEMES.map((t) => t.id)
}

export function themesByArchetype(archetype: AIPersonalityArchetype): ReadonlyArray<Theme> {
  return THEMES.filter((t) => t.aiPersonalityArchetype === archetype)
}

export function getThemedBuildingName(theme: Theme, buildingDefId: BuildingDefId): string | null {
  return theme.buildingOverrides.get(buildingDefId)?.name ?? null
}

export function getThemedBuildingEmoji(theme: Theme, buildingDefId: BuildingDefId): string | null {
  return theme.buildingOverrides.get(buildingDefId)?.emoji ?? null
}

export function getThemedCitizenTierName(theme: Theme, tier: CitizenTier): string {
  return theme.citizenTierNames[tier]
}

export function getDiplomacyStance(self: Theme, other: Theme): DiplomacyStance {
  if (self.id === other.id) return 'friendly'
  if (self.diplomacy.hostileToThemes.includes(other.id)) return 'hostile'
  if (self.diplomacy.friendlyToThemes.includes(other.id)) return 'friendly'
  return self.diplomacy.defaultStance
}

export function paletteAsCSSVars(palette: ThemePalette): Readonly<Record<string, string>> {
  return {
    '--bg-primary': palette.bgPrimary,
    '--bg-secondary': palette.bgSecondary,
    '--fg-primary': palette.fgPrimary,
    '--fg-secondary': palette.fgSecondary,
    '--accent': palette.accent,
    '--accent-alt': palette.accentAlt,
    '--success': palette.success,
    '--warning': palette.warning,
    '--danger': palette.danger,
    '--muted': palette.muted,
    '--border': palette.border,
  }
}

export function fontsAsCSSVars(fonts: ThemeFonts): Readonly<Record<string, string>> {
  return {
    '--font-heading': fonts.heading,
    '--font-body': fonts.body,
    '--font-mono': fonts.mono,
  }
}

export function themeAsCSSVars(theme: Theme): Readonly<Record<string, string>> {
  return { ...paletteAsCSSVars(theme.palette), ...fontsAsCSSVars(theme.fonts) }
}
