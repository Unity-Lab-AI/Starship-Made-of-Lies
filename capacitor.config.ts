import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ai.unitylab.smol',
  appName: 'Starship Made of Lies',
  webDir: 'client/dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: ['*.unitylab.ai'],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 2400,
      backgroundColor: '#0c0c14',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      spinnerColor: '#d4a13a',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      backgroundColor: '#0c0c14',
      style: 'DARK',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    },
    App: {
      launchUrl: 'smol://launch',
    },
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0c0c14',
    handleApplicationNotifications: false,
    scheme: 'SMoL',
    limitsNavigationsToAppBoundDomains: true,
  },
  android: {
    backgroundColor: '#0c0c14',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
}

export default config
