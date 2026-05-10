import { type Account, describeAccountForLog, winRate } from '@smol/shared'
import { LCDFrame } from './LCDFrame'
import './ProfilePanel.css'

interface ProfilePanelProps {
  readonly account: Account
  readonly achievementsUnlocked: number
  readonly achievementsTotal: number
}

export function ProfilePanel({
  account,
  achievementsUnlocked,
  achievementsTotal,
}: ProfilePanelProps) {
  const wr = winRate(account.stats)
  const wrPct = (wr * 100).toFixed(1)
  return (
    <LCDFrame
      title="👤 Profile"
      statusGlyph="◇"
      statusLabel={`${account.profile.displayName}@${account.profile.handle}`}
      variant="blue"
    >
      <div className="profile-panel">
        <header className="profile-panel__head">
          <span className="profile-panel__avatar">👤</span>
          <div>
            <div className="profile-panel__name">{account.profile.displayName}</div>
            <div className="profile-panel__handle">@{account.profile.handle}</div>
            <div className="profile-panel__auth">auth: {account.credentials.method}</div>
          </div>
        </header>
        <div className="profile-panel__stats">
          <Stat label="Matches played" value={account.stats.matchesPlayed.toString()} />
          <Stat label="Matches won" value={`${account.stats.matchesWon} (${wrPct}%)`} />
          <Stat label="Peak planets" value={account.stats.totalPlanetsControlledPeak.toString()} />
          <Stat label="Civs eliminated" value={account.stats.totalEnemyCivsEliminated.toString()} />
          <Stat
            label="Colony ships launched"
            value={account.stats.totalColonyShipsLaunched.toString()}
          />
          <Stat
            label="Citizens conscripted"
            value={account.stats.totalCitizensConscripted.toLocaleString()}
          />
          <Stat
            label="Fastest apex"
            value={
              account.stats.fastestApexTicks === null ? '—' : `T-${account.stats.fastestApexTicks}`
            }
          />
          <Stat label="Themes played" value={account.stats.themesPlayed.size.toString()} />
        </div>
        <div className="profile-panel__progress">
          <span className="profile-panel__progress-label">Achievements</span>
          <div className="profile-panel__progress-bar">
            <div
              className="profile-panel__progress-fill"
              style={{
                width:
                  achievementsTotal > 0
                    ? `${(achievementsUnlocked / achievementsTotal) * 100}%`
                    : '0%',
              }}
            />
          </div>
          <span className="profile-panel__progress-value">
            {achievementsUnlocked}/{achievementsTotal}
          </span>
        </div>
        <div className="profile-panel__cosmetics">
          <span className="profile-panel__cosmetics-label">
            🎖 {account.profile.badgeIds.size} badges
          </span>
          <span className="profile-panel__cosmetics-label">
            🎨 {account.profile.cosmeticUnlocks.size} cosmetics
          </span>
        </div>
        <p className="profile-panel__log">{describeAccountForLog(account)}</p>
      </div>
    </LCDFrame>
  )
}

interface StatProps {
  readonly label: string
  readonly value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="profile-panel__stat">
      <span className="profile-panel__stat-label">{label}</span>
      <span className="profile-panel__stat-value">{value}</span>
    </div>
  )
}
