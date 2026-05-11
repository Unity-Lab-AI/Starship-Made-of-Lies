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
  type ThemeId,
  type Tile,
  COLONY_SHIPS,
  THEMES,
  accountId as accountIdValue,
  aggregateEffects,
  getActiveShipBeacons,
  newAnonymousAccount,
  themeAsCSSVars,
} from '@smol/shared'
import { type MatchAISlotConfig, type MatchConfig } from '../../match/MatchSim'
import { useMatchSim } from '../../match/useMatchSim'
import { AIPlayerPanel, type AIPlayerSnapshot } from '../panels/AIPlayerPanel'
import { BeaconPanel } from '../panels/BeaconPanel'
import { CommandPadPanel } from '../panels/CommandPadPanel'
import { MiningFleetPanel } from '../panels/MiningFleetPanel'
import { ColonyShipFlightPanel } from '../panels/ColonyShipFlightPanel'
import { DeceptionPanel } from '../panels/DeceptionPanel'
import { IndigenousPanel } from '../panels/IndigenousPanel'
import { LastHopePanel } from '../panels/LastHopePanel'
import { LootDropPanel } from '../panels/LootDropPanel'
import { ResourcesPanel } from '../panels/ResourcesPanel'
import { ShipBuildPanel } from '../panels/ShipBuildPanel'
import { TechTreePanel } from '../panels/TechTreePanel'
import { TilePlacementGrid } from '../panels/TilePlacementGrid'
import { GalaxyView } from '../../render/scene/GalaxyView'
import { BuildPicker } from '../play/BuildPicker'
import { CampaignPicker } from '../play/CampaignPicker'
import { HUDOverlay } from '../play/HUDOverlay'
import { PanelFrame } from '../play/PanelFrame'
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
}

const DEFAULT_OBJECTIVES: ReadonlyArray<MissionObjectiveConfig> = [
  { id: 'last_civ_standing', target: 1 },
  { id: 'apex_tech', target: 1 },
]

const TOAST_LIFETIME_MS = 3500
const TOAST_PURGE_INTERVAL_MS = 500

