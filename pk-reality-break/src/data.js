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
    { name: "Elite knight", maxXp: 12000000, income: 1400, req: { all: [{ task: "Veteran knight", level: 10 }, { task: "Strength", level: 250 }] } },
    { name: "Holy knight", maxXp: 100000000, income: 5200, req: { all: [{ task: "Elite knight", level: 10 }, { task: "Mana control", level: 140 }] } },
    { name: "Legendary knight", maxXp: 900000000, income: 21000, req: { all: [{ task: "Holy knight", level: 10 }, { task: "Time warping", level: 80 }] } },
  ],
  "The Arcane Association": [
    { name: "Student", maxXp: 140000, income: 45, req: { task: "Mana control", level: 1 } },
    { name: "Apprentice mage", maxXp: 1400000, income: 350, req: { all: [{ task: "Student", level: 10 }, { task: "Mana control", level: 80 }] } },
    { name: "Mage", maxXp: 14000000, income: 2200, req: { all: [{ task: "Apprentice mage", level: 10 }, { task: "Mana control", level: 160 }] } },
    { name: "Wizard", maxXp: 140000000, income: 13000, req: { all: [{ task: "Mage", level: 10 }, { task: "Immortality", level: 40 }] } },
    { name: "Master wizard", maxXp: 1400000000, income: 70000, req: { all: [{ task: "Wizard", level: 10 }, { task: "Time warping", level: 100 }] } },
    { name: "Chairman", maxXp: 12000000000, income: 420000, req: { all: [{ task: "Master wizard", level: 10 }, { task: "Super immortality", level: 60 }] } },
  ],
};

export const skillCategories = {
  Fundamentals: [
    { name: "Concentration", maxXp: 100, desc: "Skill XP" },
    { name: "Productivity", maxXp: 100, desc: "Job XP", req: { task: "Concentration", level: 5 } },
    { name: "Patience", maxXp: 110, desc: "Skill XP", req: { task: "Concentration", level: 5 } },
    { name: "Bargaining", maxXp: 100, desc: "Expenses", req: { task: "Concentration", level: 20 } },
    { name: "Frugality", maxXp: 120, desc: "Expenses", req: { task: "Bargaining", level: 5 } },
    { name: "Diligence", maxXp: 130, desc: "All XP", req: { all: [{ task: "Concentration", level: 10 }, { task: "Productivity", level: 10 }] } },
    { name: "Meditation", maxXp: 100, desc: "Happiness", req: { all: [{ task: "Concentration", level: 20 }, { task: "Productivity", level: 15 }] } },
    { name: "Curiosity", maxXp: 140, desc: "Skill XP", req: { task: "Concentration", level: 30 } },
  ],
  Combat: [
    { name: "Strength", maxXp: 100, desc: "Military pay" },
    { name: "Battle tactics", maxXp: 100, desc: "Military XP", req: { task: "Concentration", level: 20 } },
    { name: "Muscle memory", maxXp: 100, desc: "Strength XP", req: { all: [{ task: "Concentration", level: 30 }, { task: "Strength", level: 30 }] } },
  ],
  Magic: [
    { name: "Mana control", maxXp: 100, desc: "T.A.A. XP", req: { all: [{ task: "Concentration", level: 70 }, { task: "Meditation", level: 50 }, { task: "Curiosity", level: 15 }] } },
    { name: "Immortality", maxXp: 100, desc: "Longer lifespan", req: { task: "Apprentice mage", level: 10 } },
    { name: "Time warping", maxXp: 100, desc: "Game speed", req: { task: "Mage", level: 10 } },
    { name: "Super immortality", maxXp: 100, desc: "Longer lifespan", req: { all: [{ task: "Time warping", level: 100 }, { task: "Immortality", level: 100 }] } },
  ],
  "Dark magic": [
    { name: "Dark influence", maxXp: 100, desc: "All XP", req: { evil: 1 } },
    { name: "Evil control", maxXp: 100, desc: "Evil gain", req: { evil: 1 } },
    { name: "Intimidation", maxXp: 100, desc: "Expenses", req: { evil: 1 } },
    { name: "Demon training", maxXp: 100, desc: "All XP", req: { all: [{ evil: 25 }, { task: "Dark influence", level: 25 }] } },
    { name: "Blood meditation", maxXp: 100, desc: "Evil gain", req: { all: [{ evil: 75 }, { task: "Evil control", level: 50 }] } },
    { name: "Demon's wealth", maxXp: 100, desc: "Job pay", req: { all: [{ evil: 125 }, { task: "Intimidation", level: 50 }] } },
  ],
  "Universe anomalies": [
    { name: "Clockwork focus", maxXp: 100, desc: "Game speed", req: { universe: 4 } },
    { name: "Paradox handling", maxXp: 100, desc: "Metaverse gain", req: { universe: 6 } },
    { name: "Entropy surfing", maxXp: 100, desc: "All XP", req: { universe: 10 } },
  ],
};

