import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import { TermsGate } from './ui/gates/TermsGate'

// PHASE 17.L.D.14 (HOTFIX 2026-05-13) — `basename` derived from Vite's BASE_URL so React
// Router matches routes correctly when the app is served from a subpath. GitHub Pages
// demo build sets SMOL_BASE_PATH=/Starship-Made-of-Lies/ which Vite inlines into
// import.meta.env.BASE_URL. Without the basename, every route (incl `/`) would 404 because
// the actual URL path is `/Starship-Made-of-Lies/...` and Router was matching against bare
// `/`. Trailing slash is stripped by React Router automatically. Dev builds use base `/`
// which Router treats as no basename (default), so the local server is unaffected.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
import { TitleScreen } from './ui/title/TitleScreen'
import { NewGamePage } from './ui/pages/NewGamePage'
import { MultiplayerPage } from './ui/pages/MultiplayerPage'
import { SettingsPage } from './ui/pages/SettingsPage'
import { AchievementsPage } from './ui/pages/AchievementsPage'
import { WikiPage } from './ui/pages/WikiPage'
import { AboutPage } from './ui/pages/AboutPage'
import { PrivacyPage } from './ui/pages/PrivacyPage'
import { TermsPage } from './ui/pages/TermsPage'
import { PreviewPage } from './ui/pages/PreviewPage'
import { PlayPage } from './ui/pages/PlayPage'
import { SignInPage } from './ui/pages/SignInPage'
import { GoogleOAuthCallbackPage } from './ui/pages/GoogleOAuthCallbackPage'
import './styles/globals.css'

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={ROUTER_BASENAME}>
        {/* PHASE 17.L.D (HOTFIX 2026-05-12) — TermsGate wraps the entire route tree. Until
            the visitor clicks Agree on first load, only the gate modal renders. Disagree
            redirects to google.com. Acceptance persists in localStorage so the gate is a
            one-shot. */}
        <TermsGate>
          <Routes>
            <Route path="/" element={<TitleScreen />} />
            <Route path="/new-game" element={<NewGamePage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/multiplayer" element={<MultiplayerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/wiki" element={<WikiPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/google/callback" element={<GoogleOAuthCallbackPage />} />
          </Routes>
        </TermsGate>
      </BrowserRouter>
    </ThemeProvider>
  )
}
