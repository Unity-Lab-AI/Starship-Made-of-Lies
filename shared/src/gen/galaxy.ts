import { mulberry32, planetId, starId, type StarId, type Vec3 } from '../types/index'
import {
  MAX_PLANETS_PER_STAR,
  MIN_PLANETS_PER_STAR,
  PLANET_ORBIT_MAX_OFFSET,
  PLANET_ORBIT_MIN_OFFSET,
  SOLAR_SYSTEM_BOUNDING_PAD,
  STAR_RADIUS_PLANET_MULTIPLIER,
  UNIVERSE_HALF_EXTENT,
} from '../sim/balance-constants'
import { BIOMES, biomesByTier } from './biome'
import {
  generatePlanet,
  planetRenderRadius,
  rollPlanetSizeTier,
  type Planet,
  type PlanetSizeTier,
} from './planet'
import { rollSpectralClass, type SpectralClassDef, type Star } from './star'

export interface GalaxyConfig {
  readonly seed: number
  readonly planetCount: number
}

export interface Galaxy {
  readonly seed: number
  readonly stars: ReadonlyArray<Star>
  readonly planets: ReadonlyArray<Planet>
}

// Super-review SR2-15 fix: floor dropped 100 → 20 so future "small galaxy" presets (per
// TODO 17.I.10) can use the same gen path. 20 / MAX_PLANETS_PER_STAR (10) = 2 stars minimum,
// 20 / MIN_PLANETS_PER_STAR (4) = 5 stars max — `planStarPlanetCounts` handles the clamp.
const MIN_PLANET_COUNT = 20
const MAX_PLANET_COUNT = 1000
const AVG_PLANETS_PER_STAR = 7
// Rejection-sample attempts per star placement before we widen the allowed placement region.
// At reasonable densities (<= ~150 stars in a ±60k cube) this rarely fires more than a few
// times per star; the doubling fallback handles pathological cases.
const PLACEMENT_ATTEMPTS_PER_STAR = 64
const MAX_PLACEMENT_GROWTH_ITERATIONS = 6

interface PreRolledPlanet {
  readonly sizeTier: PlanetSizeTier
  readonly worldRadius: number
  readonly surfaceRadius: number
  readonly localOffset: Vec3
  readonly biomeIndex: number
}

interface PreRolledSystem {
  readonly planets: PreRolledPlanet[]
  // Computed bounding-sphere radius around the star center. Used for collision-free placement
  // of solar systems in the galactic cluster.
  readonly boundingRadius: number
}

// PHASE 17.I — toroidal (wrap-aware) distance between two points in a cube universe of
// half-extent H. The minimum-image convention used in molecular dynamics: distance along each
// axis is min(|d_i|, 2H - |d_i|). Matches the galacticWrap() semantics in colony-ship-flight
// so collision-free placement at galaxy edges respects the universe wrap.
function toroidalDistance(a: Vec3, b: Vec3, halfExtent: number): number {
  const span = halfExtent * 2
  const wrap1d = (d: number): number => {
    const abs = Math.abs(d)
    return Math.min(abs, span - abs)
  }
  const dx = wrap1d(a.x - b.x)
  const dy = wrap1d(a.y - b.y)
  const dz = wrap1d(a.z - b.z)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function vec3Length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

function rollPointOnUnitSphere(rng: () => number): Vec3 {
  const theta = rng() * Math.PI * 2
  const phi = Math.acos(2 * rng() - 1)
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(phi),
  }
}

function rollPointInBall(rng: () => number, maxR: number): Vec3 {
  const r = maxR * Math.cbrt(rng())
  const dir = rollPointOnUnitSphere(rng)
  return { x: dir.x * r, y: dir.y * r, z: dir.z * r }
}

