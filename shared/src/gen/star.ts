import { type StarId, type Vec3 } from '../types/index'

// PHASE 17.I — Star as first-class galaxy entity. Per user verbatim 2026-05-11 the universe
// is structured as solar systems (one Star + 4-10 planets), not as a flat cluster of planets.
// Stars form the galactic-scale arrangement; planets are positioned relative to their parent
// star and inherit a `parentStarId` reference.
//
// Scale rule (LAW #0): `radius = STAR_RADIUS_PLANET_MULTIPLIER × galaxyMaxPlanetRadius`. The
// Star.radius BASELINE is the same across every star in a given galaxy. Spectral-class
// multipliers (super-review fix) vary actual rendered radius slightly around that baseline
// so the cluster doesn't look like a cookie-cutter blob.

// Super-review fix: spectral-class table. Real stars are classified by Harvard sequence
// (O/B/A/F/G/K/M, hottest to coolest). Each class gets a distinct HDR-emissive tint + size
// multiplier around the galaxy baseline. Weight column distributes occurrence per real-world
// stellar demographics (M dwarves dominate; O giants are vanishingly rare).
export interface SpectralClassDef {
  readonly id: 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'
  readonly weight: number
  readonly color: number
  readonly radiusMultiplier: number
}

export const SPECTRAL_CLASSES: ReadonlyArray<SpectralClassDef> = [
  // O — blue-white giants. Hot, rare, big.
  { id: 'O', weight: 0.01, color: 0x9bbeff, radiusMultiplier: 1.6 },
  // B — blue-white. Hot, uncommon.
  { id: 'B', weight: 0.05, color: 0xaecfff, radiusMultiplier: 1.3 },
  // A — white. Sirius-like.
  { id: 'A', weight: 0.1, color: 0xeaf2ff, radiusMultiplier: 1.15 },
  // F — yellow-white.
  { id: 'F', weight: 0.15, color: 0xfff5e1, radiusMultiplier: 1.05 },
  // G — yellow (our Sun is G2). Balanced biome bias.
  { id: 'G', weight: 0.25, color: 0xffd28a, radiusMultiplier: 1.0 },
  // K — orange.
  { id: 'K', weight: 0.24, color: 0xffae65, radiusMultiplier: 0.85 },
  // M — red dwarves. Most common stars in the real universe; small + dim.
  { id: 'M', weight: 0.2, color: 0xff7a52, radiusMultiplier: 0.7 },
]

export function rollSpectralClass(rng: () => number): SpectralClassDef {
  const total = SPECTRAL_CLASSES.reduce((s, c) => s + c.weight, 0)
  let roll = rng() * total
  for (const c of SPECTRAL_CLASSES) {
    roll -= c.weight
    if (roll <= 0) return c
  }
  return SPECTRAL_CLASSES[SPECTRAL_CLASSES.length - 1]!
}

export interface Star {
  readonly id: StarId
  readonly displayName: string
  readonly position: Vec3
  // World-space outer radius (visual sphere). Computed as
  // STAR_RADIUS_PLANET_MULTIPLIER × galaxy-wide largest-planet surfaceRadius
  // × spectralClass.radiusMultiplier so M dwarves are visibly smaller than O giants while
  // staying in the same scale band as the 4× LAW #0 baseline.
  readonly radius: number
  // System bounding-sphere radius used for collision-free placement. Equals the maximum of
  // (star.radius + 0) and (max planet.localOffset.length + planet.surfaceRadius), plus the
  // SOLAR_SYSTEM_BOUNDING_PAD breathing room. Two solar systems never overlap when their
  // centers are at distance > sum of their boundingRadii (wrap-aware).
  readonly boundingRadius: number
  // HDR-tinted hex per spectral class.
  readonly color: number
  // Harvard spectral class id (O/B/A/F/G/K/M).
  readonly spectralClass: SpectralClassDef['id']
}
