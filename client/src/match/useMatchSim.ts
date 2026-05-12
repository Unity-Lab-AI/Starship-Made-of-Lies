import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type CivId,
  type ColonyShipVariantId,
  type LootDropId,
  type PadTargetWaypoint,
  type PlanetId,
  abortFlight,
  resetPadCargoLoad,
  resetPadCitizenLoad,
  setShipDutyPercent as setShipDutyPercentImpl,
  setTargetQueue,
} from '@smol/shared'
import {
  clearSavedMatch,
  hasSavedMatch,
  loadMatchFromStorage,
  saveMatchToStorage,
} from './saveLoad'
import { applyAchievementUnlocks } from './achievementStorage'
import { applyMatchScores } from './leaderboardStorage'
import {
  type BuildShipFromBlueprintInputs,
  type BuildShipInputs,
  type LaunchCampaignInputs,
  type LaunchShipInputs,
  type LoadPadManifestInputs,
  type LoadPadManifestResult,
  type MatchConfig,
  type MatchState,
  type PlaceBuildingInputs,
  type SetBuildingModeInputs,
  type SetPlanetQuotaInputs,
  type StartResearchInputs,
  buildShipAction,
  buildShipFromBlueprintAction,
  claimLootDropAction,
  createMatch,
  isHumanGodControlReady,
  launchCampaignAction,
  launchShipFromPadAction,
  loadPadManifestAction,
  placeBuildingAction,
  manualIndigenousParleyAction,
  type ManualParleyInputs,
  type ManualParleyResult,
  redirectFlightAction,
  refuelReactorFromGodControlAction,
  setBuildingModeAction,
  setPlanetQuotaAction,
  startResearchAction,
  tickMatch,
  triggerLastHopeManually,
  upgradePlanetCapacityAction,
  type UpgradePlanetCapacityInputs,
  type UpgradePlanetCapacityResult,
} from './MatchSim'

const DEFAULT_TICK_MS = 200