// Decides how many planets each star gets. The total must equal `targetPlanetCount`; each star
// gets between MIN_PLANETS_PER_STAR and MAX_PLANETS_PER_STAR. The last star absorbs whatever
// rounding error remains, clamped to the same range. Returns the actual star count + the
// per-star planet counts.
function planStarPlanetCounts(
  rng: () => number,
  targetPlanetCount: number,
): { readonly starCount: number; readonly perStarCounts: number[] } {
  let starCount = Math.max(1, Math.round(targetPlanetCount / AVG_PLANETS_PER_STAR))
  // Clamp star count to the range that can actually carry the planet count.
  const minStars = Math.ceil(targetPlanetCount / MAX_PLANETS_PER_STAR)
  const maxStars = Math.floor(targetPlanetCount / MIN_PLANETS_PER_STAR)
  if (maxStars >= minStars) {
    starCount = Math.max(minStars, Math.min(maxStars, starCount))
  } else {
    // Degenerate: targetPlanetCount sits awkwardly between MIN and MAX × any integer. Just
    // honor the average — the last-star absorber will clamp.
    starCount = Math.max(1, starCount)
  }
  const perStarCounts: number[] = []
  let remaining = targetPlanetCount
  for (let s = 0; s < starCount; s++) {
    const remainingStars = starCount - s
    const minNeededForRest = (remainingStars - 1) * MIN_PLANETS_PER_STAR
    const maxNeededForRest = (remainingStars - 1) * MAX_PLANETS_PER_STAR
    const thisMin = Math.max(MIN_PLANETS_PER_STAR, remaining - maxNeededForRest)
    const thisMax = Math.min(MAX_PLANETS_PER_STAR, remaining - minNeededForRest)
    const lo = Math.min(thisMin, thisMax)
    const hi = Math.max(thisMin, thisMax)
    const count = lo + Math.floor(rng() * (hi - lo + 1))
    perStarCounts.push(count)
    remaining -= count
  }
  return { starCount, perStarCounts }
}

// Walks the prerolled systems and rejection-samples a position for each within a ball of
// `halfExtent`. Two systems are considered colliding when their wrap-aware distance is less
// than the sum of their bounding radii. If any system fails to place after
// PLACEMENT_ATTEMPTS_PER_STAR attempts, the placement is restarted with a bigger ball; after
// MAX_PLACEMENT_GROWTH_ITERATIONS we cap at UNIVERSE_HALF_EXTENT and place whatever fits.
//
// PHASE 17.B(super-review fix): placement uses a FORKED RNG substream derived from
// `placementSeed`. Each growth iteration is `mulberry32(placementSeed ^ growth)` so:
//   (a) the main galaxy RNG is NEVER consumed during placement (deterministic galaxy gen
//       independent of placement retry count — required for save/load + replay)
//   (b) each retry uses a different but deterministic substream so it actually explores new
//       positions instead of repeating the same failed attempts.
function placeSystems(
  placementSeed: number,
  systems: ReadonlyArray<PreRolledSystem>,
  halfExtent: number,
): Vec3[] {
  let currentHalf = halfExtent
  for (let growth = 0; growth < MAX_PLACEMENT_GROWTH_ITERATIONS; growth++) {
    const placementRng = mulberry32((placementSeed ^ (growth * 0x9e3779b1)) >>> 0)
    const positions: Vec3[] = []
    let failed = false
    for (let s = 0; s < systems.length; s++) {
      const system = systems[s]!
      const allowedR = Math.max(0, currentHalf - system.boundingRadius)
      let placed: Vec3 | null = null
      for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS_PER_STAR; attempt++) {
        const candidate = rollPointInBall(placementRng, allowedR)
        let collision = false
        for (let other = 0; other < positions.length; other++) {
          const otherPos = positions[other]!
          const otherR = systems[other]!.boundingRadius
          const required = system.boundingRadius + otherR
          if (toroidalDistance(candidate, otherPos, currentHalf) < required) {
            collision = true
            break
          }
        }
        if (!collision) {
          placed = candidate
          break
        }
      }
      if (!placed) {
        failed = true
        break
      }
      positions.push(placed)
    }
    if (!failed) return positions
    // Grow the ball and retry on the NEXT growth seed iteration. 1.5× doubling spreads the
    // universe gracefully without exploding wrap distances.
    currentHalf = Math.min(UNIVERSE_HALF_EXTENT, Math.floor(currentHalf * 1.5))
  }
  // Final fallback: place at UNIVERSE_HALF_EXTENT with one last deterministic substream.
  const finalRng = mulberry32((placementSeed ^ 0xfa11ba75) >>> 0)
  const positions: Vec3[] = []
  for (let s = 0; s < systems.length; s++) {
    const system = systems[s]!
    positions.push(
      rollPointInBall(finalRng, Math.max(0, UNIVERSE_HALF_EXTENT - system.boundingRadius)),
    )
  }
  return positions
}

