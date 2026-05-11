import * as THREE from 'three'
import {
  type CivId,
  type ColonyShipFlight,
  type Galaxy,
  type PadState,
  type Planet,
  type PlanetId,
  type ShipBeaconBroadcast,
  type Theme,
  type TileId,
  type Vec3,
  getColonyShipDef,
  planetRenderRadius,
} from '@smol/shared'

const BIOME_COLORS: Readonly<Record<string, number>> = {
  // Tier 0 (default home biomes) — GREEN Earth-like + tropical cyan
  terran: 0x4ea869, // Earth-like green — the most common default home biome
  archipelago: 0x4fb8b0, // tropical cyan
  // Tier 1 (mild hostility)
  jungle: 0x2f8c4c, // dark green
  desert: 0xd9a86c, // sandy
  arctic: 0xbfdaf2, // pale blue
  ocean: 0x2a5d8f, // deep blue
  junkyard: 0xa07050, // orange-brown
  // Tier 2 (heavy hostility)
  swamp: 0x5e6e3a,
  volcanic: 0xc44a2a,
  gasGiantMoon: 0xa970d4,
  asteroid: 0x6c6c70,
  crystalline: 0x9adfd4,
  // Tier 3 (end-game)
  lava: 0xff5a2a,
  ringworld: 0xd4c060,
  // Generic mountain fallback (not a real biome ID — kept for back-compat)
  mountain: 0x8a8784,
  default: 0x4ea869, // terran-green is the safer fallback than concrete gray
}

export interface GalaxyLayerHandle {
  readonly group: THREE.Group
  readonly planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>
  readonly atmosphereMeshes: ReadonlyMap<PlanetId, THREE.Mesh>
  // PHASE 17.I — real stars (one mesh per Galaxy.stars entry, sized by 4× galaxy-wide max
  // planet radius). Replaces the singular decorative origin-sun from PHASE 16.17.
  readonly starMeshes: ReadonlyMap<string, THREE.Mesh>
  readonly galaxyCenter: THREE.Vector3
  readonly destroy: () => void
}

