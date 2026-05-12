import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  type Account,
  type BuildingDefId,
  type CampaignArchetype,
  type ColonyShipVariantId,
  type LootDrop,
  type LootDropId,
  type MissionObjectiveConfig,
  type PlanetId,
  type ShipBeaconBroadcast,
  type TargetingMode,
  type ThemeId,
  type Tile,
  COLONY_SHIPS,
  RESOURCE_FUEL,
  THEMES,
  accountId as accountIdValue,
  aggregateEffects,
  getActiveShipBeacons,
  newAnonymousAccount,
  themeAsCSSVars,
} from '@smol/shared'
import { type MatchAISlotConfig, type MatchConfig } from '../../match/MatchSim'
import { selectEmpireAggregate } from '../../match/empireSelectors'
import { useMatchSim } from '../../match/useMatchSim'
import { AIPlayerPanel, type AIPlayerSnapshot } from '../panels/AIPlayerPanel'
import { BeaconPanel } from '../panels/BeaconPanel'
import { CommandPadPanel } from '../panels/CommandPadPanel'
import { CitizensPanel } from '../panels/CitizensPanel'
import { FlightDetailPanel } from '../panels/FlightDetailPanel'
import { MiningFleetPanel } from '../panels/MiningFleetPanel'
import { PlanetEnergyPanel } from '../panels/PlanetEnergyPanel'
import { LaunchManifestModal, type LaunchManifestSubmission } from '../panels/LaunchManifestModal'
import { ProductionChainsPanel } from '../panels/ProductionChainsPanel'
import { TrackingCameraPanel } from '../panels/TrackingCameraPanel'
import { PlanetSummaryPanel } from '../panels/PlanetSummaryPanel'
import { PlanetInventoryPanel } from '../panels/PlanetInventoryPanel'
import { SettlementsPanel, type SettlementGroupSnapshot } from '../panels/SettlementsPanel'
import { QuotasPanel } from '../panels/QuotasPanel'
import { ShipBuilderPanel } from '../panels/ShipBuilderPanel'
import { ColonyShipFlightPanel } from '../panels/ColonyShipFlightPanel'
import { DeceptionPanel } from '../panels/DeceptionPanel'
import { IndigenousPanel } from '../panels/IndigenousPanel'
import { LastHopePanel } from '../panels/LastHopePanel'
import { LootDropPanel } from '../panels/LootDropPanel'
import { ResourcesPanel } from '../panels/ResourcesPanel'
import { ShipBuildPanel } from '../panels/ShipBuildPanel'
import { TargetingModePanel } from '../panels/TargetingModePanel'
import { TechDetailPanel } from '../panels/TechDetailPanel'
import { TechTreePanel } from '../panels/TechTreePanel'
import { TilePlacementGrid } from '../panels/TilePlacementGrid'
import { BootSequencePanel } from '../panels/BootSequencePanel'
import { GalaxyView } from '../../render/scene/GalaxyView'
import { BuildPicker } from '../play/BuildPicker'
import { getAudioSystem } from '../../audio/AudioSystem'
import { type SfxEventId } from '../../audio/sfxManifest'
import { loadGlobalCategorySnapshots } from '../../match/leaderboardStorage'
import { HallOfChampionsPanel } from '../panels/HallOfChampionsPanel'
import { DefensePanel, type DefensePanelIncomingThreat } from '../panels/DefensePanel'
import { CaravanPanel, type CaravanPanelPlanetSnapshot } from '../panels/CaravanPanel'
import { CampaignPicker } from '../play/CampaignPicker'
import { DockZoneOverlay } from '../play/DockZoneOverlay'
import { HUDOverlay } from '../play/HUDOverlay'
import { PanelFrame } from '../play/PanelFrame'
import { PanelLayoutProvider } from '../play/PanelLayoutContext'
import { TopToolbar } from '../play/TopToolbar'
import { PlanetPicker } from '../play/PlanetPicker'
import { TelemetryRack } from '../play/TelemetryRack'
import { Toasts } from '../play/Toasts'
import { type PanelId, type ToastNotification } from '../play/types'
import { MatchEndScreen } from './MatchEndScreen'

interface MatchSetupHint {
  readonly seed: number
  readonly aiCount: number
  readonly planetCount: number
  readonly humanThemeId?: ThemeId
  readonly objectives?: ReadonlyArray<MissionObjectiveConfig>
  readonly aiSlots?: ReadonlyArray<MatchAISlotConfig>
  // PHASE 17.K — host-chosen fog-of-war toggle. Default true (UMS-faithful). When false, the
  // map renders without fog and every enemy planet/flag is visible from match start.
  readonly fogOfWarEnabled?: boolean
  // PHASE 17.L.A.13 — Q12 PHASE 17 LOCKED. NewGamePage save-mode dropdown threads through.
  // Defaults to 'auto-5min' when omitted.
  readonly saveMode?: 'off' | 'manual' | 'auto-5min' | 'auto-15min'
}

const DEFAULT_OBJECTIVES: ReadonlyArray<MissionObjectiveConfig> = [
  { id: 'last_civ_standing', target: 1 },
  { id: 'apex_tech', target: 1 },
]

const TOAST_LIFETIME_MS = 3500
const TOAST_PURGE_INTERVAL_MS = 500
const OPEN_PANELS_STORAGE_KEY = 'smol.open-panels.v1'

// PHASE 17.12.8 — audio cues for game events. Maps each `MatchEventLog.kind` (+ optional
// message prefix detection for finer-grained cues) onto an `SfxEventId` so the existing
// AudioSystem's procedural-synth bus fires the right cue. Returns null for kinds with no
// audio cue (e.g. low-volume system spam). Volume is governed by the existing SFX bus
// slider in AudioSettingsPanel.
function eventKindToSfx(kind: string, message: string): SfxEventId | null {
  switch (kind) {
    case 'build':
      return 'build-complete'
    case 'launch':
      // Differentiate impact vs launch by message prefix — launches start with "🚀" or the
      // colony-ship build verb; impacts contain "HIT" / "DETONATED" / "intercepted" etc.
      if (message.includes('intercept')) return 'colony-ship-intercepted'
      if (message.includes('HIT') || message.includes('DETONATE')) return 'colony-ship-impact'
      return 'launch-colony-ship'
    case 'research':
      return message.includes('complete') ? 'research-complete' : 'research-progress-tick'
    case 'campaign':
      return 'campaign-launch'
    case 'crash':
      return 'colony-ship-impact'
    case 'civ_defeated':
      return 'civ-defeated'
    case 'planet_claimed':
      return 'colony-established'
    case 'loot':
      // No dedicated coin-pickup SFX in the manifest; reuse build-complete chime as a
      // positive-feedback proxy. Future polish pass can add a dedicated 'loot-collected'
      // cue if the loot UX gets its own polish.
      return 'build-complete'
    case 'indigenous':
      return message.includes('attack') || message.includes('captured')
        ? 'beacon-alert-impact'
        : 'click-back'
    case 'last_hope':
      return 'beacon-alert-incoming'
    case 'achievement_unlock':
      return 'achievement-unlocked'
    case 'intercept':
      return 'colony-ship-intercepted'
    case 'system':
      // Build-failure events start with ❌. Match-end events have "Match ended". Everything
      // else stays silent to avoid spamming the SFX bus.
      if (message.startsWith('❌')) return 'ui-error'
      if (message.startsWith('Match ended')) {
        return message.includes('prevailed') ? 'match-victory' : 'match-defeat'
      }
      return null
    default:
      return null
  }
}

function loadOpenPanelsFromStorage(): Set<PanelId> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(OPEN_PANELS_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((s): s is PanelId => typeof s === 'string') as PanelId[])
  } catch {
    return new Set()
  }
}

