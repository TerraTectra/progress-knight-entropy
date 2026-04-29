import { allJobs, allSkills } from "./data.js";
import { getLevel } from "./progression.js";

export const UNIVERSES = [
  { id: 1,  name: "I · Prime World",       short: "Prime",  pointScale: 0,    difficulty: 1,    unlockCost: 0,     enRule: "The original mortal rules.",                                ruRule: "Изначальные правила смертных." },
  { id: 2,  name: "II · Ashen Fields",     short: "Ash",    pointScale: 1,    difficulty: 1.2,  unlockCost: 0,     enRule: "Slightly harsher economy.",                                 ruRule: "Чуть более жёсткая экономика." },
  { id: 3,  name: "III · Mirror Guild",    short: "Mirror", pointScale: 1.55, difficulty: 1.55, unlockCost: 35,    enRule: "Expenses rise and identities distort.",                     ruRule: "Расходы растут, личности искажаются." },
  { id: 4,  name: "IV · Clockwork Realm",  short: "Clock",  pointScale: 2.35, difficulty: 2.1,  unlockCost: 110,   enRule: "Time resists you.",                                         ruRule: "Время сопротивляется тебе." },
  { id: 5,  name: "V · Debt Ocean",        short: "Debt",   pointScale: 3.4,  difficulty: 2.8,  unlockCost: 300,   enRule: "Income is higher, expenses are dangerous.",                 ruRule: "Доход выше, но расходы опасны." },
  { id: 6,  name: "VI · Blood Sun",        short: "Blood",  pointScale: 5.1,  difficulty: 3.7,  unlockCost: 850,   enRule: "Lives are shorter. Evil grows faster.",                     ruRule: "Жизни короче. Зло растёт быстрее." },
  { id: 7,  name: "VII · Arcane Inversion", short: "Invert", pointScale: 7.6, difficulty: 5.2,  unlockCost: 2400,  enRule: "Magic overperforms, steel underperforms.",                  ruRule: "Магия сильнее, сталь слабее." },
  { id: 8,  name: "VIII · Silent Empire",  short: "Silent", pointScale: 11,   difficulty: 7,    unlockCost: 7000,  enRule: "Work becomes slow and expensive.",                          ruRule: "Работа становится медленной и дорогой." },
  { id: 9,  name: "IX · Collapsing Crown", short: "Crown",  pointScale: 16,   difficulty: 10,   unlockCost: 22000, enRule: "Global upgrades carry the run.",                            ruRule: "Глобальные улучшения вытягивают забег." },
  { id: 10, name: "X · Reality Soup",      short: "Soup",   pointScale: 25,   difficulty: 15,   unlockCost: 80000, enRule: "Everything mutates and chaos waves change multipliers.",   ruRule: "Всё мутирует, хаос-волны меняют множители." },
];

export const META_UPGRADES = [
  { id: "stableEcho",          baseCost: 5,  scale: 2.35, enEffect: "+15% all XP / level",                                  ruEffect: "+15% ко всему опыту / уровень",
    enLabels: ["Stable Echo", "Ash Echo", "Mirror Echo", "Clock Echo", "Debt Echo", "Blood Echo", "Inverted Echo", "Silent Echo", "Crowned Echo", "??? Echo"],
    ruLabels: ["Стабильное эхо", "Пепельное эхо", "Зеркальное эхо", "Часовое эхо", "Долговое эхо", "Кровавое эхо", "Инвертированное эхо", "Безмолвное эхо", "Коронованное эхо", "??? эхо"] },
  { id: "universalLabor",      baseCost: 8,  scale: 2.4,  enEffect: "+15% income / level",                                  ruEffect: "+15% к доходу / уровень",
    enLabels: ["Universal Labor", "Cinder Contracts", "Mirror Wages", "Clock Salaries", "Debt Harvest", "Blood Tithe", "Inverted Payroll", "Silent Bureau", "Crown Tax", "Job-Flavored Noise"],
    ruLabels: ["Всеобщий труд", "Угольные контракты", "Зеркальные зарплаты", "Часовые оклады", "Долговая жатва", "Кровавая десятина", "Инвертированный фонд", "Безмолвное бюро", "Коронный налог", "Шум со вкусом работы"] },
  { id: "softTax",             baseCost: 12, scale: 2.55, enEffect: "-8% expenses / level",                                 ruEffect: "-8% к расходам / уровень",
    enLabels: ["Soft Tax", "Ash Discount", "Mirror Receipt", "Clock Rent", "Debt Buoy", "Blood Discount", "Inverted Cost", "Silent Subsidy", "Crown Exemption", "Price??"],
    ruLabels: ["Мягкий налог", "Пепельная скидка", "Зеркальный чек", "Часовая аренда", "Долговой буй", "Кровавая скидка", "Инвертированная цена", "Безмолвная субсидия", "Коронная льгота", "Цена??"] },
  { id: "chronoAnchor",        baseCost: 20, scale: 2.7,  enEffect: "+10% speed and lifespan / level",                      ruEffect: "+10% к скорости и сроку жизни / уровень",
    enLabels: ["Chrono Anchor", "Ashen Sundial", "Mirror Minute", "Clock Heart", "Debt Deadline", "Blood Hour", "Inverted Clock", "Silent Calendar", "Crown Era", "Time Lump"],
    ruLabels: ["Хроно-якорь", "Пепельные солнечные часы", "Зеркальная минута", "Сердце часов", "Долговой дедлайн", "Кровавый час", "Инвертированные часы", "Безмолвный календарь", "Коронная эра", "Комок времени"] },
  { id: "darkDividend",        baseCost: 30, scale: 2.9,  enEffect: "+20% evil gain and +10% meta gain / level",            ruEffect: "+20% к приросту зла и +10% к мета-приросту / уровень",
    enLabels: ["Dark Dividend", "Ash Dividend", "Mirror Sin", "Clock Sin", "Debt Interest", "Blood Interest", "Inverted Evil", "Silent Sin", "Crown Heresy", "Bad Math"],
    ruLabels: ["Тёмный дивиденд", "Пепельный дивиденд", "Зеркальный грех", "Часовой грех", "Долговой процент", "Кровавый процент", "Инвертированное зло", "Безмолвный грех", "Коронная ересь", "Плохая математика"] },
  { id: "realityCartography",  baseCost: 75, scale: 3.1,  enEffect: "+25% metaverse gain / level",                          ruEffect: "+25% к приросту метавселенной / уровень",
    enLabels: ["Reality Cartography", "Ash Map", "Mirror Atlas", "Clock Compass", "Debt Chart", "Blood Map", "Inverted Atlas", "Silent Survey", "Crown Map", "Map of Not-Map"],
    ruLabels: ["Картография реальности", "Пепельная карта", "Зеркальный атлас", "Часовой компас", "Долговая схема", "Кровавая карта", "Инвертированный атлас", "Безмолвная разведка", "Коронная карта", "Карта не-карты"] },
];