export function buildGalaxyLayer(galaxy: Galaxy): GalaxyLayerHandle {
  const group = new THREE.Group()
  const planetMeshes = new Map<PlanetId, THREE.Mesh>()
  const atmosphereMeshes = new Map<PlanetId, THREE.Mesh>()
  const starMeshes = new Map<string, THREE.Mesh>()

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

  // PHASE 17.I — real Stars from solar-system gen. Each star.position becomes a glowing
  // sphere sized to star.radius (4× galaxy-wide largest planet per LAW #0 2026-05-11).
  // Replaces the singular decorative origin-sun from PHASE 16.17 — actual stars carry the
  // galactic anchor role now, one per solar system, all at the same scale.
  for (const star of galaxy.stars) {
    const starGroup = makeStarMesh(star, center)
    group.add(starGroup.core)
    group.add(starGroup.halo)
    starMeshes.set(String(star.id), starGroup.core)
  }

  return {
    group,
    planetMeshes,
    atmosphereMeshes,
    starMeshes,
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

// PHASE 17.I — Star rendering. Each Star from generateGalaxy becomes a glowing sphere at
// star.position with star.radius = 4 × galaxy-wide largest planet's surface radius. Glowing
// emissive core + back-faced Fresnel halo (same pattern as the legacy decorative sun but at
// per-star scale and position).
interface StarMeshGroup {
  readonly core: THREE.Mesh
  readonly halo: THREE.Mesh
}

function makeStarMesh(star: import('@smol/shared').Star, center: THREE.Vector3): StarMeshGroup {
  const coreGeom = new THREE.SphereGeometry(star.radius, 32, 24)
  const coreMat = new THREE.MeshBasicMaterial({
    color: star.color,
    transparent: true,
    opacity: 0.95,
  })
  const core = new THREE.Mesh(coreGeom, coreMat)
  core.position.set(
    star.position.x - center.x,
    star.position.y - center.y,
    star.position.z - center.z,
  )
  core.userData = { kind: 'star', starId: String(star.id) }

  const haloRadius = star.radius * 1.4
  const haloGeom = new THREE.SphereGeometry(haloRadius, 28, 20)
  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(star.color) } },
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
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float fres = pow(1.0 - dot(normalize(vNormal), normalize(vView)), 2.5);
        gl_FragColor = vec4(uColor, fres * 0.7);
      }
    `,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const halo = new THREE.Mesh(haloGeom, haloMat)
  halo.position.copy(core.position)
  halo.userData = { kind: 'star-halo', starId: String(star.id) }
  return { core, halo }
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
// PHASE 16.16 (LAW #0 feedback_planets_green_big_multi_civ.md): planets can be MULTI-CIV.
// Tiles owned by different civs on the same planet → each civ gets its own flag stacked
// vertically above the planet, dominant first. Entries keyed by `${planetId}:${civId}` so
// the layer naturally tracks per-civ-per-planet flags. Optional indigenous markers added
// per planet with an active indigenous presence.

export interface OwnerFlagEntry {
  readonly key: string
  readonly planetId: PlanetId
  readonly civId: CivId
  readonly sprite: THREE.Sprite
  readonly texture: THREE.Texture
  readonly canvas: HTMLCanvasElement
}

export interface IndigenousMarkerEntry {
  readonly planetId: PlanetId
  readonly sprite: THREE.Sprite
  readonly texture: THREE.Texture
  readonly canvas: HTMLCanvasElement
}

export interface OwnerFlagLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<string, OwnerFlagEntry>
  readonly indigenousEntries: Map<PlanetId, IndigenousMarkerEntry>
  readonly destroy: () => void
}

export function buildOwnerFlagLayer(): OwnerFlagLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<string, OwnerFlagEntry>()
  const indigenousEntries = new Map<PlanetId, IndigenousMarkerEntry>()
  return {
    group,
    entries,
    indigenousEntries,
    destroy: () => {
      for (const entry of entries.values()) {
        entry.texture.dispose()
        ;(entry.sprite.material as THREE.SpriteMaterial).dispose()
      }
      entries.clear()
      for (const ind of indigenousEntries.values()) {
        ind.texture.dispose()
        ;(ind.sprite.material as THREE.SpriteMaterial).dispose()
      }
      indigenousEntries.clear()
    },
  }
}

export interface PlanetCivPresence {
  readonly civId: CivId
  readonly tileCount: number
  // PHASE 16.20: when set, places the flag at this world-space point (above the civ's tile
  // cluster) instead of stacking it above the planet's north pole. Lets each civ on a
  // contested planet plant its flag over its actual territory in 3D.
  readonly centroidWorld?: Vec3
}

export interface IndigenousMarkerInput {
  readonly planetId: PlanetId
  readonly emoji: string
  readonly label: string
}

export function syncOwnerFlags(
  handle: OwnerFlagLayerHandle,
  galaxy: Galaxy,
  planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>,
  ownerByPlanet: ReadonlyMap<PlanetId, CivId>,
  themeByCiv: ReadonlyMap<CivId, Theme>,
  // Optional: ordered list (most-tiles first) of all civs holding ground on each planet.
  // When provided AND non-empty per-planet, replaces the single ownerByPlanet flag with
  // the full stack. Falls back to ownerByPlanet single-flag when omitted/empty.
  civsByPlanet?: ReadonlyMap<PlanetId, ReadonlyArray<PlanetCivPresence>>,
  indigenousByPlanet?: ReadonlyArray<IndigenousMarkerInput>,
): void {
  const liveKeys = new Set<string>()
  for (const planet of galaxy.planets) {
    const mesh = planetMeshes.get(planet.id)
    if (!mesh) continue
    const radius = mesh.geometry.boundingSphere?.radius ?? 100
    const flagWidth = radius * 1.4
    const flagHeight = flagWidth * 0.25
    const stackSpacing = flagHeight * 1.1

    // Pick the civ list: civsByPlanet if provided & non-empty, else single-owner fallback
    const civList = civsByPlanet?.get(planet.id) ?? []
    const fallbackCiv = civList.length === 0 ? ownerByPlanet.get(planet.id) : null
    const civsForThisPlanet: ReadonlyArray<PlanetCivPresence> =
      civList.length > 0 ? civList : fallbackCiv ? [{ civId: fallbackCiv, tileCount: 0 }] : []

    for (let i = 0; i < civsForThisPlanet.length; i++) {
      const civPresence = civsForThisPlanet[i]!
      const theme = themeByCiv.get(civPresence.civId)
      if (!theme) continue
      const key = `${String(planet.id)}:${String(civPresence.civId)}`
      liveKeys.add(key)
      const label =
        civPresence.tileCount > 0
          ? `${theme.emoji} ${theme.name} · ${civPresence.tileCount}`
          : `${theme.emoji} ${theme.name}`
      let entry = handle.entries.get(key)
      if (!entry) {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 64
        const tex = new THREE.CanvasTexture(canvas)
        tex.minFilter = THREE.LinearFilter
        tex.needsUpdate = true
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
        const sprite = new THREE.Sprite(mat)
        sprite.scale.set(flagWidth, flagHeight, 1)
        handle.group.add(sprite)
        entry = {
          key,
          planetId: planet.id,
          civId: civPresence.civId,
          sprite,
          texture: tex,
          canvas,
        }
        handle.entries.set(key, entry)
      }
      paintFlagCanvas(entry.canvas, label)
      entry.texture.needsUpdate = true
      // PHASE 16.20: when the caller provides a world-space cluster centroid (per civ),
      // float the flag above that centroid in 3D — flags now sit OVER each civ's actual
      // territory instead of stacking above the planet's north pole. Fallback (no
      // centroid provided) keeps the original vertical stack so the panel still works
      // for single-owner planets / cases where centroid computation isn't wired.
      if (civPresence.centroidWorld) {
        entry.sprite.position.set(
          civPresence.centroidWorld.x,
          civPresence.centroidWorld.y,
          civPresence.centroidWorld.z,
        )
      } else {
        const yOffset = radius * 1.5 + i * stackSpacing
        entry.sprite.position.set(mesh.position.x, mesh.position.y + yOffset, mesh.position.z)
      }
    }
  }
  // Remove flag entries no longer present (civ lost all tiles on that planet, or planet gone)
  for (const [key, entry] of handle.entries) {
    if (liveKeys.has(key)) continue
    handle.group.remove(entry.sprite)
    entry.texture.dispose()
    ;(entry.sprite.material as THREE.SpriteMaterial).dispose()
    handle.entries.delete(key)
  }

  // === Indigenous markers ===
  const liveIndigIds = new Set<PlanetId>()
  if (indigenousByPlanet) {
    for (const indig of indigenousByPlanet) {
      const mesh = planetMeshes.get(indig.planetId)
      if (!mesh) continue
      liveIndigIds.add(indig.planetId)
      let entry = handle.indigenousEntries.get(indig.planetId)
      if (!entry) {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 56
        const tex = new THREE.CanvasTexture(canvas)
        tex.minFilter = THREE.LinearFilter
        tex.needsUpdate = true
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
        const sprite = new THREE.Sprite(mat)
        const radius = mesh.geometry.boundingSphere?.radius ?? 100
        const w = radius * 1.2
        sprite.scale.set(w, w * 0.22, 1)
        handle.group.add(sprite)
        entry = { planetId: indig.planetId, sprite, texture: tex, canvas }
        handle.indigenousEntries.set(indig.planetId, entry)
      }
      paintIndigenousCanvas(entry.canvas, `${indig.emoji} ${indig.label}`)
      entry.texture.needsUpdate = true
      // Position BELOW the planet, opposite the flag stack, so they don't crowd
      const radius = mesh.geometry.boundingSphere?.radius ?? 100
      entry.sprite.position.set(mesh.position.x, mesh.position.y - radius * 1.45, mesh.position.z)
    }
  }
  for (const [id, entry] of handle.indigenousEntries) {
    if (liveIndigIds.has(id)) continue
    handle.group.remove(entry.sprite)
    entry.texture.dispose()
    ;(entry.sprite.material as THREE.SpriteMaterial).dispose()
    handle.indigenousEntries.delete(id)
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

function paintIndigenousCanvas(canvas: HTMLCanvasElement, label: string): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(80, 16, 16, 0.78)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
  ctx.fillStyle = '#fbbcbc'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText(label, canvas.width / 2, canvas.height / 2)
}

// === MINE FIELD LAYER ===
// PHASE 16.22 — UMS-faithful mine-field 3D visualization per SMOL_REFERENCE_TRAJECTORY §17
// + UnityPad.cs mine logic. Each MineField on the planet surface gets a 💣 emoji billboard
// rendered at its world position. Sprite scale keys off detonationRadius so player can SEE
// the trigger envelope. Sprite fades as remainingDetonations depletes (red→dim) so players
// can tell which mines are spent.

export interface MineFieldEntry {
  readonly id: string
  readonly sprite: THREE.Sprite
  readonly texture: THREE.Texture
  readonly canvas: HTMLCanvasElement
}

export interface MineFieldLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<string, MineFieldEntry>
  readonly destroy: () => void
}

export function buildMineFieldLayer(): MineFieldLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<string, MineFieldEntry>()
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

export interface MineFieldInput {
  readonly id: string
  readonly worldPosition: Vec3
  readonly remainingDetonations: number
  readonly detonationRadius: number
}

export function syncMineFields(
  handle: MineFieldLayerHandle,
  inputs: ReadonlyArray<MineFieldInput>,
): void {
  const liveIds = new Set<string>()
  for (const m of inputs) {
    liveIds.add(m.id)
    let entry = handle.entries.get(m.id)
    if (!entry) {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const tex = new THREE.CanvasTexture(canvas)
      tex.minFilter = THREE.LinearFilter
      tex.needsUpdate = true
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
      const sprite = new THREE.Sprite(mat)
      handle.group.add(sprite)
      entry = { id: m.id, sprite, texture: tex, canvas }
      handle.entries.set(m.id, entry)
    }
    // Sprite size keyed off detonation radius — larger detonationRadius means larger
    // visible billboard (player sees trigger envelope at a glance).
    const spriteSize = Math.max(40, m.detonationRadius * 2)
    entry.sprite.scale.set(spriteSize, spriteSize, 1)
    // Position at the mine's world position. Add a small +y nudge so the sprite floats just
    // above surface tile geometry instead of clipping into it.
    entry.sprite.position.set(m.worldPosition.x, m.worldPosition.y, m.worldPosition.z)
    // Repaint canvas — depletion shows as dimmer red.
    const intensity = Math.max(0.4, Math.min(1, m.remainingDetonations / 3))
    paintMineFieldCanvas(entry.canvas, intensity)
    entry.texture.needsUpdate = true
  }
  // GC mines that no longer exist (consumed all detonations or planet lost).
  for (const [id, entry] of handle.entries) {
    if (liveIds.has(id)) continue
    handle.group.remove(entry.sprite)
    entry.texture.dispose()
    ;(entry.sprite.material as THREE.SpriteMaterial).dispose()
    handle.entries.delete(id)
  }
}

function paintMineFieldCanvas(canvas: HTMLCanvasElement, intensity: number): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // Translucent red disc background (intercept envelope hint).
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, canvas.width / 2)
  grad.addColorStop(0, `rgba(239, 68, 68, ${0.55 * intensity})`)
  grad.addColorStop(1, 'rgba(239, 68, 68, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // 💣 emoji at center.
  ctx.font = `${Math.round(36 * (0.7 + intensity * 0.3))}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('💣', cx, cy + 2)
}

