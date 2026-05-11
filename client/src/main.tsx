import { validateBuildingProductionCatalog } from '@smol/shared'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { registerServiceWorker, setupPWAInstallPromptCapture } from './pwa'

// Super-review fix: dev-only catalog audit. Throws loudly in dev if a new BLDG_* is added
// without a production entry OR utility declaration. Production builds skip this check —
// the cost of catching drift at runtime in prod isn't worth the user-facing crash risk.
if (import.meta.env.DEV) {
  validateBuildingProductionCatalog()
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.PROD) {
  setupPWAInstallPromptCapture()
  void registerServiceWorker()
}
