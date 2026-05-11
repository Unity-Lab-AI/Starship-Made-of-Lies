import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  type CivId,
  type ColonyShipFlight,
  type Galaxy,
  type Planet,
  type PlanetId,
  type Theme,
} from '@smol/shared'
import {
  applyCameraTransform,
  attachCameraController,
  bindCameraInputs,
  newCamera,
  tickCameraFromInput,
} from './cameraController'
import {
  buildBeaconPulseLayer,
  buildFlightArcLayer,
  buildGalaxyLayer,
  buildOwnerFlagLayer,
  buildRangeOverlayLayer,
  syncBeaconPulses,
  syncFlightArcs,
  syncOwnerFlags,
} from './galaxyLayer'
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
  readonly onClose: () => void
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
  onClose,
}: GalaxyViewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [hoveredPlanetId, setHoveredPlanetId] = useState<PlanetId | null>(null)
  const [rangeOverlayVisible, setRangeOverlayVisible] = useState(false)
  const activeFlightsRef = useRef(activeFlights)
  const alertedPlanetIdsRef = useRef(alertedPlanetIds)
  const ownerByPlanetRef = useRef(ownerByPlanet)
  const themeByCivRef = useRef(themeByCiv)
  const rangeVisibleRef = useRef(rangeOverlayVisible)
  activeFlightsRef.current = activeFlights
  alertedPlanetIdsRef.current = alertedPlanetIds
  ownerByPlanetRef.current = ownerByPlanet
  themeByCivRef.current = themeByCiv
  rangeVisibleRef.current = rangeOverlayVisible
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
    const homePlanetMesh = galaxyHandle.planetMeshes.get(homePlanetId)
    const rangeOverlayHandle = buildRangeOverlayLayer(
      homePlanetMesh ? homePlanetMesh.position.clone() : new THREE.Vector3(),
    )
    scene.add(rangeOverlayHandle.group)

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

    const onClick = (e: MouseEvent): void => {
      if (tween) return
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, cameraState.camera)
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

      // Sync owner-civ flag billboards
      syncOwnerFlags(
        ownerFlagHandle,
        galaxy,
        galaxyHandle.planetMeshes,
        ownerByPlanetRef.current,
        themeByCivRef.current,
      )

      // Range overlay visibility
      rangeOverlayHandle.setVisible(rangeVisibleRef.current)

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
      rangeOverlayHandle.destroy()
      galaxyHandle.destroy()
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

  return (
    <div className="galaxy-view" role="dialog" aria-label="Galaxy view">
      <div ref={mountRef} className="galaxy-view__canvas" />
      <header className="galaxy-view__header">
        <h2>🌌 Galaxy — {galaxy.planets.length} planets</h2>
        <button
          type="button"
          className="galaxy-view__close"
          onClick={onClose}
          title="Close galaxy view (ESC)"
        >
          ✕ Close
        </button>
      </header>
      <aside className="galaxy-view__hint">
        <strong>WASD</strong> pan · <strong>QE</strong> rotate · <strong>wheel</strong> zoom ·
        <strong>R</strong> {rangeOverlayVisible ? 'hide' : 'show'} range rings ·
        <strong> click</strong> a planet to view
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
