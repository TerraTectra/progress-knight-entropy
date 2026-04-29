import { SAVE_KEY, DAYS_PER_YEAR, BASE_SPEED, BASE_LIFESPAN, EARLY_STAGE_BOOST } from "./constants.js";
import { freshJobState, freshSkillState, gainTaskState, getLevel, skillEffectMultiplier, taskMemoryMultiplier, combineSkillBonuses } from "./progression.js";
import { initialMetaUpgrades, metaEffects, universeMods } from "./multiverse.js";
import { initialObserverUpgrades, observerPointGain, tickSimulacrum } from "./observer.js";
import { allJobs, allSkills, miscItems, properties } from "./data.js";
import { achievementBonuses } from "./achievements.js";
import { earlySpeedMultiplier } from "./progressionPlan.js";

const OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;
const OFFLINE_MIN_MS = 2000;
const OFFLINE_TICK_MS = 1000 / 30;

function itemMul(owned, name) {
  return owned?.includes(name) ? (miscItems.find((item) => item.name === name)?.effect || 1) : 1;
}

function normalizeAutoSkillMode(value) {
  return "smart";
}

function jobIncomeFor(state, item, effects) {
  let value = item.income * (1 + Math.log10(getLevel(state.jobState, item.name) + 1));
  if (["Beggar", "Farmer", "Fisherman", "Miner", "Blacksmith", "Merchant"].includes(item.name)) value *= effects.commonPay;
  if (["Squire", "Footman", "Veteran footman", "Knight", "Veteran knight", "Elite knight", "Holy knight", "Legendary knight"].includes(item.name)) value *= effects.militaryPay;
  if (["Student", "Apprentice mage", "Mage", "Wizard", "Master wizard", "Chairman"].includes(item.name)) value *= effects.magicPay;
  if (item.name === "Fisherman") value *= itemMul(state.misc, "Fishing net");
  return value * effects.income;
}

function offlineEffects(state) {
  const property = properties.find((item) => item.name === state.property) || properties[0];
  const bonus = achievementBonuses(state.achievedMilestones || []);
  const meta = metaEffects(state.metaUpgrades || initialMetaUpgrades);
  const uMods = universeMods(state.universe || 1);
  const darkLearning = combineSkillBonuses(skillEffectMultiplier("Dark influence", state.skillState), skillEffectMultiplier("Demon training", state.skillState), skillEffectMultiplier("Entropy surfing", state.skillState));
  const lifeSkills = combineSkillBonuses(skillEffectMultiplier("Immortality", state.skillState), skillEffectMultiplier("Super immortality", state.skillState));
  const speedSkills = combineSkillBonuses(skillEffectMultiplier("Time warping", state.skillState), skillEffectMultiplier("Clockwork focus", state.skillState));

  return {
    happiness: property.effect * skillEffectMultiplier("Meditation", state.skillState) * itemMul(state.misc, "Cheap meal") * itemMul(state.misc, "Meditation mat") * itemMul(state.misc, "Butler"),
    jobXp: bonus.allXp * meta.allXp * uMods.jobXp * combineSkillBonuses(skillEffectMultiplier("Productivity", state.skillState), skillEffectMultiplier("Diligence", state.skillState), darkLearning) * itemMul(state.misc, "Work gloves") * itemMul(state.misc, "Personal squire") * itemMul(state.misc, "Entropy map") * (state.ownedPerks?.includes("shadowDiscipline") ? 1.25 : 1) * (state.ownedPerks?.includes("demonicAutomation") && state.autoPromote ? 1.5 : 1),
    skillXp: bonus.allXp * bonus.skillXp * meta.allXp * uMods.skillXp * combineSkillBonuses(skillEffectMultiplier("Concentration", state.skillState), skillEffectMultiplier("Patience", state.skillState), skillEffectMultiplier("Curiosity", state.skillState), skillEffectMultiplier("Diligence", state.skillState), darkLearning) * itemMul(state.misc, "Book") * itemMul(state.misc, "Research notes") * itemMul(state.misc, "Study desk") * itemMul(state.misc, "Library") * itemMul(state.misc, "Entropy map") * (state.ownedPerks?.includes("shadowDiscipline") ? 1.25 : 1) * (state.ownedPerks?.includes("demonicAutomation") && state.autoLearn ? 1.5 : 1),
    income: bonus.income * meta.income * uMods.income * skillEffectMultiplier("Demon's wealth", state.skillState) * itemMul(state.misc, "Merchant seal") * itemMul(state.misc, "Debt ledger") * (state.ownedPerks?.includes("darkPatronage") ? 1.12 : 1),
    expense: meta.expense * uMods.expense * skillEffectMultiplier("Bargaining", state.skillState) * skillEffectMultiplier("Frugality", state.skillState) * skillEffectMultiplier("Intimidation", state.skillState) * itemMul(state.misc, "Abacus") * (state.ownedPerks?.includes("wickedBargain") ? 0.85 : 1),
    militaryPay: skillEffectMultiplier("Strength", state.skillState) * itemMul(state.misc, "Knight's banner"),
    commonPay: itemMul(state.misc, "Ledger"),
    magicPay: skillEffectMultiplier("Mana control", state.skillState) * itemMul(state.misc, "Arcane focus") * itemMul(state.misc, "Sapphire charm") * itemMul(state.misc, "Apprentice grimoire") * itemMul(state.misc, "Inversion staff"),
    lifespan: BASE_LIFESPAN * lifeSkills * meta.lifespan * uMods.lifespan + (state.ownedPerks?.includes("deathDefiance") ? 30 * DAYS_PER_YEAR : 0),
    timeWarp: speedSkills * meta.speed * uMods.speed * itemMul(state.misc, "Clockwork metronome"),
    observerGain: bonus.observerGain,
  };
}

