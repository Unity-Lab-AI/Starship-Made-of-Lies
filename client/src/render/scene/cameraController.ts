import * as THREE from 'three'
import { getCameraPrefs } from './cameraPrefs'

export interface CameraState {
  readonly camera: THREE.PerspectiveCamera
  target: THREE.Vector3
  yaw: number
  pitch: number
  zoomT: number
  // PHASE 17.L.D.1 (HOTFIX 2026-05-11) — per-galaxy max camera distance. Used to be a static
  // const at 140000 sized for the old fixed UNIVERSE_HALF_EXTENT=60000. Now scales with the
  // actual galaxy size so Tiny (~85k half-extent) galaxies don't open zoomed-out beyond the
  // cluster and Large (~800k half-extent) galaxies can still frame the whole cluster.
  maxDistance: number
}

export interface CameraInputState {
  panX: number
  panY: number
  rotateX: number
  rotateY: number
  zoomDelta: number
}

// MIN_DISTANCE must be > largest planet radius so camera doesn't end up inside a planet sphere
// (which renders as nothing due to backface culling). Super planet radius = 1600 → 1800 keeps
// camera just outside even the biggest planet at max zoom.
const MIN_DISTANCE = 1800
// PHASE 17.L.D.1 (HOTFIX 2026-05-11) — DEFAULT_MAX_DISTANCE is the fallback when newCamera is
// called without a maxDistance argument (legacy callers / preview routes). Sized for the old
// fixed UNIVERSE_HALF_EXTENT=60000. Actual game galaxies now thread their universeHalfExtent
// through newCamera and CameraState.maxDistance so zoom-out frames the cluster correctly at
// any galaxy size.
const DEFAULT_MAX_DISTANCE = 140000
const MAX_DISTANCE_HEADROOM = 2.5
const PAN_SPEED = 4
const ROTATE_SPEED = 0.012
const ZOOM_TICK = 0.06
const EDGE_THRESHOLD_PX = 20

// Per user verbatim LAW #0 2026-05-10 (PHASE 16.13.7): "a mall pan and tilt when zooming to show
// 3d world releativity". As we zoom IN (zoomT → 0), the camera position gets a small lateral pan
// + small vertical lift offset relative to the look-at axis. The planet visibly parallaxes against
// the starfield instead of growing along a straight Z line — the player FEELS the 3D depth.
// Max offset = 20% of camera distance; smoothstep eases the magnitude across the zoom range.
// PHASE 17.A.3 — bumped 0.08 → 0.20 because user reported "no way to tell relativity when
// zooming into the surface of a planet". The previous 8% was below the threshold where the
// parallax registers visually; 20% is the sweet spot — felt without being disorienting.
const ZOOM_DEPTH_CUE_MAX_FRACTION = 0.2
const ZOOM_DEPTH_CUE_LATERAL_WEIGHT = 0.6
const ZOOM_DEPTH_CUE_VERTICAL_WEIGHT = 0.4

export function newCamera(aspect: number, universeHalfExtent?: number): CameraState {
  // PHASE 17.L.D.1 (HOTFIX 2026-05-11) — camera framing scales with the actual galaxy size.
  // maxDistance = universeHalfExtent × MAX_DISTANCE_HEADROOM so the camera at zoomT=1 sits
  // far enough OUTSIDE the cluster to frame the whole galaxy. Far-plane = maxDistance × 4 so
  // distant systems on the opposite side of the wrap stay visible even when camera is at
  // the closest zoom on the near side.
  const maxDistance = universeHalfExtent
    ? universeHalfExtent * MAX_DISTANCE_HEADROOM
    : DEFAULT_MAX_DISTANCE
  const farPlane = Math.max(250000, maxDistance * 4)
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, farPlane)
  return {
    camera,
    target: new THREE.Vector3(0, 0, 0),
    yaw: 0,
    pitch: -Math.PI / 3,
    zoomT: 1,
    maxDistance,
  }
}

export function distanceFromZoomT(zoomT: number, maxDistance = DEFAULT_MAX_DISTANCE): number {
  const t = Math.max(0, Math.min(1, zoomT))
  return MIN_DISTANCE * Math.pow(maxDistance / MIN_DISTANCE, t)
}