export interface UseMatchSimResult {
  readonly state: MatchState
  readonly tickCount: number
  readonly running: boolean
  readonly speed: 1 | 2 | 4 | 8
  readonly togglePause: () => void
  readonly setSpeed: (s: 1 | 2 | 4 | 8) => void
  readonly placeBuilding: (input: Omit<PlaceBuildingInputs, 'state'>) => boolean
  readonly startResearchTech: (input: Omit<StartResearchInputs, 'state'>) => boolean
  readonly launchCampaign: (input: Omit<LaunchCampaignInputs, 'state'>) => boolean
  readonly buildShip: (input: Omit<BuildShipInputs, 'state'>) => boolean
  readonly buildShipFromBlueprint: (input: Omit<BuildShipFromBlueprintInputs, 'state'>) => boolean
  readonly launchShipFromPad: (input: Omit<LaunchShipInputs, 'state'>) => boolean
  // PHASE 17.L.A.7+A.8 — Q3 PHASE 17 LOCKED closure. Apply the LaunchManifestModal's per-tier
  // crew allocation + per-resource cargo allocation to a pad currently in the loading window
  // (DOCK through ARM). Restore-then-load semantics — whatever was on the pad is returned to
  // population.tierCounts / planet.inventory first, then the new manifest applies fresh. The
  // sliders represent the WHOLE allocation, not deltas.
  readonly loadPadManifest: (input: Omit<LoadPadManifestInputs, 'state'>) => LoadPadManifestResult
  readonly claimLoot: (dropId: LootDropId) => boolean
  readonly triggerLastHope: (civId: CivId) => boolean
  readonly resetMatch: (newConfig?: MatchConfig) => void
  // PHASE 16.14 — multi-pad controller mode mass actions. Iterate every launch pad on the
  // target planet owned by the human civ and apply the command. Returns count of pads touched.
  readonly controllerBuildAll: (planetId: PlanetId, variantId: ColonyShipVariantId) => number
  readonly controllerArmAll: (planetId: PlanetId) => number
  readonly controllerLaunchAll: (planetId: PlanetId) => number
  readonly controllerAbortAll: (planetId: PlanetId) => number
  readonly controllerCopyTarget: (planetId: PlanetId) => number
  // PHASE 17.L.B.9 — waypoint queue editor mutator. Replaces the controller pad's target queue
  // on the named planet. UI surface lives in CommandPadPanel as the WaypointQueueEditor sub-section.
  readonly setControllerWaypoints: (
    planetId: PlanetId,
    waypoints: ReadonlyArray<PadTargetWaypoint>,
  ) => boolean
  // PHASE 16.23: user-driven per-flight abort. Player clicks an in-flight cone in 3D, the
  // FlightDetailPanel opens, the ABORT button fires this with the flight id. Per UMS
  // UnityPad.cs DETONATE:{padID} IGC message — manual self-destruct. PHASE 16.24 will
  // add AoE damage scaling from fuel + payload at detonation point.
  readonly abortFlightById: (flightId: string) => boolean
  // PHASE 16.31: god-control redirect. Player selects a flight + right-clicks destination
  // planet → calls this. Validates tech + building gate inside MatchSim. Returns true on
  // successful redirect.
  readonly redirectFlight: (flightId: string, newTargetPlanetId: PlanetId) => boolean
  // PHASE 16.31: gate check exposed to UI so the FlightDetailPanel can show / hide the
  // "Select for Redirect" button + the PlayPage hint banner.
  readonly godControlReady: boolean
  // PHASE 17.L.C.1 — endgame-tier god-control reactor refuel. Same gate as redirect.
  // Consumes def.reactorFuelAmount of def.reactorFuelType from the flight's source planet
  // and refills reactorFuelRemaining back to reactorFuelAtLaunch. Returns true on success.
  readonly refuelReactor: (flightId: string) => boolean
  // PHASE 17.J.9 — set per-tier ship-duty allocation percentage on a specific planet. The
  // CitizensPanel slider invokes this on every change. Persisted in PlanetPopulation.
  readonly setShipDutyPercent: (
    planetId: PlanetId,
    tier: 1 | 2 | 3 | 4 | 5,
    percent: number,
  ) => void
  // PHASE 17.L.A.12 — Q11 PHASE 17 LOCKED. QuotasPanel slider invokes this — sets the target
  // stockpile for `resource` on `planetId`. Pass 0 to clear the quota.
  readonly setPlanetQuota: (input: Omit<SetPlanetQuotaInputs, 'state'>) => boolean
  // PHASE 17.L.A.12 — Q11 LOCKED. Per-building-def mode toggle (auto / paused / disassembly).
  // QuotasPanel building rows invoke this when player flips the dropdown.
  readonly setBuildingMode: (input: Omit<SetBuildingModeInputs, 'state'>) => boolean
  // PHASE 17.L.C.4 — planet inventory capacity tier upgrade. PlanetInventoryPanel upgrade
  // button invokes this. Returns the action result (ok + newTier + optional reason for
  // failure) so the UI can render the right toast / disabled-state.
  readonly upgradePlanetCapacity: (
    input: Omit<UpgradePlanetCapacityInputs, 'state'>,
  ) => UpgradePlanetCapacityResult
  // PHASE 17.12.3 — manual indigenous parley. IndigenousPanel "Negotiate Now" button calls
  // this. Consumes 50 propaganda materials from the host planet's inventory and fires an
  // immediate parley attempt with boosted propaganda-power.
  readonly manualIndigenousParley: (input: Omit<ManualParleyInputs, 'state'>) => ManualParleyResult
  // PHASE 17.L.A.13 — Q12 LOCKED. Manual save + load callbacks. Auto-save runs internally
  // based on config.saveMode. saveMatchNow returns true on successful localStorage write.
  readonly saveMatchNow: () => boolean
  readonly loadSavedMatch: () => boolean
  readonly clearSavedMatch: () => void
  readonly hasSavedMatch: boolean
}