// === DETONATION FLASH LAYER ===
// PHASE 16.24 (deferred completion) — per user verbatim 2026-05-10 "it damages area of effect
// fo like sending them to attack all ships depending fuel and payload ect ect whats loaded
// make them go bigg booms but it takes like 30-50 missile to wipe out a vmiulti plaet civ".
// computeDetonationAoE + applyDetonationAoE in MatchSim already drive the sim damage; this
// layer renders the visual punch. Each MatchDetonation spawns a sphere mesh at the impact
// world position that expands from 0 → max-radius × 1.2 over ~1.5s wall-clock with a color
// fade white → yellow → orange → red and opacity fade 0.9 → 0. Additive blending so multiple
// overlapping detonations stack brighter. Animation is self-timed per entry (spawnedAt ms);
// sim-side prune drops the source entry after DETONATION_LIFETIME_TICKS but the render-side
// entry self-completes much faster.

const DETONATION_FLASH_DURATION_MS = 1500

export interface DetonationFlashInput {
  readonly id: string
  readonly worldPosition: Vec3
  readonly radius: number
  readonly magnitude: number
}

export interface DetonationFlashEntry {
  readonly id: string
  readonly mesh: THREE.Mesh
  readonly spawnedAt: number
  readonly maxRadius: number
  readonly magnitude: number
}

