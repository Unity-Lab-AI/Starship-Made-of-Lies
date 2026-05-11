import * as THREE from 'three'
import {
  type CivId,
  type ColonyShipFlight,
  type Galaxy,
  type Planet,
  type PlanetId,
  type Theme,
  planetRenderRadius,
} from '@smol/shared'

const BIOME_COLORS: Readonly<Record<string, number>> = {
  jungle: 0x3aa860,
  desert: 0xd9a86c,
  arctic: 0xbfdaf2,
  ocean: 0x2a5d8f,
  swamp: 0x5a7048,
  mountain: 0x8a8784,
  volcanic: 0xc44a2a,
  gasGiantMoon: 0xa970d4,
  ringworld: 0xd4c060,
  crystalline: 0x9adfd4,
  lava: 0xff5a2a,
  asteroid: 0x6c6c70,
  default: 0x8a8a92,
}

export interface GalaxyLayerHandle {
  readonly group: THREE.Group
  readonly planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>
  readonly atmosphereMeshes: ReadonlyMap<PlanetId, THREE.Mesh>
  readonly galaxyCenter: THREE.Vector3
  readonly destroy: () => void
}

export function buildGalaxyLayer(galaxy: Galaxy): GalaxyLayerHandle {
  const group = new THREE.Group()
  const planetMeshes = new Map<PlanetId, THREE.Mesh>()
  const atmosphereMeshes = new Map<PlanetId, THREE.Mesh>()

  // Starfield background
  const starfield = makeStarfield(galaxy.seed ?? 12345)
  group.add(starfield)

  // Center the galaxy on its mean position
  const center = computeGalaxyCenter(galaxy.planets)
  for (const planet of galaxy.planets) {
    const mesh = makePlanetMesh(planet, center)
    group.add(mesh)
    planetMeshes.set(planet.id, mesh)
    const halo = makeAtmosphereGlow(planet, center)
    group.add(halo)
    atmosphereMeshes.set(planet.id, halo)
  }

  // Ambient + directional lighting so spheres aren't flat
  const ambient = new THREE.AmbientLight(0xffffff, 0.42)
  const directional = new THREE.DirectionalLight(0xffffff, 0.65)
  directional.position.set(1, 1, 0.5)
  group.add(ambient, directional)

  return {
    group,
    planetMeshes,
    atmosphereMeshes,
    galaxyCenter: center,
    destroy: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
    },
  }
}

function computeGalaxyCenter(planets: ReadonlyArray<Planet>): THREE.Vector3 {
  if (planets.length === 0) return new THREE.Vector3(0, 0, 0)
  let sx = 0
  let sy = 0
  let sz = 0
  for (const p of planets) {
    sx += p.position.x
    sy += p.position.y
    sz += p.position.z
  }
  return new THREE.Vector3(sx / planets.length, sy / planets.length, sz / planets.length)
}

function makePlanetMesh(planet: Planet, center: THREE.Vector3): THREE.Mesh {
  const radius = planetRenderRadius(planet.sizeTier)
  const biomeId = String(planet.biome.id)
  const color = BIOME_COLORS[biomeId] ?? BIOME_COLORS['default']!
  // Subdivide higher for bigger planets so they look smooth at close zoom.
  const subdivWidth = radius < 100 ? 24 : radius < 200 ? 32 : 48
  const subdivHeight = Math.floor(subdivWidth * 0.75)
  const geom = new THREE.SphereGeometry(radius, subdivWidth, subdivHeight)
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
    emissive: color,
    emissiveIntensity: 0.15,
  })
  const mesh = new THREE.Mesh(geom, mat)
  mesh.position.set(
    planet.position.x - center.x,
    planet.position.y - center.y,
    planet.position.z - center.z,
  )
  mesh.userData = { kind: 'planet', planetId: planet.id, sizeTier: planet.sizeTier }
  return mesh
}

