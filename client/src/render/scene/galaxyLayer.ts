import * as THREE from 'three'
import { type Galaxy, type Planet, type PlanetId } from '@smol/shared'

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
  readonly destroy: () => void
}

export function buildGalaxyLayer(galaxy: Galaxy): GalaxyLayerHandle {
  const group = new THREE.Group()
  const planetMeshes = new Map<PlanetId, THREE.Mesh>()

  // Starfield background
  const starfield = makeStarfield(galaxy.seed ?? 12345)
  group.add(starfield)

  // Center the galaxy on its mean position
  const center = computeGalaxyCenter(galaxy.planets)
  for (const planet of galaxy.planets) {
    const mesh = makePlanetMesh(planet, center)
    group.add(mesh)
    planetMeshes.set(planet.id, mesh)
  }

  // Ambient + directional lighting so spheres aren't flat
  const ambient = new THREE.AmbientLight(0xffffff, 0.42)
  const directional = new THREE.DirectionalLight(0xffffff, 0.65)
  directional.position.set(1, 1, 0.5)
  group.add(ambient, directional)

  return {
    group,
    planetMeshes,
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

function planetRadius(planet: Planet): number {
  const tileCount = planet.tiles.length
  if (tileCount <= 40) return 60
  if (tileCount <= 100) return 90
  if (tileCount <= 300) return 130
  return 180
}

function makePlanetMesh(planet: Planet, center: THREE.Vector3): THREE.Mesh {
  const radius = planetRadius(planet)
  const biomeId = String(planet.biome.id)
  const color = BIOME_COLORS[biomeId] ?? BIOME_COLORS['default']!
  const geom = new THREE.SphereGeometry(radius, 24, 18)
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
  mesh.userData = { kind: 'planet', planetId: planet.id }
  return mesh
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
