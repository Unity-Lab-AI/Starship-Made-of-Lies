export interface ServiceWorkerRegistrationResult {
  readonly registered: boolean
  readonly scope?: string
  readonly error?: string
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistrationResult> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { registered: false, error: 'serviceWorker not available' }
  }
  if (typeof window === 'undefined') {
    return { registered: false, error: 'window not available' }
  }
  if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
    return { registered: false, error: 'service workers require HTTPS or localhost' }
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    return { registered: true, scope: registration.scope }
  } catch (err) {
    return { registered: false, error: String(err) }
  }
}

export async function unregisterAllServiceWorkers(): Promise<number> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return 0
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((r) => r.unregister()))
  return registrations.length
}

export interface PWAInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

let deferredInstallPrompt: PWAInstallPromptEvent | null = null

export function setupPWAInstallPromptCapture(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstallPrompt = e as PWAInstallPromptEvent
  })
}

export function hasPendingInstallPrompt(): boolean {
  return deferredInstallPrompt !== null
}

export async function triggerInstallPrompt(): Promise<{
  readonly accepted: boolean
  readonly platform: string
} | null> {
  if (!deferredInstallPrompt) return null
  await deferredInstallPrompt.prompt()
  const choice = await deferredInstallPrompt.userChoice
  deferredInstallPrompt = null
  return { accepted: choice.outcome === 'accepted', platform: choice.platform }
}
