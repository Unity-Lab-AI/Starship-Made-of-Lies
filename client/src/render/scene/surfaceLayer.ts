import * as THREE from 'three'
import {
  type BuildingDefId,
  type CivId,
  type Planet,
  type PlanetId,
  type Tile,
  type TileId,
  type ResourceNode,
  BUILDINGS,
  RESOURCES,
} from '@smol/shared'

// PHASE 17.L.D.11 (HOTFIX 2026-05-11) — resource emoji map for the resource-node sprite
// billboards. Same pattern as the building emoji cache. Per user verbatim *"AND IM NOT
// SEEING ASNY RESOURCE NODE FOR THE MINING SHIPS TO MINE ON THE PLANET FOR HIGHER TEIR
// RESOURCES THAT DONT JUST COME FROM BUILDINGS"* — deposits at depositSize 1.6-4 were
// sub-pixel relative to 400-1600 unit planets. Bumped sizes + added emoji label so
// mining nodes are clearly visible as 🪨 / 💍 / etc. at any zoom.
const RESOURCE_EMOJI_BY_ID = new Map(RESOURCES.map((r) => [String(r.id), r.emoji]))

// PHASE 17.L.D.9 (HOTFIX 2026-05-11) — emoji-sprite cache. Each unique building emoji glyph
// gets rendered to a small canvas once + reused as a THREE.CanvasTexture so syncBuildings
// can scale to 100s of placed buildings without re-rasterizing. Per user verbatim *"YEAH THER
// IS NO CORRECT EMOJI ICON FOR THE BUILDING PLACED APPERARING ON THE PLANETS WHEN PALCING
// BUILDINGS"* — the v1 syncBuildings rendered generic shapes by tile.occupancy, ignoring the
// per-building emoji.
const buildingEmojiTextureCache = new Map<string, THREE.CanvasTexture>()

