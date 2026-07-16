# Pulse90

Pulse90 is a calm second-screen World Cup companion built for the TxODDS World Cup Hackathon, **Consumer & Fan Experiences** track.

- **Live demo:** https://terratectra.github.io/progress-knight-entropy/txline-pulse/
- **Submission brief:** [SUBMISSION.md](SUBMISSION.md)
- **Machine-readable metadata:** [submission.json](submission.json)

## Problem

Live sports products usually force fans to choose between a noisy wall of numbers and a basic scorecard. Pulse90 translates live match data into an understandable emotional signal without turning the experience into a betting terminal.

## Experience

- **Match pulse:** recent pressure visualised as a continuous home/away signal.
- **Key moments:** a compact event timeline that explains why momentum changed.
- **Consensus context:** aggregated outcome probabilities presented as context, not advice.
- **Spoiler-safe mode:** hides scores, outcomes and event labels while preserving match rhythm.
- **Accessible by default:** responsive layout, reduced-motion support and readable contrast.
- **Share-ready:** Open Graph, Twitter Card and structured application metadata with a dedicated 1200×630 preview.

## Data architecture

```text
TxLINE World Cup API / SSE
          │
          ▼
server-side normaliser
  - fixtures and scores
  - live incidents
  - consensus odds
  - timestamp / proof metadata
          │
          ▼
Pulse90 snapshot schema
          │
          ▼
static fan interface
```

The checked-in `data/live.json` is a deterministic demonstration snapshot. The production adapter is designed to replace that file with a sanitised server-side TxLINE snapshot so wallet secrets, JWTs and API tokens never reach the browser.

## TxLINE activation plan

1. Create a dedicated Solana devnet keypair in a protected CI environment.
2. Request devnet SOL for fees and account rent.
3. Subscribe to the TxLINE free tier using the official `txodds/tx-on-chain` example.
4. Complete guest-token activation by signing the TxLINE challenge.
5. Poll fixtures/scores and consume supported SSE channels.
6. Publish only the minimum public match snapshot consumed by this frontend.

## Validation

Pulse90 ships with a dependency-free validator that checks:

- required HTML, JavaScript, CSS and social-preview references;
- reduced-motion support;
- TxLINE source provenance and timestamp shape;
- team, score and match-state fields;
- equal pulse-series lengths and valid sample ranges;
- pressure and consensus percentages summing to 100;
- event schema and required narrative fields.

Run locally:

```bash
npm run validate
```

The same command runs in GitHub Actions for every Pulse90 pull request and every change merged to `main`.

## Local run

Serve this directory with any static server. For example:

```bash
npx serve .
```

Open the generated local URL. Fetching `data/live.json` directly from `file://` is intentionally not supported by browsers.

## Safety

Pulse90 does not place bets, hold funds, execute trades or provide betting recommendations. Consensus data is displayed only as descriptive match context.
