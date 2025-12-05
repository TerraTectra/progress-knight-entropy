# Eternal Ascendant (Incremental Prototype)

Browser-based incremental/idle prototype focused on Entropy, Seeds, Evil, Patterns, and late-game synergies with a dark-first UI and guide overlays.

## Key Features
- Entropy and Seeds meta progression with lattice patterns.
- Patterns and short/long life mechanics that reward strategic rebirths.
- Evil and Dark Magic as parallel progression with synergies.
- Achievements and Challenges, including a capstone run and overlays.
- Dark-first, responsive UI with guide, plateau hint, shop and Dark Magic hints, plus low-FX mode.

## Running Locally
1. Clone the repository.
2. Open `index.html` in a modern browser (Chrome/Firefox/Edge).
   - Or serve via a simple static server (e.g. `npx serve .`).
3. Progress is saved in local storage; use the in-game export/import for backups.

## Development
- No build step is required; scripts are loaded directly in the browser.
- Core loop and systems live in `js/main.js`; balance knobs are in `BalanceConfig` there.
- Version constants are centralized in `js/version.js`.

## Safeguards & Compatibility
- Saves are versioned and merged safely; missing/null fields fall back to defaults.
- Supported browsers: latest Chrome/Firefox/Edge on desktop.

## Known Limitations
- Mobile layout is not guaranteed.
- No offline play beyond browser caching.
- Balance is tuned for single-player, non-competitive play.
