import { DAYS_PER_YEAR } from "./constants.js";
import { allJobs, allSkills } from "./data.js";
import { getLevel, fmt, moneyText } from "./progression.js";
import { tr } from "./i18n.js";

export const ACHIEVEMENT_STAGES = [
  { id: "start", en: "Beginning", ru: "Начало" },
  { id: "work", en: "Common work", ru: "Обычная работа" },
  { id: "combat", en: "Combat path", ru: "Боевой путь" },
  { id: "magic", en: "Magic path", ru: "Путь магии" },
  { id: "economy", en: "Economy", ru: "Экономика" },
  { id: "amulet", en: "Amulet", ru: "Амулет" },
  { id: "evil", en: "Evil", ru: "Зло" },
  { id: "multiverse", en: "Multiverse", ru: "Мультивселенная" },
  { id: "observer", en: "Observer", ru: "Наблюдатель" },
];

const JOB_LEVELS = [10, 25, 50, 100, 250];
const SKILL_LEVELS = [10, 25, 50, 100, 250];
const COMBAT_JOBS = new Set(["Squire", "Footman", "Veteran footman", "Knight", "Veteran knight", "Elite knight", "Holy knight", "Legendary knight"]);
const MAGIC_JOBS = new Set(["Student", "Apprentice mage", "Mage", "Wizard", "Master wizard", "Chairman"]);
const COMBAT_SKILLS = new Set(["Strength", "Battle tactics", "Muscle memory"]);
const MAGIC_SKILLS = new Set(["Mana control", "Immortality", "Time warping", "Super immortality"]);
const EVIL_SKILLS = new Set(["Dark influence", "Evil control", "Intimidation", "Demon training", "Blood meditation", "Demon's wealth"]);
const META_SKILLS = new Set(["Clockwork focus", "Paradox handling", "Entropy surfing"]);

function jobStage(name) {
  if (COMBAT_JOBS.has(name)) return "combat";
  if (MAGIC_JOBS.has(name)) return "magic";
  if (name === "Beggar") return "start";
  return "work";
}

function skillStage(name) {
  if (COMBAT_SKILLS.has(name)) return "combat";
  if (MAGIC_SKILLS.has(name)) return "magic";
  if (EVIL_SKILLS.has(name)) return "evil";
  if (META_SKILLS.has(name)) return "multiverse";
  return "start";
}

function bonus(level, type) {
  const value = level >= 250 ? 0.006 : level >= 100 ? 0.004 : level >= 50 ? 0.003 : 0.0015;
  return { type, value };
}

function makeLevelAchievement(kind, item, level) {
  const isJob = kind === "job";
  return {
    id: `${kind}_${item.name.replace(/[^a-zA-Z0-9]/g, "_")}_${level}`,
    group: isJob ? jobStage(item.name) : skillStage(item.name),
    name: `${item.name} lvl ${level}`,
    ruName: `${tr(item.name, "ru")}: уровень ${level}`,
    desc: `Reach ${item.name} level ${level}.`,
    ruDesc: `Достигни ${level} уровня: ${tr(item.name, "ru")}.`,
    reward: isJob ? `+${(bonus(level, "allXp").value * 100).toFixed(1)}% all XP` : `+${(bonus(level, "skillXp").value * 100).toFixed(1)}% skill XP`,
    ruReward: isJob ? `+${(bonus(level, "allXp").value * 100).toFixed(1)}% ко всему опыту` : `+${(bonus(level, "skillXp").value * 100).toFixed(1)}% к опыту навыков`,
    req: { type: kind, name: item.name, level },
    bonus: isJob ? bonus(level, "allXp") : bonus(level, "skillXp"),
  };
}