export const properties = [
  { name: "Homeless", expense: 0, effect: 1, req: { ageDays: 14 * DAYS_PER_YEAR + 100 } },
  { name: "Tent", expense: 2, effect: 1.12, req: { ageDays: 14 * DAYS_PER_YEAR + 100 } },
  { name: "Rented room", expense: 6, effect: 1.28, req: { coins: 600 } },
  { name: "Wooden hut", expense: 14, effect: 1.55, req: { coins: 2000 } },
  { name: "Cottage", expense: 35, effect: 2.05, req: { coins: 9000 } },
  { name: "House", expense: 100, effect: 3, req: { coins: 50000 } },
  { name: "Large house", expense: 280, effect: 4.6, req: { coins: 250000 } },
  { name: "Small palace", expense: 900, effect: 7.5, req: { coins: 1500000 } },
  { name: "Grand palace", expense: 3500, effect: 12, req: { coins: 9000000 } },
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
  { name: "Meditation mat", expense: 32, effect: 1.12, desc: "Happiness", req: { task: "Meditation", level: 25 } },
  { name: "Personal squire", expense: 75, effect: 1.15, desc: "Job XP", req: { task: "Knight", level: 1 } },
  { name: "Research notes", expense: 95, effect: 1.14, desc: "Skill XP", req: { task: "Mana control", level: 20 } },
  { name: "Steel longsword", expense: 130, effect: 1.18, desc: "Military XP", req: { task: "Knight", level: 5 } },
  { name: "Merchant seal", expense: 190, effect: 1.13, desc: "Job pay", req: { task: "Merchant", level: 25 } },
  { name: "Butler", expense: 260, effect: 1.2, desc: "Happiness", req: { coins: 250000 } },
  { name: "Knight's banner", expense: 380, effect: 1.18, desc: "Military pay", req: { task: "Veteran knight", level: 5 } },
  { name: "Sapphire charm", expense: 520, effect: 1.15, desc: "T.A.A. XP", req: { task: "Student", level: 10 } },
  { name: "Apprentice grimoire", expense: 840, effect: 1.18, desc: "T.A.A. XP", req: { task: "Apprentice mage", level: 10 } },
  { name: "Study desk", expense: 1100, effect: 1.16, desc: "Skill XP", req: { task: "Mage", level: 5 } },
  { name: "Arcane focus", expense: 1800, effect: 1.22, desc: "T.A.A. XP", req: { task: "Mage", level: 10 } },
  { name: "Library", expense: 3600, effect: 1.22, desc: "Skill XP", req: { task: "Wizard", level: 5 } },
  { name: "Demon contract", expense: 4800, effect: 1.25, desc: "Evil gain", req: { evil: 50 } },
  { name: "Blood censer", expense: 7200, effect: 1.2, desc: "Evil gain", req: { task: "Blood meditation", level: 25 } },
  { name: "Debt ledger", expense: 12000, effect: 1.16, desc: "Job pay", req: { universe: 5 } },
  { name: "Clockwork metronome", expense: 18000, effect: 1.13, desc: "Game speed", req: { universe: 4 } },
  { name: "Reality compass", expense: 50000, effect: 1.2, desc: "Metaverse gain", req: { universe: 6 } },
  { name: "Inversion staff", expense: 80000, effect: 1.18, desc: "T.A.A. XP", req: { universe: 7 } },
  { name: "Entropy map", expense: 150000, effect: 1.18, desc: "All XP", req: { universe: 10 } },
  { name: "Crown fragment", expense: 300000, effect: 1.25, desc: "Metaverse gain", req: { universe: 9 } },
];

export const EVIL_PERKS = [
  { id: "shadowDiscipline", name: "Shadow Discipline", cost: 3, req: {}, effect: "+25% all XP" },
  { id: "darkPatronage", name: "Dark Patronage", cost: 8, req: { perk: "shadowDiscipline" }, effect: "+15% income" },
  { id: "wickedBargain", name: "Wicked Bargain", cost: 18, req: { all: [{ perk: "darkPatronage" }, { task: "Intimidation", level: 25 }] }, effect: "-15% expenses" },
  { id: "soulFurnace", name: "Soul Furnace", cost: 40, req: { all: [{ perk: "wickedBargain" }, { task: "Evil control", level: 50 }] }, effect: "+60% Evil gain" },
  { id: "deathDefiance", name: "Death Defiance", cost: 75, req: { all: [{ perk: "soulFurnace" }, { task: "Immortality", level: 60 }] }, effect: "+30 years lifespan" },
  { id: "demonicAutomation", name: "Demonic Automation", cost: 100, req: { all: [{ perk: "deathDefiance" }, { task: "Merchant", level: 100 }] }, effect: "+50% XP while automation is enabled" },
  { id: "realityBreak", name: "Reality Break", cost: 150, req: { all: [{ perk: "darkPatronage" }, { task: "Dark influence", level: 20 }] }, effect: "Open multiverse" },
];

export const allJobs = Object.values(jobCategories).flat();
export const allSkills = Object.values(skillCategories).flat();
