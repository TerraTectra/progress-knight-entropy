# Progress Knight: Reality Break

Browser-based idle/incremental game built on the Progress Knight formula, extended with Evil progression, a 10-universe Multiverse, Observer simulacra, and a Russian-localized UI.

Live: https://terratectra.github.io/progress-knight-entropy/

## Features
- Jobs (Common work / Military / The Arcane Association) and Skills across 5 categories, including Dark Magic and Universe Anomalies.
- Shop with 9 properties and 28 items gated by progression.
- Evil Perks tree — unlock the Multiverse via the `realityBreak` perk.
- 10 universes with per-universe rule modifiers and meta-upgrades paid in Metaverse Points.
- Observer endgame: simulacra that play the game for you, with talents and personalities.
- Achievements grouped by stage with progress tracking.
- Russian/English UI strings (Settings → language).

## Running Locally
The game lives in `pk-reality-break/` (React + Vite). To run a dev server:

```sh
cd pk-reality-break
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Building for Pages
```sh
cd pk-reality-break
npm run build
```
The build output is committed to the repository root (`index.html` + `assets/`) and served from GitHub Pages on the `main` branch.

## Project Layout
- `pk-reality-break/src/App.jsx` — main component, render and game loop.
- `pk-reality-break/src/data.js` — jobs, skills, properties, items, evil perks.
- `pk-reality-break/src/constants.js` — tunable balance knobs (lifespans, costs, money tiers).
- `pk-reality-break/src/progression.js` — XP / level / requirement helpers.
- `pk-reality-break/src/multiverse.js`, `observer.js`, `achievements.js` — late-game systems.
- `pk-reality-break/src/i18n.js` — translations.
- `pk-reality-break/src/save.js` — versioned save/load (localStorage key in `constants.js`).

## Saves
- Stored in `localStorage` under the key defined in `constants.js` (`SAVE_KEY`).
- Saves are versioned and merged with defaults on load; missing fields fall back safely.

## Browser Support
Latest Chrome / Firefox / Edge on desktop. Mobile layout works at >=320px width but is not extensively tested.
