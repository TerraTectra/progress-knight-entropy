import { SAVE_KEY, DAYS_PER_YEAR } from "./constants.js";
import { freshJobState, freshSkillState } from "./progression.js";
import { initialMetaUpgrades } from "./multiverse.js";
import { initialObserverUpgrades } from "./observer.js";

export function defaultSave() {
  return {
    language: "ru",
    tab: "Jobs",
    paused: false,
    days: 14 * DAYS_PER_YEAR,
    coins: 0,
    evil: 0,
    rebirths: 0,
    universe: 1,
    highestUniverse: 1,
    metaverse: 0,
    jobName: "Beggar",
    skillName: "Concentration",
    jobState: freshJobState(),
    skillState: freshSkillState(),
    property: "Homeless",
    misc: [],
    unlockedProperties: ["Homeless"],
    unlockedMisc: [],
    ownedPerks: [],
    autoPromote: true,
    autoLearn: true,
    autoShop: true,
    warp: true,
    autoJobBranch: "Common work",
    adminSpeedMultiplier: 1,
    achievedMilestones: [],
    collapsedAchievementStages: {},
    showOnlyIncompleteAchievements: false,
    metaUpgrades: { ...initialMetaUpgrades },
    observerUnlocked: false,
    observerPoints: 0,
    observerUpgrades: { ...initialObserverUpgrades },
    observerCommand: "balanced",
    simulacra: [],
    log: ["Ты начинаешь жизнь нищим в 14 лет."],
  };
}

export function loadSave() {
  const defaults = defaultSave();
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return defaults;
  try {
    const data = JSON.parse(raw);
    return {
      ...defaults,
      ...data,
      jobState: { ...defaults.jobState, ...(data.jobState || {}) },
      skillState: { ...defaults.skillState, ...(data.skillState || {}) },
      metaUpgrades: { ...defaults.metaUpgrades, ...(data.metaUpgrades || {}) },
      observerUpgrades: { ...defaults.observerUpgrades, ...(data.observerUpgrades || {}) },
      unlockedProperties: Array.from(new Set(["Homeless", ...(data.unlockedProperties || []), data.property || "Homeless"])),
      unlockedMisc: Array.from(new Set([...(data.unlockedMisc || []), ...(data.misc || [])])),
    };
  } catch {
    return { ...defaults, log: ["Сохранение повреждено. Создана новая жизнь."] };
  }
}

export function saveGame(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