export interface DetonationFlashLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<string, DetonationFlashEntry>
  readonly destroy: () => void
}

export function buildDetonationFlashLayer(): DetonationFlashLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<string, DetonationFlashEntry>()
  return {
    group,
    entries,
    destroy: () => {
      for (const entry of entries.values()) {
        entry.mesh.geometry.dispose()
        ;(entry.mesh.material as THREE.Material).dispose()
      }
      entries.clear()
    },
  }
}

export function syncDetonationFlashes(
  handle: DetonationFlashLayerHandle,
  detonations: ReadonlyArray<DetonationFlashInput>,
): void {
  const now = performance.now()
  const liveIds = new Set<string>()
  for (const det of detonations) {
    liveIds.add(det.id)
    let entry = handle.entries.get(det.id)
    if (!entry) {
      const geom = new THREE.SphereGeometry(1, 24, 16)
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffe080,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(det.worldPosition.x, det.worldPosition.y, det.worldPosition.z)
      mesh.userData = { kind: 'detonation-flash', detId: det.id }
      handle.group.add(mesh)
      entry = {
        id: det.id,
        mesh,
        spawnedAt: now,
        maxRadius: det.radius,
        magnitude: det.magnitude,
      }
      handle.entries.set(det.id, entry)
    }
    const age = (now - entry.spawnedAt) / DETONATION_FLASH_DURATION_MS
    if (age >= 1) continue
    // Scale: 0 → 1.2 × maxRadius with eased-out cubic so flash blooms fast then settles.
    const eased = 1 - Math.pow(1 - age, 3)
    entry.mesh.scale.setScalar(entry.maxRadius * (0.05 + 1.15 * eased))
    // Color fade: white → yellow → orange → red over lifetime. Brighter mid-flash mass-spike
    // for high-magnitude strikes (Pilgrim/Heavy/Final variants paint a bigger boom).
    const mat = entry.mesh.material as THREE.MeshBasicMaterial
    if (age < 0.3) {
      const t = age / 0.3
      mat.color.setRGB(1, 1 - t * 0.15, 0.5 - t * 0.3)
    } else if (age < 0.7) {
      const t = (age - 0.3) / 0.4
      mat.color.setRGB(1, 0.85 - t * 0.5, 0.2 - t * 0.15)
    } else {
      const t = (age - 0.7) / 0.3
      mat.color.setRGB(1, 0.35 - t * 0.3, 0.05)
      void t
    }
    // Opacity: 0.9 → 0 with quadratic fade so the flash lingers visibly then drops out.
    mat.opacity = Math.max(0, 0.9 * (1 - age * age))
  }
  // Remove finished entries (animation complete OR entry no longer in input list).
  for (const [id, entry] of handle.entries) {
    const finished = (now - entry.spawnedAt) / DETONATION_FLASH_DURATION_MS >= 1
    if (liveIds.has(id) && !finished) continue
    handle.group.remove(entry.mesh)
    entry.mesh.geometry.dispose()
    ;(entry.mesh.material as THREE.Material).dispose()
    handle.entries.delete(id)
  }
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
    // PHASE 16.29: counter-colony-ships render as smaller, brighter, shorter-dashed cones
    // so defensive interceptors read distinctly from attacking colony ships at galactic zoom.
    // Same civ color (so player tells whose counter it is) but the geometry + dash cadence
    // mark it as an intercept-trail vs. a cruise-arc.
    const flightDef = getColonyShipDef(flight.variantId)
    const isCounter = flightDef.canIntercept

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
        dashSize: isCounter ? 18 : 30,
        gapSize: isCounter ? 10 : 18,
        linewidth: 2,
        transparent: true,
        opacity: 0.85,
      })
      const line = new THREE.Line(geom, mat)
      line.computeLineDistances()
      handle.group.add(line)
      // PHASE 16.x complete-3D-world-space: progress marker is now a directional cone
      // (oriented along arc tangent), not a sphere. Reads as a ship traveling its arc.
      // PHASE 16.29: counters use a smaller cone (interceptor missile, not colony ship).
      const coneRadius = isCounter ? 8 : 14
      const coneHeight = isCounter ? 22 : 36
      const dotGeom = new THREE.ConeGeometry(coneRadius, coneHeight, 6)
      const dotMat = new THREE.MeshStandardMaterial({
        color: civColor,
        emissive: civColor,
        emissiveIntensity: isCounter ? 1.1 : 0.7,
        roughness: 0.35,
        metalness: 0.4,
      })
      const dot = new THREE.Mesh(dotGeom, dotMat)
      // PHASE 16.23: tag the cone mesh so GalaxyView's raycaster can pick it up and fire
      // onSelectFlight(flightId) → opens FlightDetailPanel with crew/supplies/fuel/speed
      // per UMS UnityMissile.cs UNITY_MSL broadcast spec.
      dot.userData = { kind: 'flight', flightId: flightIdStr }
      handle.group.add(dot)
      entry = { flightId: flightIdStr, line, progressDot: dot, arcPoints: points }
      handle.entries.set(flightIdStr, entry)
    } else {
      // Update arc if planet positions changed (rare); just update color if needed
      const mat = entry.line.material as THREE.LineDashedMaterial
      if (mat.color.getHex() !== civColor) mat.color.setHex(civColor)
      const dotMat = entry.progressDot.material as THREE.MeshStandardMaterial
      if (dotMat.color.getHex() !== civColor) {
        dotMat.color.setHex(civColor)
        dotMat.emissive.setHex(civColor)
      }
    }
    // Place progress dot along arc + orient along tangent so the cone "flies forward"
    const segIdx = Math.floor(progress * (entry.arcPoints.length - 1))
    const seg = entry.arcPoints[Math.min(entry.arcPoints.length - 1, segIdx)]
    if (seg) {
      entry.progressDot.position.copy(seg)
      const nextSeg = entry.arcPoints[Math.min(entry.arcPoints.length - 1, segIdx + 1)] ?? seg
      if (nextSeg !== seg) {
        const dir = nextSeg.clone().sub(seg).normalize()
        // Cone's local +Y points "up"; align +Y with travel direction
        const up = new THREE.Vector3(0, 1, 0)
        const q = new THREE.Quaternion().setFromUnitVectors(up, dir)
        entry.progressDot.quaternion.copy(q)
      }
    }
    // Phase-tinted emissive pulse for terminal phases (REENTRY/TARGET/DETONATE).
    const dotMat = entry.progressDot.material as THREE.MeshStandardMaterial
    const phase = flight.phase
    if (phase === 'TARGET' || phase === 'DETONATE') {
      dotMat.emissiveIntensity = 1.1 + 0.4 * Math.sin(performance.now() / 100)
    } else if (phase === 'REENTRY') {
      dotMat.emissiveIntensity = 0.9 + 0.2 * Math.sin(performance.now() / 200)
    } else if (phase === 'INTERCEPTED' || phase === 'ABORTED' || phase === 'CRASH_LANDED') {
      dotMat.emissiveIntensity = 0.25
    } else {
      dotMat.emissiveIntensity = 0.7
    }

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

