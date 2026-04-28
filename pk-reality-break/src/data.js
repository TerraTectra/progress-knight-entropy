import { DAYS_PER_YEAR } from "./constants.js";

export const jobCategories = {
  "Common work": [
    { name: "Beggar", maxXp: 50, income: 2 },
    { name: "Farmer", maxXp: 120, income: 4, req: { task: "Beggar", level: 10 } },
    { name: "Fisherman", maxXp: 260, income: 7, req: { task: "Farmer", level: 10 } },
    { name: "Miner", maxXp: 560, income: 15, req: { all: [{ task: "Fisherman", level: 10 }, { task: "Strength", level: 10 }] } },
    { name: "Blacksmith", maxXp: 1200, income: 32, req: { all: [{ task: "Miner", level: 10 }, { task: "Strength", level: 30 }] } },
    { name: "Merchant", maxXp: 2600, income: 65, req: { all: [{ task: "Blacksmith", level: 10 }, { task: "Bargaining", level: 50 }] } },
  ],
  Military: [
    { name: "Squire", maxXp: 140, income: 3, req: { task: "Strength", level: 5 } },
    { name: "Footman", maxXp: 1300, income: 12, req: { all: [{ task: "Squire", level: 10 }, { task: "Strength", level: 20 }] } },
    { name: "Veteran footman", maxXp: 14000, income: 48, req: { all: [{ task: "Footman", level: 10 }, { task: "Battle tactics", level: 40 }] } },
    { name: "Knight", maxXp: 140000, income: 130, req: { all: [{ task: "Veteran footman", level: 10 }, { task: "Strength", level: 100 }] } },
    { name: "Veteran knight", maxXp: 1300000, income: 420, req: { all: [{ task: "Knight", level: 10 }, { task: "Battle tactics", level: 150 }] } },
  ],
  "The Arcane Association": [
    { name: "Student", maxXp: 140000, income: 45, req: { task: "Mana control", level: 1 } },
    { name: "Apprentice mage", maxXp: 1400000, income: 350, req: { all: [{ task: "Student", level: 10 }, { task: "Mana control", level: 400 }] } },
    { name: "Mage", maxXp: 14000000, income: 2200, req: { all: [{ task: "Apprentice mage", level: 10 }, { task: "Mana control", level: 700 }] } },
  ],
};

export const skillCategories = {
  Fundamentals: [
    { name: "Concentration", maxXp: 100, desc: "Skill XP" },
    { name: "Productivity", maxXp: 100, desc: "Job XP", req: { task: "Concentration", level: 5 } },
    { name: "Bargaining", maxXp: 100, desc: "Expenses", req: { task: "Concentration", level: 20 } },
    { name: "Meditation", maxXp: 100, desc: "Happiness", req: { all: [{ task: "Concentration", level: 30 }, { task: "Productivity", level: 20 }] } },
  ],
  Combat: [
    { name: "Strength", maxXp: 100, desc: "Military pay" },
    { name: "Battle tactics", maxXp: 100, desc: "Military XP", req: { task: "Concentration", level: 20 } },
    { name: "Muscle memory", maxXp: 100, desc: "Strength XP", req: { all: [{ task: "Concentration", level: 30 }, { task: "Strength", level: 30 }] } },
  ],
  Magic: [
    { name: "Mana control", maxXp: 100, desc: "T.A.A. XP", req: { all: [{ task: "Concentration", level: 200 }, { task: "Meditation", level: 200 }] } },
    { name: "Immortality", maxXp: 100, desc: "Longer lifespan", req: { task: "Apprentice mage", level: 10 } },
    { name: "Time warping", maxXp: 100, desc: "Game speed", req: { task: "Mage", level: 10 } },
  ],
  "Dark magic": [
    { name: "Dark influence", maxXp: 100, desc: "All XP", req: { evil: 1 } },
    { name: "Evil control", maxXp: 100, desc: "Evil gain", req: { evil: 1 } },
    { name: "Intimidation", maxXp: 100, desc: "Expenses", req: { evil: 1 } },
  ],
};

export const properties = [
  { name: "Homeless", expense: 0, effect: 1, req: { ageDays: 14 * DAYS_PER_YEAR + 100 } },
  { name: "Tent", expense: 2, effect: 1.12, req: { ageDays: 14 * DAYS_PER_YEAR + 100 } },
  { name: "Rented room", expense: 6, effect: 1.28, req: { coins: 600 } },
  { name: "Wooden hut", expense: 14, effect: 1.55, req: { coins: 2000 } },
  { name: "Cottage", expense: 35, effect: 2.05, req: { coins: 9000 } },
  { name: "House", expense: 100, effect: 3, req: { coins: 50000 } },
];

export const miscItems = [
  { name: "Book", expense: 2, effect: 1.1, desc: "Skill XP", req: { ageDays: 14 * DAYS_PER_YEAR + 100 } },
  { name: "Cheap meal", expense: 2, effect: 1.06, desc: "Happiness", req: { ageDays: 14 * DAYS_PER_YEAR + 100 } },
  { name: "Dumbbells", expense: 6, effect: 1.16, desc: "Strength XP", req: { task: "Strength", level: 10 } },
  { name: "Work gloves", expense: 8, effect: 1.1, desc: "Job XP", req: { task: "Farmer", level: 15 } },
  { name: "Abacus", expense: 10, effect: 0.96, desc: "Lower expenses", req: { task: "Bargaining", level: 20 } },
  { name: "Ledger", expense: 18, effect: 1.12, desc: "Common work pay", req: { all: [{ task: "Farmer", level: 35 }, { task: "Bargaining", level: 20 }] } },
  { name: "Training dummy", expense: 22, effect: 1.12, desc: "Military XP", req: { task: "Squire", level: 15 } },
  { name: "Fishing net", expense: 26, effect: 1.18, desc: "Fisherman pay", req: { task: "Fisherman", level: 25 } },
];

export const EVIL_PERKS = [
  { id: "shadowDiscipline", name: "Shadow Discipline", cost: 3, req: {}, effect: "+25% all XP" },
  { id: "darkPatronage", name: "Dark Patronage", cost: 8, req: { perk: "shadowDiscipline" }, effect: "+15% income" },
  { id: "realityBreak", name: "Reality Break", cost: 150, req: { all: [{ perk: "darkPatronage" }, { task: "Dark influence", level: 20 }] }, effect: "Open multiverse" },
];

export const allJobs = Object.values(jobCategories).flat();
export const allSkills = Object.values(skillCategories).flat();
