import { mulberry32, planetId, type Vec3 } from '../types/index'
import { BIOMES, biomesByTier } from './biome'
import { generatePlanet, type Planet } from './planet'

export interface GalaxyConfig {
  readonly seed: number
  readonly planetCount: number
}

export interface Galaxy {
  readonly seed: number
  readonly planets: ReadonlyArray<Planet>
}

const MIN_PLANET_COUNT = 100
const MAX_PLANET_COUNT = 1000
const GALAXY_RADIUS = 100_000

export function generateGalaxy(config: GalaxyConfig): Galaxy {
  if (config.planetCount < MIN_PLANET_COUNT || config.planetCount > MAX_PLANET_COUNT) {
    throw new Error(
      `Galaxy planet count must be ${MIN_PLANET_COUNT}-${MAX_PLANET_COUNT}, got ${config.planetCount}`,
    )
  }
  const rng = mulberry32(config.seed)
  const planets: Planet[] = []

  for (let i = 0; i < config.planetCount; i++) {
    const r = GALAXY_RADIUS * Math.cbrt(rng())
    const theta = rng() * Math.PI * 2
    const phi = Math.acos(2 * rng() - 1)
    const position: Vec3 = {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    }
    const biomeIndex = Math.floor(rng() * BIOMES.length)
    const biome = BIOMES[biomeIndex]
    if (!biome) throw new Error('Biome catalog empty')
    const planetRadius = 3000 + rng() * 5000
    const id = planetId(`planet-${i}`)
    planets.push(generatePlanet({ id, position, biome, radius: planetRadius }))
  }

  return { seed: config.seed, planets }
}

export function findStartingPlanet(galaxy: Galaxy): Planet {
  const candidates = galaxy.planets.filter((p) => p.biome.hostilityTier === 0)
  if (candidates.length === 0) {
    throw new Error(
      'No tier-0 biome planets in galaxy — generation failed; need a Terran/Archipelago',
    )
  }
  const first = candidates[0]
  if (!first) throw new Error('Unreachable')
  return first
}

export function planetsByHostilityTier(galaxy: Galaxy, tier: 0 | 1 | 2 | 3): ReadonlyArray<Planet> {
  return galaxy.planets.filter((p) => p.biome.hostilityTier === tier)
}

export function biomeDistribution(galaxy: Galaxy): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const p of galaxy.planets) {
    counts[p.biome.id] = (counts[p.biome.id] ?? 0) + 1
  }
  return counts
}

export { biomesByTier }
