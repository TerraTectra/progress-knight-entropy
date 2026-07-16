# Pulse90 — Hackathon Submission

## One-line pitch

**Pulse90 turns institutional World Cup data into a calm, spoiler-safe live companion that lets every fan feel how the match is changing without reading an odds terminal.**

## Track

Consumer & Fan Experiences

## Problem

Live match products sit at two extremes:

1. a minimal scorecard that explains almost nothing; or
2. a dense wall of statistics and odds designed for expert users.

Fans watching on a second screen need a faster answer: **Who is controlling the match, what just changed, and how certain is that read?** They also need an option to follow the emotional rhythm without immediately revealing the score.

## Solution

Pulse90 converts TxLINE fixtures, scores, incidents and consensus market data into three human-readable layers:

- **Match Pulse** — a continuous home/away momentum signal;
- **Key Moments** — the events responsible for major swings;
- **Consensus Context** — outcome probabilities presented as descriptive context, never as betting advice.

A single spoiler-safe control hides scores, outcomes and event labels while keeping the pulse visible.

## Why TxLINE

Pulse90 needs more than a scoreboard. TxLINE provides the combination required to explain the match rather than merely display it:

- World Cup fixtures and scores;
- live or frequently refreshed match data;
- consensus odds that can be normalised into contextual probability signals;
- Solana-backed subscription and verification infrastructure.

## What is working

- responsive desktop and mobile interface;
- animated SVG momentum chart;
- score and match-state rendering from a validated JSON feed;
- consensus probability display;
- reverse-chronological event timeline;
- spoiler-safe mode;
- reduced-motion support;
- deterministic demonstration snapshot;
- dynamic provenance badge that only displays `SOLANA VERIFIED` for a live feed with `verified: true`;
- dependency-free schema and asset validation in GitHub Actions;
- Open Graph, Twitter Card and structured application metadata;
- dedicated 1200×630 social preview;
- protected GitHub Actions integration for TxLINE devnet activation and sanitised data snapshots;
- dedicated Solana devnet wallet stored only in a private Actions artifact.

## Technical architecture

```text
TxLINE World Cup endpoints / SSE
              │
              ▼
Protected server-side adapter
  • Solana devnet subscription
  • guest JWT and API token
  • fixture / score normalisation
  • consensus conversion
  • provenance status
  • secret removal
              │
              ▼
Pulse90 public snapshot schema
              │
              ▼
Static accessible fan interface
```

The browser never receives a wallet private key, JWT or TxLINE API token. The public snapshot carries explicit `mode` and `verified` fields so the interface cannot confuse a deterministic demo with a live proof-backed feed.

## Technology

- semantic HTML5;
- modern CSS with responsive layouts and reduced-motion handling;
- vanilla JavaScript;
- SVG data visualisation;
- GitHub Pages;
- GitHub Actions;
- dependency-free Node validation;
- TypeScript server-side adapter;
- official `txodds/tx-on-chain` examples;
- Solana devnet and Anchor.

## Repository

https://github.com/TerraTectra/progress-knight-entropy/tree/main/txline-pulse

## Live demo

https://terratectra.github.io/progress-knight-entropy/txline-pulse/

## Current data mode

The public demo currently uses a deterministic World Cup snapshot with `mode: demo` and `verified: false`. It demonstrates the complete fan experience and the exact sanitised schema expected from the protected adapter, but it does **not** claim a live TxLINE subscription or an on-chain proof.

The protected adapter, dedicated wallet, restore/persistence workflow and TxLINE activation path are implemented. Live activation is pending sufficient Solana devnet fee funding for the subscription transaction. When a real snapshot is available, the same frontend switches to `TXLINE LIVE` and displays `SOLANA VERIFIED` only when the adapter explicitly supplies `verified: true`; no frontend code change is required.

## Quality evidence

GitHub Actions validates every Pulse90 change. The current quality gate checks:

- static asset and social-preview references;
- reduced-motion support;
- TxLINE source provenance and timestamp shape;
- honest demo verification state;
- team, score and match-state fields;
- pulse arrays and value ranges;
- pressure and consensus totals;
- required event narratives.

## Safety and positioning

Pulse90:

- does not place bets;
- does not hold funds;
- does not execute trades;
- does not recommend wagering decisions;
- labels consensus information as contextual data;
- never presents deterministic demo data as verified live data.

## Differentiation

Most sports dashboards optimise for the amount of information shown. Pulse90 optimises for **time-to-understanding**. A fan can glance at one screen and understand the current emotional shape of the match, while the underlying data remains inspectable through the event timeline and transparent provenance status.

## Roadmap after the hackathon

1. TxLINE SSE ingestion and automatic snapshot refresh.
2. Match selection and tournament overview.
3. Personal notification thresholds such as “wake me when the match opens up.”
4. Shareable spoiler-safe pulse cards.
5. Accessibility presets for colour vision and low-stimulation viewing.
6. Historical pulse replay for completed matches.

## Builder

- GitHub: `TerraTectra`
- Telegram: `@tahioff`
- Communication: written messages only
