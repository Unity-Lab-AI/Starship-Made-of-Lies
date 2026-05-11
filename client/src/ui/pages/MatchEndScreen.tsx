import { useState } from 'react'
import { type ThemeId, THEMES, getTheme, themeAsCSSVars } from '@smol/shared'
import type { MatchState } from '../../match/MatchSim'
import './MatchEndScreen.css'

interface MatchEndScreenProps {
  readonly match: MatchState
  readonly onPlayAgain: (themeId: ThemeId) => void
  readonly onGoHome: () => void
}

export function MatchEndScreen({ match, onPlayAgain, onGoHome }: MatchEndScreenProps) {
  const winner = match.winningCivId === null ? null : (match.civs.get(match.winningCivId) ?? null)
  const playerWon = winner?.civId === match.humanCivId
  const playerCiv = match.civs.get(match.humanCivId)
  const playerTheme = playerCiv?.theme

  const [nextThemeId, setNextThemeId] = useState<ThemeId>(THEMES[0]!.id)
  const styleVars = themeAsCSSVars(playerTheme ?? getTheme(THEMES[0]!.id))

  const headline =
    winner === null
      ? 'Match ended'
      : playerWon
        ? winner.theme.propaganda.victoryAnnouncement
        : winner.theme.propaganda.victoryAnnouncement
  const subline = winner
    ? `${winner.theme.emoji} ${winner.displayName} wins via ${match.resolvedObjectiveId ?? match.endReason ?? 'admin-end'}`
    : `Reason: ${match.endReason ?? 'unknown'}`

  const playerStats = playerCiv
    ? {
        techs: playerCiv.empire.researchedTechs.size,
        ships: playerCiv.deceptionLedger.colonyShipsLaunched,
        volunteers: playerCiv.deceptionLedger.volunteersRecruited,
        defeated: playerCiv.empire.defeatedCivIds.size,
        controlledPlanets: playerCiv.empire.controlledPlanetIds.size,
      }
    : null

  return (
    <div className="match-end-screen" style={styleVars as React.CSSProperties}>
      <div className="match-end-screen__panel">
        <h1
          className={`match-end-screen__headline ${playerWon ? 'match-end-screen__headline--win' : 'match-end-screen__headline--lose'}`}
        >
          {playerWon ? '✦ VICTORY ✦' : winner ? '☠ DEFEAT ☠' : '— STALEMATE —'}
        </h1>
        <p className="match-end-screen__theme-line">{headline}</p>
        <p className="match-end-screen__subline">{subline}</p>

        {playerCiv && (
          <p className="match-end-screen__defeat-excuse">
            {playerWon
              ? `— ${playerCiv.theme.propaganda.subterfugeFraming}`
              : `— ${playerCiv.theme.propaganda.defeatExcuse}`}
          </p>
        )}

        {playerStats && (
          <dl className="match-end-screen__stats">
            <dt>Techs researched</dt>
            <dd>{playerStats.techs}</dd>
            <dt>Colony ships launched</dt>
            <dd>{playerStats.ships}</dd>
            <dt>Volunteers recruited</dt>
            <dd>{playerStats.volunteers}</dd>
            <dt>Civs defeated</dt>
            <dd>{playerStats.defeated}</dd>
            <dt>Planets controlled</dt>
            <dd>{playerStats.controlledPlanets}</dd>
            <dt>Match ticks</dt>
            <dd>{match.currentTick}</dd>
          </dl>
        )}

        <div className="match-end-screen__replay">
          <label className="match-end-screen__government-label">
            Next government:
            <select
              className="match-end-screen__government-select"
              value={nextThemeId}
              onChange={(e) => setNextThemeId(e.target.value as ThemeId)}
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="match-end-screen__actions">
            <button
              type="button"
              className="match-end-screen__btn match-end-screen__btn--primary"
              onClick={() => onPlayAgain(nextThemeId)}
            >
              ▶ Play again ({getTheme(nextThemeId).emoji} {getTheme(nextThemeId).name})
            </button>
            <button type="button" className="match-end-screen__btn" onClick={onGoHome}>
              ← Title screen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
