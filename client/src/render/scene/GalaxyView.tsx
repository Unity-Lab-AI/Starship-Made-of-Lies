import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  type CivId,
  type ColonyShipFlight,
  type Galaxy,
  type Planet,
  type PlanetId,
  type ShipBeaconBroadcast,
  type Theme,
  type Tile,
} from '@smol/shared'
import {
  applyCameraTransform,
  attachCameraController,
  bindCameraInputs,
  newCamera,
  tickCameraFromInput,
} from './cameraController'
import {
  type IndigenousMarkerInput,
  type PlanetCivPresence,
  buildBeaconPulseLayer,
  buildFlightArcLayer,
  buildGalaxyLayer,
  buildLastHopeAlarmLayer,
  buildMiningShipLayer,
  buildOwnerFlagLayer,
  buildRangeOverlayLayer,
  syncBeaconPulses,
  syncFlightArcs,
  syncLastHopeAlarms,
  syncMiningShips,
  syncOwnerFlags,
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
  readonly onSurfaceTileClick?: (planetId: PlanetId, tile: Tile) => void
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
}

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
}: GalaxyViewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [hoveredPlanetId, setHoveredPlanetId] = useState<PlanetId | null>(null)
  const [rangeOverlayVisible, setRangeOverlayVisible] = useState(false)
  const activeFlightsRef = useRef(activeFlights)
  const alertedPlanetIdsRef = useRef(alertedPlanetIds)
  const ownerByPlanetRef = useRef(ownerByPlanet)
  const themeByCivRef = useRef(themeByCiv)
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
  activeFlightsRef.current = activeFlights
  alertedPlanetIdsRef.current = alertedPlanetIds
  ownerByPlanetRef.current = ownerByPlanet
  themeByCivRef.current = themeByCiv
  rangeVisibleRef.current = rangeOverlayVisible
  onSurfaceTileClickRef.current = onSurfaceTileClick
  miningBeaconsRef.current = miningBeacons ?? []
  civsByPlanetRef.current = civsByPlanet
  indigenousByPlanetRef.current = indigenousByPlanet ?? []
  lastHopeTriggeredRef.current = lastHopeTriggeredPlanetIds ?? new Set()
  void humanCivId

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x05050d, 1)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const cameraState = newCamera(mount.clientWidth / mount.clientHeight)
    cameraState.zoomT = 0.78
    scene.add(cameraState.camera)
    const galaxyHandle = buildGalaxyLayer(galaxy)
    scene.add(galaxyHandle.group)

    // Frame camera on home planet
    const homeMesh = galaxyHandle.planetMeshes.get(homePlanetId)
    if (homeMesh) {
      cameraState.target.copy(homeMesh.position)
    }
    applyCameraTransform(cameraState)

    // Ring meshes for ownership
    const ringMaterials = new Map<PlanetId, THREE.Mesh>()
    for (const [id, mesh] of galaxyHandle.planetMeshes) {
      if (!ownedPlanetIds.has(id)) continue
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(
          mesh.geometry.boundingSphere?.radius ?? 80,
          (mesh.geometry.boundingSphere?.radius ?? 80) + 12,
          32,
        ),
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
      ringMaterials.set(id, ring)
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

      // Try surface tile pick first
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
              onSurfaceTileClickRef.current(match.planet.id, tile)
              return
            }
          }
        }
      }

      // Fall through to planet-mesh pick (galactic-scale planet click → tween-to-planet)
      const planetObjs = Array.from(galaxyHandle.planetMeshes.values())
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
          onComplete: () => onSelectPlanet(id),
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

      // Sync mining ship meshes (PHASE 16.x complete-3D-world-space)
      syncMiningShips(miningShipHandle, miningBeaconsRef.current)

      // Sync LAST HOPE alarm halos (PHASE 16.17)
      syncLastHopeAlarms(
        lastHopeAlarmHandle,
        lastHopeTriggeredRef.current,
        galaxyHandle.planetMeshes,
        cameraState.camera,
      )

      // Range overlay visibility
      rangeOverlayHandle.setVisible(rangeVisibleRef.current)

      // Surface layer visibility — show tiles when camera close to each planet
      const camPos = cameraState.camera.position
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
          if (handle) handle.setVisibleAtDistance(dist, planet.surfaceRadius)
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
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.domElement.removeEventListener('mousemove', onMouseMoveForHover)
      controller.destroy()
      flightArcHandle.destroy()
      beaconPulseHandle.destroy()
      ownerFlagHandle.destroy()
      miningShipHandle.destroy()
      lastHopeAlarmHandle.destroy()
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
  }, [galaxy, homePlanetId, onSelectPlanet, ownedPlanetIds])

  const hoveredPlanet: Planet | null = hoveredPlanetId
    ? (galaxy.planets.find((p) => p.id === hoveredPlanetId) ?? null)
    : null

  // PHASE 16.13.9: GalaxyView is the always-on /play canvas (not a modal dialog). Modal chrome
  // (header / close button / role="dialog") removed — HUDOverlay sits on top as the chrome layer.
  return (
    <div className="galaxy-view galaxy-view--canvas" aria-label="3D galaxy canvas">
      <div ref={mountRef} className="galaxy-view__canvas" />
      <aside className="galaxy-view__hint">
        <strong>WASD</strong> move · <strong>QE</strong> rotate · <strong>wheel</strong> zoom ·
        <strong>R</strong> {rangeOverlayVisible ? 'hide' : 'show'} range rings ·
        <strong> click</strong> a planet to fly there
      </aside>
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
