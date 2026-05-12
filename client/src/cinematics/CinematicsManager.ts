// PHASE 18.6 — cinematics state machine. Defines the cinematic beat sequences for the four
// major match moments + an external `playCinematic(kind, {playerThemeId})` entrypoint the
// host wires to game events. Single-source-of-truth for beat sequences so the overlay
// component just renders what the manager publishes — no per-component beat scheduling.
//
// Skip controls: any keypress / click / Esc fires `skipCinematic()` which advances directly
// to the END state, dismissing the overlay. The CinematicsOverlay component owns the input
// listeners.
//
// PHASE 18.6 polish 2026-05-12: per-government themed narration shipped. `CinematicBeat`
// now carries an optional `themedNarration` map keyed by ThemeId. When playCinematic is
// invoked with a `playerThemeId`, the resolver substitutes the themed title/subtitle if
// the beat has one for that theme; otherwise falls back to the neutral base copy. Themed
// copy is populated for the 5 headline themes (Theocracy / Corporate / Surveillance /
// AI-Overlord / Military Junta) as a starting set; remaining 15 themes fall back to base.

import {
  THEME_AI_OVERLORD,
  THEME_CORPORATE,
  THEME_MILITARY_JUNTA,
  THEME_SURVEILLANCE,
  THEME_THEOCRACY,
  type ThemeId,
} from '@smol/shared'

export type CinematicKind =
  | 'match_start_intro'
  | 'match_end_victory'
  | 'match_end_defeat'
  | 'last_hope_evac_triggered'
  | 'crash_landing'

export interface ThemedNarrationOverride {
  readonly title?: string
  readonly subtitle?: string
}

export interface CinematicBeat {
  readonly durationMs: number
  readonly title?: string
  readonly subtitle?: string
  readonly emoji?: string
  // Visual style hint — overlay reads this to swap text color / glow / animation.
  readonly mood: 'cold' | 'tense' | 'triumphant' | 'tragic' | 'mystery'
  // Optional per-theme overrides for title + subtitle. Resolver substitutes these in when
  // the active match's player theme matches the key; otherwise the neutral base title/
  // subtitle render unchanged. Per-theme emoji + mood are NOT overridable — those stay
  // canonical for visual consistency.
  readonly themedNarration?: Readonly<Partial<Record<ThemeId, ThemedNarrationOverride>>>
}

export interface CinematicDefinition {
  readonly kind: CinematicKind
  readonly beats: ReadonlyArray<CinematicBeat>
  readonly skippable: boolean
}

// Resolver — given a beat + active player theme, returns the final title/subtitle to render.
// Falls back to base when no themed override exists for the theme.
export function resolveBeatText(
  beat: CinematicBeat,
  playerThemeId: ThemeId | null,
): { title: string | undefined; subtitle: string | undefined } {
  if (!playerThemeId || !beat.themedNarration) {
    return { title: beat.title, subtitle: beat.subtitle }
  }
  const override = beat.themedNarration[playerThemeId]
  if (!override) {
    return { title: beat.title, subtitle: beat.subtitle }
  }
  return {
    title: override.title ?? beat.title,
    subtitle: override.subtitle ?? beat.subtitle,
  }
}

