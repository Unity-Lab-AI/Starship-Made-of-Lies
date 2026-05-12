import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type Account,
  type ThemeId,
  THEMES,
  accountId as accountIdValue,
  getTheme,
  newAnonymousAccount,
  themeAsCSSVars,
} from '@smol/shared'
import { AchievementsPanel } from '../panels/AchievementsPanel'
import { HallOfChampionsPanel, type CategoryBoardSnapshot } from '../panels/HallOfChampionsPanel'
import { ProfilePanel } from '../panels/ProfilePanel'
import { loadAchievementProgressFull } from '../../match/achievementStorage'
import './SubPage.css'
import './AchievementsPage.css'

export function AchievementsPage() {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(THEMES[0]!.id)
  const theme = getTheme(selectedThemeId)
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])

  const account = useMemo<Account>(() => {
    return newAnonymousAccount(accountIdValue('local-anon'), 'Local Player', 'local-player', 0)
  }, [])

  // PHASE 17.12.6 — real achievement progress loaded from localStorage. NEVER mock per
  // feedback_no_mock_player_data_anywhere.md — empty list shows all locked rows until the
  // player wins their first match.
  const progressList = useMemo(() => loadAchievementProgressFull(), [])
  const unlockedCount = progressList.filter((p) => p.unlockedAtTick !== null).length

  const boards = useMemo<ReadonlyArray<CategoryBoardSnapshot>>(() => {
    return [
      { categoryId: 'mostPlanetsControlled', themeLabel: null, topEntries: [] },
      { categoryId: 'fastestTechApex', themeLabel: null, topEntries: [] },
      { categoryId: 'mostDeceptive', themeLabel: null, topEntries: [] },
      { categoryId: 'mostRuthless', themeLabel: null, topEntries: [] },
      { categoryId: 'themeSpecialist', themeLabel: theme.name, topEntries: [] },
    ]
  }, [theme.name])

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
          Single global Hall of Champions. Sign in with Google and play a match to record your first
          ranking entry. Cross-device leaderboards update in real time once Google sign-in is wired
          (PHASE 17.0 in progress).
        </p>
        <div className="achievements-page__grid">
          <ProfilePanel
            account={account}
            achievementsUnlocked={unlockedCount}
            achievementsTotal={progressList.length}
          />
          <HallOfChampionsPanel boards={boards} highlightCategoryId="mostPlanetsControlled" />
          <AchievementsPanel progressList={progressList} currentTick={0} showHidden={false} />
        </div>
      </main>
    </div>
  )
}