// === PAD STATE GLOW LAYER (PHASE 16.19) ===
// Each LaunchPad's state machine gets a colored ring around its surface tile so the player
// reads pad state at a glance without opening a panel. PRINT/BUILD = yellow pulsing, FUEL/AMMO
// = blue/pink steady, READY = green steady, ARM = red urgent pulse, LAUNCH = bright white
// flash, GONE = dim gray fade-out.

const PAD_STATE_COLOR: Readonly<Record<PadState, number>> = {
  INIT: 0x555555,
  IDLE: 0x6a6a78,
  PRINT: 0xffa050,
  BUILD: 0xffd960,
  DOCK: 0xaa88ff,
  FUEL: 0x66aaff,
  AMMO: 0xff8acf,
  READY: 0x55ff88,
  ARM: 0xff3344,
  LAUNCH: 0xffffff,
  GONE: 0x44444a,
}

export interface PadStateGlowInput {
  readonly planetId: PlanetId
  readonly padId: TileId
  readonly state: PadState
  readonly tileCentroid: Vec3
  readonly tileNormal: Vec3
}

export interface PadStateGlowEntry {
  readonly key: string
  readonly ring: THREE.Mesh
}

export interface PadStateGlowLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<string, PadStateGlowEntry>
  readonly destroy: () => void
}

export function buildPadStateGlowLayer(): PadStateGlowLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<string, PadStateGlowEntry>()
  return {
    group,
    entries,
    destroy: () => {
      for (const e of entries.values()) {
        e.ring.geometry.dispose()
        ;(e.ring.material as THREE.Material).dispose()
      }
      entries.clear()
    },
  }
}

