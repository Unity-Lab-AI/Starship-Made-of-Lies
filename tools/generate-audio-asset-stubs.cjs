#!/usr/bin/env node
// Generates drop-in folders + SPEC.md placeholders for every audio asset SMoL expects.
// Sourced from client/src/audio/themeAudioManifest.ts (20 themes × 4 kinds = 80 tracks) and
// client/src/audio/sfxManifest.ts (20 SFX events). The folder layout is the one the user
// drops files into — one folder per audio asset, SPEC.md inside the folder tells the user
// the exact filename + format that goes alongside it.
//
// Run with: node tools/generate-audio-asset-stubs.cjs
// Idempotent — re-running overwrites SPEC.md files but never the user's audio drops.

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'client', 'public')

// ─── THEME AUDIO ────────────────────────────────────────────────────────────
// MUST mirror client/src/audio/themeAudioManifest.ts slug list. Updating this list also
// requires updating THEME_AUDIO_PACKS in the manifest file.
const THEME_SLUGS = [
  ['theocracy', 'Theocracy'],
  ['corporate-dictatorship', 'Corporate Dictatorship'],
  ['military-junta', 'Military Junta'],
  ['surveillance-state', 'Surveillance State'],
  ['climate-refugee-state', 'Climate Refugee State'],
  ['eugenics-utopia', 'Eugenics Utopia'],
  ['ai-overlord', 'AI Overlord'],
  ['anarcho-capitalist', 'Anarcho-Capitalist'],
  ['hereditary-monarchy', 'Hereditary Monarchy'],
  ['ecological-cult', 'Ecological Cult'],
  ['psychic-hivemind', 'Psychic Hivemind'],
  ['game-show-reality', 'Game Show Reality'],
  ['cyberpunk-megacorp', 'Cyberpunk Megacorp'],
  ['gerontocracy', 'Gerontocracy'],
  ['memetic-cult', 'Memetic Cult'],
  ['warlord-confederacy', 'Warlord Confederacy'],
  ['pharaonic-dynasty', 'Pharaonic Dynasty'],
  ['bureaucratic-hellscape', 'Bureaucratic Hellscape'],
  ['influencer-republic', 'Influencer Republic'],
  ['soviet-collective', 'Soviet Collective'],
]

const THEME_KINDS = [
  {
    kind: 'ambient',
    moodDescription:
      'Calm, atmospheric, looping background track played during normal gameplay (build phase, no immediate threats). Sets the cultural / aesthetic tone of the government. 1.5–3 minutes, loopable (start and end blend seamlessly).',
    durationGuidance: '90–180 seconds, loop-friendly',
    referenceGain: 'Master gain ≈ -18 LUFS integrated. Headroom for music bus mixing.',
  },
  {
    kind: 'tense',
    moodDescription:
      'Same instrumentation as ambient but escalated — minor key shift, faster pulse, more percussion. Played when incoming threats are detected (LAST HOPE, incoming colony ships, fleet at low LS, etc.). 60–120 seconds, loopable.',
    durationGuidance: '60–120 seconds, loop-friendly',
    referenceGain: 'Master gain ≈ -16 LUFS integrated. Slightly louder than ambient.',
  },
  {
    kind: 'victory',
    moodDescription:
      'Triumphant one-shot played at match-victory. Theme-flavored: Theocracy gets a choir swell, Corporate gets brass-and-synth fanfare, Surveillance gets a glitchy crescendo, etc. 8–20 seconds, NOT loopable (ends decisively).',
    durationGuidance: '8–20 seconds, one-shot ending',
    referenceGain: 'Master gain ≈ -14 LUFS integrated. Headline moment, can be loud.',
  },
  {
    kind: 'defeat',
    moodDescription:
      'Somber / unsettling one-shot played at match-defeat. Theme-flavored downer beat — Theocracy gets church-bell collapse, Corporate gets a market-crash sting, AI Overlord gets dial-up-disconnect glitch, etc. 8–20 seconds, NOT loopable.',
    durationGuidance: '8–20 seconds, one-shot ending',
    referenceGain: 'Master gain ≈ -16 LUFS integrated. Headline moment but slightly subdued.',
  },
]