export function applyCameraTransform(state: CameraState): void {
  const distance = distanceFromZoomT(state.zoomT, state.maxDistance)
  const cosP = Math.cos(state.pitch)
  const offset = new THREE.Vector3(
    Math.sin(state.yaw) * cosP,
    Math.sin(state.pitch),
    Math.cos(state.yaw) * cosP,
  ).multiplyScalar(distance)

  // Small pan + tilt depth cue (PHASE 16.13.7 LAW #0). depthT goes from 0 at galaxy zoom-out to
  // 1 at planet-surface zoom-in; smoothstep softens the transition. cameraRight is the world-XZ
  // perpendicular of the look-at axis so the lateral shift moves sideways, not toward/away.
  const depthT = 1 - Math.max(0, Math.min(1, state.zoomT))
  const depthEased = depthT * depthT * (3 - 2 * depthT)
  const depthMag = ZOOM_DEPTH_CUE_MAX_FRACTION * distance * depthEased
  const cameraRightX = Math.cos(state.yaw)
  const cameraRightZ = -Math.sin(state.yaw)
  offset.x += cameraRightX * depthMag * ZOOM_DEPTH_CUE_LATERAL_WEIGHT
  offset.z += cameraRightZ * depthMag * ZOOM_DEPTH_CUE_LATERAL_WEIGHT
  offset.y += depthMag * ZOOM_DEPTH_CUE_VERTICAL_WEIGHT

  state.camera.position.copy(state.target).add(offset)
  state.camera.lookAt(state.target)
  state.camera.updateMatrixWorld()
}

export interface CameraControllerHandle {
  readonly destroy: () => void
  readonly getKeyState: () => Record<string, boolean>
  readonly getMouseEdgeState: () => { up: boolean; down: boolean; left: boolean; right: boolean }
}

