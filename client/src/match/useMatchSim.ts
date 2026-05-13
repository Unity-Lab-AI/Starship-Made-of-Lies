import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type CivId,
  type ColonyShipVariantId,
  type LaunchPad,
  type LootDropId,
  type PadTargetWaypoint,
  type PlanetId,
  type SalvoCoordinator,
  type SalvoPhase,
  abortFlight,
  arm,
  newSalvoCoordinator,
  resetPadCargoLoad,
  resetPadCitizenLoad,
  setShipDutyPercent as setShipDutyPercentImpl,
  setTargetQueue,
  tickSalvo,
} from '@smol/shared'
import {
  clearSavedMatch,
  hasSavedMatch,
  loadMatchFromStorage,
  saveMatchToStorage,
} from './saveLoad'
// Replay buffer retired from /play 2026-05-12 per user "no replay until the game is over".
// clearReplayBuffer still wired to mount/reset cleanup so any latent captured snapshots from
// older code paths get freed; recordReplaySnapshot + loadReplaySnapshot are no longer called.
import { clearReplayBuffer } from './replay'
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
  demolishBuildingAction,
  type DemolishBuildingInputs,
  manualIndigenousParleyAction,
  type ManualParleyInputs,
  type ManualParleyResult,
  annexTileAction,
  cancelCaravanAction,
  createCaravanAction,
  renameSettlementAction,
  type AnnexTileInputs,
  type AnnexTileResult,
  type CancelCaravanActionInputs,
  type CreateCaravanActionInputs,
  type CreateCaravanActionResult,
  type RenameSettlementInputs,
  redirectFlightAction,
  refuelReactorFromGodControlAction,
  setBuildingModeAction,
  setMiningShipModeAction,
  setPlanetQuotaAction,
  type SetMiningShipModeInputs,
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
  readonly demolishBuilding: (input: Omit<DemolishBuildingInputs, 'state'>) => boolean
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
  // PHASE 17.L.A.11 — Q5 PHASE 17 LOCKED "all three yes". Switch a mining ship's mode
  // (shuttle-single / shuttle-multi / oneway) at runtime. Active flights snap to the new
  // mode on the next DOCKED→OUTBOUND boundary so the current cycle isn't interrupted.
  readonly setMiningShipMode: (input: Omit<SetMiningShipModeInputs, 'state'>) => boolean
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
  // PHASE 17.13.7 — inter-planet caravan trade. createCaravan validates ownership + fuel
  // cost + amount cap + per-civ active-caravan cap; cancelCaravan flips an OUTBOUND caravan
  // to CANCELLED (cargo lost). UI surface is CaravanPanel.
  readonly createCaravan: (
    input: Omit<CreateCaravanActionInputs, 'state'>,
  ) => CreateCaravanActionResult
  readonly cancelCaravan: (input: Omit<CancelCaravanActionInputs, 'state'>) => boolean
  // PHASE 17.L.A.13 — Q12 LOCKED. Manual save + load callbacks. Auto-save runs internally
  // based on config.saveMode. saveMatchNow returns true on successful localStorage write.
  readonly saveMatchNow: () => boolean
  readonly loadSavedMatch: () => boolean
  readonly clearSavedMatch: () => void
  readonly hasSavedMatch: boolean
  // PHASE 17.13.10 — player rename mutator. SettlementPickerPanel surfaces a rename button per
  // settlement; this callback applies the rename through the sim action so the themed default
  // restores cleanly on blank-input + the change re-renders any panel reading settlement.name.
  readonly renameSettlement: (input: Omit<RenameSettlementInputs, 'state'>) => boolean
  // PHASE 17.13.3 — annex action. Player picks an adjacent unclaimed tile + spends propaganda
  // to claim it for the active settlement. Returns structured result for UI failure-mode toasts.
  readonly annexTile: (input: Omit<AnnexTileInputs, 'state'>) => AnnexTileResult
  // PHASE 17.1.6 — tick-driven salvo orchestration. Replaces the setTimeout chain that lived
  // in PlayPage.runSalvoRound (8s/11s/13s real-time delays). startSalvoRound kicks off a
  // BUILDALL on the planet's pads and primes a SalvoCoordinator; tickSalvo (shared) advances
  // it phase-by-phase using the actual sim tick clock so speed/pause obey the player. The
  // launchFn callback passed to tickSalvo wires the real launchShipFromPadAction so flights
  // actually get created (not just pad-state flipped). UI reads salvoPhase to render the
  // BUILDING/ARMING/LAUNCHING badge.
  readonly salvoPhase: SalvoPhase
  readonly salvoActive: boolean
  readonly startSalvoRound: (planetId: PlanetId, variantId: ColonyShipVariantId) => boolean
  readonly cancelSalvoRound: () => void
  readonly autoFireSalvoLoop: boolean
  readonly setAutoFireSalvoLoop: (on: boolean) => void
}