// ─── SFX EVENTS ─────────────────────────────────────────────────────────────
// MUST mirror SFX_EVENT_DEFS in client/src/audio/sfxManifest.ts. Each entry: [id, bus, hint]
const SFX_EVENTS = [
  ['click', 'sfx', 'UI click — short, crisp, square-wave-like. ~60ms, low gain (~0.18).'],
  ['click-back', 'sfx', 'UI back / close / cancel click — lower-pitched than click. ~70ms.'],
  [
    'build-start',
    'sfx',
    'Building construction begins — rising tone, mechanical / industrial. ~220ms triangle sweep 220→440 Hz.',
  ],
  [
    'build-complete',
    'sfx',
    'Building completed — pleasant resolving chime, rising sine 660→990 Hz. ~350ms.',
  ],
  [
    'launch-colony-ship',
    'sfx',
    'Colony ship launch — dramatic rising sawtooth roar 110→880 Hz. ~800ms. Loud (0.40 peak).',
  ],
  [
    'colony-ship-impact',
    'sfx',
    'Colony-ship terminal impact — heavy descending sawtooth boom 220→55 Hz. ~600ms. Loud (0.50 peak).',
  ],
  [
    'colony-ship-intercepted',
    'sfx',
    'Colony ship intercepted by counter-fire — square-wave descending shriek 880→220 Hz. ~400ms.',
  ],
  [
    'colony-established',
    'sfx',
    'Successful colony established — uplifting long sine swell 440→880 Hz. ~1.2s. Triumphant.',
  ],
  [
    'research-progress-tick',
    'sfx',
    'Research progress tick — high quiet chirp 1320 Hz sine. ~30ms. Very low gain (~0.08). Fires often.',
  ],
  [
    'research-complete',
    'sfx',
    'Tech research unlocked — bright triangle sweep 523→1046 Hz (octave jump). ~700ms.',
  ],
  [
    'tech-apex-unlocked',
    'music',
    'Tech apex (end-game tech) unlocked — long climbing sine 261→1568 Hz. ~2.2s. Heroic.',
  ],
  [
    'campaign-launch',
    'voice',
    'Propaganda campaign begins — sawtooth rising 220→660 Hz, voice bus (treated like cue). ~600ms.',
  ],
  [
    'conscript-citizens',
    'sfx',
    'Citizens conscripted (dark moment) — low square 165 Hz pulse. ~350ms.',
  ],
  [
    'civ-defeated',
    'sfx',
    'Enemy civ defeated — long descending sawtooth 440→55 Hz. ~1.5s. Loud (0.50 peak).',
  ],
  [
    'achievement-unlocked',
    'sfx',
    'Achievement unlocked — bright triangle 880→1760 Hz (octave). ~600ms.',
  ],
  [
    'beacon-alert-incoming',
    'sfx',
    'Beacon alert: incoming colony ship — sharp square pulse 1320 Hz. ~200ms. Repeating.',
  ],
  [
    'beacon-alert-impact',
    'sfx',
    'Beacon alert: impact imminent — low sawtooth 110 Hz throb. ~400ms. Very loud (0.55 peak).',
  ],
  [
    'match-victory',
    'music',
    'Match-end victory — long climbing sine 523→1568 Hz. ~3.5s. Headline triumphant moment.',
  ],
  [
    'match-defeat',
    'music',
    'Match-end defeat — long descending sawtooth 440→110 Hz. ~3.5s. Headline somber moment.',
  ],
  [
    'ui-error',
    'sfx',
    'UI error / invalid action — square buzz 220→110 Hz. ~280ms. Distinct from click.',
  ],
]

