# Per-Theme Asset Layout

Each government theme defined in `shared/src/sim/themes.ts` declares an `assetCues`
manifest pointing at a per-theme directory under this folder. PHASE 4 ships the
manifest and slug conventions; PHASE 12 (Audio) drops actual `.ogg` files into the
slugged subdirectories.

## Slug Convention

`assets/themes/<slug>/<asset>.ogg` where `<slug>` matches the slug used in
`themes.ts` (one per theme):

| Theme | Slug |
|-------|------|
| Theocracy | `theocracy` |
| Corporate Dictatorship | `corporate` |
| Military Junta | `military-junta` |
| Surveillance State | `surveillance` |
| Climate-Refugee State | `climate-refugee` |
| Eugenics Utopia | `eugenics` |
| AI-Overlord | `ai-overlord` |
| Anarcho-Capitalist | `anarcho-capitalist` |
| Hereditary Monarchy | `monarchy` |
| Ecological Cult | `ecological-cult` |
| Psychic Hivemind | `psychic-hivemind` |
| Game-Show Reality | `game-show` |
| Cyberpunk Megacorp | `cyberpunk` |
| Gerontocracy | `gerontocracy` |
| Memetic Cult | `memetic-cult` |
| Warlord Confederacy | `warlord` |
| Pharaonic Dynasty | `pharaonic` |
| Bureaucratic Hellscape | `bureaucratic` |
| Influencer Republic | `influencer` |
| Soviet-Era Collective | `soviet` |

## Per-Theme Files (8 each)

Inside `assets/themes/<slug>/`:

```
ambient.ogg          Ambient loop for normal play
tense.ogg            Tense / combat / late-game loop
victory.ogg          Match-end win cue
defeat.ogg           Match-end loss cue
sfx-click.ogg        UI button click
sfx-build.ogg        Building completed
sfx-launch.ogg       Colony ship launch
sfx-citizen.ogg      Citizen acknowledgement / volunteer event
```

## Asset Status

Currently EMPTY scaffold per PHASE 4 deliverable. Audio drop is PHASE 12.
The `assetCues` paths in `themes.ts` reference these slugs — when audio lands
in PHASE 12, the runtime audio loader resolves cue strings against this folder.

## Per-Theme CSS

CSS variable palette + font stack are defined inline on the `Theme.palette` and
`Theme.fonts` fields and applied via `themeAsCSSVars(theme)` from `themes.ts`.
No per-theme `.css` files needed in this folder — CSS variables are runtime-applied
to `document.documentElement` (or a per-civ scoped element) by the client theme
provider in PHASE 7+ rendering.