export function syncPadStateGlows(
  handle: PadStateGlowLayerHandle,
  pads: ReadonlyArray<PadStateGlowInput>,
  planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>,
): void {
  const alive = new Set<string>()
  for (const pad of pads) {
    const planetMesh = planetMeshes.get(pad.planetId)
    if (!planetMesh) continue
    const key = `${String(pad.planetId)}:${String(pad.padId)}`
    alive.add(key)
    const color = PAD_STATE_COLOR[pad.state]
    let entry = handle.entries.get(key)
    if (!entry) {
      // Ring sized relative to typical hex-tile scale (5-6.5 units from surfaceLayer
      // TILE_HEX_SCALE_BY_TIER). Outer + inner radii make a thin glowing band.
      const geom = new THREE.RingGeometry(7, 10, 24)
      const mat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
      const ring = new THREE.Mesh(geom, mat)
      ring.userData = { kind: 'pad-state-glow', planetId: pad.planetId, padId: pad.padId }
      handle.group.add(ring)
      entry = { key, ring }
      handle.entries.set(key, entry)
    } else {
      const mat = entry.ring.material as THREE.MeshBasicMaterial
      if (mat.color.getHex() !== color) mat.color.setHex(color)
    }
    // World position = planetMesh.position + tile.centroid (centroid is in planet-local space)
    const lift = 1.2
    entry.ring.position.set(
      planetMesh.position.x + pad.tileCentroid.x + pad.tileNormal.x * lift,
      planetMesh.position.y + pad.tileCentroid.y + pad.tileNormal.y * lift,
      planetMesh.position.z + pad.tileCentroid.z + pad.tileNormal.z * lift,
    )
    // Orient ring so its normal aligns with tile normal (ring lies flat on tile)
    const up = new THREE.Vector3(0, 0, 1) // ring geometry's local +Z
    const target = new THREE.Vector3(pad.tileNormal.x, pad.tileNormal.y, pad.tileNormal.z)
    entry.ring.quaternion.setFromUnitVectors(up, target)
    // Pulse / flash per state
    const mat = entry.ring.material as THREE.MeshBasicMaterial
    const t = performance.now()
    switch (pad.state) {
      case 'PRINT':
      case 'BUILD':
        mat.opacity = 0.55 + Math.sin(t / 220) * 0.3
        break
      case 'ARM':
        mat.opacity = 0.55 + Math.sin(t / 110) * 0.4
        break
      case 'LAUNCH':
        mat.opacity = 0.95
        break
      case 'READY':
        mat.opacity = 0.85
        break
      case 'GONE':
        mat.opacity = 0.35
        break
      default:
        mat.opacity = 0.7
    }
  }
  for (const [key, entry] of handle.entries) {
    if (alive.has(key)) continue
    handle.group.remove(entry.ring)
    entry.ring.geometry.dispose()
    ;(entry.ring.material as THREE.Material).dispose()
    handle.entries.delete(key)
  }
}

// === PAD SURFACE MESH LAYER (PHASE 16.30) ===
// Per-pad industrial-visual layer alongside the existing PadStateGlow ring. Where the glow
// ring is the at-a-glance state affordance (colored band, animated pulse), the pad mesh
// gives the surface the actual look of a launch pad — a slab + a ship cone that scales with
// pad-state progress. PRINT/BUILD/DOCK/FUEL/AMMO show progressive cone heights; READY/ARM
// show full cone in their state color; LAUNCH shows full cone slightly elevated; GONE shows
// the slab alone (cone gone). Reuses the PadStateGlowInput type (planetId + padId + state +
// tileCentroid + tileNormal) so the parent only computes the data once.

// Cone scale per state — fraction of full height. 0 = no cone visible.
const PAD_STATE_CONE_SCALE: Readonly<Record<PadState, number>> = {
  INIT: 0,
  IDLE: 0,
  PRINT: 0.3,
  BUILD: 0.6,
  DOCK: 0.85,
  FUEL: 1.0,
  AMMO: 1.0,
  READY: 1.0,
  ARM: 1.0,
  LAUNCH: 1.0,
  GONE: 0,
}

// Pad slab visibility per state — 1 = fully visible, 0 = hidden. INIT hides entirely; GONE
// shows the slab with a debris-cooldown vibe.
const PAD_STATE_SLAB_OPACITY: Readonly<Record<PadState, number>> = {
  INIT: 0,
  IDLE: 0.85,
  PRINT: 0.9,
  BUILD: 0.9,
  DOCK: 0.95,
  FUEL: 0.95,
  AMMO: 0.95,
  READY: 1.0,
  ARM: 1.0,
  LAUNCH: 0.6,
  GONE: 0.55,
}

const PAD_SLAB_RADIUS = 7
const PAD_SLAB_HEIGHT = 1.5
const PAD_CONE_RADIUS = 4.5
const PAD_CONE_HEIGHT = 14

export interface PadMeshEntry {
  readonly key: string
  readonly slab: THREE.Mesh
  readonly cone: THREE.Mesh
}

export interface PadMeshLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<string, PadMeshEntry>
  readonly destroy: () => void
}

export function buildPadMeshLayer(): PadMeshLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<string, PadMeshEntry>()
  return {
    group,
    entries,
    destroy: () => {
      for (const e of entries.values()) {
        e.slab.geometry.dispose()
        ;(e.slab.material as THREE.Material).dispose()
        e.cone.geometry.dispose()
        ;(e.cone.material as THREE.Material).dispose()
      }
      entries.clear()
    },
  }
}