export function PlayPage() {
  const location = useLocation() as { state?: MatchSetupHint }
  const navigate = useNavigate()

  const initialConfig = useMemo<MatchConfig>(() => {
    const hint = location.state ?? null
    const seed = hint?.seed ?? Math.floor(Math.random() * 0xffffff)
    const aiCount = hint?.aiCount ?? 3
    // PHASE 17.L.D.1 (HOTFIX 2026-05-11) — fallback planetCount aligned with new "Tiny"
    // preset (20 planets / ~3 systems) per user verbatim playtest report. Was 30 — adjusted
    // down so /play without a NewGamePage hint defaults to a comfortably-sized galaxy.
    const planetCount = hint?.planetCount ?? 20
    const humanThemeId = hint?.humanThemeId ?? THEMES[Math.floor(Math.random() * THEMES.length)]!.id
    const objectives = hint?.objectives ?? DEFAULT_OBJECTIVES
    const aiSlots = hint?.aiSlots
    const account: Account = newAnonymousAccount(
      accountIdValue('local-player'),
      'Player 1',
      'player-1',
      0,
    )
    const base: MatchConfig = {
      seed,
      planetCount,
      aiCount,
      humanThemeId,
      humanDisplayName: 'You',
      humanAccount: account,
      objectives,
      tickCapOverride: null,
      fogOfWarEnabled: hint?.fogOfWarEnabled ?? true,
      saveMode: hint?.saveMode ?? 'auto-5min',
    }
    return aiSlots ? { ...base, aiSlots } : base
  }, [location.state])

  const sim = useMatchSim(initialConfig)

  // === Panel + mode state ===
  // PHASE 17.J.3 — persist which panels are open across page reloads.
  const [openPanels, setOpenPanels] = useState<Set<PanelId>>(() => loadOpenPanelsFromStorage())
  // PHASE 17.L.A.14 — boot-ceremony /play first-mount gate per Q9 PHASE 17 LOCKED:
  // "Full UMS-flavored 28-check boot — runs before /play unlocks, ticks through each check,
  // final line = theme reveal. Skippable with Space." Fullscreen BootSequencePanel overlay
  // until the player either waits it out or hits Space. World view + sim renders only after.
  const [bootReady, setBootReady] = useState(false)
  const [buildMode, setBuildMode] = useState<BuildingDefId | null>(null)
  const [selectedPlanetId, setSelectedPlanetId] = useState<PlanetId | null>(null)
  // PHASE 17.L.D.13 (HOTFIX 2026-05-11) — focus-and-zoom request for GalaxyView. Set when
  // the player clicks a row in PlanetPicker; GalaxyView watches the nonce and fires its
  // tween-to-planet animation. Re-clicking the same planet generates a fresh nonce so the
  // tween re-fires even when the planet id is the same.
  const [focusPlanetTrigger, setFocusPlanetTrigger] = useState<{
    readonly planetId: PlanetId
    readonly nonce: number
  } | null>(null)
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const lastSeenEventIdxRef = useRef(0)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        OPEN_PANELS_STORAGE_KEY,
        JSON.stringify([...openPanels].map(String)),
      )
    } catch {
      // ignore
    }
  }, [openPanels])

  // PHASE 16.19: salvo-round orchestrator state. One-click "Fire Salvo Round" cycles
  // BUILDALL → wait → ARMALL → wait → LAUNCHALL. salvoRoundPhase tracks progress so the
  // panel shows "BUILDING..." / "ARMING..." / "LAUNCHING..." live.
  const [salvoRoundPhase, setSalvoRoundPhase] = useState<
    null | 'BUILDING' | 'ARMING' | 'LAUNCHING'
  >(null)
  // PHASE 16.37 — auto-fire indefinite-loop toggle. When ON, the salvo cycle auto-restarts
  // on completion so the player can "fire and forget" a sustained barrage. Toggle OFF mid-
  // cycle and the current round finishes naturally without queuing another.
  const [autoFireLoopActive, setAutoFireLoopActive] = useState(false)

  // HOTFIX 17.L.D.14 — Tech detail selection state. Owned by PlayPage so TechTreePanel +
  // TechDetailPanel can react to the same selectedTechId independently. Clicking a tech in
  // the tree auto-opens the detail panel so the player doesn't have to find the toolbar button.
  const [selectedTechId, setSelectedTechId] = useState<import('@smol/shared').TechId | null>(null)

  // PHASE 17.L.A.7+A.8 — launch-manifest request state. ShipBuildPanel.onLaunch sets this with
  // the chosen pad + target; LaunchManifestModal renders when non-null. Cleared on cancel or
  // confirm-then-launch. Per-pad model so multi-pad civs can have one manifest pending without
  // affecting others (only one modal at a time though — the player picked Launch on a pad).
  const [launchManifestRequest, setLaunchManifestRequest] = useState<{
    padId: import('@smol/shared').TileId
    targetPlanetId: PlanetId
    targetPlanetLabel: string
  } | null>(null)

  // PHASE 17.L.C.4 — planet summary / inventory popup state. summaryPlanetId tracks which
  // planet the player is inspecting (independent of selectedPlanetId so the build canvas stays
  // on whatever planet they were on). inventoryFeedback surfaces upgrade-action results into
  // the PlanetInventoryPanel as a one-line acknowledgement.
  const [summaryPlanetId, setSummaryPlanetId] = useState<PlanetId | null>(null)
  const [inventoryFeedback, setInventoryFeedback] = useState<string | null>(null)

  // PHASE 17.13.5 — active settlement for the picker UI. v1 read-only — picking a settlement
  // doesn't yet retarget Stockpile/Workforce/Loyalty panels (that's 17.13.6's aggregate-vs-
  // detail toggle when per-settlement state lives in sim). Stored here so the panel can
  // highlight the selection across renders.
  const [activeSettlementId, setActiveSettlementId] = useState<
    import('@smol/shared').SettlementId | null
  >(null)

  // PHASE 17.12.9 — camera position presets. Slot N maps to a PlanetId the player saved with
  // Ctrl+N; Shift+N recalls that planet (fires focus-and-zoom). Slot 0 is always implicit
  // home-planet so the player can always Shift+0 back to their starting world. Persists for
  // the lifetime of the match; cleared on resetMatch. The full RTS preset (target + zoom +
  // yaw + pitch) requires camera-state read/write through GalaxyView's persistedCameraState
  // WeakMap — v1 ships planet-id presets only; granular yaw/pitch capture deferred.
  const [cameraPresets, setCameraPresets] = useState<ReadonlyMap<number, PlanetId>>(new Map())

  // PHASE 16.23: clicked-flight selection state. Set when player clicks a flight cone in
  // GalaxyView; cleared when FlightDetailPanel close button is pressed or overlay click.
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  // PHASE 16.31: god-control redirect mode. Set when player clicks "Select for Redirect" in
  // FlightDetailPanel; next right-click on a planet in GalaxyView fires sim.redirectFlight.
  // Reset after one use (whether successful or not).
  const [redirectModeFlightId, setRedirectModeFlightId] = useState<string | null>(null)
  // PHASE 16.33: UMS 6-mode targeting selection. Held in PlayPage local state so the next
  // single-pad launch + controller LAUNCHALL command apply the chosen mode. Default GPS keeps
  // early-game launches working without the player picking a mode. Toggle the picker via 'm'
  // keyboard shortcut.
  const [currentTargetingMode, setCurrentTargetingMode] = useState<TargetingMode>('GPS')
  const [showTargetingPanel, setShowTargetingPanel] = useState(false)

  // PHASE 16.13.9: /play canvas defaults to the 3D GalaxyView. The legacy 2D TilePlacementGrid
  // is kept ONLY as a dev-debug overlay reachable via `?dev=hexgrid` URL flag. Per LAW #0
  // 2026-05-10 the 3D x,y,z universe is the canonical canvas — NO 2D / hex-game / card-game
  // fallback as the default. NEVER swap this default without verifying tile-click → placeBuilding
  // is wired through GalaxyView (feedback_never_ship_canvas_pivot_without_wiring_all_interactions.md).
  const isDevHexGridFallback = useMemo(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('dev') === 'hexgrid'
  }, [])

  // === Computed state ===
  const humanCivState = sim.state.civs.get(sim.state.humanCivId)!
  const humanTheme = humanCivState.theme
  const styleVars = useMemo(() => themeAsCSSVars(humanTheme), [humanTheme])

  const ownedPlanets = [...sim.state.planets.values()].filter(
    (p) => p.civId === sim.state.humanCivId,
  )
  void sim.tickCount

  // PHASE 17.PRE.1 — reference-stable owned-planet ID set. Before this fix, `ownedPlanetIds`
  // was rebuilt as a new Set on every PlayPage render (which fires every game tick). That new
  // Set instance was in GalaxyView's main useEffect dep array, causing the entire Three.js
  // scene to tear down + rebuild 5×/sec at default tick speed — camera position / zoom /
  // input state all reset. We memoize on the actual id-string (sorted + joined) so the Set
  // identity stays stable unless the owned-planet membership actually changes.
  const ownedPlanetIdsKey = ownedPlanets
    .map((p) => String(p.planet.id))
    .sort()
    .join(',')
  const ownedPlanetIds = useMemo(
    () => new Set(ownedPlanets.map((p) => p.planet.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ownedPlanetIdsKey],
  )

  const activePlanetId = selectedPlanetId ?? humanCivState.homePlanetId
  const activePlanet =
    sim.state.planets.get(activePlanetId) ?? sim.state.planets.get(humanCivState.homePlanetId)!

  const aiSnapshots: ReadonlyArray<AIPlayerSnapshot> = [...sim.state.civs.values()]
    .filter((c) => !c.isHuman && c.alive)
    .map((c) => ({
      civLabel: c.displayName,
      theme: c.theme,
      playstyle: c.playstyle ?? 'builder',
      difficulty: c.difficulty ?? 'medium',
      lastDecisionLine: `tick=${sim.state.currentTick} | techs=${c.empire.researchedTechs.size} | ships=${c.deceptionLedger.colonyShipsLaunched} | planets=${c.empire.controlledPlanetIds.size}`,
      lastTick: sim.state.currentTick,
    }))

  const otherPlanetsForLaunch = [...sim.state.planets.values()]
    .filter((p) => p.civId !== sim.state.humanCivId)
    .map((p) => ({
      id: String(p.planet.id),
      label: `${String(p.planet.id)} (${p.civId})`,
    }))

  // PHASE 17.L.B.9 — targetable-planet roster for the CommandPadPanel waypoint queue editor.
  // Same source as `otherPlanetsForLaunch` (every non-human-owned planet in the galaxy) but
  // typed with raw PlanetId + an isEnemy flag so the editor can flag enemy targets visually.
  // Unclaimed / neutral planets stay in the list because targeting them is valid (claim ship).
  const targetablePlanetsForCommandPad = [...sim.state.planets.values()]
    .filter((p) => p.civId !== sim.state.humanCivId)
    .map((p) => {
      const ownerCiv = p.civId !== null ? sim.state.civs.get(p.civId) : null
      const ownerLabel = ownerCiv ? ` ${ownerCiv.theme.emoji} ${ownerCiv.theme.name}` : ' unclaimed'
      return {
        id: p.planet.id,
        label: `${String(p.planet.id)} ·${ownerLabel}`,
        isEnemy: p.civId !== null,
      }
    })

  const lootDropsOnOurPlanets: LootDrop[] = []
  for (const drop of sim.state.lootDrops.values()) {
    const p = sim.state.planets.get(drop.planetId)
    if (p && p.civId === sim.state.humanCivId) lootDropsOnOurPlanets.push(drop)
  }

  const indigenousOnActivePlanet = activePlanet.indigenousCivId
    ? (sim.state.indigenousCivs.get(activePlanet.indigenousCivId) ?? null)
    : null

  const techEffects = aggregateEffects(humanCivState.empire.researchedTechs)
  const firstPad = [...activePlanet.launchPads.values()][0] ?? null

  // PHASE 16.16 (LAW #0 feedback_planets_green_big_multi_civ.md): per-planet multi-civ
  // presence — for each planet, list every civ holding at least 1 tile, sorted by tile count
  // desc. Feeds GalaxyView's flag-stack rendering so a contested planet shows multiple flags
  // above it instead of a single owner-only flag.
  //
  // PHASE 16.20: for each civ on a planet we also compute the cluster centroid of that civ's
  // owned tiles in WORLD space (mean of tile centroids → normalize → lift to radius*1.18 →
  // add planet world position). The 3D layer plants each civ's flag over its actual territory
  // instead of stacking flags vertically above the planet's pole. Antipodal-cluster fallback:
  // if the mean vector length is too small, anchor on the first owned tile.
  const civsByPlanet = useMemo(
    () => {
      // PHASE 16.38 — fog of war: suppress civ-presence (flag billboards) for planets the
      // human civ hasn't discovered yet. Player still sees planet sprites at galactic scale
      // so the map is navigable, but enemy ownership stays hidden until the player launches
      // a flight there OR an enemy launches AT them (defender discovery).
      const humanDiscovered = humanCivState.empire.discoveredPlanetIds
      const out = new Map<
        PlanetId,
        ReadonlyArray<{
          civId: import('@smol/shared').CivId
          tileCount: number
          centroidWorld?: import('@smol/shared').Vec3
        }>
      >()
      for (const planetState of sim.state.planets.values()) {
        const planet = planetState.planet
        if (!humanDiscovered.has(planet.id)) continue
        const counts = new Map<import('@smol/shared').CivId, number>()
        const sums = new Map<
          import('@smol/shared').CivId,
          { x: number; y: number; z: number; firstCentroid: import('@smol/shared').Vec3 }
        >()
        for (const tile of planet.tiles) {
          if (!tile.ownerCivId) continue
          counts.set(tile.ownerCivId, (counts.get(tile.ownerCivId) ?? 0) + 1)
          const sum = sums.get(tile.ownerCivId)
          if (sum) {
            sum.x += tile.centroid.x
            sum.y += tile.centroid.y
            sum.z += tile.centroid.z
          } else {
            sums.set(tile.ownerCivId, {
              x: tile.centroid.x,
              y: tile.centroid.y,
              z: tile.centroid.z,
              firstCentroid: tile.centroid,
            })
          }
        }
        if (counts.size === 0) continue
        const liftRadius = planet.radius * 1.18
        const sorted = [...counts.entries()]
          .map(([civId, tileCount]) => {
            const sum = sums.get(civId)!
            const meanX = sum.x / tileCount
            const meanY = sum.y / tileCount
            const meanZ = sum.z / tileCount
            const meanLen = Math.sqrt(meanX * meanX + meanY * meanY + meanZ * meanZ)
            let dirX: number, dirY: number, dirZ: number
            if (meanLen < planet.radius * 0.1) {
              const fcLen = Math.sqrt(
                sum.firstCentroid.x * sum.firstCentroid.x +
                  sum.firstCentroid.y * sum.firstCentroid.y +
                  sum.firstCentroid.z * sum.firstCentroid.z,
              )
              if (fcLen < 0.0001) {
                dirX = 0
                dirY = 1
                dirZ = 0
              } else {
                dirX = sum.firstCentroid.x / fcLen
                dirY = sum.firstCentroid.y / fcLen
                dirZ = sum.firstCentroid.z / fcLen
              }
            } else {
              dirX = meanX / meanLen
              dirY = meanY / meanLen
              dirZ = meanZ / meanLen
            }
            const centroidWorld: import('@smol/shared').Vec3 = {
              x: planet.position.x + dirX * liftRadius,
              y: planet.position.y + dirY * liftRadius,
              z: planet.position.z + dirZ * liftRadius,
            }
            return { civId, tileCount, centroidWorld }
          })
          .sort((a, b) => b.tileCount - a.tileCount)
        out.set(planet.id, sorted)
      }
      return out
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim.state, sim.state.currentTick],
  )

  // PHASE 16.16: explicit indigenous-civ marker per planet hosting an active indig presence.
  const indigenousByPlanet = useMemo(
    () => {
      const out: Array<{ planetId: PlanetId; emoji: string; label: string }> = []
      for (const indig of sim.state.indigenousCivs.values()) {
        if (!indig.alive) continue
        out.push({
          planetId: indig.homePlanetId,
          emoji: indig.emoji,
          label: indig.displayName,
        })
      }
      return out
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim.state, sim.state.currentTick],
  )

  // PHASE 16.17: LAST_HOPE_EVAC triggered → pulsing orange alarm halo around the civ's home
  // planet so the player sees civ-near-collapse at galactic scale.
  const lastHopeTriggeredPlanetIds = useMemo(
    () => {
      const out = new Set<PlanetId>()
      for (const civState of sim.state.civs.values()) {
        if (!civState.alive) continue
        if (!civState.lastHopeTriggered) continue
        out.add(civState.homePlanetId)
      }
      return out
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim.state, sim.state.currentTick],
  )

  // PHASE 16.19: per-launch-pad state glow inputs. For each pad on each planet we own,
  // resolve the surface-tile centroid + normal so the 3D layer can position + orient a
  // state-colored ring on that tile.
  const padStateGlows = useMemo(
    () => {
      const out: Array<{
        planetId: PlanetId
        padId: import('@smol/shared').TileId
        state: import('@smol/shared').PadState
        tileCentroid: import('@smol/shared').Vec3
        tileNormal: import('@smol/shared').Vec3
      }> = []
      for (const planetState of sim.state.planets.values()) {
        if (planetState.launchPads.size === 0) continue
        for (const pad of planetState.launchPads.values()) {
          const tile = planetState.planet.tiles.find((t) => t.id === pad.id)
          if (!tile) continue
          out.push({
            planetId: planetState.planet.id,
            padId: pad.id,
            state: pad.state,
            tileCentroid: tile.centroid,
            tileNormal: tile.normal,
          })
        }
      }
      return out
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim.state, sim.state.currentTick],
  )

  // PHASE 16.22: aggregate all server-authoritative mine-fields across every planet into the
  // 3D-layer input shape. Per UMS spec + SMOL_REFERENCE_TRAJECTORY §17 — mines render as 💣
  // billboards on the planet surface; size keys off detonationRadius so the player sees the
  // trigger envelope. Id is `${planetId}:${index}` for stable per-frame entry reuse.
  const allMineFields = useMemo(
    () => {
      const out: Array<{
        id: string
        worldPosition: import('@smol/shared').Vec3
        remainingDetonations: number
        detonationRadius: number
      }> = []
      for (const planetState of sim.state.planets.values()) {
        for (let i = 0; i < planetState.mineFields.length; i++) {
          const m = planetState.mineFields[i]!
          if (m.remainingDetonations <= 0) continue
          out.push({
            id: `${String(planetState.planet.id)}:${i}`,
            worldPosition: m.position,
            remainingDetonations: m.remainingDetonations,
            detonationRadius: m.detonationRadius,
          })
        }
      }
      return out
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim.state, sim.state.currentTick],
  )

  // PHASE 16.14: aggregate ship beacons from all player planets for MiningFleetPanel +
  // TelemetryRack. Per-planet map for MiningFleetPanel's per-planet dropdown grouping.
  // Recompute on every tick (sim.state is a stable ref via useRef; currentTick mutates).
  const beaconsByPlanet = useMemo(
    () => {
      const tick = sim.state.currentTick
      const out = new Map<PlanetId, ReadonlyArray<ShipBeaconBroadcast>>()
      for (const planetState of sim.state.planets.values()) {
        if (planetState.civId !== sim.state.humanCivId) continue
        const active = getActiveShipBeacons(planetState.shipBeacons, tick, 30)
        if (active.length > 0) out.set(planetState.planet.id, active)
      }
      return out
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim.state, sim.state.currentTick],
  )

  const allHumanBeacons = useMemo<ReadonlyArray<ShipBeaconBroadcast>>(() => {
    const out: ShipBeaconBroadcast[] = []
    for (const arr of beaconsByPlanet.values()) out.push(...arr)
    return out
  }, [beaconsByPlanet])

  // PHASE 17.L.C.8 — single source of truth for every empire-wide aggregate. TopToolbar +
  // TelemetryRack + PlanetSummary all consume this so the numbers never disagree. Was two
  // separate inline aggregator loops + a duplicate aggregator inside TopToolbar — refactored
  // into the shared selectEmpireAggregate helper in client/src/match/empireSelectors.ts.
  // sim.state is a stable ref via useRef; currentTick is the primitive re-memo trigger.
  const empireAggregate = useMemo(
    () => selectEmpireAggregate(sim.state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim.state, sim.state.currentTick],
  )

  const activePads = useMemo(
    () => [...activePlanet.launchPads.values()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePlanet, sim.state.currentTick],
  )

  // Unlocked colony-ship variants — for the Command Pad BUILDALL dropdown. Filtered by
  // the tech-effects-driven maxPayloadTier (same gate ShipBuildPanel uses).
  const availableShipVariants = useMemo<ReadonlyArray<ColonyShipVariantId>>(() => {
    const out: ColonyShipVariantId[] = []
    for (const def of COLONY_SHIPS) {
      if (def.payloadTierRequired <= techEffects.maxPayloadTier) out.push(def.id)
    }
    return out
  }, [techEffects.maxPayloadTier])

  // PHASE 17.12.8 — bind the AudioSystem to the human civ's theme so per-theme synth
  // accent (build / launch / propaganda jingle) sounds theme-flavored. Runs once on mount +
  // any time the human civ changes themes (rare — only after resetMatch with a new theme).
  useEffect(() => {
    try {
      getAudioSystem().setTheme(humanTheme.id)
    } catch {
      // Audio singleton creation can fail in SSR / Vitest contexts; swallow.
    }
  }, [humanTheme.id])

  // === Toast lifecycle: auto-purge expired ===
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setToasts((current) => current.filter((t) => t.expiresAtMs > now))
    }, TOAST_PURGE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // === Surface ❌ build-fail events as toasts + fire audio cues per event kind ===
  useEffect(() => {
    const events = sim.state.events
    if (events.length === lastSeenEventIdxRef.current) return
    const newEvents = events.slice(lastSeenEventIdxRef.current)
    lastSeenEventIdxRef.current = events.length
    const newToasts: ToastNotification[] = []
    // PHASE 17.12.8 — audio cues for new events. Single AudioSystem singleton so SFX bus
    // volume + mute respects existing AudioSettingsPanel.
    const audio = getAudioSystem()
    for (const ev of newEvents) {
      const sfxId = eventKindToSfx(ev.kind, ev.message)
      if (sfxId) {
        try {
          audio.playSfx(sfxId)
        } catch {
          // Audio system may not be initialized yet (autoplay-policy blocks contexts until
          // first user gesture); swallow + continue. The event still surfaces visually.
        }
      }
    }
    for (const ev of newEvents) {
      if (ev.message.startsWith('❌')) {
        newToasts.push({
          id: `toast-${ev.atTick}-${Math.random().toString(36).slice(2, 8)}`,
          message: ev.message,
          kind: 'error',
          expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
        })
      } else if (ev.kind === 'crash' || ev.kind === 'civ_defeated') {
        newToasts.push({
          id: `toast-${ev.atTick}-${Math.random().toString(36).slice(2, 8)}`,
          message: ev.message,
          kind: 'warning',
          expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
        })
      } else if (ev.kind === 'planet_claimed' || ev.kind === 'loot') {
        newToasts.push({
          id: `toast-${ev.atTick}-${Math.random().toString(36).slice(2, 8)}`,
          message: ev.message,
          kind: 'success',
          expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
        })
      } else if (ev.kind === 'achievement_unlock') {
        // PHASE 17.12.6 / 17.12.10 — gold-tinted achievement toast distinct from regular
        // success. Persistent 8s window so the player has time to read the achievement name +
        // description before it auto-dismisses.
        newToasts.push({
          id: `toast-ach-${ev.atTick}-${Math.random().toString(36).slice(2, 8)}`,
          message: ev.message,
          kind: 'success',
          expiresAtMs: Date.now() + TOAST_LIFETIME_MS * 2.3,
        })
      }
    }
    if (newToasts.length > 0) {
      setToasts((current) => [...current, ...newToasts].slice(-5))
    }
  }, [sim.state.events, sim.tickCount])

  // === Panel toggle ===
  const togglePanel = useCallback((id: PanelId) => {
    setOpenPanels((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const closePanel = useCallback((id: PanelId) => {
    setOpenPanels((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }, [])

  // === Action handlers ===
  const handleSelectBuilding = (defId: BuildingDefId): void => {
    setBuildMode(defId)
    closePanel('build')
  }

  const handleCancelBuildMode = useCallback((): void => {
    setBuildMode(null)
  }, [])

  const handleTileClick = (tile: Tile): void => {
    if (!buildMode) return
    if (tile.occupancy !== 'empty') return
    sim.placeBuilding({
      planetId: activePlanet.planet.id,
      tileId: tile.id,
      defId: buildMode,
    })
  }

  // PHASE 16.13.10: surface tile click in 3D GalaxyView. The clicked planet drives the target;
  // we DO NOT force activePlanetId switch here — user is looking at planetId, place on planetId.
  // If they wanted a different planet, they'd zoom there. Build-mode + empty-tile gate identical
  // to the 2D path so behavior is unified.
  //
  // PHASE 17.L.D.8 (HOTFIX 2026-05-11) — shift-click chain semantics. Default click places
  // one building and EXITS build mode (one-shot, RTS convention). Shift-click places and
  // KEEPS build mode set for chain placement of the same building. Per user verbatim *"IT
  // WHOULD ALOW SHIFT CLICK TO BUILD MULTIPLE WITHOUT HAVING TO RECLICK BUILD THENM THE
  // BUILDING WISHED TO BE PLACED"*.
  const handleSurfaceTileClick = useCallback(
    (planetId: PlanetId, tile: Tile, shiftHeld: boolean): void => {
      if (!buildMode) return
      if (tile.occupancy !== 'empty') return
      const ok = sim.placeBuilding({
        planetId,
        tileId: tile.id,
        defId: buildMode,
      })
      if (ok && !shiftHeld) {
        setBuildMode(null)
      }
    },
    [buildMode, sim],
  )

  const handleSelectCampaign = (archetype: CampaignArchetype): void => {
    sim.launchCampaign({
      planetId: activePlanet.planet.id,
      archetype,
    })
    closePanel('campaigns')
  }

  const handleSelectPlanet = useCallback((id: PlanetId): void => {
    setSelectedPlanetId(id)
    // PHASE 17.L.D.13 (HOTFIX 2026-05-11) — also fire a focus-and-zoom request to GalaxyView.
    // Per user verbatim *"THE PLANET LIST NEEDS A VIEW SELECTION PER PLANET IE VIEW YOUr
    // STARTING PLANET FOCUSES IT AND ZOOMS TO IT"*. The nonce changes on every selection so
    // re-clicking the same planet always re-fires the tween.
    setFocusPlanetTrigger({ planetId: id, nonce: Date.now() })
    // PHASE 17.L.C.4 — also open the Planet Summary popup so the player sees per-tier pop +
    // main resources at top + the 🗄 Open Inventory button. Inventory feedback is cleared so
    // a stale "insufficient resources" warning from another planet doesn't carry across.
    setSummaryPlanetId(id)
    setInventoryFeedback(null)
    setOpenPanels((prev) => {
      const next = new Set(prev)
      next.add('planetSummary')
      return next
    })
  }, [])

  const handleUpgradePlanetCapacity = useCallback((): void => {
    if (!summaryPlanetId) return
    const result = sim.upgradePlanetCapacity({ planetId: summaryPlanetId })
    if (result.ok) {
      setInventoryFeedback(
        `🔧 Storage upgraded to Tier T${result.newTier}. Every per-resource cap multiplied by 1.6×.`,
      )
    } else {
      setInventoryFeedback(
        `⛔ Upgrade refused — ${result.reason ?? 'unknown'}. Stockpile more resources or you're already at max tier.`,
      )
    }
  }, [sim, summaryPlanetId])

  const handleOpenPlanetInventory = useCallback((): void => {
    setOpenPanels((prev) => {
      const next = new Set(prev)
      next.add('planetInventory')
      return next
    })
  }, [])

  const handleResetTo = (themeId: ThemeId): void => {
    sim.resetMatch({
      ...initialConfig,
      seed: Math.floor(Math.random() * 0xffffff),
      humanThemeId: themeId,
    })
  }

  const handleClaimLoot = (id: LootDropId): void => {
    sim.claimLoot(id)
  }

  const handleTriggerLastHope = (): void => {
    sim.triggerLastHope(sim.state.humanCivId)
  }

  const handleBuildShip = (variantId: ColonyShipVariantId): void => {
    if (!firstPad) return
    sim.buildShip({ padId: firstPad.id, variantId })
  }

  // PHASE 17.L.A.7+A.8 — Q3 LOCKED closure. Launch flow opens the LaunchManifestModal instead
  // of firing the launch action directly. The player drag-allocates crew (per tier) + cargo
  // (per resource), optionally saves the preset to a blueprint, and only THEN does the
  // confirm button fire sim.loadPadManifest → sim.launchShipFromPad in sequence.
  const handleLaunchShip = (targetPlanetIdStr: string): void => {
    if (!firstPad) return
    const targetPlanetId = targetPlanetIdStr as unknown as PlanetId
    const target = sim.state.planets.get(targetPlanetId)
    const label = target
      ? `${target.planet.biome.emoji} ${String(target.planet.id)}`
      : targetPlanetIdStr
    setLaunchManifestRequest({ padId: firstPad.id, targetPlanetId, targetPlanetLabel: label })
  }

  const handleManifestCancel = useCallback((): void => {
    setLaunchManifestRequest(null)
  }, [])

  const handleManifestConfirm = useCallback(
    (submission: LaunchManifestSubmission): void => {
      const req = launchManifestRequest
      if (!req) return
      setLaunchManifestRequest(null)
      const result = sim.loadPadManifest({
        padId: req.padId,
        citizensByTier: submission.citizensByTier,
        cargoByResource: submission.cargoByResource,
      })
      if (!result.ok) {
        setToasts((current) => [
          ...current,
          {
            id: `manifest-fail-${Date.now()}`,
            kind: 'warning',
            message: `Manifest refused (${result.reason ?? 'unknown'}). Wait for the pad to reach DOCK / FUEL / AMMO / READY / ARM before launching.`,
            expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
          },
        ])
        return
      }
      // PHASE 17.L.A.11 — Q5 LOCKED. Mining mode + assignedTargets thread through from the
      // LaunchManifestModal's Mining Mode picker. For non-mining variants submission.flightKind
      // stays 'oneway' so legacy behavior is unchanged.
      const ok = sim.launchShipFromPad({
        padId: req.padId,
        targetPlanetId: req.targetPlanetId,
        targetingMode: currentTargetingMode,
        flightKind: submission.flightKind,
        assignedTargets: submission.assignedTargets,
      })
      if (!ok) {
        setToasts((current) => [
          ...current,
          {
            id: `launch-fail-${Date.now()}`,
            kind: 'warning',
            message: 'Launch refused — check pad state and citizen-tier requirements.',
            expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
          },
        ])
      }
    },
    [launchManifestRequest, sim, currentTargetingMode],
  )

  const dismissToast = (id: string): void => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }

  // PHASE 16.37 — salvo round runner extracted from inline onFireSalvoRound. Stable callback
  // so the auto-fire-loop useEffect can re-trigger it without dependency-array churn.
  const runSalvoRound = useCallback(() => {
    if (salvoRoundPhase !== null) return
    const planetId = activePlanet.planet.id
    const variant = availableShipVariants[0]
    if (!variant) return
    setSalvoRoundPhase('BUILDING')
    sim.controllerBuildAll(planetId, variant)
    window.setTimeout(() => {
      setSalvoRoundPhase('ARMING')
      sim.controllerArmAll(planetId)
    }, 8000)
    window.setTimeout(() => {
      setSalvoRoundPhase('LAUNCHING')
      sim.controllerLaunchAll(planetId)
    }, 11000)
    window.setTimeout(() => setSalvoRoundPhase(null), 13000)
  }, [activePlanet.planet.id, availableShipVariants, salvoRoundPhase, sim])

  // PHASE 16.37 — auto-fire indefinite loop. When the toggle is ON and a round just finished
  // (salvoRoundPhase transitioned to null), kick off the next round after a short cooldown so
  // the cycle visibly resets between rounds. Toggle OFF mid-cycle and the next round simply
  // doesn't queue.
  useEffect(() => {
    if (!autoFireLoopActive) return
    if (salvoRoundPhase !== null) return
    const handle = window.setTimeout(() => {
      runSalvoRound()
    }, 1500)
    return () => window.clearTimeout(handle)
  }, [autoFireLoopActive, salvoRoundPhase, runSalvoRound])

  // === Keyboard shortcuts ===
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.target instanceof HTMLSelectElement) return
      const k = e.key.toLowerCase()
      if (e.key === 'Escape') {
        // PHASE 16.33: targeting panel takes Escape priority before regular panels so the
        // player can dismiss the picker without affecting any open primary panel.
        if (showTargetingPanel) {
          setShowTargetingPanel(false)
          return
        }
        if (openPanels.size > 0) {
          const last = [...openPanels].at(-1)!
          closePanel(last)
        } else if (buildMode) {
          handleCancelBuildMode()
        }
        return
      }
      // NOTE: WASD + QE are RESERVED for 3D-universe nav (PHASE 16.2 — pan + rotate).
      // Panel hotkeys avoid those letters.
      if (k === 'b') togglePanel('build')
      else if (k === 'p') togglePanel('campaigns')
      else if (k === 't') togglePanel('tech')
      else if (k === 'r') togglePanel('resources')
      else if (k === 'l') togglePanel('deception')
      else if (k === 'k') togglePanel('ships')
      else if (k === 'f') togglePanel('flights')
      else if (k === 'i') togglePanel('indigenous')
      else if (k === 'x') togglePanel('events')
      else if (k === 'g') togglePanel('planets')
      else if (k === 'y') togglePanel('energy')
      else if (k === 'n') togglePanel('citizens')
      else if (k === 'u') togglePanel('shipBuilder')
      // PHASE 16.33: 'm' toggles the UMS 6-mode targeting picker. Chosen 'm' (mode) since
      // 't' is tech, 'p' is propaganda/campaigns, 'b' is build — all the obvious candidates
      // are taken. Per-keyboard-shortcut hotkey map in `feedback_mode_switching.md` is for
      // /unity persona modes only, NOT in-game UI.
      else if (k === 'm') setShowTargetingPanel((v) => !v)
      else if (k === ' ') {
        e.preventDefault()
        sim.togglePause()
      }
      // PHASE 17.12.9 — camera position presets. Ctrl+1..9 save current planet view as a
      // preset slot; Shift+1..9 recall the stored slot via focus-and-zoom. Plain 1-4 retain
      // their speed-control role from earlier phases — modifier required for preset ops to
      // avoid clashing with that muscle memory. Slot 0 (Shift+0) always jumps to the human
      // civ's home planet.
      else if (e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const slot = parseInt(e.key, 10)
        const planetToSave = selectedPlanetId ?? humanCivState.homePlanetId
        setCameraPresets((prev) => {
          const next = new Map(prev)
          next.set(slot, planetToSave)
          return next
        })
        setToasts((current) => [
          ...current,
          {
            id: `cam-save-${slot}-${Date.now()}`,
            kind: 'success',
            message: `📷 Camera preset ${slot} saved → ${String(planetToSave)}`,
            expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
          },
        ])
      } else if (e.shiftKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault()
        const slot = parseInt(e.key, 10)
        const targetPlanetId =
          slot === 0 ? humanCivState.homePlanetId : (cameraPresets.get(slot) ?? null)
        if (targetPlanetId) {
          handleSelectPlanet(targetPlanetId)
        } else {
          setToasts((current) => [
            ...current,
            {
              id: `cam-recall-empty-${slot}-${Date.now()}`,
              kind: 'warning',
              message: `📷 Camera preset ${slot} is empty — Ctrl+${slot} to save the current view.`,
              expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
            },
          ])
        }
      } else if (k === '1') sim.setSpeed(1)
      else if (k === '2') sim.setSpeed(2)
      else if (k === '3') sim.setSpeed(4)
      else if (k === '4') sim.setSpeed(8)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    openPanels,
    buildMode,
    sim,
    togglePanel,
    closePanel,
    handleCancelBuildMode,
    showTargetingPanel,
    selectedPlanetId,
    humanCivState.homePlanetId,
    cameraPresets,
    handleSelectPlanet,
  ])

  // PHASE 17.L.C.8 — tooltip-only per-planet rows (no population needed anymore — the toolbar
  // gets every aggregate from `empireAggregate`). Just enough data so each resource chip can
  // surface a "where is this resource?" tooltip on hover.
  const topToolbarTooltips = useMemo(
    () =>
      ownedPlanets.map((p) => ({
        planetId: p.planet.id,
        planetLabel: `${p.planet.biome.emoji} ${String(p.planet.id)}`,
        inventory: p.inventory,
      })),
    [ownedPlanets],
  )

  const energyPanelPlanets = useMemo(
    () =>
      ownedPlanets.map((p) => ({
        planetId: p.planet.id,
        planetLabel: `${p.planet.biome.emoji} ${String(p.planet.id)}`,
        buildingsByDef: p.buildingsByDef as ReadonlyMap<BuildingDefId, number>,
        fuelStock: p.inventory.stocks.get(RESOURCE_FUEL) ?? 0,
      })),
    [ownedPlanets],
  )

  // PHASE 17.13.5 — settlement groups for the SettlementsPanel. One group per owned planet
  // with the planet's full settlement list. Memoized on currentTick so the panel reflects
  // freshly-founded settlements after a Civic Center lands.
  const settlementGroups = useMemo<ReadonlyArray<SettlementGroupSnapshot>>(
    () =>
      ownedPlanets.map((p) => ({
        planetId: p.planet.id,
        planetLabel: `${p.planet.biome.emoji} ${String(p.planet.id)}`,
        settlements: [...p.settlements.values()],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ownedPlanets, sim.state.currentTick],
  )

  const citizensPanelPlanets = useMemo(
    () =>
      ownedPlanets.map((p) => ({
        planetLabel: `${p.planet.biome.emoji} ${String(p.planet.id)}`,
        population: p.population,
      })),
    [ownedPlanets],
  )

  if (sim.state.phase === 'ENDED') {
    return (
      <MatchEndScreen
        match={sim.state}
        onPlayAgain={(themeId) => handleResetTo(themeId)}
        onGoHome={() => navigate('/')}
      />
    )
  }

  // PHASE 17.L.A.14 — fullscreen boot ceremony gates the /play canvas. Skippable with Space.
  // Theme passed in so the boot reveal line is government-flavored. The world view renders
  // only after onFinished fires.
  if (!bootReady) {
    return (
      <div
        className="play-boot-gate"
        style={
          {
            ...styleVars,
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-deep, #050912)',
            zIndex: 9999,
            padding: '2rem',
          } as React.CSSProperties
        }
      >
        <div style={{ maxWidth: '720px', width: '100%' }}>
          <BootSequencePanel
            theme={humanCivState.theme}
            onFinished={() => setBootReady(true)}
            skippable
          />
          <p
            style={{
              marginTop: '1rem',
              textAlign: 'center',
              opacity: 0.6,
              fontSize: '0.85rem',
              fontStyle: 'italic',
            }}
          >
            Press Space to skip the boot ceremony.
          </p>
        </div>
      </div>
    )
  }

  return (
    <PanelLayoutProvider>
      <div
        className={`play-shell ${buildMode ? 'play-shell--build-mode' : ''}`}
        style={styleVars as React.CSSProperties}
      >
        <TopToolbar
          humanCivId={sim.state.humanCivId}
          humanCivLabel={humanCivState.displayName}
          empire={empireAggregate}
          ownedPlanetTooltips={topToolbarTooltips}
          currentTick={sim.state.currentTick}
        />
        {/* PHASE 16.13.9: 3D GalaxyView is the always-on /play canvas. Legacy 2D TilePlacementGrid
          remains only as a `?dev=hexgrid` URL-flag fallback for dev debugging. */}
        <div className="play-shell__world">
          {isDevHexGridFallback ? (
            <TilePlacementGrid
              tiles={activePlanet.planet.tiles.slice(0, 37)}
              biome={activePlanet.planet.biome}
              civResearchedTechs={humanCivState.empire.researchedTechs}
              selectedBuildingDefId={buildMode}
              onTileClick={handleTileClick}
            />
          ) : (
            <GalaxyView
              galaxy={sim.state.galaxy}
              humanCivId={String(sim.state.humanCivId)}
              ownedPlanetIds={ownedPlanetIds}
              homePlanetId={humanCivState.homePlanetId}
              mineFields={allMineFields}
              activeFlights={[...sim.state.flights.values()]}
              alertedPlanetIds={
                new Set(
                  [...sim.state.planets.values()]
                    .filter(
                      (p) =>
                        p.civId === sim.state.humanCivId &&
                        p.beacon.alerts.some(
                          (a) =>
                            a.kind === 'INCOMING_HOSTILE' && sim.state.currentTick - a.atTick < 200,
                        ),
                    )
                    .map((p) => p.planet.id),
                )
              }
              ownerByPlanet={
                new Map(
                  [...sim.state.planets.values()]
                    // PHASE 16.38 — fog of war: only expose ownership for planets the human civ
                    // has discovered. Undiscovered enemy planets show up as raw sprites with no
                    // civ flag — the player must scout (launch a flight there) to learn who's home.
                    .filter((p) => humanCivState.empire.discoveredPlanetIds.has(p.planet.id))
                    .map((p) => [p.planet.id, p.civId] as const),
                )
              }
              themeByCiv={
                new Map([...sim.state.civs.values()].map((c) => [c.civId, c.theme] as const))
              }
              onSelectPlanet={handleSelectPlanet}
              onSurfaceTileClick={handleSurfaceTileClick}
              onSelectFlight={setSelectedFlightId}
              miningBeacons={allHumanBeacons}
              civsByPlanet={civsByPlanet}
              indigenousByPlanet={indigenousByPlanet}
              lastHopeTriggeredPlanetIds={lastHopeTriggeredPlanetIds}
              padStateGlows={padStateGlows}
              detonations={sim.state.detonations}
              humanDiscoveredPlanetIds={humanCivState.empire.discoveredPlanetIds}
              buildingsByPlanet={
                new Map(
                  [...sim.state.planets.values()].map((p) => [p.planet.id, p.buildingsByTile]),
                )
              }
              focusPlanetTrigger={focusPlanetTrigger}
              {...(redirectModeFlightId
                ? {
                    onContextMenuPlanet: (planetId: PlanetId) => {
                      sim.redirectFlight(redirectModeFlightId, planetId)
                      setRedirectModeFlightId(null)
                    },
                  }
                : {})}
            />
          )}
        </div>

        <HUDOverlay
          theme={humanTheme}
          currentTick={sim.state.currentTick}
          running={sim.running}
          speed={sim.speed}
          togglePause={sim.togglePause}
          setSpeed={sim.setSpeed}
          openPanels={openPanels}
          togglePanel={togglePanel}
          buildModeBuildingDefId={buildMode}
          onCancelBuildMode={handleCancelBuildMode}
          onResetLayout={() => setOpenPanels(new Set())}
          onSaveMatch={() => {
            const ok = sim.saveMatchNow()
            setToasts((current) => [
              ...current,
              {
                id: `save-${Date.now()}`,
                kind: ok ? 'success' : 'warning',
                message: ok
                  ? `💾 Match saved to local storage at tick ${sim.state.currentTick}`
                  : '💾 Save failed — localStorage may be full or sandboxed',
                expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
              },
            ])
          }}
          onLoadSavedMatch={() => {
            const ok = sim.loadSavedMatch()
            setToasts((current) => [
              ...current,
              {
                id: `load-${Date.now()}`,
                kind: ok ? 'success' : 'warning',
                message: ok
                  ? `📂 Match restored from saved state at tick ${sim.state.currentTick}`
                  : '📂 No saved match found',
                expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
              },
            ])
          }}
          hasSavedMatch={sim.hasSavedMatch}
        />

        <Toasts toasts={toasts} onDismiss={dismissToast} />

        {/* PHASE 17.L.C.6 — dock zone overlay. Renders left / right / bottom dock ghost
            rectangles whenever any panel is being dragged. Drop near a zone → snap. */}
        <DockZoneOverlay />

        <TelemetryRack
          activePads={activePads}
          miningBeacons={allHumanBeacons}
          activeFlights={[...sim.state.flights.values()]}
          resourceTotals={empireAggregate.resourcesTotal}
          populationTotal={empireAggregate.populationTotal}
          empireTechs={humanCivState.empire.researchedTechs.size}
          currentTick={sim.state.currentTick}
          activePlanetInventory={activePlanet.inventory}
          sparklines={sim.state.sparklines}
          empirePersonalEquip={empireAggregate.personalEquip}
          activePlanetBuildings={activePlanet.buildingsByDef}
          techProductionMultiplier={techEffects.buildingProductionMultiplier}
        />

        {/* === Picker popups (centered) === */}
        {openPanels.has('build') && (
          <BuildPicker
            empire={humanCivState.empire}
            inventory={activePlanet.inventory}
            onSelect={handleSelectBuilding}
            onClose={() => closePanel('build')}
            currentBuildMode={buildMode}
            theme={humanTheme}
          />
        )}
        {openPanels.has('campaigns') && (
          <CampaignPicker
            inventory={activePlanet.inventory}
            onSelect={handleSelectCampaign}
            onClose={() => closePanel('campaigns')}
          />
        )}
        {openPanels.has('planets') && (
          <PlanetPicker
            planets={ownedPlanets.map((p) => ({
              id: p.planet.id,
              label: String(p.planet.id),
              biomeEmoji: p.planet.biome.emoji,
              tileCount: p.planet.tiles.length,
              buildingCount: [...p.buildingsByDef.values()].reduce((s, n) => s + n, 0),
              isActive: p.planet.id === activePlanet.planet.id,
            }))}
            onSelect={handleSelectPlanet}
            onClose={() => closePanel('planets')}
          />
        )}

        {/* === Persistent panels (docked) === */}
        {openPanels.has('resources') && (
          <PanelFrame
            panelId="resources"
            title="Stockpile"
            emoji="📊"
            onClose={() => closePanel('resources')}
            variant="docked-top-left"
          >
            <ResourcesPanel
              inventory={activePlanet.inventory}
              title={`${activePlanet.planet.biome.emoji} ${String(activePlanet.planet.id)}`}
            />
          </PanelFrame>
        )}

        {openPanels.has('tech') && (
          <PanelFrame
            panelId="tech"
            title="Tech Tree"
            emoji="🧬"
            onClose={() => closePanel('tech')}
            variant="centered"
            width={920}
          >
            <TechTreePanel
              empire={humanCivState.empire}
              selectedTechId={selectedTechId}
              onSelectTech={(techId) => {
                setSelectedTechId(techId)
                // HOTFIX 17.L.D.14 — auto-open the detail panel on first tech click so the
                // player doesn't have to dig through the toolbar for the 🔍 button.
                setOpenPanels((prev) => {
                  if (prev.has('techDetail')) return prev
                  const next = new Set(prev)
                  next.add('techDetail')
                  return next
                })
              }}
            />
          </PanelFrame>
        )}

        {/* HOTFIX 17.L.D.14 — Tech Detail panel. Extracted from the embedded sidebar inside
            TechTreePanel so it's fully movable / resizable like every other panel (per user
            verbatim "needs to be its own panel along side pully movable like all panels shall
            be"). Auto-opens on first tech click from the tree panel. */}
        {openPanels.has('techDetail') && (
          <PanelFrame
            panelId="techDetail"
            title="Tech Detail"
            emoji="🔍"
            onClose={() => closePanel('techDetail')}
            variant="docked-right"
            width={360}
          >
            <TechDetailPanel
              empire={humanCivState.empire}
              selectedTechId={selectedTechId}
              onSelectTech={(techId) => setSelectedTechId(techId)}
            />
          </PanelFrame>
        )}

        {openPanels.has('deception') && (
          <PanelFrame
            panelId="deception"
            title="Loyalty"
            emoji="🧠"
            onClose={() => closePanel('deception')}
            variant="docked-left"
          >
            <DeceptionPanel
              theme={humanTheme}
              faction={activePlanet.faction}
              ledger={humanCivState.deceptionLedger}
            />
          </PanelFrame>
        )}

        {openPanels.has('ships') && (
          <PanelFrame
            panelId="ships"
            title="Ships"
            emoji="🚀"
            onClose={() => closePanel('ships')}
            variant="docked-right"
          >
            <ShipBuildPanel
              pad={firstPad}
              inventory={activePlanet.inventory}
              researchedTechs={humanCivState.empire.researchedTechs}
              maxPayloadTier={techEffects.maxPayloadTier}
              onBuild={handleBuildShip}
              onLaunch={handleLaunchShip}
              otherPlanets={otherPlanetsForLaunch}
            />
          </PanelFrame>
        )}

        {openPanels.has('flights') && (
          <PanelFrame
            panelId="flights"
            title="Flights"
            emoji="🛰️"
            onClose={() => closePanel('flights')}
            variant="docked-right"
          >
            <ColonyShipFlightPanel
              flights={[...sim.state.flights.values()]}
              onAfterAction={() => undefined}
            />
          </PanelFrame>
        )}

        {openPanels.has('indigenous') && (
          <PanelFrame
            panelId="indigenous"
            title="Indigenous"
            emoji="🪶"
            onClose={() => closePanel('indigenous')}
            variant="docked-left"
          >
            <IndigenousPanel
              indig={indigenousOnActivePlanet}
              hostPlanetInventory={activePlanet.inventory}
              onManualParley={() => {
                const result = sim.manualIndigenousParley({ planetId: activePlanet.planet.id })
                setToasts((current) => [
                  ...current,
                  {
                    id: `parley-${Date.now()}`,
                    kind: result.ok && result.accepted ? 'success' : 'warning',
                    message: !result.ok
                      ? `🤝 Parley refused: ${result.reason ?? 'unknown'}.`
                      : result.accepted
                        ? `🤝 Parley accepted — ${result.defectingTileCount} tile(s) ceded.`
                        : '🤝 Indigenous refused the offer. 50 propaganda materials spent.',
                    expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
                  },
                ])
              }}
            />
          </PanelFrame>
        )}

        {openPanels.has('loot') && (
          <PanelFrame
            panelId="loot"
            title="Salvage"
            emoji="🎁"
            onClose={() => closePanel('loot')}
            variant="docked-bottom-right"
          >
            <LootDropPanel
              drops={lootDropsOnOurPlanets}
              currentTick={sim.state.currentTick}
              onClaim={handleClaimLoot}
            />
          </PanelFrame>
        )}

        {openPanels.has('lastHope') && (
          <PanelFrame
            panelId="lastHope"
            title="Last Hope"
            emoji="🚨"
            onClose={() => closePanel('lastHope')}
            variant="docked-bottom-right"
          >
            <LastHopePanel
              state={humanCivState.lastHopeEvac}
              triggered={humanCivState.lastHopeTriggered}
              canTrigger={!humanCivState.lastHopeTriggered}
              onTrigger={handleTriggerLastHope}
            />
          </PanelFrame>
        )}

        {openPanels.has('beacon') && (
          <PanelFrame
            panelId="beacon"
            title="Beacon"
            emoji="🛰"
            onClose={() => closePanel('beacon')}
            variant="docked-bottom-right"
          >
            <BeaconPanel beacon={activePlanet.beacon} currentTick={sim.state.currentTick} />
          </PanelFrame>
        )}

        {openPanels.has('mining') && (
          <PanelFrame
            panelId="mining"
            title="Mining Fleet"
            emoji="⛏️"
            onClose={() => closePanel('mining')}
            variant="docked-right"
          >
            <MiningFleetPanel
              planets={[...sim.state.planets.values()].map((mp) => mp.planet)}
              themeByCiv={
                new Map([...sim.state.civs.values()].map((c) => [c.civId, c.theme] as const))
              }
              beaconsByPlanet={beaconsByPlanet}
              humanCivId={sim.state.humanCivId}
            />
          </PanelFrame>
        )}

        {openPanels.has('command') && (
          <PanelFrame
            panelId="command"
            title="Command Pad"
            emoji="🎛"
            onClose={() => closePanel('command')}
            variant="docked-right"
          >
            <CommandPadPanel
              planetId={activePlanet.planet.id}
              theme={humanTheme}
              pads={activePads}
              availableVariants={availableShipVariants}
              onBuildAll={(variantId) => sim.controllerBuildAll(activePlanet.planet.id, variantId)}
              onArmAll={() => sim.controllerArmAll(activePlanet.planet.id)}
              onLaunchAll={() => sim.controllerLaunchAll(activePlanet.planet.id)}
              onAbortAll={() => sim.controllerAbortAll(activePlanet.planet.id)}
              onCopyTargetFromController={() => sim.controllerCopyTarget(activePlanet.planet.id)}
              onFireSalvoRound={runSalvoRound}
              salvoRoundActive={salvoRoundPhase !== null}
              salvoRoundPhaseLabel={
                salvoRoundPhase === 'BUILDING'
                  ? '⚙ BUILDING — pads loading...'
                  : salvoRoundPhase === 'ARMING'
                    ? '⚡ ARMING ready pads...'
                    : salvoRoundPhase === 'LAUNCHING'
                      ? '🚀 LAUNCHING armed pads...'
                      : undefined
              }
              autoFireLoopActive={autoFireLoopActive}
              onToggleAutoFireLoop={() => setAutoFireLoopActive((v) => !v)}
              targetablePlanets={targetablePlanetsForCommandPad}
              onSetWaypoints={(waypoints) =>
                sim.setControllerWaypoints(activePlanet.planet.id, waypoints)
              }
            />
          </PanelFrame>
        )}

        {openPanels.has('ai') && (
          <PanelFrame
            panelId="ai"
            title="AI Players"
            emoji="🤖"
            onClose={() => closePanel('ai')}
            variant="docked-right"
          >
            <AIPlayerPanel snapshots={aiSnapshots} />
          </PanelFrame>
        )}

        {openPanels.has('energy') && (
          <PanelFrame
            panelId="energy"
            title="Planet Energy"
            emoji="⚡"
            onClose={() => closePanel('energy')}
            variant="docked-left"
          >
            <PlanetEnergyPanel
              planets={energyPanelPlanets}
              techProductionMultiplier={techEffects.buildingProductionMultiplier}
            />
          </PanelFrame>
        )}

        {openPanels.has('citizens') && (
          <PanelFrame
            panelId="citizens"
            title="Citizens"
            emoji="👥"
            onClose={() => closePanel('citizens')}
            variant="docked-left"
          >
            <CitizensPanel
              planets={citizensPanelPlanets}
              onSetShipDuty={(planetIdString, tier, percent) =>
                sim.setShipDutyPercent(planetIdString as unknown as PlanetId, tier, percent)
              }
            />
          </PanelFrame>
        )}

        {openPanels.has('shipBuilder') && (
          <PanelFrame
            panelId="shipBuilder"
            title="Ship Builder"
            emoji="🛠"
            onClose={() => closePanel('shipBuilder')}
            variant="centered"
            width={760}
          >
            <ShipBuilderPanel
              inventory={activePlanet.inventory}
              researchedTechs={humanCivState.empire.researchedTechs}
              activePlanetLabel={`${activePlanet.planet.biome.emoji} ${String(activePlanet.planet.id)}`}
              idlePads={[...activePlanet.launchPads.values()].filter(
                (p) => p.state === 'IDLE' || p.state === 'GONE',
              )}
              onPrintBlueprint={(
                padId,
                baseVariantId,
                displayName,
                pieces,
                stats,
                totalCost,
                sourceBlueprintId,
              ) =>
                sim.buildShipFromBlueprint({
                  padId,
                  baseVariantId,
                  displayName,
                  pieces,
                  stats,
                  totalCost,
                  sourceBlueprintId,
                })
              }
            />
          </PanelFrame>
        )}

        {/* PHASE 17.L.A.9 — Q13 PHASE 17 LOCKED. Top-down tracking camera following ONE
            in-flight rocket at a time (player picks via dropdown). SVG minimap + live
            telemetry readouts. NOT remote planet feeds; NOT nose-cam. */}
        {openPanels.has('trackingCamera') && (
          <PanelFrame
            panelId="trackingCamera"
            title="Tracking Camera"
            emoji="📹"
            onClose={() => closePanel('trackingCamera')}
            variant="docked-right"
            width={380}
          >
            <TrackingCameraPanel activeFlights={[...sim.state.flights.values()]} />
          </PanelFrame>
        )}

        {/* PHASE 17.L.A.10 — Q14 PHASE 17 LOCKED. Production-chain Sankey diagram showing
            the full raw → refined → component → product → strategic flow with edge thickness
            tied to base per-tick yield. Hover to highlight chains. */}
        {openPanels.has('productionChains') && (
          <PanelFrame
            panelId="productionChains"
            title="Production Chains"
            emoji="🔗"
            onClose={() => closePanel('productionChains')}
            variant="centered"
            width={1180}
          >
            <ProductionChainsPanel />
          </PanelFrame>
        )}

        {/* PHASE 17.L.A.12 — Q11 PHASE 17 LOCKED. Per-planet quotas + building production
            mode picker. Reads/writes via sim.setPlanetQuota + sim.setBuildingMode actions. */}
        {openPanels.has('quotas') && (
          <PanelFrame
            panelId="quotas"
            title="Quotas + Recycling"
            emoji="📋"
            onClose={() => closePanel('quotas')}
            variant="docked-right"
          >
            <QuotasPanel
              planetId={activePlanet.planet.id}
              planetLabel={`${activePlanet.planet.biome.emoji} ${String(activePlanet.planet.id)}`}
              inventory={activePlanet.inventory}
              quotas={activePlanet.quotas}
              buildingsByDef={activePlanet.buildingsByDef}
              buildingModes={activePlanet.buildingModes}
              onSetQuota={(resource, target) =>
                sim.setPlanetQuota({ planetId: activePlanet.planet.id, resource, target })
              }
              onSetBuildingMode={(defId, mode) =>
                sim.setBuildingMode({
                  planetId: activePlanet.planet.id,
                  buildingDefId: defId,
                  mode,
                })
              }
            />
          </PanelFrame>
        )}

        {openPanels.has('events') && (
          <PanelFrame
            panelId="events"
            title={`Events (${sim.state.events.length})`}
            emoji="📜"
            onClose={() => closePanel('events')}
            variant="docked-bottom-right"
          >
            <ul className="event-log">
              {[...sim.state.events]
                .reverse()
                .slice(0, 50)
                .map((ev, i) => (
                  <li key={i} className={`event-log__row event-log__row--${ev.kind}`}>
                    <span className="event-log__tick">[t{ev.atTick}]</span>{' '}
                    <span>{ev.message}</span>
                  </li>
                ))}
            </ul>
          </PanelFrame>
        )}
        {/* PHASE 16.23: clicked-flight detail popup. Renders when a flight cone in 3D is clicked
          via GalaxyView's raycaster. Shows full make-up (crew/citizens/cargo/fuel/payload) +
          UMS UNITY_MSL live telemetry (alt/dist/closingSpeed/phase/ETA) + 💀 ABORT button
          that calls sim.abortFlightById for self-destruct. */}
        {selectedFlightId
          ? (() => {
              const flight = sim.state.flights.get(selectedFlightId)
              if (!flight) {
                setSelectedFlightId(null)
                return null
              }
              return (
                <FlightDetailPanel
                  flight={flight}
                  currentTick={sim.state.currentTick}
                  fromPlanetLabel={String(flight.fromPlanetId)}
                  toPlanetLabel={String(flight.targetPlanetId)}
                  onAbort={(fid) => sim.abortFlightById(fid)}
                  onClose={() => setSelectedFlightId(null)}
                  godControlReady={sim.godControlReady}
                  onSelectForRedirect={(fid) => setRedirectModeFlightId(fid)}
                  onRefuelReactor={(fid) => sim.refuelReactor(fid)}
                />
              )
            })()
          : null}
        {/* PHASE 16.33: UMS 6-mode targeting picker. Player presses 'm' to toggle. Selected
          mode applies to the next single-pad launch via handleLaunchShip; salvo/mass-action
          paths still default GPS for v1 simplicity. Click outside the panel to dismiss. */}
        {showTargetingPanel ? (
          <div
            className="targeting-mode-panel__overlay"
            onClick={() => setShowTargetingPanel(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <TargetingModePanel
                currentMode={currentTargetingMode}
                onModeChange={setCurrentTargetingMode}
                isTechResearched={(techId) =>
                  humanCivState.empire.researchedTechs.has(techId as unknown as never)
                }
                onClose={() => setShowTargetingPanel(false)}
              />
            </div>
          </div>
        ) : null}

        {/* PHASE 17.13.7 — Inter-planet caravan trade panel. Active caravan list + new-caravan
            dispatch form. Civ's caravan list scoped via state.caravans[humanCivId]; owned-
            planet snapshots filtered for the dispatch dropdowns. */}
        {openPanels.has('caravans') && (
          <PanelFrame
            panelId="caravans"
            title="Caravans"
            emoji="🛒"
            onClose={() => closePanel('caravans')}
            variant="centered"
            width={520}
          >
            <CaravanPanel
              caravans={sim.state.caravans.get(sim.state.humanCivId) ?? []}
              ownedPlanets={ownedPlanets.map<CaravanPanelPlanetSnapshot>((p) => ({
                planetId: p.planet.id,
                planetLabel: `${p.planet.biome.emoji} ${String(p.planet.id)}`,
                inventory: p.inventory,
              }))}
              onCreateCaravan={(input) => {
                const result = sim.createCaravan(input)
                if (!result.ok) {
                  setToasts((current) => [
                    ...current,
                    {
                      id: `caravan-fail-${Date.now()}`,
                      kind: 'warning',
                      message: `🛒 Caravan refused — ${result.reason ?? 'unknown'}.`,
                      expiresAtMs: Date.now() + TOAST_LIFETIME_MS,
                    },
                  ])
                }
              }}
              onCancelCaravan={(caravanId) => {
                sim.cancelCaravan({ caravanId })
              }}
            />
          </PanelFrame>
        )}

        {/* PHASE 17.12.2 — Defense panel. Per-planet defensive stats + incoming threats +
            counter-missile-pad quick-build. Mines are LAUNCHED ships per user correction
            2026-05-12; panel surfaces the right workflow pointer instead of a tile-build
            shortcut. */}
        {openPanels.has('defense') &&
          (() => {
            const counterPadCount =
              activePlanet.buildingsByDef.get(
                // BLDG_COUNTER_MISSILE — import lives in DefensePanel via shared barrel.
                'counterMissilePad' as unknown as BuildingDefId,
              ) ?? 0
            const incomingThreats: DefensePanelIncomingThreat[] = []
            for (const flight of sim.state.flights.values()) {
              if (flight.targetPlanetId !== activePlanet.planet.id) continue
              if (flight.launchingCivId === sim.state.humanCivId) continue
              if (
                flight.phase === 'DETONATE' ||
                flight.phase === 'INTERCEPTED' ||
                flight.phase === 'ABORTED' ||
                flight.phase === 'CRASH_LANDED' ||
                flight.phase === 'EMPTY_HULK'
              ) {
                continue
              }
              const def = COLONY_SHIPS.find((d) => d.id === flight.variantId)
              const fromPlanet = sim.state.planets.get(flight.fromPlanetId)
              incomingThreats.push({
                flightId: String(flight.id),
                fromPlanetLabel: fromPlanet
                  ? `${fromPlanet.planet.biome.emoji} ${String(fromPlanet.planet.id)}`
                  : String(flight.fromPlanetId),
                variantEmoji: def?.emoji ?? '⚙️',
                variantName: def?.name ?? String(flight.variantId),
                phaseLabel: flight.phase,
                etaTicks: Math.max(0, flight.totalTicks - flight.ticksFlown),
              })
            }
            return (
              <PanelFrame
                panelId="defense"
                title="Defense"
                emoji="🛡"
                onClose={() => closePanel('defense')}
                variant="docked-right"
                width={420}
              >
                <DefensePanel
                  planetId={activePlanet.planet.id}
                  planetLabel={`${activePlanet.planet.biome.emoji} ${String(activePlanet.planet.id)}`}
                  mineFields={activePlanet.mineFields}
                  counterPadCount={counterPadCount}
                  incomingThreats={incomingThreats}
                  onQuickBuild={(defId) => {
                    setBuildMode(defId)
                    closePanel('defense')
                  }}
                />
              </PanelFrame>
            )
          })()}

        {/* PHASE 17.12.7 — Hall of Champions in-game panel. localStorage-backed leaderboards
            (NEVER mock per the no-mock-player-data LAW). Match-end scores persist + the panel
            surfaces top-10 per global category. Refresh on panel open via sim.tickCount dep so
            the player sees their latest scores reflected after match end. */}
        {openPanels.has('hallOfChampions') && (
          <PanelFrame
            panelId="hallOfChampions"
            title="Hall of Champions"
            emoji="🏛️"
            onClose={() => closePanel('hallOfChampions')}
            variant="centered"
            width={620}
          >
            <HallOfChampionsPanel
              boards={loadGlobalCategorySnapshots(10)}
              highlightCategoryId="mostPlanetsControlled"
            />
          </PanelFrame>
        )}

        {/* PHASE 17.13.5 — Settlements picker. Read-only list of every settlement on every
            owned planet, grouped by planet. Active-settlement-switch lands in 17.13.6 when
            per-settlement state lives in sim. */}
        {openPanels.has('settlements') && (
          <PanelFrame
            panelId="settlements"
            title="Settlements"
            emoji="🏘"
            onClose={() => closePanel('settlements')}
            variant="docked-left"
            width={420}
          >
            <SettlementsPanel
              groups={settlementGroups}
              activeSettlementId={activeSettlementId}
              onSelectSettlement={(planetIdValue, settlementIdValue) => {
                setActiveSettlementId(settlementIdValue)
                setSelectedPlanetId(planetIdValue)
                setFocusPlanetTrigger({ planetId: planetIdValue, nonce: Date.now() })
              }}
            />
          </PanelFrame>
        )}

        {/* PHASE 17.L.C.4 — Planet Summary popup. Opens whenever the player clicks a planet
            row in PlanetPicker (also fires focus-and-zoom). Renders if summaryPlanetId AND
            the 'planetSummary' panel is open. Closing the panel keeps summaryPlanetId so
            re-opening from another path resumes on the same planet. */}
        {openPanels.has('planetSummary') &&
          summaryPlanetId &&
          (() => {
            const summaryPlanet = sim.state.planets.get(summaryPlanetId)
            if (!summaryPlanet || summaryPlanet.civId !== sim.state.humanCivId) return null
            const buildingTotal = [...summaryPlanet.buildingsByDef.values()].reduce(
              (s, n) => s + n,
              0,
            )
            const tilesUsed = summaryPlanet.buildingsByTile.size + summaryPlanet.launchPads.size
            return (
              <PanelFrame
                panelId="planetSummary"
                title="Planet Summary"
                emoji="🪐"
                onClose={() => closePanel('planetSummary')}
                variant="centered"
                width={440}
              >
                <PlanetSummaryPanel
                  planetLabel={String(summaryPlanet.planet.id)}
                  biomeEmoji={summaryPlanet.planet.biome.emoji}
                  biomeName={summaryPlanet.planet.biome.name}
                  population={summaryPlanet.population}
                  inventory={summaryPlanet.inventory}
                  inventoryCapacityTier={summaryPlanet.inventoryCapacityTier}
                  buildingCountTotal={buildingTotal}
                  tilesTotal={summaryPlanet.planet.tiles.length}
                  tilesUsed={tilesUsed}
                  onOpenInventory={handleOpenPlanetInventory}
                />
              </PanelFrame>
            )
          })()}

        {/* PHASE 17.L.C.4 — Planet Inventory popup (upgradeable). Opens from the 🗄 button
            inside PlanetSummaryPanel. Renders the per-resource cap bars + the
            scaling-cost upgrade button. */}
        {openPanels.has('planetInventory') &&
          summaryPlanetId &&
          (() => {
            const invPlanet = sim.state.planets.get(summaryPlanetId)
            if (!invPlanet || invPlanet.civId !== sim.state.humanCivId) return null
            return (
              <PanelFrame
                panelId="planetInventory"
                title="Planet Inventory"
                emoji="🗄"
                onClose={() => closePanel('planetInventory')}
                variant="centered"
                width={620}
              >
                <PlanetInventoryPanel
                  planetLabel={String(invPlanet.planet.id)}
                  inventory={invPlanet.inventory}
                  inventoryCapacityTier={invPlanet.inventoryCapacityTier}
                  onUpgradeCapacity={handleUpgradePlanetCapacity}
                  lastUpgradeFeedback={inventoryFeedback}
                />
              </PanelFrame>
            )
          })()}

        {/* PHASE 17.L.A.7+A.8 — Launch Manifest Modal. Opens when player clicks Launch in
            ShipBuildPanel; closes on cancel or confirm-then-launch. Looks up the pad's planet
            via padIdToPlanetIdIndex so population + inventory are correctly scoped to whichever
            planet hosts the launching pad (not necessarily the active planet view). */}
        {(() => {
          if (!launchManifestRequest) return null
          const indexedPlanetId = sim.state.padIdToPlanetIdIndex.get(launchManifestRequest.padId)
          let manifestPlanet = indexedPlanetId ? sim.state.planets.get(indexedPlanetId) : undefined
          if (!manifestPlanet) {
            for (const p of sim.state.planets.values()) {
              if (p.launchPads.has(launchManifestRequest.padId)) {
                manifestPlanet = p
                break
              }
            }
          }
          const manifestPad = manifestPlanet?.launchPads.get(launchManifestRequest.padId) ?? null
          // PHASE 17.L.A.11 — Q5 LOCKED. Multi-planet rotation candidate list for the Mining
          // Mode picker. Every non-home reachable planet shows up; the current target is
          // flagged so the player knows which row was the original pick.
          const miningRotationCandidates = [...sim.state.planets.values()]
            .filter((p) => p.planet.id !== manifestPlanet?.planet.id)
            .map((p) => ({
              id: p.planet.id,
              label: `${p.planet.biome.emoji} ${String(p.planet.id)}`,
              isCurrentTarget: p.planet.id === launchManifestRequest.targetPlanetId,
            }))
          return (
            <LaunchManifestModal
              open={true}
              pad={manifestPad}
              population={manifestPlanet?.population ?? null}
              inventory={manifestPlanet?.inventory ?? null}
              targetPlanetLabel={launchManifestRequest.targetPlanetLabel}
              onCancel={handleManifestCancel}
              onConfirm={handleManifestConfirm}
              miningRotationCandidates={miningRotationCandidates}
            />
          )
        })()}
      </div>
    </PanelLayoutProvider>
  )
}
