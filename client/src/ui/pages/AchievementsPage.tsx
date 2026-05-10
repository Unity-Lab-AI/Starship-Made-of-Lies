import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type AchievementProgress,
  type Account,
  type ScoreEntry,
  type ThemeId,
  THEMES,
  accountId as accountIdValue,
  civId,
  getTheme,
  newAnonymousAccount,
  themeAsCSSVars,
} from '@smol/shared'
import { AchievementsPanel } from '../panels/AchievementsPanel'
import { HallOfChampionsPanel, type CategoryBoardSnapshot } from '../panels/HallOfChampionsPanel'
import { ProfilePanel } from '../panels/ProfilePanel'
import './SubPage.css'
import './AchievementsPage.css'

const MOCK_ACHIEVEMENTS: ReadonlyArray<AchievementProgress> = [
  {
    achievementId: 'first-colony',
    unlockedAtTick: 80,
    unlockedInMatchId: 'mock-match',
    progress: 1,
    progressTarget: 1,
  },
  {
    achievementId: 'first-ship-launched',
    unlockedAtTick: 60,
    unlockedInMatchId: 'mock-match',
    progress: 1,
    progressTarget: 1,
  },
  {
    achievementId: 'first-victory',
    unlockedAtTick: 110,
    unlockedInMatchId: 'mock-match',
    progress: 1,
    progressTarget: 1,
  },
  {
    achievementId: 'ten-planet-empire',
    unlockedAtTick: null,
    unlockedInMatchId: null,
    progress: 6,
    progressTarget: 10,
  },
  {
    achievementId: 'first-civ-eliminated',
    unlockedAtTick: 95,
    unlockedInMatchId: 'mock-match',
    progress: 1,
    progressTarget: 1,
  },
  {
    achievementId: 'mass-deception',
    unlockedAtTick: null,
    unlockedInMatchId: null,
    progress: 0,
    progressTarget: 1,
  },
]

export function AchievementsPage() {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(THEMES[0]!.id)
  const theme = getTheme(selectedThemeId)
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])

  const account = useMemo<Account>(() => {
    const a = newAnonymousAccount(accountIdValue('local-anon'), 'Local Player', 'local-player', 0)
    a.stats.matchesPlayed = 12
    a.stats.matchesWon = 4
    a.stats.totalPlanetsControlledPeak = 18
    a.stats.totalEnemyCivsEliminated = 3
    a.stats.totalColonyShipsLaunched = 87
    a.stats.totalCitizensConscripted = 4210
    a.stats.fastestApexTicks = 2840
    a.stats.themesPlayed.add(theme.id)
    return a
  }, [theme.id])

  const boards = useMemo<ReadonlyArray<CategoryBoardSnapshot>>(() => {
    const entry = (name: string, handle: string, score: number, tick: number): ScoreEntry => ({
      accountId: accountIdValue(`hall-${handle}`),
      displayName: name,
      handle,
      civId: civId(`civ-${handle}`),
      themeId: theme.id,
      score,
      recordedAtTick: tick,
      matchId: 'global',
    })
    return [
      {
        categoryId: 'mostPlanetsControlled',
        themeLabel: null,
        topEntries: [
          entry('Gee', 'Gee', 38, 5400),
          entry('Sponge', 'Sponge', 27, 4900),
          entry('Alfreddo', 'Alfreddo', 22, 4200),
          entry('Red', 'Red', 18, 3800),
        ],
      },
      {
        categoryId: 'fastestTechApex',
        themeLabel: null,
        topEntries: [
          entry('Sponge', 'Sponge', 1640, 1640),
          entry('Gee', 'Gee', 1820, 1820),
          entry('Alfreddo', 'Alfreddo', 2100, 2100),
        ],
      },
      {
        categoryId: 'mostDeceptive',
        themeLabel: null,
        topEntries: [entry('Alfreddo', 'Alfreddo', 78, 5500), entry('Gee', 'Gee', 72, 5100)],
      },
      {
        categoryId: 'mostRuthless',
        themeLabel: null,
        topEntries: [
          entry('Red', 'Red', 7, 5200),
          entry('Gee', 'Gee', 5, 4900),
          entry('Sponge', 'Sponge', 3, 4400),
        ],
      },
      {
        categoryId: 'themeSpecialist',
        themeLabel: theme.name,
        topEntries: [entry('Gee', 'Gee', 9420, 5800), entry('Alfreddo', 'Alfreddo', 7180, 5300)],
      },
    ]
  }, [theme.id, theme.name])

  return (
    <div className="sub-page" style={styleVars as React.CSSProperties}>
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Hall of Champions</h1>
        <label className="achievements-page__theme">
          Theme:
          <select
            value={selectedThemeId}
            onChange={(e) => setSelectedThemeId(e.target.value as ThemeId)}
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.emoji} {t.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main className="achievements-page__content">
        <p className="achievements-page__intro">
          Single global Hall of Champions. Cloud-sync your scores by linking an account in Settings.
          Cross-device leaderboards update in real time.
        </p>
        <div className="achievements-page__grid">
          <ProfilePanel account={account} achievementsUnlocked={4} achievementsTotal={20} />
          <HallOfChampionsPanel boards={boards} highlightCategoryId="mostPlanetsControlled" />
          <AchievementsPanel
            progressList={MOCK_ACHIEVEMENTS}
            currentTick={120}
            showHidden={false}
          />
        </div>
      </main>
    </div>
  )
}
