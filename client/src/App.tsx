import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
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
      <BrowserRouter>
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
      </BrowserRouter>
    </ThemeProvider>
  )
}
