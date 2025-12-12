# Changelog

## Stage 3 - 2025-12-11
- Unified requirement helper usage across unlock/visibility checks for tasks, jobs, shop items, automation, and entropy tab handling.
- Standardized requirement messaging through shared display helpers with i18n coverage (universe, age, meaning, entropy seeds, evil, coins) and hooked shop locks into the same pipeline.
- Added wrapping support for requirement cells to keep long localized labels readable in required rows and shop states.

## Stage 4 - 2025-12-11
- Smoothed early jobs/skills/housing: higher early incomes, slightly lower max XP and promotion thresholds, gentler property expenses/effects, and a cheaper shop unlock to reach the first upgrades faster.
- Tuned arcane/military/dark ladders and automation: eased early concentration/mana/strength gates, nudged automation unlock later, and lowered dark magic entry costs to reduce idle grinds without skipping systems.
- Entropy pacing tweaks: earlier Almanac discovery, a touch more EP from early insight, and slightly cheaper starter artifacts to make first seeds/upgrades attainable in a few solid runs.

## Stage 5 - 2025-12-11
- Added `EA_SIM` browser simulation harness (dev-only) to run isolated scenarios from the console without touching player saves.
- Included canned baselines for early economy, dark entry, entropy entry, and automation timing, plus helpers to build custom scenarios and tick/summary runners.
- Documented usage in `docs/DEV_SIM.md` and wired the harness after core scripts for safe opt-in debugging.
- Fixed Russian localization encoding: replaced mojibake strings with proper UTF-8 Russian text across the UI.
- Fixed regression where all tasks trained simultaneously; restored intended active progression (with Overseer-specific passive training) and normal early-game pacing.
- Stabilized auto-shop: auto-buy now picks a single affordable candidate per tick without thrashing between cheapest items or spamming purchases, reducing lag.
- Refined auto-shop with a sticky target so recommendations no longer bounce between the first row and cheapest item; target persists until bought or invalid.

## 1.0.1 - Entropy UX polish
- Entropy tab now follows a single unlock gate and remains visible after binding the Almanac.
- Entropy unlock visibility and shop items stay rendered after discovery; affordability only disables actions.
- Added helper-based requirement checks and improved long-label wrapping/readability on dark panels.

## 1.0.0 - Initial stable build
- Core systems: Entropy, Seeds, Patterns, Evil & Dark Magic, synergies.
- Meta: Achievements, Challenges, capstone overlay.
- UX: Dark-first theme, guide overlay, plateau hint, shop and Dark Magic hints, low-FX option.
- Stability: Hardened save/import (versioned, safe merge, import fallback), DOM diffing, tick micro-profiler.
- Options: Language selection, hints toggle, low-FX mode.
