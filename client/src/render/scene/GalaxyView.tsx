import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  type BuildingDefId,
  type CivId,
  type ColonyShipFlight,
  type Galaxy,
  type Planet,
  type PlanetId,
  type ShipBeaconBroadcast,
  type Theme,
  type Tile,
  type TileId,
} from '@smol/shared'
import {
  applyCameraTransform,
  attachCameraController,
  bindCameraInputs,
  newCamera,
  tickCameraFromInput,
} from './cameraController'
import {
  type DetonationFlashInput,
  type IndigenousMarkerInput,
  type PadStateGlowInput,
  type PlanetCivPresence,
  buildBeaconPulseLayer,
  buildDetonationFlashLayer,
  buildFlightArcLayer,
  buildGalaxyLayer,
  buildLastHopeAlarmLayer,
  buildMineFieldLayer,
  buildMiningShipLayer,
  buildOwnerFlagLayer,
  buildPadMeshLayer,
  buildPadStateGlowLayer,
  buildRangeOverlayLayer,
  syncBeaconPulses,
  syncDetonationFlashes,
  syncFlightArcs,
  syncLastHopeAlarms,
  syncMineFields,
  syncMiningShips,
  syncOwnerFlags,
  updateOwnerFlagDistanceFade,
  syncPadMeshes,
  syncPadStateGlows,
  type MineFieldInput,
} from './galaxyLayer'
import { buildSurfaceLayer, type SurfaceLayerHandle } from './surfaceLayer'
import './scene.css'

function civColorFromId(civId: string): number {
  let h = 0
  for (let i = 0; i < civId.length; i++) h = (h * 31 + civId.charCodeAt(i)) >>> 0
  const hue = (h % 360) / 360
  const color = new THREE.Color()
  color.setHSL(hue, 0.65, 0.6)
  return color.getHex()
}

interface GalaxyViewProps {
  readonly galaxy: Galaxy
  readonly humanCivId: string
  readonly ownedPlanetIds: ReadonlySet<PlanetId>
  readonly homePlanetId: PlanetId
  readonly activeFlights: ReadonlyArray<ColonyShipFlight>
  readonly alertedPlanetIds: ReadonlySet<PlanetId>
  readonly ownerByPlanet: ReadonlyMap<PlanetId, CivId>
  readonly themeByCiv: ReadonlyMap<CivId, Theme>
  readonly onSelectPlanet: (id: PlanetId) => void
  // PHASE 16.5.6 + 16.13.10: when zoomed close enough that a planet's surface InstancedMesh is
  // visible, clicking a tile fires this with the tile's parent planet + the picked Tile object.
  // The parent decides what to do (place a building when buildMode active, inspect otherwise).
  //
  // PHASE 17.L.D.8 (HOTFIX 2026-05-11) — added `shiftHeld` modifier. When true, the parent
  // keeps buildMode set after placement so the player can chain-place multiple of the same
  // building without re-opening the picker. Per user verbatim *"IT WHOULD ALOW SHIFT CLICK
  // TO BUILD MULTIPLE WITHOUT HAVING TO RECLICK BUILD THENM THE BUILDING WISHED TO BE PLACED"*.
  readonly onSurfaceTileClick?: (planetId: PlanetId, tile: Tile, shiftHeld: boolean) => void
  // PHASE 16.x complete-3D-world-space: ship-beacon broadcasts (mining + future ship types)
  // for live in-scene rendering. Each beacon spawns / updates a 3D ship mesh at its
  // worldPosition. Pass empty array to disable.
  readonly miningBeacons?: ReadonlyArray<ShipBeaconBroadcast>
  // PHASE 16.16 LAW #0 feedback_planets_green_big_multi_civ.md: per-planet civ presence
  // (multiple civs holding tiles → stacked flag billboards). When omitted/empty, falls
  // back to the ownerByPlanet single-flag behavior.
  readonly civsByPlanet?: ReadonlyMap<PlanetId, ReadonlyArray<PlanetCivPresence>>
  // PHASE 16.16: explicit indigenous-civ marker per planet hosting an active indig presence.
  readonly indigenousByPlanet?: ReadonlyArray<IndigenousMarkerInput>
  // PHASE 16.17: planet IDs where the owning civ has triggered LAST_HOPE_EVAC. Each gets
  // a pulsing orange alarm halo at galactic scale so the player sees civ-near-collapse.
  readonly lastHopeTriggeredPlanetIds?: ReadonlySet<PlanetId>
  // PHASE 16.19: per-launch-pad state glow inputs. Each entry produces a colored ring
  // around that pad's surface tile colored by pad.state (READY=green, ARM=red, LAUNCH=
  // white flash, etc.). Visible when zoomed close enough to see the surface.
  readonly padStateGlows?: ReadonlyArray<PadStateGlowInput>
  // PHASE 16.22: server-authoritative mine fields per UMS spec. Each entry renders a 💣
  // billboard at the mine's world position with size keyed to detonationRadius. Visible
  // any zoom; fades as remainingDetonations depletes.
  readonly mineFields?: ReadonlyArray<MineFieldInput>
  // PHASE 16.23: clicked in-flight cone fires this with the flight's id. Parent shows
  // FlightDetailPanel with per-ship make-up (crew / supplies / fuel / water / speed /
  // task / phase / ETA / signal-lost) per UMS UnityMissile.cs UNITY_MSL broadcast spec.
  readonly onSelectFlight?: (flightId: string) => void
  // PHASE 16.24 (deferred completion): structured detonation events from MatchSim's
  // applyDetonationAoE. Each entry spawns an expanding flash sphere at worldPosition that
  // animates over ~1.5s wall-clock and fades. Pass empty array (or omit) to disable.
  readonly detonations?: ReadonlyArray<DetonationFlashInput>
  // PHASE 16.31: god-control redirect. When non-null, the next right-click on a planet
  // (in the 3D canvas) fires this with the planet id. PlayPage wires it through to
  // sim.redirectFlight(redirectModeFlightId, planetId). Default browser context menu is
  // suppressed on canvas while in redirect mode.
  readonly onContextMenuPlanet?: (planetId: PlanetId) => void
  // PHASE 17.A.5 — fog of war HIDE planets entirely. PHASE 16.38 fog only hid civ flags;
  // undiscovered planet meshes still rendered. User verbatim "i shouldnt be able to see
  // beyond my own planet when i start until i get starships to explor". When this Set is
  // supplied, planet meshes + atmosphere halos for ids NOT in the set hide (mesh.visible=false).
  // Home planet must be in the set at match start. Defender discovery + launch discovery
  // already wired in PHASE 16.38 / 17.PRE — they add to this set as the player explores.
  readonly humanDiscoveredPlanetIds?: ReadonlySet<PlanetId>
  // PHASE 17.L.D.9 (HOTFIX 2026-05-11) — per-planet buildings-by-tile index for surface
  // rendering. syncBuildings reads each entry to look up the per-building emoji from
  // BUILDING_DEFS. Per user verbatim *"YEAH THER IS NO CORRECT EMOJI ICON FOR THE BUILDING
  // PLACED APPERARING ON THE PLANETS WHEN PALCING BUILDINGS"*. When omitted, falls back to
  // generic 🏗 placeholder.
  readonly buildingsByPlanet?: ReadonlyMap<PlanetId, ReadonlyMap<TileId, BuildingDefId>>
}