function makeAtmosphereGlow(planet: Planet, center: THREE.Vector3): THREE.Mesh {
  const baseRadius = planetRenderRadius(planet.sizeTier)
  const haloRadius = baseRadius * 1.18
  const biomeId = String(planet.biome.id)
  const color = BIOME_COLORS[biomeId] ?? BIOME_COLORS['default']!
  const geom = new THREE.SphereGeometry(haloRadius, 32, 24)
  // Backside-only inverted-Fresnel halo using a custom shader-style approximation
  // via emissive + transparent material with side: BackSide
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 0.85 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float fres = pow(1.0 - dot(normalize(vNormal), normalize(vView)), 2.0);
        gl_FragColor = vec4(uColor, fres * uIntensity);
      }
    `,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const halo = new THREE.Mesh(geom, mat)
  halo.position.set(
    planet.position.x - center.x,
    planet.position.y - center.y,
    planet.position.z - center.z,
  )
  halo.userData = { kind: 'planet-halo', planetId: planet.id }
  return halo
}

// === OWNER-CIV FLAG BILLBOARDS ===

export interface OwnerFlagEntry {
  readonly planetId: PlanetId
  readonly sprite: THREE.Sprite
  readonly texture: THREE.Texture
  readonly canvas: HTMLCanvasElement
}

export interface OwnerFlagLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<PlanetId, OwnerFlagEntry>
  readonly destroy: () => void
}

export function buildOwnerFlagLayer(): OwnerFlagLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<PlanetId, OwnerFlagEntry>()
  return {
    group,
    entries,
    destroy: () => {
      for (const entry of entries.values()) {
        entry.texture.dispose()
        ;(entry.sprite.material as THREE.SpriteMaterial).dispose()
      }
      entries.clear()
    },
  }
}

export function syncOwnerFlags(
  handle: OwnerFlagLayerHandle,
  galaxy: Galaxy,
  planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>,
  ownerByPlanet: ReadonlyMap<PlanetId, CivId>,
  themeByCiv: ReadonlyMap<CivId, Theme>,
): void {
  const liveIds = new Set<PlanetId>()
  for (const planet of galaxy.planets) {
    const civId = ownerByPlanet.get(planet.id)
    if (!civId) continue
    const theme = themeByCiv.get(civId)
    if (!theme) continue
    const mesh = planetMeshes.get(planet.id)
    if (!mesh) continue
    liveIds.add(planet.id)
    const label = `${theme.emoji} ${theme.name}`
    let entry = handle.entries.get(planet.id)
    if (!entry) {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const tex = new THREE.CanvasTexture(canvas)
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
      const sprite = new THREE.Sprite(mat)
      const scale = (mesh.geometry.boundingSphere?.radius ?? 100) * 1.4
      sprite.scale.set(scale, scale * 0.25, 1)
      handle.group.add(sprite)
      entry = { planetId: planet.id, sprite, texture: tex, canvas }
      handle.entries.set(planet.id, entry)
    }
    paintFlagCanvas(entry.canvas, label)
    entry.texture.needsUpdate = true
    // Position flag above the planet
    const radius = mesh.geometry.boundingSphere?.radius ?? 100
    entry.sprite.position.set(mesh.position.x, mesh.position.y + radius * 1.5, mesh.position.z)
  }
  // Remove flags for planets no longer owned (rare in this view)
  for (const [id, entry] of handle.entries) {
    if (liveIds.has(id)) continue
    handle.group.remove(entry.sprite)
    entry.texture.dispose()
    ;(entry.sprite.material as THREE.SpriteMaterial).dispose()
    handle.entries.delete(id)
  }
}

function paintFlagCanvas(canvas: HTMLCanvasElement, label: string): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // Banner background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#d4a13a'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
  // Label
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText(label, canvas.width / 2, canvas.height / 2)
}

// === FLIGHT ARC LAYER ===

export interface FlightArcEntry {
  readonly flightId: string
  readonly line: THREE.Line
  readonly progressDot: THREE.Mesh
  readonly arcPoints: THREE.Vector3[]
}

export interface FlightArcLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<string, FlightArcEntry>
  readonly destroy: () => void
}

export function buildFlightArcLayer(galaxyCenter: THREE.Vector3): FlightArcLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<string, FlightArcEntry>()
  return {
    group,
    entries,
    destroy: () => {
      for (const entry of entries.values()) {
        entry.line.geometry.dispose()
        ;(entry.line.material as THREE.Material).dispose()
        entry.progressDot.geometry.dispose()
        ;(entry.progressDot.material as THREE.Material).dispose()
      }
      entries.clear()
    },
  }
  void galaxyCenter
}

function arcPoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  segments: number,
  bulge: number,
): THREE.Vector3[] {
  const mid = start.clone().add(end).multiplyScalar(0.5)
  const dir = end.clone().sub(start)
  const perp = new THREE.Vector3(-dir.z, dir.length() * 0.5, dir.x)
    .normalize()
    .multiplyScalar(bulge)
  const peak = mid.clone().add(perp)
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    // Quadratic Bezier: (1-t)^2 * start + 2(1-t)t * peak + t^2 * end
    const u = 1 - t
    const p = new THREE.Vector3()
      .addScaledVector(start, u * u)
      .addScaledVector(peak, 2 * u * t)
      .addScaledVector(end, t * t)
    points.push(p)
  }
  return points
}

export function syncFlightArcs(
  handle: FlightArcLayerHandle,
  flights: ReadonlyArray<ColonyShipFlight>,
  planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>,
  civColorMap: ReadonlyMap<string, number>,
): void {
  const alive = new Set<string>()
  for (const flight of flights) {
    const flightIdStr = String(flight.id)
    alive.add(flightIdStr)
    const sourceMesh = planetMeshes.get(flight.fromPlanetId)
    const targetMesh = planetMeshes.get(flight.targetPlanetId)
    if (!sourceMesh || !targetMesh) continue
    const civColor = civColorMap.get(String(flight.launchingCivId)) ?? 0xd4a13a
    const progress = Math.min(1, flight.ticksFlown / Math.max(1, flight.totalTicks))

    let entry = handle.entries.get(flightIdStr)
    if (!entry) {
      const points = arcPoints(
        sourceMesh.position,
        targetMesh.position,
        48,
        sourceMesh.position.distanceTo(targetMesh.position) * 0.18,
      )
      const geom = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineDashedMaterial({
        color: civColor,
        dashSize: 30,
        gapSize: 18,
        linewidth: 2,
        transparent: true,
        opacity: 0.85,
      })
      const line = new THREE.Line(geom, mat)
      line.computeLineDistances()
      handle.group.add(line)
      const dotGeom = new THREE.SphereGeometry(7, 8, 6)
      const dotMat = new THREE.MeshBasicMaterial({ color: civColor })
      const dot = new THREE.Mesh(dotGeom, dotMat)
      handle.group.add(dot)
      entry = { flightId: flightIdStr, line, progressDot: dot, arcPoints: points }
      handle.entries.set(flightIdStr, entry)
    } else {
      // Update arc if planet positions changed (rare); just update color if needed
      const mat = entry.line.material as THREE.LineDashedMaterial
      if (mat.color.getHex() !== civColor) mat.color.setHex(civColor)
      const dotMat = entry.progressDot.material as THREE.MeshBasicMaterial
      if (dotMat.color.getHex() !== civColor) dotMat.color.setHex(civColor)
    }
    // Place progress dot along arc
    const segIdx = Math.floor(progress * (entry.arcPoints.length - 1))
    const seg = entry.arcPoints[Math.min(entry.arcPoints.length - 1, segIdx)]
    if (seg) entry.progressDot.position.copy(seg)

    // Animate dash offset for "moving forward" feel
    const mat = entry.line.material as THREE.LineDashedMaterial
    mat.dashSize = 30
    mat.gapSize = 18
    // dashOffset isn't natively supported in LineDashedMaterial, so emulate via toggling opacity over time
    mat.opacity = 0.55 + Math.sin(performance.now() / 200 + progress * Math.PI) * 0.25
  }
  // Remove dead arcs
  for (const [id, entry] of handle.entries) {
    if (alive.has(id)) continue
    handle.group.remove(entry.line)
    handle.group.remove(entry.progressDot)
    entry.line.geometry.dispose()
    ;(entry.line.material as THREE.Material).dispose()
    entry.progressDot.geometry.dispose()
    ;(entry.progressDot.material as THREE.Material).dispose()
    handle.entries.delete(id)
  }
}

// === BEACON ALERT PULSE LAYER ===

export interface BeaconPulseLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<PlanetId, THREE.Mesh>
  readonly destroy: () => void
}

export function buildBeaconPulseLayer(): BeaconPulseLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<PlanetId, THREE.Mesh>()
  return {
    group,
    entries,
    destroy: () => {
      for (const m of entries.values()) {
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      }
      entries.clear()
    },
  }
}

export function syncBeaconPulses(
  handle: BeaconPulseLayerHandle,
  alertedPlanetIds: ReadonlySet<PlanetId>,
  planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>,
  camera: THREE.Camera,
): void {
  for (const id of alertedPlanetIds) {
    const mesh = planetMeshes.get(id)
    if (!mesh) continue
    let ring = handle.entries.get(id)
    if (!ring) {
      const r = mesh.geometry.boundingSphere?.radius ?? 80
      const geom = new THREE.RingGeometry(r + 24, r + 38, 32)
      const mat = new THREE.MeshBasicMaterial({
        color: 0xe02d4a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      })
      ring = new THREE.Mesh(geom, mat)
      ring.userData = { kind: 'beacon-pulse', planetId: id }
      handle.group.add(ring)
      handle.entries.set(id, ring)
    }
    ring.position.copy(mesh.position)
    ring.lookAt(camera.position)
    const mat = ring.material as THREE.MeshBasicMaterial
    mat.opacity = 0.4 + Math.sin(performance.now() / 220) * 0.25
  }
  // Remove rings for planets no longer alerted
  for (const [id, ring] of handle.entries) {
    if (alertedPlanetIds.has(id)) continue
    handle.group.remove(ring)
    ring.geometry.dispose()
    ;(ring.material as THREE.Material).dispose()
    handle.entries.delete(id)
  }
}

// === RANGE OVERLAY LAYER ===

export interface RangeOverlayLayerHandle {
  readonly group: THREE.Group
  readonly rings: THREE.Mesh[]
  setVisible(visible: boolean): void
  readonly destroy: () => void
}

const TIER_RANGES: ReadonlyArray<{ tier: number; radius: number; color: number }> = [
  { tier: 1, radius: 1500, color: 0x3aa860 },
  { tier: 2, radius: 3500, color: 0xfde047 },
  { tier: 3, radius: 7000, color: 0xfca5a5 },
  { tier: 4, radius: 14000, color: 0xa970d4 },
]

export function buildRangeOverlayLayer(homeWorldPosition: THREE.Vector3): RangeOverlayLayerHandle {
  const group = new THREE.Group()
  const rings: THREE.Mesh[] = []
  for (const tier of TIER_RANGES) {
    const geom = new THREE.RingGeometry(tier.radius - 12, tier.radius, 96)
    const mat = new THREE.MeshBasicMaterial({
      color: tier.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    })
    const ring = new THREE.Mesh(geom, mat)
    ring.position.copy(homeWorldPosition)
    ring.rotation.x = -Math.PI / 2
    ring.userData = { kind: 'range-ring', tier: tier.tier }
    group.add(ring)
    rings.push(ring)
  }
  group.visible = false
  return {
    group,
    rings,
    setVisible: (v: boolean) => {
      group.visible = v
    },
    destroy: () => {
      for (const ring of rings) {
        ring.geometry.dispose()
        ;(ring.material as THREE.Material).dispose()
      }
    },
  }
}

function makeStarfield(seed: number): THREE.Points {
  const count = 2500
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  let s = seed >>> 0
  const rand = (): number => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
  for (let i = 0; i < count; i++) {
    // Spread stars on a giant sphere
    const u = rand() * 2 - 1
    const t = rand() * Math.PI * 2
    const r = 18000
    const phi = Math.acos(u)
    const x = r * Math.sin(phi) * Math.cos(t)
    const y = r * Math.sin(phi) * Math.sin(t)
    const z = r * Math.cos(phi)
    positions[i * 3 + 0] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    const tint = 0.6 + rand() * 0.4
    colors[i * 3 + 0] = tint * (0.85 + rand() * 0.15)
    colors[i * 3 + 1] = tint * (0.85 + rand() * 0.15)
    colors[i * 3 + 2] = tint
  }
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size: 24,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
  })
  return new THREE.Points(geom, mat)
}