export function attachCameraController(
  canvasEl: HTMLCanvasElement,
  state: CameraState,
): CameraControllerHandle {
  const keys: Record<string, boolean> = {}
  const edge = { up: false, down: false, left: false, right: false }
  let middleDown = false
  let rightDown = false
  let lastMouseX = 0
  let lastMouseY = 0

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.target instanceof HTMLSelectElement) return
    keys[e.key.toLowerCase()] = true
  }
  const onKeyUp = (e: KeyboardEvent): void => {
    keys[e.key.toLowerCase()] = false
  }
  const onWheel = (e: WheelEvent): void => {
    const prefs = getCameraPrefs()
    if (!prefs.wheelZoom) return
    e.preventDefault()
    state.zoomT = Math.max(
      0,
      Math.min(1, state.zoomT + Math.sign(e.deltaY) * ZOOM_TICK * prefs.zoomSensitivity),
    )
  }
  const onMouseMove = (e: MouseEvent): void => {
    const prefs = getCameraPrefs()
    if (prefs.edgeScroll) {
      const rect = canvasEl.getBoundingClientRect()
      edge.left = e.clientX - rect.left < EDGE_THRESHOLD_PX
      edge.right = rect.right - e.clientX < EDGE_THRESHOLD_PX
      edge.up = e.clientY - rect.top < EDGE_THRESHOLD_PX
      edge.down = rect.bottom - e.clientY < EDGE_THRESHOLD_PX
    } else {
      edge.left = edge.right = edge.up = edge.down = false
    }
    if (middleDown && prefs.middleClickPan) {
      const dx = e.clientX - lastMouseX
      const dy = e.clientY - lastMouseY
      panCameraInScreenSpace(state, -dx, -dy, prefs.panSensitivity)
    }
    if (rightDown && prefs.rightClickRotate) {
      const dx = e.clientX - lastMouseX
      const dy = e.clientY - lastMouseY
      state.yaw += dx * ROTATE_SPEED * prefs.rotateSensitivity
      const dyEffective = prefs.invertYRotate ? -dy : dy
      // PHASE 17.L.D.13 (HOTFIX 2026-05-11) — pitch clamp removed. Per user verbatim *"NEED
      // THE TO GET RID OF THE GIMBLE LOCK ON THE CAMERS FOR FULL ROTATION AND PITCH AND
      // YAW"*. Old clamp was [-π/2+0.05, -0.05] — camera could ONLY look down at 3° to 89°
      // below horizontal. Now pitch is unbounded (matches yaw's existing freedom). The
      // sin/cos terms in applyCameraTransform handle any pitch value gracefully — at
      // pitch=π/2 camera looks straight up, pitch=π wraps to looking down from behind, etc.
      state.pitch -= dyEffective * ROTATE_SPEED * prefs.rotateSensitivity
    }
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  }
  const onMouseDown = (e: MouseEvent): void => {
    if (e.button === 1) {
      middleDown = true
      e.preventDefault()
    }
    if (e.button === 2) {
      rightDown = true
      e.preventDefault()
    }
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  }
  const onMouseUp = (e: MouseEvent): void => {
    if (e.button === 1) middleDown = false
    if (e.button === 2) rightDown = false
  }
  const onContextMenu = (e: MouseEvent): void => {
    e.preventDefault()
  }
  const onMouseLeave = (): void => {
    edge.left = edge.right = edge.up = edge.down = false
    middleDown = false
    rightDown = false
  }

  // PHASE 17.PRE.3 — stuck-key guard. onKeyUp skips when focus is on a text field (browser
  // doesn't deliver the keyup to window in some cases), so W/A/S/D can get stuck "down" in
  // the keys map forever, causing the camera to pan indefinitely. Clear the entire keys map
  // on any focus loss or visibility change — defensive sweep.
  const clearAllKeys = (): void => {
    for (const k of Object.keys(keys)) keys[k] = false
  }
  const onWindowBlur = (): void => clearAllKeys()
  const onVisibilityChange = (): void => {
    if (document.visibilityState !== 'visible') clearAllKeys()
  }

  // PHASE 18.2 — touch input adapter. One-finger drag = rotate (mirrors right-click drag).
  // Two-finger pinch = zoom (mirrors wheel). Two-finger pan = translate (mirrors middle-click
  // drag). Touch events override their mouse equivalents only while a finger is down; releasing
  // every finger snaps back to mouse/keyboard input.
  let touchSession: {
    mode: 'one-finger' | 'two-finger' | null
    lastX: number
    lastY: number
    lastDist: number
  } = { mode: null, lastX: 0, lastY: 0, lastDist: 0 }
  function touchDistance(t1: Touch, t2: Touch): number {
    const dx = t1.clientX - t2.clientX
    const dy = t1.clientY - t2.clientY
    return Math.hypot(dx, dy)
  }
  function touchMidpoint(t1: Touch, t2: Touch): { x: number; y: number } {
    return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 }
  }
  const onTouchStart = (e: TouchEvent): void => {
    e.preventDefault()
    if (e.touches.length === 1) {
      touchSession = {
        mode: 'one-finger',
        lastX: e.touches[0]!.clientX,
        lastY: e.touches[0]!.clientY,
        lastDist: 0,
      }
    } else if (e.touches.length >= 2) {
      const mid = touchMidpoint(e.touches[0]!, e.touches[1]!)
      touchSession = {
        mode: 'two-finger',
        lastX: mid.x,
        lastY: mid.y,
        lastDist: touchDistance(e.touches[0]!, e.touches[1]!),
      }
    }
  }
  const onTouchMove = (e: TouchEvent): void => {
    e.preventDefault()
    const prefs = getCameraPrefs()
    if (touchSession.mode === 'one-finger' && e.touches.length === 1) {
      const dx = e.touches[0]!.clientX - touchSession.lastX
      const dy = e.touches[0]!.clientY - touchSession.lastY
      state.yaw += dx * ROTATE_SPEED * prefs.rotateSensitivity
      const dyEffective = prefs.invertYRotate ? -dy : dy
      state.pitch -= dyEffective * ROTATE_SPEED * prefs.rotateSensitivity
      touchSession.lastX = e.touches[0]!.clientX
      touchSession.lastY = e.touches[0]!.clientY
    } else if (touchSession.mode === 'two-finger' && e.touches.length >= 2) {
      const mid = touchMidpoint(e.touches[0]!, e.touches[1]!)
      const dist = touchDistance(e.touches[0]!, e.touches[1]!)
      // Pinch → zoom delta. Compare current distance vs last to compute zoomT change.
      const pinchDelta = touchSession.lastDist - dist
      if (Math.abs(pinchDelta) > 1) {
        state.zoomT = Math.max(
          0,
          Math.min(1, state.zoomT + Math.sign(pinchDelta) * ZOOM_TICK * prefs.zoomSensitivity),
        )
      }
      // Midpoint movement → pan
      const dx = mid.x - touchSession.lastX
      const dy = mid.y - touchSession.lastY
      if (Math.hypot(dx, dy) > 0.5) {
        panCameraInScreenSpace(state, -dx, -dy, prefs.panSensitivity)
      }
      touchSession.lastX = mid.x
      touchSession.lastY = mid.y
      touchSession.lastDist = dist
    }
  }
  const onTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      touchSession = { mode: null, lastX: 0, lastY: 0, lastDist: 0 }
    } else if (e.touches.length === 1 && touchSession.mode === 'two-finger') {
      // Pinch ended but one finger still on screen — switch to one-finger rotate session.
      touchSession = {
        mode: 'one-finger',
        lastX: e.touches[0]!.clientX,
        lastY: e.touches[0]!.clientY,
        lastDist: 0,
      }
    }
  }

  canvasEl.addEventListener('wheel', onWheel, { passive: false })
  canvasEl.addEventListener('mousemove', onMouseMove)
  canvasEl.addEventListener('mousedown', onMouseDown)
  canvasEl.addEventListener('mouseup', onMouseUp)
  canvasEl.addEventListener('mouseleave', onMouseLeave)
  canvasEl.addEventListener('contextmenu', onContextMenu)
  canvasEl.addEventListener('touchstart', onTouchStart, { passive: false })
  canvasEl.addEventListener('touchmove', onTouchMove, { passive: false })
  canvasEl.addEventListener('touchend', onTouchEnd)
  canvasEl.addEventListener('touchcancel', onTouchEnd)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onWindowBlur)
  document.addEventListener('visibilitychange', onVisibilityChange)

  return {
    destroy: () => {
      canvasEl.removeEventListener('wheel', onWheel)
      canvasEl.removeEventListener('mousemove', onMouseMove)
      canvasEl.removeEventListener('mousedown', onMouseDown)
      canvasEl.removeEventListener('mouseup', onMouseUp)
      canvasEl.removeEventListener('mouseleave', onMouseLeave)
      canvasEl.removeEventListener('contextmenu', onContextMenu)
      canvasEl.removeEventListener('touchstart', onTouchStart)
      canvasEl.removeEventListener('touchmove', onTouchMove)
      canvasEl.removeEventListener('touchend', onTouchEnd)
      canvasEl.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onWindowBlur)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    },
    getKeyState: () => keys,
    getMouseEdgeState: () => edge,
  }
}

