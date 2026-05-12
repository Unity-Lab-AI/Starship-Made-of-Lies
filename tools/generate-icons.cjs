// PHASE 17.0 + Layer E #2 — App icon generator. Reads a source PNG (>= 1024×1024 recommended)
// and emits every size + format required by Tauri (Windows / macOS / Linux) + Capacitor
// (iOS / Android). Run from project root:
//
//   node tools/generate-icons.cjs path/to/source-icon.png
//
// Outputs:
//   src-tauri/icons/32x32.png          (Linux toolbar)
//   src-tauri/icons/128x128.png        (Linux desktop)
//   src-tauri/icons/128x128@2x.png     (HiDPI variant)
//   src-tauri/icons/icon.icns          (macOS — requires png2icns via iconutil on macOS, or icns-lib fallback)
//   src-tauri/icons/icon.ico           (Windows multi-resolution ICO)
//   client/public/icon-192.png         (PWA manifest)
//   client/public/icon-512.png         (PWA manifest)
//   client/public/apple-touch-icon.png (iOS Safari home-screen)
//
// Dependencies: `sharp` (the workhorse) + `png-to-ico` for the Windows ICO build. The script
// dynamic-imports both — install with `pnpm add -D sharp png-to-ico` at project root before
// first run.
//
// Capacitor iOS/Android icon sets are managed by `npx capacitor assets` (Capacitor's own
// tooling) — this script doesn't duplicate that pipeline; just runs the desktop + web side.

const fs = require('node:fs')
const path = require('node:path')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const TAURI_ICONS_DIR = path.join(PROJECT_ROOT, 'src-tauri', 'icons')
const CLIENT_PUBLIC_DIR = path.join(PROJECT_ROOT, 'client', 'public')

const TARGETS = [
  { out: 'src-tauri/icons/32x32.png', size: 32, format: 'png' },
  { out: 'src-tauri/icons/128x128.png', size: 128, format: 'png' },
  { out: 'src-tauri/icons/128x128@2x.png', size: 256, format: 'png' },
  { out: 'client/public/icon-192.png', size: 192, format: 'png' },
  { out: 'client/public/icon-512.png', size: 512, format: 'png' },
  { out: 'client/public/apple-touch-icon.png', size: 180, format: 'png' },
]

async function main() {
  const sourcePath = process.argv[2]
  if (!sourcePath) {
    console.error('Usage: node tools/generate-icons.cjs <source-icon.png>')
    process.exit(1)
  }
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source icon not found: ${sourcePath}`)
    process.exit(1)
  }

  let sharp
  try {
    sharp = require('sharp')
  } catch {
    console.error('sharp not installed. Run: pnpm add -D sharp png-to-ico')
    process.exit(1)
  }
  let pngToIco
  try {
    pngToIco = require('png-to-ico')
  } catch {
    console.warn('png-to-ico not installed — skipping icon.ico generation. Run: pnpm add -D png-to-ico')
  }

  if (!fs.existsSync(TAURI_ICONS_DIR)) fs.mkdirSync(TAURI_ICONS_DIR, { recursive: true })
  if (!fs.existsSync(CLIENT_PUBLIC_DIR)) fs.mkdirSync(CLIENT_PUBLIC_DIR, { recursive: true })

  // PNG outputs
  for (const target of TARGETS) {
    const outPath = path.join(PROJECT_ROOT, target.out)
    await sharp(sourcePath).resize(target.size, target.size).png().toFile(outPath)
    console.info(`✓ ${target.out} (${target.size}×${target.size})`)
  }

  // Windows ICO — combines 16, 32, 48, 64, 128, 256
  if (pngToIco) {
    const icoSizes = [16, 32, 48, 64, 128, 256]
    const tempPaths = []
    for (const size of icoSizes) {
      const tmp = path.join(TAURI_ICONS_DIR, `.tmp-ico-${size}.png`)
      await sharp(sourcePath).resize(size, size).png().toFile(tmp)
      tempPaths.push(tmp)
    }
    const icoBuffer = await pngToIco(tempPaths)
    fs.writeFileSync(path.join(TAURI_ICONS_DIR, 'icon.ico'), icoBuffer)
    for (const tmp of tempPaths) fs.unlinkSync(tmp)
    console.info('✓ src-tauri/icons/icon.ico (multi-resolution: 16/32/48/64/128/256)')
  }

  // macOS ICNS — Tauri's tauri-icon binary handles this natively; this script falls back to
  // a 1024-px PNG that operators can run through `iconutil -c icns icon.iconset/` on macOS.
  const icnsSourcePath = path.join(TAURI_ICONS_DIR, '.icns-source-1024.png')
  await sharp(sourcePath).resize(1024, 1024).png().toFile(icnsSourcePath)
  console.info(
    '✓ src-tauri/icons/.icns-source-1024.png (run `iconutil -c icns icon.iconset/` on macOS to finalize icon.icns)',
  )

  console.info('\nAll icons generated. For mobile (iOS/Android) icon sets, run:')
  console.info('  npx @capacitor/assets generate --iconBackgroundColor "#0a0a14"')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
