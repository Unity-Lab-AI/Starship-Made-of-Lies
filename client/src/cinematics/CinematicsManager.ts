// PHASE 18.6 — cinematics state machine. Defines the cinematic beat sequences for the four
// major match moments + an external `playCinematic(kind)` entrypoint the host wires to game
// events. Single-source-of-truth for beat sequences so the overlay component just renders
// what the manager publishes — no per-component beat scheduling.
//
// Skip controls: any keypress / click / Esc fires `skipCinematic()` which advances directly
// to the END state, dismissing the overlay. The CinematicsOverlay component owns the input
// listeners.
//
// LAW #0 lock: per-government themed narration would belong here as a Phase 18.6 polish
// (currently uses neutral copy). The hook is `CinematicBeat.themedNarration?: Record<ThemeId,
// string>` — left for future expansion.

export type CinematicKind =
  | 'match_start_intro'
  | 'match_end_victory'
  | 'match_end_defeat'
  | 'last_hope_evac_triggered'
  | 'crash_landing'

export interface CinematicBeat {
  readonly durationMs: number
  readonly title?: string
  readonly subtitle?: string
  readonly emoji?: string
  // Visual style hint — overlay reads this to swap text color / glow / animation.
  readonly mood: 'cold' | 'tense' | 'triumphant' | 'tragic' | 'mystery'
}

export interface CinematicDefinition {
  readonly kind: CinematicKind
  readonly beats: ReadonlyArray<CinematicBeat>
  readonly skippable: boolean
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
      },
      {
        durationMs: 2400,
        title: 'But they will choose to leave.',
        subtitle: 'They will eagerly board the ships you send them on.',
        emoji: '🛐',
        mood: 'mystery',
      },
      {
        durationMs: 2200,
        title: 'They never arrive.',
        subtitle: 'You make sure of that.',
        emoji: '🌌',
        mood: 'cold',
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
      },
    ],
  },
}

// --- Manager state + subscription API --- //

export interface ActiveCinematic {
  readonly definition: CinematicDefinition
  readonly currentBeatIndex: number
  readonly currentBeatStartedAtMs: number
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

export function playCinematic(kind: CinematicKind, opts?: { readonly playOnce?: boolean }): void {
  if (opts?.playOnce && state.historyKindsSeenInSession.has(kind)) return
  const definition = CINEMATIC_DEFINITIONS[kind]
  state = {
    active: {
      definition,
      currentBeatIndex: 0,
      currentBeatStartedAtMs: performance.now(),
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