export function PlayPage() {
  const location = useLocation() as { state?: MatchSetupHint }
  const navigate = useNavigate()

  const initialConfig = useMemo<MatchConfig>(() => {
    const hint = location.state ?? null
    const seed = hint?.seed ?? Math.floor(Math.random() * 0xffffff)
    const aiCount = hint?.aiCount ?? 3
    const planetCount = hint?.planetCount ?? 30
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
    }
    return aiSlots ? { ...base, aiSlots } : base
  }, [location.state])

  const sim = useMatchSim(initialConfig)

  // === Panel + mode state ===
  const [openPanels, setOpenPanels] = useState<Set<PanelId>>(() => new Set())
  const [buildMode, setBuildMode] = useState<BuildingDefId | null>(null)
  const [selectedPlanetId, setSelectedPlanetId] = useState<PlanetId | null>(null)
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const lastSeenEventIdxRef = useRef(0)

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
  const civsByPlanet = useMemo(
    () => {
      const out = new Map<
        PlanetId,
        ReadonlyArray<{ civId: import('@smol/shared').CivId; tileCount: number }>
      >()
      for (const planetState of sim.state.planets.values()) {
        const counts = new Map<import('@smol/shared').CivId, number>()
        for (const tile of planetState.planet.tiles) {
          if (!tile.ownerCivId) continue
          counts.set(tile.ownerCivId, (counts.get(tile.ownerCivId) ?? 0) + 1)
        }
        if (counts.size === 0) continue
        const sorted = [...counts.entries()]
          .map(([civId, tileCount]) => ({ civId, tileCount }))
          .sort((a, b) => b.tileCount - a.tileCount)
        out.set(planetState.planet.id, sorted)
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

  // Empire-wide totals for the telemetry rack POWER slot. sim.state is a stable ref via
  // useRef; currentTick is the primitive that increments each tick, so it's the re-memo
  // trigger. eslint-disable below since the dep IS intentional re-memo signal.
  const empireTotals = useMemo(
    () => {
      let resources = 0
      let pop = 0
      for (const planetState of sim.state.planets.values()) {
        if (planetState.civId !== sim.state.humanCivId) continue
        for (const amount of planetState.inventory.stocks.values()) resources += amount
        for (const count of Object.values(planetState.population.tierCounts)) {
          pop += count as number
        }
      }
      return { resources, pop }
    },
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

  // === Toast lifecycle: auto-purge expired ===
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setToasts((current) => current.filter((t) => t.expiresAtMs > now))
    }, TOAST_PURGE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // === Surface ❌ build-fail events as toasts ===
  useEffect(() => {
    const events = sim.state.events
    if (events.length === lastSeenEventIdxRef.current) return
    const newEvents = events.slice(lastSeenEventIdxRef.current)
    lastSeenEventIdxRef.current = events.length
    const newToasts: ToastNotification[] = []
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
  const handleSurfaceTileClick = useCallback(
    (planetId: PlanetId, tile: Tile): void => {
      if (!buildMode) return
      if (tile.occupancy !== 'empty') return
      sim.placeBuilding({
        planetId,
        tileId: tile.id,
        defId: buildMode,
      })
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

  const handleLaunchShip = (targetPlanetIdStr: string): void => {
    if (!firstPad) return
    sim.launchShipFromPad({
      padId: firstPad.id,
      targetPlanetId: targetPlanetIdStr as unknown as PlanetId,
    })
  }

  const dismissToast = (id: string): void => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }

  // === Keyboard shortcuts ===
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.target instanceof HTMLSelectElement) return
      const k = e.key.toLowerCase()
      if (e.key === 'Escape') {
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
      else if (k === ' ') {
        e.preventDefault()
        sim.togglePause()
      } else if (k === '1') sim.setSpeed(1)
      else if (k === '2') sim.setSpeed(2)
      else if (k === '3') sim.setSpeed(4)
      else if (k === '4') sim.setSpeed(8)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openPanels, buildMode, sim, togglePanel, closePanel, handleCancelBuildMode])

  if (sim.state.phase === 'ENDED') {
    return (
      <MatchEndScreen
        match={sim.state}
        onPlayAgain={(themeId) => handleResetTo(themeId)}
        onGoHome={() => navigate('/')}
      />
    )
  }

  return (
    <div
      className={`play-shell ${buildMode ? 'play-shell--build-mode' : ''}`}
      style={styleVars as React.CSSProperties}
    >
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
            ownedPlanetIds={new Set(ownedPlanets.map((p) => p.planet.id))}
            homePlanetId={humanCivState.homePlanetId}
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
              new Map([...sim.state.planets.values()].map((p) => [p.planet.id, p.civId] as const))
            }
            themeByCiv={
              new Map([...sim.state.civs.values()].map((c) => [c.civId, c.theme] as const))
            }
            onSelectPlanet={handleSelectPlanet}
            onSurfaceTileClick={handleSurfaceTileClick}
            miningBeacons={allHumanBeacons}
            civsByPlanet={civsByPlanet}
            indigenousByPlanet={indigenousByPlanet}
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
      />

      <Toasts toasts={toasts} onDismiss={dismissToast} />

      <TelemetryRack
        activePads={activePads}
        miningBeacons={allHumanBeacons}
        activeFlights={[...sim.state.flights.values()]}
        resourceTotals={empireTotals.resources}
        populationTotal={empireTotals.pop}
        empireTechs={humanCivState.empire.researchedTechs.size}
        currentTick={sim.state.currentTick}
      />

      {/* === Picker popups (centered) === */}
      {openPanels.has('build') && (
        <BuildPicker
          empire={humanCivState.empire}
          inventory={activePlanet.inventory}
          onSelect={handleSelectBuilding}
          onClose={() => closePanel('build')}
          currentBuildMode={buildMode}
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
          title="Tech Tree"
          emoji="🧬"
          onClose={() => closePanel('tech')}
          variant="centered"
          width={920}
        >
          <TechTreePanel empire={humanCivState.empire} />
        </PanelFrame>
      )}

      {openPanels.has('deception') && (
        <PanelFrame
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
          title="Indigenous"
          emoji="🪶"
          onClose={() => closePanel('indigenous')}
          variant="docked-left"
        >
          <IndigenousPanel indig={indigenousOnActivePlanet} />
        </PanelFrame>
      )}

      {openPanels.has('loot') && (
        <PanelFrame
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
          />
        </PanelFrame>
      )}

      {openPanels.has('ai') && (
        <PanelFrame
          title="AI Players"
          emoji="🤖"
          onClose={() => closePanel('ai')}
          variant="docked-right"
        >
          <AIPlayerPanel snapshots={aiSnapshots} />
        </PanelFrame>
      )}

      {openPanels.has('events') && (
        <PanelFrame
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
                  <span className="event-log__tick">[t{ev.atTick}]</span> <span>{ev.message}</span>
                </li>
              ))}
          </ul>
        </PanelFrame>
      )}
    </div>
  )
}