// ─── FORMAT GUIDELINES ──────────────────────────────────────────────────────
// All audio assets share these baseline format requirements.
const BASELINE_FORMAT = `## Required format

| Spec | Value |
|------|-------|
| Container | OGG Vorbis (\`.ogg\`) |
| Sample rate | 48 kHz (48000 Hz) |
| Channels | Stereo (2 ch) |
| Bit depth | 16-bit signed PCM source → Vorbis encoded |
| Vorbis quality | q5 (~160 kbps target VBR) — balance quality vs. size |
| Mono fallback | Mono accepted for short SFX (<500ms); music must be stereo |

**Why OGG Vorbis:** Free / royalty-free codec, ~60% smaller than WAV, native browser support without Web Audio decode latency. Avoid MP3 (license + decode quirks) and WAV (10x larger).

**Alternative containers** (only if OGG unavailable): \`.webm\` (Opus codec) or \`.wav\` (uncompressed PCM, larger but lossless). Update the corresponding manifest entry in \`client/src/audio/\` if you ship a non-\`.ogg\` file.

## Encoding hint

\`\`\`bash
# Convert source.wav → OGG q5 stereo 48kHz
ffmpeg -i source.wav -c:a libvorbis -qscale:a 5 -ar 48000 -ac 2 output.ogg
\`\`\`

## After dropping the file

1. Verify it loads: open the browser dev console with the game running, look for \`[smol/audio] loaded:\` logs.
2. Update \`hasRealAudio: true\` in the manifest entry under \`client/src/audio/themeAudioManifest.ts\` (theme tracks) or set \`assetPath: '/assets/...'\` on the SFX def in \`sfxManifest.ts\` (SFX events).
3. Run \`pnpm typecheck\` to confirm nothing breaks.`

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function writeSpec(folder, filename, body) {
  ensureDir(folder)
  const specPath = path.join(folder, 'SPEC.md')
  fs.writeFileSync(specPath, body, 'utf-8')
  console.log(`  ✓ ${path.relative(ROOT, specPath)}`)
  // Also drop a .gitkeep so the empty folder commits — once the user drops the real .ogg the
  // .gitkeep is harmless.
  const gitkeep = path.join(folder, '.gitkeep')
  if (!fs.existsSync(gitkeep)) fs.writeFileSync(gitkeep, '', 'utf-8')
}

function buildThemeTrackSpec(slug, label, kind) {
  const k = THEME_KINDS.find((t) => t.kind === kind)
  const filename = `${kind}.ogg`
  return `# 🎵 ${label} — ${kind} track

This folder is the drop-in location for the **${kind}** music track for the **${label}** government theme.

## Drop in this folder

| Filename | \`${filename}\` |
|----------|------------|

Drop a single audio file here named exactly **\`${filename}\`**. Once dropped:
- The game's \`themeAudioManifest.ts\` slug \`${slug}\` will resolve to this asset.
- Update \`hasRealAudio: false\` → \`hasRealAudio: true\` in the manifest entry for this theme+kind combo to enable real-audio playback (otherwise the synth fallback continues to play).

## Mood / intent

${k.moodDescription}

## Duration guidance

${k.durationGuidance}

## Loudness target

${k.referenceGain}

${BASELINE_FORMAT}

---

*Generated by \`tools/generate-audio-asset-stubs.cjs\`. Re-run that script to refresh this SPEC.md.*
`
}

function buildSfxSpec(eventId, bus, hint) {
  const filename = `${eventId}.ogg`
  return `# 🔊 SFX — ${eventId}

This folder is the drop-in location for the SFX one-shot **\`${eventId}\`** (bus: \`${bus}\`).

> The game ships with a procedural Web Audio synth fallback for every SFX event — see the matching entry in \`client/src/audio/sfxManifest.ts\` for the synthesis params. Dropping a real audio file here lets you OVERRIDE that synth with a real recording.

## Drop in this folder

| Filename | \`${filename}\` |
|----------|------------|

Drop a single audio file here named exactly **\`${filename}\`**. Once dropped:
- Update the SFX event def in \`client/src/audio/sfxManifest.ts\` to set \`assetPath: '/assets/sfx/${eventId}/${filename}'\` (or wherever the AudioSystem looks up sfx paths — see \`AudioSystem.ts\`).
- The synth fallback continues to play if the asset fails to load.

## Mood / intent

${hint}

## Duration guidance

SFX one-shots should match the synth fallback's \`durationMs\` ±50ms unless the redesign is intentional.

## Bus

This event routes through the **\`${bus}\`** bus (\`sfx\` / \`voice\` / \`music\`). The AudioMixer applies the bus's user-configured volume + ducking.

${BASELINE_FORMAT}

---

*Generated by \`tools/generate-audio-asset-stubs.cjs\`. Re-run that script to refresh this SPEC.md.*
`
}

