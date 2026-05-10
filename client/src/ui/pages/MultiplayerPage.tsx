import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type ThemeId,
  THEMES,
  THEME_MEMETIC_CULT,
  THEME_MILITARY_JUNTA,
  THEME_THEOCRACY,
  civId,
  getTheme,
  themeAsCSSVars,
} from '@smol/shared'
import { AIPlayerPanel, type AIPlayerSnapshot } from '../panels/AIPlayerPanel'
import { LobbyPreviewPanel, type LobbyPreviewSummary } from '../panels/LobbyPreviewPanel'
import './SubPage.css'
import './MultiplayerPage.css'

interface MockRoom {
  readonly code: string
  readonly hostName: string
  readonly playerCount: number
  readonly maxPlayers: number
  readonly themeId: ThemeId
  readonly hasPassword: boolean
  readonly matchLength: 'blitz' | 'standard' | 'epic' | 'open'
}

const MOCK_ROOMS: ReadonlyArray<MockRoom> = [
  {
    code: 'PILGRIM-7',
    hostName: 'Gee',
    playerCount: 3,
    maxPlayers: 8,
    themeId: THEME_THEOCRACY,
    hasPassword: false,
    matchLength: 'open',
  },
  {
    code: 'IRON-DRUM',
    hostName: 'Sponge',
    playerCount: 5,
    maxPlayers: 8,
    themeId: THEME_MILITARY_JUNTA,
    hasPassword: false,
    matchLength: 'standard',
  },
  {
    code: 'VIRAL-42',
    hostName: 'Mills',
    playerCount: 2,
    maxPlayers: 12,
    themeId: THEME_MEMETIC_CULT,
    hasPassword: true,
    matchLength: 'epic',
  },
]

export function MultiplayerPage() {
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>(MOCK_ROOMS[0]!.code)
  const selectedRoom = MOCK_ROOMS.find((r) => r.code === selectedRoomCode) ?? MOCK_ROOMS[0]!
  const theme = getTheme(selectedRoom.themeId)
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])

  const lobbySummary = useMemo<LobbyPreviewSummary>(
    () => ({
      phase: 'CONFIGURING',
      planetCount: 100,
      playerCount: selectedRoom.playerCount,
      matchLength: selectedRoom.matchLength === 'open' ? 'standard' : selectedRoom.matchLength,
      winConditionsLabel: 'Apex Tech · Last Civ · Resource Target',
      biomesLabel: 'All biomes',
      coopMode: false,
      slots: Array.from({ length: 12 }, (_, i) => {
        if (i < selectedRoom.playerCount) {
          return {
            slotIndex: i,
            kind: 'human' as const,
            civId: civId(`civ-${selectedRoom.code}-${i}`),
            displayName: i === 0 ? selectedRoom.hostName : `Player-${i + 1}`,
            themeId: THEMES[(i * 3) % THEMES.length]!.id,
            themeLocked: i === 0,
            ready: i % 2 === 0,
            aiPlaystyle: null,
            aiDifficulty: null,
            isHost: i === 0,
          }
        }
        return {
          slotIndex: i,
          kind: 'empty' as const,
          civId: null,
          displayName: '',
          themeId: null,
          themeLocked: false,
          ready: false,
          aiPlaystyle: null,
          aiDifficulty: null,
          isHost: false,
        }
      }),
    }),
    [selectedRoom],
  )

  const aiSnapshots = useMemo<ReadonlyArray<AIPlayerSnapshot>>(
    () => [
      {
        civLabel: 'civ-theocracy-1',
        theme: getTheme(THEME_THEOCRACY),
        playstyle: 'builder',
        difficulty: 'brutal',
        lastDecisionLine:
          'tick=120 | research=Antimatter | build=Cathedral | ship=Pilgrim Volunteer',
        lastTick: 120,
      },
      {
        civLabel: 'civ-junta-7',
        theme: getTheme(THEME_MILITARY_JUNTA),
        playstyle: 'warmonger',
        difficulty: 'hard',
        lastDecisionLine: 'tick=118 | research=Aerospace | ship=Heavy | attack=PLANET-04',
        lastTick: 118,
      },
    ],
    [],
  )

  return (
    <div className="sub-page" style={styleVars as React.CSSProperties}>
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Multiplayer</h1>
      </header>
      <main className="multiplayer-page__content">
        <section className="multiplayer-page__rooms" aria-labelledby="room-list-heading">
          <h2 id="room-list-heading">Open lobbies</h2>
          <p className="multiplayer-page__hint">
            Server-side multiplayer (Colyseus) is wired but not yet live — these are mock rooms.
            Backend wire-up follows Cloudflare Tunnel + Postgres setup (see{' '}
            <code>EXTERNAL_BLOCKERS.md</code> #3).
          </p>
          <ul className="multiplayer-page__room-list">
            {MOCK_ROOMS.map((room) => {
              const t = getTheme(room.themeId)
              const isSelected = room.code === selectedRoomCode
              return (
                <li key={room.code}>
                  <button
                    type="button"
                    className={`multiplayer-page__room ${isSelected ? 'multiplayer-page__room--active' : ''}`}
                    onClick={() => setSelectedRoomCode(room.code)}
                  >
                    <span className="multiplayer-page__room-code">{room.code}</span>
                    <span className="multiplayer-page__room-meta">
                      <span aria-hidden>{t.emoji}</span> {t.name}
                    </span>
                    <span className="multiplayer-page__room-meta">
                      {room.playerCount}/{room.maxPlayers}
                      {room.hasPassword && <span aria-label="locked"> 🔒</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="multiplayer-page__actions">
            <button type="button" disabled className="multiplayer-page__btn">
              ▶ Join {selectedRoom.code}
            </button>
            <button type="button" disabled className="multiplayer-page__btn">
              ＋ Host new lobby
            </button>
            <p className="multiplayer-page__hint">
              Both buttons disabled until backend connection wires through (PHASE 11+14 #3).
            </p>
          </div>
        </section>

        <section className="multiplayer-page__preview">
          <h2>{selectedRoom.code} · Lobby preview</h2>
          <LobbyPreviewPanel summary={lobbySummary} />
          <h2 style={{ marginTop: '2rem' }}>AI civs in-match (when match starts)</h2>
          <AIPlayerPanel snapshots={aiSnapshots} />
        </section>
      </main>
    </div>
  )
}