function applyOfflineProgress(state) {
  const savedAt = Number(state.savedAt || state.lastTickAt || Date.now());
  const elapsedMs = Math.min(Math.max(0, Date.now() - savedAt), OFFLINE_CAP_MS);
  if (elapsedMs < OFFLINE_MIN_MS || state.paused) return { ...state, autoSkillMode: "smart", savedAt: Date.now(), lastTickAt: Date.now() };

  const next = { ...state, autoSkillMode: "smart" };
  const effects = offlineEffects(next);
  const age = Math.floor(next.days / DAYS_PER_YEAR);
  const speed = BASE_SPEED * earlySpeedMultiplier(next, age, EARLY_STAGE_BOOST) * (next.warp ? effects.timeWarp : 1) * (next.adminSpeedMultiplier || 1);
  const virtualTicks = elapsedMs / OFFLINE_TICK_MS;
  const dayGain = speed * virtualTicks / DAYS_PER_YEAR;

  if (!next.observerUnlocked && next.days < effects.lifespan) {
    const job = allJobs.find((item) => item.name === next.jobName) || allJobs[0];
    const skill = allSkills.find((item) => item.name === next.skillName) || allSkills[0];
    const income = jobIncomeFor(next, job, effects);
    const property = properties.find((item) => item.name === next.property) || properties[0];
    const expense = (property.expense + miscItems.filter((item) => next.misc?.includes(item.name)).reduce((sum, item) => sum + item.expense, 0)) * effects.expense;
    const cappedDayGain = Math.min(dayGain, Math.max(0, effects.lifespan - next.days));
    next.days += cappedDayGain;
    next.coins = Math.max(0, next.coins + (income - expense) * cappedDayGain);
    next.jobState = gainTaskState(next.jobState, job, 10 * effects.jobXp * effects.happiness * taskMemoryMultiplier(next.jobState, job.name) * cappedDayGain, 1).state;
    next.skillState = gainTaskState(next.skillState, skill, 10 * effects.skillXp * effects.happiness * taskMemoryMultiplier(next.skillState, skill.name) * cappedDayGain, 1).state;
  }

  if (next.observerUnlocked && Array.isArray(next.simulacra) && next.simulacra.length) {
    const simTicks = Math.min(6000, Math.max(1, Math.floor(virtualTicks)));
    const observerSeconds = elapsedMs / 1000;
    const opPerSecond = observerPointGain(next.simulacra, next.observerUpgrades, effects.observerGain, next.observerCommand);
    next.observerPoints = (next.observerPoints || 0) + opPerSecond * observerSeconds;
    let sims = next.simulacra;
    for (let i = 0; i < simTicks; i += 1) sims = sims.map((sim) => tickSimulacrum(sim, next.observerCommand, next.observerUpgrades));
    next.simulacra = sims;
  }

  const seconds = Math.floor(elapsedMs / 1000);
  const oldLog = next.log || [];
  next.log = [`Оффлайн-прогресс досчитан за ${seconds} сек.`, ...oldLog].slice(0, 10);
  next.savedAt = Date.now();
  next.lastTickAt = Date.now();
  return next;
}

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
    autoSkillMode: "smart",
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
    savedAt: Date.now(),
    lastTickAt: Date.now(),
    log: ["You begin life as a beggar at age 14."],
  };
}

export function loadSave() {
  const defaults = defaultSave();
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return defaults;
  try {
    const data = JSON.parse(raw);
    const merged = { ...defaults, ...data, autoSkillMode: normalizeAutoSkillMode(data.autoSkillMode), jobState: { ...defaults.jobState, ...(data.jobState || {}) }, skillState: { ...defaults.skillState, ...(data.skillState || {}) }, metaUpgrades: { ...defaults.metaUpgrades, ...(data.metaUpgrades || {}) }, observerUpgrades: { ...defaults.observerUpgrades, ...(data.observerUpgrades || {}) }, unlockedProperties: Array.from(new Set(["Homeless", ...(data.unlockedProperties || []), data.property || "Homeless"])), unlockedMisc: Array.from(new Set([...(data.unlockedMisc || []), ...(data.misc || [])])) };
    return applyOfflineProgress(merged);
  } catch {
    return { ...defaults, log: ["Save was corrupted. A new life has been created."] };
  }
}

export function saveGame(state) { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, autoSkillMode: "smart", savedAt: Date.now(), lastTickAt: Date.now() })); }
export function clearSave() { localStorage.removeItem(SAVE_KEY); }