function buildIndexReadme(themeCount, sfxCount) {
  const themeList = THEME_SLUGS.map(([slug, label]) => `- ${label} (\`${slug}\`)`).join('\n')
  const sfxList = SFX_EVENTS.map(([id, bus]) => `- \`${id}\` (bus: \`${bus}\`)`).join('\n')
  return `# 🎧 SMoL Audio Asset Drop-In Folders

All ${themeCount + sfxCount} folders below are pre-created drop-in locations for SMoL audio assets. Each folder contains a \`SPEC.md\` telling you the exact filename, format, mood, duration, and loudness target for the audio file that goes in that folder.

**You don't need to update code — just drop a file into the right folder using the filename printed in SPEC.md.** (Optional code-side toggle: flip \`hasRealAudio: false\` → \`hasRealAudio: true\` in the matching manifest entry to enable real-audio playback.)

## Folder layout

\`\`\`
client/public/assets/
  ├── themes/
  │   ├── <theme-slug>/
  │   │   ├── ambient/SPEC.md   ← drop ambient.ogg here
  │   │   ├── tense/SPEC.md     ← drop tense.ogg here
  │   │   ├── victory/SPEC.md   ← drop victory.ogg here
  │   │   └── defeat/SPEC.md    ← drop defeat.ogg here
  │   └── ... (20 themes total = 80 folders)
  └── sfx/
      ├── <event-id>/SPEC.md    ← drop <event-id>.ogg here
      └── ... (20 SFX events = 20 folders)
\`\`\`

**Total**: ${themeCount} theme tracks + ${sfxCount} SFX events = **${themeCount + sfxCount} drop-in folders**.

## Themes (${themeCount / 4} themes × 4 kinds = ${themeCount} tracks)

${themeList}

Each theme expects 4 tracks: \`ambient\`, \`tense\`, \`victory\`, \`defeat\`.

## SFX events (${sfxCount})

${sfxList}

## Regenerating SPEC.md files

The SPEC.md files are generated by \`tools/generate-audio-asset-stubs.cjs\`. Run that script any time you change the audio manifest:

\`\`\`bash
node tools/generate-audio-asset-stubs.cjs
\`\`\`

It's idempotent — your audio file drops are never touched, only the SPEC.md placeholders refresh.

## Source of truth

| Manifest | Path |
|----------|------|
| Theme audio (per-government tracks) | \`client/src/audio/themeAudioManifest.ts\` |
| SFX events (UI + game-event one-shots) | \`client/src/audio/sfxManifest.ts\` |

---

*Generated by \`tools/generate-audio-asset-stubs.cjs\`.*
`
}

function main() {
  const audioRoot = path.join(PUBLIC_DIR, 'assets')
  ensureDir(audioRoot)

  let themeCount = 0
  let sfxCount = 0

  console.log('▶ Generating theme audio asset stubs…')
  for (const [slug, label] of THEME_SLUGS) {
    for (const { kind } of THEME_KINDS) {
      const folder = path.join(audioRoot, 'themes', slug, kind)
      writeSpec(folder, `${kind}.ogg`, buildThemeTrackSpec(slug, label, kind))
      themeCount += 1
    }
  }

  console.log('▶ Generating SFX asset stubs…')
  for (const [id, bus, hint] of SFX_EVENTS) {
    const folder = path.join(audioRoot, 'sfx', id)
    writeSpec(folder, `${id}.ogg`, buildSfxSpec(id, bus, hint))
    sfxCount += 1
  }

  // Top-level index README for the audio asset tree.
  const readmePath = path.join(audioRoot, 'README.md')
  fs.writeFileSync(readmePath, buildIndexReadme(themeCount, sfxCount), 'utf-8')
  console.log(`  ✓ ${path.relative(ROOT, readmePath)}`)

  console.log(
    `\n✓ Generated ${themeCount} theme + ${sfxCount} SFX = ${themeCount + sfxCount} drop-in folders.`,
  )
}

main()
