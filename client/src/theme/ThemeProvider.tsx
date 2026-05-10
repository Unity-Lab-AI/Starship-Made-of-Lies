import { createContext, useContext, useState, type ReactNode } from 'react'

type ThemeId = 'default' | string

interface ThemeContextValue {
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('default')
  return (
    <ThemeContext.Provider value={{ themeId, setTheme: setThemeId }}>
      <div data-theme={themeId} style={{ minHeight: '100%' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