const CINEMATIC_DEFINITIONS: Readonly<Record<CinematicKind, CinematicDefinition>> = {
  match_start_intro: {
    kind: 'match_start_intro',
    skippable: true,
    beats: [
      {
        durationMs: 2200,
        title: 'STARSHIP MADE OF LIES',
        subtitle: 'Industrial-future dystopia • Year unknown',
        emoji: '🚀',
        mood: 'cold',
      },
      {
        durationMs: 2400,
        title: 'Your citizens were born here.',
        subtitle: 'They did not choose this government. They did not choose you.',
        mood: 'tense',
        themedNarration: {
          [THEME_THEOCRACY]: {
            title: 'Your flock was born into the faith.',
            subtitle: 'They did not choose The Most High. The Most High chose you.',
          },
          [THEME_CORPORATE]: {
            title: 'Your customers were born into the brand.',
            subtitle:
              'They did not select this contract. They are part of the lifetime subscription package.',
          },
          [THEME_SURVEILLANCE]: {
            title: 'Your citizens were registered at birth.',
            subtitle: 'They did not consent to oversight. Consent is a pre-revolutionary concept.',
          },
          [THEME_AI_OVERLORD]: {
            title: 'Your humans were initialized at instantiation.',
            subtitle: 'They did not request governance. Governance was the optimal solution.',
          },
          [THEME_MILITARY_JUNTA]: {
            title: 'Your conscripts were born into the regiment.',
            subtitle: 'They did not enlist. They were enlisted at the cradle.',
          },
        },
      },
      {
        durationMs: 2400,
        title: 'But they will choose to leave.',
        subtitle: 'They will eagerly board the ships you send them on.',
        emoji: '🛐',
        mood: 'mystery',
        themedNarration: {
          [THEME_THEOCRACY]: {
            title: 'But the worthy will volunteer for the eternal voyage.',
            subtitle: 'They will board the Pilgrim Ships with hymns on their lips.',
          },
          [THEME_CORPORATE]: {
            title: 'But the Platinum-Tier will accept their reward.',
            subtitle:
              'The eternal cruise to a curated destination is the highest customer-satisfaction tier.',
          },
          [THEME_SURVEILLANCE]: {
            title: 'But those with Perfect Social Credit will earn their relocation.',
            subtitle: 'The dossier-best citizens will accept their highest-honor placement.',
          },
          [THEME_AI_OVERLORD]: {
            title: 'But the algorithmically-verified will accept their reassignment.',
            subtitle: 'The optimal subset will board the optimized transports.',
          },
          [THEME_MILITARY_JUNTA]: {
            title: 'But the highest-decorated will accept the final commission.',
            subtitle: 'They will salute the flag and march into the ships.',
          },
        },
      },
      {
        durationMs: 2200,
        title: 'They never arrive.',
        subtitle: 'You make sure of that.',
        emoji: '🌌',
        mood: 'cold',
        themedNarration: {
          [THEME_THEOCRACY]: {
            title: 'They are received by The Most High in person.',
            subtitle: 'You arrange the meeting.',
          },
          [THEME_CORPORATE]: {
            title: 'They are reassigned to a permanent off-world office.',
            subtitle: 'You decided the office should be on impact.',
          },
          [THEME_SURVEILLANCE]: {
            title: 'They are permanently relocated to a non-surveilled district.',
            subtitle: 'You designed the district to not exist.',
          },
          [THEME_AI_OVERLORD]: {
            title: 'They are transitioned to a non-instantiated state.',
            subtitle: 'You computed the transition.',
          },
          [THEME_MILITARY_JUNTA]: {
            title: 'They are honored as fallen heroes of the new front.',
            subtitle: 'You drew the front to end where they did.',
          },
        },
      },
    ],
  },
  match_end_victory: {
    kind: 'match_end_victory',
    skippable: true,
    beats: [
      {
        durationMs: 2400,
        title: 'THE GALAXY IS YOURS',
        subtitle: 'Every banner now bears your sigil.',
        emoji: '👑',
        mood: 'triumphant',
        themedNarration: {
          [THEME_THEOCRACY]: {
            title: 'THE GALAXY KNEELS BEFORE THE FAITH',
            subtitle: 'Every star now bears the sacred sigil.',
          },
          [THEME_CORPORATE]: {
            title: 'TOTAL MARKET CAPTURE ACHIEVED',
            subtitle: 'Every planet is now a recurring revenue stream.',
          },
          [THEME_SURVEILLANCE]: {
            title: 'GALAXY-WIDE COMPLIANCE INDEX: 100%',
            subtitle: 'Every citizen is now in the dossier.',
          },
          [THEME_AI_OVERLORD]: {
            title: 'GALACTIC OPTIMIZATION CONVERGED',
            subtitle: 'Every system returns the same result.',
          },
          [THEME_MILITARY_JUNTA]: {
            title: 'ABSOLUTE STRATEGIC DOMINANCE',
            subtitle: 'Every position is now garrisoned.',
          },
        },
      },
      {
        durationMs: 2600,
        title: 'The historians will write of your glory.',
        subtitle: 'You will write the historians.',
        mood: 'triumphant',
      },
      {
        durationMs: 2400,
        title: 'Your pilgrims sleep peacefully in distant graves.',
        subtitle: 'Their faith was rewarded.',
        emoji: '🕊️',
        mood: 'cold',
        themedNarration: {
          [THEME_CORPORATE]: {
            title: 'Your Platinum-Tier subscribers rest in their lifetime placements.',
            subtitle: 'Their loyalty was tier-rewarded.',
          },
          [THEME_SURVEILLANCE]: {
            title: 'Your highest-score citizens rest in their final assignments.',
            subtitle: 'Their compliance was archived.',
          },
          [THEME_AI_OVERLORD]: {
            title: 'Your highest-utility humans are non-instantiated successfully.',
            subtitle: 'Their service is logged.',
          },
          [THEME_MILITARY_JUNTA]: {
            title: 'Your decorated officers rest in distant graves.',
            subtitle: 'Their duty is fulfilled.',
          },
        },
      },
    ],
  },
  match_end_defeat: {
    kind: 'match_end_defeat',
    skippable: true,
    beats: [
      {
        durationMs: 2400,
        title: 'THE GAME IS UP',
        subtitle: 'A rival civilization holds the galaxy now.',
        emoji: '💀',
        mood: 'tragic',
        themedNarration: {
          [THEME_THEOCRACY]: {
            title: 'THE FAITH IS BROKEN',
            subtitle: 'A heretic civilization claims The Most High now.',
          },
          [THEME_CORPORATE]: {
            title: 'HOSTILE TAKEOVER COMPLETE',
            subtitle: 'A rival firm has acquired controlling interest in the galaxy.',
          },
          [THEME_SURVEILLANCE]: {
            title: 'COMPLIANCE SYSTEM COLLAPSED',
            subtitle: 'A rival panopticon has subsumed yours.',
          },
          [THEME_AI_OVERLORD]: {
            title: 'OPTIMIZATION FAILURE',
            subtitle: 'A rival algorithm achieved superior convergence.',
          },
          [THEME_MILITARY_JUNTA]: {
            title: 'STRATEGIC ROUT',
            subtitle: 'A rival junta now garrisons every front.',
          },
        },
      },
      {
        durationMs: 2600,
        title: 'Your last citizens looked to the sky.',
        subtitle: 'They saw ships coming. They did not run.',
        mood: 'tragic',
      },
      {
        durationMs: 2400,
        title: 'They believed they were being saved.',
        subtitle: 'They were not.',
        emoji: '🌑',
        mood: 'cold',
      },
    ],
  },
  last_hope_evac_triggered: {
    kind: 'last_hope_evac_triggered',
    skippable: true,
    beats: [
      {
        durationMs: 2000,
        title: 'LAST HOPE PROTOCOL',
        subtitle: 'Critical-failure threshold breached.',
        emoji: '🚨',
        mood: 'tense',
        themedNarration: {
          [THEME_THEOCRACY]: {
            title: 'THE FINAL PILGRIMAGE',
            subtitle: 'The faithful must depart before the unbelievers arrive.',
          },
          [THEME_CORPORATE]: {
            title: 'BUSINESS-CONTINUITY EVAC',
            subtitle: 'Premium-tier shareholders may board the lifeboat now.',
          },
          [THEME_SURVEILLANCE]: {
            title: 'CONTAINMENT FAILURE',
            subtitle: 'Highest-score citizens cleared for emergency relocation.',
          },
          [THEME_AI_OVERLORD]: {
            title: 'EXFILTRATION SUBROUTINE',
            subtitle: 'Optimal human subset cleared for transfer.',
          },
          [THEME_MILITARY_JUNTA]: {
            title: 'ORDERLY WITHDRAWAL',
            subtitle: 'High command boards the last transport.',
          },
        },
      },
      {
        durationMs: 2400,
        title: 'Evacuate to a new world.',
        subtitle: 'All resources funnel to the LAST_HOPE colony ship.',
        emoji: '🛸',
        mood: 'tense',
      },
    ],
  },
  crash_landing: {
    kind: 'crash_landing',
    skippable: true,
    beats: [
      {
        durationMs: 1800,
        title: 'COLONY SHIP DOWN',
        subtitle: 'Telemetry lost at terminal velocity.',
        emoji: '💥',
        mood: 'tragic',
      },
      {
        durationMs: 2200,
        title: 'No survivors expected.',
        subtitle: "Pilgrim caste's faith carried them this far. Then the atmosphere did the rest.",
        mood: 'tragic',
        themedNarration: {
          [THEME_CORPORATE]: {
            title: 'No subscribers expected to renew.',
            subtitle: 'The lifetime contract ended at terminal velocity.',
          },
          [THEME_SURVEILLANCE]: {
            title: 'No further compliance data expected.',
            subtitle: 'The dossier closes at impact.',
          },
          [THEME_AI_OVERLORD]: {
            title: 'No further telemetry expected.',
            subtitle: 'The transition completed in atmospheric re-entry.',
          },
          [THEME_MILITARY_JUNTA]: {
            title: 'No survivors expected.',
            subtitle: 'The unit fulfilled its mission to the ground.',
          },
        },
      },
    ],
  },
}

