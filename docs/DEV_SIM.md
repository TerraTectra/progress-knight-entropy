# EA_SIM simulation harness

Dev-only console helpers for quick pacing probes. Loaded via `js/sim_harness.js`; no UI is added and normal play is unaffected.

## Usage
1. Open the game in the browser and open DevTools (Console).
2. Call helpers directly on the `EA_SIM` global. Examples:
   - `EA_SIM.runEarlyEconomyBaseline()` — rough early-job/housing flow.
   - `EA_SIM.runDarkEntryBaseline()` — first evil/dark entry timing.
   - `EA_SIM.runEntropyEntryBaseline()` — first seed/entropy unlock pacing.
   - `EA_SIM.runAutomationBaseline()` — automation unlock timing.
3. Each helper logs a compact summary object with ticks, age, coins, evil, entropy, and rebirth counts.

## Custom scenarios
- `const sim = EA_SIM.createScenario({ universeIndex: 1, autoRebirth: true })`
- `EA_SIM.runTicks(sim, 5000)` or `EA_SIM.runUntil(sim, s => s.data.coins > 1000, 20000)`
- `EA_SIM.summarize(sim)` to inspect results.

Notes:
- Sim runs are isolated from real saves and pause the live update loop while they execute.
- Balance values are unchanged; the harness only exposes simulation tooling.
