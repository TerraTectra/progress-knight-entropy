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
  return base * Math.pow(1.11, level) * difficulty;
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
  return l + Math.sqrt(l) * 6 + Math.log1p(l) * 16;
}

const SKILL_SCALE = {
  standard: { rate: 0.00165, cap: 6.5 },
  strong: { rate: 0.00185, cap: 7.5 },
  speed: { rate: 0.00105, cap: 4.5 },
  lifespan: { rate: 0.0013, cap: 5.5 },
  meta: { rate: 0.00165, cap: 6.5 },
  reduction: { rate: 0.00125, floor: 0.32 },
};

const SKILL_PROFILE = {
  Concentration: "standard",
  Productivity: "standard",
  Patience: "standard",
  Diligence: "standard",
  Curiosity: "strong",
  Meditation: "standard",
  Strength: "standard",
  Endurance: "standard",
  "Weapon handling": "standard",
  "Guard discipline": "standard",
  "Battle tactics": "standard",
  "Muscle memory": "standard",
  "Mana control": "strong",
  Immortality: "lifespan",
  "Time warping": "speed",
  "Super immortality": "lifespan",
  "Dark influence": "standard",
  "Evil control": "meta",
  "Demon training": "strong",
  "Blood meditation": "meta",
  "Demon's wealth": "standard",
  "Clockwork focus": "speed",
  "Paradox handling": "meta",
  "Entropy surfing": "strong",
};

const REDUCTION_SKILLS = new Set(["Bargaining", "Frugality", "Intimidation"]);

export function skillLevelMultiplier(level, profile = "standard") {
  const scale = SKILL_SCALE[profile] || SKILL_SCALE.standard;
  return Math.min(scale.cap, 1 + skillPower(level) * scale.rate);
}

export function skillStateMultiplier(state, name, profile = SKILL_PROFILE[name] || "standard") {
  return skillLevelMultiplier(getLevel(state, name), profile);
}

export function skillStateReduction(state, name, profile = "reduction") {
  const scale = SKILL_SCALE[profile] || SKILL_SCALE.reduction;
  return Math.max(scale.floor, 1 / (1 + skillPower(getLevel(state, name)) * scale.rate));
}

export function combineSkillBonuses(...multipliers) {
  const bonus = multipliers.reduce((sum, value) => sum + Math.max(0, (value || 1) - 1), 0);
  const synergy = 1 + Math.log1p(bonus) * 0.045;
  return 1 + bonus * synergy;
}

function baseSkillEffect(name, state) {
  if (REDUCTION_SKILLS.has(name)) return skillStateReduction(state, name);
  return skillStateMultiplier(state, name);
}

export function skillEffectMultiplier(name, state) {
  if (name === "Strength") {
    return combineSkillBonuses(
      baseSkillEffect("Strength", state),
      baseSkillEffect("Endurance", state),
      baseSkillEffect("Weapon handling", state),
      baseSkillEffect("Guard discipline", state),
    );
  }
  if (name === "Battle tactics") {
    return combineSkillBonuses(baseSkillEffect("Battle tactics", state), baseSkillEffect("Guard discipline", state));
  }
  if (name === "Immortality") {
    return combineSkillBonuses(baseSkillEffect("Immortality", state), baseSkillEffect("Endurance", state));
  }
  return baseSkillEffect(name, state);
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

function taskLevelForReq(ctx, name) {
  return Math.max(getLevel(ctx.jobState, name), getLevel(ctx.skillState, name));
}

function remainingJoin(parts, language, any = false) {
  const clean = parts.filter(Boolean);
  if (!clean.length) return "";
  return clean.join(any ? (language === "ru" ? " или " : " or ") : (language === "ru" ? " и " : " and "));
}

export function reqText(req, ctx, tr, language = "ru") {
  if (!req || reqUnlocked(req, ctx)) return "";
  if (req.all) return remainingJoin(req.all.map((x) => reqText(x, ctx, tr, language)), language);
  if (req.any) return remainingJoin(req.any.map((x) => reqText(x, ctx, tr, language)), language, true);

  if (req.task) {
    const current = taskLevelForReq(ctx, req.task);
    const left = Math.max(0, req.level - current);
    if (!left) return "";
    return language === "ru"
      ? `${tr(req.task, language)} ур. ${current}/${req.level} — осталось ${left}`
      : `${tr(req.task, language)} lvl ${current}/${req.level} — ${left} left`;
  }

  if (req.coins) {
    const left = Math.max(0, req.coins - (ctx.coins || 0));
    if (!left) return "";
    return language === "ru"
      ? `${moneyText(req.coins, language)} — осталось ${moneyText(left, language)}`
      : `${moneyText(req.coins, language)} — ${moneyText(left, language)} left`;
  }

  if (req.ageDays) {
    const currentDay = Math.max(0, Math.floor((ctx.days || 0) - 14 * DAYS_PER_YEAR));
    const targetDay = Math.max(0, Math.floor(req.ageDays - 14 * DAYS_PER_YEAR));
    const left = Math.max(0, targetDay - currentDay);
    if (!left) return "";
    return language === "ru" ? `День ${currentDay}/${targetDay} — осталось ${left} дн.` : `Day ${currentDay}/${targetDay} — ${left} days left`;
  }

  if (req.evil) {
    const current = ctx.evil || 0;
    const left = Math.max(0, req.evil - current);
    if (!left) return "";
    return language === "ru" ? `Зло ${fmt(current)}/${fmt(req.evil)} — осталось ${fmt(left)}` : `Evil ${fmt(current)}/${fmt(req.evil)} — ${fmt(left)} left`;
  }

  if (req.perk) return ctx.ownedPerks?.includes(req.perk) ? "" : tr(req.perk, language);

  if (req.universe) {
    const current = ctx.universe || 1;
    const left = Math.max(0, req.universe - current);
    if (!left) return "";
    return language === "ru" ? `Вселенная ${current}/${req.universe} — осталось ${left}` : `Universe ${current}/${req.universe} — ${left} left`;
  }

  return "";
}