export function useMatchSim(initialConfig: MatchConfig): UseMatchSimResult {
  const stateRef = useRef<MatchState>(createMatch(initialConfig))
  const [tickCount, setTickCount] = useState(0)
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState<1 | 2 | 4 | 8>(1)
  // PHASE 17.L.A.13 — Q12 LOCKED. Track whether a saved match exists in localStorage so the
  // UI can show / hide the 📂 Load button. Refreshed after every save/load/clear call.
  const [savedMatchPresent, setSavedMatchPresent] = useState<boolean>(() => hasSavedMatch())

  useEffect(() => {
    if (!running) return
    if (stateRef.current.phase === 'ENDED') return
    const interval = DEFAULT_TICK_MS / speed
    const handle = setInterval(() => {
      tickMatch(stateRef.current)
      setTickCount((n) => n + 1)
    }, interval)
    return () => clearInterval(handle)
  }, [running, speed])

  // PHASE 17.L.A.13 — Q12 LOCKED. Auto-save interval driven by config.saveMode. 'off' /
  // 'manual' don't auto-save. 'auto-5min' / 'auto-15min' fire saveMatchToStorage at the
  // matching real-time interval (independent of in-game speed). The 'savedMatchPresent' flag
  // updates after each successful save so the UI re-renders the Load button.
  useEffect(() => {
    const mode = initialConfig.saveMode ?? 'auto-5min'
    if (mode === 'off' || mode === 'manual') return
    const intervalMs = mode === 'auto-5min' ? 5 * 60 * 1000 : 15 * 60 * 1000
    const handle = setInterval(() => {
      if (stateRef.current.phase === 'ENDED') return
      const ok = saveMatchToStorage(stateRef.current, initialConfig.seed)
      if (ok) setSavedMatchPresent(true)
    }, intervalMs)
    return () => clearInterval(handle)
  }, [initialConfig.saveMode, initialConfig.seed])

  // PHASE 17.12.6 — persist achievement unlocks once match ends. Watches phase transition;
  // when ENDED is observed, writes the achievementUnlocksThisMatch list to localStorage via
  // applyAchievementUnlocks (which deduplicates so already-unlocked-from-prior-matches don't
  // re-trigger). The unlocked-event toasts have already fired from the events stream watcher
  // by this point — this hook only handles persistence.
  const lastPersistedMatchIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (stateRef.current.phase !== 'ENDED') return
    if (lastPersistedMatchIdRef.current === stateRef.current.matchId) return
    // Persist achievement unlocks + leaderboard scores together so re-renders past match-end
    // don't double-write. Single guard ref per match keyed on matchId.
    lastPersistedMatchIdRef.current = stateRef.current.matchId
    if (stateRef.current.achievementUnlocksThisMatch.length > 0) {
      applyAchievementUnlocks(
        stateRef.current.achievementUnlocksThisMatch,
        stateRef.current.currentTick,
        stateRef.current.matchId,
      )
    }
    // PHASE 17.12.7 — persist match-end scores into the Hall of Champions store.
    if (stateRef.current.matchEndScoresPending.length > 0) {
      applyMatchScores(stateRef.current.matchEndScoresPending)
    }
  }, [tickCount])

  const togglePause = useCallback(() => setRunning((r) => !r), [])

  const placeBuilding = useCallback((input: Omit<PlaceBuildingInputs, 'state'>) => {
    const ok = placeBuildingAction({ ...input, state: stateRef.current })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])
  const startResearchTech = useCallback((input: Omit<StartResearchInputs, 'state'>) => {
    const ok = startResearchAction({ ...input, state: stateRef.current })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])
  const launchCampaign = useCallback((input: Omit<LaunchCampaignInputs, 'state'>) => {
    const ok = launchCampaignAction({ ...input, state: stateRef.current })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])
  const buildShipFromBlueprint = useCallback(
    (input: Omit<BuildShipFromBlueprintInputs, 'state'>) => {
      const ok = buildShipFromBlueprintAction({ ...input, state: stateRef.current })
      if (ok) setTickCount((n) => n + 1)
      return ok
    },
    [],
  )
  const buildShip = useCallback((input: Omit<BuildShipInputs, 'state'>) => {
    const ok = buildShipAction({ ...input, state: stateRef.current })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])
  const launchShipFromPad = useCallback((input: Omit<LaunchShipInputs, 'state'>) => {
    const ok = launchShipFromPadAction({ ...input, state: stateRef.current })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])
  const loadPadManifest = useCallback(
    (input: Omit<LoadPadManifestInputs, 'state'>): LoadPadManifestResult => {
      const result = loadPadManifestAction({ ...input, state: stateRef.current })
      if (result.ok) setTickCount((n) => n + 1)
      return result
    },
    [],
  )
  const claimLoot = useCallback((dropId: LootDropId) => {
    const ok = claimLootDropAction({ state: stateRef.current, dropId })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])
  const triggerLastHope = useCallback((civId: CivId) => {
    const ok = triggerLastHopeManually(stateRef.current, civId)
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])
  const resetMatch = useCallback(
    (newConfig?: MatchConfig) => {
      stateRef.current = createMatch(newConfig ?? initialConfig)
      setTickCount(0)
      setRunning(true)
      setSpeed(1)
    },
    [initialConfig],
  )

  // === Controller-mode mass actions (PHASE 16.14) ===
  // Each iterates every pad on the target planet owned by the human civ. The "controller"
  // pad in v1 is informational — actions apply uniformly to every pad. UMS-faithful salvo
  // stagger + per-pad targeted-pad payload is roadmapped per SMOL_REFERENCE_PAD.md §Salvo.

  const padsOnPlanet = (state: MatchState, planetId: PlanetId) => {
    const planet = state.planets.get(planetId)
    if (!planet) return null
    if (planet.civId !== state.humanCivId) return null
    return planet
  }

  const controllerBuildAll = useCallback(
    (planetId: PlanetId, variantId: ColonyShipVariantId): number => {
      const state = stateRef.current
      const planet = padsOnPlanet(state, planetId)
      if (!planet) return 0
      let touched = 0
      for (const pad of planet.launchPads.values()) {
        if (buildShipAction({ state, padId: pad.id, variantId })) touched += 1
      }
      if (touched > 0) setTickCount((n) => n + 1)
      return touched
    },
    [],
  )

  const controllerArmAll = useCallback((planetId: PlanetId): number => {
    const state = stateRef.current
    const planet = padsOnPlanet(state, planetId)
    if (!planet) return 0
    let touched = 0
    for (const pad of planet.launchPads.values()) {
      if (pad.state === 'READY') {
        pad.state = 'ARM'
        touched += 1
      }
    }
    if (touched > 0) setTickCount((n) => n + 1)
    return touched
  }, [])

  const controllerLaunchAll = useCallback((planetId: PlanetId): number => {
    const state = stateRef.current
    const planet = padsOnPlanet(state, planetId)
    if (!planet) return 0
    let touched = 0
    for (const pad of planet.launchPads.values()) {
      if (pad.state !== 'ARM') continue
      if (pad.targetQueue.length === 0) continue
      const idx = pad.activeTargetIdx >= pad.targetQueue.length ? 0 : pad.activeTargetIdx
      const target = pad.targetQueue[idx]
      if (!target) continue
      if (
        launchShipFromPadAction({
          state,
          padId: pad.id,
          targetPlanetId: target.targetPlanetId,
        })
      ) {
        touched += 1
      }
    }
    if (touched > 0) setTickCount((n) => n + 1)
    return touched
  }, [])

  const controllerAbortAll = useCallback((planetId: PlanetId): number => {
    const state = stateRef.current
    const planet = padsOnPlanet(state, planetId)
    if (!planet) return 0
    let touched = 0
    for (const pad of planet.launchPads.values()) {
      if (
        pad.state === 'LAUNCH' ||
        pad.state === 'ARM' ||
        pad.state === 'READY' ||
        pad.state === 'AMMO' ||
        pad.state === 'FUEL' ||
        pad.state === 'PRINT' ||
        pad.state === 'BUILD'
      ) {
        pad.state = 'IDLE'
        pad.loadedShipVariantId = null
        pad.buildTicksRemaining = 0
        pad.fuelLoaded = 0
        pad.ammoLoaded = 0
        resetPadCitizenLoad(pad)
        // PHASE 17.L.A.7 — clear cargo too so mass-abort doesn't leak the player's manifest
        // into the next print run. Mirrors the per-pad abort path in shared/sim/launch-pad.ts.
        resetPadCargoLoad(pad)
        pad.lastOutcome = 'ABORTED'
        touched += 1
      }
    }
    if (touched > 0) setTickCount((n) => n + 1)
    return touched
  }, [])

  const controllerCopyTarget = useCallback((planetId: PlanetId): number => {
    const state = stateRef.current
    const planet = padsOnPlanet(state, planetId)
    if (!planet) return 0
    const pads = [...planet.launchPads.values()]
    const controller = pads[0]
    if (!controller || controller.targetQueue.length === 0) return 0
    let touched = 0
    for (const pad of pads) {
      if (pad === controller) continue
      pad.targetQueue = [...controller.targetQueue]
      pad.activeTargetIdx = 0
      touched += 1
    }
    if (touched > 0) setTickCount((n) => n + 1)
    return touched
  }, [])

  // PHASE 17.L.B.9 — waypoint queue editor mutator. Rewrites the controller pad's targetQueue
  // wholesale; activeTargetIdx resets to 0 via shared setTargetQueue. Q6 PHASE 17 LOCKED:
  // "drag-reorder GPS-targets editor surface ... pad.targetQueue data exists but no UI mutator".
  // This is the missing mutator. Returns true on success, false if planet missing / not human-owned
  // / no pads on planet. UI live-saves on every mutation (UMS UnityPad CustomData live-read parity).
  const setControllerWaypoints = useCallback(
    (planetId: PlanetId, waypoints: ReadonlyArray<PadTargetWaypoint>): boolean => {
      const state = stateRef.current
      const planet = padsOnPlanet(state, planetId)
      if (!planet) return false
      const controller = [...planet.launchPads.values()][0]
      if (!controller) return false
      setTargetQueue(controller, waypoints)
      setTickCount((n) => n + 1)
      return true
    },
    [],
  )

  // PHASE 16.23: per-flight abort fired from FlightDetailPanel's "💀 ABORT (self-destruct)"
  // button. Look up flight by id, call shared abortFlight() — flips phase to ABORTED +
  // outcome to ABORTED. Per UMS UnityPad.cs DETONATE:{padID} IGC manual self-destruct.
  //
  // PHASE 17.L.A.17 — abortFlight now returns boolean (true = succeeded, false = refused for
  // terminal phase OR no self-destruct system installed per user verbatim "researched and
  // installed on the ship"). The early-return phase checks here are defensive; the shared
  // abortFlight has the authoritative gate.
  const abortFlightById = useCallback((flightId: string): boolean => {
    const state = stateRef.current
    const flight = state.flights.get(flightId)
    if (!flight) return false
    const succeeded = abortFlight(flight)
    if (succeeded) setTickCount((n) => n + 1)
    return succeeded
  }, [])

  // PHASE 16.31 — god-control redirect action. Validates tech + building gate inside
  // MatchSim's redirectFlightAction. Triggered from PlayPage when player has selected a
  // flight for redirect AND right-clicks a destination planet.
  const redirectFlight = useCallback((flightId: string, newTargetPlanetId: PlanetId): boolean => {
    const ok = redirectFlightAction({
      state: stateRef.current,
      flightId,
      newTargetPlanetId,
    })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])

  const godControlReady = isHumanGodControlReady(stateRef.current)

  // PHASE 17.L.C.1 — endgame-tier god-control reactor refuel. Same gate as redirect
  // (TECH_GOD_CONTROL forbidden tier-4 + BLDG_GOD_CONTROL). v1 uses the flight's source
  // planet as the radioactive source by default; future revisions can add a planet-picker.
  const refuelReactor = useCallback((flightId: string): boolean => {
    const flight = stateRef.current.flights.get(flightId)
    if (!flight) return false
    const ok = refuelReactorFromGodControlAction({
      state: stateRef.current,
      flightId,
      sourcePlanetId: flight.fromPlanetId,
    })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])

  // PHASE 17.J.9 — apply a slider change immediately. Doesn't bump tickCount because the
  // slider drag would fire 20× per second; volunteer-pool readouts derive on next natural tick.
  const setShipDutyPercent = useCallback(
    (planetId: PlanetId, tier: 1 | 2 | 3 | 4 | 5, percent: number) => {
      const planet = stateRef.current.planets.get(planetId)
      if (!planet) return
      setShipDutyPercentImpl(planet.population, tier, percent)
      setTickCount((n) => n + 1)
    },
    [],
  )

  // PHASE 17.L.A.12 — Q11 LOCKED. Quota + building-mode mutators. Both bump tickCount so any
  // open panels re-render with the new quota/mode in their readouts.
  const setPlanetQuota = useCallback((input: Omit<SetPlanetQuotaInputs, 'state'>) => {
    const ok = setPlanetQuotaAction({ ...input, state: stateRef.current })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])
  const setBuildingMode = useCallback((input: Omit<SetBuildingModeInputs, 'state'>) => {
    const ok = setBuildingModeAction({ ...input, state: stateRef.current })
    if (ok) setTickCount((n) => n + 1)
    return ok
  }, [])

  // PHASE 17.L.C.4 — planet capacity tier upgrade. Bump tickCount on success so panel
  // re-renders with the new cap + cost-for-next-tier.
  const upgradePlanetCapacity = useCallback(
    (input: Omit<UpgradePlanetCapacityInputs, 'state'>): UpgradePlanetCapacityResult => {
      const result = upgradePlanetCapacityAction({ ...input, state: stateRef.current })
      if (result.ok) setTickCount((n) => n + 1)
      return result
    },
    [],
  )

  // PHASE 17.12.3 — manual parley. Bump tickCount on success so IndigenousPanel re-renders
  // with the updated controlledTileIds count + parleysAccepted increment.
  const manualIndigenousParley = useCallback(
    (input: Omit<ManualParleyInputs, 'state'>): ManualParleyResult => {
      const result = manualIndigenousParleyAction({ ...input, state: stateRef.current })
      if (result.ok) setTickCount((n) => n + 1)
      return result
    },
    [],
  )

  // PHASE 17.L.A.13 — Q12 LOCKED. Save / load callbacks. saveMatchNow returns boolean for
  // toast feedback; loadSavedMatch swaps stateRef + bumps tickCount so every panel re-renders
  // with the restored data.
  const saveMatchNow = useCallback((): boolean => {
    const ok = saveMatchToStorage(stateRef.current, initialConfig.seed)
    if (ok) setSavedMatchPresent(true)
    return ok
  }, [initialConfig.seed])
  const loadSavedMatch = useCallback((): boolean => {
    const restored = loadMatchFromStorage()
    if (!restored) return false
    stateRef.current = restored
    setTickCount((n) => n + 1)
    return true
  }, [])
  const clearSavedMatchCallback = useCallback(() => {
    clearSavedMatch()
    setSavedMatchPresent(false)
  }, [])

  return {
    state: stateRef.current,
    tickCount,
    running,
    speed,
    togglePause,
    setSpeed,
    placeBuilding,
    startResearchTech,
    launchCampaign,
    buildShip,
    buildShipFromBlueprint,
    launchShipFromPad,
    loadPadManifest,
    claimLoot,
    triggerLastHope,
    resetMatch,
    controllerBuildAll,
    controllerArmAll,
    controllerLaunchAll,
    controllerAbortAll,
    controllerCopyTarget,
    setControllerWaypoints,
    abortFlightById,
    redirectFlight,
    godControlReady,
    refuelReactor,
    setShipDutyPercent,
    setPlanetQuota,
    setBuildingMode,
    upgradePlanetCapacity,
    manualIndigenousParley,
    saveMatchNow,
    loadSavedMatch,
    clearSavedMatch: clearSavedMatchCallback,
    hasSavedMatch: savedMatchPresent,
  }
}
