import { BASE_OBSERVER_POINTS_PER_SECOND, BASE_SPEED, BASE_LIFESPAN, DAYS_PER_YEAR } from "./constants.js";
import { allJobs, allSkills, jobCategories, miscItems, properties } from "./data.js";
import { freshJobState, freshSkillState, gainTaskState, getLevel, reqUnlocked, resetProgressKeepMax } from "./progression.js";

export const TALENTS = [
  { id: "trash", rarity: "Мусорный", name: "Рваный инстинкт", weight: 42, intelligence: 0.42, speed: 0.55, mistake: 0.42, point: 0.55, color: "trash", desc: "Путает цели, теряет золото и качает не то." },
  { id: "dull", rarity: "Обычный", name: "Тусклая воля", weight: 30, intelligence: 0.75, speed: 0.8, mistake: 0.22, point: 0.9, color: "dull", desc: "Медленно, но понимает базовый маршрут." },
  { id: "keen", rarity: "Хороший", name: "Острый расчёт", weight: 16, intelligence: 1.05, speed: 1, mistake: 0.12, point: 1.2, color: "keen", desc: "Редко ошибается и не тонет в расходах." },
  { id: "brilliant", rarity: "Редкий", name: "Холодный алгоритм", weight: 8, intelligence: 1.35, speed: 1.18, mistake: 0.07, point: 1.6, color: "brilliant", desc: "Почти оптимальный маршрут." },
  { id: "mythic", rarity: "Эпический", name: "Почти игрок", weight: 3.2, intelligence: 1.75, speed: 1.35, mistake: 0.035, point: 2.15, color: "mythic", desc: "Хорошо адаптируется под сложные вселенные." },
  { id: "legendary", rarity: "Легендарный", name: "Безошибочный свидетель", weight: 0.8, intelligence: 2.35, speed: 1.6, mistake: 0.01, point: 3.1, color: "legendary", desc: "Почти идеально идёт к Universe X." },
];

export const PERSONALITIES = [
  { id: "greedy", name: "Жадный", speedMod: 0.92, pointMod: 1.08, mistakeMod: 1.12, style: "Переоценивает золото." },
  { id: "scholar", name: "Учёный", speedMod: 0.96, pointMod: 1.14, mistakeMod: 0.92, style: "Любит навыки." },
  { id: "reckless", name: "Безрассудный", speedMod: 1.18, pointMod: 0.96, mistakeMod: 1.35, style: "Быстрый, но ломает маршрут." },
  { id: "patient", name: "Терпеливый", speedMod: 0.82, pointMod: 1.28, mistakeMod: 0.72, style: "Медленный, но стабильный." },
  { id: "balanced", name: "Ровный", speedMod: 1, pointMod: 1, mistakeMod: 1, style: "Без больших провалов." },
  { id: "chaotic", name: "Хаотичный", speedMod: 1.32, pointMod: 1.18, mistakeMod: 1.6, style: "Иногда гениален, иногда ужасен." },
];

export const OBSERVER_UPGRADES = [
  { id: "commandSignal", name: "Командный шёпот", baseCost: 8, scale: 2.15, effect: "+12% скорость симулякров / уровень" },
  { id: "errorFilter", name: "Фильтр ошибок", baseCost: 12, scale: 2.35, effect: "-8% шанс ошибки / уровень" },
  { id: "deepWatching", name: "Глубокое наблюдение", baseCost: 18, scale: 2.5, effect: "+15% очки Наблюдателя / уровень" },
  { id: "talentMold", name: "Форма таланта", baseCost: 35, scale: 2.85, effect: "Лучший шанс редких талантов" },
];

export const OBSERVER_COMMANDS = [
  { id: "balanced", name: "Balanced", desc: "Обычный режим: без штрафов и перекосов.", speed: 1, mistake: 1, jobXp: 1, skillXp: 1, points: 1, rebirth: 1 },
  { id: "safe", name: "Safe Economy", desc: "Медленнее, зато меньше ошибок и лучше контроль расходов.", speed: 0.86, mistake: 0.65, jobXp: 0.95, skillXp: 1.05, points: 1.05, rebirth: 1.25 },
  { id: "rush", name: "Rush Progress", desc: "Быстрее идёт вперёд, но чаще ошибается.", speed: 1.28, mistake: 1.35, jobXp: 1.08, skillXp: 1.08, points: 0.95, rebirth: 0.8 },
  { id: "study", name: "Study Focus", desc: "Симулякры сильнее давят навыки и магические открытия.", speed: 0.96, mistake: 0.92, jobXp: 0.85, skillXp: 1.35, points: 1, rebirth: 1 },
  { id: "work", name: "Work Focus", desc: "Симулякры сильнее давят доход и рабочие ветки.", speed: 1.02, mistake: 1.05, jobXp: 1.35, skillXp: 0.85, points: 1, rebirth: 0.95 },
];

