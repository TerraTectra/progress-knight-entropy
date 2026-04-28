import { allJobs, allSkills } from "./data.js";
import { getLevel } from "./progression.js";

export const UNIVERSES = [
  { id: 1, name: "I · Prime World", short: "Prime", pointScale: 0, difficulty: 1, unlockCost: 0, rule: "The original mortal rules." },
  { id: 2, name: "II · Ashen Fields", short: "Ash", pointScale: 1, difficulty: 1.2, unlockCost: 0, rule: "Slightly harsher economy." },
  { id: 3, name: "III · Mirror Guild", short: "Mirror", pointScale: 1.55, difficulty: 1.55, unlockCost: 35, rule: "Expenses rise and identities distort." },
  { id: 4, name: "IV · Clockwork Realm", short: "Clock", pointScale: 2.35, difficulty: 2.1, unlockCost: 110, rule: "Time resists you." },
  { id: 5, name: "V · Debt Ocean", short: "Debt", pointScale: 3.4, difficulty: 2.8, unlockCost: 300, rule: "Income is higher, expenses are dangerous." },
  { id: 6, name: "VI · Blood Sun", short: "Blood", pointScale: 5.1, difficulty: 3.7, unlockCost: 850, rule: "Lives are shorter. Evil grows faster." },
  { id: 7, name: "VII · Arcane Inversion", short: "Invert", pointScale: 7.6, difficulty: 5.2, unlockCost: 2400, rule: "Magic overperforms, steel underperforms." },
  { id: 8, name: "VIII · Silent Empire", short: "Silent", pointScale: 11, difficulty: 7, unlockCost: 7000, rule: "Work becomes slow and expensive." },
  { id: 9, name: "IX · Collapsing Crown", short: "Crown", pointScale: 16, difficulty: 10, unlockCost: 22000, rule: "Global upgrades carry the run." },
  { id: 10, name: "X · Reality Soup", short: "Soup", pointScale: 25, difficulty: 15, unlockCost: 80000, rule: "Everything mutates and chaos waves change multipliers." },
];

export const META_UPGRADES = [
  { id: "stableEcho", baseCost: 5, scale: 2.35, effect: "+15% all XP / level", labels: ["Stable Echo", "Ash Echo", "Mirror Echo", "Clock Echo", "Debt Echo", "Blood Echo", "Inverted Echo", "Silent Echo", "Crowned Echo", "??? Echo"] },
  { id: "universalLabor", baseCost: 8, scale: 2.4, effect: "+15% income / level", labels: ["Universal Labor", "Cinder Contracts", "Mirror Wages", "Clock Salaries", "Debt Harvest", "Blood Tithe", "Inverted Payroll", "Silent Bureau", "Crown Tax", "Job-Flavored Noise"] },
  { id: "softTax", baseCost: 12, scale: 2.55, effect: "-8% expenses / level", labels: ["Soft Tax", "Ash Discount", "Mirror Receipt", "Clock Rent", "Debt Buoy", "Blood Discount", "Inverted Cost", "Silent Subsidy", "Crown Exemption", "Price??"] },
  { id: "chronoAnchor", baseCost: 20, scale: 2.7, effect: "+10% speed and lifespan / level", labels: ["Chrono Anchor", "Ashen Sundial", "Mirror Minute", "Clock Heart", "Debt Deadline", "Blood Hour", "Inverted Clock", "Silent Calendar", "Crown Era", "Time Lump"] },
  { id: "darkDividend", baseCost: 30, scale: 2.9, effect: "+20% evil gain and +10% meta gain / level", labels: ["Dark Dividend", "Ash Dividend", "Mirror Sin", "Clock Sin", "Debt Interest", "Blood Interest", "Inverted Evil", "Silent Sin", "Crown Heresy", "Bad Math"] },
  { id: "realityCartography", baseCost: 75, scale: 3.1, effect: "+25% metaverse gain / level", labels: ["Reality Cartography", "Ash Map", "Mirror Atlas", "Clock Compass", "Debt Chart", "Blood Map", "Inverted Atlas", "Silent Survey", "Crown Map", "Map of Not-Map"] },
];

export const initialMetaUpgrades = Object.fromEntries(META_UPGRADES.map((upgrade) => [upgrade.id, 0]));

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