// PHASE 17.PRE.4 — persistent camera state across GalaxyView re-mounts. Keyed by Galaxy
// reference so a brand-new match (different galaxy) starts fresh, but legitimate re-mounts
// of the same galaxy (e.g. ownership-membership change after a capture) restore the last
// known camera position/zoom/rotation instead of jumping back to defaults.
const persistedCameraState = new WeakMap<
  Galaxy,
  { zoomT: number; targetX: number; targetY: number; targetZ: number; yaw: number; pitch: number }
>()

export function GalaxyView({
  galaxy,
  humanCivId,
  ownedPlanetIds,
  homePlanetId,
  activeFlights,
  alertedPlanetIds,
  ownerByPlanet,
  themeByCiv,
  onSelectPlanet,
  onSurfaceTileClick,
  miningBeacons,
  civsByPlanet,
  indigenousByPlanet,
  lastHopeTriggeredPlanetIds,
  padStateGlows,
  mineFields,
  onSelectFlight,
  detonations,
  onContextMenuPlanet,
  humanDiscoveredPlanetIds,
  buildingsByPlanet,
}: GalaxyViewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [hoveredPlanetId, setHoveredPlanetId] = useState<PlanetId | null>(null)
  const [rangeOverlayVisible, setRangeOverlayVisible] = useState(false)
  const activeFlightsRef = useRef(activeFlights)
  const alertedPlanetIdsRef = useRef(alertedPlanetIds)
  const ownerByPlanetRef = useRef(ownerByPlanet)
  const themeByCivRef = useRef(themeByCiv)
  const ownedPlanetIdsRef = useRef(ownedPlanetIds)
  const onSelectPlanetRef = useRef(onSelectPlanet)
  const humanDiscoveredPlanetIdsRef = useRef<ReadonlySet<PlanetId> | undefined>(
    humanDiscoveredPlanetIds,
  )
  // PHASE 17.L.D.9 — live ref so syncBuildings in the RAF loop reads the freshest map.
  const buildingsByPlanetRef = useRef<
    ReadonlyMap<PlanetId, ReadonlyMap<TileId, BuildingDefId>> | undefined
  >(buildingsByPlanet)
  const rangeVisibleRef = useRef(rangeOverlayVisible)
  const onSurfaceTileClickRef = useRef(onSurfaceTileClick)
  const miningBeaconsRef = useRef<ReadonlyArray<ShipBeaconBroadcast>>(miningBeacons ?? [])
  const civsByPlanetRef = useRef<
    ReadonlyMap<PlanetId, ReadonlyArray<PlanetCivPresence>> | undefined
  >(civsByPlanet)
  const indigenousByPlanetRef = useRef<ReadonlyArray<IndigenousMarkerInput>>(
    indigenousByPlanet ?? [],
  )
  const lastHopeTriggeredRef = useRef<ReadonlySet<PlanetId>>(
    lastHopeTriggeredPlanetIds ?? new Set(),
  )
  const padStateGlowsRef = useRef<ReadonlyArray<PadStateGlowInput>>(padStateGlows ?? [])
  const mineFieldsRef = useRef<ReadonlyArray<MineFieldInput>>(mineFields ?? [])
  const onSelectFlightRef = useRef(onSelectFlight)
  const detonationsRef = useRef<ReadonlyArray<DetonationFlashInput>>(detonations ?? [])
  const onContextMenuPlanetRef = useRef(onContextMenuPlanet)
  activeFlightsRef.current = activeFlights
  alertedPlanetIdsRef.current = alertedPlanetIds
  ownerByPlanetRef.current = ownerByPlanet
  themeByCivRef.current = themeByCiv
  ownedPlanetIdsRef.current = ownedPlanetIds
  onSelectPlanetRef.current = onSelectPlanet
  rangeVisibleRef.current = rangeOverlayVisible
  onSurfaceTileClickRef.current = onSurfaceTileClick
  humanDiscoveredPlanetIdsRef.current = humanDiscoveredPlanetIds
  buildingsByPlanetRef.current = buildingsByPlanet
  miningBeaconsRef.current = miningBeacons ?? []
  civsByPlanetRef.current = civsByPlanet
  indigenousByPlanetRef.current = indigenousByPlanet ?? []
  lastHopeTriggeredRef.current = lastHopeTriggeredPlanetIds ?? new Set()
  padStateGlowsRef.current = padStateGlows ?? []
  mineFieldsRef.current = mineFields ?? []
  onSelectFlightRef.current = onSelectFlight
  detonationsRef.current = detonations ?? []
  onContextMenuPlanetRef.current = onContextMenuPlanet
  void humanCivId

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    // Super-review fix: logarithmicDepthBuffer enabled. Galaxy spans 1.8 → 250000 world
    // units (planet surface zoom → galactic far plane). At 24-bit linear depth that ratio
    // produces severe Z-fighting at far distances. Log depth distributes precision
    // logarithmically so meshes resolve correctly across all 6+ orders of magnitude.
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x05050d, 1)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    // PHASE 17.L.D.1 (HOTFIX 2026-05-11) — thread galaxy.universeHalfExtent so camera max
    // distance + far-plane scale with the actual galaxy size. Tiny galaxies don't open
    // zoomed-out beyond the cluster; Large galaxies can still frame the whole thing.
    const cameraState = newCamera(mount.clientWidth / mount.clientHeight, galaxy.universeHalfExtent)
    // PHASE 17.L.D.2 (HOTFIX 2026-05-11) — initial zoom bumped 0.78 -> 1.0 so first-mount
    // view frames the WHOLE cluster from outside instead of dropping into the middle of
    // the galaxy. Per user verbatim *"i p[ricked a 100 p[lanet map and there is only 3
    // star with about 5 splanets each around each star"* — at the old 0.78 default, only
    // ~35% of a Small (14-star) cluster fit in the view frustum. zoomT=1.0 frames the
    // entire universe; player zooms IN (wheel) to focus on home system.
    cameraState.zoomT = 1.0
    scene.add(cameraState.camera)
    const galaxyHandle = buildGalaxyLayer(galaxy)
    scene.add(galaxyHandle.group)

    // PHASE 17.PRE.4 — restore persisted camera state if this Galaxy was previously mounted.
    // Fall back to home-planet framing on first mount of a given galaxy.
    const persisted = persistedCameraState.get(galaxy)
    if (persisted) {
      cameraState.zoomT = persisted.zoomT
      cameraState.target.set(persisted.targetX, persisted.targetY, persisted.targetZ)
      cameraState.yaw = persisted.yaw
      cameraState.pitch = persisted.pitch
    } else {
      const homeMesh = galaxyHandle.planetMeshes.get(homePlanetId)
      if (homeMesh) {
        cameraState.target.copy(homeMesh.position)
      }
    }
    applyCameraTransform(cameraState)

    // PHASE 17.PRE.1 — ownership rings are now reconciled per-frame against `ownedPlanetIdsRef`
    // so that ownership changes (planet captures) don't tear down the scene. The initial pass
    // populates whatever the player already owns on mount; the RAF loop adds/removes meshes as
    // membership shifts.
    const ringMaterials = new Map<PlanetId, THREE.Mesh>()
    const buildRingForPlanet = (id: PlanetId, mesh: THREE.Mesh): THREE.Mesh => {
      const r = mesh.geometry.boundingSphere?.radius ?? 80
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 12, 32),
        new THREE.MeshBasicMaterial({
          color: 0xd4a13a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
        }),
      )
      ring.position.copy(mesh.position)
      ring.userData = { kind: 'owned-ring', planetId: id }
      scene.add(ring)
      return ring
    }
    for (const [id, mesh] of galaxyHandle.planetMeshes) {
      if (!ownedPlanetIdsRef.current.has(id)) continue
      ringMaterials.set(id, buildRingForPlanet(id, mesh))
    }

    // Build the additional layers
    const flightArcHandle = buildFlightArcLayer(galaxyHandle.galaxyCenter)
    scene.add(flightArcHandle.group)
    const beaconPulseHandle = buildBeaconPulseLayer()
    scene.add(beaconPulseHandle.group)
    const ownerFlagHandle = buildOwnerFlagLayer()
    scene.add(ownerFlagHandle.group)
    const miningShipHandle = buildMiningShipLayer()
    scene.add(miningShipHandle.group)
    const lastHopeAlarmHandle = buildLastHopeAlarmLayer()
    scene.add(lastHopeAlarmHandle.group)
    const padStateGlowHandle = buildPadStateGlowLayer()
    scene.add(padStateGlowHandle.group)
    const padMeshHandle = buildPadMeshLayer()
    scene.add(padMeshHandle.group)
    const mineFieldHandle = buildMineFieldLayer()
    scene.add(mineFieldHandle.group)
    const detonationFlashHandle = buildDetonationFlashLayer()
    scene.add(detonationFlashHandle.group)
    const homePlanetMesh = galaxyHandle.planetMeshes.get(homePlanetId)
    const rangeOverlayHandle = buildRangeOverlayLayer(
      homePlanetMesh ? homePlanetMesh.position.clone() : new THREE.Vector3(),
    )
    scene.add(rangeOverlayHandle.group)

    // Build surface layers per planet (lazy on demand to save init cost)
    const surfaceLayers = new Map<PlanetId, SurfaceLayerHandle>()
    const ensureSurfaceLayer = (planet: Planet): SurfaceLayerHandle | null => {
      const existing = surfaceLayers.get(planet.id)
      if (existing) return existing
      const planetMesh = galaxyHandle.planetMeshes.get(planet.id)
      if (!planetMesh) return null
      const handle = buildSurfaceLayer(planet)
      planetMesh.add(handle.group)
      surfaceLayers.set(planet.id, handle)
      handle.syncBuildings(planet.tiles)
      return handle
    }

    const controller = attachCameraController(renderer.domElement, cameraState)
    bindCameraInputs(controller)

    // Raycast pick
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let pickedPlanetId: PlanetId | null = null

    // Tween state for click-to-zoom
    let tween: {
      startPos: THREE.Vector3
      targetPos: THREE.Vector3
      startZoomT: number
      targetZoomT: number
      startedAt: number
      durationMs: number
      onComplete: () => void
    } | null = null

    // Surface raycast takes priority when any planet's surface layer is visible (camera close to
    // planet). PHASE 16.5.6 + 16.13.10: click a surface tile → onSurfaceTileClick(planetId, tile).
    const collectVisibleSurfaceMeshes = (): Array<{
      mesh: THREE.InstancedMesh
      planet: Planet
    }> => {
      const out: Array<{ mesh: THREE.InstancedMesh; planet: Planet }> = []
      for (const planet of galaxy.planets) {
        const handle = surfaceLayers.get(planet.id)
        if (handle && handle.group.visible) out.push({ mesh: handle.tilesMesh, planet })
      }
      return out
    }

    const onClick = (e: MouseEvent): void => {
      if (tween) return
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, cameraState.camera)

      // PHASE 16.23: in-flight ship cone selection. Try flight pick FIRST so a click on a
      // visible flight cone opens the FlightDetailPanel before falling through to surface /
      // planet picks. Per user verbatim "ships should be selectable" + UMS UnityMissile.cs
      // UNITY_MSL broadcast spec.
      const flightCones: THREE.Object3D[] = []
      for (const entry of flightArcHandle.entries.values()) flightCones.push(entry.progressDot)
      if (flightCones.length > 0) {
        const flightHits = raycaster.intersectObjects(flightCones, false)
        const fHit = flightHits[0]
        if (
          fHit?.object instanceof THREE.Mesh &&
          fHit.object.userData.kind === 'flight' &&
          onSelectFlightRef.current
        ) {
          const fid = fHit.object.userData.flightId as string
          onSelectFlightRef.current(fid)
          return
        }
      }

      // Try surface tile pick next
      const surfaceMeshes = collectVisibleSurfaceMeshes()
      if (surfaceMeshes.length > 0) {
        const surfaceHits = raycaster.intersectObjects(
          surfaceMeshes.map((s) => s.mesh),
          false,
        )
        const sHit = surfaceHits[0]
        if (sHit && typeof sHit.instanceId === 'number') {
          const match = surfaceMeshes.find((s) => s.mesh === sHit.object)
          if (match) {
            const tile = match.planet.tiles[sHit.instanceId]
            if (tile && onSurfaceTileClickRef.current) {
              // PHASE 17.L.D.8 — pass shift-modifier so PlayPage can decide whether to keep
              // buildMode set for chain placement or clear it after a single place.
              onSurfaceTileClickRef.current(match.planet.id, tile, e.shiftKey)
              return
            }
          }
        }
      }

      // Fall through to planet-mesh pick (galactic-scale planet click → tween-to-planet).
      // PHASE 17.A.5 — fog of war: filter out hidden planet meshes from the raycast set so
      // clicks on undiscovered planets are ignored (they're invisible — the player can't
      // know they're there). Three.js raycaster respects .visible by default but be explicit.
      const planetObjs = Array.from(galaxyHandle.planetMeshes.values()).filter((m) => m.visible)
      const hits = raycaster.intersectObjects(planetObjs, false)
      const hit = hits[0]
      if (hit?.object instanceof THREE.Mesh && hit.object.userData.kind === 'planet') {
        const id = hit.object.userData.planetId as PlanetId
        const targetMesh = hit.object
        tween = {
          startPos: cameraState.target.clone(),
          targetPos: targetMesh.position.clone(),
          startZoomT: cameraState.zoomT,
          targetZoomT: 0.32,
          startedAt: performance.now(),
          durationMs: 1200,
          onComplete: () => onSelectPlanetRef.current(id),
        }
      }
    }
    const onMouseMoveForHover = (e: MouseEvent): void => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, cameraState.camera)

      // Surface hover takes priority — sets the highlight ring on the hovered tile
      const surfaceMeshes = collectVisibleSurfaceMeshes()
      if (surfaceMeshes.length > 0) {
        const surfaceHits = raycaster.intersectObjects(
          surfaceMeshes.map((s) => s.mesh),
          false,
        )
        const sHit = surfaceHits[0]
        for (const sm of surfaceMeshes) {
          const handle = surfaceLayers.get(sm.planet.id)
          if (!handle) continue
          if (sHit && typeof sHit.instanceId === 'number' && sHit.object === sm.mesh) {
            const tile = sm.planet.tiles[sHit.instanceId]
            handle.setHoveredFace(tile ? tile.faceIndex : null)
          } else {
            handle.setHoveredFace(null)
          }
        }
        if (sHit) {
          // Suppress planet-tooltip when hovering surface
          if (pickedPlanetId !== null) {
            pickedPlanetId = null
            setHoveredPlanetId(null)
          }
          return
        }
      }

      // Fall through to planet-mesh hover (galactic-scale planet tooltip)
      const planetObjs = Array.from(galaxyHandle.planetMeshes.values())
      const hits = raycaster.intersectObjects(planetObjs, false)
      const hit = hits[0]
      const id =
        hit?.object instanceof THREE.Mesh && hit.object.userData.kind === 'planet'
          ? (hit.object.userData.planetId as PlanetId)
          : null
      if (id !== pickedPlanetId) {
        pickedPlanetId = id
        setHoveredPlanetId(id)
      }
    }
    renderer.domElement.addEventListener('click', onClick)
    renderer.domElement.addEventListener('mousemove', onMouseMoveForHover)

    // PHASE 16.31 — god-control right-click redirect. Suppress default browser context menu
    // and raycast for a planet pick. When onContextMenuPlanet is set + a planet is hit,
    // fire the callback with the planet id. PlayPage handles the rest.
    const onContextMenu = (e: MouseEvent): void => {
      if (!onContextMenuPlanetRef.current) return
      e.preventDefault()
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, cameraState.camera)
      const planetObjs = Array.from(galaxyHandle.planetMeshes.values())
      const hits = raycaster.intersectObjects(planetObjs, false)
      const hit = hits[0]
      if (hit?.object instanceof THREE.Mesh && hit.object.userData.kind === 'planet') {
        const id = hit.object.userData.planetId as PlanetId
        onContextMenuPlanetRef.current(id)
      }
    }
    renderer.domElement.addEventListener('contextmenu', onContextMenu)

    // R key toggles range overlay
    const onKeyDown = (ev: KeyboardEvent): void => {
      if (ev.key.toLowerCase() === 'r') {
        rangeVisibleRef.current = !rangeVisibleRef.current
        setRangeOverlayVisible(rangeVisibleRef.current)
      }
    }
    window.addEventListener('keydown', onKeyDown)

    // Resize
    const onResize = (): void => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      renderer.setSize(w, h)
      cameraState.camera.aspect = w / h
      cameraState.camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // Build civ color map (cached for the session) — keyed by stringified CivId
    const civColorMap = new Map<string, number>()

    // RAF loop
    let lastT = performance.now()
    let raf = 0
    const tick = (): void => {
      const now = performance.now()
      const dt = Math.min(0.1, (now - lastT) / 1000)
      lastT = now

      // Tween camera if active
      if (tween) {
        const t = Math.min(1, (now - tween.startedAt) / tween.durationMs)
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // ease-in-out
        cameraState.target.lerpVectors(tween.startPos, tween.targetPos, ease)
        cameraState.zoomT = tween.startZoomT + (tween.targetZoomT - tween.startZoomT) * ease
        if (t >= 1) {
          const onDone = tween.onComplete
          tween = null
          onDone()
        }
      } else {
        tickCameraFromInput(cameraState, dt)
      }
      applyCameraTransform(cameraState)

      // PHASE 17.A.5 — fog of war: hide undiscovered planet meshes + atmosphere halos. When
      // humanDiscoveredPlanetIdsRef is undefined, render everything (back-compat). When set,
      // any planet id NOT in the set has its mesh + halo hidden. Home planet is always in the
      // set per newEmpire init. Ring meshes for hidden planets are also hidden via the
      // ownership-reconcile below (an undiscovered planet can't be owned by the human civ).
      const fogSet = humanDiscoveredPlanetIdsRef.current
      if (fogSet) {
        for (const [id, mesh] of galaxyHandle.planetMeshes) {
          const discovered = fogSet.has(id)
          mesh.visible = discovered
          const halo = galaxyHandle.atmosphereMeshes.get(id)
          if (halo) halo.visible = discovered
        }
      }

      // PHASE 17.L.D.4 (HOTFIX 2026-05-11) — screen-space minimum-size scaling for planet
      // meshes. After D.1 bumped the universe to per-galaxy scaling (Small ~155k half-extent,
      // camera distance ~400k+), planets at their 400-1600 world-unit radii were rendering
      // at sub-pixel apparent size = functionally invisible. Per user verbatim *"there are
      // lots of planets they just dont render at distance even with fog of war off"*. Per
      // frame, each planet mesh gets its scale set so the apparent screen radius stays at
      // MIN_APPARENT_RADIUS_PX or larger. Capped at MAX_SCALE_FACTOR so close-zoom rendering
      // stays normal (sphere is naturally bigger than the minimum threshold). Atmosphere
      // halos scale with the same factor so they don't visually detach from the planet.
      {
        const MIN_APPARENT_RADIUS_PX = 10
        const MAX_SCALE_FACTOR = 6
        const canvasHeight = renderer.domElement.clientHeight || 800
        const fovRad = (cameraState.camera.fov * Math.PI) / 180
        const focalPx = canvasHeight / (2 * Math.tan(fovRad / 2))
        const cameraWorldPos = cameraState.camera.position
        for (const [id, mesh] of galaxyHandle.planetMeshes) {
          if (!mesh.visible) {
            mesh.scale.setScalar(1)
            continue
          }
          const baseRadius = mesh.geometry.boundingSphere?.radius ?? 1000
          const camDist = mesh.position.distanceTo(cameraWorldPos)
          const apparentPx = (baseRadius * focalPx) / Math.max(1, camDist)
          let scale = 1
          if (apparentPx < MIN_APPARENT_RADIUS_PX) {
            scale = Math.min(MAX_SCALE_FACTOR, MIN_APPARENT_RADIUS_PX / Math.max(0.1, apparentPx))
          }
          mesh.scale.setScalar(scale)
          const halo = galaxyHandle.atmosphereMeshes.get(id)
          if (halo) halo.scale.setScalar(scale)
        }
      }

      // PHASE 17.PRE.1 — reconcile ownership rings against the live ref. Add rings for newly
      // owned planets (capture), remove rings for planets we lost (defeated / re-captured by
      // enemy). Done in the RAF loop so the scene never tears down on ownership changes.
      const ownedSet = ownedPlanetIdsRef.current
      for (const [id, mesh] of galaxyHandle.planetMeshes) {
        const has = ringMaterials.has(id)
        const owns = ownedSet.has(id)
        if (owns && !has) {
          ringMaterials.set(id, buildRingForPlanet(id, mesh))
        } else if (!owns && has) {
          const ring = ringMaterials.get(id)!
          scene.remove(ring)
          ring.geometry.dispose()
          ;(ring.material as THREE.Material).dispose()
          ringMaterials.delete(id)
        }
      }
      // Pulse owned-planet rings
      const phase = (now / 1000) * 1.5
      for (const ring of ringMaterials.values()) {
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = 0.35 + Math.sin(phase) * 0.15
        ring.lookAt(cameraState.camera.position)
      }

      // Sync flight arcs each tick (cheap)
      for (const flight of activeFlightsRef.current) {
        const civIdStr = String(flight.launchingCivId)
        if (!civColorMap.has(civIdStr)) civColorMap.set(civIdStr, civColorFromId(civIdStr))
      }
      syncFlightArcs(
        flightArcHandle,
        activeFlightsRef.current,
        galaxyHandle.planetMeshes,
        civColorMap,
      )

      // Sync beacon alerts
      syncBeaconPulses(
        beaconPulseHandle,
        alertedPlanetIdsRef.current,
        galaxyHandle.planetMeshes,
        cameraState.camera,
      )

      // Sync owner-civ flag billboards (multi-civ-per-planet stacking + indigenous markers)
      syncOwnerFlags(
        ownerFlagHandle,
        galaxy,
        galaxyHandle.planetMeshes,
        ownerByPlanetRef.current,
        themeByCivRef.current,
        civsByPlanetRef.current,
        indigenousByPlanetRef.current,
      )

      // Super-review fix: per-frame distance-fade + size-normalize for owner flags so the
      // labels are readable in their useful zoom band and don't appear as "very very small
      // text" at galactic zoom or block the view at planet zoom.
      updateOwnerFlagDistanceFade(
        ownerFlagHandle,
        cameraState.camera.position,
        galaxyHandle.planetMeshes,
      )

      // Sync mining ship meshes (PHASE 16.x complete-3D-world-space)
      syncMiningShips(miningShipHandle, miningBeaconsRef.current)

      // Sync LAST HOPE alarm halos (PHASE 16.17)
      syncLastHopeAlarms(
        lastHopeAlarmHandle,
        lastHopeTriggeredRef.current,
        galaxyHandle.planetMeshes,
        cameraState.camera,
      )

      // Sync per-pad state glow rings (PHASE 16.19)
      syncPadStateGlows(padStateGlowHandle, padStateGlowsRef.current, galaxyHandle.planetMeshes)

      // Sync per-pad industrial-visual surface meshes (PHASE 16.30). Same input array as the
      // glow ring; the mesh layer is the actual UnityPad geometry — slab + ship cone scaled
      // by pad state. Glow ring stays as the at-a-glance affordance.
      syncPadMeshes(padMeshHandle, padStateGlowsRef.current, galaxyHandle.planetMeshes)

      // Sync server-authoritative mine-field 💣 billboards (PHASE 16.22)
      syncMineFields(mineFieldHandle, mineFieldsRef.current)

      // Sync 3D detonation flash spheres (PHASE 16.24 deferred completion). Each MatchDetonation
      // emits an expanding sphere that times out on its own ~1.5s wall-clock — sim-side prune
      // just keeps the source list bounded across long matches.
      syncDetonationFlashes(detonationFlashHandle, detonationsRef.current)

      // Range overlay visibility
      rangeOverlayHandle.setVisible(rangeVisibleRef.current)

      // Surface layer visibility — show tiles when camera close to each planet
      const camPos = cameraState.camera.position
      const liveBuildingsByPlanet = buildingsByPlanetRef.current
      for (const planet of galaxy.planets) {
        const mesh = galaxyHandle.planetMeshes.get(planet.id)
        if (!mesh) continue
        const dx = camPos.x - mesh.position.x
        const dy = camPos.y - mesh.position.y
        const dz = camPos.z - mesh.position.z
        const dist = Math.hypot(dx, dy, dz)
        const visibilityThreshold = planet.surfaceRadius * 6
        if (dist < visibilityThreshold) {
          const handle = ensureSurfaceLayer(planet)
          if (handle) {
            handle.setVisibleAtDistance(dist, planet.surfaceRadius)
            // PHASE 17.L.D.9 (HOTFIX 2026-05-11) — re-sync buildings every visible-frame so
            // placements update without a full layer rebuild. Threads the per-planet
            // buildingsByTile map from MatchState so each placed building can resolve its
            // emoji via BUILDING_DEFS lookup. Per user verbatim *"YEAH THER IS NO CORRECT
            // EMOJI ICON FOR THE BUILDING PLACED APPERARING ON THE PLANETS WHEN PALCING
            // BUILDINGS"* — v1 syncBuildings only ran ONCE at mount, so placements never
            // appeared even with the emoji sprite landed in D.9.
            const map = liveBuildingsByPlanet?.get(planet.id)
            handle.syncBuildings(planet.tiles, map)
          }
        } else {
          const existing = surfaceLayers.get(planet.id)
          if (existing) existing.group.visible = false
        }
      }

      renderer.render(scene, cameraState.camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      // PHASE 17.PRE.4 — persist camera state so the next mount of this Galaxy restores it
      // (instead of jumping back to home + zoomT=0.78 defaults).
      persistedCameraState.set(galaxy, {
        zoomT: cameraState.zoomT,
        targetX: cameraState.target.x,
        targetY: cameraState.target.y,
        targetZ: cameraState.target.z,
        yaw: cameraState.yaw,
        pitch: cameraState.pitch,
      })
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.domElement.removeEventListener('mousemove', onMouseMoveForHover)
      renderer.domElement.removeEventListener('contextmenu', onContextMenu)
      controller.destroy()
      flightArcHandle.destroy()
      beaconPulseHandle.destroy()
      ownerFlagHandle.destroy()
      miningShipHandle.destroy()
      lastHopeAlarmHandle.destroy()
      padStateGlowHandle.destroy()
      padMeshHandle.destroy()
      mineFieldHandle.destroy()
      detonationFlashHandle.destroy()
      rangeOverlayHandle.destroy()
      galaxyHandle.destroy()
      for (const surface of surfaceLayers.values()) {
        surface.dispose()
      }
      surfaceLayers.clear()
      for (const ring of ringMaterials.values()) {
        ring.geometry.dispose()
        ;(ring.material as THREE.Material).dispose()
      }
      renderer.dispose()
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
    }
    // PHASE 17.PRE.1 — `ownedPlanetIds` and `onSelectPlanet` deliberately omitted: ownership
    // is reconciled per-frame from `ownedPlanetIdsRef`, and the click handler closes over
    // `onSelectPlanetRef.current` instead of the direct prop. Adding either back to the dep
    // array would re-fire the CRITICAL remount-per-tick bug that PHASE 17.PRE.1 exists to kill.
  }, [galaxy, homePlanetId])

  const hoveredPlanet: Planet | null = hoveredPlanetId
    ? (galaxy.planets.find((p) => p.id === hoveredPlanetId) ?? null)
    : null

  // PHASE 16.13.9: GalaxyView is the always-on /play canvas (not a modal dialog). Modal chrome
  // (header / close button / role="dialog") removed — HUDOverlay sits on top as the chrome layer.
  return (
    <div className="galaxy-view galaxy-view--canvas" aria-label="3D galaxy canvas">
      <div ref={mountRef} className="galaxy-view__canvas" />
      {/* PHASE 17.L.D.3 (HOTFIX 2026-05-11) — galaxy-view__hint movement-controls overlay
         removed per user: "the only thing i see is the movement controls instructions
         that i told you yesterday to remove when u built thew ui hud". Range-rings toggle
         (R key) still works via the keyboard handler below; binding hints live in the
         HUDOverlay panel toggle bar / future keybinds-help panel. */}
      {hoveredPlanet && (
        <div className="galaxy-view__tooltip">
          <div className="galaxy-view__tooltip-emoji">{hoveredPlanet.biome.emoji}</div>
          <div className="galaxy-view__tooltip-name">{String(hoveredPlanet.id)}</div>
          <div className="galaxy-view__tooltip-meta">
            {hoveredPlanet.biome.name} · {hoveredPlanet.tiles.length} tiles
          </div>
          {ownedPlanetIds.has(hoveredPlanet.id) && (
            <div className="galaxy-view__tooltip-owned">YOURS</div>
          )}
        </div>
      )}
    </div>
  )
}