function getEmojiTexture(emoji: string): THREE.CanvasTexture {
  const cached = buildingEmojiTextureCache.get(emoji)
  if (cached) return cached
  // HOTFIX 17.L.D.19 — canvas size bumped 128 -> 256 for crispness at hex-filling sprite
  // sizes (D.16 sized sprites to hexScale * 1.55 = up to 248 world units; the 128-pixel
  // texture was undersampled at that scale).
  const canvas = document.createElement('canvas')
  const SIZE = 256
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  // HOTFIX 17.L.D.19 — clearRect (not fillRect with transparent) for the reset. Previous
  // code set fillStyle='rgba(0,0,0,0)' which is transparent black; on Windows Firefox + some
  // browsers, when fillText runs LATER with that same fillStyle, the color-emoji glyph alpha
  // gets multiplied by 0 → glyph renders fully transparent. The sprite then sees an empty
  // texture and falls back to the SpriteMaterial's default white color (the "microscopic
  // white rectangle" the user reported). clearRect is the correct API for resetting to
  // transparent + fillStyle must be opaque before fillText so emoji glyphs render with
  // their embedded colors at full alpha.
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.font = `${Math.floor(SIZE * 0.78)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // Opaque white fillStyle. Color-emoji glyphs use their embedded color regardless of
  // fillStyle's RGB, but the alpha must be 1 or the glyph won't show.
  ctx.fillStyle = 'rgba(255,255,255,1)'
  ctx.fillText(emoji, SIZE / 2, SIZE * 0.55)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  tex.needsUpdate = true
  buildingEmojiTextureCache.set(emoji, tex)
  return tex
}

// Build def → emoji map for O(1) lookup during syncBuildings.
const BUILDING_EMOJI_BY_DEF_ID: Map<BuildingDefId, string> = new Map(
  BUILDINGS.map((d) => [d.id, d.emoji]),
)

const BIOME_COLORS: Readonly<Record<string, number>> = {
  terran: 0x4ea869,
  archipelago: 0x4fb8b0,
  jungle: 0x2f8c4c,
  desert: 0xd9a86c,
  arctic: 0xbfdaf2,
  ocean: 0x2a5d8f,
  swamp: 0x5e6e3a,
  volcanic: 0xc44a2a,
  gasGiantMoon: 0xa970d4,
  asteroid: 0x6c6c70,
  crystalline: 0x9adfd4,
  junkyard: 0xa07050,
  lava: 0xff5a2a,
  ringworld: 0xd4c060,
}

const DEPOSIT_COLORS: Readonly<Record<string, number>> = {
  stone: 0xa39a8a,
  rareMetals: 0xc9a14d,
  exoticAlloys: 0xbb55ff,
  ancientTech: 0x55ffe0,
  gas: 0x88aaff,
  scrap: 0xa57848,
  components: 0xb0c0d0,
}

// PHASE 17.L.D.8 (HOTFIX 2026-05-11) — bumped ~20× from prior 4.5-6.5 values. Per user
// verbatim playtest *"AND PLACING BUILDINGS IS NOT WORKING I CLICK DIRECTLY ON THE VERY
// VERY SMALL HEXS ON THE PLANET AND NOTHING HAPPENS... ALSDO THE HEX LOCATIONS ON THE
// PLANETS ARE VERY VERY SMALL I CAN BARLY CLICK THEM"*. The old values were ~1% of planet
// radius — visually dots, and the raycaster intersects only the CircleGeometry, not the
// geodesic face it represents, so click targets were tiny. New values size each hex disk
// to ~10% of planet radius — visible + clickable without overlapping neighbors at typical
// geodesic-subdivision tile counts (icosphere with ~32-122 faces per planet).
const TILE_HEX_SCALE_BY_TIER: Record<Planet['sizeTier'], number> = {
  moon: 40,
  small: 60,
  standard: 90,
  large: 120,
  super: 160,
}

function biomeColorHex(biomeId: string): number {
  return BIOME_COLORS[biomeId] ?? 0x8a8a92
}

function depositColorHex(resourceId: string): number {
  return DEPOSIT_COLORS[resourceId] ?? 0xffffff
}

// PHASE 17.L.D.11 (HOTFIX 2026-05-11) — bumped ~20× from prior 1.6-4 values. The old sizes
// rendered as sub-pixel dots at every camera zoom on the new 400-1600 unit planet radii
// (planet got bigger in D.5 but deposit sizes never followed). New values size deposits to
// ~5-10% of planet radius — visible AT galaxy zoom as colored dots, distinguishable at
// surface zoom as named resource nodes via the new emoji sprite billboard.
function depositSize(tier: ResourceNode['tier']): number {
  switch (tier) {
    case 'common':
      return 30
    case 'rich':
      return 50
    case 'motherlode':
      return 80
    default:
      return 30
  }
}

export interface SurfaceLayerHandle {
  readonly planetId: PlanetId
  readonly group: THREE.Group
  readonly tilesMesh: THREE.InstancedMesh
  readonly buildingsGroup: THREE.Group
  readonly depositsGroup: THREE.Group
  readonly hoverHighlight: THREE.Mesh
  readonly faceIndexByInstance: ReadonlyArray<number>
  syncOwnership(tiles: ReadonlyArray<Tile>, civColorById: ReadonlyMap<CivId, number>): void
  syncBuildings(
    tiles: ReadonlyArray<Tile>,
    buildingsByTile?: ReadonlyMap<TileId, BuildingDefId>,
  ): void
  setHoveredFace(faceIndex: number | null): void
  setVisibleAtDistance(cameraDistance: number, planetSurfaceRadius: number): void
  dispose(): void
}

export function buildSurfaceLayer(planet: Planet): SurfaceLayerHandle {
  const group = new THREE.Group()
  group.userData = { kind: 'surface', planetId: planet.id }

  const hexScale = TILE_HEX_SCALE_BY_TIER[planet.sizeTier]
  const tileGeom = new THREE.CircleGeometry(hexScale, 6)
  // CircleGeometry sits in the XY plane with normal +Z. We rotate per-instance so +Z aligns with tile.normal.
  // HOTFIX 17.L.D.17 — hex tile material is now FULLY TRANSPARENT. Per user verbatim "the
  // hexs are black ... they should be a green color or the color of the planet with no
  // decrenable visual disfrence but the butuild circle icon when mousing over". The
  // visible-tile-grid approach (vertexColors with per-instance biome color) wasn't reading
  // correctly through ACES tone mapping in D.15 — tiles came out black instead of biome-
  // tinted. Player only wants the hover ring to indicate hex bounds. The transparent
  // material keeps the InstancedMesh raycastable (Three.js raycasting is geometry-based, not
  // material-based) so click-to-place still works; the planet biome color shows through
  // unobstructed. Building emoji sprites + resource node sprites still render normally on
  // top because they're separate Object3Ds.
  const tileMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const tilesMesh = new THREE.InstancedMesh(tileGeom, tileMat, planet.tiles.length)
  tilesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  tilesMesh.userData = { kind: 'surface-tiles', planetId: planet.id }

  const dummy = new THREE.Object3D()
  const tmpNormal = new THREE.Vector3()
  const circleNormal = new THREE.Vector3(0, 0, 1)
  const tmpColor = new THREE.Color()
  const lift = 0.4
  const faceIndexByInstance: number[] = []

  for (let i = 0; i < planet.tiles.length; i++) {
    const tile = planet.tiles[i]!
    faceIndexByInstance.push(tile.faceIndex)
    tmpNormal.set(tile.normal.x, tile.normal.y, tile.normal.z)
    dummy.position.set(
      tile.centroid.x + tile.normal.x * lift,
      tile.centroid.y + tile.normal.y * lift,
      tile.centroid.z + tile.normal.z * lift,
    )
    dummy.quaternion.setFromUnitVectors(circleNormal, tmpNormal)
    dummy.scale.setScalar(1)
    dummy.updateMatrix()
    tilesMesh.setMatrixAt(i, dummy.matrix)
    tmpColor.setHex(biomeColorHex(tile.biomeId))
    tilesMesh.setColorAt(i, tmpColor)
  }
  tilesMesh.instanceMatrix.needsUpdate = true
  if (tilesMesh.instanceColor) tilesMesh.instanceColor.needsUpdate = true
  group.add(tilesMesh)

  // Hover highlight (single ring mesh, repositioned per hover)
  const hoverGeom = new THREE.RingGeometry(hexScale * 1.05, hexScale * 1.25, 24)
  const hoverMat = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const hoverHighlight = new THREE.Mesh(hoverGeom, hoverMat)
  hoverHighlight.userData = { kind: 'surface-hover', planetId: planet.id }
  hoverHighlight.visible = false
  group.add(hoverHighlight)

  // Buildings group (populated by syncBuildings on tick)
  const buildingsGroup = new THREE.Group()
  buildingsGroup.userData = { kind: 'surface-buildings', planetId: planet.id }
  group.add(buildingsGroup)

  // Resource deposits — glowing emissive spheres at each node's local-space position
  const depositsGroup = new THREE.Group()
  depositsGroup.userData = { kind: 'surface-deposits', planetId: planet.id }
  for (const node of planet.resourceNodes) {
    const localX = node.worldPosition.x - planet.position.x
    const localY = node.worldPosition.y - planet.position.y
    const localZ = node.worldPosition.z - planet.position.z
    const len = Math.hypot(localX, localY, localZ) || 1
    const nx = localX / len
    const ny = localY / len
    const nz = localZ / len
    const liftAmt = depositSize(node.tier) * 0.7
    const color = depositColorHex(String(node.resourceId))
    const geom = new THREE.SphereGeometry(depositSize(node.tier), 8, 8)
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.7,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0.95,
    })
    const mesh = new THREE.Mesh(geom, mat)
    mesh.position.set(localX + nx * liftAmt, localY + ny * liftAmt, localZ + nz * liftAmt)
    mesh.userData = { kind: 'surface-deposit', planetId: planet.id, nodeId: node.id }
    depositsGroup.add(mesh)

    // PHASE 17.L.D.11 (HOTFIX 2026-05-11) — emoji sprite billboard per resource node.
    // Looks up the resource's emoji from RESOURCES catalog so mining nodes are visually
    // identifiable (🪨 stone, 💍 rare metals, 🔩 metals, etc.). Same caching pattern as
    // building emoji sprites in D.9. Per user verbatim *"AND IM NOT SEEING ASNY RESOURCE
    // NODE FOR THE MINING SHIPS TO MINE ON THE PLANET FOR HIGHER TEIR RESOURCES THAT DONT
    // JUST COME FROM BUILDINGS"*.
    const emoji = RESOURCE_EMOJI_BY_ID.get(String(node.resourceId)) ?? '⛏️'
    const tex = getEmojiTexture(emoji)
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        // HOTFIX 17.L.D.18 — same z-clip fix as the building emoji sprite. The resource node
        // emoji sprite is centered at the node's lifted position; at grazing angles the
        // quad extends into the planet sphere and gets clipped. depthTest=false + renderOrder
        // guarantees the emoji is always visible.
        depthTest: false,
        depthWrite: false,
      }),
    )
    sprite.renderOrder = 10
    const spriteSize = depositSize(node.tier) * 2.5
    sprite.scale.set(spriteSize, spriteSize, 1)
    const spriteLift = liftAmt + spriteSize * 0.6
    sprite.position.set(
      localX + nx * spriteLift,
      localY + ny * spriteLift,
      localZ + nz * spriteLift,
    )
    sprite.userData = {
      kind: 'surface-deposit-emoji',
      planetId: planet.id,
      nodeId: node.id,
      resourceId: String(node.resourceId),
    }
    depositsGroup.add(sprite)
  }
  group.add(depositsGroup)

  group.visible = false

  function syncOwnership(
    tiles: ReadonlyArray<Tile>,
    civColorById: ReadonlyMap<CivId, number>,
  ): void {
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i]!
      const biomeHex = biomeColorHex(tile.biomeId)
      if (tile.ownerCivId) {
        const civHex = civColorById.get(tile.ownerCivId)
        if (civHex !== undefined) {
          // Blend: 60% biome + 40% civ tint
          const br = ((biomeHex >> 16) & 0xff) / 255
          const bg = ((biomeHex >> 8) & 0xff) / 255
          const bb = (biomeHex & 0xff) / 255
          const cr = ((civHex >> 16) & 0xff) / 255
          const cg = ((civHex >> 8) & 0xff) / 255
          const cb = (civHex & 0xff) / 255
          tmpColor.setRGB(br * 0.6 + cr * 0.4, bg * 0.6 + cg * 0.4, bb * 0.6 + cb * 0.4)
        } else {
          tmpColor.setHex(biomeHex)
        }
      } else {
        tmpColor.setHex(biomeHex)
      }
      tilesMesh.setColorAt(i, tmpColor)
    }
    if (tilesMesh.instanceColor) tilesMesh.instanceColor.needsUpdate = true
  }

  function syncBuildings(
    tiles: ReadonlyArray<Tile>,
    buildingsByTile?: ReadonlyMap<TileId, BuildingDefId>,
  ): void {
    // Naive sync: dispose+rebuild each call. For PHASE 16.5 v1 fine; PHASE 16.9 polish can incrementalize.
    while (buildingsGroup.children.length > 0) {
      const child = buildingsGroup.children[0]!
      buildingsGroup.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
        else child.material.dispose()
      } else if (child instanceof THREE.Sprite) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
        else child.material.dispose()
      }
    }
    const upVec = new THREE.Vector3(0, 1, 0)
    const tmpN = new THREE.Vector3()
    for (const tile of tiles) {
      if (tile.occupancy === 'empty') continue
      const color = occupancyColorHex(tile.occupancy)
      const size = occupancyMeshSize(tile.occupancy)
      const geom = buildOccupancyGeom(tile.occupancy, size)
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.5,
        metalness: 0.3,
        emissive: color,
        emissiveIntensity: 0.4,
      })
      const mesh = new THREE.Mesh(geom, mat)
      tmpN.set(tile.normal.x, tile.normal.y, tile.normal.z)
      const buildLift = size * 0.5 + 0.2
      mesh.position.set(
        tile.centroid.x + tile.normal.x * buildLift,
        tile.centroid.y + tile.normal.y * buildLift,
        tile.centroid.z + tile.normal.z * buildLift,
      )
      mesh.quaternion.setFromUnitVectors(upVec, tmpN)
      mesh.userData = {
        kind: 'surface-building',
        planetId: planet.id,
        tileFaceIndex: tile.faceIndex,
        occupancy: tile.occupancy,
      }
      buildingsGroup.add(mesh)

      // PHASE 17.L.D.9 (HOTFIX 2026-05-11) — emoji sprite billboard per placed building.
      // Per user verbatim *"YEAH THER IS NO CORRECT EMOJI ICON FOR THE BUILDING PLACED
      // APPERARING ON THE PLANETS WHEN PALCING BUILDINGS"*. Looks up the building's emoji
      // from BUILDING_DEFS via buildingsByTile (passed by GalaxyView from
      // planet.buildingsByTile). Falls back to a generic generic 🏗 if the def lookup
      // fails or the map isn't supplied (back-compat for callers that haven't been wired).
      const defId = buildingsByTile?.get(tile.id)
      const emoji = (defId && BUILDING_EMOJI_BY_DEF_ID.get(defId)) || '🏗️'
      const tex = getEmojiTexture(emoji)
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          // HOTFIX 17.L.D.18 — depthTest off + renderOrder high. The sprite quad is screen-
          // facing centered at sprite.position. At grazing camera angles, the quad extends
          // in screen-space directions where MOST of it ends up INSIDE the planet sphere
          // (surfaceRadius 400-1600 units), getting z-clipped. Only a "tiny peck" sliver
          // visible. Per user verbatim "every time i place a building i only see the
          // spallest little peck apear in the center of the hex tile on planet". depthTest
          // false guarantees the full sprite always renders on top of the planet regardless
          // of camera angle. Render order +10 puts it after the surface tiles + building
          // mesh in the draw order so the emoji is the FINAL layer the player sees.
          depthTest: false,
          depthWrite: false,
        }),
      )
      sprite.renderOrder = 10
      // HOTFIX 17.L.D.16 — sprite sized to fill the hex tile. hexScale is the hexagon's
      // outer radius; flat-to-flat width = 2 × radius × cos(30°) ≈ 1.73 × radius. 1.55×
      // radius leaves a slim margin so the square sprite doesn't spill into neighbor hexes.
      //
      // HOTFIX 17.L.D.18 — spriteLift bumped to spriteSize × 0.6 so the sprite QUAD CENTER
      // is clearly outside the planet sphere surface. Combined with depthTest=false this
      // guarantees the full emoji renders even at oblique camera angles to the tile normal.
      const spriteSize = hexScale * 1.55
      sprite.scale.set(spriteSize, spriteSize, 1)
      const spriteLift = spriteSize * 0.6
      sprite.position.set(
        tile.centroid.x + tile.normal.x * spriteLift,
        tile.centroid.y + tile.normal.y * spriteLift,
        tile.centroid.z + tile.normal.z * spriteLift,
      )
      sprite.userData = {
        kind: 'surface-building-emoji',
        planetId: planet.id,
        tileFaceIndex: tile.faceIndex,
      }
      buildingsGroup.add(sprite)
    }
  }

  function setHoveredFace(faceIndex: number | null): void {
    if (faceIndex === null) {
      hoverHighlight.visible = false
      hoverMat.opacity = 0
      return
    }
    const tile = planet.tiles[faceIndex]
    if (!tile) {
      hoverHighlight.visible = false
      return
    }
    tmpNormal.set(tile.normal.x, tile.normal.y, tile.normal.z)
    hoverHighlight.position.set(
      tile.centroid.x + tile.normal.x * (lift + 0.2),
      tile.centroid.y + tile.normal.y * (lift + 0.2),
      tile.centroid.z + tile.normal.z * (lift + 0.2),
    )
    hoverHighlight.quaternion.setFromUnitVectors(circleNormal, tmpNormal)
    hoverHighlight.visible = true
    hoverMat.opacity = 0.85
  }

  function setVisibleAtDistance(cameraDistance: number, planetSurfaceRadius: number): void {
    // Show surface layer when camera is close to this planet (within 6x its surface radius)
    const visibleThreshold = planetSurfaceRadius * 6
    group.visible = cameraDistance < visibleThreshold
  }

  function dispose(): void {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
        else obj.material.dispose()
      }
      if (obj instanceof THREE.InstancedMesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
        else obj.material.dispose()
      }
    })
  }

  return {
    planetId: planet.id,
    group,
    tilesMesh,
    buildingsGroup,
    depositsGroup,
    hoverHighlight,
    faceIndexByInstance,
    syncOwnership,
    syncBuildings,
    setHoveredFace,
    setVisibleAtDistance,
    dispose,
  }
}

function occupancyColorHex(occ: Tile['occupancy']): number {
  switch (occ) {
    case 'launchPad':
      return 0xff8844
    case 'mine':
      return 0xc8a040
    case 'mineField':
      return 0xff3344
    case 'counterMissilePad':
      return 0x44aaff
    case 'building':
      return 0xdddddd
    case 'empty':
      return 0x444444
  }
}

function occupancyMeshSize(occ: Tile['occupancy']): number {
  switch (occ) {
    case 'launchPad':
      return 2.4
    case 'mine':
      return 1.6
    case 'mineField':
      return 1.2
    case 'counterMissilePad':
      return 2
    case 'building':
      return 1.8
    case 'empty':
      return 0
  }
}

function buildOccupancyGeom(occ: Tile['occupancy'], size: number): THREE.BufferGeometry {
  switch (occ) {
    case 'launchPad':
      return new THREE.CylinderGeometry(size * 0.9, size * 1.1, size * 1.4, 8)
    case 'mine':
      return new THREE.ConeGeometry(size * 0.8, size * 1.6, 6)
    case 'mineField':
      return new THREE.OctahedronGeometry(size, 0)
    case 'counterMissilePad':
      return new THREE.CylinderGeometry(size * 0.6, size, size * 1.2, 6)
    case 'building':
      return new THREE.BoxGeometry(size, size * 1.2, size)
    case 'empty':
      return new THREE.BoxGeometry(0.001, 0.001, 0.001)
  }
}
