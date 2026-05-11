import type { Vec3 } from '../types/index'

export interface IcosphereFace {
  readonly index: number
  readonly vertexIndices: readonly [number, number, number]
  readonly centroid: Vec3
  readonly normal: Vec3
  readonly neighbors: ReadonlyArray<number>
}

export interface Icosphere {
  readonly vertices: ReadonlyArray<Vec3>
  readonly faces: ReadonlyArray<IcosphereFace>
  readonly radius: number
}

const PHI = (1 + Math.sqrt(5)) / 2

const ICOSAHEDRON_VERTS: ReadonlyArray<readonly [number, number, number]> = [
  [-1, PHI, 0],
  [1, PHI, 0],
  [-1, -PHI, 0],
  [1, -PHI, 0],
  [0, -1, PHI],
  [0, 1, PHI],
  [0, -1, -PHI],
  [0, 1, -PHI],
  [PHI, 0, -1],
  [PHI, 0, 1],
  [-PHI, 0, -1],
  [-PHI, 0, 1],
]

const ICOSAHEDRON_FACES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 11, 5],
  [0, 5, 1],
  [0, 1, 7],
  [0, 7, 10],
  [0, 10, 11],
  [1, 5, 9],
  [5, 11, 4],
  [11, 10, 2],
  [10, 7, 6],
  [7, 1, 8],
  [3, 9, 4],
  [3, 4, 2],
  [3, 2, 6],
  [3, 6, 8],
  [3, 8, 9],
  [4, 9, 5],
  [2, 4, 11],
  [6, 2, 10],
  [8, 6, 7],
  [9, 8, 1],
]

function normalizeTo(v: readonly [number, number, number], radius: number): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1
  return { x: (v[0] / len) * radius, y: (v[1] / len) * radius, z: (v[2] / len) * radius }
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`
}

export function buildIcosphere(detail: number, radius: number): Icosphere {
  const verts: Vec3[] = ICOSAHEDRON_VERTS.map((v) => normalizeTo(v, radius))
  let faces: Array<readonly [number, number, number]> = ICOSAHEDRON_FACES.map((f) => [
    f[0],
    f[1],
    f[2],
  ])
  const midCache = new Map<string, number>()

  const getMid = (a: number, b: number): number => {
    const key = edgeKey(a, b)
    const cached = midCache.get(key)
    if (cached !== undefined) return cached
    const va = verts[a]!
    const vb = verts[b]!
    const mid = normalizeTo([va.x + vb.x, va.y + vb.y, va.z + vb.z] as const, radius)
    verts.push(mid)
    const idx = verts.length - 1
    midCache.set(key, idx)
    return idx
  }

  for (let step = 0; step < detail; step++) {
    const nextFaces: Array<readonly [number, number, number]> = []
    for (const f of faces) {
      const a = f[0]
      const b = f[1]
      const c = f[2]
      const ab = getMid(a, b)
      const bc = getMid(b, c)
      const ca = getMid(c, a)
      nextFaces.push([a, ab, ca])
      nextFaces.push([b, bc, ab])
      nextFaces.push([c, ca, bc])
      nextFaces.push([ab, bc, ca])
    }
    faces = nextFaces
  }

  const edgeToFaces = new Map<string, number[]>()
  faces.forEach((f, i) => {
    for (const [u, v] of [
      [f[0], f[1]],
      [f[1], f[2]],
      [f[2], f[0]],
    ] as const) {
      const key = edgeKey(u, v)
      const arr = edgeToFaces.get(key)
      if (arr) arr.push(i)
      else edgeToFaces.set(key, [i])
    }
  })

  const faceObjs: IcosphereFace[] = faces.map((f, i) => {
    const v1 = verts[f[0]]!
    const v2 = verts[f[1]]!
    const v3 = verts[f[2]]!
    const cx = (v1.x + v2.x + v3.x) / 3
    const cy = (v1.y + v2.y + v3.y) / 3
    const cz = (v1.z + v2.z + v3.z) / 3
    const centroid = normalizeTo([cx, cy, cz] as const, radius)
    const cLen = Math.hypot(centroid.x, centroid.y, centroid.z) || 1
    const normal: Vec3 = { x: centroid.x / cLen, y: centroid.y / cLen, z: centroid.z / cLen }
    const neighbors: number[] = []
    for (const [u, v] of [
      [f[0], f[1]],
      [f[1], f[2]],
      [f[2], f[0]],
    ] as const) {
      const pair = edgeToFaces.get(edgeKey(u, v))
      if (!pair) continue
      for (const fi of pair) if (fi !== i) neighbors.push(fi)
    }
    return {
      index: i,
      vertexIndices: [f[0], f[1], f[2]],
      centroid,
      normal,
      neighbors,
    }
  })

  return { vertices: verts, faces: faceObjs, radius }
}

export function subdivisionForSizeTier(
  tier: 'moon' | 'small' | 'standard' | 'large' | 'super',
): number {
  switch (tier) {
    case 'moon':
      return 2
    case 'small':
      return 2
    case 'standard':
      return 3
    case 'large':
      return 3
    case 'super':
      return 4
  }
}
