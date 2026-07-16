# Pulse90

Pulse90 is a calm second-screen World Cup companion built for the TxODDS World Cup Hackathon, **Consumer & Fan Experiences** track.

## Problem

Live sports products usually force fans to choose between a noisy wall of numbers and a basic scorecard. Pulse90 translates live match data into an understandable emotional signal without turning the experience into a betting terminal.

## Experience

- **Match pulse:** recent pressure visualised as a continuous home/away signal.
- **Key moments:** a compact event timeline that explains why momentum changed.
- **Consensus context:** aggregated outcome probabilities presented as context, not advice.
- **Spoiler-safe mode:** hides scores, outcomes and event labels while preserving match rhythm.
- **Accessible by default:** responsive layout, reduced-motion support and readable contrast.

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

## Local run

Serve this directory with any static server. For example:

```bash
npx serve .
```

Open the generated local URL. Fetching `data/live.json` directly from `file://` is intentionally not supported by browsers.

## Safety

Pulse90 does not place bets, hold funds, execute trades or provide betting recommendations. Consensus data is displayed only as descriptive match context.
