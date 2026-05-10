'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ASSETS_ROOT = path.join(PROJECT_ROOT, 'assets')
const OUT_PATH = path.join(PROJECT_ROOT, 'client', 'public', 'assets-manifest.json')

function sha256(filePath) {
  const buf = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16)
}

function listFilesRecursive(rootDir, relPrefix = '') {
  if (!fs.existsSync(rootDir)) return []
  const out = []
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const abs = path.join(rootDir, entry.name)
    const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(abs, rel))
    } else if (entry.isFile()) {
      const stat = fs.statSync(abs)
      out.push({
        relPath: rel,
        absPath: abs,
        sizeBytes: stat.size,
        checksum: sha256(abs),
      })
    }
  }
  return out
}

function groupByTheme(files) {
  const themes = new Map()
  for (const file of files) {
    const segments = file.relPath.split('/')
    if (segments.length < 2 || segments[0] !== 'themes') continue
    const themeSlug = segments[1]
    if (!themes.has(themeSlug)) {
      themes.set(themeSlug, { slug: themeSlug, files: [], totalBytes: 0 })
    }
    const bucket = themes.get(themeSlug)
    bucket.files.push({
      relPath: file.relPath,
      sizeBytes: file.sizeBytes,
      checksum: file.checksum,
    })
    bucket.totalBytes += file.sizeBytes
  }
  return Array.from(themes.values()).sort((a, b) => a.slug.localeCompare(b.slug))
}

function buildManifest() {
  const allFiles = listFilesRecursive(ASSETS_ROOT)
  const themePacks = groupByTheme(allFiles)
  const totalBytes = allFiles.reduce((acc, f) => acc + f.sizeBytes, 0)
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    rootDir: 'assets',
    fileCount: allFiles.length,
    totalBytes,
    themePacks,
    files: allFiles.map((f) => ({
      relPath: f.relPath,
      sizeBytes: f.sizeBytes,
      checksum: f.checksum,
    })),
  }
}

function main() {
  const manifest = buildManifest()
  const outDir = path.dirname(OUT_PATH)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  const summary = `[asset-manifest] wrote ${manifest.fileCount} files / ${(manifest.totalBytes / 1024).toFixed(1)} KiB across ${manifest.themePacks.length} theme packs → ${path.relative(PROJECT_ROOT, OUT_PATH)}`
  console.info(summary)
}

if (require.main === module) {
  try {
    main()
  } catch (err) {
    console.error('[asset-manifest] FAILED:', err)
    process.exit(1)
  }
}

module.exports = { buildManifest, listFilesRecursive, groupByTheme }