export function syncPadMeshes(
  handle: PadMeshLayerHandle,
  pads: ReadonlyArray<PadStateGlowInput>,
  planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>,
): void {
  const alive = new Set<string>()
  for (const pad of pads) {
    const planetMesh = planetMeshes.get(pad.planetId)
    if (!planetMesh) continue
    const key = `${String(pad.planetId)}:${String(pad.padId)}`
    alive.add(key)
    const color = PAD_STATE_COLOR[pad.state]
    const coneScale = PAD_STATE_CONE_SCALE[pad.state]
    const slabOpacity = PAD_STATE_SLAB_OPACITY[pad.state]

    let entry = handle.entries.get(key)
    if (!entry) {
      // Slab — flat cylinder disc. Dark gray industrial material, transparency driven by state.
      const slabGeom = new THREE.CylinderGeometry(
        PAD_SLAB_RADIUS,
        PAD_SLAB_RADIUS,
        PAD_SLAB_HEIGHT,
        18,
      )
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x44444a,
        roughness: 0.8,
        metalness: 0.45,
        transparent: true,
        opacity: slabOpacity,
      })
      const slab = new THREE.Mesh(slabGeom, slabMat)
      slab.userData = { kind: 'pad-mesh-slab', planetId: pad.planetId, padId: pad.padId }
      handle.group.add(slab)

      // Cone — ship being assembled. State color drives both base + emissive so it reads from
      // the side at any camera angle. ConeGeometry defaults to +Y up; orientation handled below.
      const coneGeom = new THREE.ConeGeometry(PAD_CONE_RADIUS, PAD_CONE_HEIGHT, 8)
      const coneMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.45,
        roughness: 0.35,
        metalness: 0.6,
        transparent: true,
        opacity: 0.95,
      })
      const cone = new THREE.Mesh(coneGeom, coneMat)
      cone.userData = { kind: 'pad-mesh-cone', planetId: pad.planetId, padId: pad.padId }
      handle.group.add(cone)

      entry = { key, slab, cone }
      handle.entries.set(key, entry)
    } else {
      const slabMat = entry.slab.material as THREE.MeshStandardMaterial
      slabMat.opacity = slabOpacity
      const coneMat = entry.cone.material as THREE.MeshStandardMaterial
      if (coneMat.color.getHex() !== color) {
        coneMat.color.setHex(color)
        coneMat.emissive.setHex(color)
      }
    }

    // World position: planet center + tile centroid (planet-local) + a small lift along normal
    // so the slab sits flush on the surface, then cone stacks on top of the slab.
    const base = {
      x: planetMesh.position.x + pad.tileCentroid.x + pad.tileNormal.x * (PAD_SLAB_HEIGHT * 0.5),
      y: planetMesh.position.y + pad.tileCentroid.y + pad.tileNormal.y * (PAD_SLAB_HEIGHT * 0.5),
      z: planetMesh.position.z + pad.tileCentroid.z + pad.tileNormal.z * (PAD_SLAB_HEIGHT * 0.5),
    }
    entry.slab.position.set(base.x, base.y, base.z)

    // Cone sits centered above the slab. Cone scaled by state — height scales the +Y axis only.
    const coneHeightActual = PAD_CONE_HEIGHT * coneScale
    const coneCenterOffset = PAD_SLAB_HEIGHT + coneHeightActual * 0.5
    // LAUNCH adds a small extra lift so the ship visibly clears the slab.
    const launchLift = pad.state === 'LAUNCH' ? PAD_CONE_HEIGHT * 0.3 : 0
    entry.cone.position.set(
      base.x + pad.tileNormal.x * (coneCenterOffset + launchLift),
      base.y + pad.tileNormal.y * (coneCenterOffset + launchLift),
      base.z + pad.tileNormal.z * (coneCenterOffset + launchLift),
    )
    entry.cone.visible = coneScale > 0
    if (coneScale > 0) {
      entry.cone.scale.set(1, coneScale, 1)
    }

    // Orient both meshes so their local +Y aligns with the tile normal (cylinder + cone both
    // default to +Y up; matching them to the normal keeps the slab flat on the planet surface
    // and the cone pointing up from the slab — exactly UMS UnityPad geometry).
    const localUp = new THREE.Vector3(0, 1, 0)
    const target = new THREE.Vector3(pad.tileNormal.x, pad.tileNormal.y, pad.tileNormal.z)
    const quat = new THREE.Quaternion().setFromUnitVectors(localUp, target)
    entry.slab.quaternion.copy(quat)
    entry.cone.quaternion.copy(quat)
  }
  // Remove entries whose pads disappeared (pad demolished, planet lost, etc).
  for (const [key, entry] of handle.entries) {
    if (alive.has(key)) continue
    handle.group.remove(entry.slab)
    handle.group.remove(entry.cone)
    entry.slab.geometry.dispose()
    ;(entry.slab.material as THREE.Material).dispose()
    entry.cone.geometry.dispose()
    ;(entry.cone.material as THREE.Material).dispose()
    handle.entries.delete(key)
  }
}

// === LAST HOPE ALARM HALO LAYER (PHASE 16.17) ===
// When a civ triggers their LAST_HOPE_EVAC, the home planet gains a pulsing orange-red halo
// at galactic scale so the player sees the civ-near-collapse state at a glance — different
// hue + faster pulse rate than the beacon-alert ring so they don't get confused.

export interface LastHopeAlarmLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<PlanetId, THREE.Mesh>
  readonly destroy: () => void
}