export function useMatchSim(initialConfig: MatchConfig): UseMatchSimResult {
  // Clear the replay ring buffer on every match boundary (mount + resetMatch). The buffer is
  // module-state singleton — without this, ~10MB worth of snapshots survives across matches
  // and grows monotonically until the browser tab OOMs (super-review 2026-05-12 Critical #4).
  const replayCleanupOnMount = useRef(false)
  if (!replayCleanupOnMount.current) {
    clearReplayBuffer()
    replayCleanupOnMount.current = true
  }
  const stateRef = useRef<MatchState>(createMatch(initialConfig))
  const [tickCount, setTickCount] = useState(0)
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState<1 | 2 | 4 | 8>(1)
  // PHASE 17.L.A.13 — Q12 LOCKED. Track whether a saved match exists in localStorage so the
  // UI can show / hide the 📂 Load button. Refreshed after every save/load/clear call.
  const [savedMatchPresent, setSavedMatchPresent] = useState<boolean>(() => hasSavedMatch())
  // PHASE 17.1.6 — SalvoCoordinator state. coordRef holds the active orchestrator (null when
  // no round in flight). planetIdRef caches which planet's pads the coord is driving so the
  // tick effect doesn't have to re-resolve it. salvoPhase + salvoActive are derived state the
  // UI reads. autoFireLoopRef is the indefinite-loop toggle that auto-restarts on COOLDOWN
  // completion (replaces the PlayPage autoFireLoopActive state).
  const salvoCoordRef = useRef<SalvoCoordinator | null>(null)
  const salvoPlanetIdRef = useRef<PlanetId | null>(null)
  const salvoVariantIdRef = useRef<ColonyShipVariantId | null>(null)
  const [salvoPhase, setSalvoPhase] = useState<SalvoPhase>('IDLE')
  const [autoFireSalvoLoop, setAutoFireSalvoLoopState] = useState(false)
  const autoFireSalvoLoopRef = useRef(false)
  useEffect(() => {
    autoFireSalvoLoopRef.current = autoFireSalvoLoop
  }, [autoFireSalvoLoop])

  useEffect(() => {
    if (!running) return
    if (stateRef.current.phase === 'ENDED') return
    const interval = DEFAULT_TICK_MS / speed
    const handle = setInterval(() => {
      tickMatch(stateRef.current)
      // Replay capture removed 2026-05-12 — no UI consumer = pure memory waste (~10MB/match
      // ceiling). Ring buffer infrastructure stays on disk under match/replay.ts for future
      // post-match review wire-up, but the per-tick call is gone.
      // PHASE 17.1.6 — drive the salvo coord on every sim tick (not real-time). When the
      // coord exists, run tickSalvo against the planet's pads with launchShipFromPadAction
      // wired as the launchFn so STAGGERED_LAUNCH actually creates flights. Auto-fire-loop
      // re-primes the coord on COOLDOWN exit; otherwise the round ends and coord clears.
      const coord = salvoCoordRef.current
      const planetId = salvoPlanetIdRef.current
      if (coord && planetId) {
        const planet = stateRef.current.planets.get(planetId)
        if (!planet || planet.civId !== stateRef.current.humanCivId) {
          // Planet lost or transferred away — drop the round.
          salvoCoordRef.current = null
          salvoPlanetIdRef.current = null
          salvoVariantIdRef.current = null
          setSalvoPhase('IDLE')
        } else {
          // Only consider pads that actually entered the build pipeline. Pads that failed
          // buildShipAction (insufficient resources, wrong state, etc.) stay in IDLE/GONE
          // with loadedShipVariantId === null — including them would hang the BUILDING
          // phase's allReady check forever.
          const pads = [...planet.launchPads.values()].filter((p) => p.loadedShipVariantId !== null)
          const waypoints = pads[0]?.targetQueue ?? []
          const launchFn = (pad: LaunchPad): boolean => {
            const target = pad.targetQueue[pad.activeTargetIdx] ?? pad.targetQueue[0]
            if (!target) return false
            return launchShipFromPadAction({
              state: stateRef.current,
              padId: pad.id,
              targetPlanetId: target.targetPlanetId,
            })
          }
          const prevPhase = coord.phase
          const result = tickSalvo(coord, {
            currentTick: stateRef.current.currentTick,
            pads,
            waypoints,
            launchFn,
          })
          // When a BUILDING coord sees all pads READY, tickSalvo arms them itself via shared
          // arm() — but only flips state. That's correct here (no flight created on arm).
          // Auto-arm covers the case where pads finished build between the orchestrator's
          // BUILDALL primer and this tick — arm whatever READY pads tickSalvo missed.
          if (result.phase === 'STAGGERED_LAUNCH' && prevPhase === 'BUILDING') {
            for (const pad of pads) {
              if (pad.state === 'READY') arm(pad)
            }
          }
          // COOLDOWN → next round (auto-fire) or end-of-round cleanup.
          let coordCleared = false
          if (result.phase === 'COOLDOWN' && prevPhase === 'STAGGERED_LAUNCH') {
            if (!autoFireSalvoLoopRef.current) {
              // Single round done. Drop the coord; UI flips back to IDLE.
              salvoCoordRef.current = null
              salvoPlanetIdRef.current = null
              salvoVariantIdRef.current = null
              setSalvoPhase('IDLE')
              coordCleared = true
            }
          }
          // Auto-fire re-primer: COOLDOWN drained → kick off a fresh BUILDALL round.
          if (
            !coordCleared &&
            result.phase === 'TARGETING' &&
            prevPhase === 'COOLDOWN' &&
            autoFireSalvoLoopRef.current &&
            salvoVariantIdRef.current
          ) {
            const variantId = salvoVariantIdRef.current
            for (const pad of pads) {
              buildShipAction({ state: stateRef.current, padId: pad.id, variantId })
            }
            coord.phase = 'BUILDING'
            setSalvoPhase('BUILDING')
          } else if (!coordCleared && result.phase !== prevPhase) {
            setSalvoPhase(result.phase)
          }
        }
      }
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
  // PHASE 17.L.D.16 — demolish action with 100% buildCost refund. Bumps tickCount so React
  // re-renders the BuildPicker + TopToolbar with the refunded resources visible immediately.
  const demolishBuilding = useCallback((input: Omit<DemolishBuildingInputs, 'state'>) => {
    const ok = demolishBuildingAction({ ...input, state: stateRef.current })
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
      // Clear replay buffer on match boundary — see Critical #4 fix at hook init for rationale.
      clearReplayBuffer()
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
  const setMiningShipModeMutator = useCallback((input: Omit<SetMiningShipModeInputs, 'state'>) => {
    const ok = setMiningShipModeAction({ ...input, state: stateRef.current })
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

  // PHASE 17.13.7 — caravan create + cancel actions. Both bump tickCount on success so the
  // CaravanPanel re-renders with the new caravan list state.
  const createCaravan = useCallback(
    (input: Omit<CreateCaravanActionInputs, 'state'>): CreateCaravanActionResult => {
      const result = createCaravanAction({ ...input, state: stateRef.current })
      if (result.ok) setTickCount((n) => n + 1)
      return result
    },
    [],
  )
  const cancelCaravanCb = useCallback(
    (input: Omit<CancelCaravanActionInputs, 'state'>): boolean => {
      const ok = cancelCaravanAction({ ...input, state: stateRef.current })
      if (ok) setTickCount((n) => n + 1)
      return ok
    },
    [],
  )

  // PHASE 17.13.10 — settlement rename action. Bumps tickCount on success so any panel reading
  // settlement.name re-renders immediately. Empty newName restores the themed default via the
  // shared renameSettlement helper.
  const renameSettlementCb = useCallback(
    (input: Omit<RenameSettlementInputs, 'state'>): boolean => {
      const ok = renameSettlementAction({ ...input, state: stateRef.current })
      if (ok) setTickCount((n) => n + 1)
      return ok
    },
    [],
  )

  // PHASE 17.13.3 — annex action. Bumps tickCount on success so settlement.controlledTileIds
  // change re-renders any panel (Settlements / Stockpile if it later splits per-settlement).
  const annexTileCb = useCallback((input: Omit<AnnexTileInputs, 'state'>): AnnexTileResult => {
    const result = annexTileAction({ ...input, state: stateRef.current })
    if (result.ok) setTickCount((n) => n + 1)
    return result
  }, [])

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

  // PHASE 17.1.6 — public salvo lifecycle. startSalvoRound primes a BUILDING-phase coord
  // and triggers BUILDALL on every pad of the target planet. The tick effect drives the
  // coord from there. cancelSalvoRound resets to IDLE without affecting in-flight ships.
  const startSalvoRound = useCallback(
    (planetId: PlanetId, variantId: ColonyShipVariantId): boolean => {
      if (salvoCoordRef.current !== null) return false
      const state = stateRef.current
      const planet = padsOnPlanet(state, planetId)
      if (!planet) return false
      const pads = [...planet.launchPads.values()]
      if (pads.length === 0) return false
      let touched = 0
      for (const pad of pads) {
        if (buildShipAction({ state, padId: pad.id, variantId })) touched += 1
      }
      if (touched === 0) return false
      const coord = newSalvoCoordinator(String(pads[0]!.id))
      coord.phase = 'BUILDING'
      salvoCoordRef.current = coord
      salvoPlanetIdRef.current = planetId
      salvoVariantIdRef.current = variantId
      setSalvoPhase('BUILDING')
      setTickCount((n) => n + 1)
      return true
    },
    [],
  )
  const cancelSalvoRound = useCallback(() => {
    salvoCoordRef.current = null
    salvoPlanetIdRef.current = null
    salvoVariantIdRef.current = null
    setSalvoPhase('IDLE')
  }, [])
  const setAutoFireSalvoLoop = useCallback((on: boolean) => {
    setAutoFireSalvoLoopState(on)
  }, [])

  return {
    state: stateRef.current,
    tickCount,
    running,
    speed,
    togglePause,
    setSpeed,
    placeBuilding,
    demolishBuilding,
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
    setMiningShipMode: setMiningShipModeMutator,
    upgradePlanetCapacity,
    manualIndigenousParley,
    createCaravan,
    cancelCaravan: cancelCaravanCb,
    renameSettlement: renameSettlementCb,
    annexTile: annexTileCb,
    saveMatchNow,
    loadSavedMatch,
    clearSavedMatch: clearSavedMatchCallback,
    hasSavedMatch: savedMatchPresent,
    salvoPhase,
    salvoActive: salvoCoordRef.current !== null,
    startSalvoRound,
    cancelSalvoRound,
    autoFireSalvoLoop,
    setAutoFireSalvoLoop,
  }
}
