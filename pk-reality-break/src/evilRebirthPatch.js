import { DAYS_PER_YEAR, SAVE_KEY } from "./constants.js";
import { allJobs, allSkills } from "./data.js";
import { skillEffectMultiplier } from "./progression.js";

function freshProgress(items) {
  return Object.fromEntries(items.map((item) => [item.name, { level: 0, xp: 0, maxLevel: 0 }]));
}

function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSave(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now(), lastTickAt: Date.now() }));
}

function originalStyleEvilGain(state) {
  const skillState = state?.skillState || {};
  const evilControl = skillEffectMultiplier("Evil control", skillState);
  const bloodMeditation = skillEffectMultiplier("Blood meditation", skillState);
  return Math.max(1, Math.floor(evilControl * bloodMeditation));
}

function isEmbraceEvilButton(target) {
  const button = target?.closest?.("button");
  if (!button) return null;
  const text = (button.textContent || "").trim().toLowerCase();
  if (text.includes("принять зло") || text.includes("embrace evil")) return button;
  return null;
}

function runOriginalStyleEvilRebirth() {
  const state = readSave();
  if (!state) return false;

  const gain = originalStyleEvilGain(state);
  const oldLog = Array.isArray(state.log) ? state.log : [];
  const next = {
    ...state,
    coins: 0,
    days: 14 * DAYS_PER_YEAR,
    evil: (state.evil || 0) + gain,
    rebirths: (state.rebirths || 0) + 1,
    jobName: "Beggar",
    skillName: "Concentration",
    property: "Homeless",
    misc: [],
    unlockedProperties: ["Homeless"],
    unlockedMisc: [],
    jobState: freshProgress(allJobs),
    skillState: freshProgress(allSkills),
    tab: "Skills",
    log: [`Принято зло: +${gain}. Все уровни и пределы прошлых жизней сброшены.`, ...oldLog].slice(0, 10),
  };

  writeSave(next);
  window.location.reload();
  return true;
}

export function installEvilRebirthPatch() {
  if (typeof window === "undefined") return;
  window.addEventListener("click", (event) => {
    if (!isEmbraceEvilButton(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    runOriginalStyleEvilRebirth();
  }, true);
}