export function buildLastHopeAlarmLayer(): LastHopeAlarmLayerHandle {
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

export function syncLastHopeAlarms(
  handle: LastHopeAlarmLayerHandle,
  triggeredPlanetIds: ReadonlySet<PlanetId>,
  planetMeshes: ReadonlyMap<PlanetId, THREE.Mesh>,
  camera: THREE.Camera,
): void {
  for (const id of triggeredPlanetIds) {
    const mesh = planetMeshes.get(id)
    if (!mesh) continue
    let ring = handle.entries.get(id)
    if (!ring) {
      const r = mesh.geometry.boundingSphere?.radius ?? 80
      // Thicker, larger-radius ring than beacon-pulse so the two are visually distinct
      const geom = new THREE.RingGeometry(r + 60, r + 100, 48)
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff7733,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
      ring = new THREE.Mesh(geom, mat)
      ring.userData = { kind: 'last-hope-alarm', planetId: id }
      handle.group.add(ring)
      handle.entries.set(id, ring)
    }
    ring.position.copy(mesh.position)
    ring.lookAt(camera.position)
    const mat = ring.material as THREE.MeshBasicMaterial
    // Fast urgent pulse (110ms) vs beacon-pulse 220ms — reads as more critical
    mat.opacity = 0.55 + Math.sin(performance.now() / 110) * 0.35
  }
  for (const [id, ring] of handle.entries) {
    if (triggeredPlanetIds.has(id)) continue
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

// === MINING SHIP LAYER (PHASE 16.x complete-3D-world-space) ===
// Render every MiningShip beacon as a small cone mesh at ship.worldPosition. Phase-tinted
// color: DOCKED=blue, OUTBOUND=white, DRILLING=yellow, INBOUND=cyan, OFFLOADING=green.
// Per LAW #0 user verbatim 2026-05-10 "the game is complete 3D game world space" —
// ships in the sim need to be VISIBLE in the 3D scene, not just numbers in a panel.

export interface MiningShipEntry {
  readonly shipId: string
  readonly mesh: THREE.Mesh
  lastPosition: { x: number; y: number; z: number }
}

export interface MiningShipLayerHandle {
  readonly group: THREE.Group
  readonly entries: Map<string, MiningShipEntry>
  readonly destroy: () => void
}

const MINING_SHIP_COLORS: Readonly<Record<string, number>> = {
  DOCKED: 0x5588ff,
  IDLE: 0x5588ff,
  OUTBOUND_TRAVELING: 0xffffff,
  AT_DEPOSIT_DRILLING: 0xffd960,
  INBOUND_RETURNING: 0xc0e8ff,
  OFFLOADING: 0x55ff88,
  NO_SIGNAL: 0x666666,
}

const MINING_SHIP_SIZE_RADIUS = 12
const MINING_SHIP_SIZE_HEIGHT = 28

export function buildMiningShipLayer(): MiningShipLayerHandle {
  const group = new THREE.Group()
  const entries = new Map<string, MiningShipEntry>()
  return {
    group,
    entries,
    destroy: () => {
      for (const entry of entries.values()) {
        entry.mesh.geometry.dispose()
        const mat = entry.mesh.material as THREE.Material | THREE.Material[]
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat.dispose()
      }
      entries.clear()
    },
  }
}

export function syncMiningShips(
  handle: MiningShipLayerHandle,
  beacons: ReadonlyArray<ShipBeaconBroadcast>,
): void {
  const alive = new Set<string>()
  for (const b of beacons) {
    alive.add(b.shipId)
    const color = MINING_SHIP_COLORS[b.status] ?? 0xffffff
    let entry = handle.entries.get(b.shipId)
    if (!entry) {
      const geom = new THREE.ConeGeometry(MINING_SHIP_SIZE_RADIUS, MINING_SHIP_SIZE_HEIGHT, 6)
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.4,
        metalness: 0.3,
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.userData = { kind: 'mining-ship', shipId: b.shipId }
      handle.group.add(mesh)
      entry = {
        shipId: b.shipId,
        mesh,
        lastPosition: { ...b.worldPosition },
      }
      handle.entries.set(b.shipId, entry)
    } else {
      const mat = entry.mesh.material as THREE.MeshStandardMaterial
      if (mat.color.getHex() !== color) {
        mat.color.setHex(color)
        mat.emissive.setHex(color)
      }
    }
    // Orient ship cone (+Y local) along its travel direction so it "faces forward"
    const dx = b.worldPosition.x - entry.lastPosition.x
    const dy = b.worldPosition.y - entry.lastPosition.y
    const dz = b.worldPosition.z - entry.lastPosition.z
    const speedSq = dx * dx + dy * dy + dz * dz
    if (speedSq > 0.25) {
      const len = Math.sqrt(speedSq)
      const dir = new THREE.Vector3(dx / len, dy / len, dz / len)
      const up = new THREE.Vector3(0, 1, 0)
      entry.mesh.quaternion.setFromUnitVectors(up, dir)
    }
    entry.lastPosition = { ...b.worldPosition }
    entry.mesh.position.set(b.worldPosition.x, b.worldPosition.y, b.worldPosition.z)
    // Drilling pulse — ramp emissive when at deposit
    const mat = entry.mesh.material as THREE.MeshStandardMaterial
    if (b.status === 'AT_DEPOSIT_DRILLING') {
      mat.emissiveIntensity = 0.7 + 0.4 * Math.sin(performance.now() / 150 + b.atTick)
    } else {
      mat.emissiveIntensity = 0.6
    }
  }
  // Remove dead entries
  for (const [id, entry] of handle.entries) {
    if (alive.has(id)) continue
    handle.group.remove(entry.mesh)
    entry.mesh.geometry.dispose()
    ;(entry.mesh.material as THREE.Material).dispose()
    handle.entries.delete(id)
  }
}
