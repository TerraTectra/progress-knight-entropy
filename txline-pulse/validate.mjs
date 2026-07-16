#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const read = (path) => readFile(join(root, path), "utf8");

const [html, app, css, rawFeed, socialCard] = await Promise.all([
  read("index.html"),
  read("app.js"),
  read("styles.css"),
  read("data/live.json"),
  read("social-card.svg"),
]);

const feed = JSON.parse(rawFeed);
const failures = [];

function check(condition, message) {
  try {
    assert.ok(condition, message);
  } catch (error) {
    failures.push(error.message);
  }
}

check(html.includes('<meta property="og:image"'), "index.html must declare an Open Graph image");
check(html.includes('<meta name="twitter:card" content="summary_large_image"'), "index.html must declare a large Twitter card");
check(html.includes('./social-card.svg'), "index.html must reference social-card.svg");
check(html.includes('./styles.css'), "index.html must reference styles.css");
check(html.includes('./app.js'), "index.html must reference app.js");
check(app.includes('./data/live.json'), "app.js must load the public match snapshot");
check(css.includes('@media (prefers-reduced-motion: reduce)'), "styles.css must support reduced motion");
check(socialCard.includes('width="1200"') && socialCard.includes('height="630"'), "social-card.svg must be 1200x630");

check(feed?.source?.provider === "TxLINE", "feed source provider must be TxLINE");
check(["demo", "live"].includes(feed?.source?.mode), "feed source mode must be demo or live");
check(typeof feed?.source?.verified === "boolean", "feed source verified must be boolean");
check(Number.isFinite(Date.parse(feed?.source?.updatedAt)), "feed source updatedAt must be an ISO timestamp");

check(typeof feed?.match?.id === "string" && feed.match.id.length > 0, "match id is required");
check(["live", "scheduled", "finished"].includes(feed?.match?.state), "match state is invalid");
check(Number.isInteger(feed?.match?.minute) && feed.match.minute >= 0, "match minute must be a non-negative integer");
check(Number.isInteger(feed?.match?.second) && feed.match.second >= 0 && feed.match.second < 60, "match second must be between 0 and 59");

for (const side of ["home", "away"]) {
  const team = feed?.match?.[side];
  check(typeof team?.name === "string" && team.name.length > 0, `${side} team name is required`);
  check(/^[A-Z]{3}$/.test(team?.code ?? ""), `${side} team code must contain three uppercase letters`);
  check(Number.isInteger(team?.score) && team.score >= 0, `${side} score must be a non-negative integer`);
}

const pulseHome = feed?.pulse?.home;
const pulseAway = feed?.pulse?.away;
check(Array.isArray(pulseHome) && pulseHome.length >= 4, "home pulse must contain at least four samples");
check(Array.isArray(pulseAway) && pulseAway.length === pulseHome?.length, "home and away pulse arrays must have equal length");
check([...pulseHome ?? [], ...pulseAway ?? []].every((value) => Number.isFinite(value) && value >= 0 && value <= 100), "pulse samples must be between 0 and 100");
check(feed?.pulse?.homePressure + feed?.pulse?.awayPressure === 100, "pressure percentages must sum to 100");
check(feed?.consensus?.home + feed?.consensus?.draw + feed?.consensus?.away === 100, "consensus percentages must sum to 100");
check(Number.isInteger(feed?.pulse?.confidence) && feed.pulse.confidence >= 0 && feed.pulse.confidence <= 100, "confidence must be between 0 and 100");

check(Array.isArray(feed?.events) && feed.events.length > 0, "at least one match event is required");
for (const [index, event] of (feed.events ?? []).entries()) {
  check(Number.isInteger(event?.minute) && event.minute >= 0, `event ${index + 1} minute is invalid`);
  check(["home", "away", "neutral"].includes(event?.side), `event ${index + 1} side is invalid`);
  check(typeof event?.title === "string" && event.title.length > 0, `event ${index + 1} title is required`);
  check(typeof event?.detail === "string" && event.detail.length > 0, `event ${index + 1} detail is required`);
}

if (failures.length) {
  console.error("Pulse90 validation failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Pulse90 validation passed.");
  console.log(`- ${feed.events.length} events`);
  console.log(`- ${pulseHome.length} pulse samples per team`);
  console.log(`- source mode: ${feed.source.mode}`);
  console.log(`- verified flag: ${feed.source.verified}`);
}