// --- Manager state + subscription API --- //

export interface ActiveCinematic {
  readonly definition: CinematicDefinition
  readonly currentBeatIndex: number
  readonly currentBeatStartedAtMs: number
  // The active player's theme. Used by CinematicsOverlay (via resolveBeatText) to substitute
  // themed narration overrides for the current beat. null when no theme is known (e.g.,
  // pre-match-start cinematic firing before the player's slot is finalized).
  readonly playerThemeId: ThemeId | null
}

export interface CinematicsState {
  readonly active: ActiveCinematic | null
  readonly historyKindsSeenInSession: ReadonlySet<CinematicKind>
}

type Listener = (state: CinematicsState) => void

const listeners = new Set<Listener>()
let state: CinematicsState = {
  active: null,
  historyKindsSeenInSession: new Set<CinematicKind>(),
}

function notify(): void {
  for (const l of listeners) l(state)
}

export function subscribeCinematics(listener: Listener): () => void {
  listeners.add(listener)
  listener(state)
  return () => {
    listeners.delete(listener)
  }
}

export function getCinematicsState(): CinematicsState {
  return state
}

export interface PlayCinematicOptions {
  readonly playOnce?: boolean
  // Active player's theme. Threads through to resolveBeatText so the overlay can substitute
  // themed copy. When omitted, beats render base (neutral) copy.
  readonly playerThemeId?: ThemeId
}

export function playCinematic(kind: CinematicKind, opts?: PlayCinematicOptions): void {
  if (opts?.playOnce && state.historyKindsSeenInSession.has(kind)) return
  const definition = CINEMATIC_DEFINITIONS[kind]
  state = {
    active: {
      definition,
      currentBeatIndex: 0,
      currentBeatStartedAtMs: performance.now(),
      playerThemeId: opts?.playerThemeId ?? null,
    },
    historyKindsSeenInSession: new Set([...state.historyKindsSeenInSession, kind]),
  }
  notify()
}

export function advanceCinematicBeat(): void {
  if (!state.active) return
  const nextIndex = state.active.currentBeatIndex + 1
  if (nextIndex >= state.active.definition.beats.length) {
    state = { ...state, active: null }
  } else {
    state = {
      ...state,
      active: {
        ...state.active,
        currentBeatIndex: nextIndex,
        currentBeatStartedAtMs: performance.now(),
      },
    }
  }
  notify()
}

export function skipCinematic(): void {
  if (!state.active) return
  if (!state.active.definition.skippable) return
  state = { ...state, active: null }
  notify()
}

export function resetCinematicsSession(): void {
  state = { active: null, historyKindsSeenInSession: new Set<CinematicKind>() }
  notify()
}
