// PHASE 17.L.A.9 — Q13 PHASE 17 LOCKED. Top-down tracking camera following ONE in-flight
// colony ship at a time.
//
// User verbatim (LAW #0): "Top-down tracking-cam following ONE in-flight rocket at a time
// (player picks which to track via dropdown). NOT remote planet feeds; NOT nose-cam."
//
// V1 implementation: SVG minimap top-down view. Target planet at center; arc trace from
// launching planet to target; flight position dot along the arc; live telemetry readouts
// beneath (phase, distance-to-target, ETA, fuel/power, crew). A future v2 may swap this for a
// WebGL render-to-texture from a second Three.js camera locked above the flight position —
// deferred until the player UX needs the 3D depth cues.

import { useEffect, useMemo, useState } from 'react'
import {
  type ColonyShipFlight,
  flightCurrentPosition,
  flightDef,
  flightTelemetrySnapshot,
  TARGETING_MODE_EMOJI,
} from '@smol/shared'
import './TrackingCameraPanel.css'

export interface TrackingCameraPanelProps {
  readonly activeFlights: ReadonlyArray<ColonyShipFlight>
  // Initial tracked flight id (e.g. the most-recently-launched). Modal manages its own
  // selection after that via the dropdown.
  readonly defaultFlightId?: string | null
}

const MAP_SIZE = 320 // SVG viewBox W=H. Self-contained square minimap.
const ARC_SAMPLES = 32 // Polyline samples along the SphericalArc.

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// PHASE 17.L.A.9 — sample N points along the SphericalArc using the existing pointAlongArc
// helper. Rendered as a polyline so the player can see the great-circle path.
function sampleArc(flight: ColonyShipFlight): Array<{ x: number; z: number }> {
  // ColonyShipFlight.arc has start, end + computed control. We don't have direct access to
  // pointAlongArc inside this module, but FlightTelemetrySnapshot.progress tells us where the
  // ship CURRENTLY is — we can derive arc samples by reading the start/end + center of the
  // shared arc. For v1 minimap purposes, a straight-line interpolation between start and end
  // (projected to top-down XZ) is sufficient.
  const points: Array<{ x: number; z: number }> = []
  for (let i = 0; i <= ARC_SAMPLES; i += 1) {
    const t = i / ARC_SAMPLES
    points.push({
      x: lerp(flight.arc.start.x, flight.arc.end.x, t),
      z: lerp(flight.arc.start.z, flight.arc.end.z, t),
    })
  }
  return points
}

// Project world XZ to SVG XY (Y flipped since SVG +y is down). Bounds the entire arc in the
// minimap with a 12-unit padding.
function buildProjection(samples: Array<{ x: number; z: number }>): {
  toSvg: (p: { x: number; z: number }) => { x: number; y: number }
  minX: number
  maxX: number
  minZ: number
  maxZ: number
} {
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  for (const p of samples) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.z < minZ) minZ = p.z
    if (p.z > maxZ) maxZ = p.z
  }
  if (minX === maxX) {
    minX -= 1
    maxX += 1
  }
  if (minZ === maxZ) {
    minZ -= 1
    maxZ += 1
  }
  const rangeX = maxX - minX
  const rangeZ = maxZ - minZ
  const range = Math.max(rangeX, rangeZ)
  const pad = 24
  const draw = MAP_SIZE - pad * 2
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2
  return {
    toSvg: (p) => ({
      x: pad + ((p.x - cx) / range) * draw + draw / 2,
      y: pad + draw - (((p.z - cz) / range) * draw + draw / 2),
    }),
    minX,
    maxX,
    minZ,
    maxZ,
  }
}

