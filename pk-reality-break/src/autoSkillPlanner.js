import { allJobs, allSkills } from "./data.js";
import { getLevel, maxXp, reqUnlocked, taskMemoryMultiplier } from "./progression.js";

const BASE_TARGETS = [10, 25, 50, 100, 250];
const MAGIC_CORE = new Set(["Concentration", "Productivity", "Meditation", "Curiosity", "Mana control"]);
const ECONOMY_CORE = new Set(["Bargaining", "Frugality", "Productivity", "Diligence"]);
const COMBAT_CORE = new Set(["Strength", "Endurance", "Weapon handling", "Guard discipline", "Battle tactics", "Muscle memory"]);

export const AUTO_SKILL_MODES = [
  { id: "smart", label: "Smart" },
  { id: "magic", label: "Rush Magic" },
  { id: "economy", label: "Economy" },
  { id: "combat", label: "Combat" },
  { id: "balanced", label: "Balanced" },
];

function reqTasks(req, out = []) {
  if (!req) return out;
  if (req.all) req.all.forEach((item) => reqTasks(item, out));
  if (req.any) req.any.forEach((item) => reqTasks(item, out));
  if (req.task) out.push({ name: req.task, level: req.level || 1 });
  return out;
}

function targetLevelsFor(skillName) {
  const targets = new Set(BASE_TARGETS);
  for (const item of [...allSkills, ...allJobs]) {
    for (const req of reqTasks(item.req)) {
      if (req.name === skillName) targets.add(req.level);
    }
  }
  return Array.from(targets).filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b);
}

function nextTarget(skill, level) {
  return targetLevelsFor(skill.name).find((target) => target > level) || Math.ceil((level + 1) / 25) * 25;
}

function xpToTarget(skill, state, target, difficulty = 1) {
  const current = state?.[skill.name] || { level: 0, xp: 0 };
  let need = Math.max(0, maxXp(skill.maxXp, current.level, difficulty) - (current.xp || 0));
  for (let level = current.level + 1; level < target; level += 1) {
    need += maxXp(skill.maxXp, level, difficulty);
  }
  return need;
}

function unlockValue(skill, target, ctx) {
  let value = 1;
  for (const item of [...allSkills, ...allJobs]) {
    if (!item.req || reqUnlocked(item.req, ctx)) continue;
    const requirements = reqTasks(item.req).filter((req) => req.name === skill.name);
    for (const req of requirements) {
      if (target >= req.level) value += allJobs.includes(item) ? 2.4 : 2.0;
      else value += Math.max(0.1, target / Math.max(1, req.level)) * 0.55;
    }
  }
  return value;
}

function modeValue(mode, skillName, ctx) {
  if (mode === "magic" && MAGIC_CORE.has(skillName)) return 3.5;
  if (mode === "economy" && ECONOMY_CORE.has(skillName)) return 2.5;
  if (mode === "combat" && COMBAT_CORE.has(skillName)) return 2.5;
  if (mode === "smart" && !reqUnlocked({ task: "Mana control", level: 1 }, ctx) && MAGIC_CORE.has(skillName)) return 2.25;
  return 1;
}

export function autoSkillPlan({ available, currentSkillName, skillState, ctx, mode = "smart", globalGainPerDay = 1, difficulty = 1 }) {
  if (!available?.length) return null;

  const current = available.find((skill) => skill.name === currentSkillName) || available[0];
  const levels = available.map((skill) => getLevel(skillState, skill.name));
  const averageLevel = levels.reduce((sum, value) => sum + value, 0) / Math.max(1, levels.length);

  const ranked = available.map((skill) => {
    const level = getLevel(skillState, skill.name);
    const target = nextTarget(skill, level);
    const need = xpToTarget(skill, skillState, target, difficulty);
    const personalGain = Math.max(0.0001, globalGainPerDay * taskMemoryMultiplier(skillState, skill.name));
    const days = need / personalGain;
    const catchUp = Math.sqrt((averageLevel + 10) / (level + 10));
    const priority = unlockValue(skill, target, ctx) * modeValue(mode, skill.name, ctx) * catchUp;
    return { skill, target, need, days, score: priority / Math.max(0.25, days) };
  }).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const currentPlan = ranked.find((entry) => entry.skill.name === current.name) || best;

  if (currentPlan && getLevel(skillState, current.name) < currentPlan.target && currentPlan.score >= best.score * 0.72) {
    return currentPlan;
  }
  return best;
}
