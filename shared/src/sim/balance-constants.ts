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
// downward so reaching the same cost takes longer. Picked 4.0 (mid of the ×3-5 range).
export const RESEARCH_POINT_DIVISOR = 4

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
// axis. Previously a private const in colony-ship-flight (8000), now centralized so galaxy
// generation + flight wrap + collision math all agree. Sized large enough to contain the
// solar-system clustered galaxy with collision-free placement at 100+ planets.
export const UNIVERSE_HALF_EXTENT = 60000

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
export const PLANET_ORBIT_MIN_OFFSET = 8000
export const PLANET_ORBIT_MAX_OFFSET = 16000
// Padding added to each solar system's bounding sphere so adjacent systems have visual
// breathing room (no two planets ALMOST touching across system boundaries).
export const SOLAR_SYSTEM_BOUNDING_PAD = 4000

// --- mining-outpost economy (mirrored here so designers can tune in one place) -------

export const MINING_OUTPOST_SHIP_INTERVAL_TICKS = 80
export const MINING_OUTPOST_SHIP_COST_INGOTS = 40
export const MINING_OUTPOST_SHIP_COST_COMPONENTS = 20
export const MINING_OUTPOST_SHIP_COST_FUEL = 15
export const MAX_MINERS_PER_OUTPOST = 3
