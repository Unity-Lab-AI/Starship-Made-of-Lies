// PHASE 17.B.4 — single source of truth for match-pacing balance.
//
// User design lock (per `feedback_match_length_10_to_24_hour_saga.md`):
// "match length is a 10-24 hour saga — Easy AI must never win in 3 minutes."
//
// At the default tick rate of 5 ticks/sec (200ms/tick), 10-24h ≈ 180k-432k ticks.
// The pre-17.B caps were sized for 5-30 min playtests, which is what let Easy AI
// finish a match before the human had time to build their first launch pad. This
// module centralizes every match-pacing knob so we never have to chase tunables
// across 20 files again — adjust the multiplier here, the whole game shifts together.
//
// The TODO entry for 17.B.4 lists three groups: tech costs × 3-5, AI decision intervals
// × 2-3, win-condition thresholds × 5-10. The constants below sit at the upper end of
// each range so Brutal AI still feels brutal but never trivially wins a 10-hour match.

// --- match length (ticks) ------------------------------------------------------------

// Pre-17.B caps were 1500 / 4500 / 9000. The saga lock requires 10-24h, so blitz becomes
// the smallest *real* match (1h), standard the daily-driver (10h), epic the marathon (24h).
// `open` stays infinite — host-configurable for forever-games.
export const MATCH_LENGTH_TICKS_BLITZ = 18_000 // 1h at 5 ticks/sec
export const MATCH_LENGTH_TICKS_STANDARD = 180_000 // 10h
export const MATCH_LENGTH_TICKS_EPIC = 432_000 // 24h

// --- research --------------------------------------------------------------------------

// Slows research-point accrual. Tech `costPoints` numbers in tech.ts stay raw so the
// per-tech rebalance work stays simple; the multiplier here scales the per-tick aggregate
// downward so reaching the same cost takes longer.
// PHASE 17.L.D (HOTFIX 2026-05-12) — bumped 4 → 200 (50× slower) per user verbatim *"i was
// able to just go through and research them all with no rhyme or reason to the points
// reqwuired"* + *"need ... a slow rate all scaled fopr our game"*. With 1000 starting pop +
// 15% research workforce = 150 scientists × 0.1 = 15 raw pts/tick. /200 = 0.075/tick pool
// fill. Tier-0 (30 pts): ~400 ticks = 80 sec wall-clock. Tier-2 (60 pts): ~2.7 min. Tier-4
// apex techs (500+ pts): ~22+ min. Fits the 10-24h saga at the early end; player can
// accelerate by stacking labs/universities or sliding more workforce to research.
export const RESEARCH_POINT_DIVISOR = 200

// --- AI decision intervals ------------------------------------------------------------

// Multiplies AIDifficultyConfig.decisionIntervalTicks. Easy 12 → 30 ticks (~6 sec per
// decision), Brutal 1 → 1 (instant — we don't dilute Brutal because it'd stop being brutal).
// Mid of the ×2-3 range applied to non-brutal levels. Brutal stays at its baseline.
export const AI_DECISION_INTERVAL_MULTIPLIER = 2.5
export const AI_DECISION_INTERVAL_MULTIPLIER_BRUTAL = 1.0

// --- win-condition thresholds --------------------------------------------------------

// The objectives system reads these multipliers when computing target values. The TODO
// asks for ×5-10; picked 8 (upper end) so map-control / highscore / resource targets all
// require an order-of-magnitude more progress than the pre-17.B values demanded.
export const WIN_THRESHOLD_HIGHSCORE_MULTIPLIER = 8
export const WIN_THRESHOLD_RESOURCE_MULTIPLIER = 8
export const WIN_THRESHOLD_MAP_CONTROL_FRACTION = 0.6 // need 60% of planets vs. older 33%

// --- universe spatial layout ---------------------------------------------------------

// PHASE 17.I — toroidal universe wrap half-extent. Positions wrap modulo 2 × this on each
// axis. Previously a private const in colony-ship-flight (8000), then centralized at 60000.
//
// PHASE 17.L.D.5 (HOTFIX 2026-05-11) — bumped cap 500000 → 2500000 because D.5 bumped
// PLANET_ORBIT_MIN/MAX (8000/16000 → 20000/40000) + STAR_CLEARANCE_FACTOR (1.2 → 3.0) to
// keep planets out of the star corona. System bounding-radius grew to ~80k, which needs
// proportionally bigger universes (Large preset hits ~1.9M half-extent). Hulk-wrap continues
// using the cap (worst-case wrap; harmless cosmetic at any scale).
//
// PHASE 17.L.D.1 — global CAP. Actual per-galaxy half-extent computed via
// computeUniverseHalfExtent(starCount) below so 2-system "Tiny" galaxies don't sit in the
// same cube as 143-system "Large" galaxies.
export const UNIVERSE_HALF_EXTENT = 2500000

