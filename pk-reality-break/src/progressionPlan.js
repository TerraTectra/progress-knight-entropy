export const AUTO_SKILL_MODES = [
  { id: "balanced", label: "Balanced", priority: [] },
  { id: "magic", label: "Rush Magic", priority: ["Concentration", "Productivity", "Meditation", "Curiosity", "Mana control"] },
  { id: "economy", label: "Economy", priority: ["Bargaining", "Frugality", "Productivity", "Diligence", "Concentration"] },
  { id: "combat", label: "Combat", priority: ["Strength", "Battle tactics", "Muscle memory", "Concentration", "Productivity"] },
];

export const MAGIC_ROUTE_TARGETS = {
  Concentration: 90,
  Productivity: 30,
  Meditation: 70,
  Curiosity: 25,
  "Mana control": 1,
};

export function earlySpeedMultiplier(state, age, baseBoost = 1.35) {
  const pureStart = state.rebirths === 0
    && state.evil === 0
    && state.universe === 1
    && !state.ownedPerks?.includes("realityBreak");

  if (!pureStart) return 1;
  if (age <= 25) return baseBoost;
  if (age <= 45) {
    const t = (age - 25) / 20;
    return baseBoost + (1.15 - baseBoost) * t;
  }
  if (age <= 65) {
    const t = (age - 45) / 20;
    return 1.15 + (1 - 1.15) * t;
  }
  return 1;
}

export function autoSkillModeLabel(id) {
  return AUTO_SKILL_MODES.find((mode) => mode.id === id)?.label || "Balanced";
}
