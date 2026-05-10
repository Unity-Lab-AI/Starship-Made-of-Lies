import { useCameraPrefs, setCameraPrefs, resetCameraPrefs } from '../../render/scene/cameraPrefs'
import '../../render/scene/scene.css'

export function CameraSettingsPanel() {
  const prefs = useCameraPrefs()
  return (
    <div className="camera-settings">
      <h2>🎮 Camera Controls (3D galaxy view)</h2>
      <p className="camera-settings__hint">
        These control how you navigate the 3D galaxy view (toggle with the 🌌 button or M key).
      </p>

      <fieldset className="camera-settings__group">
        <legend>Input toggles</legend>
        <Toggle
          label="WASD pan"
          checked={prefs.wasdPan}
          onChange={(v) => setCameraPrefs({ wasdPan: v })}
        />
        <Toggle
          label="Q/E rotate"
          checked={prefs.qeRotate}
          onChange={(v) => setCameraPrefs({ qeRotate: v })}
        />
        <Toggle
          label="Mouse wheel zoom"
          checked={prefs.wheelZoom}
          onChange={(v) => setCameraPrefs({ wheelZoom: v })}
        />
        <Toggle
          label="Mouse-edge scroll (RTS-style pan at viewport edge)"
          checked={prefs.edgeScroll}
          onChange={(v) => setCameraPrefs({ edgeScroll: v })}
        />
        <Toggle
          label="Middle-click drag pan"
          checked={prefs.middleClickPan}
          onChange={(v) => setCameraPrefs({ middleClickPan: v })}
        />
        <Toggle
          label="Right-click drag rotate"
          checked={prefs.rightClickRotate}
          onChange={(v) => setCameraPrefs({ rightClickRotate: v })}
        />
        <Toggle
          label="Arrow-key pan"
          checked={prefs.arrowPan}
          onChange={(v) => setCameraPrefs({ arrowPan: v })}
        />
        <Toggle
          label="Invert Y on rotate"
          checked={prefs.invertYRotate}
          onChange={(v) => setCameraPrefs({ invertYRotate: v })}
        />
      </fieldset>

      <fieldset className="camera-settings__group">
        <legend>Sensitivity</legend>
        <Slider
          label="Pan"
          value={prefs.panSensitivity}
          onChange={(v) => setCameraPrefs({ panSensitivity: v })}
        />
        <Slider
          label="Rotate"
          value={prefs.rotateSensitivity}
          onChange={(v) => setCameraPrefs({ rotateSensitivity: v })}
        />
        <Slider
          label="Zoom"
          value={prefs.zoomSensitivity}
          onChange={(v) => setCameraPrefs({ zoomSensitivity: v })}
        />
      </fieldset>

      <button type="button" className="camera-settings__reset" onClick={() => resetCameraPrefs()}>
        Reset to defaults
      </button>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  readonly label: string
  readonly checked: boolean
  readonly onChange: (v: boolean) => void
}) {
  return (
    <label className="camera-settings__toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function Slider({
  label,
  value,
  onChange,
}: {
  readonly label: string
  readonly value: number
  readonly onChange: (v: number) => void
}) {
  return (
    <label className="camera-settings__slider">
      <span className="camera-settings__slider-label">{label}</span>
      <input
        type="range"
        min={0.5}
        max={3}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="camera-settings__slider-value">{value.toFixed(1)}×</span>
    </label>
  )
}
