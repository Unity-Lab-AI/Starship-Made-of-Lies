import { useSyncExternalStore } from 'react'

export interface CameraPrefs {
  readonly wasdPan: boolean
  readonly qeRotate: boolean
  readonly wheelZoom: boolean
  readonly edgeScroll: boolean
  readonly middleClickPan: boolean
  readonly rightClickRotate: boolean
  readonly arrowPan: boolean
  readonly panSensitivity: number
  readonly rotateSensitivity: number
  readonly zoomSensitivity: number
  readonly invertYRotate: boolean
}

export const DEFAULT_CAMERA_PREFS: CameraPrefs = {
  wasdPan: true,
  qeRotate: true,
  wheelZoom: true,
  edgeScroll: false,
  middleClickPan: true,
  rightClickRotate: true,
  arrowPan: true,
  panSensitivity: 1,
  rotateSensitivity: 1,
  zoomSensitivity: 1,
  invertYRotate: false,
}

const STORAGE_KEY = 'smol:camera-prefs'

let currentPrefs: CameraPrefs = loadFromStorage()
const subscribers = new Set<() => void>()

function loadFromStorage(): CameraPrefs {
  if (typeof window === 'undefined') return DEFAULT_CAMERA_PREFS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CAMERA_PREFS
    const parsed = JSON.parse(raw) as Partial<CameraPrefs>
    return { ...DEFAULT_CAMERA_PREFS, ...parsed }
  } catch {
    return DEFAULT_CAMERA_PREFS
  }
}

function saveToStorage(prefs: CameraPrefs): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* localStorage unavailable */
  }
}

export function getCameraPrefs(): CameraPrefs {
  return currentPrefs
}

export function setCameraPrefs(patch: Partial<CameraPrefs>): void {
  currentPrefs = { ...currentPrefs, ...patch }
  saveToStorage(currentPrefs)
  for (const fn of subscribers) fn()
}

export function resetCameraPrefs(): void {
  setCameraPrefs(DEFAULT_CAMERA_PREFS)
}

function subscribeCameraPrefs(listener: () => void): () => void {
  subscribers.add(listener)
  return () => {
    subscribers.delete(listener)
  }
}

export function useCameraPrefs(): CameraPrefs {
  return useSyncExternalStore(subscribeCameraPrefs, getCameraPrefs, () => DEFAULT_CAMERA_PREFS)
}