// PHASE 17.L.D.5 (HOTFIX 2026-05-11) — FLOOR 80000 → 150000, PER_STAR 5000 → 12000 to
// match the bigger system bounding-radius after STAR_CLEARANCE + ORBIT bumps. Math:
//   system bounding-radius = orbit_max (40k) + bounding pad (25k) + star_max (15k) = ~80k
//   min center-to-center spacing = 2 × 80k = 160k
//   N-system cube side ≈ N^(1/3) × 160k × 1.2 (packing factor)
//   Tiny (3):   side ≈ 277k → half 138k. FLOOR=150k covers + margin.
//   Small (14): side ≈ 463k → half 231k. FLOOR + 14×12k = 318k → comfortable.
//   Large (143): side ≈ 1.00M → half 502k. FLOOR + 143×12k = 1.87M → very comfortable.
export const UNIVERSE_HALF_EXTENT_FLOOR = 150000
export const UNIVERSE_HALF_EXTENT_PER_STAR = 12000

export function computeUniverseHalfExtent(starCount: number): number {
  const scaled = UNIVERSE_HALF_EXTENT_FLOOR + Math.max(0, starCount) * UNIVERSE_HALF_EXTENT_PER_STAR
  return Math.min(UNIVERSE_HALF_EXTENT, Math.max(UNIVERSE_HALF_EXTENT_FLOOR, scaled))
}

// PHASE 17.I — star scale rule (LAW #0 2026-05-11):
// > "stars need to be 4x bigger thasn planets in scal of the largest planet"
// Star radius = 4 × galaxy-wide largest planet's surfaceRadius. Applied globally so every
// star in a galaxy is the same size — they are scaled against the biggest body in the
// cluster, not against their own system.
export const STAR_RADIUS_PLANET_MULTIPLIER = 4

// PHASE 17.I — solar-system layout. 4-10 planets per star per user verbatim. Planet local
// offsets from parent star are in this range — close enough to read as "one star's planets"
// at solar-system zoom but spaced enough that they don't visually overlap each other.
export const MIN_PLANETS_PER_STAR = 4
export const MAX_PLANETS_PER_STAR = 10
// PHASE 17.L.D.5 (HOTFIX 2026-05-11) — bumped 8000→20000 and 16000→40000 to give planets
// clear breathing room outside the star corona. Combined with STAR_CLEARANCE_FACTOR 3.0
// in galaxy.ts, the effective orbit_min for a star of any spectral class is now
// max(20000, star_radius × 3.0), which keeps planet centers >18k off the star surface
// at every class. Per user verbatim *"planets are way too close to the stars.. they are
// literally in the stars' corona"*.
export const PLANET_ORBIT_MIN_OFFSET = 20000
export const PLANET_ORBIT_MAX_OFFSET = 40000
// Padding added to each solar system's bounding sphere so adjacent systems have visual
// breathing room (no two planets ALMOST touching across system boundaries).
//
// PHASE 17.L.D.1 (HOTFIX 2026-05-11) — bumped 4000 → 25000 to force loose-cluster spacing
// even at high system densities. Combined with computeUniverseHalfExtent's per-system
// scaling above, this guarantees adjacent system centers are at least ~80-90k apart
// (orbit_max 16k + pad 25k) × 2 — astronomical breathing room.
export const SOLAR_SYSTEM_BOUNDING_PAD = 25000

// --- mining-outpost economy (mirrored here so designers can tune in one place) -------

export const MINING_OUTPOST_SHIP_INTERVAL_TICKS = 80
export const MINING_OUTPOST_SHIP_COST_INGOTS = 40
export const MINING_OUTPOST_SHIP_COST_COMPONENTS = 20
export const MINING_OUTPOST_SHIP_COST_FUEL = 15
export const MAX_MINERS_PER_OUTPOST = 3
