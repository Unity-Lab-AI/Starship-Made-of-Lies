import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type CivId,
  type ColonyShipVariantId,
  type LootDropId,
  type PlanetId,
  abortFlight,
  setShipDutyPercent as setShipDutyPercentImpl,
} from '@smol/shared'
import {
  type BuildShipFromBlueprintInputs,
  type BuildShipInputs,
  type LaunchCampaignInputs,
  type LaunchShipInputs,
  type MatchConfig,
  type MatchState,
  type PlaceBuildingInputs,
  type StartResearchInputs,
  buildShipAction,
  buildShipFromBlueprintAction,
  claimLootDropAction,
  createMatch,
  isHumanGodControlReady,
  launchCampaignAction,
  launchShipFromPadAction,
  placeBuildingAction,
  redirectFlightAction,
  startResearchAction,
  tickMatch,
  triggerLastHopeManually,
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
  // PHASE 17.J.9 — set per-tier ship-duty allocation percentage on a specific planet. The
  // CitizensPanel slider invokes this on every change. Persisted in PlanetPopulation.
  readonly setShipDutyPercent: (
    planetId: PlanetId,
    tier: 1 | 2 | 3 | 4 | 5,
    percent: number,
  ) => void
}

export function useMatchSim(initialConfig: MatchConfig): UseMatchSimResult {
  const stateRef = useRef<MatchState>(createMatch(initialConfig))
  const [tickCount, setTickCount] = useState(0)
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState<1 | 2 | 4 | 8>(1)

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
        pad.citizensLoaded = 0
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

  // PHASE 16.23: per-flight abort fired from FlightDetailPanel's "💀 ABORT (self-destruct)"
  // button. Look up flight by id, call shared abortFlight() — flips phase to ABORTED +
  // outcome to ABORTED. Per UMS UnityPad.cs DETONATE:{padID} IGC manual self-destruct.
  const abortFlightById = useCallback((flightId: string): boolean => {
    const state = stateRef.current
    const flight = state.flights.get(flightId)
    if (!flight) return false
    if (
      flight.phase === 'DETONATE' ||
      flight.phase === 'INTERCEPTED' ||
      flight.phase === 'ABORTED' ||
      flight.phase === 'CRASH_LANDED'
    ) {
      return false
    }
    abortFlight(flight)
    setTickCount((n) => n + 1)
    return true
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
    claimLoot,
    triggerLastHope,
    resetMatch,
    controllerBuildAll,
    controllerArmAll,
    controllerLaunchAll,
    controllerAbortAll,
    controllerCopyTarget,
    abortFlightById,
    redirectFlight,
    godControlReady,
    setShipDutyPercent,
  }
}