export const SPECIAL_ACHIEVEMENTS = [
  { id: "first100days", group: "start", name: "First Routine", ruName: "Первая рутина", desc: "Live through the first 100 days.", ruDesc: "Проживи первые 100 дней.", reward: "+1% income", ruReward: "+1% к доходу", req: { type: "days", value: 14 * DAYS_PER_YEAR + 100 }, bonus: { type: "income", value: 0.01 } },
  { id: "age25", group: "amulet", name: "Copper Amulet", ruName: "Медный амулет", desc: "Reach age 25 and find the amulet.", ruDesc: "Доживи до 25 лет и найди амулет.", reward: "+1% all XP", ruReward: "+1% ко всему опыту", req: { type: "age", value: 25 }, bonus: { type: "allXp", value: 0.01 } },
  { id: "age65", group: "amulet", name: "The Eye Opens", ruName: "Глаз открывается", desc: "Reach age 65.", ruDesc: "Доживи до 65 лет.", reward: "+2% all XP", ruReward: "+2% ко всему опыту", req: { type: "age", value: 65 }, bonus: { type: "allXp", value: 0.02 } },
  { id: "firstRebirth", group: "amulet", name: "The Amulet Answers", ruName: "Амулет отвечает", desc: "Use the amulet once.", ruDesc: "Используй амулет один раз.", reward: "+2% all XP", ruReward: "+2% ко всему опыту", req: { type: "rebirths", value: 1 }, bonus: { type: "allXp", value: 0.02 } },
  { id: "merchant100AutoShop", group: "economy", name: "Autonomous Market", ruName: "Автономный рынок", desc: "Reach Merchant level 100 and unlock Auto Shop.", ruDesc: "Достигни 100 уровня Торговца и открой Автомагазин.", reward: "Auto Shop unlocked", ruReward: "Открыт Автомагазин", req: { type: "job", name: "Merchant", level: 100 }, bonus: { type: "income", value: 0.02 } },
  { id: "coins1m", group: "economy", name: "First Million", ruName: "Первый миллион", desc: "Hold 1.00M coins.", ruDesc: "Накопи 1.00M монет.", reward: "+2% income", ruReward: "+2% к доходу", req: { type: "coins", value: 1000000 }, bonus: { type: "income", value: 0.02 } },
  { id: "evil1", group: "evil", name: "First Sin", ruName: "Первый грех", desc: "Gain Evil for the first time.", ruDesc: "Получи зло впервые.", reward: "+2% evil gain", ruReward: "+2% к приросту зла", req: { type: "evil", value: 1 }, bonus: { type: "evilGain", value: 0.02 } },
  { id: "universe2", group: "multiverse", name: "Second Universe", ruName: "Вторая вселенная", desc: "Unlock Universe II.", ruDesc: "Открой II вселенную.", reward: "+5% meta gain", ruReward: "+5% к приросту метавселенной", req: { type: "highestUniverse", value: 2 }, bonus: { type: "metaGain", value: 0.05 } },
  { id: "observer", group: "observer", name: "The Observer", ruName: "Наблюдатель", desc: "Activate the unreadable final perk.", ruDesc: "Активируй нечитаемый финальный перк.", reward: "+10% Observer Points", ruReward: "+10% к очкам Наблюдателя", req: { type: "observer" }, bonus: { type: "observerGain", value: 0.1 } },
];

export const MILESTONES = [
  ...allJobs.flatMap((job) => JOB_LEVELS.map((level) => makeLevelAchievement("job", job, level))),
  ...allSkills.flatMap((skill) => SKILL_LEVELS.map((level) => makeLevelAchievement("skill", skill, level))),
  ...SPECIAL_ACHIEVEMENTS,
];

export function achievementName(achievement, language) {
  return language === "ru" ? achievement.ruName : achievement.name;
}

export function achievementDesc(achievement, language) {
  return language === "ru" ? achievement.ruDesc : achievement.desc;
}

export function achievementReward(achievement, language) {
  return language === "ru" ? achievement.ruReward : achievement.reward;
}

export function achievementUnlocked(achievement, state) {
  const req = achievement.req;
  if (req.type === "job") return getLevel(state.jobState, req.name) >= req.level;
  if (req.type === "skill") return getLevel(state.skillState, req.name) >= req.level;
  if (req.type === "days") return state.days >= req.value;
  if (req.type === "age") return Math.floor(state.days / DAYS_PER_YEAR) >= req.value;
  if (req.type === "rebirths") return state.rebirths >= req.value;
  if (req.type === "coins") return state.coins >= req.value;
  if (req.type === "evil") return state.evil >= req.value;
  if (req.type === "highestUniverse") return state.highestUniverse >= req.value;
  if (req.type === "observer") return !!state.observerUnlocked;
  return false;
}

export function achievementProgress(achievement, state) {
  const req = achievement.req;
  if (req.type === "job") return { current: getLevel(state.jobState, req.name), target: req.level };
  if (req.type === "skill") return { current: getLevel(state.skillState, req.name), target: req.level };
  if (req.type === "age") return { current: Math.floor(state.days / DAYS_PER_YEAR), target: req.value };
  if (req.type === "coins") return { current: state.coins, target: req.value, text: moneyText(state.coins, state.language, true) };
  if (req.type === "evil") return { current: state.evil, target: req.value };
  if (req.type === "rebirths") return { current: state.rebirths, target: req.value };
  return { current: achievementUnlocked(achievement, state) ? 1 : 0, target: 1 };
}

export function achievementBonuses(achievedIds) {
  const bonuses = { allXp: 1, skillXp: 1, income: 1, evilGain: 1, metaGain: 1, observerGain: 1 };
  for (const achievement of MILESTONES) {
    if (!achievedIds.includes(achievement.id) || !achievement.bonus) continue;
    bonuses[achievement.bonus.type] = (bonuses[achievement.bonus.type] || 1) * (1 + achievement.bonus.value);
  }
  return bonuses;
}

export function achievementGroupLabel(stageId, language) {
  const stage = ACHIEVEMENT_STAGES.find((item) => item.id === stageId);
  return language === "ru" ? stage?.ru || stageId : stage?.en || stageId;
}

export function visibleAchievementStages(state) {
  return ACHIEVEMENT_STAGES.filter((stage) => {
    if (stage.id === "evil") return state.evil > 0;
    if (stage.id === "multiverse") return state.highestUniverse > 1;
    if (stage.id === "observer") return state.observerUnlocked;
    if (stage.id === "magic") return getLevel(state.skillState, "Mana control") > 0;
    if (stage.id === "combat") return getLevel(state.skillState, "Strength") > 0;
    return true;
  });
}
