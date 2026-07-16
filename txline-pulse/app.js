const state = {
  feed: null,
  spoilerSafe: false,
  soundOn: false,
  activeView: "pulse",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const els = {
  dataStatus: $("#dataStatus"),
  miniState: $("#miniState"),
  miniUpdated: $("#miniUpdated"),
  miniHomeFlag: $("#miniHomeFlag"),
  miniAwayFlag: $("#miniAwayFlag"),
  miniHome: $("#miniHome"),
  miniAway: $("#miniAway"),
  miniScore: $("#miniScore"),
  miniWave: $("#miniWave"),
  miniNarrative: $("#miniNarrative"),
  matchTitle: $("#matchTitle"),
  homeCode: $("#homeCode"),
  awayCode: $("#awayCode"),
  homeName: $("#homeName"),
  awayName: $("#awayName"),
  homeForm: $("#homeForm"),
  awayForm: $("#awayForm"),
  homeScore: $("#homeScore"),
  awayScore: $("#awayScore"),
  matchClock: $("#matchClock"),
  stageLabel: $("#stageLabel"),
  homePressure: $("#homePressure"),
  awayPressure: $("#awayPressure"),
  liveInsight: $("#liveInsight"),
  confidenceLabel: $("#confidenceLabel"),
  homeWinProb: $("#homeWinProb"),
  homeWinLabel: $("#homeWinLabel"),
  homeBar: $("#homeBar"),
  drawBar: $("#drawBar"),
  awayBar: $("#awayBar"),
  homeBarValue: $("#homeBarValue"),
  drawBarValue: $("#drawBarValue"),
  awayBarValue: $("#awayBarValue"),
  probabilityRing: $("#probabilityRing"),
  momentsList: $("#momentsList"),
  momentTemplate: $("#momentTemplate"),
  homeLine: $("#homeLine"),
  awayLine: $("#awayLine"),
  homeArea: $("#homeArea"),
  awayArea: $("#awayArea"),
  eventMarkers: $("#eventMarkers"),
  spoilerToggle: $("#spoilerToggle"),
  soundToggle: $("#soundToggle"),
  footerSync: $("#footerSync"),
};

async function loadFeed() {
  setConnection("CONNECTING", false);
  try {
    const response = await fetch(`./data/live.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.feed = await response.json();
    render(state.feed);
    setConnection(state.feed.source.mode === "live" ? "TXLINE LIVE" : "TXLINE DEMO FEED", true);
  } catch (error) {
    console.error("Unable to load Pulse90 feed", error);
    setConnection("FEED OFFLINE", false);
    els.miniNarrative.textContent = "The latest match snapshot could not be loaded.";
  }
}

function setConnection(label, connected) {
  const labelNode = els.dataStatus.querySelector("span:last-child");
  labelNode.textContent = label;
  els.dataStatus.classList.toggle("offline", !connected);
}

function render(feed) {
  const { match, pulse, consensus, events, source } = feed;
  const clock = `${match.minute}:${String(match.second).padStart(2, "0")}`;

  els.miniState.textContent = `${match.state.toUpperCase()} · ${match.minute}'`;
  els.miniUpdated.textContent = relativeTime(source.updatedAt);
  els.miniHomeFlag.textContent = match.home.code;
  els.miniAwayFlag.textContent = match.away.code;
  els.miniHome.textContent = match.home.name;
  els.miniAway.textContent = match.away.name;
  els.miniScore.textContent = `${match.home.score} : ${match.away.score}`;
  els.miniNarrative.textContent = pulse.summary;
  els.matchTitle.textContent = `${match.home.name} vs ${match.away.name}`;
  els.homeCode.textContent = match.home.code;
  els.awayCode.textContent = match.away.code;
  els.homeName.textContent = match.home.name;
  els.awayName.textContent = match.away.name;
  els.homeForm.textContent = match.home.form;
  els.awayForm.textContent = match.away.form;
  els.homeScore.textContent = match.home.score;
  els.awayScore.textContent = match.away.score;
  els.matchClock.textContent = clock;
  els.stageLabel.textContent = match.stage.toUpperCase();
  els.homePressure.textContent = `${pulse.homePressure}%`;
  els.awayPressure.textContent = `${pulse.awayPressure}%`;
  els.liveInsight.textContent = pulse.narrative;
  els.confidenceLabel.textContent = `${pulse.confidence}% confidence`;

  els.homeWinProb.textContent = `${consensus.home}%`;
  els.homeWinLabel.textContent = `${match.home.code} win`;
  els.homeBarValue.textContent = `${consensus.home}%`;
  els.drawBarValue.textContent = `${consensus.draw}%`;
  els.awayBarValue.textContent = `${consensus.away}%`;
  els.probabilityRing.style.setProperty("--probability", consensus.home);
  requestAnimationFrame(() => {
    els.homeBar.style.width = `${consensus.home}%`;
    els.drawBar.style.width = `${consensus.draw}%`;
    els.awayBar.style.width = `${consensus.away}%`;
  });

  els.footerSync.textContent = `${source.provider} · ${source.network} · ${relativeTime(source.updatedAt)}`;
  renderMiniWave(pulse.home, pulse.away);
  renderPulseChart(pulse.home, pulse.away, events, match.minute);
  renderMoments(events);
}

function relativeTime(dateString) {
  const date = new Date(dateString);
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (!Number.isFinite(seconds)) return "UPDATED RECENTLY";
  if (seconds < 60) return "UPDATED NOW";
  if (seconds < 3600) return `UPDATED ${Math.floor(seconds / 60)}M AGO`;
  return `SNAPSHOT ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase()}`;
}

function renderMiniWave(home, away) {
  const combined = home.map((value, index) => Math.max(8, Math.abs(value - (away[index] ?? 0)) + 12));
  els.miniWave.replaceChildren();
  combined.forEach((value, index) => {
    const bar = document.createElement("i");
    bar.style.height = `${Math.min(64, value)}px`;
    bar.style.animationDelay = `${index * 28}ms`;
    els.miniWave.append(bar);
  });
}

function renderPulseChart(home, away, events, currentMinute) {
  const width = 900;
  const midpoint = 125;
  const amplitude = 0.95;
  const homePoints = chartPoints(home, width, midpoint, -amplitude);
  const awayPoints = chartPoints(away, width, midpoint, amplitude);

  els.homeLine.setAttribute("d", smoothPath(homePoints));
  els.awayLine.setAttribute("d", smoothPath(awayPoints));
  els.homeArea.setAttribute("d", `${smoothPath(homePoints)} L ${width} ${midpoint} L 0 ${midpoint} Z`);
  els.awayArea.setAttribute("d", `${smoothPath(awayPoints)} L ${width} ${midpoint} L 0 ${midpoint} Z`);

  els.eventMarkers.replaceChildren();
  const recentEvents = events.filter((event) => event.minute >= currentMinute - 23);
  recentEvents.forEach((event) => {
    const ratio = Math.max(0, Math.min(1, (event.minute - (currentMinute - 23)) / 23));
    const x = ratio * width;
    const marker = createSvg("g", { class: "event-marker" });
    marker.append(
      createSvg("line", { x1: x, y1: 32, x2: x, y2: 218 }),
      createSvg("circle", { cx: x, cy: midpoint, r: 5 }),
      createSvg("text", { x: Math.min(width - 40, x + 8), y: 27 }, `${event.minute}'`),
    );
    els.eventMarkers.append(marker);
  });
}

function chartPoints(values, width, midpoint, direction) {
  const step = width / Math.max(1, values.length - 1);
  return values.map((value, index) => ({
    x: index * step,
    y: midpoint + direction * Math.min(94, value),
  }));
}

function smoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midpointX = (current.x + next.x) / 2;
    path += ` C ${midpointX.toFixed(2)} ${current.y.toFixed(2)}, ${midpointX.toFixed(2)} ${next.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }
  return path;
}

function createSvg(name, attributes, text) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}

function renderMoments(events) {
  els.momentsList.replaceChildren();
  [...events]
    .sort((a, b) => b.minute - a.minute)
    .slice(0, 5)
    .forEach((event) => {
      const fragment = els.momentTemplate.content.cloneNode(true);
      const item = fragment.querySelector("li");
      item.classList.add(event.side === "away" ? "away" : event.type === "warning" ? "warning" : "home");
      fragment.querySelector(".moment-time").textContent = `${event.minute}'`;
      fragment.querySelector(".moment-title").textContent = event.title;
      fragment.querySelector(".moment-detail").textContent = event.detail;
      els.momentsList.append(fragment);
    });
}

