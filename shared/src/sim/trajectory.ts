import { type Vec3 } from '../types/index'

export interface SphericalArc {
  readonly start: Vec3
  readonly end: Vec3
  readonly radius: number
  readonly arcLength: number
}

export function vec3Length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

export function vec3Normalize(v: Vec3): Vec3 {
  const len = vec3Length(v)
  if (len === 0) return { x: 0, y: 0, z: 0 }
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

export function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

export function vec3Scale(v: Vec3, k: number): Vec3 {
  return { x: v.x * k, y: v.y * k, z: v.z * k }
}

export function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

export function vec3Distance(a: Vec3, b: Vec3): number {
  return vec3Length(vec3Sub(a, b))
}

export function newSphericalArc(start: Vec3, end: Vec3, radius: number): SphericalArc {
  const startUnit = vec3Normalize(start)
  const endUnit = vec3Normalize(end)
  const dot = Math.max(-1, Math.min(1, vec3Dot(startUnit, endUnit)))
  const angle = Math.acos(dot)
  const arcLength = angle * radius
  return {
    start: vec3Scale(startUnit, radius),
    end: vec3Scale(endUnit, radius),
    radius,
    arcLength,
  }
}

export function pointAlongArc(arc: SphericalArc, t: number): Vec3 {
  const tt = Math.max(0, Math.min(1, t))
  const startUnit = vec3Normalize(arc.start)
  const endUnit = vec3Normalize(arc.end)
  const dot = Math.max(-1, Math.min(1, vec3Dot(startUnit, endUnit)))
  const omega = Math.acos(dot)
  if (omega < 1e-6) {
    return vec3Scale(startUnit, arc.radius)
  }
  const sinOmega = Math.sin(omega)
  const a = Math.sin((1 - tt) * omega) / sinOmega
  const b = Math.sin(tt * omega) / sinOmega
  const blended = vec3Add(vec3Scale(startUnit, a), vec3Scale(endUnit, b))
  return vec3Scale(vec3Normalize(blended), arc.radius)
}

export function arcDuration(arc: SphericalArc, speedPerTick: number): number {
  if (speedPerTick <= 0) return Infinity
  return Math.ceil(arc.arcLength / speedPerTick)
}

export interface InterceptSolution {
  readonly attackerArc: SphericalArc
  readonly attackerProgress: number
  readonly defenderLaunchPoint: Vec3
  readonly defenderArc: SphericalArc
  readonly interceptPoint: Vec3
  readonly defenderTicksToIntercept: number
  readonly canIntercept: boolean
}

export function solveIntercept(
  attackerArc: SphericalArc,
  attackerSpeedPerTick: number,
  attackerProgressTicks: number,
  defenderLaunchPoint: Vec3,
  defenderSpeedPerTick: number,
  radius: number,
): InterceptSolution {
  const attackerTotalTicks = arcDuration(attackerArc, attackerSpeedPerTick)
  const remainingTicks = Math.max(0, attackerTotalTicks - attackerProgressTicks)
  for (let dt = 1; dt <= remainingTicks; dt++) {
    const futureProgress = attackerProgressTicks + dt
    const t = Math.min(1, futureProgress / attackerTotalTicks)
    const interceptPoint = pointAlongArc(attackerArc, t)
    const defenderArc = newSphericalArc(defenderLaunchPoint, interceptPoint, radius)
    const defenderTicks = arcDuration(defenderArc, defenderSpeedPerTick)
    if (defenderTicks <= dt) {
      return {
        attackerArc,
        attackerProgress: attackerProgressTicks,
        defenderLaunchPoint,
        defenderArc,
        interceptPoint,
        defenderTicksToIntercept: defenderTicks,
        canIntercept: true,
      }
    }
  }
  return {
    attackerArc,
    attackerProgress: attackerProgressTicks,
    defenderLaunchPoint,
    defenderArc: newSphericalArc(defenderLaunchPoint, attackerArc.end, radius),
    interceptPoint: attackerArc.end,
    defenderTicksToIntercept: Infinity,
    canIntercept: false,
  }
}

export function greatCircleAngularDistance(start: Vec3, end: Vec3): number {
  const startUnit = vec3Normalize(start)
  const endUnit = vec3Normalize(end)
  const dot = Math.max(-1, Math.min(1, vec3Dot(startUnit, endUnit)))
  return Math.acos(dot)
}
