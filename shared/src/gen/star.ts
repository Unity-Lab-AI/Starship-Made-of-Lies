import { type StarId, type Vec3 } from '../types/index'

// PHASE 17.I — Star as first-class galaxy entity. Per user verbatim 2026-05-11 the universe
// is structured as solar systems (one Star + 4-10 planets), not as a flat cluster of planets.
// Stars form the galactic-scale arrangement; planets are positioned relative to their parent
// star and inherit a `parentStarId` reference.
//
// Scale rule (LAW #0): `radius = STAR_RADIUS_PLANET_MULTIPLIER × galaxyMaxPlanetRadius`. The
// Star.radius field is the same across every star in a given galaxy — they are sized against
// the biggest planet anywhere in the cluster, not against their own system.

export interface Star {
  readonly id: StarId
  readonly displayName: string
  readonly position: Vec3
  // World-space outer radius (visual sphere). Set by galaxy gen using
  // STAR_RADIUS_PLANET_MULTIPLIER × galaxy-wide largest-planet surfaceRadius.
  readonly radius: number
  // System bounding-sphere radius used for collision-free placement. Equals the maximum of
  // (star.radius + 0) and (max planet.localOffset.length + planet.surfaceRadius), plus the
  // SOLAR_SYSTEM_BOUNDING_PAD breathing room. Two solar systems never overlap when their
  // centers are at distance > sum of their boundingRadii (wrap-aware).
  readonly boundingRadius: number
  // Cinematic color (HDR-tinted hex). v1: warm yellow-white default. Spectral-class variation
  // ships in a later 17.I sub-task — for now one color so the visual identity is consistent.
  readonly color: number
}