function toggleSpoilers() {
  state.spoilerSafe = !state.spoilerSafe;
  document.body.classList.toggle("spoiler-safe", state.spoilerSafe);
  els.spoilerToggle.classList.toggle("active", state.spoilerSafe);
  els.spoilerToggle.setAttribute("aria-pressed", String(state.spoilerSafe));
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  els.soundToggle.classList.toggle("active", state.soundOn);
  els.soundToggle.textContent = state.soundOn ? "◗" : "◖";
  els.soundToggle.setAttribute("aria-pressed", String(state.soundOn));
}

function activateView(view) {
  state.activeView = view;
  $$(".view-tab").forEach((button) => button.classList.toggle("active", button.dataset.view === view));

  const narratives = {
    pulse: state.feed?.pulse.narrative,
    timeline: "The latest verified events are ordered by match time. Select Pulse to return to the momentum view.",
    numbers: state.feed ? `${state.feed.match.home.name} carry ${state.feed.pulse.homePressure}% of the recent pressure signal; consensus currently favours them at ${state.feed.consensus.home}%.` : "",
  };
  els.liveInsight.textContent = narratives[view] || state.feed?.pulse.narrative || "";

  if (view === "timeline") {
    els.momentsList.closest(".moments-card").scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

$("#jumpLive").addEventListener("click", () => $("#liveMatch").scrollIntoView({ behavior: "smooth" }));
els.spoilerToggle.addEventListener("click", toggleSpoilers);
els.soundToggle.addEventListener("click", toggleSound);
$$('.view-tab').forEach((button) => button.addEventListener("click", () => activateView(button.dataset.view)));

loadFeed();
setInterval(() => {
  if (state.feed?.match.state === "live") {
    state.feed.match.second += 1;
    if (state.feed.match.second >= 60) {
      state.feed.match.second = 0;
      state.feed.match.minute += 1;
    }
    els.matchClock.textContent = `${state.feed.match.minute}:${String(state.feed.match.second).padStart(2, "0")}`;
  }
}, 1000);