export const SIM_NAMES = ["Симулякр Астер", "Симулякр Нокс", "Симулякр Вейл", "Симулякр Орин", "Симулякр Кай", "Симулякр Мор", "Симулякр Лиор", "Симулякр Эхо"];
export const initialObserverUpgrades = Object.fromEntries(OBSERVER_UPGRADES.map((upgrade) => [upgrade.id, 0]));

export function observerUpgradeCost(upgrade, level) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.scale, level));
}

export function observerEffects(upgrades = initialObserverUpgrades) {
  const level = (id) => upgrades[id] || 0;
  return {
    speed: Math.pow(1.12, level("commandSignal")),
    mistake: Math.pow(0.92, level("errorFilter")),
    points: Math.pow(1.15, level("deepWatching")),
    talentLuck: 1 + level("talentMold") * 0.18,
  };
}

export function pickWeighted(items, random = Math.random) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[0];
}

export function pickTalent(effects = observerEffects(), forceTrash = false) {
  if (forceTrash) return TALENTS[0];
  const adjusted = TALENTS.map((talent, index) => ({ ...talent, weight: talent.weight * (1 + index * effects.talentLuck * 0.18) }));
  return pickWeighted(adjusted);
}

export function makeSimulacrum(index, effects, forceTrash = false) {
  const talent = pickTalent(effects, forceTrash);
  const personality = pickWeighted(PERSONALITIES);
  return {
    id: `sim_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: SIM_NAMES[index % SIM_NAMES.length] || `Симулякр ${index + 1}`,
    talentId: talent.id,
    personalityId: personality.id,
    level: 1,
    xp: 0,
    noMistakeStreak: 0,
    coins: 0,
    days: 14 * DAYS_PER_YEAR,
    evil: 0,
    universe: 1,
    loops: 0,
    currentJob: "Beggar",
    currentSkill: "Concentration",
    jobState: freshJobState(),
    skillState: freshSkillState(),
    misc: [],
    property: "Homeless",
    status: "Начинает жизнь заново с 14 лет в первой вселенной.",
  };
}

export function talentById(id) {
  return TALENTS.find((talent) => talent.id === id) || TALENTS[0];
}

export function personalityById(id) {
  return PERSONALITIES.find((personality) => personality.id === id) || PERSONALITIES[0];
}

function simCtx(simulacrum) {
  return { days: simulacrum.days, coins: simulacrum.coins, evil: simulacrum.evil, ownedPerks: [], universe: simulacrum.universe, jobState: simulacrum.jobState, skillState: simulacrum.skillState };
}

function bestAvailableJob(simulacrum) {
  const ctx = simCtx(simulacrum);
  const available = allJobs.filter((job) => reqUnlocked(job.req, ctx));
  const current = allJobs.find((job) => job.name === simulacrum.currentJob) || allJobs[0];
  const talent = talentById(simulacrum.talentId);
  if (talent.intelligence < 0.7 && Math.random() < 0.35) return current;
  return available.sort((a, b) => b.income * (1 + getLevel(simulacrum.jobState, b.name) / 25) - a.income * (1 + getLevel(simulacrum.jobState, a.name) / 25))[0] || current;
}

function bestAvailableSkill(simulacrum) {
  const ctx = simCtx(simulacrum);
  const available = allSkills.filter((skill) => reqUnlocked(skill.req, ctx));
  const current = allSkills.find((skill) => skill.name === simulacrum.currentSkill) || allSkills[0];
  const talent = talentById(simulacrum.talentId);
  if (talent.intelligence < 0.7 && Math.random() < 0.35) return current;
  return available.sort((a, b) => getLevel(simulacrum.skillState, a.name) - getLevel(simulacrum.skillState, b.name))[0] || current;
}

function simIncome(simulacrum) {
  const job = allJobs.find((item) => item.name === simulacrum.currentJob) || allJobs[0];
  const level = getLevel(simulacrum.jobState, job.name);
  const merchant = 1 + getLevel(simulacrum.jobState, "Merchant") / 200;
  return job.income * (1 + Math.log10(level + 1)) * merchant;
}

function simExpense(simulacrum) {
  const property = properties.find((item) => item.name === simulacrum.property) || properties[0];
  const miscExpense = miscItems.filter((item) => simulacrum.misc.includes(item.name)).reduce((sum, item) => sum + item.expense, 0);
  return property.expense + miscExpense;
}

function streakXpMultiplier(streak) {
  const s = Math.max(0, streak || 0);
  return 1 + Math.log1p(s) * 0.22 + Math.sqrt(s) * 0.025;
}

function resetSimulacrumLife(simulacrum) {
  return {
    ...simulacrum,
    coins: 0,
    days: 14 * DAYS_PER_YEAR,
    universe: 1,
    loops: simulacrum.loops + 1,
    currentJob: "Beggar",
    currentSkill: "Concentration",
    property: "Homeless",
    misc: [],
    noMistakeStreak: 0,
    jobState: resetProgressKeepMax(simulacrum.jobState, allJobs),
    skillState: resetProgressKeepMax(simulacrum.skillState, allSkills),
    status: "Перерождение: снова стартует с 14 лет в первой вселенной.",
  };
}

export function tickSimulacrum(simulacrum, commandId = "balanced", upgrades = initialObserverUpgrades) {
  const talent = talentById(simulacrum.talentId);
  const personality = personalityById(simulacrum.personalityId);
  const command = OBSERVER_COMMANDS.find((item) => item.id === commandId) || OBSERVER_COMMANDS[0];
  const observer = observerEffects(upgrades);
  const tickSeconds = 1 / 30;
  const speed = BASE_SPEED * talent.speed * personality.speedMod * command.speed * observer.speed;
  const dayGain = (speed * tickSeconds) / DAYS_PER_YEAR;
  const mistakeChance = 0.0025 * talent.mistake * personality.mistakeMod * command.mistake * observer.mistake;
  const mistake = Math.random() < mistakeChance;

  if (mistake) {
    return {
      ...simulacrum,
      coins: Math.max(0, simulacrum.coins * 0.92),
      noMistakeStreak: 0,
      status: "Ошибка маршрута: серия опыта сброшена.",
    };
  }

  let next = { ...simulacrum };
  next.noMistakeStreak += 1;
  next.days += dayGain;
  next.coins = Math.max(0, next.coins + (simIncome(next) - simExpense(next)) * dayGain);

  const job = bestAvailableJob(next);
  const skill = bestAvailableSkill(next);
  const xpBoost = streakXpMultiplier(next.noMistakeStreak);
  const jobGain = 10 * command.jobXp * talent.intelligence * xpBoost * dayGain;
  const skillGain = 10 * command.skillXp * talent.intelligence * xpBoost * dayGain;
  next.currentJob = job.name;
  next.currentSkill = skill.name;
  next.jobState = gainTaskState(next.jobState, job, jobGain, 1).state;
  next.skillState = gainTaskState(next.skillState, skill, skillGain, 1).state;
  next.xp += (jobGain + skillGain) * 0.05;
  if (next.xp >= next.level * 20) {
    next.xp -= next.level * 20;
    next.level += 1;
  }

  if (getLevel(next.skillState, "Dark influence") >= 20 && next.evil === 0) next.evil = 1;
  if (next.universe === 1 && getLevel(next.skillState, "Dark influence") >= 20 && next.evil >= 1) next.universe = 2;
  if (next.universe < 10 && getLevel(next.jobState, "Merchant") + getLevel(next.skillState, "Time warping") > next.universe * 45) next.universe += 1;

  if (next.days >= BASE_LIFESPAN) next = resetSimulacrumLife(next);
  next.status = `U${next.universe} · ${job.name} ${getLevel(next.jobState, job.name)} · ${skill.name} ${getLevel(next.skillState, skill.name)} · серия ${next.noMistakeStreak}`;
  return next;
}

export function simulacrumPower(simulacrum) {
  const talent = talentById(simulacrum.talentId);
  const personality = personalityById(simulacrum.personalityId);
  const skillScore = allSkills.reduce((sum, skill) => sum + Math.sqrt(getLevel(simulacrum.skillState, skill.name)), 0);
  const jobScore = allJobs.reduce((sum, job) => sum + Math.sqrt(getLevel(simulacrum.jobState, job.name)), 0);
  const streakScore = Math.log1p(simulacrum.noMistakeStreak || 0) * 0.5;
  const universeScore = Math.max(1, simulacrum.universe || 1);
  return (skillScore + jobScore + simulacrum.level + streakScore) * universeScore * talent.point * personality.pointMod;
}

export function observerPointGain(simulacra, upgrades = initialObserverUpgrades, achievementBonus = 1, commandId = "balanced") {
  const effects = observerEffects(upgrades);
  const command = OBSERVER_COMMANDS.find((item) => item.id === commandId) || OBSERVER_COMMANDS[0];
  const activePower = simulacra.reduce((sum, simulacrum) => sum + simulacrumPower(simulacrum), 0);
  return BASE_OBSERVER_POINTS_PER_SECOND * achievementBonus * effects.points * command.points * (1 + activePower / 100);
}