export function generateGalaxy(config: GalaxyConfig): Galaxy {
  if (config.planetCount < MIN_PLANET_COUNT || config.planetCount > MAX_PLANET_COUNT) {
    throw new Error(
      `Galaxy planet count must be ${MIN_PLANET_COUNT}-${MAX_PLANET_COUNT}, got ${config.planetCount}`,
    )
  }
  const rng = mulberry32(config.seed)

  // 1. Star count + per-star planet counts so the total matches config.planetCount.
  const { starCount, perStarCounts } = planStarPlanetCounts(rng, config.planetCount)

  // 2. Pre-roll planet sizes per star so we can find the galaxy-wide largest planet radius
  //    BEFORE deciding the star size (LAW #0: star.radius = 4 × largest planet radius).
  let maxPlanetSurfaceRadius = 0
  const preRolledSizes: {
    sizeTier: PlanetSizeTier
    worldRadius: number
    surfaceRadius: number
  }[][] = []
  for (let s = 0; s < starCount; s++) {
    const sizes: { sizeTier: PlanetSizeTier; worldRadius: number; surfaceRadius: number }[] = []
    for (let p = 0; p < perStarCounts[s]!; p++) {
      const sizeRoll = rollPlanetSizeTier(rng)
      const surfaceRadius = planetRenderRadius(sizeRoll.tier)
      sizes.push({ sizeTier: sizeRoll.tier, worldRadius: sizeRoll.worldRadius, surfaceRadius })
      if (surfaceRadius > maxPlanetSurfaceRadius) maxPlanetSurfaceRadius = surfaceRadius
    }
    preRolledSizes.push(sizes)
  }
  const starRadius = maxPlanetSurfaceRadius * STAR_RADIUS_PLANET_MULTIPLIER

  // 3. Re-roll the per-planet offsets + biomes per system + per-star spectral class. We
  //    separate sizes (step 2) from offsets (step 3) because step 2 needs to complete BEFORE
  //    step 3 so the largest-planet pass is deterministic. Spectral class is rolled here so
  //    bounding sphere can include the spectral-scaled star radius.
  const systems: PreRolledSystem[] = []
  const spectralClasses: SpectralClassDef[] = []
  for (let s = 0; s < starCount; s++) {
    const sizesForStar = preRolledSizes[s]!
    const spectral = rollSpectralClass(rng)
    spectralClasses.push(spectral)
    const starRadiusForThisSystem = starRadius * spectral.radiusMultiplier
    // Super-review SR2-2 fix: per-system orbit-min must clear the spectral-scaled star
    // radius with safety margin. O-class star at 10240 radius would otherwise engulf planets
    // orbiting at the global PLANET_ORBIT_MIN_OFFSET (8000). 1.2× clearance keeps planets
    // visibly outside the photosphere without crowding the orbit band.
    const STAR_CLEARANCE_FACTOR = 1.2
    const systemOrbitMin = Math.max(
      PLANET_ORBIT_MIN_OFFSET,
      starRadiusForThisSystem * STAR_CLEARANCE_FACTOR,
    )
    // Scale orbit max proportionally so the orbit band always has the same width as designed.
    const systemOrbitMax = systemOrbitMin + (PLANET_ORBIT_MAX_OFFSET - PLANET_ORBIT_MIN_OFFSET)
    const planets: PreRolledPlanet[] = []
    let maxSystemExtent = starRadiusForThisSystem
    for (let p = 0; p < sizesForStar.length; p++) {
      const size = sizesForStar[p]!
      const orbitR = systemOrbitMin + rng() * (systemOrbitMax - systemOrbitMin)
      const dir = rollPointOnUnitSphere(rng)
      const localOffset: Vec3 = { x: dir.x * orbitR, y: dir.y * orbitR, z: dir.z * orbitR }
      const biomeIndex = Math.floor(rng() * BIOMES.length)
      planets.push({
        sizeTier: size.sizeTier,
        worldRadius: size.worldRadius,
        surfaceRadius: size.surfaceRadius,
        localOffset,
        biomeIndex,
      })
      const extent = vec3Length(localOffset) + size.surfaceRadius
      if (extent > maxSystemExtent) maxSystemExtent = extent
    }
    systems.push({ planets, boundingRadius: maxSystemExtent + SOLAR_SYSTEM_BOUNDING_PAD })
  }

  // 4. Place stars with collision-free, wrap-aware rejection sampling. Placement uses a
  //    FORKED rng substream so retries can't perturb the main galaxy rng state — same seed
  //    → same galaxy, guaranteed, regardless of how many collision retries happened.
  const placementSeed = (config.seed ^ 0x70_15_45_e1) >>> 0
  const starPositions = placeSystems(placementSeed, systems, UNIVERSE_HALF_EXTENT)

  // 5. Build Star + Planet entities. Planet world position = star.position + localOffset.
  //    Note: localOffset isn't toroidally wrapped here — if a star sits within bound of the
  //    edge, planets can land slightly outside the half-extent. That's fine; galacticWrap is
  //    only invoked on EMPTY_HULK drift, not on planet positions, and rendering handles
  //    >half-extent positions cleanly.
  const stars: Star[] = []
  const planets: Planet[] = []
  for (let s = 0; s < starCount; s++) {
    const system = systems[s]!
    const starPos = starPositions[s]!
    const spectral = spectralClasses[s]!
    const sid: StarId = starId(`star-${s}`)
    stars.push({
      id: sid,
      displayName: `${spectral.id}-${s + 1}`,
      position: starPos,
      radius: starRadius * spectral.radiusMultiplier,
      boundingRadius: system.boundingRadius,
      color: spectral.color,
      spectralClass: spectral.id,
    })
    let planetIndex = 0
    for (const planetRoll of system.planets) {
      const biome = BIOMES[planetRoll.biomeIndex]
      if (!biome) throw new Error('Biome catalog empty')
      const planetWorldPos: Vec3 = {
        x: starPos.x + planetRoll.localOffset.x,
        y: starPos.y + planetRoll.localOffset.y,
        z: starPos.z + planetRoll.localOffset.z,
      }
      const pid = planetId(`planet-${s}-${planetIndex}`)
      planets.push(
        generatePlanet({
          id: pid,
          position: planetWorldPos,
          biome,
          radius: planetRoll.worldRadius,
          sizeTier: planetRoll.sizeTier,
          rng,
          parentStarId: sid,
          localOffset: planetRoll.localOffset,
        }),
      )
      planetIndex += 1
    }
  }

  return {
    seed: config.seed,
    stars,
    planets,
  }
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

// PHASE 17.I — convenience accessor: every planet that orbits a given star. Iterates
// galaxy.planets once. For panels that group by parent star.
export function planetsForStar(galaxy: Galaxy, sid: StarId): ReadonlyArray<Planet> {
  return galaxy.planets.filter((p) => p.parentStarId === sid)
}

export { biomesByTier }
