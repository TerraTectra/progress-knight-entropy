import { DAYS_PER_YEAR, MONEY_UNITS } from "./constants.js";
import { allJobs, allSkills } from "./data.js";

export function fmt(n) {
  if (!Number.isFinite(n)) return "∞";
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(2)}k`;
  return Number(n).toFixed(n < 100 ? 1 : 0);
}

export function pct(current, max) {
  return Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
}

export function moneyUnit(amount) {
  const abs = Math.abs(amount || 0);
  return MONEY_UNITS.find((unit) => abs >= unit.value) || MONEY_UNITS[MONEY_UNITS.length - 1];
}

export function moneyText(amount, language = "ru", compact = false) {
  const sign = amount < 0 ? "-" : "";
  const unit = moneyUnit(amount);
  const value = Math.abs(amount || 0) / unit.value;
  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  const name = compact ? (language === "ru" ? unit.shortRu : unit.shortEn) : (language === "ru" ? unit.ru : unit.en);
  return `${sign}${value.toFixed(decimals)} ${name}`;
}

export function makeProgressMap(items) {
  return Object.fromEntries(items.map((item) => [item.name, { level: 0, xp: 0, maxLevel: 0 }]));
}

export function freshJobState() { return makeProgressMap(allJobs); }
export function freshSkillState() { return makeProgressMap(allSkills); }

export function getLevel(state, name) {
  return state?.[name]?.level || 0;
}

export function maxXp(base, level, difficulty = 1) {
  return base * Math.pow(1.12, level) * difficulty;
}

export function taskPreviousMax(state, name) {
  return state?.[name]?.maxLevel || 0;
}

export function taskMemoryMultiplier(state, name) {
  return 1 + taskPreviousMax(state, name) / 10;
}

export function taskMemoryText(state, name, language = "ru") {
  const previousMax = taskPreviousMax(state, name);
  const multiplier = taskMemoryMultiplier(state, name);
  return language === "ru" ? `Макс. прошлых жизней ${previousMax} · x${multiplier.toFixed(2)} XP` : `Previous max ${previousMax} · x${multiplier.toFixed(2)} XP`;
}

export function gainTaskState(taskState, item, gain, difficulty = 1) {
  const current = taskState[item.name] || { level: 0, xp: 0, maxLevel: 0 };
  let xp = current.xp + gain;
  let level = current.level;
  const maxLevel = current.maxLevel || 0;
  let leveled = false;
  while (xp >= maxXp(item.maxXp, level, difficulty)) {
    xp -= maxXp(item.maxXp, level, difficulty);
    level += 1;
    leveled = true;
  }
  return { state: { ...taskState, [item.name]: { level, xp, maxLevel } }, leveled, level };
}

export function resetProgressKeepMax(state, items) {
  return Object.fromEntries(items.map((item) => {
    const current = state?.[item.name] || { level: 0, xp: 0, maxLevel: 0 };
    return [item.name, { level: 0, xp: 0, maxLevel: Math.max(current.maxLevel || 0, current.level || 0) }];
  }));
}

export function skillPower(level) {
  const l = Math.max(0, level || 0);
  return l + Math.sqrt(l) * 8 + Math.log1p(l) * 24;
}

export function skillLevelMultiplier(level, rate = 0.0024, cap = 12) {
  return Math.min(cap, 1 + skillPower(level) * rate);
}

export function skillStateMultiplier(state, name, rate = 0.0024, cap = 12) {
  return skillLevelMultiplier(getLevel(state, name), rate, cap);
}

export function skillStateReduction(state, name, rate = 0.0018, floor = 0.18) {
  return Math.max(floor, 1 / (1 + skillPower(getLevel(state, name)) * rate));
}

export function combineSkillBonuses(...multipliers) {
  const bonus = multipliers.reduce((sum, value) => sum + Math.max(0, (value || 1) - 1), 0);
  const synergy = 1 + Math.log1p(bonus) * 0.08;
  return 1 + bonus * synergy;
}

export function skillEffectMultiplier(name, state) {
  if (name === "Concentration") return skillStateMultiplier(state, name, 0.0024, 10);
  if (name === "Productivity") return skillStateMultiplier(state, name, 0.0024, 10);
  if (name === "Bargaining") return skillStateReduction(state, name, 0.0019, 0.18);
  if (name === "Meditation") return skillStateMultiplier(state, name, 0.0021, 9);
  if (name === "Strength") return skillStateMultiplier(state, name, 0.0022, 11);
  if (name === "Battle tactics") return skillStateMultiplier(state, name, 0.0023, 10);
  if (name === "Muscle memory") return skillStateMultiplier(state, name, 0.0023, 10);
  if (name === "Mana control") return skillStateMultiplier(state, name, 0.0022, 12);
  if (name === "Immortality") return skillStateMultiplier(state, name, 0.0021, 9);
  if (name === "Time warping") return skillStateMultiplier(state, name, 0.00155, 7);
  if (name === "Super immortality") return skillStateMultiplier(state, name, 0.0019, 8);
  if (name === "Dark influence") return skillStateMultiplier(state, name, 0.0022, 11);
  if (name === "Evil control") return skillStateMultiplier(state, name, 0.0025, 12);
  if (name === "Intimidation") return skillStateReduction(state, name, 0.0019, 0.18);
  if (name === "Demon training") return skillStateMultiplier(state, name, 0.0024, 12);
  if (name === "Blood meditation") return skillStateMultiplier(state, name, 0.0025, 12);
  if (name === "Demon's wealth") return skillStateMultiplier(state, name, 0.0021, 10);
  if (name === "Clockwork focus") return skillStateMultiplier(state, name, 0.00155, 7);
  if (name === "Paradox handling") return skillStateMultiplier(state, name, 0.0026, 12);
  if (name === "Entropy surfing") return skillStateMultiplier(state, name, 0.0026, 12);
  return 1;
}

export function reqUnlocked(req, ctx) {
  if (!req) return true;
  if (req.all) return req.all.every((x) => reqUnlocked(x, ctx));
  if (req.any) return req.any.some((x) => reqUnlocked(x, ctx));
  if (req.task) return getLevel(ctx.jobState, req.task) >= req.level || getLevel(ctx.skillState, req.task) >= req.level;
  if (req.coins) return ctx.coins >= req.coins;
  if (req.ageDays) return ctx.days >= req.ageDays;
  if (req.evil) return ctx.evil >= req.evil;
  if (req.perk) return ctx.ownedPerks?.includes(req.perk);
  if (req.universe) return ctx.universe >= req.universe;
  return true;
}

export function reqText(req, ctx, tr, language = "ru") {
  if (!req) return language === "ru" ? "Нет" : "None";
  if (req.all) return req.all.map((x) => reqText(x, ctx, tr, language)).join(language === "ru" ? " и " : " and ");
  if (req.task) return `${tr(req.task, language)} ${language === "ru" ? "ур." : "lvl"} ${req.level}`;
  if (req.coins) return moneyText(req.coins, language);
  if (req.ageDays) return language === "ru" ? `День ${Math.floor(req.ageDays - 14 * DAYS_PER_YEAR)}` : `Day ${Math.floor(req.ageDays - 14 * DAYS_PER_YEAR)}`;
  if (req.evil) return `${fmt(req.evil)} ${language === "ru" ? "зла" : "Evil"}`;
  if (req.perk) return tr(req.perk, language);
  if (req.universe) return `${language === "ru" ? "Вселенная" : "Universe"} ${req.universe}`;
  return "?";
}