function panCameraInScreenSpace(
  state: CameraState,
  screenDX: number,
  screenDY: number,
  sensitivity: number,
): void {
  const distance = distanceFromZoomT(state.zoomT, state.maxDistance)
  const right = new THREE.Vector3()
  const up = new THREE.Vector3()
  state.camera.matrixWorld.extractBasis(right, up, new THREE.Vector3())
  const worldDX = (screenDX / 600) * distance * sensitivity
  const worldDY = (screenDY / 600) * distance * sensitivity
  state.target.addScaledVector(right, worldDX)
  state.target.addScaledVector(up, -worldDY)
}

export function tickCameraFromInput(state: CameraState, dtSec: number): void {
  const prefs = getCameraPrefs()
  const keys = currentKeys
  const edge = currentEdge
  // Pan from WASD or arrows
  let dx = 0
  let dy = 0
  if (prefs.wasdPan) {
    if (keys['w']) dy -= 1
    if (keys['s']) dy += 1
    if (keys['a']) dx -= 1
    if (keys['d']) dx += 1
  }
  if (prefs.arrowPan) {
    if (keys['arrowup']) dy -= 1
    if (keys['arrowdown']) dy += 1
    if (keys['arrowleft']) dx -= 1
    if (keys['arrowright']) dx += 1
  }
  if (prefs.edgeScroll) {
    if (edge.left) dx -= 1
    if (edge.right) dx += 1
    if (edge.up) dy -= 1
    if (edge.down) dy += 1
  }
  if (dx !== 0 || dy !== 0) {
    const distance = distanceFromZoomT(state.zoomT, state.maxDistance)
    const speed = PAN_SPEED * prefs.panSensitivity * distance * dtSec
    const right = new THREE.Vector3()
    const up = new THREE.Vector3()
    state.camera.matrixWorld.extractBasis(right, up, new THREE.Vector3())
    state.target.addScaledVector(right, dx * speed)
    state.target.addScaledVector(up, -dy * speed)
  }
  // Rotate from QE
  if (prefs.qeRotate) {
    if (keys['q']) state.yaw -= 2 * dtSec * prefs.rotateSensitivity
    if (keys['e']) state.yaw += 2 * dtSec * prefs.rotateSensitivity
  }
}

let currentKeys: Record<string, boolean> = {}
let currentEdge: { up: boolean; down: boolean; left: boolean; right: boolean } = {
  up: false,
  down: false,
  left: false,
  right: false,
}

export function bindCameraInputs(handle: CameraControllerHandle): void {
  currentKeys = handle.getKeyState()
  currentEdge = handle.getMouseEdgeState()
}
