import { SAVE_KEY } from "./constants.js";

function fmtResource(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(2)}k`;
  return n.toFixed(n < 100 ? 1 : 0);
}

function readState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function evilOpened(state) {
  return Boolean(state && ((state.evil || 0) > 0 || (state.ownedPerks || []).length > 0));
}

function multiverseOpened(state) {
  return Boolean(state && ((state.highestUniverse || 1) > 1 || (state.ownedPerks || []).includes("realityBreak")));
}

function applyHeader(state) {
  const headerStatus = document.querySelector("header > div:last-child");
  if (!headerStatus) return;
  const current = headerStatus.textContent || "";
  const speed = current.match(/x[0-9.]+/)?.[0] || "x1";
  const parts = [speed];

  if (evilOpened(state)) parts.push(`Evil ${fmtResource(state.evil)}`);
  if (multiverseOpened(state)) {
    parts.push(`U${state.universe || 1}`);
    parts.push(`${fmtResource(state.metaverse)} MP`);
  }

  headerStatus.textContent = parts.join(" · ");
}

function findSectionByTitle(titles) {
  const normalized = titles.map((title) => title.toLowerCase());
  return Array.from(document.querySelectorAll(".section")).find((section) => {
    const title = section.querySelector("h2")?.textContent?.trim().toLowerCase() || "";
    return normalized.some((needle) => title.includes(needle));
  });
}

function applyEvilStat(state) {
  const existing = document.querySelector(".evil-resource-stat");
  if (!evilOpened(state)) {
    existing?.remove();
    return;
  }

  const moneySection = findSectionByTitle(["деньги", "money"]);
  if (!moneySection) return;

  const node = existing || document.createElement("div");
  node.className = "stat evil-resource-stat";
  node.innerHTML = `<span>Evil</span><b>${fmtResource(state.evil)}</b>`;

  if (!existing) {
    const firstStat = moneySection.querySelector(".stat");
    if (firstStat?.nextSibling) moneySection.insertBefore(node, firstStat.nextSibling);
    else moneySection.appendChild(node);
  }
}

function ensureStyle() {
  if (document.querySelector("#resource-visibility-style")) return;
  const style = document.createElement("style");
  style.id = "resource-visibility-style";
  style.textContent = `
    .evil-resource-stat {
      border-color: #8f4a43 !important;
      background: linear-gradient(135deg, #2a1010, #14100c) !important;
      opacity: 1 !important;
      box-shadow: 0 0 20px rgba(143, 74, 67, .24) !important;
    }
    .evil-resource-stat span { color: #e4a096 !important; }
    .evil-resource-stat b { color: #ffb2a6 !important; font-size: 18px !important; }
  `;
  document.head.appendChild(style);
}

function applyResourceVisibility() {
  ensureStyle();
  const state = readState();
  if (!state) return;
  applyHeader(state);
  applyEvilStat(state);
}

export function installResourceVisibilityPatch() {
  if (typeof window === "undefined") return;
  applyResourceVisibility();
  window.addEventListener("storage", applyResourceVisibility);
  window.addEventListener("focus", applyResourceVisibility);
  setInterval(applyResourceVisibility, 350);
}