export const initialMetaUpgrades = Object.fromEntries(META_UPGRADES.map((upgrade) => [upgrade.id, 0]));

export const universeRule = (universe, lang) => (lang === "ru" ? universe.ruRule : universe.enRule) || universe.enRule;
export const metaEffect = (upgrade, lang) => (lang === "ru" ? upgrade.ruEffect : upgrade.enEffect) || upgrade.enEffect;
export const metaLabel = (upgrade, index, lang) => {
  const labels = lang === "ru" ? upgrade.ruLabels : upgrade.enLabels;
  return labels[Math.min(index, labels.length - 1)] || upgrade.enLabels[0];
};

export function universeInfo(id) {
  return UNIVERSES.find((universe) => universe.id === id) || UNIVERSES[0];
}

export function metaUpgradeCost(upgrade, level) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.scale, level));
}

export function metaEffects(metaUpgrades = initialMetaUpgrades) {
  const level = (id) => metaUpgrades[id] || 0;
  return {
    allXp: Math.pow(1.15, level("stableEcho")),
    income: Math.pow(1.15, level("universalLabor")),
    expense: Math.pow(0.92, level("softTax")),
    speed: Math.pow(1.1, level("chronoAnchor")),
    lifespan: Math.pow(1.1, level("chronoAnchor")),
    evilGain: Math.pow(1.2, level("darkDividend")),
    metaGain: Math.pow(1.1, level("darkDividend")) * Math.pow(1.25, level("realityCartography")),
  };
}

export function universeMods(id) {
  if (id <= 1) return { income: 1, expense: 1, jobXp: 1, skillXp: 1, speed: 1, lifespan: 1, evilGain: 1, metaGain: 1 };
  const info = universeInfo(id);
  return {
    income: id === 5 ? 1.25 : id >= 8 ? 0.85 : 1,
    expense: id === 5 ? 1.55 : id >= 3 ? 1 + id * 0.08 : 1,
    jobXp: id >= 8 ? 0.82 : 1,
    skillXp: id === 7 ? 1.25 : 1,
    speed: id === 4 ? 0.82 : id === 10 ? 0.9 : 1,
    lifespan: id === 6 ? 0.82 : 1,
    evilGain: id === 6 ? 1.45 : 1,
    metaGain: Math.max(1, info.pointScale),
  };
}

export function universePointGain(state, effects = { metaGain: 1 }) {
  const info = universeInfo(state.universe || 1);
  if (info.id <= 1) return 0;
  const jobScore = allJobs.reduce((sum, job) => sum + Math.sqrt(getLevel(state.jobState, job.name)), 0);
  const skillScore = allSkills.reduce((sum, skill) => sum + Math.sqrt(getLevel(state.skillState, skill.name)), 0);
  const wealthScore = Math.log10(Math.max(10, state.coins || 0));
  const evilScore = Math.log10(Math.max(10, state.evil || 0));
  return Math.floor((jobScore * 0.55 + skillScore * 0.65 + wealthScore + evilScore) * info.pointScale * effects.metaGain);
}

export function universeJobName(name, universe) {
  if (universe === 3 && name === "Merchant") return "Mirror Broker";
  if (universe === 5 && name === "Farmer") return "Debt Farmer";
  if (universe === 10) return `${name}?`;
  return name;
}

export function universeSkillName(name, universe) {
  if (universe === 4 && name === "Time warping") return "Clock Eating";
  if (universe === 7 && name === "Mana control") return "Mana Inversion";
  if (universe === 10) return `${name}#`;
  return name;
}