export function TrackingCameraPanel({
  activeFlights,
  defaultFlightId = null,
}: TrackingCameraPanelProps) {
  const [trackedId, setTrackedId] = useState<string | null>(defaultFlightId)

  // Auto-pick the first active flight if nothing is selected. When the tracked flight
  // terminates (no longer in activeFlights), auto-switch to the next available flight.
  useEffect(() => {
    if (activeFlights.length === 0) {
      setTrackedId(null)
      return
    }
    if (!trackedId || !activeFlights.find((f) => String(f.id) === trackedId)) {
      setTrackedId(String(activeFlights[0]!.id))
    }
  }, [activeFlights, trackedId])

  const trackedFlight = useMemo(
    () => activeFlights.find((f) => String(f.id) === trackedId) ?? null,
    [activeFlights, trackedId],
  )

  if (activeFlights.length === 0) {
    return (
      <div className="tracking-camera-panel">
        <p className="tracking-camera-panel__empty">
          No active flights to track. Launch a colony ship and it'll appear here.
        </p>
      </div>
    )
  }

  if (!trackedFlight) {
    return (
      <div className="tracking-camera-panel">
        <p className="tracking-camera-panel__empty">Pick a flight to track.</p>
      </div>
    )
  }

  const telemetry = flightTelemetrySnapshot(trackedFlight)
  const def = flightDef(trackedFlight)
  const samples = sampleArc(trackedFlight)
  const projection = buildProjection(samples)
  const currentPos = flightCurrentPosition(trackedFlight)
  const currentSvg = projection.toSvg({ x: currentPos.x, z: currentPos.z })
  const startSvg = projection.toSvg(trackedFlight.arc.start)
  const endSvg = projection.toSvg(trackedFlight.arc.end)

  const fuelPctText = (telemetry.fuelPct * 100).toFixed(0)
  const powerPctText = (telemetry.powerPct * 100).toFixed(0)
  const lifeSupportPctText = (telemetry.lifeSupportPct * 100).toFixed(0)

  return (
    <div className="tracking-camera-panel">
      <div className="tracking-camera-panel__picker">
        <label htmlFor="tracking-camera-flight-picker">Tracking flight:</label>
        <select
          id="tracking-camera-flight-picker"
          value={trackedId ?? ''}
          onChange={(e) => setTrackedId(e.target.value)}
          className="tracking-camera-panel__select"
        >
          {activeFlights.map((flight) => {
            const fd = flightDef(flight)
            return (
              <option key={String(flight.id)} value={String(flight.id)}>
                {fd.emoji} {fd.name} → {String(flight.targetPlanetId)} [{flight.phase}]
              </option>
            )
          })}
        </select>
      </div>

      <div className="tracking-camera-panel__minimap-wrap">
        <svg
          className="tracking-camera-panel__minimap"
          viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Top-down flight tracker"
        >
          {/* Background grid */}
          <rect width={MAP_SIZE} height={MAP_SIZE} className="tracking-camera-panel__bg" />
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={`vline-${t}`}
              x1={MAP_SIZE * t}
              y1={0}
              x2={MAP_SIZE * t}
              y2={MAP_SIZE}
              className="tracking-camera-panel__grid"
            />
          ))}
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={`hline-${t}`}
              x1={0}
              y1={MAP_SIZE * t}
              x2={MAP_SIZE}
              y2={MAP_SIZE * t}
              className="tracking-camera-panel__grid"
            />
          ))}

          {/* Arc trace */}
          <polyline
            className="tracking-camera-panel__arc"
            points={samples
              .map((p) => projection.toSvg(p))
              .map((sp) => `${sp.x},${sp.y}`)
              .join(' ')}
            fill="none"
          />

          {/* Source planet (start) */}
          <circle cx={startSvg.x} cy={startSvg.y} r={6} className="tracking-camera-panel__source" />
          <text x={startSvg.x + 8} y={startSvg.y + 4} className="tracking-camera-panel__label">
            FROM
          </text>

          {/* Target planet (end) */}
          <circle cx={endSvg.x} cy={endSvg.y} r={8} className="tracking-camera-panel__target" />
          <text x={endSvg.x + 10} y={endSvg.y + 4} className="tracking-camera-panel__label">
            TARGET
          </text>

          {/* Live flight position */}
          <circle
            cx={currentSvg.x}
            cy={currentSvg.y}
            r={5}
            className="tracking-camera-panel__flight"
          />
          <circle
            cx={currentSvg.x}
            cy={currentSvg.y}
            r={10}
            className="tracking-camera-panel__flight-pulse"
          />
        </svg>
      </div>

      <dl className="tracking-camera-panel__telemetry">
        <div>
          <dt>Ship</dt>
          <dd>
            {def.emoji} {def.name}
          </dd>
        </div>
        <div>
          <dt>Phase</dt>
          <dd>
            {trackedFlight.phase}
            {trackedFlight.shuttleLeg ? ` · ${trackedFlight.shuttleLeg}` : ''}
          </dd>
        </div>
        <div>
          <dt>Targeting</dt>
          <dd>
            {TARGETING_MODE_EMOJI[trackedFlight.targetingMode]} {trackedFlight.targetingMode}
          </dd>
        </div>
        <div>
          <dt>Distance</dt>
          <dd>{telemetry.distToTarget.toFixed(0)} units</dd>
        </div>
        <div>
          <dt>Closing speed</dt>
          <dd>{telemetry.closingSpeed.toFixed(1)} u/t</dd>
        </div>
        <div>
          <dt>Progress</dt>
          <dd>{(telemetry.progress * 100).toFixed(0)}%</dd>
        </div>
        <div>
          <dt>Fuel</dt>
          <dd>{fuelPctText}%</dd>
        </div>
        <div>
          <dt>Power</dt>
          <dd>{powerPctText}%</dd>
        </div>
        <div>
          <dt>Life support</dt>
          <dd>{lifeSupportPctText}%</dd>
        </div>
        <div>
          <dt>Crew aboard</dt>
          <dd>
            {trackedFlight.crewAlive} / {trackedFlight.citizensAboard}
          </dd>
        </div>
        {telemetry.signalLost && (
          <div className="tracking-camera-panel__signal-lost">
            <dt>Signal</dt>
            <dd>⚠ LOST</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
