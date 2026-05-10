import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type MatchConfig,
  type MatchState,
  type PlaceBuildingInputs,
  type StartResearchInputs,
  type LaunchCampaignInputs,
  type BuildShipInputs,
  type LaunchShipInputs,
  buildShipAction,
  createMatch,
  launchCampaignAction,
  launchShipFromPadAction,
  placeBuildingAction,
  startResearchAction,
  tickMatch,
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
  readonly launchShipFromPad: (input: Omit<LaunchShipInputs, 'state'>) => boolean
  readonly resetMatch: (newConfig?: MatchConfig) => void
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
  const resetMatch = useCallback(
    (newConfig?: MatchConfig) => {
      stateRef.current = createMatch(newConfig ?? initialConfig)
      setTickCount(0)
      setRunning(true)
      setSpeed(1)
    },
    [initialConfig],
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
    launchShipFromPad,
    resetMatch,
  }
}
