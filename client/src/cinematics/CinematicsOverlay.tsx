// PHASE 18.6 — full-screen cinematic overlay. Subscribes to the CinematicsManager state,
// renders the current beat with a mood-tinted backdrop, advances on a timer, and dismisses
// on any keypress / click / Esc (when the beat sequence is skippable).
//
// The component is mounted once at the PlayPage root; it renders nothing when no cinematic
// is active (just an empty fragment) so it has zero cost when idle.

import { useEffect, useState } from 'react'
import {
  type ActiveCinematic,
  advanceCinematicBeat,
  resolveBeatText,
  skipCinematic,
  subscribeCinematics,
} from './CinematicsManager'
import { useT } from '../i18n/i18n'
import './cinematics.css'

export function CinematicsOverlay() {
  const t = useT()
  const [active, setActive] = useState<ActiveCinematic | null>(null)

  useEffect(() => {
    return subscribeCinematics((state) => setActive(state.active))
  }, [])

  // Beat timer — schedules the next advance based on the current beat's durationMs.
  useEffect(() => {
    if (!active) return
    const handle = window.setTimeout(() => {
      advanceCinematicBeat()
    }, active.definition.beats[active.currentBeatIndex]!.durationMs)
    return () => window.clearTimeout(handle)
  }, [active])

  // Skip controls — Esc / Space / click anywhere on the overlay.
  useEffect(() => {
    if (!active) return
    if (!active.definition.skippable) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        skipCinematic()
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [active])

  if (!active) return null
  const beat = active.definition.beats[active.currentBeatIndex]!
  // Resolver substitutes themed title/subtitle for the active player's theme when the beat
  // has themedNarration entries; falls back to base copy otherwise.
  const { title, subtitle } = resolveBeatText(beat, active.playerThemeId)
  return (
    <div
      className={`cinematic-overlay cinematic-overlay--${beat.mood}`}
      role="dialog"
      aria-label={`Cinematic: ${active.definition.kind}`}
      onClick={() => skipCinematic()}
    >
      <div className="cinematic-overlay__panel">
        {beat.emoji && (
          <div className="cinematic-overlay__emoji" aria-hidden>
            {beat.emoji}
          </div>
        )}
        {title && <h1 className="cinematic-overlay__title">{title}</h1>}
        {subtitle && <p className="cinematic-overlay__subtitle">{subtitle}</p>}
        <div className="cinematic-overlay__skip-hint">{t('cinematic.skipHint')}</div>
      </div>
    </div>
  )
}
