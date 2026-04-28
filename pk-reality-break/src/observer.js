import { BASE_OBSERVER_POINTS_PER_SECOND } from "./constants.js";
import { freshJobState, freshSkillState, getLevel } from "./progression.js";

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
  const adjusted = TALENTS.map((talent, index) => ({
    ...talent,
    weight: talent.weight * (1 + index * effects.talentLuck * 0.18),
  }));
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
    days: 14 * 365,
    evil: 0,
    universe: 1,
    loops: 0,
    currentJob: "Beggar",
    currentSkill: "Concentration",
    jobState: freshJobState(),
    skillState: freshSkillState(),
    misc: [],
    property: "Homeless",
    status: "Начинает жизнь заново.",
  };
}

export function talentById(id) {
  return TALENTS.find((talent) => talent.id === id) || TALENTS[0];
}

export function personalityById(id) {
  return PERSONALITIES.find((personality) => personality.id === id) || PERSONALITIES[0];
}

export function simulacrumPower(simulacrum) {
  const talent = talentById(simulacrum.talentId);
  const personality = personalityById(simulacrum.personalityId);
  const skillScore = ["Concentration", "Productivity", "Strength", "Mana control", "Evil control"].reduce((sum, name) => sum + Math.sqrt(getLevel(simulacrum.skillState, name)), 0);
  const jobScore = ["Beggar", "Farmer", "Merchant", "Knight", "Mage"].reduce((sum, name) => sum + Math.sqrt(getLevel(simulacrum.jobState, name)), 0);
  return (skillScore + jobScore + simulacrum.level) * talent.point * personality.pointMod;
}

export function observerPointGain(simulacra, upgrades = initialObserverUpgrades, achievementBonus = 1) {
  const effects = observerEffects(upgrades);
  const activePower = simulacra.reduce((sum, simulacrum) => sum + simulacrumPower(simulacrum), 0);
  return BASE_OBSERVER_POINTS_PER_SECOND * achievementBonus * effects.points * (1 + activePower / 100);
}
